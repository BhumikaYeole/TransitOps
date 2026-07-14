import Vehicle from "../models/vehicles.js";

export const addVehicle = async(req, res, next) => {
    try {
        const { registrationNumber, model, type, maxLoadCapacity, odometer, acquisitionCost, region, status } = req.body;

        if (!registrationNumber || !model || !type || !maxLoadCapacity || !acquisitionCost) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // Check if vehicle already exists
        const existingVehicle = await Vehicle.findOne({ registrationNumber });
        if (existingVehicle) {
            return res.status(409).json({
                success: false,
                message: "Vehicle with this registration number already exists"
            });
        }

        const vehicle = new Vehicle({
            registrationNumber,
            model,
            type,
            maxLoadCapacity,
            odometer: odometer || 0,
            acquisitionCost,
            region,
            status: status || "AVAILABLE"
        });

        const savedVehicle = await vehicle.save();

        res.status(201).json({
            success: true,
            message: "Vehicle added successfully",
            data: savedVehicle
        });
    }
    catch (error) {
        next(error);
    }
};

export const getVehicles = async(req, res, next) => {
    try {
        const { status, type, region } = req.query;
        

        let filter = {};
        if (status) filter.status = status.toUpperCase();
        if (type) filter.type = type;
        if (region) filter.region = region;

        if(req.user.role == "Driver" || req.user.role == "Dispatcher") filter.status = ["AVAILABLE", "ON_TRIP"];

        const vehicles = await Vehicle.find(filter).sort({ registrationNumber: 1 });

        if (!vehicles || vehicles.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No vehicles found",
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: "Vehicles retrieved successfully",
            count: vehicles.length,
            data: vehicles
        });
    }
    catch (error) {
        next(error);
    }
};

export const getVehicleById = async(req, res, next) => {
    try {
        const { id } = req.params;

        const vehicle = await Vehicle.findById(id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Vehicle retrieved successfully",
            data: vehicle
        });
    }
    catch (error) {
        next(error);
    }
};

export const updateVehicle = async(req, res, next) => {
    try {
        const { id } = req.params;
        const { registrationNumber, model, type, maxLoadCapacity, odometer, acquisitionCost, region, status } = req.body;

        // Check if vehicle exists
        let vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }

        // Check if new registration number already exists
        if (registrationNumber && registrationNumber !== vehicle.registrationNumber) {
            const existingVehicle = await Vehicle.findOne({ registrationNumber });
            if (existingVehicle) {
                return res.status(409).json({
                    success: false,
                    message: "Vehicle with this registration number already exists"
                });
            }
        }

        // Update fields
        if (registrationNumber) vehicle.registrationNumber = registrationNumber;
        if (model) vehicle.model = model;
        if (type) vehicle.type = type;
        if (maxLoadCapacity) vehicle.maxLoadCapacity = maxLoadCapacity;
        if (odometer !== undefined) vehicle.odometer = odometer;
        if (acquisitionCost) vehicle.acquisitionCost = acquisitionCost;
        if (region) vehicle.region = region;
        if (status) vehicle.status = status.toUpperCase();

        const updatedVehicle = await vehicle.save();

        res.status(200).json({
            success: true,
            message: "Vehicle updated successfully",
            data: updatedVehicle
        });
    }
    catch (error) {
        next(error);
    }
};

export const deleteVehicle = async(req, res, next) => {
    try {
        const { id } = req.params;

        const vehicle = await Vehicle.findByIdAndDelete(id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Vehicle deleted successfully",
            data: vehicle
        });
    }
    catch (error) {
        next(error);
    }
};

