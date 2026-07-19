import { Router } from "express";

import {
  getDashboardStats,
  getMonthlyTrends,
  getVehiclePerformance,
  getExpenseReport,
  exportAnalyticsCSV
} from "../controllers/report_controller.js";

import authorize from "../middleware/auth_middleware.js";
import { allowRole } from "../middleware/role_middleware.js";

const reportRouter = Router();

reportRouter.get(
  "/dashboard",
  authorize,
  allowRole("Fleet Manager", "Financial Analyst"),
  getDashboardStats
);

reportRouter.get(
  "/trends",
  authorize,
  allowRole("Fleet Manager", "Financial Analyst"),
  getMonthlyTrends
);

reportRouter.get(
  "/vehicle-performance",
  authorize,
  allowRole("Fleet Manager", "Financial Analyst"),
  getVehiclePerformance
);

reportRouter.get(
  "/expense-report",
  authorize,
  allowRole("Fleet Manager", "Financial Analyst"),
  getExpenseReport
);

reportRouter.get(
  "/export",
  authorize,
  allowRole("Fleet Manager", "Financial Analyst"),
  exportAnalyticsCSV
);

export default reportRouter;