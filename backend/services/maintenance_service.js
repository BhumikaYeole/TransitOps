import mongoose from "mongoose";
import Maintenance from "../models/maintenance.js";
import Vehicle from "../models/vehicles.js";

class MaintenanceService {
  /**
   * Create a new Maintenance record (runs inside a transaction)
   * @param {Object} data - Maintenance details
   * @returns {Promise<Object>} The created maintenance record
   */
  async createMaintenance(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        vehicle: vehicleId,
        maintenanceType,
        description,
        scheduledDate,
        cost,
        status = "PENDING",
        notes,
      } = data;

      // 1. Fetch the Vehicle
      const vehicle = await Vehicle.findById(vehicleId).session(session);
      if (!vehicle) {
        const error = new Error("Vehicle not found");
        error.statusCode = 404;
        throw error;
      }

      // 2. Business Rule: Creating an active maintenance changes vehicle status to "IN_SHOP"
      if (status === "IN_PROGRESS") {
        if (vehicle.status === "ON_TRIP") {
          const error = new Error("Cannot place vehicle in shop while it is on a trip");
          error.statusCode = 400;
          throw error;
        }
        vehicle.status = "IN_SHOP";
        await vehicle.save({ session });
      }

      // 3. Create Maintenance record
      const maintenance = new Maintenance({
        vehicle: vehicleId,
        maintenanceType,
        description,
        scheduledDate,
        cost,
        status,
        notes,
      });

      const savedMaintenance = await maintenance.save({ session });

      await session.commitTransaction();
      return savedMaintenance;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Update / Transition a Maintenance record (runs inside a transaction)
   * @param {string} id - Maintenance ID
   * @param {Object} updateData - Update payload
   * @returns {Promise<Object>} The updated maintenance record
   */
  async updateMaintenance(id, updateData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const maintenance = await Maintenance.findById(id).session(session);
      if (!maintenance) {
        const error = new Error("Maintenance record not found");
        error.statusCode = 404;
        throw error;
      }

      // Prevent modifications if already completed
      if (maintenance.status === "COMPLETED") {
        const error = new Error("Cannot update a completed maintenance record");
        error.statusCode = 400;
        throw error;
      }

      const originalStatus = maintenance.status;
      const targetStatus = updateData.status || originalStatus;

      const vehicleId = updateData.vehicle || maintenance.vehicle;
      const vehicle = await Vehicle.findById(vehicleId).session(session);
      if (!vehicle) {
        const error = new Error("Vehicle not found");
        error.statusCode = 404;
        throw error;
      }

      // Handle status changes for vehicle status updates
      if (targetStatus === "IN_PROGRESS" && originalStatus !== "IN_PROGRESS") {
        // Vehicle goes to "IN_SHOP"
        if (vehicle.status === "ON_TRIP") {
          const error = new Error("Cannot place vehicle in shop while it is on a trip");
          error.statusCode = 400;
          throw error;
        }
        vehicle.status = "IN_SHOP";
        await vehicle.save({ session });
      } else if (targetStatus === "COMPLETED" && originalStatus !== "COMPLETED") {
        // Restores vehicle to "AVAILABLE" unless it is RETIRED
        if (vehicle.status !== "RETIRED") {
          vehicle.status = "AVAILABLE";
          await vehicle.save({ session });
        }
        maintenance.completedDate = updateData.completedDate || new Date();
      } else if (targetStatus === "PENDING" && originalStatus === "IN_PROGRESS") {
        // Reverting back to PENDING from IN_PROGRESS restores vehicle to AVAILABLE
        if (vehicle.status === "IN_SHOP") {
          vehicle.status = "AVAILABLE";
          await vehicle.save({ session });
        }
      }

      // Update maintenance fields
      const fieldsToUpdate = [
        "vehicle",
        "maintenanceType",
        "description",
        "scheduledDate",
        "completedDate",
        "cost",
        "notes",
      ];

      fieldsToUpdate.forEach((field) => {
        if (updateData[field] !== undefined) {
          maintenance[field] = updateData[field];
        }
      });

      maintenance.status = targetStatus;
      const updatedMaintenance = await maintenance.save({ session });

      await session.commitTransaction();
      return updatedMaintenance;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Retrieve list of maintenance records with pagination and filter
   * @param {Object} query - Query parameters (status, vehicle, page, limit)
   * @returns {Promise<Object>} Paginated maintenance records
   */
  async getMaintenanceRecords(query) {
    const { status, vehicle, page = 1, limit = 10 } = query;
    const filter = {};

    if (status) filter.status = status;
    if (vehicle) filter.vehicle = vehicle;

    const skipIndex = (page - 1) * limit;

    const [records, totalCount] = await Promise.all([
      Maintenance.find(filter)
        .populate("vehicle")
        .sort({ scheduledDate: -1 })
        .limit(Number(limit))
        .skip(skipIndex),
      Maintenance.countDocuments(filter),
    ]);

    return {
      records,
      pagination: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: Number(page),
        limit: Number(limit),
      },
    };
  }

  /**
   * Get single maintenance record by ID
   * @param {string} id 
   * @returns {Promise<Object>} The maintenance record
   */
  async getMaintenanceById(id) {
    const record = await Maintenance.findById(id).populate("vehicle");
    if (!record) {
      const error = new Error("Maintenance record not found");
      error.statusCode = 404;
      throw error;
    }
    return record;
  }

  /**
   * Delete a maintenance record (runs inside a transaction)
   * @param {string} id 
   * @returns {Promise<Object>} The deleted maintenance record
   */
  async deleteMaintenance(id) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const record = await Maintenance.findById(id).session(session);
      if (!record) {
        const error = new Error("Maintenance record not found");
        error.statusCode = 404;
        throw error;
      }

      // If deleted while active (IN_PROGRESS), restore vehicle availability
      if (record.status === "IN_PROGRESS") {
        const vehicle = await Vehicle.findById(record.vehicle).session(session);
        if (vehicle && vehicle.status === "IN_SHOP") {
          vehicle.status = "AVAILABLE";
          await vehicle.save({ session });
        }
      }

      const deletedRecord = await Maintenance.findByIdAndDelete(id).session(session);

      await session.commitTransaction();
      return deletedRecord;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default new MaintenanceService();
