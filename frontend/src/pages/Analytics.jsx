import React from "react";
import Sidebar from "./Sidebar";

const METRICS = [
  { label: "Fuel Efficiency", value: "8.4", unit: "km/l", accent: "border-l-blue-500" },
  { label: "Fleet Utilization", value: "81%", accent: "border-l-green-600" },
  { label: "Operational Cost", value: "34,070", accent: "border-l-orange-500" },
  { label: "Vehicle ROI", value: "14.2%", accent: "border-l-red-600" },
];

const REVENUE_BARS = [40, 60, 55, 80, 70, 95, 90];

const COST_BARS = [
  { label: "Truck-11", width: "90%", color: "bg-rose-500" },
  { label: "Mini-03", width: "40%", color: "bg-orange-600" },
  { label: "Van-05", width: "15%", color: "bg-blue-500" },
];

function TopBar() {
  return (
    <header className="flex justify-between items-center mb-8" data-purpose="top-navigation">
      <div className="w-1/3">
        <input className="app-input focus:ring-2 focus:ring-brand" placeholder="Search..." type="text" />
      </div>
      <div className="flex items-center gap-6">
        <span className="font-bold text-lg text-black">Raven K.</span>
        <div className="flex items-center gap-3 bg-brand text-black px-4 py-2 border-3 border-black font-bold shadow-neo-sm">
          <span>Dispatcher</span>
          <div className="w-8 h-8 rounded-full bg-white border-2 border-black flex items-center justify-center text-xs">
            RK
          </div>
        </div>
      </div>
    </header>
  );
}

function MetricCards() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" data-purpose="kpi-metrics">
      {METRICS.map((metric) => (
        <div key={metric.label} className={`app-card p-4 border-l-[12px] ${metric.accent}`}>
          <p className="text-xs font-bold uppercase text-gray-600 mb-2">{metric.label}</p>
          <p className="text-3xl font-black text-black">
            {metric.value} {metric.unit && <span className="text-lg">{metric.unit}</span>}
          </p>
        </div>
      ))}
    </section>
  );
}

function RevenueChart() {
  return (
    <div className="flex flex-col" data-purpose="revenue-chart-container">
      <h3 className="text-xl font-bold mb-6 uppercase tracking-wider text-black">Monthly Revenue</h3>
      <div className="flex items-end gap-3 h-48 border-b-3 border-black pb-1">
        {REVENUE_BARS.map((height, i) => (
          <div key={i} className="w-full bg-blue-500 border-2 border-black" style={{ height: `${height}%` }} />
        ))}
      </div>
    </div>
  );
}

function CostliestVehiclesChart() {
  return (
    <div className="flex flex-col" data-purpose="cost-chart-container">
      <h3 className="text-xl font-bold mb-6 uppercase tracking-wider text-black">Top Costliest Vehicles</h3>
      <div className="space-y-6">
        {COST_BARS.map((bar) => (
          <div key={bar.label} className="flex items-center">
            <span className="w-24 text-sm font-bold uppercase text-black">{bar.label}</span>
            <div className="flex-1 bg-gray-200 h-3 relative border border-black">
              <div
                className={`h-3 border-2 border-black absolute left-0 top-1/2 -translate-y-1/2 ${bar.color}`}
                style={{ width: bar.width }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Analytics() {
  return (
    <div className="font-sans antialiased min-h-screen">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto p-8 bg-white" data-purpose="main-dashboard-area">
          <TopBar />
          <MetricCards />
          <div className="mb-4 italic text-sm text-gray-600">
            ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-4">
            <RevenueChart />
            <CostliestVehiclesChart />
          </div>
        </main>
      </div>
    </div>
  );
}