import { Router } from "express";
import { body } from "express-validator";
import {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
} from "../controllers/driver_controller.js";
import { validateRequest } from "../middleware/validation_middleware.js";

const driverRouter = Router();

// Create Driver Validation Rules
const createDriverValidation = [
  body("user")
    .optional()
    .isMongoId()
    .withMessage("Must be a valid User ID"),
  body("licenseNumber")
    .trim()
    .notEmpty()
    .withMessage("License number is required"),
  body("licenseCategory")
    .trim()
    .notEmpty()
    .withMessage("License category is required"),
  body("licenseExpiry")
    .isISO8601()
    .withMessage("License expiry must be a valid ISO8601 date"),
  body("contactNumber")
    .trim()
    .notEmpty()
    .withMessage("Contact number is required"),
  body("safetyScore")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Safety score must be an integer between 0 and 100"),
  body("status")
    .optional()
    .isIn(["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"])
    .withMessage("Invalid status value"),
];

// Update Driver Validation Rules
const updateDriverValidation = [
  body("user")
    .optional()
    .isMongoId()
    .withMessage("Must be a valid User ID"),
  body("licenseNumber")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("License number cannot be empty"),
  body("licenseCategory")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("License category cannot be empty"),
  body("licenseExpiry")
    .optional()
    .isISO8601()
    .withMessage("License expiry must be a valid ISO8601 date"),
  body("contactNumber")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Contact number cannot be empty"),
  body("safetyScore")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Safety score must be an integer between 0 and 100"),
  body("status")
    .optional()
    .isIn(["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"])
    .withMessage("Invalid status value"),
];

driverRouter.route("/")
  .post(createDriverValidation, validateRequest, createDriver)
  .get(getDrivers);

driverRouter.route("/:id")
  .get(getDriverById)
  .put(updateDriverValidation, validateRequest, updateDriver)
  .delete(deleteDriver);

export default driverRouter;
