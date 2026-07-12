import React, { useState } from "react";
import Sidebar from "../pages/Sidebar";

const RBAC_MODULES = ["Fleet", "Drivers", "Trips", "Fuel/Exp.", "Analytics"];

const RBAC_ROWS = [
  { role: "Fleet Manager", access: ["yes", "yes", "no", "no", "yes"] },
  { role: "Dispatcher", access: ["view", "no", "yes", "no", "no"] },
  { role: "Safety Officer", access: ["no", "yes", "view", "no", "no"] },
  { role: "Financial Analyst", access: ["view", "no", "no", "yes", "yes"] },
];

function AccessMark({ value }) {
  if (value === "yes") {
    return <span className="text-success font-black text-lg">✓</span>;
  }
  if (value === "view") {
    return <span className="text-info font-bold uppercase text-xs">view</span>;
  }
  return <span className="text-gray-400 font-black">—</span>;
}

function TopHeader() {
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
    <header className="p-6 border-b-[3px] border-black flex items-center justify-between bg-white" data-purpose="top-navigation">
      <div className="w-1/3">
        <input className="app-input" placeholder="Search settings..." type="text" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold text-black">{name}</span>
        <div className="flex items-center gap-2 border-[3px] border-black rounded-full px-3 py-1 bg-brand shadow-neo-sm">
          <span className="text-xs uppercase tracking-wider font-bold">{role}</span>
          <div className="w-8 h-8 bg-info border-2 border-black rounded-full flex items-center justify-center text-white font-bold text-xs">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}

function GeneralSettingsForm() {
  const [depotName, setDepotName] = useState("Gandhinagar Depot GJ4");
  const [currency, setCurrency] = useState("INR (Rs)");
  const [distanceUnit, setDistanceUnit] = useState("Kilometers");

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <section className="w-full lg:w-1/3 space-y-6" data-purpose="general-settings">
      <h2 className="text-lg font-black uppercase tracking-wider text-black">General</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase text-gray-500">Depot Name</label>
          <input
            className="app-input"
            type="text"
            value={depotName}
            onChange={(e) => setDepotName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase text-gray-500">Currency</label>
          <input
            className="app-input"
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase text-gray-500">Distance Unit</label>
          <input
            className="app-input"
            type="text"
            value={distanceUnit}
            onChange={(e) => setDistanceUnit(e.target.value)}
          />
        </div>
        <button className="btn-primary mt-2" type="submit">
          Save changes
        </button>
      </form>
    </section>
  );
}

function RbacTable() {
  return (
    <section className="w-full lg:w-2/3 space-y-6" data-purpose="rbac-table">
      <h2 className="text-lg font-black uppercase tracking-wider text-black">Role-Based Access (RBAC)</h2>
      <div className="app-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 border-b-[3px] border-black">
            <tr>
              <th className="p-4 text-xs font-black uppercase">Role</th>
              {RBAC_MODULES.map((mod) => (
                <th key={mod} className="p-4 text-xs font-black uppercase">
                  {mod}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black">
            {RBAC_ROWS.map((row) => (
              <tr key={row.role}>
                <td className="p-4 font-bold">{row.role}</td>
                {row.access.map((value, i) => (
                  <td key={i} className="p-4">
                    <AccessMark value={value} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function Settings() {
  return (
    <div className="font-sans antialiased min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col bg-white" data-purpose="main-content-area">
        <TopHeader />
        <div className="p-8 flex flex-col lg:flex-row gap-12">
          <GeneralSettingsForm />
          <RbacTable />
        </div>
      </main>
    </div>
  );
}