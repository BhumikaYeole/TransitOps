import { Router } from "express";
import { body } from "express-validator";
import {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
} from "../controllers/trip_controller.js";
import { validateRequest } from "../middleware/validation_middleware.js";

const tripRouter = Router();

// Create Trip Validation Rules
const createTripValidation = [
  body("source")
    .trim()
    .notEmpty()
    .withMessage("Source location is required"),
  body("destination")
    .trim()
    .notEmpty()
    .withMessage("Destination location is required"),
  body("vehicle")
    .isMongoId()
    .withMessage("A valid Vehicle ID is required"),
  body("driver")
    .isMongoId()
    .withMessage("A valid Driver ID is required"),
  body("cargoWeight")
    .notEmpty()
    .withMessage("Cargo weight is required")
    .isFloat({ min: 0 })
    .withMessage("Cargo weight must be a positive number"),
  body("plannedDistance")
    .notEmpty()
    .withMessage("Planned distance is required")
    .isFloat({ min: 0 })
    .withMessage("Planned distance must be a positive number"),
  body("revenue")
    .notEmpty()
    .withMessage("Revenue is required")
    .isFloat({ min: 0 })
    .withMessage("Revenue must be a positive number"),
  body("status")
    .optional()
    .isIn(["DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"])
    .withMessage("Invalid status value"),
];

// Update Trip Validation Rules
const updateTripValidation = [
  body("source")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Source location cannot be empty"),
  body("destination")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Destination location cannot be empty"),
  body("vehicle")
    .optional()
    .isMongoId()
    .withMessage("Must be a valid Vehicle ID"),
  body("driver")
    .optional()
    .isMongoId()
    .withMessage("Must be a valid Driver ID"),
  body("cargoWeight")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Cargo weight must be a positive number"),
  body("plannedDistance")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Planned distance must be a positive number"),
  body("actualDistance")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Actual distance must be a positive number"),
  body("fuelConsumed")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Fuel consumed must be a positive number"),
  body("revenue")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Revenue must be a positive number"),
  body("status")
    .optional()
    .isIn(["DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"])
    .withMessage("Invalid status value"),
];

tripRouter.route("/")
  .post(createTripValidation, validateRequest, createTrip)
  .get(getTrips);

tripRouter.route("/:id")
  .get(getTripById)
  .put(updateTripValidation, validateRequest, updateTrip)
  .delete(deleteTrip);

export default tripRouter;
