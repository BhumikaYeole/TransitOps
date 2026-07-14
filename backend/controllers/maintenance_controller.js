import {createMaintenanceService, deleteMaintenanceService, updateMaintenanceService, getMaintenanceByIdService, getMaintenanceRecordsService} from "../services/maintenance_service.js";

export const createMaintenance = async (req, res, next) => {
  try {
    const record = await createMaintenanceService(req.body);
    res.status(201).json({
      success: true,
      message: "Maintenance record created successfully",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceRecords = async (req, res, next) => {
  try {
    const result = await getMaintenanceRecordsService(req.query);
    res.status(200).json({
      success: true,
      message: "Maintenance records retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await getMaintenanceByIdService(id);
    res.status(200).json({
      success: true,
      message: "Maintenance record retrieved successfully",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedRecord = await updateMaintenanceService(id, req.body);
    res.status(200).json({
      success: true,
      message: "Maintenance record updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteMaintenanceService(id);
    res.status(200).json({
      success: true,
      message: "Maintenance record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
