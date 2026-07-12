import ReportService from "../services/report_service.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await ReportService.getDashboardStats();
    res.status(200).json({
      success: true,
      message: "Dashboard analytics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyTrends = async (req, res, next) => {
  try {
    const trends = await ReportService.getMonthlyTrends(req.query);
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
    const performance = await ReportService.getVehiclePerformance();
    res.status(200).json({
      success: true,
      message: "Vehicle performance report retrieved successfully",
      data: performance,
    });
  } catch (error) {
    next(error);
  }
};

export const getExpenseReport = async (req, res, next) => {
  try {
    const expenses = await ReportService.getExpenseReport();
    res.status(200).json({
      success: true,
      message: "Expense report retrieved successfully",
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};
