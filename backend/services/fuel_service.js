import mongoose from "mongoose";
import FuelLog from "../models/fuellogs.js";
import Vehicle from "../models/vehicles.js";

export const createFuelLogService = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      vehicle: vehicleId,
      liters,
      cost,
      date,
      odometer,
      fuelStation,
      remarks,
    } = data;

    if (liters <= 0) {
      const error = new Error("Fuel quantity must be greater than zero");
      error.statusCode = 400;
      throw error;
    }

    if (cost <= 0) {
      const error = new Error("Cost must be positive");
      error.statusCode = 400;
      throw error;
    }

    const vehicle = await Vehicle.findById(vehicleId).session(session);

    if (!vehicle) {
      const error = new Error("Vehicle not found");
      error.statusCode = 404;
      throw error;
    }

    if (odometer < vehicle.odometer) {
      const error = new Error(
        `Odometer reading (${odometer}) cannot be less than vehicle's current odometer (${vehicle.odometer})`
      );
      error.statusCode = 400;
      throw error;
    }

    if (odometer > vehicle.odometer) {
      vehicle.odometer = odometer;
      await vehicle.save({ session });
    }

    const fuelLog = new FuelLog({
      vehicle: vehicleId,
      liters,
      cost,
      date: date || new Date(),
      odometer,
      fuelStation,
      remarks,
    });

    const savedFuelLog = await fuelLog.save({ session });

    await session.commitTransaction();

    return savedFuelLog;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getFuelLogsService = async (query) => {
  const { vehicle, page = 1, limit = 10 } = query;

  const filter = {};

  if (vehicle) {
    filter.vehicle = vehicle;
  }

  const skipIndex = (page - 1) * limit;

  const [logs, totalCount] = await Promise.all([
    FuelLog.find(filter)
      .populate("vehicle")
      .sort({ date: -1 })
      .limit(Number(limit))
      .skip(skipIndex),

    FuelLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: {
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Number(page),
      limit: Number(limit),
    },
  };
};

export const getFuelLogByIdService = async (id) => {
  const log = await FuelLog.findById(id).populate("vehicle");

  if (!log) {
    const error = new Error("Fuel log not found");
    error.statusCode = 404;
    throw error;
  }

  return log;
};

export const updateFuelLogService = async (id, updateData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const fuelLog = await FuelLog.findById(id).session(session);

    if (!fuelLog) {
      const error = new Error("Fuel log not found");
      error.statusCode = 404;
      throw error;
    }

    const vehicleId = updateData.vehicle || fuelLog.vehicle;

    const vehicle = await Vehicle.findById(vehicleId).session(session);

    if (!vehicle) {
      const error = new Error("Vehicle not found");
      error.statusCode = 404;
      throw error;
    }

    const targetLiters =
      updateData.liters !== undefined
        ? updateData.liters
        : fuelLog.liters;

    const targetCost =
      updateData.cost !== undefined
        ? updateData.cost
        : fuelLog.cost;

    const targetOdometer =
      updateData.odometer !== undefined
        ? updateData.odometer
        : fuelLog.odometer;

    if (targetLiters <= 0) {
      const error = new Error("Fuel quantity must be greater than zero");
      error.statusCode = 400;
      throw error;
    }

    if (targetCost <= 0) {
      const error = new Error("Cost must be positive");
      error.statusCode = 400;
      throw error;
    }

    if (
      targetOdometer < vehicle.odometer &&
      targetOdometer !== fuelLog.odometer
    ) {
      const error = new Error(
        `Odometer reading (${targetOdometer}) cannot be less than vehicle's current odometer (${vehicle.odometer})`
      );
      error.statusCode = 400;
      throw error;
    }

    if (targetOdometer > vehicle.odometer) {
      vehicle.odometer = targetOdometer;
      await vehicle.save({ session });
    }

    const fields = [
      "vehicle",
      "liters",
      "cost",
      "date",
      "odometer",
      "fuelStation",
      "remarks",
    ];

    fields.forEach((field) => {
      if (updateData[field] !== undefined) {
        fuelLog[field] = updateData[field];
      }
    });

    const updatedFuelLog = await fuelLog.save({ session });

    await session.commitTransaction();

    return updatedFuelLog;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const deleteFuelLogService = async (id) => {
  const log = await FuelLog.findByIdAndDelete(id);

  if (!log) {
    const error = new Error("Fuel log not found");
    error.statusCode = 404;
    throw error;
  }

  return log;
};