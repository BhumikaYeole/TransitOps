import FuelService from "../services/fuel_service.js";

export const createFuelLog = async (req, res, next) => {
  try {
    const record = await FuelService.createFuelLog(req.body);
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
    const result = await FuelService.getFuelLogs(req.query);
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
    const { id } = req.params;
    const record = await FuelService.getFuelLogById(id);
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
    const { id } = req.params;
    const updatedRecord = await FuelService.updateFuelLog(id, req.body);
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
    const { id } = req.params;
    await FuelService.deleteFuelLog(id);
    res.status(200).json({
      success: true,
      message: "Fuel log deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
