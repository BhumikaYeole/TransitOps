import express from "express";
import {
    addVehicle,
    getVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle
} from "../controllers/vehicle_controller.js";
import { allowRole } from "../middleware/role_middleware.js";  
import  authorize  from "../middleware/auth_middleware.js";

const vehicleRouter = express.Router();

vehicleRouter.post("/", authorize, allowRole("Fleet Manager"), addVehicle);
vehicleRouter.get("/", getVehicles);
vehicleRouter.get("/:id", getVehicleById);
vehicleRouter.put("/:id", authorize, allowRole("Fleet Manager"), updateVehicle);
vehicleRouter.delete("/:id", authorize, allowRole("Fleet Manager"), deleteVehicle);

export default vehicleRouter;
