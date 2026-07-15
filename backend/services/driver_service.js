import Driver from "../models/drivers.js";

const normalizeDriverPayload = (data = {}) => {
  const payload = { ...data };

  if (payload.status) {
    payload.status = payload.status.toUpperCase();
  }

  return payload;
};

export const createDriverService = async (data) => {
  const payload = normalizeDriverPayload(data);
  const { user, licenseNumber } = payload;

  if (user) {
    const existingDriver = await Driver.findOne({ user });
    if (existingDriver) {
      const error = new Error("Driver profile already exists for this user");
      error.statusCode = 409;
      throw error;
    }
  }

  if (licenseNumber) {
    const existingDriver = await Driver.findOne({ licenseNumber });
    if (existingDriver) {
      const error = new Error("Driver with this license number already exists");
      error.statusCode = 409;
      throw error;
    }
  }

  const driver = new Driver(payload);
  return await driver.save();
};

export const getDriversService = async (query) => {
  const { status, licenseCategory, page = 1, limit = 10 } = query;

  const filter = {};

  if (status) {
    filter.status = status.toUpperCase();
  }

  if (licenseCategory) {
    filter.licenseCategory = licenseCategory;
  }

  const skip = (page - 1) * limit;

  const [drivers, totalCount] = await Promise.all([
    Driver.find(filter)
      .populate("user")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),

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
};

export const getDriverProfileService = async (userId) => {
  const driver = await Driver.findOne({ user: userId }).populate("user");

  if (!driver) {
    const error = new Error("Driver profile not found");
    error.statusCode = 404;
    throw error;
  }

  return driver;
};

export const createDriverProfileService = async (userId, data) => {
  const payload = normalizeDriverPayload({ ...data, user: userId });

  const existingDriver = await Driver.findOne({ user: userId });

  if (existingDriver) {
    Object.assign(existingDriver, payload);
    return await existingDriver.save();
  }

  if (payload.licenseNumber) {
    const existingByLicense = await Driver.findOne({
      licenseNumber: payload.licenseNumber,
    });

    if (existingByLicense) {
      const error = new Error("Driver with this license number already exists");
      error.statusCode = 409;
      throw error;
    }
  }

  const driver = new Driver(payload);
  return await driver.save();
};

export const updateDriverProfileService = async (userId, updateData) => {
  const driver = await Driver.findOne({ user: userId });

  if (!driver) {
    const error = new Error("Driver profile not found");
    error.statusCode = 404;
    throw error;
  }

  if (
    updateData.licenseNumber &&
    updateData.licenseNumber !== driver.licenseNumber
  ) {
    const existingDriver = await Driver.findOne({
      licenseNumber: updateData.licenseNumber,
    });

    if (existingDriver && existingDriver._id.toString() !== driver._id.toString()) {
      const error = new Error("Driver with this license number already exists");
      error.statusCode = 409;
      throw error;
    }
  }

  Object.assign(driver, normalizeDriverPayload(updateData));
  driver.user = userId;

  return await driver.save();
};

export const getDriverByIdService = async (id) => {
  const driver = await Driver.findById(id).populate("user");

  if (!driver) {
    const error = new Error("Driver not found");
    error.statusCode = 404;
    throw error;
  }

  return driver;
};

export const updateDriverService = async (id, updateData) => {
  const driver = await Driver.findById(id);

  if (!driver) {
    const error = new Error("Driver not found");
    error.statusCode = 404;
    throw error;
  }

  if (
    updateData.licenseNumber &&
    updateData.licenseNumber !== driver.licenseNumber
  ) {
    const existingDriver = await Driver.findOne({
      licenseNumber: updateData.licenseNumber,
    });

    if (existingDriver) {
      const error = new Error("Driver with this license number already exists");
      error.statusCode = 409;
      throw error;
    }
  }

  if (updateData.user !== undefined) {
    driver.user = updateData.user;
  }

  if (updateData.licenseNumber !== undefined) {
    driver.licenseNumber = updateData.licenseNumber;
  }

  if (updateData.licenseCategory !== undefined) {
    driver.licenseCategory = updateData.licenseCategory;
  }

  if (updateData.licenseExpiry !== undefined) {
    driver.licenseExpiry = updateData.licenseExpiry;
  }

  if (updateData.contactNumber !== undefined) {
    driver.contactNumber = updateData.contactNumber;
  }

  if (updateData.safetyScore !== undefined) {
    driver.safetyScore = updateData.safetyScore;
  }

  if (updateData.status !== undefined) {
    driver.status = updateData.status;
  }

  return await driver.save();
};

export const deleteDriverService = async (id) => {
  const driver = await Driver.findByIdAndDelete(id);

  if (!driver) {
    const error = new Error("Driver not found");
    error.statusCode = 404;
    throw error;
  }

  return driver;
};