import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Registry from "./pages/Registry";
import Drivers from "./pages/Drivers";
import TripDispatcher from "./pages/TripDispatcher";
import Maintenance from "./pages/Maintenance";
import FuelExpenses from "./pages/FuelExpenses";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/fleet" element={<ProtectedRoute><Registry /></ProtectedRoute>} />
        <Route path="/drivers" element={<ProtectedRoute><Drivers /></ProtectedRoute>} />
        <Route path="/trips" element={<ProtectedRoute><TripDispatcher /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
        <Route path="/fuel-expenses" element={<ProtectedRoute><FuelExpenses /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}