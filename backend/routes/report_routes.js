import { Router } from "express";
import {
  getDashboardStats,
  getMonthlyTrends,
  getVehiclePerformance,
  getExpenseReport,
} from "../controllers/report_controller.js";

const reportRouter = Router();

reportRouter.get("/dashboard", getDashboardStats);
reportRouter.get("/monthly", getMonthlyTrends);
reportRouter.get("/vehicle-performance", getVehiclePerformance);
reportRouter.get("/expenses", getExpenseReport);

export default reportRouter;
