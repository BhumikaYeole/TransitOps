import React, { useState, useEffect } from "react";
import { LuPlus, LuSearch, LuPen, LuTrash2, LuRefreshCw, LuChevronLeft, LuChevronRight, LuX } from "react-icons/lu";
import Sidebar from "./Sidebar";
import API from "../services/api.js";
import { toast } from "sonner";

function TopHeader({ searchTerm, setSearchTerm }) {
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
    <header className="p-6 border-b-2 border-black flex justify-between items-center bg-white" data-purpose="top-header">
      <div className="flex-1 max-w-md relative">
        <LuSearch size={16} strokeWidth={2.5} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black" />
        <input
          className="app-input text-sm pl-9"
          data-purpose="global-search"
          placeholder="Search vehicles by name/model or reg no..."
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold text-black">{name}</span>
        <div className="flex items-center gap-2 border-2 border-black p-1 pl-3 bg-info shadow-neo-sm">
          <span className="text-xs font-bold text-white">{role}</span>
          <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center text-black font-bold">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}

function VehicleModal({ isOpen, onClose, onSave, vehicle = null }) {
  const [formData, setFormData] = useState({
    registrationNumber: "",
    model: "",
    type: "truck",
    maxLoadCapacity: "",
    odometer: "0",
    acquisitionCost: "",
    region: "",
    status: "AVAILABLE",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (vehicle) {
      setFormData({
        registrationNumber: vehicle.registrationNumber || "",
        model: vehicle.model || "",
        type: vehicle.type || "truck",
        maxLoadCapacity: vehicle.maxLoadCapacity || "",
        odometer: vehicle.odometer || "0",
        acquisitionCost: vehicle.acquisitionCost || "",
        region: vehicle.region || "",
        status: vehicle.status || "AVAILABLE",
      });
    } else {
      setFormData({
        registrationNumber: "",
        model: "",
        type: "truck",
        maxLoadCapacity: "",
        odometer: "0",
        acquisitionCost: "",
        region: "",
        status: "AVAILABLE",
      });
    }
    setError("");
  }, [vehicle, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.registrationNumber || !formData.model || !formData.type || !formData.maxLoadCapacity || !formData.acquisitionCost) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      ...formData,
      maxLoadCapacity: Number(formData.maxLoadCapacity),
      odometer: Number(formData.odometer),
      acquisitionCost: Number(formData.acquisitionCost),
    };

    try {
      if (vehicle) {
        await API.put(`/vehicles/${vehicle._id}`, payload);
        toast.success("Vehicle updated successfully");
      } else {
        await API.post("/vehicles", payload);
        toast.success("Vehicle added successfully");
      }
      onSave();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "An error occurred while saving the vehicle.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black p-6 w-full max-w-lg shadow-neo relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-black hover:text-gray-600 cursor-pointer">
          <LuX size={24} strokeWidth={3} />
        </button>

        <h2 className="text-2xl font-black uppercase mb-6 italic">
          {vehicle ? "Edit Vehicle" : "Add New Vehicle"}
        </h2>

        {error && (
          <div className="p-3 border-2 border-error bg-error/10 text-error text-sm font-bold mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-black uppercase mb-1">Registration No. *</label>
              <input
                className="app-input text-sm p-2"
                name="registrationNumber"
                type="text"
                required
                placeholder="GJ01AB1234"
                value={formData.registrationNumber}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-black uppercase mb-1">Model Name *</label>
              <input
                className="app-input text-sm p-2"
                name="model"
                type="text"
                required
                placeholder="Tata Ultra"
                value={formData.model}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-black uppercase mb-1">Vehicle Type *</label>
              <select
                className="app-input text-sm p-2"
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="truck">Truck</option>
                <option value="van">Van</option>
                <option value="bike">Bike</option>
                <option value="car">Car</option>
                <option value="bus">Bus</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-black uppercase mb-1">Max Load (KG) *</label>
              <input
                className="app-input text-sm p-2"
                name="maxLoadCapacity"
                type="number"
                required
                placeholder="5000"
                value={formData.maxLoadCapacity}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-black uppercase mb-1">Odometer Reading (KM)</label>
              <input
                className="app-input text-sm p-2"
                name="odometer"
                type="number"
                placeholder="0"
                value={formData.odometer}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-black uppercase mb-1">Acquisition Cost (Rs) *</label>
              <input
                className="app-input text-sm p-2"
                name="acquisitionCost"
                type="number"
                required
                placeholder="1500000"
                value={formData.acquisitionCost}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-black uppercase mb-1">Region</label>
              <input
                className="app-input text-sm p-2"
                name="region"
                type="text"
                placeholder="Ahmedabad"
                value={formData.region}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-black uppercase mb-1">Status</label>
              <select
                className="app-input text-sm p-2"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="AVAILABLE">Available</option>
                <option value="ON_TRIP">On Trip</option>
                <option value="IN_SHOP">In Shop</option>
                <option value="RETIRED">Retired</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={onClose}
              type="button"
              className="flex-1 py-3 border-3 border-black text-black font-bold uppercase hover:bg-gray-100 transition-all cursor-pointer text-center"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed uppercase"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Registry() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Sorting
  const [sortField, setSortField] = useState("registrationNumber");
  const [sortOrder, setSortOrder] = useState("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/vehicles");
      setVehicles(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load vehicles list. Please reload.");
      toast.error("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await API.delete(`/vehicles/${id}`);
      toast.success("Vehicle deleted successfully");
      fetchVehicles();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete vehicle");
    }
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedVehicle(null);
    setIsModalOpen(true);
  };

  // Filtered & Sorted list
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.region?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "All" || v.type?.toLowerCase() === typeFilter.toLowerCase();
    const matchesStatus = statusFilter === "All" || v.status?.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    let fieldA = a[sortField];
    let fieldB = b[sortField];

    if (typeof fieldA === "string") {
      fieldA = fieldA.toLowerCase();
      fieldB = fieldB.toLowerCase();
    }

    if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Paginated list
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedVehicles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedVehicles.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "AVAILABLE":
        return "bg-success text-white";
      case "ON_TRIP":
        return "bg-info text-white";
      case "IN_SHOP":
        return "bg-warning text-white";
      case "RETIRED":
        return "bg-error text-white";
      default:
        return "bg-gray-400 text-black";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white text-black font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        <TopHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <div className="p-8 overflow-y-auto flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8" data-purpose="filter-controls">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-black">Type:</label>
                <select
                  className="app-input text-sm min-w-[120px]"
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="All">All Types</option>
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="bike">Bike</option>
                  <option value="car">Car</option>
                  <option value="bus">Bus</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-black">Status:</label>
                <select
                  className="app-input text-sm min-w-[120px]"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="ON_TRIP">On Trip</option>
                  <option value="IN_SHOP">In Shop</option>
                  <option value="RETIRED">Retired</option>
                </select>
              </div>

              <button
                onClick={fetchVehicles}
                disabled={loading}
                className="border-3 border-black p-2.5 bg-white hover:bg-gray-100 disabled:opacity-50 cursor-pointer shadow-neo-sm shrink-0 flex items-center justify-center"
                title="Refresh vehicles list"
              >
                <LuRefreshCw size={18} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            <button onClick={handleAdd} className="btn-primary flex items-center gap-2" data-purpose="add-vehicle-btn">
              <LuPlus size={20} strokeWidth={3} />
              Add Vehicle
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border-3 border-black shadow-neo" data-purpose="vehicle-table-container">
            <table className="w-full text-left border-collapse bg-white" id="vehicle-registry-table">
              <thead>
                <tr className="border-b-2 border-black bg-gray-100">
                  <th
                    onClick={() => handleSort("registrationNumber")}
                    className="p-4 text-xs font-bold uppercase tracking-widest text-black border-r-2 border-black cursor-pointer hover:bg-gray-200 select-none"
                  >
                    Reg. No. {sortField === "registrationNumber" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("model")}
                    className="p-4 text-xs font-bold uppercase tracking-widest text-black border-r-2 border-black cursor-pointer hover:bg-gray-200 select-none"
                  >
                    Name/Model {sortField === "model" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("type")}
                    className="p-4 text-xs font-bold uppercase tracking-widest text-black border-r-2 border-black cursor-pointer hover:bg-gray-200 select-none"
                  >
                    Type {sortField === "type" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("maxLoadCapacity")}
                    className="p-4 text-xs font-bold uppercase tracking-widest text-black border-r-2 border-black cursor-pointer hover:bg-gray-200 select-none"
                  >
                    Capacity {sortField === "maxLoadCapacity" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("odometer")}
                    className="p-4 text-xs font-bold uppercase tracking-widest text-black border-r-2 border-black cursor-pointer hover:bg-gray-200 select-none"
                  >
                    Odometer {sortField === "odometer" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("acquisitionCost")}
                    className="p-4 text-xs font-bold uppercase tracking-widest text-black border-r-2 border-black cursor-pointer hover:bg-gray-200 select-none"
                  >
                    Acq. Cost {sortField === "acquisitionCost" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="p-4 text-xs font-bold uppercase tracking-widest text-black border-r-2 border-black cursor-pointer hover:bg-gray-200 select-none"
                  >
                    Status {sortField === "status" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-black">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4 border-r-2 border-black font-bold">...</td>
                      <td className="p-4 border-r-2 border-black">...</td>
                      <td className="p-4 border-r-2 border-black">...</td>
                      <td className="p-4 border-r-2 border-black">...</td>
                      <td className="p-4 border-r-2 border-black">...</td>
                      <td className="p-4 border-r-2 border-black">...</td>
                      <td className="p-4 border-r-2 border-black"><span className="app-badge bg-gray-200 text-gray-200">...</span></td>
                      <td className="p-4">...</td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-error font-bold bg-error/10">
                      {error}
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500 font-bold">
                      No vehicles found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((vehicle) => (
                    <tr key={vehicle._id} className="hover:bg-brand/10 transition-colors">
                      <td className="p-4 font-mono font-bold border-r-2 border-black uppercase">{vehicle.registrationNumber}</td>
                      <td className="p-4 font-medium border-r-2 border-black">{vehicle.model}</td>
                      <td className="p-4 border-r-2 border-black capitalize">{vehicle.type}</td>
                      <td className="p-4 border-r-2 border-black">{vehicle.maxLoadCapacity.toLocaleString()} kg</td>
                      <td className="p-4 border-r-2 border-black">{vehicle.odometer.toLocaleString()} km</td>
                      <td className="p-4 border-r-2 border-black">₹{vehicle.acquisitionCost.toLocaleString()}</td>
                      <td className="p-4 border-r-2 border-black">
                        <span className={`app-badge ${getStatusBadge(vehicle.status)}`}>{vehicle.status}</span>
                      </td>
                      <td className="p-4 flex gap-2">
                        <button
                          onClick={() => handleEdit(vehicle)}
                          className="p-1 border-2 border-black bg-brand hover:bg-[#ffd100]/90 cursor-pointer shadow-neo-sm"
                          title="Edit vehicle"
                        >
                          <LuPen size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle._id)}
                          className="p-1 border-2 border-black bg-error hover:bg-error/90 text-white cursor-pointer shadow-neo-sm"
                          title="Delete vehicle"
                        >
                          <LuTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <span className="text-sm font-bold">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedVehicles.length)} of {sortedVehicles.length} vehicles
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border-3 border-black bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-neo-sm cursor-pointer"
                >
                  <LuChevronLeft size={18} strokeWidth={3} />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border-3 border-black bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-neo-sm cursor-pointer"
                >
                  <LuChevronRight size={18} strokeWidth={3} />
                </button>
              </div>
            </div>
          )}

          <div className="mt-8">
            <p className="text-black text-sm font-bold bg-warning/20 p-2 border-2 border-black inline-block">
              <span className="text-error">Rule:</span> Registration No. must be unique • Retired/In
              Shop vehicles are hidden from Trip Dispatcher
            </p>
          </div>
        </div>
      </main>

      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchVehicles}
        vehicle={selectedVehicle}
      />
    </div>
  );
}