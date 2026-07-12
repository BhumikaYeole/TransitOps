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
    <header className="h-16 border-b-2 border-black flex items-center justify-between px-8" data-purpose="top-bar">
      <div className="flex items-center w-1/3 gap-4">
        <input className="app-input px-4 py-1.5 text-sm rounded-md" placeholder="Search maintenance..." type="text" />
        <button
          onClick={onRefresh}
          disabled={loading}
          className="border-3 border-black p-2 bg-brand hover:bg-[#ffd100]/95 disabled:opacity-50 cursor-pointer shadow-neo-sm shrink-0 flex items-center justify-center"
          title="Refresh board"
        >
          <LuRefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-bold text-black">{name}</span>
        <div className="flex items-center space-x-2 bg-black/5 border-2 border-black py-1 px-3 rounded-full">
          <span className="text-xs font-bold">{role}</span>
          <div className="w-7 h-7 rounded-full bg-info border border-black flex items-center justify-center text-[10px] font-bold text-white">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}

function LogServiceForm({ vehicles, onSave }) {
  const [formData, setFormData] = useState({
    vehicle: "",
    maintenanceType: "",
    cost: "",
    scheduledDate: new Date().toISOString().split("T")[0],
    status: "PENDING",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicle || !formData.maintenanceType || !formData.cost || !formData.scheduledDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      await API.post("/maintenance", {
        vehicle: formData.vehicle,
        maintenanceType: formData.maintenanceType,
        cost: Number(formData.cost),
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
        status: formData.status,
        description: formData.description,
      });

      toast.success("Maintenance logged successfully");
      setFormData({
        vehicle: "",
        maintenanceType: "",
        cost: "",
        scheduledDate: new Date().toISOString().split("T")[0],
        status: "PENDING",
        description: "",
      });
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to log maintenance record");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="w-full lg:w-2/5 space-y-6" data-purpose="log-form-section">
      <h2 className="text-lg font-black uppercase tracking-wider text-black">Log Service Record</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold uppercase text-gray-700">Vehicle *</label>
          <select
            className="app-input p-3 rounded"
            value={formData.vehicle}
            onChange={(e) => setFormData((prev) => ({ ...prev, vehicle: e.target.value }))}
            required
            disabled={saving}
          >
            <option value="">Select Vehicle</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>
                {v.model} ({v.registrationNumber}) - {v.status}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold uppercase text-gray-700">Service Type *</label>
          <input
            className="app-input p-3 rounded"
            placeholder="e.g. Oil Change"
            type="text"
            required
            value={formData.maintenanceType}
            onChange={(e) => setFormData((prev) => ({ ...prev, maintenanceType: e.target.value }))}
            disabled={saving}
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold uppercase text-gray-700">Cost (Rs) *</label>
          <input
            className="app-input p-3 rounded"
            placeholder="2500"
            type="number"
            required
            value={formData.cost}
            onChange={(e) => setFormData((prev) => ({ ...prev, cost: e.target.value }))}
            disabled={saving}
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold uppercase text-gray-700">Scheduled Date *</label>
          <input
            className="app-input p-3 rounded"
            type="date"
            required
            value={formData.scheduledDate}
            onChange={(e) => setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))}
            disabled={saving}
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold uppercase text-gray-700">Status</label>
          <select
            className="app-input p-3 rounded"
            value={formData.status}
            onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
            disabled={saving}
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold uppercase text-gray-700">Description / Details</label>
          <input
            className="app-input p-3 rounded"
            placeholder="Add specific details or diagnosis..."
            type="text"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            disabled={saving}
          />
        </div>
        <button
          className="w-full bg-warning hover:bg-brand text-white hover:text-black font-black py-4 rounded border-3 border-black shadow-neo transition-all active:translate-x-1 active:translate-y-1 active:shadow-none mt-4 uppercase tracking-widest cursor-pointer disabled:opacity-50"
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Record"}
        </button>
      </form>

      <div className="pt-10 space-y-4 border-t-2 border-black/5" data-purpose="status-diagram">
        <div className="flex items-center space-x-4">
          <span className="text-success font-black w-20">Available</span>
          <div className="flex-1 flex items-center">
            <div className="h-[2px] bg-black flex-1 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-600 uppercase">
                Start (In Progress)
              </div>
              <div className="status-arrow absolute -right-1 -top-1.5" />
            </div>
          </div>
          <span className="text-warning font-black w-20 text-right">In Shop</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-warning font-black w-20">In Shop</span>
          <div className="flex-1 flex items-center">
            <div className="h-[2px] bg-black flex-1 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-600 uppercase">
                Resolve (Completed)
              </div>
              <div className="status-arrow absolute -right-1 -top-1.5" />
            </div>
          </div>
          <span className="text-success font-black w-20 text-right">Available</span>
        </div>
        <p className="text-xs text-warning font-bold italic mt-4">
          Note: In Shop vehicles are removed from the dispatch pool.
        </p>
      </div>
    </section>
  );
}

function ServiceLogTable({ records, onStatusUpdate, loading }) {
  const getBadgeClass = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-success text-white border-2 border-black";
      case "IN_PROGRESS":
        return "bg-warning text-black border-2 border-black";
      case "PENDING":
        return "bg-blue-300 text-black border-2 border-black";
      default:
        return "bg-gray-200 text-black";
    }
  };

  return (
    <section className="w-full lg:w-3/5 space-y-6" data-purpose="service-log-table">
      <h2 className="text-lg font-black uppercase tracking-wider text-black">Service Log</h2>
      <div className="overflow-hidden border-3 border-black shadow-neo rounded p-4 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-4 border-black text-xs text-black uppercase tracking-widest">
              <th className="pb-4 font-black">Vehicle</th>
              <th className="pb-4 font-black">Service</th>
              <th className="pb-4 font-black">Cost</th>
              <th className="pb-4 font-black">Status</th>
              <th className="pb-4 font-black text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y-2 divide-black/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-5 text-center font-bold text-gray-500 animate-pulse">Loading service logs...</td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-5 text-center font-bold text-gray-500">No maintenance records logged.</td>
              </tr>
            ) : (
              records.map((row) => (
                <tr key={row._id}>
                  <td className="py-5 font-black text-black">
                    {row.vehicle?.model || "—"} <br />
                    <span className="text-xs text-gray-600 font-mono font-medium">{row.vehicle?.registrationNumber || "—"}</span>
                  </td>
                  <td className="py-5 text-gray-800 font-medium">
                    {row.maintenanceType} <br />
                    <span className="text-[10px] text-gray-500 italic">{row.description || "No description"}</span>
                  </td>
                  <td className="py-5 text-gray-850 font-bold font-mono">₹{row.cost?.toLocaleString()}</td>
                  <td className="py-5">
                    <span className={`app-badge rounded uppercase ${getBadgeClass(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-5 text-right">
                    {row.status === "PENDING" && (
                      <button
                        onClick={() => onStatusUpdate(row._id, "IN_PROGRESS")}
                        className="bg-warning text-black text-xs font-bold py-1 px-3 border-2 border-black shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer uppercase"
                      >
                        Start
                      </button>
                    )}
                    {row.status === "IN_PROGRESS" && (
                      <button
                        onClick={() => onStatusUpdate(row._id, "COMPLETED")}
                        className="bg-success text-white text-xs font-bold py-1 px-3 border-2 border-black shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer uppercase"
                      >
                        Complete
                      </button>
                    )}
                    {row.status === "COMPLETED" && (
                      <span className="text-xs text-gray-500 font-bold">Closed</span>
                    )}
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

export default function Maintenance() {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const [recordsRes, vehiclesRes] = await Promise.all([
        API.get("/maintenance"),
        API.get("/vehicles"),
      ]);
      setRecords(recordsRes.data.data.records || []);
      setVehicles(vehiclesRes.data.data.vehicles || vehiclesRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch maintenance records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await API.put(`/maintenance/${id}`, { status: newStatus });
      toast.success(`Maintenance record status updated to ${newStatus}`);
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update maintenance status");
    }
  };

  return (
    <div className="font-sans antialiased min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col bg-white">
        <TopBar onRefresh={fetchRecords} loading={loading} />
        <div className="p-8 flex flex-col lg:flex-row gap-12 overflow-y-auto">
          <LogServiceForm vehicles={vehicles} onSave={fetchRecords} />
          <ServiceLogTable records={records} onStatusUpdate={handleStatusUpdate} loading={loading} />
        </div>
      </main>
    </div>
  );
}