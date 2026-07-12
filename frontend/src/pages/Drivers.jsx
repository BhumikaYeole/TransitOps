import React from "react";
import Sidebar from "./Sidebar";

const DRIVERS = [
  {
    name: "Alex",
    license: "DL-88213",
    category: "LMV",
    expiry: "12/2028",
    expiryWarn: false,
    contact: "98765xxxxx",
    tripCompletion: "96%",
    safety: "Available",
    status: "Available",
    badgeClass: "bg-green-400",
  },
  {
    name: "John",
    license: "DL-44120",
    category: "HMV",
    expiry: "03/2025 EXPIRE",
    expiryWarn: true,
    contact: "98220xxxxx",
    tripCompletion: "81%",
    safety: "Suspended",
    status: "Suspended",
    badgeClass: "bg-orange-400",
  },
  {
    name: "Priya",
    license: "DL-77031",
    category: "LMV",
    expiry: "08/2026",
    expiryWarn: false,
    contact: "99110xxxxx",
    tripCompletion: "99%",
    safety: "On Trip",
    status: "On Trip",
    badgeClass: "bg-blue-400",
  },
  {
    name: "Suresh",
    license: "DL-90045",
    category: "HMV",
    expiry: "01/2027",
    expiryWarn: false,
    contact: "97440xxxxx",
    tripCompletion: "88%",
    safety: "Available",
    status: "Off Duty",
    badgeClass: "bg-gray-400",
    safetyBadgeClass: "bg-green-400",
  },
];

const TOGGLE_STATES = [
  { label: "Available", badgeClass: "bg-green-400" },
  { label: "On Trip", badgeClass: "bg-blue-400" },
  { label: "Off Duty", badgeClass: "bg-gray-400" },
  { label: "Suspended", badgeClass: "bg-orange-400" },
];

function TopHeader() {
  return (
    <header className="p-6 border-b-2 border-black flex items-center justify-between" data-purpose="top-navigation">
      <div className="relative w-1/3">
        <input className="app-input rounded-md shadow-neo-sm" placeholder="Search..." type="text" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold">Raven K.</span>
        <div className="flex items-center gap-2 border-2 border-black rounded-full px-3 py-1">
          <span className="text-xs uppercase tracking-wider font-bold">Dispatcher</span>
          <div className="w-8 h-8 bg-info border-2 border-black rounded-full flex items-center justify-center text-white font-bold text-xs">
            RK
          </div>
        </div>
      </div>
    </header>
  );
}

function DriversTable() {
  return (
    <div className="w-full overflow-hidden border-3 border-black rounded-lg shadow-neo bg-white">
      <table className="w-full text-left border-collapse" id="drivers-table">
        <thead className="bg-black text-white uppercase text-xs font-bold tracking-wider">
          <tr>
            <th className="p-4 border-b-2 border-black">Driver</th>
            <th className="p-4 border-b-2 border-black">License No.</th>
            <th className="p-4 border-b-2 border-black">Category</th>
            <th className="p-4 border-b-2 border-black">Expiry</th>
            <th className="p-4 border-b-2 border-black">Contact</th>
            <th className="p-4 border-b-2 border-black">Trip Compl.</th>
            <th className="p-4 border-b-2 border-black">Safety</th>
            <th className="p-4 border-b-2 border-black">Status</th>
          </tr>
        </thead>
        <tbody className="text-sm font-medium text-black">
          {DRIVERS.map((driver) => (
            <tr key={driver.license} className="hover:bg-black/5 border-b-2 border-black/10 last:border-0 transition-colors">
              <td className="p-4 italic font-bold">{driver.name}</td>
              <td className={`p-4 ${driver.expiryWarn ? "text-orange-600" : ""}`}>{driver.license}</td>
              <td className="p-4">{driver.category}</td>
              <td className={`p-4 ${driver.expiryWarn ? "text-orange-600 font-black" : ""}`}>{driver.expiry}</td>
              <td className="p-4">{driver.contact}</td>
              <td className="p-4">{driver.tripCompletion}</td>
              <td className="p-4">
                <span className={`app-badge rounded text-black normal-case ${driver.safetyBadgeClass || driver.badgeClass}`}>
                  {driver.safety}
                </span>
              </td>
              <td className="p-4">
                <span className={`app-badge rounded text-black normal-case ${driver.badgeClass}`}>{driver.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ToggleControls() {
  return (
    <div className="space-y-4 pt-4" data-purpose="status-controls">
      <h3 className="text-xs font-black uppercase tracking-widest text-black">Toggle Stat</h3>
      <div className="flex flex-wrap gap-4">
        {TOGGLE_STATES.map((state) => (
          <button
            key={state.label}
            className={`app-badge rounded text-black normal-case px-6 py-2 border-3 border-black shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all ${state.badgeClass}`}
          >
            {state.label}
          </button>
        ))}
      </div>
      <p className="text-orange-600 text-sm font-bold pt-2 italic">
        Rule: Expired license or Suspended status → blocked from trip assignment
      </p>
    </div>
  );
}

export default function Drivers() {
  return (
    <div className="font-sans antialiased min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 bg-white" data-purpose="main-content-area">
        <TopHeader />
        <div className="p-8 space-y-8 overflow-auto">
          <div className="flex justify-between items-end">
            <h1 className="text-3xl font-bold italic text-black">Drivers &amp; Safety Profiles</h1>
            <button className="btn-primary">+ Add Driver</button>
          </div>

          <DriversTable />
          <ToggleControls />
        </div>
      </main>
    </div>
  );
}