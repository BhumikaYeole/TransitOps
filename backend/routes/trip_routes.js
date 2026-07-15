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
import { allowRole } from "../middleware/role_middleware.js";

const tripRouter = Router();

tripRouter.post("/", allowRole("Driver", "Dispatcher"), createTrip);
tripRouter.get("/", getTrips);
tripRouter.get("/:id", getTripById);
tripRouter.put("/:id", allowRole("Driver", "Dispatcher"), updateTrip);
tripRouter.patch("/:id/dispatch", allowRole("Driver", "Dispatcher"), dispatchTrip);
tripRouter.patch("/:id/complete", allowRole("Driver", "Dispatcher"), completeTrip);
tripRouter.patch("/:id/cancel", allowRole("Driver", "Dispatcher"), cancelTrip);
tripRouter.delete("/:id", allowRole("Fleet Manager"), deleteTrip);

export default tripRouter;
