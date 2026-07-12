import mongoose from "mongoose";
import Trip from "../models/trips.js";
import Vehicle from "../models/vehicles.js";
import Driver from "../models/drivers.js";

class TripService {
  /**
   * Create a new Trip (runs inside a transaction)
   * @param {Object} tripData 
   * @returns {Promise<Object>} The created trip
   */
  async createTrip(tripData) {
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

      // 1. Fetch Vehicle and Driver within the transaction
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

      // 2. Business Rules Validation
      // Cargo Weight <= Vehicle maxLoadCapacity
      if (cargoWeight > vehicle.maxLoadCapacity) {
        const error = new Error(`Cargo weight (${cargoWeight}) exceeds vehicle capacity (${vehicle.maxLoadCapacity})`);
        error.statusCode = 400;
        throw error;
      }

      // License must not be expired
      const now = new Date();
      if (new Date(driver.licenseExpiry) <= now) {
        const error = new Error("Driver license is expired");
        error.statusCode = 400;
        throw error;
      }

      // If directly dispatching
      if (status === "DISPATCHED") {
        // Vehicle must be Available
        if (vehicle.status !== "AVAILABLE") {
          const error = new Error(`Vehicle is not available (Current status: ${vehicle.status})`);
          error.statusCode = 400;
          throw error;
        }

        // Driver must be Available
        if (driver.status !== "AVAILABLE") {
          const error = new Error(`Driver is not available (Current status: ${driver.status})`);
          error.statusCode = 400;
          throw error;
        }

        // Dispatch automatically updates Vehicle and Driver to 'ON_TRIP'
        vehicle.status = "ON_TRIP";
        driver.status = "ON_TRIP";

        await vehicle.save({ session });
        await driver.save({ session });
      }

      // 3. Create the Trip
      const newTrip = new Trip({
        source,
        destination,
        vehicle: vehicleId,
        driver: driverId,
        cargoWeight,
        plannedDistance,
        revenue,
        status,
      });

      const savedTrip = await newTrip.save({ session });

      await session.commitTransaction();
      return savedTrip;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Update or transition a Trip (runs inside a transaction)
   * @param {string} tripId 
   * @param {Object} updateData 
   * @returns {Promise<Object>} The updated trip
   */
  async updateTrip(tripId, updateData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const trip = await Trip.findById(tripId).session(session);
      if (!trip) {
        const error = new Error("Trip not found");
        error.statusCode = 404;
        throw error;
      }

      // Prevent modifications to completed or cancelled trips
      if (["COMPLETED", "CANCELLED"].includes(trip.status)) {
        const error = new Error(`Cannot update a trip that is already ${trip.status}`);
        error.statusCode = 400;
        throw error;
      }

      const targetStatus = updateData.status || trip.status;
      const originalStatus = trip.status;

      // Determine updated/original values for validations
      const targetVehicleId = updateData.vehicle || trip.vehicle;
      const targetDriverId = updateData.driver || trip.driver;
      const targetCargoWeight = updateData.cargoWeight !== undefined ? updateData.cargoWeight : trip.cargoWeight;

      // 1. Fetch Vehicle and Driver
      const vehicle = await Vehicle.findById(targetVehicleId).session(session);
      if (!vehicle) {
        const error = new Error("Vehicle not found");
        error.statusCode = 404;
        throw error;
      }

      const driver = await Driver.findById(targetDriverId).session(session);
      if (!driver) {
        const error = new Error("Driver not found");
        error.statusCode = 404;
        throw error;
      }

      // 2. Perform validations
      // Cargo Weight <= Vehicle Capacity
      if (targetCargoWeight > vehicle.maxLoadCapacity) {
        const error = new Error(`Cargo weight (${targetCargoWeight}) exceeds vehicle capacity (${vehicle.maxLoadCapacity})`);
        error.statusCode = 400;
        throw error;
      }

      // License validation
      const now = new Date();
      if (new Date(driver.licenseExpiry) <= now) {
        const error = new Error("Driver license is expired");
        error.statusCode = 400;
        throw error;
      }

      // 3. Status Transition Logic
      // Case A: Transitioning to DISPATCHED OR updating a DISPATCHED trip
      if (targetStatus === "DISPATCHED") {
        const isNewDispatch = originalStatus !== "DISPATCHED";
        const vehicleChanged = trip.vehicle.toString() !== targetVehicleId.toString();
        const driverChanged = trip.driver.toString() !== targetDriverId.toString();

        // Release old vehicle if changed
        if (vehicleChanged && originalStatus === "DISPATCHED") {
          const oldVehicle = await Vehicle.findById(trip.vehicle).session(session);
          if (oldVehicle) {
            oldVehicle.status = "AVAILABLE";
            await oldVehicle.save({ session });
          }
        }

        // Release old driver if changed
        if (driverChanged && originalStatus === "DISPATCHED") {
          const oldDriver = await Driver.findById(trip.driver).session(session);
          if (oldDriver) {
            oldDriver.status = "AVAILABLE";
            await oldDriver.save({ session });
          }
        }

        // Lock new vehicle (if it was newly assigned or if this is a new dispatch)
        if (isNewDispatch || vehicleChanged) {
          if (vehicle.status !== "AVAILABLE") {
            const error = new Error(`Vehicle is not available (Current status: ${vehicle.status})`);
            error.statusCode = 400;
            throw error;
          }
          vehicle.status = "ON_TRIP";
          await vehicle.save({ session });
        }

        // Lock new driver
        if (isNewDispatch || driverChanged) {
          if (driver.status !== "AVAILABLE") {
            const error = new Error(`Driver is not available (Current status: ${driver.status})`);
            error.statusCode = 400;
            throw error;
          }
          driver.status = "ON_TRIP";
          await driver.save({ session });
        }
      }

      // Case B: Transitioning to COMPLETED
      else if (targetStatus === "COMPLETED") {
        if (originalStatus !== "DISPATCHED") {
          const error = new Error("Only DISPATCHED trips can be completed");
          error.statusCode = 400;
          throw error;
        }

        const actualDistance = updateData.actualDistance !== undefined ? updateData.actualDistance : trip.actualDistance;
        const fuelConsumed = updateData.fuelConsumed !== undefined ? updateData.fuelConsumed : trip.fuelConsumed;

        if (actualDistance === undefined || actualDistance === null) {
          const error = new Error("Actual distance is required to complete a trip");
          error.statusCode = 400;
          throw error;
        }

        // Restore Vehicle and Driver
        vehicle.status = "AVAILABLE";
        driver.status = "AVAILABLE";
        await vehicle.save({ session });
        await driver.save({ session });

        trip.actualDistance = actualDistance;
        trip.fuelConsumed = fuelConsumed;
      }

      // Case C: Transitioning to CANCELLED
      else if (targetStatus === "CANCELLED") {
        // Only restore if the trip was active/DISPATCHED
        if (originalStatus === "DISPATCHED") {
          vehicle.status = "AVAILABLE";
          driver.status = "AVAILABLE";
          await vehicle.save({ session });
          await driver.save({ session });
        }
      }

      // 4. Save modifications
      const fieldsToUpdate = [
        "source",
        "destination",
        "vehicle",
        "driver",
        "cargoWeight",
        "plannedDistance",
        "revenue",
        "notes",
      ];

      fieldsToUpdate.forEach((field) => {
        if (updateData[field] !== undefined) {
          trip[field] = updateData[field];
        }
      });

      trip.status = targetStatus;
      const updatedTrip = await trip.save({ session });

      await session.commitTransaction();
      return updatedTrip;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Dispatch a trip (runs inside a transaction)
   * @param {string} tripId 
   * @returns {Promise<Object>} The dispatched trip
   */
  async dispatchTrip(tripId) {
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
        const error = new Error(`Only DRAFT trips can be dispatched (Current status: ${trip.status})`);
        error.statusCode = 400;
        throw error;
      }

      const vehicle = await Vehicle.findById(trip.vehicle).session(session);
      if (!vehicle) {
        const error = new Error("Vehicle not found");
        error.statusCode = 404;
        throw error;
      }

      const driver = await Driver.findById(trip.driver).session(session);
      if (!driver) {
        const error = new Error("Driver not found");
        error.statusCode = 404;
        throw error;
      }

      // Validations
      if (trip.cargoWeight > vehicle.maxLoadCapacity) {
        const error = new Error(`Cargo weight (${trip.cargoWeight}) exceeds vehicle capacity (${vehicle.maxLoadCapacity})`);
        error.statusCode = 400;
        throw error;
      }

      const now = new Date();
      if (new Date(driver.licenseExpiry) <= now) {
        const error = new Error("Driver license is expired");
        error.statusCode = 400;
        throw error;
      }

      if (vehicle.status !== "AVAILABLE") {
        const error = new Error(`Vehicle is not available (Current status: ${vehicle.status})`);
        error.statusCode = 400;
        throw error;
      }

      if (driver.status !== "AVAILABLE") {
        const error = new Error(`Driver is not available (Current status: ${driver.status})`);
        error.statusCode = 400;
        throw error;
      }

      // Update statuses
      vehicle.status = "ON_TRIP";
      driver.status = "ON_TRIP";
      await vehicle.save({ session });
      await driver.save({ session });

      trip.status = "DISPATCHED";
      const updatedTrip = await trip.save({ session });

      await session.commitTransaction();
      return updatedTrip;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Complete a trip (runs inside a transaction)
   * @param {string} tripId 
   * @param {number} actualDistance 
   * @param {number} fuelConsumed 
   * @returns {Promise<Object>} The completed trip
   */
  async completeTrip(tripId, actualDistance, fuelConsumed) {
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
        const error = new Error(`Only DISPATCHED trips can be completed (Current status: ${trip.status})`);
        error.statusCode = 400;
        throw error;
      }

      if (actualDistance === undefined || actualDistance === null || actualDistance < 0) {
        const error = new Error("Valid actual distance is required to complete a trip");
        error.statusCode = 400;
        throw error;
      }

      const vehicle = await Vehicle.findById(trip.vehicle).session(session);
      const driver = await Driver.findById(trip.driver).session(session);

      // Restore vehicle status unless it has been retired
      if (vehicle) {
        if (vehicle.status !== "RETIRED") {
          vehicle.status = "AVAILABLE";
        }
        await vehicle.save({ session });
      }

      // Restore driver status
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
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Cancel a trip (runs inside a transaction)
   * @param {string} tripId 
   * @returns {Promise<Object>} The cancelled trip
   */
  async cancelTrip(tripId) {
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
        const error = new Error(`Cannot cancel a trip that is already ${trip.status}`);
        error.statusCode = 400;
        throw error;
      }

      const vehicle = await Vehicle.findById(trip.vehicle).session(session);
      const driver = await Driver.findById(trip.driver).session(session);

      // Restore only if the trip was dispatched/active
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
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Retrieve all trips with pagination and filtering
   * @param {Object} query 
   * @returns {Promise<Object>} The paginated result
   */
  async getTrips(query) {
    const { status, vehicle, driver, page = 1, limit = 10 } = query;
    const filter = {};

    if (status) filter.status = status;
    if (vehicle) filter.vehicle = vehicle;
    if (driver) filter.driver = driver;

    const skipIndex = (page - 1) * limit;

    const [trips, totalCount] = await Promise.all([
      Trip.find(filter)
        .populate("vehicle")
        .populate("driver")
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(skipIndex),
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
  }

  /**
   * Get trip by ID
   * @param {string} tripId 
   * @returns {Promise<Object>} The trip document
   */
  async getTripById(tripId) {
    const trip = await Trip.findById(tripId).populate("vehicle").populate("driver");
    if (!trip) {
      const error = new Error("Trip not found");
      error.statusCode = 404;
      throw error;
    }
    return trip;
  }

  /**
   * Delete / Cancel a trip (runs inside a transaction)
   * @param {string} tripId 
   * @returns {Promise<Object>} The deleted trip document
   */
  async deleteTrip(tripId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const trip = await Trip.findById(tripId).session(session);
      if (!trip) {
        const error = new Error("Trip not found");
        error.statusCode = 404;
        throw error;
      }

      // If trip was Dispatched, restore Vehicle and Driver availability
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
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default new TripService();
