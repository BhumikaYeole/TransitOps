import { Router } from "express";
import { body } from "express-validator";
import {
  createFuelLog,
  getFuelLogs,
  getFuelLogById,
  updateFuelLog,
  deleteFuelLog,
} from "../controllers/fuel_controller.js";
import { validateRequest } from "../middleware/validation_middleware.js";

const fuelRouter = Router();

// Create Fuel Log Validation Rules
const createFuelLogValidation = [
  body("vehicle")
    .isMongoId()
    .withMessage("A valid Vehicle ID is required"),
  body("liters")
    .notEmpty()
    .withMessage("Fuel liters quantity is required")
    .isFloat({ gt: 0 })
    .withMessage("Fuel quantity must be greater than zero"),
  body("cost")
    .notEmpty()
    .withMessage("Fuel cost is required")
    .isFloat({ gt: 0 })
    .withMessage("Cost must be a positive number"),
  body("odometer")
    .notEmpty()
    .withMessage("Odometer reading is required")
    .isFloat({ min: 0 })
    .withMessage("Odometer reading cannot be negative"),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid ISO8601 date"),
  body("fuelStation")
    .optional()
    .trim(),
  body("remarks")
    .optional()
    .trim(),
];

// Update Fuel Log Validation Rules
const updateFuelLogValidation = [
  body("vehicle")
    .optional()
    .isMongoId()
    .withMessage("Must be a valid Vehicle ID"),
  body("liters")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Fuel quantity must be greater than zero"),
  body("cost")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Cost must be a positive number"),
  body("odometer")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Odometer reading cannot be negative"),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid ISO8601 date"),
  body("fuelStation")
    .optional()
    .trim(),
  body("remarks")
    .optional()
    .trim(),
];

fuelRouter.route("/")
  .post(createFuelLogValidation, validateRequest, createFuelLog)
  .get(getFuelLogs);

fuelRouter.route("/:id")
  .get(getFuelLogById)
  .put(updateFuelLogValidation, validateRequest, updateFuelLog)
  .delete(deleteFuelLog);

export default fuelRouter;
