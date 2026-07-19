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
import {allowRoles} from "../middleware/role_middleware.js"
import authorize from "../middleware/auth_middleware.js"

const driverRouter = Router();

driverRouter.get("/profile", getDriverProfile);
driverRouter.post("/profile", createDriverProfile);
driverRouter.put("/profile", updateDriverProfile);
driverRouter.post("/", createDriver);
driverRouter.get("/", getDrivers);
driverRouter.get("/:id", getDriverById);
driverRouter.put("/:id", authorize, allowRoles("Fleet Manager", "Safety Officer"), updateDriver);
driverRouter.delete("/:id", authorize, allowRoles("Fleet Manager", "Safety Officer"), deleteDriver);

export default driverRouter;
