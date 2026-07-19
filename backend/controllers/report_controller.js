import {
  getDashboardStatsService,
  getMonthlyTrendsService,
  getVehiclePerformanceService,
  getExpenseReportService,
} from "../services/report_service.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await getDashboardStatsService();

    res.status(200).json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyTrends = async (req, res, next) => {
  try {
    const trends = await getMonthlyTrendsService(req.query);

    res.status(200).json({
      success: true,
      message: "Monthly trends retrieved successfully",
      data: trends,
    });
  } catch (error) {
    next(error);
  }
};

export const getVehiclePerformance = async (req, res, next) => {
  try {
    const performance = await getVehiclePerformanceService();

    res.status(200).json({
      success: true,
      message: "Vehicle performance retrieved successfully",
      data: performance,
    });
  } catch (error) {
    next(error);
  }
};

export const getExpenseReport = async (req, res, next) => {
  try {
    const report = await getExpenseReportService();

    res.status(200).json({
      success: true,
      message: "Expense report retrieved successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

import { exportAnalyticsCSVService } from "../services/report_service.js";

export const exportAnalyticsCSV = async (req, res, next) => {
  try {
    const csv = await exportAnalyticsCSVService();

    res.header(
      "Content-Type",
      "text/csv"
    );

    res.attachment("analytics-report.csv");

    return res.send(csv);
  } catch (err) {
    next(err);
  }
};