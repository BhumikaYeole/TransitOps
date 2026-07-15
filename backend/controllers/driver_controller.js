import {
  createDriverService,
  updateDriverService,
  getDriversService,
  getDriverByIdService,
  deleteDriverService,
  getDriverProfileService,
  createDriverProfileService,
  updateDriverProfileService,
} from "../services/driver_service.js";

export const createDriver = async (req, res, next) => {
  try {
    const record = await createDriverService(req.body);
    res.status(201).json({
      success: true,
      message: "Driver record created successfully",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

export const getDrivers = async (req, res, next) => {
  try {
    const result = await getDriversService(req.query);
    res.status(200).json({
      success: true,
      message: "Driver records retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getDriverProfile = async (req, res, next) => {
  try {
    const record = await getDriverProfileService(req.user._id);
    res.status(200).json({
      success: true,
      message: "Driver profile retrieved successfully",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

export const createDriverProfile = async (req, res, next) => {
  try {
    const record = await createDriverProfileService(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: "Driver profile created successfully",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDriverProfile = async (req, res, next) => {
  try {
    const updatedRecord = await updateDriverProfileService(req.user._id, req.body);
    res.status(200).json({
      success: true,
      message: "Driver profile updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const getDriverById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await getDriverByIdService(id);
    res.status(200).json({
      success: true,
      message: "Driver record retrieved successfully",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedRecord = await updateDriverService(id, req.body);
    res.status(200).json({
      success: true,
      message: "Driver record updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteDriverService(id);
    res.status(200).json({
      success: true,
      message: "Driver record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
