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
    <header className="p-6 border-b-2 border-black flex items-center justify-between" data-purpose="top-navigation">
      <div className="relative w-1/3">
        <LuSearch size={16} strokeWidth={2.5} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black" />
        <input
          className="app-input text-sm pl-9 rounded-md shadow-neo-sm"
          placeholder="Search drivers by name or license..."
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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

function DriverModal({ isOpen, onClose, onSave, driver = null }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    licenseNumber: "",
    licenseCategory: "LMV",
    licenseExpiry: "",
    contactNumber: "",
    safetyScore: "100",
    status: "AVAILABLE",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.user?.name || "",
        email: driver.user?.email || "",
        password: "",
        licenseNumber: driver.licenseNumber || "",
        licenseCategory: driver.licenseCategory || "LMV",
        licenseExpiry: driver.licenseExpiry ? new Date(driver.licenseExpiry).toISOString().split("T")[0] : "",
        contactNumber: driver.contactNumber || "",
        safetyScore: String(driver.safetyScore ?? 100),
        status: driver.status || "AVAILABLE",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "driverpassword123",
        licenseNumber: "",
        licenseCategory: "LMV",
        licenseExpiry: "",
        contactNumber: "",
        safetyScore: "100",
        status: "AVAILABLE",
      });
    }
    setError("");
  }, [driver, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.licenseNumber || !formData.licenseCategory || !formData.licenseExpiry || !formData.contactNumber) {
      toast.error("Please fill in all required driver details");
      return;
    }

    setSaving(true);
    setError("");

    try {
      let userId = driver?.user?._id;

      // 1. Create a new User record for driver if it is a new driver creation
      if (!driver) {
        if (!formData.name || !formData.email || !formData.password) {
          toast.error("Name, email and password are required to register a driver profile");
          setSaving(false);
          return;
        }

        const signupRes = await API.post("/auth/sign-up", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "Driver",
        });
        userId = signupRes.data.data.user._id;
      }

      // 2. Submit driver CRUD payload
      const driverPayload = {
        user: userId,
        licenseNumber: formData.licenseNumber,
        licenseCategory: formData.licenseCategory,
        licenseExpiry: new Date(formData.licenseExpiry).toISOString(),
        contactNumber: formData.contactNumber,
        safetyScore: Number(formData.safetyScore),
        status: formData.status,
      };

      if (driver) {
        await API.put(`/drivers/${driver._id}`, driverPayload);
        toast.success("Driver updated successfully");
      } else {
        await API.post("/drivers", driverPayload);
        toast.success("Driver registered successfully");
      }
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to save driver profile.";
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
          {driver ? "Edit Driver Details" : "Register New Driver"}
        </h2>

        {error && (
          <div className="p-3 border-2 border-error bg-error/10 text-error text-sm font-bold mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!driver && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-black uppercase mb-1">Driver Name *</label>
                  <input
                    className="app-input text-sm p-2"
                    name="name"
                    type="text"
                    required
                    placeholder="Alex Mercer"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-black uppercase mb-1">Email *</label>
                  <input
                    className="app-input text-sm p-2"
                    name="email"
                    type="email"
                    required
                    placeholder="alex@transitops.in"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-black uppercase mb-1">Login Password *</label>
                <input
                  className="app-input text-sm p-2"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>
            </>
          )}

          {driver && (
            <div className="bg-gray-100 p-3 border-2 border-black mb-2">
              <p className="text-sm font-bold">Driver: {formData.name}</p>
              <p className="text-xs text-gray-600">Email: {formData.email}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-black uppercase mb-1">License No. *</label>
              <input
                className="app-input text-sm p-2"
                name="licenseNumber"
                type="text"
                required
                placeholder="DL-88213"
                value={formData.licenseNumber}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-black uppercase mb-1">License Category *</label>
              <select
                className="app-input text-sm p-2"
                name="licenseCategory"
                value={formData.licenseCategory}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="LMV">LMV (Light Motor Vehicle)</option>
                <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                <option value="MCWG">MCWG (Motorcycle with Gear)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-black uppercase mb-1">License Expiry *</label>
              <input
                className="app-input text-sm p-2"
                name="licenseExpiry"
                type="date"
                required
                value={formData.licenseExpiry}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-black uppercase mb-1">Contact No. *</label>
              <input
                className="app-input text-sm p-2"
                name="contactNumber"
                type="text"
                required
                placeholder="9876543210"
                value={formData.contactNumber}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-black uppercase mb-1">Safety Score (0-100)</label>
              <input
                className="app-input text-sm p-2"
                name="safetyScore"
                type="number"
                min="0"
                max="100"
                value={formData.safetyScore}
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
                <option value="OFF_DUTY">Off Duty</option>
                <option value="SUSPENDED">Suspended</option>
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
              {saving ? "Saving..." : "Save Driver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Sorting
  const [sortField, setSortField] = useState("safetyScore");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const fetchDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/drivers");
      setDrivers(res.data.data.drivers || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load driver profiles. Please reload.");
      toast.error("Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this driver profile?")) return;
    try {
      await API.delete(`/drivers/${id}`);
      toast.success("Driver record removed successfully");
      fetchDrivers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to remove driver profile");
    }
  };

  const handleEdit = (driver) => {
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedDriver(null);
    setIsModalOpen(true);
  };

  // Filtered & Sorted lists
  const filteredDrivers = drivers.filter((d) => {
    const name = d.user?.name || "";
    const license = d.licenseNumber || "";
    const contact = d.contactNumber || "";

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || d.status?.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const sortedDrivers = [...filteredDrivers].sort((a, b) => {
    let fieldA = sortField === "name" ? a.user?.name || "" : a[sortField];
    let fieldB = sortField === "name" ? b.user?.name || "" : b[sortField];

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
  const currentItems = sortedDrivers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedDrivers.length / itemsPerPage);

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
        return "bg-green-400";
      case "ON_TRIP":
        return "bg-blue-400";
      case "OFF_DUTY":
        return "bg-gray-400";
      case "SUSPENDED":
        return "bg-orange-400";
      default:
        return "bg-gray-400";
    }
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) <= new Date();
  };

  return (
    <div className="font-sans antialiased min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 bg-white" data-purpose="main-content-area">
        <TopHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <div className="p-8 space-y-8 overflow-auto flex-1">
          <div className="flex justify-between items-end flex-wrap gap-4">
            <h1 className="text-3xl font-bold italic text-black">Drivers &amp; Safety Profiles</h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-black">Filter Status:</label>
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
                  <option value="OFF_DUTY">Off Duty</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>

              <button
                onClick={fetchDrivers}
                disabled={loading}
                className="border-3 border-black p-2.5 bg-white hover:bg-gray-100 disabled:opacity-50 cursor-pointer shadow-neo-sm shrink-0 flex items-center justify-center"
                title="Refresh drivers list"
              >
                <LuRefreshCw size={18} className={loading ? "animate-spin" : ""} />
              </button>

              <button onClick={handleAdd} className="btn-primary">+ Add Driver</button>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-hidden border-3 border-black rounded-lg shadow-neo bg-white">
            <table className="w-full text-left border-collapse" id="drivers-table">
              <thead className="bg-black text-white uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th
                    onClick={() => handleSort("name")}
                    className="p-4 border-b-2 border-black border-r border-white/20 cursor-pointer hover:bg-gray-950 select-none"
                  >
                    Driver {sortField === "name" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("licenseNumber")}
                    className="p-4 border-b-2 border-black border-r border-white/20 cursor-pointer hover:bg-gray-950 select-none"
                  >
                    License No. {sortField === "licenseNumber" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("licenseCategory")}
                    className="p-4 border-b-2 border-black border-r border-white/20 cursor-pointer hover:bg-gray-950 select-none"
                  >
                    Category {sortField === "licenseCategory" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("licenseExpiry")}
                    className="p-4 border-b-2 border-black border-r border-white/20 cursor-pointer hover:bg-gray-950 select-none"
                  >
                    Expiry {sortField === "licenseExpiry" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("contactNumber")}
                    className="p-4 border-b-2 border-black border-r border-white/20 cursor-pointer hover:bg-gray-950 select-none"
                  >
                    Contact {sortField === "contactNumber" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("safetyScore")}
                    className="p-4 border-b-2 border-black border-r border-white/20 cursor-pointer hover:bg-gray-950 select-none"
                  >
                    Safety Score {sortField === "safetyScore" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="p-4 border-b-2 border-black border-r border-white/20 cursor-pointer hover:bg-gray-950 select-none"
                  >
                    Status {sortField === "status" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="p-4 border-b-2 border-black">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-black">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse border-b-2 border-black/10">
                      <td className="p-4 italic font-bold">...</td>
                      <td className="p-4">...</td>
                      <td className="p-4">...</td>
                      <td className="p-4">...</td>
                      <td className="p-4">...</td>
                      <td className="p-4">...</td>
                      <td className="p-4"><span className="app-badge bg-gray-200 text-gray-200">...</span></td>
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
                      No drivers found matching criteria.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((driver) => {
                    const hasExpired = isExpired(driver.licenseExpiry);
                    return (
                      <tr key={driver._id} className="hover:bg-black/5 border-b-2 border-black/10 last:border-0 transition-colors">
                        <td className="p-4 italic font-bold">{driver.user?.name || "—"}</td>
                        <td className={`p-4 ${hasExpired ? "text-orange-600 font-bold" : ""}`}>{driver.licenseNumber}</td>
                        <td className="p-4">{driver.licenseCategory}</td>
                        <td className={`p-4 ${hasExpired ? "text-orange-600 font-black" : ""}`}>
                          {new Date(driver.licenseExpiry).toLocaleDateString()} {hasExpired && "• EXPIRED"}
                        </td>
                        <td className="p-4 font-mono">{driver.contactNumber}</td>
                        <td className="p-4 text-center font-mono font-bold">{driver.safetyScore}/100</td>
                        <td className="p-4">
                          <span className={`app-badge rounded text-black normal-case ${getStatusBadge(driver.status)}`}>
                            {driver.status}
                          </span>
                        </td>
                        <td className="p-4 flex gap-2">
                          <button
                            onClick={() => handleEdit(driver)}
                            className="p-1 border-2 border-black bg-brand hover:bg-[#ffd100]/90 cursor-pointer shadow-neo-sm"
                            title="Edit driver"
                          >
                            <LuPen size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(driver._id)}
                            className="p-1 border-2 border-black bg-error hover:bg-error/90 text-white cursor-pointer shadow-neo-sm"
                            title="Remove driver"
                          >
                            <LuTrash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <span className="text-sm font-bold">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedDrivers.length)} of {sortedDrivers.length} drivers
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

          <div className="space-y-4 pt-4" data-purpose="status-controls">
            <p className="text-orange-600 text-sm font-bold pt-2 italic">
              Rule: Expired license or Suspended status → blocked from trip assignment
            </p>
          </div>
        </div>
      </main>

      <DriverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchDrivers}
        driver={selectedDriver}
      />
    </div>
  );
}