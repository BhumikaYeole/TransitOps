import express from "express";
import { PORT } from "./config/env.js";
import connectToDatabase from "./database/mongodb.js";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth_routes.js";
import vehicleRouter from "./routes/vehicle_routes.js";
import tripRouter from "./routes/trip_routes.js";
import maintenanceRouter from "./routes/maintenance_routes.js";
import fuelRouter from "./routes/fuel_routes.js";
import expenseRouter from "./routes/expense_routes.js";
import reportRouter from "./routes/report_routes.js";
import driverRouter from "./routes/driver_routes.js";

import authorize from "./middleware/auth_middleware.js";
import errorMiddleware from "./middleware/error_middleware.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Public Routes
app.use("/api/auth", authRouter);

// Protected Routes
app.use("/api/vehicles", authorize, vehicleRouter);
app.use("/api/trips", authorize, tripRouter);
app.use("/api/maintenance", authorize, maintenanceRouter);
app.use("/api/fuel", authorize, fuelRouter);
app.use("/api/expenses", authorize, expenseRouter);
app.use("/api/reports", authorize, reportRouter);
app.use("/api/drivers", authorize, driverRouter);

// Health Check
app.get("/", (req, res) => {
    res.send("TransitOps running");
});

// Global Error Handler (keep only ONE)
app.use(errorMiddleware);

// Start Server
await connectToDatabase();
app.listen(PORT, () => {
    console.log(`TransitOps running at http://localhost:${PORT}`);
});

export default app;