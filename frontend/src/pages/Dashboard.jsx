import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LuTruck,
  LuUsers,
  LuMapPin,
  LuWrench,
  LuTrendingUp,
  LuSearch,
  LuRefreshCw,
} from "react-icons/lu";
import Sidebar from "./Sidebar";
import API from "../services/api.js";
import { toast } from "sonner";

function TopHeader({ onRefresh, loading }) {
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
    <header className="bg-white border-b-3 border-black p-4 flex justify-between items-center" data-purpose="top-navigation">
      <div className="flex-1 max-w-xl flex items-center gap-4">
        <div className="relative flex items-stretch flex-1">
          <span className="flex items-center justify-center w-11 border-3 border-r-0 border-black bg-brand shrink-0">
            <LuSearch size={18} strokeWidth={2.5} className="text-black" />
          </span>
          <input className="app-input focus:ring-0 focus:outline-none" placeholder="Search operations..." type="text" />
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="border-3 border-black p-3 bg-brand hover:bg-[#ffd100]/90 disabled:opacity-50 cursor-pointer shadow-neo-sm shrink-0 flex items-center justify-center"
          title="Refresh statistics"
        >
          <LuRefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      <div className="flex items-center space-x-6">
        <div className="text-right">
          <p className="font-bold text-sm">{name}</p>
          <span className="text-xs uppercase font-black text-gray-500">{role}</span>
        </div>
        <div className="w-12 h-12 bg-brand border-3 border-black flex items-center justify-center font-bold text-lg shadow-neo-sm">
          {initials}
        </div>
      </div>
    </header>
  );
}

function Filters() {
  return (
    <section className="flex flex-wrap gap-4" data-purpose="dashboard-filters">
      <div className="flex flex-col">
        <label className="text-xs font-black uppercase mb-1">Vehicle Type</label>
        <select className="app-input pr-10">
          <option>All Vehicles</option>
          <option>Trucks</option>
          <option>Vans</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-black uppercase mb-1">Status</label>
        <select className="app-input pr-10">
          <option>All Statuses</option>
          <option>On Trip</option>
          <option>Maintenance</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-black uppercase mb-1">Region</label>
        <select className="app-input pr-10">
          <option>All Regions</option>
          <option>North</option>
          <option>South</option>
        </select>
      </div>
    </section>
  );
}

function MetricCards({ metrics, loading }) {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4" data-purpose="kpi-metrics">
      {metrics.map((metric) => (
        <div key={metric.label} className={`app-card p-4 border-l-[12px] ${metric.accent} ${loading ? "animate-pulse" : ""}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase text-gray-500">{metric.label}</p>
            <span className={`flex items-center justify-center w-7 h-7 shrink-0 border-2 border-black ${metric.iconBg}`}>
              <metric.Icon size={14} strokeWidth={2.5} className="text-black" />
            </span>
          </div>
          <p className="text-3xl font-black">{loading ? "..." : metric.value}</p>
        </div>
      ))}
    </section>
  );
}

function RecentTrips({ trips, loading, error }) {
  const getBadgeClass = (status) => {
    switch (status) {
      case "DISPATCHED":
        return "bg-blue-300 text-black";
      case "COMPLETED":
        return "bg-success text-white";
      case "DRAFT":
        return "bg-gray-400 text-black";
      case "CANCELLED":
        return "bg-error text-white";
      default:
        return "bg-gray-400 text-black";
    }
  };

  return (
    <section className="lg:col-span-2 space-y-4" data-purpose="trips-table-container">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black uppercase tracking-tight">Recent Trips</h2>
        <Link to="/trips" className="border-3 border-black px-4 py-1 bg-white text-xs font-bold uppercase shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
          View All
        </Link>
      </div>
      <div className="app-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 border-b-3 border-black">
            <tr>
              <th className="p-4 text-xs font-black uppercase border-r-2 border-black">Trip</th>
              <th className="p-4 text-xs font-black uppercase border-r-2 border-black">Vehicle</th>
              <th className="p-4 text-xs font-black uppercase border-r-2 border-black">Driver</th>
              <th className="p-4 text-xs font-black uppercase border-r-2 border-black">Status</th>
              <th className="p-4 text-xs font-black uppercase">Planned Dist.</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-4 border-r-2 border-black font-bold">...</td>
                  <td className="p-4 border-r-2 border-black">...</td>
                  <td className="p-4 border-r-2 border-black">...</td>
                  <td className="p-4 border-r-2 border-black"><span className="app-badge bg-gray-200 text-gray-200">...</span></td>
                  <td className="p-4">...</td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-error font-bold bg-error/10">
                  {error}
                </td>
              </tr>
            ) : trips.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 font-bold">
                  No recent trips found
                </td>
              </tr>
            ) : (
              trips.map((trip) => (
                <tr key={trip._id}>
                  <td className="p-4 font-mono text-sm border-r-2 border-black font-bold">
                    {trip._id.substring(trip._id.length - 6).toUpperCase()}
                  </td>
                  <td className="p-4 border-r-2 border-black font-medium">
                    {trip.vehicle?.model || trip.vehicle?.registrationNumber || "—"}
                  </td>
                  <td className="p-4 border-r-2 border-black font-medium">
                    {trip.driver?.user?.name || "—"}
                  </td>
                  <td className="p-4 border-r-2 border-black">
                    <span className={`app-badge ${getBadgeClass(trip.status)}`}>{trip.status}</span>
                  </td>
                  <td className="p-4 font-mono text-sm font-bold">
                    {trip.plannedDistance} km
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function VehicleStatusChart({ statusBars, loading }) {
  return (
    <section className="space-y-4" data-purpose="status-chart-container">
      <h2 className="text-xl font-black uppercase tracking-tight">Vehicle Status</h2>
      <div className="app-card p-6 space-y-6">
        {statusBars.map((bar) => (
          <div key={bar.label} className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold uppercase">{bar.label}</span>
              <span className="text-xs font-bold text-gray-500">{loading ? "..." : `${bar.count} units`}</span>
            </div>
            <div className="h-8 bg-gray-200 border-2 border-black relative group">
              <div className={`h-full ${bar.color} border-r-2 border-black transition-all duration-500`} style={{ width: loading ? "0%" : bar.width }} />
            </div>
          </div>
        ))}
      </div>

      <div className="app-card p-4 bg-brand">
        <p className="font-bold text-sm">System Status: Optimal</p>
        <p className="text-xs">No critical alerts detected in the last 24 hours.</p>
      </div>
    </section>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, tripsRes, vehiclesRes, driversRes] = await Promise.all([
        API.get("/reports/dashboard"),
        API.get("/trips?limit=10"),
        API.get("/vehicles"),
        API.get("/drivers"),
      ]);

      setStats(statsRes.data.data);
      setTrips(tripsRes.data.data.trips || []);
      setVehicles(vehiclesRes.data.data.vehicles || []);
      setDrivers(driversRes.data.data.drivers || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data. Please try again.");
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeVehiclesCount = vehicles.filter((v) => v.status === "ON_TRIP").length;
  const availableVehiclesCount = stats?.availableVehicles ?? vehicles.filter((v) => v.status === "AVAILABLE").length;
  const maintenanceCount = stats?.vehiclesInMaintenance ?? vehicles.filter((v) => v.status === "IN_SHOP").length;
  const activeTripsCount = stats?.activeTrips ?? trips.filter((t) => t.status === "DISPATCHED").length;
  const pendingTripsCount = trips.filter((t) => t.status === "DRAFT").length;
  const driversDutyCount = drivers.filter((d) => ["AVAILABLE", "ON_TRIP"].includes(d.status)).length;
  const utilizationRate = stats ? `${Math.round(stats.fleetUtilization)}%` : "0%";

  const metrics = [
    { label: "Active Vehicles", value: activeVehiclesCount, accent: "border-l-blue-500", Icon: LuTruck, iconBg: "bg-blue-300" },
    { label: "Available Vehicles", value: availableVehiclesCount, accent: "border-l-green-500", Icon: LuUsers, iconBg: "bg-green-300" },
    { label: "Maintenance", value: maintenanceCount, accent: "border-l-orange-500", Icon: LuWrench, iconBg: "bg-orange-300" },
    { label: "Active Trips", value: activeTripsCount, accent: "border-l-cyan-400", Icon: LuMapPin, iconBg: "bg-cyan-300" },
    { label: "Pending Trips", value: pendingTripsCount, accent: "border-l-gray-400", Icon: LuMapPin, iconBg: "bg-gray-300" },
    { label: "Drivers Duty", value: driversDutyCount, accent: "border-l-purple-500", Icon: LuUsers, iconBg: "bg-purple-300" },
    { label: "Utilization", value: utilizationRate, accent: "border-l-emerald-500", Icon: LuTrendingUp, iconBg: "bg-emerald-300" },
  ];

  const totalVehiclesCount = vehicles.length || 1;
  const retiredVehiclesCount = vehicles.filter((v) => v.status === "RETIRED").length;

  const statusBars = [
    { label: "Available", width: `${(availableVehiclesCount / totalVehiclesCount) * 100}%`, color: "bg-green-500", count: availableVehiclesCount },
    { label: "On Trip", width: `${(activeVehiclesCount / totalVehiclesCount) * 100}%`, color: "bg-blue-400", count: activeVehiclesCount },
    { label: "In Shop", width: `${(maintenanceCount / totalVehiclesCount) * 100}%`, color: "bg-orange-500", count: maintenanceCount },
    { label: "Retired", width: `${(retiredVehiclesCount / totalVehiclesCount) * 100}%`, color: "bg-red-400", count: retiredVehiclesCount },
  ];

  return (
    <div className="bg-gray-50 text-black font-sans min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <TopHeader onRefresh={fetchData} loading={loading} />
        <div className="p-8 space-y-8">
          <Filters />
          <MetricCards metrics={metrics} loading={loading} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <RecentTrips trips={trips.slice(0, 5)} loading={loading} error={error} />
            <VehicleStatusChart statusBars={statusBars} loading={loading} />
          </div>
        </div>
      </main>
    </div>
  );
}