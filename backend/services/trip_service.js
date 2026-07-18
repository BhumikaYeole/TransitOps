import mongoose from "mongoose";
import Trip from "../models/trips.js";
import Vehicle from "../models/vehicles.js";
import Driver from "../models/drivers.js";

const validateTrip = async (
  vehicleId,
  driverId,
  cargoWeight,
  session
) => {
  const vehicle = await Vehicle.findById(vehicleId).session(session);

  if (!vehicle) {
    const error = new Error("Vehicle not found");
    error.statusCode = 404;
    throw error;
  }

  const driver = await Driver.findById(driverId).session(session);

  if (!driver) {
    const error = new Error("Driver not found");
    error.statusCode = 404;
    throw error;
  }

  if (cargoWeight > vehicle.maxLoadCapacity) {
    const error = new Error(
      `Cargo weight (${cargoWeight}) exceeds vehicle capacity (${vehicle.maxLoadCapacity})`
    );
    error.statusCode = 400;
    throw error;
  }

  if (new Date(driver.licenseExpiry) <= new Date()) {
    const error = new Error("Driver license is expired");
    error.statusCode = 400;
    throw error;
  }

  return { vehicle, driver };
};

export const createTripService = async (tripData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      source,
      destination,
      vehicle: vehicleId,
      driver: driverId,
      cargoWeight,
      plannedDistance,
      revenue,
      status = "DRAFT",
    } = tripData;

    const { vehicle, driver } = await validateTrip(
      vehicleId,
      driverId,
      cargoWeight,
      session
    );

    if (status === "DISPATCHED") {
      if (vehicle.status !== "AVAILABLE") {
        const error = new Error(
          `Vehicle is not available (Current status: ${vehicle.status})`
        );
        error.statusCode = 400;
        throw error;
      }

      if (driver.status !== "AVAILABLE") {
        const error = new Error(
          `Driver is not available (Current status: ${driver.status})`
        );
        error.statusCode = 400;
        throw error;
      }

      vehicle.status = "ON_TRIP";
      driver.status = "ON_TRIP";

      await vehicle.save({ session });
      await driver.save({ session });
    }

    const trip = new Trip({
      source,
      destination,
      vehicle: vehicleId,
      driver: driver,
      cargoWeight,
      plannedDistance,
      revenue,
      status,
    });

    const savedTrip = await trip.save({ session });

    await session.commitTransaction();

    return savedTrip;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const updateTripService = async (tripId, updateData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const trip = await Trip.findById(tripId).session(session);

    if (!trip) {
      const error = new Error("Trip not found");
      error.statusCode = 404;
      throw error;
    }

    if (["COMPLETED", "CANCELLED"].includes(trip.status)) {
      const error = new Error(
        `Cannot update a trip that is already ${trip.status}`
      );
      error.statusCode = 400;
      throw error;
    }

    const originalStatus = trip.status;
    const targetStatus = updateData.status || originalStatus;

    const vehicleId = updateData.vehicle || trip.vehicle;
    const driverId = updateData.driver || trip.driver;
    const cargoWeight =
      updateData.cargoWeight ?? trip.cargoWeight;

    const { vehicle, driver } = await validateTrip(
      vehicleId,
      driverId,
      cargoWeight,
      session
    );

    if (targetStatus === "DISPATCHED") {
      const isNewDispatch = originalStatus !== "DISPATCHED";
      const vehicleChanged =
        trip.vehicle.toString() !== vehicleId.toString();
      const driverChanged =
        trip.driver.toString() !== driverId.toString();

      if (vehicleChanged && originalStatus === "DISPATCHED") {
        const oldVehicle = await Vehicle.findById(
          trip.vehicle
        ).session(session);

        if (oldVehicle) {
          oldVehicle.status = "AVAILABLE";
          await oldVehicle.save({ session });
        }
      }

      if (driverChanged && originalStatus === "DISPATCHED") {
        const oldDriver = await Driver.findById(
          trip.driver
        ).session(session);

        if (oldDriver) {
          oldDriver.status = "AVAILABLE";
          await oldDriver.save({ session });
        }
      }

      if (isNewDispatch || vehicleChanged) {
        if (vehicle.status !== "AVAILABLE") {
          const error = new Error(
            `Vehicle is not available (Current status: ${vehicle.status})`
          );
          error.statusCode = 400;
          throw error;
        }

        vehicle.status = "ON_TRIP";
        await vehicle.save({ session });
      }

      if (isNewDispatch || driverChanged) {
        if (driver.status !== "AVAILABLE") {
          const error = new Error(
            `Driver is not available (Current status: ${driver.status})`
          );
          error.statusCode = 400;
          throw error;
        }

        driver.status = "ON_TRIP";
        await driver.save({ session });
      }
    } else if (targetStatus === "COMPLETED") {
      if (originalStatus !== "DISPATCHED") {
        const error = new Error(
          "Only DISPATCHED trips can be completed"
        );
        error.statusCode = 400;
        throw error;
      }

      const actualDistance =
        updateData.actualDistance ?? trip.actualDistance;

      const fuelConsumed =
        updateData.fuelConsumed ?? trip.fuelConsumed;

      if (actualDistance == null) {
        const error = new Error(
          "Actual distance is required to complete a trip"
        );
        error.statusCode = 400;
        throw error;
      }

      vehicle.status = "AVAILABLE";
      driver.status = "AVAILABLE";

      await vehicle.save({ session });
      await driver.save({ session });

      trip.actualDistance = actualDistance;
      trip.fuelConsumed = fuelConsumed;
    } else if (
      targetStatus === "CANCELLED" &&
      originalStatus === "DISPATCHED"
    ) {
      vehicle.status = "AVAILABLE";
      driver.status = "AVAILABLE";

      await vehicle.save({ session });
      await driver.save({ session });
    }

    [
      "source",
      "destination",
      "vehicle",
      "driver",
      "cargoWeight",
      "plannedDistance",
      "revenue",
      "notes",
    ].forEach((field) => {
      if (updateData[field] !== undefined) {
        trip[field] = updateData[field];
      }
    });

    trip.status = targetStatus;

    const updatedTrip = await trip.save({ session });

    await session.commitTransaction();

    return updatedTrip;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const dispatchTripService = async (tripId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const trip = await Trip.findById(tripId).session(session);

    if (!trip) {
      const error = new Error("Trip not found");
      error.statusCode = 404;
      throw error;
    }

    if (trip.status !== "DRAFT") {
      const error = new Error(
        `Only DRAFT trips can be dispatched (Current status: ${trip.status})`
      );
      error.statusCode = 400;
      throw error;
    }

    const { vehicle, driver } = await validateTrip(
      trip.vehicle,
      trip.driver,
      trip.cargoWeight,
      session
    );

    if (vehicle.status !== "AVAILABLE") {
      const error = new Error(
        `Vehicle is not available (Current status: ${vehicle.status})`
      );
      error.statusCode = 400;
      throw error;
    }

    if (driver.status !== "AVAILABLE") {
      const error = new Error(
        `Driver is not available (Current status: ${driver.status})`
      );
      error.statusCode = 400;
      throw error;
    }

    vehicle.status = "ON_TRIP";
    driver.status = "ON_TRIP";

    await vehicle.save({ session });
    await driver.save({ session });

    trip.status = "DISPATCHED";

    const updatedTrip = await trip.save({ session });

    await session.commitTransaction();

    return updatedTrip;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const completeTripService = async (
  tripId,
  actualDistance,
  fuelConsumed
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const trip = await Trip.findById(tripId).session(session);

    if (!trip) {
      const error = new Error("Trip not found");
      error.statusCode = 404;
      throw error;
    }

    if (trip.status !== "DISPATCHED") {
      const error = new Error(
        `Only DISPATCHED trips can be completed (Current status: ${trip.status})`
      );
      error.statusCode = 400;
      throw error;
    }

    if (
      actualDistance === undefined ||
      actualDistance === null ||
      actualDistance < 0
    ) {
      const error = new Error(
        "Valid actual distance is required to complete a trip"
      );
      error.statusCode = 400;
      throw error;
    }

    const vehicle = await Vehicle.findById(trip.vehicle).session(session);
    const driver = await Driver.findById(trip.driver).session(session);

    if (vehicle) {
      if (vehicle.status !== "RETIRED") {
        vehicle.status = "AVAILABLE";
      }

      await vehicle.save({ session });
    }

    if (driver) {
      driver.status = "AVAILABLE";
      await driver.save({ session });
    }

    trip.actualDistance = actualDistance;
    trip.fuelConsumed = fuelConsumed || 0;
    trip.status = "COMPLETED";

    const updatedTrip = await trip.save({ session });

    await session.commitTransaction();

    return updatedTrip;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const cancelTripService = async (tripId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const trip = await Trip.findById(tripId).session(session);

    if (!trip) {
      const error = new Error("Trip not found");
      error.statusCode = 404;
      throw error;
    }

    if (["COMPLETED", "CANCELLED"].includes(trip.status)) {
      const error = new Error(
        `Cannot cancel a trip that is already ${trip.status}`
      );
      error.statusCode = 400;
      throw error;
    }

    const vehicle = await Vehicle.findById(trip.vehicle).session(session);
    const driver = await Driver.findById(trip.driver).session(session);

    if (trip.status === "DISPATCHED") {
      if (vehicle && vehicle.status !== "RETIRED") {
        vehicle.status = "AVAILABLE";
        await vehicle.save({ session });
      }

      if (driver) {
        driver.status = "AVAILABLE";
        await driver.save({ session });
      }
    }

    trip.status = "CANCELLED";

    const updatedTrip = await trip.save({ session });

    await session.commitTransaction();

    return updatedTrip;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const getTripsService = async (query) => {
  const {
    status,
    vehicle,
    driver,
    page = 1,
    limit = 10,
  } = query;

  const filter = {};

  if (status) filter.status = status;
  if (vehicle) filter.vehicle = vehicle;
  if (driver) filter.driver = driver;

  const skip = (page - 1) * limit;

  const [trips, totalCount] = await Promise.all([
    Trip.find(filter)
      .populate("vehicle")
      .populate({
        path: "driver",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),

    Trip.countDocuments(filter),
  ]);

  return {
    trips,
    pagination: {
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Number(page),
      limit: Number(limit),
    },
  };
};

export const getTripByIdService = async (tripId) => {
  const trip = await Trip.findById(tripId)
    .populate("vehicle")
    .populate({
      path: "driver",
      populate: {
        path: "user",
        select: "name email",
      },
    });

  if (!trip) {
    const error = new Error("Trip not found");
    error.statusCode = 404;
    throw error;
  }

  return trip;
};

export const deleteTripService = async (tripId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const trip = await Trip.findById(tripId).session(session);

    if (!trip) {
      const error = new Error("Trip not found");
      error.statusCode = 404;
      throw error;
    }

    if (trip.status === "DISPATCHED") {
      const vehicle = await Vehicle.findById(trip.vehicle).session(session);

      if (vehicle) {
        vehicle.status = "AVAILABLE";
        await vehicle.save({ session });
      }

      const driver = await Driver.findById(trip.driver).session(session);

      if (driver) {
        driver.status = "AVAILABLE";
        await driver.save({ session });
      }
    }

    const deletedTrip = await Trip.findByIdAndDelete(tripId).session(session);

    await session.commitTransaction();

    return deletedTrip;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};