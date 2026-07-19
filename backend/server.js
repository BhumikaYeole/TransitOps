import express from "express";
import cors from "cors";
import { PORT,CLIENT_URL } from "./config/env.js";
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

// CORS Configuration
const corsOptions = {
    origin: CLIENT_URL,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Public Routes
app.use("/api/auth", authRouter);

// Protected Routes
app.use("/api/vehicles", authorize, vehicleRouter);
app.use("/api/drivers", authorize, driverRouter);
app.use("/api/trips", authorize, tripRouter);
app.use("/api/maintenance", authorize, maintenanceRouter);
app.use("/api/fuel", authorize, fuelRouter);
app.use("/api/expenses", authorize, expenseRouter);
app.use("/api/reports", authorize, reportRouter);

// Health Check
app.get("/", (req, res) => {
    res.send("TransitOps running");
});

// Global Error Handler
app.use(errorMiddleware);

// Start Server
await connectToDatabase();

app.listen(PORT, () => {
    console.log(`TransitOps running`);
});

export default app;