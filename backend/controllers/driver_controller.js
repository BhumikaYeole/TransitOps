import DriverService from "../services/driver_service.js";

export const createDriver = async (req, res, next) => {
  try {
    const record = await DriverService.createDriver(req.body);
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
    const result = await DriverService.getDrivers(req.query);
    res.status(200).json({
      success: true,
      message: "Driver records retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getDriverById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await DriverService.getDriverById(id);
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
    const updatedRecord = await DriverService.updateDriver(id, req.body);
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
    await DriverService.deleteDriver(id);
    res.status(200).json({
      success: true,
      message: "Driver record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
