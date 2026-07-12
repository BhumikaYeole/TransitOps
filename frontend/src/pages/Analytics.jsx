import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import API from "../services/api.js";
import { toast } from "sonner";
import { LuRefreshCw } from "react-icons/lu";

function TopBar({ onRefresh, loading }) {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const name = user?.name || "Raven K.";
  const role = user?.role || "Dispatcher";

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex justify-between items-center mb-8" data-purpose="top-navigation">
      <div className="w-1/3 flex items-center gap-4">
        <input className="app-input focus:ring-2 focus:ring-brand" placeholder="Search analytics..." type="text" />
        <button
          onClick={onRefresh}
          disabled={loading}
          className="border-3 border-black p-3 bg-brand hover:bg-[#ffd100]/90 disabled:opacity-50 cursor-pointer shadow-neo-sm shrink-0 flex items-center justify-center animate-none"
          title="Refresh reports"
        >
          <LuRefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      <div className="flex items-center gap-6">
        <span className="font-bold text-lg text-black">{name}</span>
        <div className="flex items-center gap-3 bg-brand text-black px-4 py-2 border-3 border-black font-bold shadow-neo-sm">
          <span>{role}</span>
          <div className="w-8 h-8 rounded-full bg-white border-2 border-black flex items-center justify-center text-xs">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}

function MetricCards({ metrics, loading }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" data-purpose="kpi-metrics">
      {metrics.map((metric) => (
        <div key={metric.label} className={`app-card p-4 border-l-[12px] ${metric.accent} ${loading ? "animate-pulse" : ""}`}>
          <p className="text-xs font-bold uppercase text-gray-600 mb-2">{metric.label}</p>
          <p className="text-3xl font-black text-black">
            {loading ? "..." : metric.value} {metric.unit && <span className="text-lg">{metric.unit}</span>}
          </p>
        </div>
      ))}
    </section>
  );
}

function RevenueChart({ revenueData }) {
  const maxRevenue = Math.max(...revenueData.map((m) => m.value)) || 1;
  const bars = revenueData.map((m) => ({
    month: m.month,
    height: `${(m.value / maxRevenue) * 100}%`,
    value: m.value,
  }));

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="flex flex-col" data-purpose="revenue-chart-container">
      <h3 className="text-xl font-bold mb-6 uppercase tracking-wider text-black italic">Monthly Revenue</h3>
      <div className="flex items-end gap-3 h-48 border-b-3 border-black pb-1">
        {bars.map((bar, i) => (
          <div
            key={i}
            className="w-full bg-blue-500 border-2 border-black relative group cursor-pointer hover:bg-blue-400 transition-colors"
            style={{ height: bar.height }}
            title={`${monthNames[i]}: ₹${bar.value.toLocaleString()}`}
          >
            {/* Tooltip on hover */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap">
              ₹{bar.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-500 uppercase">
        {monthNames.map((name) => (
          <span key={name} className="w-full text-center">{name}</span>
        ))}
      </div>
    </div>
  );
}

function CostliestVehiclesChart({ costBars }) {
  return (
    <div className="flex flex-col" data-purpose="cost-chart-container">
      <h3 className="text-xl font-bold mb-6 uppercase tracking-wider text-black italic">Top Costliest Vehicles</h3>
      <div className="space-y-6">
        {costBars.length === 0 ? (
          <div className="text-center font-bold text-gray-500 py-10">No vehicle cost data available.</div>
        ) : (
          costBars.map((bar) => (
            <div key={bar.label} className="flex items-center">
              <span className="w-24 text-sm font-bold uppercase text-black truncate pr-2" title={bar.label}>{bar.label}</span>
              <div className="flex-1 bg-gray-200 h-6 relative border border-black group">
                <div
                  className={`h-full border-r-2 border-black absolute left-0 top-0 transition-all duration-500 ${bar.color}`}
                  style={{ width: bar.width }}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-black z-10 font-mono">
                  ₹{bar.cost.toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState({ revenue: [], expenses: [], fuel: [], trips: [] });
  const [vehiclePerformance, setVehiclePerformance] = useState([]);
  const [expensesReport, setExpensesReport] = useState([]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [dbStatsRes, monthlyRes, performanceRes, expensesRes] = await Promise.all([
        API.get("/reports/dashboard"),
        API.get("/reports/monthly"),
        API.get("/reports/vehicle-performance"),
        API.get("/reports/expenses"),
      ]);

      setDashboardStats(dbStatsRes.data.data);
      setMonthlyTrends(monthlyRes.data.data);
      setVehiclePerformance(performanceRes.data.data);
      setExpensesReport(expensesRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load analytics reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Compute metrics from reports
  const fuelEfficiency = dashboardStats ? Number(dashboardStats.averageFuelEfficiency).toFixed(1) : "0.0";
  const utilization = dashboardStats ? `${Math.round(dashboardStats.fleetUtilization)}%` : "0%";
  const operationalCost = dashboardStats ? dashboardStats.totalOperationalCost : 0;

  // Calculate average ROI across vehicles
  const validRois = vehiclePerformance.map((v) => v.roi || 0);
  const avgRoi = validRois.length > 0 ? (validRois.reduce((sum, item) => sum + item, 0) / validRois.length).toFixed(1) : "0.0";

  const metrics = [
    { label: "Fuel Efficiency", value: fuelEfficiency, unit: "km/l", accent: "border-l-blue-500" },
    { label: "Fleet Utilization", value: utilization, accent: "border-l-green-600" },
    { label: "Operational Cost", value: `₹${operationalCost.toLocaleString()}`, accent: "border-l-orange-500" },
    { label: "Vehicle ROI (Avg)", value: `${avgRoi}%`, accent: "border-l-red-600" },
  ];

  // Top Costliest Vehicles formatting
  const sortedVehicles = [...vehiclePerformance]
    .sort((a, b) => b.operationalCost - a.operationalCost)
    .slice(0, 3);
  
  const maxCost = Math.max(...sortedVehicles.map((v) => v.operationalCost)) || 1;
  const colors = ["bg-rose-500", "bg-orange-600", "bg-blue-500"];
  
  const costBars = sortedVehicles.map((v, i) => ({
    label: v.vehicleName || "Vehicle",
    width: `${(v.operationalCost / maxCost) * 100}%`,
    color: colors[i] || "bg-blue-500",
    cost: v.operationalCost,
  }));

  return (
    <div className="font-sans antialiased min-h-screen">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto p-8 bg-white" data-purpose="main-dashboard-area">
          <TopBar onRefresh={fetchAnalytics} loading={loading} />
          <MetricCards metrics={metrics} loading={loading} />
          
          <div className="mb-4 italic text-sm text-gray-600">
            ROI = (Revenue - Operational Cost) / Operational Cost
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-4">
            <RevenueChart revenueData={monthlyTrends.revenue || []} />
            <CostliestVehiclesChart costBars={costBars} />
          </div>
        </main>
      </div>
    </div>
  );
}