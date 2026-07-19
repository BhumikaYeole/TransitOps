import { Router } from "express";
import {
  createFuelLog,
  getFuelLogs,
  getFuelLogById,
  updateFuelLog,
  deleteFuelLog,
} from "../controllers/fuel_controller.js";
import authorize from "../middleware/auth_middleware.js";
import { allowRole } from "../middleware/role_middleware.js";

const fuelRouter = Router();

fuelRouter.post(
  "/",
  authorize,
  allowRole("Fleet Manager", "Driver", "Dispatcher"),
  createFuelLog
);

fuelRouter.get(
  "/",
  authorize,
  allowRole("Fleet Manager", "Driver", "Dispatcher", "Financial Analyst"),
  getFuelLogs
);

fuelRouter.get(
  "/:id",
  authorize,
  allowRole("Fleet Manager", "Driver", "Dispatcher", "Financial Analyst"),
  getFuelLogById
);

fuelRouter.put(
  "/:id",
  authorize,
  allowRole("Fleet Manager", "Financial Analyst"),
  updateFuelLog
);

fuelRouter.delete(
  "/:id",
  authorize,
  allowRole("Fleet Manager"),
  deleteFuelLog
);

export default fuelRouter;