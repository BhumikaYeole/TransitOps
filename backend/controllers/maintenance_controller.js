import MaintenanceService from "../services/maintenance_service.js";

export const createMaintenance = async (req, res, next) => {
  try {
    const record = await MaintenanceService.createMaintenance(req.body);
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
    const result = await MaintenanceService.getMaintenanceRecords(req.query);
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
    const record = await MaintenanceService.getMaintenanceById(id);
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
    const updatedRecord = await MaintenanceService.updateMaintenance(id, req.body);
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
    await MaintenanceService.deleteMaintenance(id);
    res.status(200).json({
      success: true,
      message: "Maintenance record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
