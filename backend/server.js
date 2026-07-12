import express from "express"
import { PORT } from "./config/env.js"
import connectToDatabase from "./database/mongodb.js"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth_routes.js"
import authorize from "./middleware/auth_middleware.js"
import tripRouter from "./routes/trip_routes.js"
import maintenanceRouter from "./routes/maintenance_routes.js"

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended : false}))

app.use("/api/auth",authRouter);
app.use("/api/trips", authorize, tripRouter);
app.use("/api/maintenance", authorize, maintenanceRouter);

app.get("/", (req,res) => {
    res.send("TransitOps running")
})

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

app.listen(PORT, async () => {
    console.log(`TransitOps running at http://localhost:${PORT}`)
    await connectToDatabase()
})

export default app;