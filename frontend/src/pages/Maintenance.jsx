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
    <header className="h-16 border-b-2 border-black flex items-center justify-between px-8">
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
    title: "",
    cost: "",
    openedDate: new Date().toISOString().split("T")[0],
    status: "PENDING", 
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicle || !formData.title || !formData.cost || !formData.openedDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      await API.post("/maintenance", {
        vehicle: formData.vehicle,
        title: formData.title,
        cost: Number(formData.cost),
        openedDate: new Date(formData.openedDate).toISOString(),
        status: formData.status,
        description: formData.description,
      });

      toast.success("Maintenance logged successfully");
      setFormData({
        vehicle: "",
        title: "",
        cost: "",
        openedDate: new Date().toISOString().split("T")[0],
        status: "PENDING",
        description: "",
      });
      onSave();
    } catch (err) {
      console.log(err)
      toast.error(err.response?.data?.message || "Failed to log maintenance record");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="w-full lg:w-2/5 space-y-6">
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
                {v.model} ({v.registrationNumber})
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold uppercase text-gray-700">Service Title *</label>
          <input
            className="app-input p-3 rounded"
            placeholder="e.g. Oil Change"
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
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
          <label className="text-xs font-bold uppercase text-gray-700">Date *</label>
          <input
            className="app-input p-3 rounded"
            type="date"
            required
            value={formData.openedDate}
            onChange={(e) => setFormData((prev) => ({ ...prev, openedDate: e.target.value }))}
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
            <option value="IN PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold uppercase text-gray-700">Description</label>
          <input
            className="app-input p-3 rounded"
            placeholder="Details..."
            type="text"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            disabled={saving}
          />
        </div>
        <button
          className="w-full bg-warning hover:bg-brand text-white hover:text-black font-black py-4 rounded border-3 border-black shadow-neo transition-all active:translate-x-1 active:translate-y-1 cursor-pointer disabled:opacity-50"
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Record"}
        </button>
      </form>
    </section>
  );
}

function ServiceLogTable({ records, onStatusUpdate }) {
  const getBadgeClass = (status) => {
    switch (status) {
      case "COMPLETED": return "bg-success text-white border-2 border-black";
      case "IN PROGRESS": return "bg-warning text-black border-2 border-black";
      default: return "bg-blue-300 text-black border-2 border-black";
    }
  };

  return (
    <section className="w-full lg:w-3/5 space-y-6">
      <h2 className="text-lg font-black uppercase tracking-wider text-black">Service Log</h2>
      <div className="overflow-hidden border-3 border-black shadow-neo rounded p-4 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-4 border-black text-xs text-black uppercase tracking-widest">
              <th className="pb-4">Vehicle</th>
              <th className="pb-4">Service</th>
              <th className="pb-4">Cost</th>
              <th className="pb-4">Status</th>
              <th className="pb-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y-2 divide-black/5">
            {records.map((row) => (
              <tr key={row._id}>
                <td className="py-5 font-black">{row.vehicle?.model || "—"}</td>
                <td className="py-5 font-medium">{row.title}</td>
                <td className="py-5 font-mono">₹{row.cost?.toLocaleString()}</td>
                <td className="py-5">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${getBadgeClass(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-5 text-right">
                  {row.status === "PENDING" && (
                    <button onClick={() => onStatusUpdate(row._id, "IN PROGRESS")} className="text-xs bg-warning px-2 py-1 border-2 border-black font-bold">Start</button>
                  )}
                  {row.status === "IN PROGRESS" && (
                    <button onClick={() => onStatusUpdate(row._id, "COMPLETED")} className="text-xs bg-success text-white px-2 py-1 border-2 border-black font-bold">Complete</button>
                  )}
                </td>
              </tr>
            ))}
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
      const [rec, veh] = await Promise.all([API.get("/maintenance"), API.get("/vehicles")]);
      setRecords(rec.data.data.records || []);
      setVehicles(veh.data.data || []);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    const loadRecords = async ()=>{
      fetchRecords(); 
    }
    loadRecords();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await API.put(`/maintenance/${id}`, { status: newStatus });
      fetchRecords();
    } catch (err) { toast.error("Update failed"); }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-white">
        <TopBar onRefresh={fetchRecords} loading={loading} />
        <div className="p-8 flex gap-12">
          <LogServiceForm vehicles={vehicles} onSave={fetchRecords} />
          <ServiceLogTable records={records} onStatusUpdate={handleStatusUpdate} loading={loading} />
        </div>
      </main>
    </div>
  );
}