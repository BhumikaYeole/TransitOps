import { useMemo, useState, useEffect, useCallback } from "react";
import { LuUser, LuPhone, LuShieldCheck } from "react-icons/lu";
import Sidebar from "../pages/Sidebar";
import api from "../services/api.js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const LICENSE_CATEGORIES = ["LMV", "HMV", "MCWG", "PSV"];

const STATUS_BADGES = {
  AVAILABLE: "bg-green-400",
  ON_TRIP: "bg-blue-400",
  OFF_DUTY: "bg-gray-400",
  SUSPENDED: "bg-orange-400",
};

function TopHeader() {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const name = user?.name || "Raven K.";
  const role = user?.role || "Dispatcher";

  return (
    <header className="p-6 border-b-[3px] border-black flex items-center justify-between bg-white" data-purpose="top-navigation">
      <div className="w-1/3">
        <input className="app-input" placeholder="Search..." type="text" />
      </div>
      <div className="flex items-center space-x-6">
        <div className="text-right">
          <p className="font-bold text-sm">{name}</p>
          <span className="text-xs uppercase font-black text-gray-500">{role}</span>
        </div>
        
      </div>
    </header>
  );
}

function SystemStat({ icon: Icon, label, children }) {
  return (
    <div className="app-card p-5 flex items-start gap-4">
      <span className="flex items-center justify-center w-10 h-10 shrink-0 border-2 border-black bg-brand">
        <Icon size={18} strokeWidth={2.5} className="text-black" />
      </span>
      <div>
        <p className="text-[10px] font-black uppercase text-gray-500 mb-1">{label}</p>
        {children}
      </div>
    </div>
  );
}

export default function DriverProfile() {
  const [form, setForm] = useState({
    licenseNumber: "",
    licenseCategory: "LMV",
    licenseExpiry: "",
    contactNumber: "",
  });

  const [driverProfile, setDriverProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const userId = user?._id;

  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/drivers/profile");
      const profile = res.data.data;

      setDriverProfile(profile);
      setForm({
        licenseNumber: profile.licenseNumber || "",
        licenseCategory: profile.licenseCategory || "LMV",
        licenseExpiry: profile.licenseExpiry ? profile.licenseExpiry.split("T")[0] : "",
        contactNumber: profile.contactNumber || "",
      });
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error(err);
      }
      setDriverProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const safetyScore = driverProfile?.safetyScore ?? 100;
  const status = driverProfile?.status ?? "AVAILABLE";

  const isExpiringSoon = useMemo(() => {
    if (!form.licenseExpiry) return false;
    const days = (new Date(form.licenseExpiry) - new Date()) / (1000 * 60 * 60 * 24);
    return days < 60;
  }, [form.licenseExpiry]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      toast.error("Please sign in again to continue.");
      return;
    }

    const profileExists = Boolean(driverProfile);

    try {
      const payload = {
        ...form,
        licenseExpiry: form.licenseExpiry ? new Date(form.licenseExpiry).toISOString() : "",
      };

      let res;

      if (profileExists) {
        res = await api.put("/drivers/profile", payload);
      } else {
        res = await api.post("/drivers/profile", payload);
      }

      setDriverProfile(res.data.data);
      toast.success(profileExists ? "Profile updated successfully." : "Profile created successfully.");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    }
  };

  if (loading) {
    return (
      <div className="font-sans antialiased min-h-screen flex">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center bg-white">
          <p className="text-lg font-bold text-black">Loading your profile...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col bg-white" data-purpose="main-content-area">
        <TopHeader />

        <div className="p-8 flex flex-col lg:flex-row gap-12">
          <section className="w-full lg:w-2/5 space-y-6" data-purpose="driver-profile-form">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wider text-black">My Driver Profile</h1>
              <p className="text-sm text-gray-500 mt-1">
                Keep your license and contact details up to date.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-gray-500" htmlFor="licenseNumber">
                  License Number
                </label>
                <input
                  id="licenseNumber"
                  className="app-input"
                  type="text"
                  placeholder="DL-88213"
                  value={form.licenseNumber}
                  onChange={handleChange("licenseNumber")}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-gray-500" htmlFor="licenseCategory">
                  License Category
                </label>
                <select
                  id="licenseCategory"
                  className="app-input"
                  value={form.licenseCategory}
                  onChange={handleChange("licenseCategory")}
                  required
                >
                  {LICENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-gray-500" htmlFor="licenseExpiry">
                  License Expiry
                </label>
                <input
                  id="licenseExpiry"
                  className="app-input"
                  type="date"
                  value={form.licenseExpiry}
                  onChange={handleChange("licenseExpiry")}
                  required
                />
                {isExpiringSoon && (
                  <p className="text-orange-600 text-xs font-bold italic">
                    Expiring within 60 days — renew soon to stay eligible for dispatch.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-gray-500" htmlFor="contactNumber">
                  Contact Number
                </label>
                <input
                  id="contactNumber"
                  className="app-input"
                  type="tel"
                  placeholder="98765xxxxx"
                  value={form.contactNumber}
                  onChange={handleChange("contactNumber")}
                  required
                />
              </div>

              <button className="btn-primary mt-2" type="submit">
                Save Profile
              </button>
            </form>
          </section>

          <section className="w-full lg:w-3/5 space-y-6" data-purpose="driver-system-info">
            <h2 className="text-lg font-black uppercase tracking-wider text-black">System Info</h2>
            <p className="text-sm text-gray-500 -mt-4">
              Managed by Safety Officers and trip dispatch — read only.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SystemStat icon={LuShieldCheck} label="Safety Score">
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-black">{safetyScore}</p>
                  <div className="flex-1 h-3 bg-gray-200 border-2 border-black">
                    <div className="h-full bg-success" style={{ width: `${safetyScore}%` }} />
                  </div>
                </div>
              </SystemStat>

              <SystemStat icon={LuUser} label="Status">
                <span className={`app-badge rounded normal-case text-black ${STATUS_BADGES[status]}`}>
                  {status.replace("_", " ")}
                </span>
              </SystemStat>

              <SystemStat icon={LuPhone} label="Linked Account">
                <p className="font-bold text-black">Raven K.</p>
                <p className="text-xs text-gray-500">Dispatcher role</p>
              </SystemStat>
            </div>

            <div className="app-card p-4 bg-warning/10 border-warning">
              <p className="text-xs font-bold uppercase text-warning mb-1">Rule</p>
              <p className="text-sm text-black">
                Expired licenses or a Suspended status automatically block trip assignment,
                regardless of profile details saved here.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
