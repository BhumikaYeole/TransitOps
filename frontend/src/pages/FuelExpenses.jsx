import React from "react";
import Sidebar from "./Sidebar";

const FUEL_LOGS = [
  { vehicle: "VAN-05", date: "05 Jul 2026", liters: "42 L", cost: "3,150" },
  { vehicle: "TRUCK-11", date: "06 Jul 2026", liters: "110 L", cost: "8,400" },
  { vehicle: "MINI-08", date: "06 Jul 2026", liters: "28 L", cost: "2,050" },
];

const OTHER_EXPENSES = [
  { trip: "TR001", vehicle: "VAN-05", toll: "120", other: "0", maint: "0", status: "Available", badgeClass: "bg-success" },
  { trip: "TR002", vehicle: "TRK-12", toll: "340", other: "150", maint: "18,000", status: "Completed", badgeClass: "bg-info" },
];

function Header() {
  return (
    <header className="border-b-2 border-black p-4 flex justify-between items-center bg-white" data-purpose="app-header">
      <h1 className="text-2xl font-bold italic uppercase tracking-wide text-black">Fuel &amp; Expense Management</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Raven K.</span>
        <div className="flex items-center gap-2">
          <span className="text-xs border-2 border-black bg-blue-100 text-black px-2 py-0.5 font-bold">Dispatcher</span>
          <div className="w-10 h-10 rounded-full bg-blue-400 border-2 border-black flex items-center justify-center font-bold text-black text-sm shadow-neo-sm">
            RK
          </div>
        </div>
      </div>
    </header>
  );
}

function FuelLogsSection() {
  return (
    <section className="mb-12" data-purpose="fuel-logs-container">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wide text-black">Fuel Logs</h2>
        <div className="flex gap-4">
          <button className="bg-warning hover:bg-brand hover:text-black text-white font-bold py-2 px-6 border-2 border-black shadow-neo uppercase tracking-wide transition-all transform active:translate-y-1 active:shadow-none">
            + Log Fuel
          </button>
          <button className="bg-warning hover:bg-brand hover:text-black text-white font-bold py-2 px-6 border-2 border-black shadow-neo uppercase tracking-wide transition-all transform active:translate-y-1 active:shadow-none">
            + Add Expense
          </button>
        </div>
      </div>
      <div className="border-t-2 border-black">
        <table className="w-full text-left border-collapse" data-purpose="fuel-logs-table">
          <thead>
            <tr className="text-black text-xs uppercase tracking-wider border-b-2 border-black">
              <th className="py-4 font-bold">Vehicle</th>
              <th className="py-4 font-bold">Date</th>
              <th className="py-4 font-bold">Liters</th>
              <th className="py-4 font-bold">Fuel Cost</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {FUEL_LOGS.map((log) => (
              <tr key={`${log.vehicle}-${log.date}`} className="border-b border-black">
                <td className="py-4 font-bold">{log.vehicle}</td>
                <td className="py-4">{log.date}</td>
                <td className="py-4">{log.liters}</td>
                <td className="py-4">{log.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function OtherExpensesSection() {
  return (
    <section className="mb-8" data-purpose="other-expenses-container">
      <h2 className="text-xl font-bold uppercase tracking-wide text-black mb-6">Other Expenses (Toll / Misc)</h2>
      <div className="border-t-2 border-black">
        <table className="w-full text-left border-collapse" data-purpose="expenses-table">
          <thead>
            <tr className="text-black text-xs uppercase tracking-wider border-b-2 border-black">
              <th className="py-4 font-bold">Trip</th>
              <th className="py-4 font-bold">Vehicle</th>
              <th className="py-4 font-bold">Toll</th>
              <th className="py-4 font-bold">Other</th>
              <th className="py-4 font-bold">Maint. (Linked)</th>
              <th className="py-4 font-bold">Total</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {OTHER_EXPENSES.map((row) => (
              <tr key={row.trip} className="border-b border-black">
                <td className="py-4">{row.trip}</td>
                <td className="py-4 font-bold">{row.vehicle}</td>
                <td className="py-4">{row.toll}</td>
                <td className="py-4">{row.other}</td>
                <td className="py-4">{row.maint}</td>
                <td className="py-4">
                  <span className={`app-badge ${row.badgeClass}`}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function FuelExpenses() {
  return (
    <div className="bg-white text-black font-sans min-h-screen flex flex-col">
      {/* <Header /> */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8 bg-white" data-purpose="main-dashboard-area">
          <div className="mb-8 max-w-md">
            <input className="app-input text-sm shadow-neo-sm" placeholder="Search..." type="text" />
          </div>

          <FuelLogsSection />
          <OtherExpensesSection />

          <footer className="mt-4 pt-4 border-t-2 border-black flex justify-between items-center" data-purpose="summary-costs">
            <div className="text-sm font-bold text-black uppercase">Total Operational Cost (Auto) = Fuel + Maint</div>
            <div className="text-3xl font-bold text-warning underline decoration-2 decoration-black">34,070</div>
          </footer>
        </main>
      </div>
    </div>
  );
}