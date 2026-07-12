import React from "react";
import {
  LuTruck,
  LuUsers,
  LuMapPin,
  LuWrench,
  LuTrendingUp,
  LuSearch,
} from "react-icons/lu";
import Sidebar from "./Sidebar";

const METRICS = [
  { label: "Active Vehicles", value: "53", accent: "border-l-blue-500", Icon: LuTruck, iconBg: "bg-blue-300" },
  { label: "Available Vehicles", value: "42", accent: "border-l-green-500", Icon: LuUsers, iconBg: "bg-green-300" },
  { label: "Maintenance", value: "05", accent: "border-l-orange-500", Icon: LuWrench, iconBg: "bg-orange-300" },
  { label: "Active Trips", value: "18", accent: "border-l-cyan-400", Icon: LuMapPin, iconBg: "bg-cyan-300" },
  { label: "Pending Trips", value: "09", accent: "border-l-gray-400", Icon: LuMapPin, iconBg: "bg-gray-300" },
  { label: "Drivers Duty", value: "26", accent: "border-l-purple-500", Icon: LuUsers, iconBg: "bg-purple-300" },
  { label: "Utilization", value: "81%", accent: "border-l-emerald-500", Icon: LuTrendingUp, iconBg: "bg-emerald-300" },
];

const TRIPS = [
  { id: "TR001", vehicle: "VAN-05", driver: "Alex", status: "On Trip", badgeClass: "bg-blue-300 text-black", eta: "45 min" },
  { id: "TR002", vehicle: "TRK-12", driver: "John", status: "Completed", badgeClass: "bg-success", eta: "—" },
  { id: "TR003", vehicle: "MINI-08", driver: "Priya", status: "Dispatched", badgeClass: "bg-info", eta: "1h 10m" },
  { id: "TR004", vehicle: "—", driver: "—", status: "Draft", badgeClass: "bg-gray-400", eta: "Awaiting vehicle", etaItalic: true },
];

const STATUS_BARS = [
  { label: "Available", width: "75%", color: "bg-green-500", tooltip: "Yash Parekh" },
  { label: "On Trip", width: "40%", color: "bg-blue-400" },
  { label: "In Shop", width: "15%", color: "bg-orange-500" },
  { label: "Retired", width: "5%", color: "bg-red-400" },
];

function TopHeader() {
  return (
    <header className="bg-white border-b-3 border-black p-4 flex justify-between items-center" data-purpose="top-navigation">
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-stretch">
          <span className="flex items-center justify-center w-11 border-3 border-r-0 border-black bg-brand shrink-0">
            <LuSearch size={18} strokeWidth={2.5} className="text-black" />
          </span>
          <input className="app-input focus:ring-0 focus:outline-none" placeholder="Search operations..." type="text" />
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <div className="text-right">
          <p className="font-bold text-sm">Raven K.</p>
          <span className="text-xs uppercase font-black text-gray-500">Dispatcher</span>
        </div>
        <div className="w-12 h-12 bg-brand border-3 border-black flex items-center justify-center font-bold text-lg shadow-neo-sm">
          RK
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

function MetricCards() {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4" data-purpose="kpi-metrics">
      {METRICS.map((metric) => (
        <div key={metric.label} className={`app-card p-4 border-l-[12px] ${metric.accent}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase text-gray-500">{metric.label}</p>
            <span className={`flex items-center justify-center w-7 h-7 shrink-0 border-2 border-black ${metric.iconBg}`}>
              <metric.Icon size={14} strokeWidth={2.5} className="text-black" />
            </span>
          </div>
          <p className="text-3xl font-black">{metric.value}</p>
        </div>
      ))}
    </section>
  );
}

function RecentTrips() {
  return (
    <section className="lg:col-span-2 space-y-4" data-purpose="trips-table-container">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black uppercase tracking-tight">Recent Trips</h2>
        <button className="border-3 border-black px-4 py-1 bg-white text-xs font-bold uppercase shadow-neo-sm">
          View All
        </button>
      </div>
      <div className="app-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 border-b-3 border-black">
            <tr>
              <th className="p-4 text-xs font-black uppercase">Trip</th>
              <th className="p-4 text-xs font-black uppercase">Vehicle</th>
              <th className="p-4 text-xs font-black uppercase">Driver</th>
              <th className="p-4 text-xs font-black uppercase">Status</th>
              <th className="p-4 text-xs font-black uppercase">ETA</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black">
            {TRIPS.map((trip) => (
              <tr key={trip.id}>
                <td className="p-4 font-bold">{trip.id}</td>
                <td className="p-4">{trip.vehicle}</td>
                <td className="p-4">{trip.driver}</td>
                <td className="p-4">
                  <span className={`app-badge ${trip.badgeClass}`}>{trip.status}</span>
                </td>
                <td className={trip.etaItalic ? "p-4 italic text-sm text-gray-500" : "p-4 font-mono text-sm"}>
                  {trip.eta}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function VehicleStatusChart() {
  return (
    <section className="space-y-4" data-purpose="status-chart-container">
      <h2 className="text-xl font-black uppercase tracking-tight">Vehicle Status</h2>
      <div className="app-card p-6 space-y-6">
        {STATUS_BARS.map((bar) => (
          <div key={bar.label} className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold uppercase">{bar.label}</span>
            </div>
            <div className="h-8 bg-gray-200 border-2 border-black relative group">
              <div className={`h-full ${bar.color} border-r-2 border-black`} style={{ width: bar.width }} />
              {bar.tooltip && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-100 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black text-white px-3 py-1 text-xs font-bold rounded relative">
                    {bar.tooltip}
                    <div className="absolute w-2 h-2 bg-black rotate-45 left-1/2 -translate-x-1/2 -bottom-1" />
                  </div>
                </div>
              )}
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
  return (
    <div className="bg-gray-50 text-black font-sans min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <TopHeader />
        <div className="p-8 space-y-8">
          <Filters />
          <MetricCards />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <RecentTrips />
            <VehicleStatusChart />
          </div>
        </div>
      </main>
    </div>
  );
}