import Driver from "../models/drivers.js";

class DriverService {
  /**
   * Create a new Driver record
   * @param {Object} data - Driver details
   * @returns {Promise<Object>} The created driver record
   */
  async createDriver(data) {
    const { licenseNumber } = data;

    // 1. Prevent duplicate license numbers
    const existingDriver = await Driver.findOne({ licenseNumber });
    if (existingDriver) {
      const error = new Error("Driver with this license number already exists");
      error.statusCode = 409;
      throw error;
    }

    // 2. Create and save Driver record
    const driver = new Driver(data);
    const savedDriver = await driver.save();
    return savedDriver;
  }

  /**
   * Retrieve list of drivers with pagination and filters
   * @param {Object} query - Query parameters (status, licenseCategory, page, limit)
   * @returns {Promise<Object>} Paginated driver list
   */
  async getDrivers(query) {
    const { status, licenseCategory, page = 1, limit = 10 } = query;
    const filter = {};

    if (status) {
      filter.status = status.toUpperCase();
    }
    if (licenseCategory) {
      filter.licenseCategory = licenseCategory;
    }

    const skipIndex = (page - 1) * limit;

    const [drivers, totalCount] = await Promise.all([
      Driver.find(filter)
        .populate("user")
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(skipIndex),
      Driver.countDocuments(filter),
    ]);

    return {
      drivers,
      pagination: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: Number(page),
        limit: Number(limit),
      },
    };
  }

  /**
   * Get single driver by ID
   * @param {string} id - Driver ID
   * @returns {Promise<Object>} The driver record
   */
  async getDriverById(id) {
    const driver = await Driver.findById(id).populate("user");
    if (!driver) {
      const error = new Error("Driver not found");
      error.statusCode = 404;
      throw error;
    }
    return driver;
  }

  /**
   * Update a Driver record
   * @param {string} id - Driver ID
   * @param {Object} updateData - Update fields
   * @returns {Promise<Object>} The updated driver record
   */
  async updateDriver(id, updateData) {
    const driver = await Driver.findById(id);
    if (!driver) {
      const error = new Error("Driver not found");
      error.statusCode = 404;
      throw error;
    }

    // 1. Prevent duplicate license numbers if updated
    if (updateData.licenseNumber && updateData.licenseNumber !== driver.licenseNumber) {
      const existingDriver = await Driver.findOne({ licenseNumber: updateData.licenseNumber });
      if (existingDriver) {
        const error = new Error("Driver with this license number already exists");
        error.statusCode = 409;
        throw error;
      }
    }

    // 2. Update allowed fields
    const fieldsToUpdate = [
      "user",
      "licenseNumber",
      "licenseCategory",
      "licenseExpiry",
      "contactNumber",
      "safetyScore",
      "status",
    ];

    fieldsToUpdate.forEach((field) => {
      if (updateData[field] !== undefined) {
        driver[field] = updateData[field];
      }
    });

    const updatedDriver = await driver.save();
    return updatedDriver;
  }

  /**
   * Delete a driver record
   * @param {string} id - Driver ID
   * @returns {Promise<Object>} The deleted driver document
   */
  async deleteDriver(id) {
    const driver = await Driver.findByIdAndDelete(id);
    if (!driver) {
      const error = new Error("Driver not found");
      error.statusCode = 404;
      throw error;
    }
    return driver;
  }
}

export default new DriverService();
