import { Router } from "express";
import { body } from "express-validator";
import {
  createMaintenance,
  getMaintenanceRecords,
  getMaintenanceById,
  updateMaintenance,
  deleteMaintenance,
} from "../controllers/maintenance_controller.js";
import { validateRequest } from "../middleware/validation_middleware.js";

const maintenanceRouter = Router();

// Create Maintenance Validation Rules
const createMaintenanceValidation = [
  body("vehicle")
    .isMongoId()
    .withMessage("A valid Vehicle ID is required"),
  body("maintenanceType")
    .trim()
    .notEmpty()
    .withMessage("Maintenance type is required"),
  body("scheduledDate")
    .isISO8601()
    .withMessage("Scheduled date must be a valid ISO8601 date"),
  body("cost")
    .notEmpty()
    .withMessage("Cost is required")
    .isFloat({ min: 0 })
    .withMessage("Cost must be a positive number"),
  body("status")
    .optional()
    .isIn(["PENDING", "IN_PROGRESS", "COMPLETED"])
    .withMessage("Invalid status value"),
  body("description")
    .optional()
    .trim(),
  body("notes")
    .optional()
    .trim(),
];

// Update Maintenance Validation Rules
const updateMaintenanceValidation = [
  body("vehicle")
    .optional()
    .isMongoId()
    .withMessage("Must be a valid Vehicle ID"),
  body("maintenanceType")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Maintenance type cannot be empty"),
  body("scheduledDate")
    .optional()
    .isISO8601()
    .withMessage("Scheduled date must be a valid ISO8601 date"),
  body("completedDate")
    .optional()
    .isISO8601()
    .withMessage("Completed date must be a valid ISO8601 date"),
  body("cost")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Cost must be a positive number"),
  body("status")
    .optional()
    .isIn(["PENDING", "IN_PROGRESS", "COMPLETED"])
    .withMessage("Invalid status value"),
  body("description")
    .optional()
    .trim(),
  body("notes")
    .optional()
    .trim(),
];

maintenanceRouter.route("/")
  .post(createMaintenanceValidation, validateRequest, createMaintenance)
  .get(getMaintenanceRecords);

maintenanceRouter.route("/:id")
  .get(getMaintenanceById)
  .put(updateMaintenanceValidation, validateRequest, updateMaintenance)
  .delete(deleteMaintenance);

export default maintenanceRouter;
