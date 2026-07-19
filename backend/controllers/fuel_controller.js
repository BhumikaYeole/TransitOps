import {
  createFuelLogService,
  getFuelLogsService,
  getFuelLogByIdService,
  updateFuelLogService,
  deleteFuelLogService,
} from "../services/fuel_service.js";

export const createFuelLog = async (req, res, next) => {
  try {
    const record = await createFuelLogService(req.body);

    res.status(201).json({
      success: true,
      message: "Fuel log created successfully",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

export const getFuelLogs = async (req, res, next) => {
  try {
    const result = await getFuelLogsService(req.query);

    res.status(200).json({
      success: true,
      message: "Fuel logs retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getFuelLogById = async (req, res, next) => {
  try {
    const record = await getFuelLogByIdService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Fuel log retrieved successfully",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFuelLog = async (req, res, next) => {
  try {
    const updatedRecord = await updateFuelLogService(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Fuel log updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFuelLog = async (req, res, next) => {
  try {
    await deleteFuelLogService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Fuel log deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};