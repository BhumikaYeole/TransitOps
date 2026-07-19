import mongoose from "mongoose";
import Vehicle from "../models/vehicles.js";
import Driver from "../models/drivers.js";
import Trip from "../models/trips.js";
import FuelLog from "../models/fuellogs.js";
import Expense from "../models/expenses.js";
import Maintenance from "../models/maintenance.js";

export const getDashboardStatsService = async () => {
  const vehicleStats = await Vehicle.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        available: {
          $sum: {
            $cond: [{ $eq: ["$status", "AVAILABLE"] }, 1, 0],
          },
        },
        onTrip: {
          $sum: {
            $cond: [{ $eq: ["$status", "ON_TRIP"] }, 1, 0],
          },
        },
        inShop: {
          $sum: {
            $cond: [{ $eq: ["$status", "IN_SHOP"] }, 1, 0],
          },
        },
      },
    },
  ]);

  const vehicleCounts = vehicleStats[0] || {
    total: 0,
    available: 0,
    onTrip: 0,
    inShop: 0,
  };

  const fleetUtilization =
    vehicleCounts.total > 0
      ? (vehicleCounts.onTrip / vehicleCounts.total) * 100
      : 0;

  const tripStats = await Trip.aggregate([
    {
      $group: {
        _id: null,
        active: {
          $sum: {
            $cond: [{ $eq: ["$status", "DISPATCHED"] }, 1, 0],
          },
        },
        completed: {
          $sum: {
            $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0],
          },
        },
        cancelled: {
          $sum: {
            $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0],
          },
        },
        totalRevenue: {
          $sum: "$revenue",
        },
      },
    },
  ]);

  const tripCounts = tripStats[0] || {
    active: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
  };

  const [fuelCostSum, maintCostSum, expenseSum] = await Promise.all([
    FuelLog.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$cost" },
        },
      },
    ]),

    Maintenance.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$cost" },
        },
      },
    ]),

    Expense.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  const totalFuelCost = fuelCostSum[0]?.total || 0;
  const totalMaintenanceCost = maintCostSum[0]?.total || 0;
  const totalOtherExpense = expenseSum[0]?.total || 0;

  const totalOperationalCost =
    totalFuelCost +
    totalMaintenanceCost +
    totalOtherExpense;

  const totalRevenue = tripCounts.totalRevenue;
  const totalProfit = totalRevenue - totalOperationalCost;

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
    fuelEfficiencyStats[0] &&
    fuelEfficiencyStats[0].totalFuel > 0
      ? fuelEfficiencyStats[0].totalDistance /
        fuelEfficiencyStats[0].totalFuel
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
};

export const getMonthlyTrendsService = async (query) => {
  const targetYear = query.year
    ? Number(query.year)
    : new Date().getFullYear();

  const startOfYear = new Date(
    `${targetYear}-01-01T00:00:00.000Z`
  );

  const endOfYear = new Date(
    `${targetYear}-12-31T23:59:59.999Z`
  );

  const revenueTrends = await Trip.aggregate([
    {
      $match: {
        status: "COMPLETED",
        createdAt: {
          $gte: startOfYear,
          $lte: endOfYear,
        },
      },
    },
    {
      $group: {
        _id: {
          $month: "$createdAt",
        },
        totalRevenue: {
          $sum: "$revenue",
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  const fuelTrends = await FuelLog.aggregate([
    {
      $match: {
        date: {
          $gte: startOfYear,
          $lte: endOfYear,
        },
      },
    },
    {
      $group: {
        _id: {
          $month: "$date",
        },
        totalLiters: {
          $sum: "$liters",
        },
        totalCost: {
          $sum: "$cost",
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  const maintenanceTrends = await Maintenance.aggregate([
    {
      $match: {
        scheduledDate: {
          $gte: startOfYear,
          $lte: endOfYear,
        },
      },
    },
    {
      $group: {
        _id: {
          $month: "$scheduledDate",
        },
        totalCost: {
          $sum: "$cost",
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  const otherExpenseTrends = await Expense.aggregate([
    {
      $match: {
        date: {
          $gte: startOfYear,
          $lte: endOfYear,
        },
      },
    },
    {
      $group: {
        _id: {
          $month: "$date",
        },
        totalAmount: {
          $sum: "$amount",
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  const tripTrends = await Trip.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfYear,
          $lte: endOfYear,
        },
      },
    },
    {
      $group: {
        _id: {
          month: {
            $month: "$createdAt",
          },
          status: "$status",
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        "_id.month": 1,
      },
    },
  ]);

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
    const status = t._id.status;

    if (monthlyTrips[monthIdx][status] !== undefined) {
      monthlyTrips[monthIdx][status] = t.count;
    }
  });

  const monthlyTotalExpenses = buildMonthlyArray().map((item, idx) => ({
    month: item.month,
    value:
      monthlyFuelCost[idx].value +
      monthlyMaintCost[idx].value +
      monthlyOtherExpense[idx].value,
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
};

export const getVehiclePerformanceService = async () => {
  const vehicles = await Vehicle.find();

  const [
    tripStats,
    fuelStats,
    maintStats,
    expenseStats,
  ] = await Promise.all([
    Trip.aggregate([
      {
        $group: {
          _id: "$vehicle",
          completedCount: {
            $sum: {
              $cond: [
                { $eq: ["$status", "COMPLETED"] },
                1,
                0,
              ],
            },
          },
          totalRevenue: {
            $sum: "$revenue",
          },
          totalDistance: {
            $sum: {
              $cond: [
                { $eq: ["$status", "COMPLETED"] },
                "$actualDistance",
                0,
              ],
            },
          },
          totalFuel: {
            $sum: {
              $cond: [
                { $eq: ["$status", "COMPLETED"] },
                "$fuelConsumed",
                0,
              ],
            },
          },
        },
      },
    ]),

    FuelLog.aggregate([
      {
        $group: {
          _id: "$vehicle",
          totalCost: {
            $sum: "$cost",
          },
        },
      },
    ]),

    Maintenance.aggregate([
      {
        $group: {
          _id: "$vehicle",
          totalCost: {
            $sum: "$cost",
          },
        },
      },
    ]),

    Expense.aggregate([
      {
        $group: {
          _id: "$vehicle",
          totalCost: {
            $sum: "$amount",
          },
        },
      },
    ]),
  ]);

  const performance = vehicles.map((vehicle) => {
    const trips =
      tripStats.find(
        (x) =>
          x._id.toString() === vehicle._id.toString()
      ) || {
        completedCount: 0,
        totalRevenue: 0,
        totalDistance: 0,
        totalFuel: 0,
      };

    const fuel =
      fuelStats.find(
        (x) =>
          x._id.toString() === vehicle._id.toString()
      ) || {
        totalCost: 0,
      };

    const maint =
      maintStats.find(
        (x) =>
          x._id.toString() === vehicle._id.toString()
      ) || {
        totalCost: 0,
      };

    const exp =
      expenseStats.find(
        (x) =>
          x._id.toString() === vehicle._id.toString()
      ) || {
        totalCost: 0,
      };

    const fuelEfficiency =
      trips.totalFuel > 0
        ? trips.totalDistance / trips.totalFuel
        : 0;

    const maintenanceCost = maint.totalCost;
    const fuelCost = fuel.totalCost;

    const operationalCost =
      fuelCost +
      maintenanceCost +
      exp.totalCost;

    const revenue = trips.totalRevenue;

    const profit =
      revenue -
      (maintenanceCost + fuelCost);

    const roi =
      vehicle.acquisitionCost > 0
        ? (profit / vehicle.acquisitionCost) * 100
        : 0;

    return {
      vehicleId: vehicle._id,
      vehicleName: `${vehicle.model} (${vehicle.registrationNumber})`,
      registrationNumber:
        vehicle.registrationNumber,
      acquisitionCost:
        vehicle.acquisitionCost,
      tripsCompleted:
        trips.completedCount,
      fuelEfficiency,
      revenue,
      operationalCost,
      maintenanceCost,
      fuelCost,
      profit,
      roi,
    };
  });

  return performance;
};

import { Parser } from "json2csv";
export const getExpenseReportService = async () => {
  const categoryTotals = await Expense.aggregate([
    {
      $group: {
        _id: "$category",
        totalAmount: {
          $sum: "$amount",
        },
        count: {
          $sum: 1,
        },
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
    {
      $sort: {
        totalAmount: -1,
      },
    },
  ]);

  return categoryTotals;
};


export const exportAnalyticsCSVService = async () => {
  const vehicles = await getVehiclePerformanceService();

  const fields = [
    {
      label: "Vehicle",
      value: "vehicleName",
    },
    {
      label: "Registration Number",
      value: "registrationNumber",
    },
    {
      label: "Trips Completed",
      value: "tripsCompleted",
    },
    {
      label: "Fuel Efficiency (km/l)",
      value: "fuelEfficiency",
    },
    {
      label: "Revenue",
      value: "revenue",
    },
    {
      label: "Fuel Cost",
      value: "fuelCost",
    },
    {
      label: "Maintenance Cost",
      value: "maintenanceCost",
    },
    {
      label: "Operational Cost",
      value: "operationalCost",
    },
    {
      label: "Profit",
      value: "profit",
    },
    {
      label: "ROI (%)",
      value: "roi",
    },
  ];

  const parser = new Parser({ fields });

  return parser.parse(vehicles);
};