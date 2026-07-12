import express from "express";
import {
    addVehicle,
    getVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle
} from "../controllers/vehicle_controller.js";
import allowRole from "../middleware/role_middleware.js";  

const vehicleRouter = express.Router();

vehicleRouter.post("/", allowRole("Fleet Manager"), addVehicle);
vehicleRouter.get("/", getVehicles);
vehicleRouter.get("/:id", getVehicleById);
vehicleRouter.put("/:id", allowRole("Fleet Manager"), updateVehicle);
vehicleRouter.delete("/:id", allowRole("Fleet Manager"), deleteVehicle);

export default vehicleRouter;
