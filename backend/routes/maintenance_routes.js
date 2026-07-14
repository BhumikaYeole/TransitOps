import { Router } from "express";
import {
  createMaintenance,
  getMaintenanceRecords,
  getMaintenanceById,
  updateMaintenance,
  deleteMaintenance,
} from "../controllers/maintenance_controller.js";
import  authorize from "../middleware/auth_middleware.js";
import { allowRole } from "../middleware/role_middleware.js";

const maintenanceRouter = Router();

maintenanceRouter.post(
  "/",
  authorize,
  allowRole("Fleet Manager"),
  createMaintenance
);

maintenanceRouter.get(
  "/",
  authorize,
  getMaintenanceRecords
);

maintenanceRouter.get(
  "/:id",
  authorize,
  getMaintenanceById
);

maintenanceRouter.put(
  "/:id",
  authorize,
  allowRole("Fleet Manager"),
  updateMaintenance
);

maintenanceRouter.delete(
  "/:id",
  authorize,
  allowRole("Fleet Manager"),
  deleteMaintenance
);

export default maintenanceRouter;