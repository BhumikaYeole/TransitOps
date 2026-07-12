import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import API from "../services/api.js";
import { toast } from "sonner";
import { LuRefreshCw, LuX, LuSearch } from "react-icons/lu";

function FuelModal({ isOpen, onClose, onSave, vehicles }) {
  const [formData, setFormData] = useState({
    vehicle: "",
    liters: "",
    cost: "",
    odometer: "",
    date: "",
    fuelStation: "",
    remarks: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData({
      vehicle: "",
      liters: "",
      cost: "",
      odometer: "",
      date: new Date().toISOString().split("T")[0],
      fuelStation: "",
      remarks: "",
    });
    setError("");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicle || !formData.liters || !formData.cost || !formData.odometer) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      ...formData,
      liters: Number(formData.liters),
      cost: Number(formData.cost),
      odometer: Number(formData.odometer),
      date: new Date(formData.date).toISOString(),
    };

    try {
      await API.post("/fuel", payload);
      toast.success("Fuel log recorded successfully");
      onSave();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to log fuel entry.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black p-6 w-full max-w-md shadow-neo relative text-black">
        <button onClick={onClose} className="absolute right-4 top-4 text-black hover:text-gray-600 cursor-pointer">
          <LuX size={24} strokeWidth={3} />
        </button>

        <h2 className="text-xl font-black uppercase mb-4 italic">Log Fuel Entry</h2>
        {error && <div className="p-3 border-2 border-error bg-error/10 text-error text-xs font-bold mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase mb-1">Vehicle *</label>
            <select
              className="app-input text-sm p-2"
              name="vehicle"
              value={formData.vehicle}
              onChange={handleChange}
              required
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.model} ({v.registrationNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase mb-1">Fuel Quantity (Liters) *</label>
              <input
                className="app-input text-sm p-2"
                name="liters"
                type="number"
                step="0.01"
                required
                value={formData.liters}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase mb-1">Fuel Cost (Rs) *</label>
              <input
                className="app-input text-sm p-2"
                name="cost"
                type="number"
                required
                value={formData.cost}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase mb-1">Odometer (KM) *</label>
              <input
                className="app-input text-sm p-2"
                name="odometer"
                type="number"
                required
                value={formData.odometer}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase mb-1">Date *</label>
              <input
                className="app-input text-sm p-2"
                name="date"
                type="date"
                required
                value={formData.date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={onClose}
              type="button"
              className="flex-1 py-3 border-3 border-black text-black font-bold uppercase hover:bg-gray-100 transition-all cursor-pointer"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 btn-primary disabled:opacity-50 uppercase"
              disabled={saving}
            >
              {saving ? "Logging..." : "Log Fuel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ExpenseModal({ isOpen, onClose, onSave, vehicles }) {
  const [formData, setFormData] = useState({
    vehicle: "",
    category: "Fuel",
    amount: "",
    date: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData({
      vehicle: "",
      category: "Fuel",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
    setError("");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicle || !formData.category || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      date: new Date(formData.date).toISOString(),
    };

    try {
      await API.post("/expenses", payload);
      toast.success("Expense logged successfully");
      onSave();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to log expense.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black p-6 w-full max-w-md shadow-neo relative text-black">
        <button onClick={onClose} className="absolute right-4 top-4 text-black hover:text-gray-600 cursor-pointer">
          <LuX size={24} strokeWidth={3} />
        </button>

        <h2 className="text-xl font-black uppercase mb-4 italic">Add Expense Record</h2>
        {error && <div className="p-3 border-2 border-error bg-error/10 text-error text-xs font-bold mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase mb-1">Vehicle *</label>
            <select
              className="app-input text-sm p-2"
              name="vehicle"
              value={formData.vehicle}
              onChange={handleChange}
              required
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.model} ({v.registrationNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase mb-1">Category *</label>
              <select
                className="app-input text-sm p-2"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="Fuel">Fuel</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Toll">Toll</option>
                <option value="Insurance">Insurance</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase mb-1">Amount (Rs) *</label>
              <input
                className="app-input text-sm p-2"
                name="amount"
                type="number"
                required
                value={formData.amount}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase mb-1">Date *</label>
              <input
                className="app-input text-sm p-2"
                name="date"
                type="date"
                required
                value={formData.date}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase mb-1">Description</label>
              <input
                className="app-input text-sm p-2"
                name="description"
                type="text"
                placeholder="Toll tax at NH-8"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={onClose}
              type="button"
              className="flex-1 py-3 border-3 border-black text-black font-bold uppercase hover:bg-gray-100 transition-all cursor-pointer"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 btn-primary disabled:opacity-50 uppercase"
              disabled={saving}
            >
              {saving ? "Saving..." : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FuelExpenses() {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const [fuelRes, expensesRes, vehiclesRes] = await Promise.all([
        API.get("/fuel"),
        API.get("/expenses"),
        API.get("/vehicles"),
      ]);
      setFuelLogs(fuelRes.data.data.logs || []);
      setExpenses(expensesRes.data.data.expenses || []);
      setVehicles(vehiclesRes.data.data.vehicles || vehiclesRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load operations logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const totalFuelCost = fuelLogs.reduce((sum, item) => sum + (item.cost || 0), 0);
  const totalExpenseCost = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalCost = totalFuelCost + totalExpenseCost;

  // Filters
  const filteredFuelLogs = fuelLogs.filter((log) => {
    const reg = log.vehicle?.registrationNumber || "";
    const model = log.vehicle?.model || "";
    return reg.toLowerCase().includes(searchTerm.toLowerCase()) || model.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredExpenses = expenses.filter((exp) => {
    const reg = exp.vehicle?.registrationNumber || "";
    const model = exp.vehicle?.model || "";
    const desc = exp.description || "";
    const cat = exp.category || "";
    return (
      reg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="bg-white text-black font-sans min-h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8 bg-white" data-purpose="main-dashboard-area">
          <div className="mb-8 flex items-center gap-4 max-w-xl">
            <div className="relative flex items-stretch flex-1">
              <span className="flex items-center justify-center w-11 border-3 border-r-0 border-black bg-brand shrink-0">
                <LuSearch size={18} strokeWidth={2.5} className="text-black" />
              </span>
              <input
                className="app-input text-sm focus:ring-0 focus:outline-none"
                placeholder="Search by vehicle registration, model, or category..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="border-3 border-black p-3 bg-brand hover:bg-[#ffd100]/90 disabled:opacity-50 cursor-pointer shadow-neo-sm shrink-0 flex items-center justify-center"
              title="Refresh lists"
            >
              <LuRefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Fuel logs table */}
          <section className="mb-12" data-purpose="fuel-logs-container">
            <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
              <h2 className="text-xl font-bold uppercase tracking-wide text-black italic">Fuel Logs</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsFuelModalOpen(true)}
                  className="bg-warning hover:bg-brand hover:text-black text-white font-bold py-2 px-6 border-2 border-black shadow-neo uppercase tracking-wide transition-all transform active:translate-y-1 active:shadow-none cursor-pointer"
                >
                  + Log Fuel
                </button>
                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="bg-warning hover:bg-brand hover:text-black text-white font-bold py-2 px-6 border-2 border-black shadow-neo uppercase tracking-wide transition-all transform active:translate-y-1 active:shadow-none cursor-pointer"
                >
                  + Add Expense
                </button>
              </div>
            </div>
            <div className="border-t-2 border-black overflow-x-auto">
              <table className="w-full text-left border-collapse" data-purpose="fuel-logs-table">
                <thead>
                  <tr className="text-black text-xs uppercase tracking-wider border-b-2 border-black">
                    <th className="py-4 font-bold border-r border-black/10">Vehicle</th>
                    <th className="py-4 font-bold border-r border-black/10">Date</th>
                    <th className="py-4 font-bold border-r border-black/10">Liters Quantity</th>
                    <th className="py-4 font-bold border-r border-black/10">Odometer</th>
                    <th className="py-4 font-bold">Fuel Cost</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center font-bold text-gray-500 animate-pulse">Loading fuel logs...</td>
                    </tr>
                  ) : filteredFuelLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center font-bold text-gray-500">No fuel records logged.</td>
                    </tr>
                  ) : (
                    filteredFuelLogs.map((log) => (
                      <tr key={log._id} className="border-b border-black hover:bg-brand/5">
                        <td className="py-4 font-bold border-r border-black/10">
                          {log.vehicle?.model || "—"} ({log.vehicle?.registrationNumber || "—"})
                        </td>
                        <td className="py-4 border-r border-black/10">{new Date(log.date).toLocaleDateString()}</td>
                        <td className="py-4 border-r border-black/10">{log.liters.toLocaleString()} L</td>
                        <td className="py-4 border-r border-black/10">{log.odometer?.toLocaleString()} km</td>
                        <td className="py-4 font-bold font-mono">₹{log.cost.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Expenses table */}
          <section className="mb-8" data-purpose="other-expenses-container">
            <h2 className="text-xl font-bold uppercase tracking-wide text-black mb-6 italic">General Expenses (Toll / Insurance / Misc)</h2>
            <div className="border-t-2 border-black overflow-x-auto">
              <table className="w-full text-left border-collapse" data-purpose="expenses-table">
                <thead>
                  <tr className="text-black text-xs uppercase tracking-wider border-b-2 border-black">
                    <th className="py-4 font-bold border-r border-black/10">Vehicle</th>
                    <th className="py-4 font-bold border-r border-black/10">Date</th>
                    <th className="py-4 font-bold border-r border-black/10">Category</th>
                    <th className="py-4 font-bold border-r border-black/10">Description</th>
                    <th className="py-4 font-bold">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center font-bold text-gray-500 animate-pulse">Loading general expenses...</td>
                    </tr>
                  ) : filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center font-bold text-gray-500">No expenses recorded.</td>
                    </tr>
                  ) : (
                    filteredExpenses.map((row) => (
                      <tr key={row._id} className="border-b border-black hover:bg-brand/5">
                        <td className="py-4 font-bold border-r border-black/10">
                          {row.vehicle?.model || "—"} ({row.vehicle?.registrationNumber || "—"})
                        </td>
                        <td className="py-4 border-r border-black/10">{new Date(row.date).toLocaleDateString()}</td>
                        <td className="py-4 border-r border-black/10">
                          <span className="app-badge bg-brand text-black border border-black rounded normal-case px-2 py-0.5">{row.category}</span>
                        </td>
                        <td className="py-4 border-r border-black/10 italic text-gray-600">{row.description || "—"}</td>
                        <td className="py-4 font-bold font-mono">₹{row.amount.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="mt-8 pt-4 border-t-2 border-black flex justify-between items-center" data-purpose="summary-costs">
            <div className="text-sm font-bold text-black uppercase">Total Operational Cost (Auto) = Fuel + Expenses</div>
            <div className="text-3xl font-bold text-warning underline decoration-2 decoration-black">
              ₹{totalCost.toLocaleString()}
            </div>
          </footer>
        </main>
      </div>

      <FuelModal
        isOpen={isFuelModalOpen}
        onClose={() => setIsFuelModalOpen(false)}
        onSave={fetchLogs}
        vehicles={vehicles}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={fetchLogs}
        vehicles={vehicles}
      />
    </div>
  );
}