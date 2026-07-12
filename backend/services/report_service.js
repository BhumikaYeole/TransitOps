import mongoose from "mongoose";
import Vehicle from "../models/vehicles.js";
import Driver from "../models/drivers.js";
import Trip from "../models/trips.js";
import FuelLog from "../models/fuellogs.js";
import Expense from "../models/expenses.js";
import Maintenance from "../models/maintenance.js";

class ReportService {
  /**
   * Return overall statistics for the dashboard
   * @returns {Promise<Object>} Dashboard analytics
   */
  async getDashboardStats() {
    // 1. Vehicles availability and utilization
    const vehicleStats = await Vehicle.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          available: { $sum: { $cond: [{ $eq: ["$status", "AVAILABLE"] }, 1, 0] } },
          onTrip: { $sum: { $cond: [{ $eq: ["$status", "ON_TRIP"] }, 1, 0] } },
          inShop: { $sum: { $cond: [{ $eq: ["$status", "IN_SHOP"] }, 1, 0] } },
        },
      },
    ]);
    const vehicleCounts = vehicleStats[0] || { total: 0, available: 0, onTrip: 0, inShop: 0 };
    const fleetUtilization = vehicleCounts.total > 0 ? (vehicleCounts.onTrip / vehicleCounts.total) * 100 : 0;

    // 2. Trips counters and revenue
    const tripStats = await Trip.aggregate([
      {
        $group: {
          _id: null,
          active: { $sum: { $cond: [{ $eq: ["$status", "DISPATCHED"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } },
          totalRevenue: { $sum: "$revenue" },
        },
      },
    ]);
    const tripCounts = tripStats[0] || { active: 0, completed: 0, cancelled: 0, totalRevenue: 0 };

    // 3. Costs aggregation
    const [fuelCostSum, maintCostSum, expenseSum] = await Promise.all([
      FuelLog.aggregate([{ $group: { _id: null, total: { $sum: "$cost" } } }]),
      Maintenance.aggregate([{ $group: { _id: null, total: { $sum: "$cost" } } }]),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
    ]);

    const totalFuelCost = fuelCostSum[0]?.total || 0;
    const totalMaintenanceCost = maintCostSum[0]?.total || 0;
    const totalOtherExpense = expenseSum[0]?.total || 0;

    const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalOtherExpense;
    const totalRevenue = tripCounts.totalRevenue;
    const totalProfit = totalRevenue - totalOperationalCost;

    // 4. Fuel Efficiency
    const fuelEfficiencyStats = await Trip.aggregate([
      {
        $match: {
          status: "COMPLETED",
          actualDistance: { $gt: 0 },
          fuelConsumed: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: "$actualDistance" },
          totalFuel: { $sum: "$fuelConsumed" },
        },
      },
    ]);
    const averageFuelEfficiency =
      fuelEfficiencyStats[0] && fuelEfficiencyStats[0].totalFuel > 0
        ? fuelEfficiencyStats[0].totalDistance / fuelEfficiencyStats[0].totalFuel
        : 0;

    return {
      fleetUtilization,
      activeTrips: tripCounts.active,
      completedTrips: tripCounts.completed,
      cancelledTrips: tripCounts.cancelled,
      availableVehicles: vehicleCounts.available,
      vehiclesInMaintenance: vehicleCounts.inShop,
      totalFuelCost,
      totalMaintenanceCost,
      totalOperationalCost,
      totalRevenue,
      totalProfit,
      averageFuelEfficiency,
    };
  }

  /**
   * Return monthly trends for Revenue, Expenses, Fuel, and Trips
   * @param {Object} query - Filter options (e.g. year)
   * @returns {Promise<Object>} Trends data
   */
  async getMonthlyTrends(query) {
    const targetYear = query.year ? Number(query.year) : new Date().getFullYear();
    const startOfYear = new Date(`${targetYear}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${targetYear}-12-31T23:59:59.999Z`);

    // 1. Revenue monthly trends (Completed trips)
    const revenueTrends = await Trip.aggregate([
      {
        $match: {
          status: "COMPLETED",
          createdAt: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$revenue" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 2. Fuel monthly trends (Fuel logs)
    const fuelTrends = await FuelLog.aggregate([
      {
        $match: {
          date: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          totalLiters: { $sum: "$liters" },
          totalCost: { $sum: "$cost" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 3. Maintenance monthly trends (Maintenance cost)
    const maintenanceTrends = await Maintenance.aggregate([
      {
        $match: {
          scheduledDate: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $month: "$scheduledDate" },
          totalCost: { $sum: "$cost" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 4. Other expenses monthly trends
    const otherExpenseTrends = await Expense.aggregate([
      {
        $match: {
          date: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 5. Trips counts trends
    const tripTrends = await Trip.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // Helper: Build empty structures for months 1-12
    const buildMonthlyArray = () =>
      Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        value: 0,
      }));

    const monthlyRevenue = buildMonthlyArray();
    const monthlyFuelCost = buildMonthlyArray();
    const monthlyFuelLiters = buildMonthlyArray();
    const monthlyMaintCost = buildMonthlyArray();
    const monthlyOtherExpense = buildMonthlyArray();
    const monthlyTrips = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      DRAFT: 0,
      DISPATCHED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    }));

    // Populate arrays
    revenueTrends.forEach((t) => {
      monthlyRevenue[t._id - 1].value = t.totalRevenue;
    });

    fuelTrends.forEach((t) => {
      monthlyFuelCost[t._id - 1].value = t.totalCost;
      monthlyFuelLiters[t._id - 1].value = t.totalLiters;
    });

    maintenanceTrends.forEach((t) => {
      monthlyMaintCost[t._id - 1].value = t.totalCost;
    });

    otherExpenseTrends.forEach((t) => {
      monthlyOtherExpense[t._id - 1].value = t.totalAmount;
    });

    tripTrends.forEach((t) => {
      const monthIdx = t._id.month - 1;
      const status = t._id.status; // DRAFT, DISPATCHED, etc.
      if (monthlyTrips[monthIdx][status] !== undefined) {
        monthlyTrips[monthIdx][status] = t.count;
      }
    });

    // Compute monthly total operational cost trends: Fuel + Maintenance + Other
    const monthlyTotalExpenses = buildMonthlyArray().map((item, idx) => ({
      month: item.month,
      value: monthlyFuelCost[idx].value + monthlyMaintCost[idx].value + monthlyOtherExpense[idx].value,
    }));

    return {
      revenue: monthlyRevenue,
      expenses: monthlyTotalExpenses,
      fuel: monthlyFuelCost.map((item, idx) => ({
        month: item.month,
        liters: monthlyFuelLiters[idx].value,
        cost: item.value,
      })),
      trips: monthlyTrips,
    };
  }

  /**
   * Return vehicle-wise performance metrics
   * @returns {Promise<Array>} List of performance metrics by vehicle
   */
  async getVehiclePerformance() {
    const vehicles = await Vehicle.find();

    const [tripStats, fuelStats, maintStats, expenseStats] = await Promise.all([
      Trip.aggregate([
        {
          $group: {
            _id: "$vehicle",
            completedCount: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
            totalRevenue: { $sum: "$revenue" },
            totalDistance: {
              $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$actualDistance", 0] },
            },
            totalFuel: {
              $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$fuelConsumed", 0], },
            },
          },
        },
      ]),
      FuelLog.aggregate([
        { $group: { _id: "$vehicle", totalCost: { $sum: "$cost" } } },
      ]),
      Maintenance.aggregate([
        { $group: { _id: "$vehicle", totalCost: { $sum: "$cost" } } },
      ]),
      Expense.aggregate([
        { $group: { _id: "$vehicle", totalCost: { $sum: "$amount" } } },
      ]),
    ]);

    const performance = vehicles.map((vehicle) => {
      const trips = tripStats.find((x) => x._id.toString() === vehicle._id.toString()) || {
        completedCount: 0,
        totalRevenue: 0,
        totalDistance: 0,
        totalFuel: 0,
      };
      const fuel = fuelStats.find((x) => x._id.toString() === vehicle._id.toString()) || { totalCost: 0 };
      const maint = maintStats.find((x) => x._id.toString() === vehicle._id.toString()) || { totalCost: 0 };
      const exp = expenseStats.find((x) => x._id.toString() === vehicle._id.toString()) || { totalCost: 0 };

      const fuelEfficiency = trips.totalFuel > 0 ? trips.totalDistance / trips.totalFuel : 0;
      const operationalCost = fuel.totalCost + maint.totalCost + exp.totalCost;
      const revenue = trips.totalRevenue;
      const profit = revenue - operationalCost;
      const roi = operationalCost > 0 ? (profit / operationalCost) * 100 : 0;

      return {
        vehicleId: vehicle._id,
        vehicleName: vehicle.name,
        tripsCompleted: trips.completedCount,
        fuelEfficiency,
        revenue,
        operationalCost,
        profit,
        roi,
      };
    });

    return performance;
  }

  /**
   * Return category-wise expenses aggregated using MongoDB pipelines
   * @returns {Promise<Array>} Category expenses list
   */
  async getExpenseReport() {
    const categoryTotals = await Expense.aggregate([
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalAmount: 1,
          count: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    return categoryTotals;
  }
}

export default new ReportService();
