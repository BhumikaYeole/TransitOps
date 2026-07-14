import mongoose from "mongoose";
import Maintenance from "../models/maintenance.js";
import Vehicle from "../models/vehicles.js";

const updateVehicleStatus = async (
  vehicle,
  oldStatus,
  newStatus,
  session
) => {
  if (oldStatus === newStatus) return;

  if (newStatus === "IN PROGRESS") {
    if (vehicle.status === "ON_TRIP") {
      const error = new Error(
        "Cannot place vehicle in shop while it is on a trip"
      );
      error.statusCode = 400;
      throw error;
    }

    vehicle.status = "IN_SHOP";
    await vehicle.save({ session });
  }

  if (newStatus === "COMPLETED") {
    if (vehicle.status !== "RETIRED") {
      vehicle.status = "AVAILABLE";
      await vehicle.save({ session });
    }
  }

  if (oldStatus === "IN PROGRESS" && newStatus === "PENDING") {
    if (vehicle.status === "IN_SHOP") {
      vehicle.status = "AVAILABLE";
      await vehicle.save({ session });
    }
  }
};

export const createMaintenanceService = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      vehicle: vehicleId,
      title,
      description,
      cost,
      status = "PENDING",
      openedDate,
    } = data;

    const vehicle = await Vehicle.findById(vehicleId).session(session);

    if (!vehicle) {
      const error = new Error("Vehicle not found");
      error.statusCode = 404;
      throw error;
    }

    if (status === "IN PROGRESS") {
      await updateVehicleStatus(vehicle, "PENDING", status, session);
    }

    const maintenance = await Maintenance.create(
      [
        {
          vehicle: vehicleId,
          title,
          description,
          cost,
          status,
          openedDate,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return maintenance[0];
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const updateMaintenanceService = async (id, data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const maintenance = await Maintenance.findById(id).session(session);

    if (!maintenance) {
      const error = new Error("Maintenance record not found");
      error.statusCode = 404;
      throw error;
    }

    if (maintenance.status === "COMPLETED") {
      const error = new Error(
        "Cannot update a completed maintenance record"
      );
      error.statusCode = 400;
      throw error;
    }

    const vehicle = await Vehicle.findById(
      data.vehicle || maintenance.vehicle
    ).session(session);

    if (!vehicle) {
      const error = new Error("Vehicle not found");
      error.statusCode = 404;
      throw error;
    }

    const newStatus = data.status || maintenance.status;

    await updateVehicleStatus(
      vehicle,
      maintenance.status,
      newStatus,
      session
    );

    if (data.vehicle !== undefined) maintenance.vehicle = data.vehicle;
    if (data.title !== undefined) maintenance.title = data.title;
    if (data.description !== undefined)
      maintenance.description = data.description;
    if (data.cost !== undefined) maintenance.cost = data.cost;
    if (data.status !== undefined) maintenance.status = data.status;
    if (data.openedDate !== undefined)
      maintenance.openedDate = data.openedDate;

    if (newStatus === "COMPLETED") {
      maintenance.closedDate = new Date();
    }

    await maintenance.save({ session });

    await session.commitTransaction();

    return maintenance;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const getMaintenanceRecordsService = async (query) => {
  const { status, vehicle, page = 1, limit = 10 } = query;

  const filter = {};

  if (status) filter.status = status;
  if (vehicle) filter.vehicle = vehicle;

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Maintenance.find(filter)
      .populate("vehicle")
      .sort({ openedDate: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Maintenance.countDocuments(filter),
  ]);

  return {
    records,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      limit: Number(limit),
    },
  };
};

export const getMaintenanceByIdService = async (id) => {
  const record = await Maintenance.findById(id).populate("vehicle");

  if (!record) {
    const error = new Error("Maintenance record not found");
    error.statusCode = 404;
    throw error;
  }

  return record;
};

export const deleteMaintenanceService = async (id) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const record = await Maintenance.findById(id).session(session);

    if (!record) {
      const error = new Error("Maintenance record not found");
      error.statusCode = 404;
      throw error;
    }

    if (record.status === "IN PROGRESS") {
      const vehicle = await Vehicle.findById(record.vehicle).session(session);

      if (vehicle && vehicle.status === "IN_SHOP") {
        vehicle.status = "AVAILABLE";
        await vehicle.save({ session });
      }
    }

    await Maintenance.findByIdAndDelete(id).session(session);

    await session.commitTransaction();

    return record;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};