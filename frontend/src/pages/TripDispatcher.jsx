import React from "react";
import Sidebar from "./Sidebar";

const LIFECYCLE_STAGES = [
  { label: "Draft", color: "bg-success" },
  { label: "Dispatched", color: "bg-info" },
  { label: "Completed", color: "bg-gray-200" },
  { label: "Cancelled", color: "bg-gray-200" },
];

const TRIP_CARDS = [
  {
    id: "TR001",
    route: "Gandhinagar Depot → Ahmedabad Hub",
    assignment: "VAN-05 / ALEX",
    status: "Dispatched",
    statusClass: "bg-info",
    note: "45 min",
    noteClass: "text-muted font-bold",
  },
  {
    id: "TR004",
    route: "Vatva Industrial Area → Sanand Warehouse",
    assignment: "TRUCK-04 / SURESH",
    status: "Draft",
    statusClass: "bg-gray-200 text-black",
    note: "Awaiting driver",
    noteClass: "text-muted font-bold italic",
  },
  {
    id: "TR006",
    route: "Mansa → Kalol Depot",
    assignment: "Unassigned",
    status: "Cancelled",
    statusClass: "bg-error",
    note: "Vehicle went to shop",
    noteClass: "text-error font-bold italic",
  },
];

function TopHeader() {
  return (
    <header className="p-6 border-b-3 border-black flex justify-between items-center bg-white sticky top-0 z-10">
      <div className="flex-1 max-w-xl">
        <input className="app-input px-4 py-2" data-purpose="top-search" placeholder="Search..." type="text" />
      </div>
      <div className="flex items-center gap-4 ml-6">
        <span className="text-gray-500 font-bold">Raven K.</span>
        <div className="w-10 h-10 bg-info border-3 border-black flex items-center justify-center font-bold text-white rounded-full shadow-neo">
          RK
        </div>
        <button className="btn-primary">Dispatcher</button>
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

function CreateTripForm() {
  return (
    <section className="flex flex-col gap-6" data-purpose="create-trip-form">
      <h2 className="text-2xl font-black uppercase italic">Create Trip</h2>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase text-gray-500">Source</label>
        <input className="app-input font-medium" type="text" defaultValue="Gandhinagar Depot" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase text-gray-500">Destination</label>
        <input className="app-input font-medium" type="text" defaultValue="Ahmedabad Hub" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase text-gray-500">Vehicle (Available Only)</label>
        <input className="app-input font-medium" type="text" defaultValue="VAN-05 - 500 kg capacity" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase text-gray-500">Driver (Available Only)</label>
        <input className="app-input font-medium" type="text" defaultValue="Alex" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase text-gray-500">Cargo Weight (KG)</label>
        <input className="app-input font-medium" type="number" defaultValue={700} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase text-gray-500">Planned Distance (KM)</label>
        <input className="app-input font-medium" type="number" defaultValue={38} />
      </div>

      <div className="p-4 border-3 border-error bg-error/10 text-error font-bold" data-purpose="form-validation">
        <div className="flex flex-col gap-1">
          <span>Vehicle Capacity: 500 kg</span>
          <span>Cargo Weight: 700 kg</span>
          <div className="flex items-center gap-2 mt-2 font-black uppercase">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                clipRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                fillRule="evenodd"
              />
            </svg>
            Capacity exceeded by 200 kg — dispatch blocked
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-4">
        <button className="flex-1 p-4 bg-gray-100 border-3 border-gray-400 text-gray-400 font-bold cursor-not-allowed" disabled>
          Dispatch (disabled)
        </button>
        <button className="flex-1 p-4 btn-outline-error">Cancel</button>
      </div>
    </section>
  );
}

function LiveBoard() {
  return (
    <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Live Board</h2>
      <div className="flex flex-col gap-6 overflow-y-auto" data-purpose="trip-cards-container">
        {TRIP_CARDS.map((trip) => (
          <div
            key={trip.id}
            className="border-3 border-black p-6 border-dashed hover:border-solid transition-all flex flex-col gap-4 bg-white shadow-neo"
            data-purpose="trip-card"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xl font-black">{trip.id}</div>
                <div className="text-lg font-bold">{trip.route}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-gray-500 uppercase">{trip.assignment}</div>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div className={`px-4 py-1 font-bold border-2 border-black shadow-neo-sm ${trip.statusClass}`}>
                {trip.status}
              </div>
              <div className={trip.noteClass}>{trip.note}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6 text-xs font-bold text-gray-500 italic" data-purpose="footer-legend">
        On Complete: odometer → fuel log → expenses → Vehicle &amp; Driver Available
      </div>
    </div>
  );
}

export default function TripDispatcher() {
  return (
    <div className="font-sans min-h-screen">
      <div className="flex h-screen overflow-hidden border-b-3 border-black">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto">
          <TopHeader />
          <div className="p-8 grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
              <TripLifecycle />
              <CreateTripForm />
            </div>
            <LiveBoard />
          </div>
        </main>
      </div>
    </div>
  );
}