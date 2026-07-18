import { Router } from "express";
import {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip
} from "../controllers/trip_controller.js";
import { allowRole, allowRoles } from "../middleware/role_middleware.js";

const tripRouter = Router();

tripRouter.post("/", allowRoles("Driver", "Dispatcher", "Fleet Manager"), createTrip);
tripRouter.get("/", getTrips);
tripRouter.get("/:id", getTripById);
tripRouter.put("/:id", allowRoles("Driver", "Dispatcher"), updateTrip);
tripRouter.patch("/:id/dispatch", allowRoles("Driver", "Dispatcher"), dispatchTrip);
tripRouter.patch("/:id/complete", allowRoles("Driver", "Dispatcher"), completeTrip);
tripRouter.patch("/:id/cancel", allowRoles("Driver", "Dispatcher"), cancelTrip);
tripRouter.delete("/:id", allowRoles("Driver", "Dispatcher", "Fleet Manager"), deleteTrip);

export default tripRouter;
