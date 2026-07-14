import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/",
    allowedRoles: ["Fleet Manager", "Driver", "Safety Officer", "Financial Analyst", "Dispatcher"],
  },
  {
    label: "Fleet",
    to: "/fleet",
    allowedRoles: ["Fleet Manager"],
  },
  {
    label: "Drivers",
    to: "/drivers",
    allowedRoles: ["Fleet Manager", "Safety Officer"],
  },
  {
    label: "Trips",
    to: "/trips",
    allowedRoles: ["Fleet Manager", "Driver", "Dispatcher"],
  },
  {
    label: "Maintenance",
    to: "/maintenance",
    allowedRoles: ["Fleet Manager"],
  },
  {
    label: "Fuel & Expenses",
    to: "/fuel-expenses",
    allowedRoles: ["Fleet Manager", "Financial Analyst"],
  },
  {
    label: "Analytics",
    to: "/analytics",
    allowedRoles: ["Fleet Manager", "Financial Analyst"],
  },
  {
    label: "Settings",
    to: "/settings",
    allowedRoles: ["Fleet Manager"],
  },
];

const user = JSON.parse(localStorage.getItem("user"));

const filteredNavItems = NAV_ITEMS.filter((item) =>
  item.allowedRoles.includes(user.role)
);
export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside
      className="w-64 shrink-0 border-r-3 border-black flex flex-col p-6 gap-8 bg-white"
      data-purpose="sidebar"
    >
      <div className="text-3xl font-bold tracking-tighter">TransitOps</div>

      <nav className="flex flex-col gap-2 text-lg font-medium flex-1">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `sidebar-link block py-2 px-4 ${isActive ? "active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="sidebar-link block w-full py-2 px-4 text-left font-bold text-error border-2 border-transparent hover:border-error hover:bg-error/10 cursor-pointer"
      >
        Logout
      </button>
    </aside>
  );
}