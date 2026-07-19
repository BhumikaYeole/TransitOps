import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import API from "../services/api.js";
import { toast } from "sonner";
import { LuRefreshCw, LuDownload } from "react-icons/lu";

function TopBar({ onRefresh, onExport, loading }){
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
          className="border-3 border-black p-3 bg-brand hover:bg-brand/90 disabled:opacity-50 cursor-pointer shadow-neo-sm shrink-0 flex items-center justify-center animate-none"
          title="Refresh reports"
        >
          <LuRefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
        <button
          onClick={onExport}
          className="border-3 border-black p-3 bg-green-500 hover:bg-green-600 cursor-pointer shadow-neo-sm shrink-0 flex items-center justify-center"
          title="Export CSV"
        >
          <LuDownload size={18} /> <span className="font-bold text-lg text-black"> Export CSV</span>
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
        <div key={metric.label} className={`app-card p-4 border-l-12 ${metric.accent} ${loading ? "animate-pulse" : ""}`}>
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
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [dbStatsRes, monthlyRes, performanceRes] = await Promise.all([
        API.get("/reports/dashboard"),
        API.get("/reports/trends"),
        API.get("/reports/vehicle-performance"),
      ]);

      const performanceData = performanceRes.data.data || [];
      setDashboardStats(dbStatsRes.data.data);
      setMonthlyTrends(monthlyRes.data.data);
      setVehiclePerformance(performanceData);
      if (performanceData.length > 0) {
        setSelectedVehicleId((current) => current || performanceData[0].vehicleId);
      } else {
        setSelectedVehicleId("");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load analytics reports");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const response = await API.get("/reports/export", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "text/csv",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "analytics-report.csv";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("CSV downloaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export analytics");
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchAnalytics();
    }, 0);

    return () => window.clearTimeout(timer);
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

  const selectedVehicle = vehiclePerformance.find((vehicle) => vehicle.vehicleId === selectedVehicleId) || vehiclePerformance[0] || null;

  // Top Costliest Vehicles formatting
  const sortedVehicles = [...vehiclePerformance]
    .sort((a, b) => b.operationalCost - a.operationalCost)
    .slice(0, 3);
  
  const maxCost = Math.max(...sortedVehicles.map((v) => v.operationalCost)) || 1;
  const colors = ["bg-rose-500", "bg-orange-600", "bg-blue-500"];
  
  const costBars = sortedVehicles.map((v, i) => ({
    label: v.vehicleName || v.registrationNumber || "Vehicle",
    width: `${(v.operationalCost / maxCost) * 100}%`,
    color: colors[i] || "bg-blue-500",
    cost: v.operationalCost,
  }));

  return (
    <div className="font-sans antialiased min-h-screen">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto p-8 bg-white" data-purpose="main-dashboard-area">
          <TopBar onRefresh={fetchAnalytics} onExport={exportCSV} loading={loading}/>
          <MetricCards metrics={metrics} loading={loading} />
          
          <div className="mb-4 italic text-sm text-gray-600">
            ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
          </div>

          <div className="mt-6 mb-8">
            <label className="block text-sm font-bold uppercase tracking-wide text-black mb-2" htmlFor="vehicle-select">
              Select Vehicle
            </label>
            <select
              id="vehicle-select"
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full max-w-md border-3 border-black bg-white px-4 py-3 text-sm font-semibold text-black shadow-neo-sm"
            >
              {vehiclePerformance.length === 0 ? (
                <option value="">No vehicles available</option>
              ) : (
                vehiclePerformance.map((vehicle) => (
                  <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                    {vehicle.vehicleName}
                  </option>
                ))
              )}
            </select>
          </div>

          {selectedVehicle && (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10" data-purpose="selected-vehicle-metrics">
              <div className="app-card p-4 border-l-12 border-l-blue-500">
                <p className="text-xs font-bold uppercase text-gray-600 mb-2">Selected Vehicle ROI</p>
                <p className="text-2xl font-black text-black">{selectedVehicle.roi.toFixed(1)}%</p>
              </div>
              <div className="app-card p-4 border-l-12 border-l-green-600">
                <p className="text-xs font-bold uppercase text-gray-600 mb-2">Selected Fuel Efficiency</p>
                <p className="text-2xl font-black text-black">{selectedVehicle.fuelEfficiency.toFixed(1)} km/l</p>
              </div>
              <div className="app-card p-4 border-l-12 border-l-orange-500">
                <p className="text-xs font-bold uppercase text-gray-600 mb-2">Selected Operational Cost</p>
                <p className="text-2xl font-black text-black">₹{selectedVehicle.operationalCost.toLocaleString()}</p>
              </div>
            </section>
          )}

          <section className="mb-10 border-2 border-black bg-white shadow-neo-sm" data-purpose="vehicle-performance-table">
            <div className="border-b-2 border-black bg-brand px-4 py-3">
              <h3 className="text-lg font-black uppercase tracking-wide text-black">Vehicle Metrics Overview</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-black text-xs uppercase tracking-wider border-b border-black/20">
                    <th className="py-3 px-4 font-bold">Vehicle</th>
                    <th className="py-3 px-4 font-bold">ROI</th>
                    <th className="py-3 px-4 font-bold">Fuel Efficiency</th>
                    <th className="py-3 px-4 font-bold">Operational Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {vehiclePerformance.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 px-4 text-center font-bold text-gray-500">No vehicle performance data available.</td>
                    </tr>
                  ) : (
                    vehiclePerformance.map((vehicle) => (
                      <tr key={vehicle.vehicleId} className="border-b border-black/10 hover:bg-brand/10">
                        <td className="py-3 px-4 font-bold text-black">{vehicle.vehicleName}</td>
                        <td className="py-3 px-4 font-semibold">{vehicle.roi.toFixed(1)}%</td>
                        <td className="py-3 px-4 font-semibold">{vehicle.fuelEfficiency.toFixed(1)} km/l</td>
                        <td className="py-3 px-4 font-semibold">₹{vehicle.operationalCost.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-4">
            <RevenueChart revenueData={monthlyTrends.revenue || []} />
            <CostliestVehiclesChart costBars={costBars} />
          </div>
        </main>
      </div>
    </div>
  );
}