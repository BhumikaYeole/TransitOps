import mongoose from "mongoose";
import FuelLog from "../models/fuellogs.js";
import Vehicle from "../models/vehicles.js";

class FuelService {
  /**
   * Create a new fuel log (runs inside a database transaction)
   * @param {Object} data - Fuel log details
   * @returns {Promise<Object>} The created fuel log record
   */
  async createFuelLog(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { vehicle: vehicleId, liters, cost, date, odometer, fuelStation, remarks } = data;

      // 1. Validate Fuel quantity and cost
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

      // 2. Fetch the Vehicle
      const vehicle = await Vehicle.findById(vehicleId).session(session);
      if (!vehicle) {
        const error = new Error("Vehicle not found");
        error.statusCode = 404;
        throw error;
      }

      // 3. Business Rule: Odometer cannot decrease
      if (odometer < vehicle.odometer) {
        const error = new Error(
          `Odometer reading (${odometer}) cannot be less than vehicle's current odometer (${vehicle.odometer})`
        );
        error.statusCode = 400;
        throw error;
      }

      // 4. Update vehicle odometer if new reading is greater
      if (odometer > vehicle.odometer) {
        vehicle.odometer = odometer;
        await vehicle.save({ session });
      }

      // 5. Save the fuel log
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
  }

  /**
   * Retrieve list of fuel logs with pagination and filters
   * @param {Object} query - Query parameters (vehicle, page, limit)
   * @returns {Promise<Object>} Paginated fuel logs list
   */
  async getFuelLogs(query) {
    const { vehicle, page = 1, limit = 10 } = query;
    const filter = {};

    if (vehicle) filter.vehicle = vehicle;

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
  }

  /**
   * Get single fuel log by ID
   * @param {string} id 
   * @returns {Promise<Object>} The fuel log record
   */
  async getFuelLogById(id) {
    const log = await FuelLog.findById(id).populate("vehicle");
    if (!log) {
      const error = new Error("Fuel log not found");
      error.statusCode = 404;
      throw error;
    }
    return log;
  }

  /**
   * Update a fuel log (runs inside a database transaction)
   * @param {string} id - Fuel log ID
   * @param {Object} updateData - Update details
   * @returns {Promise<Object>} The updated fuel log record
   */
  async updateFuelLog(id, updateData) {
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

      // Check numeric inputs
      const targetLiters = updateData.liters !== undefined ? updateData.liters : fuelLog.liters;
      const targetCost = updateData.cost !== undefined ? updateData.cost : fuelLog.cost;
      const targetOdometer = updateData.odometer !== undefined ? updateData.odometer : fuelLog.odometer;

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

      // Business Rule: Odometer cannot decrease (against vehicle status)
      // Note: If updating the odometer on the same vehicle, we make sure it doesn't go below the vehicle's current odometer (excluding this fuel log's previous value)
      // However, to keep it simple and robust, it must not be less than the vehicle's current odometer unless it's a correction that still remains valid.
      if (targetOdometer < vehicle.odometer && targetOdometer !== fuelLog.odometer) {
        // If they try to set it below the vehicle's current odometer, reject
        const error = new Error(
          `Odometer reading (${targetOdometer}) cannot be less than vehicle's current odometer (${vehicle.odometer})`
        );
        error.statusCode = 400;
        throw error;
      }

      // If the new odometer reading is greater than vehicle's current odometer, update it
      if (targetOdometer > vehicle.odometer) {
        vehicle.odometer = targetOdometer;
        await vehicle.save({ session });
      }

      // Apply updates to fuel log
      const fieldsToUpdate = ["vehicle", "liters", "cost", "date", "odometer", "fuelStation", "remarks"];
      fieldsToUpdate.forEach((field) => {
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
  }

  /**
   * Delete a fuel log
   * @param {string} id 
   * @returns {Promise<Object>} The deleted fuel log document
   */
  async deleteFuelLog(id) {
    const log = await FuelLog.findByIdAndDelete(id);
    if (!log) {
      const error = new Error("Fuel log not found");
      error.statusCode = 404;
      throw error;
    }
    return log;
  }
}

export default new FuelService();
