import React from "react";
import Sidebar from "./Sidebar";

const SERVICE_LOG = [
  { vehicle: "VAN-05", service: "Oil Change", cost: "2,500", status: "In Shop" },
  { vehicle: "TRUCK-11", service: "Engine Repair", cost: "18,000", status: "Completed" },
  { vehicle: "MINI-03", service: "Tyre Replace", cost: "6,200", status: "In Shop" },
];

function TopBar() {
  return (
    <header className="h-16 border-b-2 border-black flex items-center justify-between px-8" data-purpose="top-bar">
      <div className="flex items-center w-1/3">
        <input className="app-input px-4 py-1.5 text-sm rounded-md" placeholder="Search..." type="text" />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-bold text-black">Raven K.</span>
        <div className="flex items-center space-x-2 bg-black/5 border-2 border-black py-1 px-3 rounded-full">
          <span className="text-xs font-bold">Dispatcher</span>
          <div className="w-7 h-7 rounded-full bg-info border border-black flex items-center justify-center text-[10px] font-bold text-white">
            RK
          </div>
        </div>
      </div>
    </header>
  );
}

function LogServiceForm() {
  return (
    <section className="w-full lg:w-2/5 space-y-6" data-purpose="log-form-section">
      <h2 className="text-lg font-black uppercase tracking-wider text-black">Log Service Record</h2>
      <form className="space-y-4">
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold uppercase text-gray-700">Vehicle</label>
          <input className="app-input p-3 rounded transition-all" type="text" defaultValue="VAN-05" />
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold uppercase text-gray-700">Service Type</label>
          <input className="app-input p-3 rounded transition-all" placeholder="e.g. Oil Change" type="text" />
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold uppercase text-gray-700">Cost</label>
          <input className="app-input p-3 rounded transition-all" placeholder="2,500" type="text" />
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold uppercase text-gray-700">Date</label>
          <input className="app-input p-3 rounded transition-all" type="text" defaultValue="07/07/2026" />
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold uppercase text-gray-700">Status</label>
          <input className="app-input p-3 rounded transition-all" type="text" defaultValue="Active" />
        </div>
        <button
          className="w-full bg-warning hover:bg-brand text-white hover:text-black font-black py-4 rounded border-3 border-black shadow-neo transition-all active:translate-x-1 active:translate-y-1 active:shadow-none mt-4 uppercase tracking-widest"
          type="button"
        >
          Save Record
        </button>
      </form>

      <div className="pt-10 space-y-4 border-t-2 border-black/5" data-purpose="status-diagram">
        <div className="flex items-center space-x-4">
          <span className="text-success font-black w-20">Available</span>
          <div className="flex-1 flex items-center">
            <div className="h-[2px] bg-black flex-1 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-600 uppercase">
                creating active record
              </div>
              <div className="status-arrow absolute -right-1 -top-1.5" />
            </div>
          </div>
          <span className="text-warning font-black w-20 text-right">In Shop</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-warning font-black w-20">In Shop</span>
          <div className="flex-1 flex items-center">
            <div className="h-[2px] bg-black flex-1 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-600 uppercase">
                closing record (not retired)
              </div>
              <div className="status-arrow absolute -right-1 -top-1.5" />
            </div>
          </div>
          <span className="text-success font-black w-20 text-right">Available</span>
        </div>
        <p className="text-xs text-warning font-bold italic mt-4">
          Note: In Shop vehicles are removed from the dispatch pool.
        </p>
      </div>
    </section>
  );
}

function ServiceLogTable() {
  return (
    <section className="w-full lg:w-3/5 space-y-6" data-purpose="service-log-table">
      <h2 className="text-lg font-black uppercase tracking-wider text-black">Service Log</h2>
      <div className="overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-4 border-black text-xs text-black uppercase tracking-widest">
              <th className="pb-4 font-black">Vehicle</th>
              <th className="pb-4 font-black">Service</th>
              <th className="pb-4 font-black">Cost</th>
              <th className="pb-4 font-black text-right">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y-2 divide-black/5">
            {SERVICE_LOG.map((row) => (
              <tr key={`${row.vehicle}-${row.service}`}>
                <td className="py-5 font-black text-black">{row.vehicle}</td>
                <td className="py-5 text-gray-800 font-medium">{row.service}</td>
                <td className="py-5 text-gray-800 font-medium">{row.cost}</td>
                <td className="py-5 text-right">
                  <span
                    className={`app-badge rounded ${
                      row.status === "Completed" ? "bg-success" : "bg-warning"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function Maintenance() {
  return (
    <div className="font-sans antialiased min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col bg-white">
        <TopBar />
        <div className="p-8 flex flex-col lg:flex-row gap-12">
          <LogServiceForm />
          <ServiceLogTable />
        </div>
      </main>
    </div>
  );
}