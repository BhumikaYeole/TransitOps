import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import API from "../services/api.js";
import { toast } from "sonner";
import { LuRefreshCw, LuTrash2, LuX } from "react-icons/lu";

const LIFECYCLE_STAGES = [
  { label: "Draft", color: "bg-success" },
  { label: "Dispatched", color: "bg-info" },
  { label: "Completed", color: "bg-gray-200" },
  { label: "Cancelled", color: "bg-red-400" },
];

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
    <header className="p-6 border-b-3 border-black flex justify-between items-center bg-white sticky top-0 z-10">
      <div className="flex-1 max-w-xl flex items-center gap-4">
        <input className="app-input px-4 py-2" data-purpose="top-search" placeholder="Search trips..." type="text" />
        <button
          onClick={onRefresh}
          disabled={loading}
          className="border-3 border-black p-3 bg-brand hover:bg-[#ffd100]/90 disabled:opacity-50 cursor-pointer shadow-neo-sm shrink-0 flex items-center justify-center"
          title="Refresh board"
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

function TripLifecycle() {
  return (
    <section data-purpose="trip-lifecycle">
      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Trip Lifecycle</h2>
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-[3px] bg-black -translate-y-1/2 z-0" />
        {LIFECYCLE_STAGES.map((stage) => (
          <div key={stage.label} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-6 h-6 rounded-full border-3 border-black ${stage.color}`} />
            <span
              className={`text-xs font-bold ${
                stage.color === "bg-gray-200" ? "text-gray-500" : "text-black"
              }`}
            >
              {stage.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CompleteTripModal({ isOpen, onClose, onSubmit, trip }) {
  const [actualDistance, setActualDistance] = useState("");
  const [fuelConsumed, setFuelConsumed] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (trip) {
      setActualDistance(String(trip.plannedDistance || ""));
      setFuelConsumed("0");
    }
  }, [trip, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!actualDistance) {
      toast.error("Please enter the actual distance traveled");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(trip._id, {
        status: "COMPLETED",
        actualDistance: Number(actualDistance),
        fuelConsumed: Number(fuelConsumed),
      });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete trip");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black p-6 w-full max-w-md shadow-neo relative text-black">
        <button onClick={onClose} className="absolute right-4 top-4 text-black hover:text-gray-600 cursor-pointer">
          <LuX size={24} strokeWidth={3} />
        </button>

        <h2 className="text-xl font-black uppercase mb-4 italic">Complete Trip</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold uppercase text-gray-700">Actual Distance Traveled (KM) *</label>
            <input
              className="app-input p-3"
              type="number"
              required
              value={actualDistance}
              onChange={(e) => setActualDistance(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold uppercase text-gray-700">Fuel Consumed (Liters)</label>
            <input
              className="app-input p-3"
              type="number"
              value={fuelConsumed}
              onChange={(e) => setFuelConsumed(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={onClose}
              type="button"
              className="flex-1 py-3 border-3 border-black text-black font-bold uppercase hover:bg-gray-100 transition-all cursor-pointer"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 btn-primary disabled:opacity-50 uppercase"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Complete Trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TripDispatcher() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    source: "",
    destination: "",
    vehicle: "",
    driver: "",
    cargoWeight: "",
    plannedDistance: "",
    revenue: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Completion modal state
  const [activeTripToComplete, setActiveTripToComplete] = useState(null);

  const fetchDispatcherData = async () => {
    setLoading(true);
    try {
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        API.get("/trips"),
        API.get("/vehicles"),
        API.get("/drivers"),
      ]);

      // console.log(driversRes.data.data.drivers);
      setTrips(tripsRes.data.data.trips || []);
      setVehicles(vehiclesRes.data.data || []);
      setDrivers(driversRes.data.data.drivers || []);
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dispatcher statistics");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    async function loadData() {
      await fetchDispatcherData(); 
    }
    loadData();
  }, []);

  const availableVehicles = vehicles.filter((v) => v.status === "AVAILABLE");
  const availableDrivers = drivers.filter(
    (d) => d.status === "AVAILABLE" && new Date(d.licenseExpiry) > new Date()
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Capacity Warning logic
  const selectedVehicleObj = vehicles.find((v) => v._id === formData.vehicle);
  const selectedDriverObj = drivers.find((d) => d._id === formData.driver);

  const isCapacityExceeded =
    selectedVehicleObj &&
    formData.cargoWeight &&
    Number(formData.cargoWeight) > selectedVehicleObj.maxLoadCapacity;

  const isDriverLicenseExpired =
    selectedDriverObj && new Date(selectedDriverObj.licenseExpiry) <= new Date();

  const handleCreateTrip = async (status = "DRAFT") => {
    if (!formData.source || !formData.destination || !formData.vehicle || !formData.driver || !formData.cargoWeight || !formData.plannedDistance || !formData.revenue) {
      toast.error("Please fill in all details");
      return;
    }
    if (isCapacityExceeded) {
      toast.error("Cargo weight exceeds vehicle capacity");
      return;
    }
    if (isDriverLicenseExpired) {
      toast.error("Selected driver license is expired");
      return;
    }

    setSubmitting(true);
    try {
      await API.post("/trips", {
        source: formData.source,
        destination: formData.destination,
        vehicle: formData.vehicle,
        driver: formData.driver,
        cargoWeight: Number(formData.cargoWeight),
        plannedDistance: Number(formData.plannedDistance),
        revenue: Number(formData.revenue),
        status,
      });

      toast.success(status === "DISPATCHED" ? "Trip dispatched successfully" : "Trip draft created");
      setFormData({
        source: "",
        destination: "",
        vehicle: "",
        driver: "",
        cargoWeight: "",
        plannedDistance: "",
        revenue: "",
      });
      fetchDispatcherData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create trip");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, updatePayload) => {
    try {
      await API.put(`/trips/${id}`, updatePayload);
      toast.success(`Trip status updated to ${updatePayload.status}`);
      fetchDispatcherData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update trip status");
    }
  };

  const handleDeleteTrip = async (id) => {
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    try {
      await API.delete(`/trips/${id}`);
      toast.success("Trip deleted successfully");
      fetchDispatcherData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete trip");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "DISPATCHED":
        return "bg-info text-white";
      case "DRAFT":
        return "bg-success text-white";
      case "CANCELLED":
        return "bg-error text-white";
      case "COMPLETED":
        return "bg-gray-400 text-black";
      default:
        return "bg-gray-400 text-black";
    }
  };

  return (
    <div className="font-sans min-h-screen text-black">
      <div className="flex h-screen overflow-hidden border-b-3 border-black">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto">
          <TopHeader onRefresh={fetchDispatcherData} loading={loading} />

          <div className="p-8 grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
              <TripLifecycle />

              {/* Form */}
              <section className="flex flex-col gap-6" data-purpose="create-trip-form">
                <h2 className="text-2xl font-black uppercase italic">Create Trip</h2>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-gray-500">Source</label>
                  <input
                    className="app-input font-medium"
                    name="source"
                    type="text"
                    value={formData.source}
                    onChange={handleInputChange}
                    placeholder="e.g. Gandhinagar Depot"
                    disabled={submitting}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-gray-500">Destination</label>
                  <input
                    className="app-input font-medium"
                    name="destination"
                    type="text"
                    value={formData.destination}
                    onChange={handleInputChange}
                    placeholder="e.g. Ahmedabad Hub"
                    disabled={submitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase text-gray-500">Vehicle (Available)</label>
                    <select
                      className="app-input font-medium"
                      name="vehicle"
                      value={formData.vehicle}
                      onChange={handleInputChange}
                      disabled={submitting}
                    >
                      <option value="">Select Vehicle</option>
                      {availableVehicles.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.model} ({v.registrationNumber}) - {v.maxLoadCapacity} kg
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase text-gray-500">Driver (Available)</label>
                    <select
                      className="app-input font-medium"
                      name="driver"
                      value={formData.driver}
                      onChange={handleInputChange}
                      disabled={submitting}
                    >
                      <option value="">Select Driver</option>
                      {availableDrivers.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.user?.name || "—"} ({d.licenseCategory})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase text-gray-500">Cargo Weight (KG)</label>
                    <input
                      className="app-input font-medium"
                      name="cargoWeight"
                      type="number"
                      value={formData.cargoWeight}
                      onChange={handleInputChange}
                      placeholder="800"
                      disabled={submitting}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase text-gray-500">Distance (KM)</label>
                    <input
                      className="app-input font-medium"
                      name="plannedDistance"
                      type="number"
                      value={formData.plannedDistance}
                      onChange={handleInputChange}
                      placeholder="40"
                      disabled={submitting}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase text-gray-500">Revenue (Rs)</label>
                    <input
                      className="app-input font-medium"
                      name="revenue"
                      type="number"
                      value={formData.revenue}
                      onChange={handleInputChange}
                      placeholder="5000"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Validation messages */}
                {isCapacityExceeded && (
                  <div className="p-4 border-3 border-error bg-error/10 text-error font-bold" data-purpose="form-validation">
                    <div className="flex flex-col gap-1">
                      <span>Vehicle Capacity: {selectedVehicleObj.maxLoadCapacity} kg</span>
                      <span>Cargo Weight: {formData.cargoWeight} kg</span>
                      <div className="flex items-center gap-2 mt-2 font-black uppercase text-xs">
                        Capacity exceeded by {Number(formData.cargoWeight) - selectedVehicleObj.maxLoadCapacity} kg — dispatch blocked
                      </div>
                    </div>
                  </div>
                )}

                {isDriverLicenseExpired && (
                  <div className="p-4 border-3 border-error bg-error/10 text-error font-bold">
                    <div className="flex items-center gap-2 font-black uppercase text-xs">
                      Driver License is expired — dispatch blocked
                    </div>
                  </div>
                )}

                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => handleCreateTrip("DRAFT")}
                    className="flex-1 py-4 border-3 border-black text-black bg-white hover:bg-gray-150 font-bold text-lg uppercase transition-all shadow-neo-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting || isCapacityExceeded || isDriverLicenseExpired}
                  >
                    Draft
                  </button>
                  <button
                    onClick={() => handleCreateTrip("DISPATCHED")}
                    className="flex-1 py-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed uppercase text-lg"
                    disabled={submitting || isCapacityExceeded || isDriverLicenseExpired || !formData.vehicle || !formData.driver}
                  >
                    {submitting ? "Dispatching..." : "Dispatch"}
                  </button>
                </div>
              </section>
            </div>

            {/* Live Board */}
            <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Live Board</h2>
              <div className="flex flex-col gap-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }} data-purpose="trip-cards-container">
                {loading ? (
                  <div className="text-center font-bold text-gray-500 py-10 animate-pulse">Loading trips...</div>
                ) : trips.length === 0 ? (
                  <div className="text-center font-bold text-gray-500 py-10">No trips recorded. Create one above!</div>
                ) : (
                  trips.map((trip) => (
                    <div
                      key={trip._id}
                      className="border-3 border-black p-6 border-solid hover:shadow-neo transition-all flex flex-col gap-4 bg-white shadow-neo-sm"
                      data-purpose="trip-card"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-mono font-bold text-gray-500">
                            TRIP ID: {trip._id.toUpperCase()}
                          </div>
                          <div className="text-lg font-bold">
                            {trip.source} → {trip.destination}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-black uppercase">
                            Vehicle: {trip.vehicle?.model || trip.vehicle?.registrationNumber || "—"}
                          </div>
                          <div className="text-xs font-bold text-gray-500 uppercase mt-0.5">
                            Driver: {trip.driver?.user?.name || "—"}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-end flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-1 font-bold border-2 border-black shadow-neo-sm text-xs uppercase ${getStatusBadgeClass(trip.status)}`}>
                            {trip.status}
                          </span>
                          <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 border border-black font-mono">
                            Dist: {trip.plannedDistance} km
                          </span>
                          <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 border border-black font-mono">
                            Rev: ₹{trip.revenue?.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {trip.status === "DRAFT" && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(trip._id, { status: "DISPATCHED" })}
                                className="bg-brand text-black font-bold px-3 py-1 border-2 border-black text-xs shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                              >
                                Dispatch
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(trip._id, { status: "CANCELLED" })}
                                className="bg-error text-white font-bold px-3 py-1 border-2 border-black text-xs shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {trip.status === "DISPATCHED" && (
                            <>
                              <button
                                onClick={() => setActiveTripToComplete(trip)}
                                className="bg-success text-white font-bold px-3 py-1 border-2 border-black text-xs shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(trip._id, { status: "CANCELLED" })}
                                className="bg-error text-white font-bold px-3 py-1 border-2 border-black text-xs shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDeleteTrip(trip._id)}
                            className="p-1 border-2 border-black bg-white hover:bg-gray-100 text-error cursor-pointer shadow-neo-sm"
                            title="Delete trip record"
                          >
                            <LuTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-auto pt-6 text-xs font-bold text-gray-500 italic" data-purpose="footer-legend">
                On Complete: odometer → fuel log → expenses → Vehicle &amp; Driver Available
              </div>
            </div>
          </div>
        </main>
      </div>

      <CompleteTripModal
        isOpen={activeTripToComplete !== null}
        onClose={() => setActiveTripToComplete(null)}
        onSubmit={handleStatusUpdate}
        trip={activeTripToComplete}
      />
    </div>
  );
}