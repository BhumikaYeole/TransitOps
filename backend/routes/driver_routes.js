import { Router } from "express";
import {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  getDriverProfile,
  createDriverProfile,
  updateDriverProfile,
} from "../controllers/driver_controller.js";

const driverRouter = Router();

driverRouter.get("/profile", getDriverProfile);
driverRouter.post("/profile", createDriverProfile);
driverRouter.put("/profile", updateDriverProfile);
driverRouter.post("/", createDriver);
driverRouter.get("/", getDrivers);
driverRouter.get("/:id", getDriverById);
driverRouter.put("/:id", updateDriver);
driverRouter.delete("/:id", deleteDriver);

export default driverRouter;
