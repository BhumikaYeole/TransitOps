import React from "react";
import { LuPlus, LuSearch } from "react-icons/lu";
import Sidebar from "./Sidebar";

const VEHICLES = [
  { reg: "GJ01AB4521", name: "VAN-05", type: "Van", capacity: "500 kg", odometer: "74,000", cost: "6,20,000", status: "Available", badgeClass: "bg-success" },
  { reg: "GJ01AB9981", name: "TRUCK-11", type: "Truck", capacity: "5 Ton", odometer: "182,000", cost: "24,50,000", status: "On Trip", badgeClass: "bg-info" },
  { reg: "GJ01AB1120", name: "MINI-03", type: "Mini", capacity: "1 Ton", odometer: "66,000", cost: "4,10,000", status: "In Shop", badgeClass: "bg-warning" },
  { reg: "GJ01AB008", name: "VAN-09", type: "Van", capacity: "750 kg", odometer: "241,900", cost: "5,90,000", status: "Retired", badgeClass: "bg-error" },
];

function TopHeader() {
  return (
    <header className="p-6 border-b-2 border-black flex justify-between items-center bg-white" data-purpose="top-header">
      <div className="flex-1 max-w-md relative">
        <LuSearch size={16} strokeWidth={2.5} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black" />
        <input className="app-input text-sm pl-9" data-purpose="global-search" placeholder="Search..." type="text" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold text-black">Raven K.</span>
        <div className="flex items-center gap-2 border-2 border-black p-1 pl-3 bg-info shadow-neo-sm">
          <span className="text-xs font-bold text-white">Dispatcher</span>
          <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center text-black font-bold">
            RK
          </div>
        </div>
      </div>
    </header>
  );
}

function FilterControls() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8" data-purpose="filter-controls">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-black">Type:</label>
          <select className="app-input text-sm min-w-[120px]">
            <option>All</option>
            <option>Van</option>
            <option>Truck</option>
            <option>Mini</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-black">Status:</label>
          <select className="app-input text-sm min-w-[120px]">
            <option>All</option>
            <option>Available</option>
            <option>On Trip</option>
            <option>In Shop</option>
            <option>Retired</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input className="app-input text-sm w-64" data-purpose="registry-search" placeholder="Search reg. no..." type="text" />
        </div>
      </div>
      <button className="btn-primary flex items-center gap-2" data-purpose="add-vehicle-btn">
        <LuPlus size={20} strokeWidth={3} />
        Add Vehicle
      </button>
    </div>
  );
}

function VehicleTable() {
  return (
    <div className="overflow-x-auto border-3 border-black shadow-neo" data-purpose="vehicle-table-container">
      <table className="w-full text-left border-collapse bg-white" id="vehicle-registry-table">
        <thead>
          <tr className="border-b-2 border-black bg-gray-100">
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-black border-r-2 border-black">Reg. No. (Unique)</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-black border-r-2 border-black">Name/Model</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-black border-r-2 border-black">Type</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-black border-r-2 border-black">Capacity</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-black border-r-2 border-black">Odometer</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-black border-r-2 border-black">Acq. Cost</th>
            <th className="p-4 text-xs font-bold uppercase tracking-widest text-black">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-black">
          {VEHICLES.map((vehicle) => (
            <tr key={vehicle.reg} className="hover:bg-brand/10 transition-colors">
              <td className="p-4 font-mono font-bold border-r-2 border-black">{vehicle.reg}</td>
              <td className="p-4 font-medium border-r-2 border-black">{vehicle.name}</td>
              <td className="p-4 border-r-2 border-black">{vehicle.type}</td>
              <td className="p-4 border-r-2 border-black">{vehicle.capacity}</td>
              <td className="p-4 border-r-2 border-black">{vehicle.odometer}</td>
              <td className="p-4 border-r-2 border-black">{vehicle.cost}</td>
              <td className="p-4">
                <span className={`app-badge ${vehicle.badgeClass}`}>{vehicle.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Registry() {
  return (
    <div className="flex h-screen overflow-hidden bg-white text-black font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        <TopHeader />
        <div className="p-8 overflow-y-auto">
          <FilterControls />
          <VehicleTable />
          <div className="mt-6">
            <p className="text-black text-sm font-bold bg-warning/20 p-2 border-2 border-black inline-block">
              <span className="text-error">Rule:</span> Registration No. must be unique • Retired/In
              Shop vehicles are hidden from Trip Dispatcher
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}