import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import API from "./services/api";

import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Registry from "./pages/Registry";
import Drivers from "./pages/Drivers";
import TripDispatcher from "./pages/TripDispatcher";
import Maintenance from "./pages/Maintenance";
import FuelExpenses from "./pages/FuelExpenses";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import DriverProfile from "./pages/DriverProfile";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(true);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const checkDriverProfile = async () => {
      // Only Drivers/Dispatchers need a profile
      if (
        user.role !== "Driver" &&
        user.role !== "Dispatcher"
      ) {
        setLoading(false);
        return;
      }

      try {
        await API.get("/drivers/profile");
        setProfileExists(true);
      } catch (err) {
        if (err.response?.status === 404) {
          setProfileExists(false);
        }
      }

      setLoading(false);
    };

    checkDriverProfile();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (
    (user.role === "Driver" || user.role === "Dispatcher") &&
    !profileExists &&
    location.pathname !== "/driver-profile"
  ) {
    return <Navigate to="/driver-profile" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />

      <Routes>
        <Route path="/login" element={<AuthPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fleet"
          element={
            <ProtectedRoute allowedRoles={["Fleet Manager"]}>
              <Registry />
            </ProtectedRoute>
          }
        />

        <Route
          path="/drivers"
          element={
            <ProtectedRoute allowedRoles={["Fleet Manager", "Safety Officer"]}>
              <Drivers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver-profile"
          element={
            <ProtectedRoute allowedRoles={["Driver", "Dispatcher"]}> 
              <DriverProfile/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/trips"
          element={
            <ProtectedRoute allowedRoles={["Fleet Manager", "Driver", "Dispatcher"]}>
              <TripDispatcher />
            </ProtectedRoute>
          }
        />

        <Route
          path="/maintenance"
          element={
            <ProtectedRoute allowedRoles={["Fleet Manager"]}>
              <Maintenance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fuel-expenses"
          element={
            <ProtectedRoute allowedRoles={["Fleet Manager", "Financial Analyst", "Driver", "Dispatcher"]}>
              <FuelExpenses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={["Fleet Manager", "Financial Analyst"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["Fleet Manager"]}>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}