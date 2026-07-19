# TransitOps - Odoo Hacakathon Submission

**Smart Transport Operations Platform**

TransitOps is a centralized platform for managing the complete lifecycle of transport operations - vehicle registration, driver management, trip dispatching, maintenance, fuel & expense tracking, and operational analytics, replacing the spreadsheets and manual logbooks most logistics teams still rely on.

---

## The Problem

Logistics companies frequently manage fleets through spreadsheets and paper logbooks, which leads to:

- Scheduling conflicts and vehicle double-booking
- Underutilized vehicles sitting idle
- Missed or untracked maintenance
- Drivers dispatched with expired licenses
- Inaccurate, scattered expense tracking
- No real-time visibility into fleet health or cost

TransitOps solves this with a single system of record for vehicles, drivers, trips, maintenance, and expenses — enforcing business rules automatically instead of relying on manual discipline.

---

## Roles

TransitOps supports Role-Based Access Control (RBAC) across four personas:

| Role | Responsibilities |
|---|---|
| **Fleet Manager** | Oversees fleet assets, maintenance, vehicle lifecycle, and operational efficiency |
| **Dispatcher** | Creates trips, assigns vehicles and drivers, monitors active deliveries |
| **Safety Officer** | Ensures driver compliance, tracks license validity, monitors safety scores |
| **Financial Analyst** | Reviews operational expenses, fuel consumption, maintenance costs, and profitability |

Each role sees a scoped set of modules — see the **Settings → Role-Based Access** screen for the full access matrix.

---

## Features

###  Authentication
Email/password login and sign-up with role selection at account creation. Only authenticated users can access the app.

###  Dashboard
KPI cards for Active Vehicles, Available Vehicles, Vehicles in Maintenance, Active Trips, Pending Trips, Drivers on Duty, and Fleet Utilization (%), plus filters by vehicle type, status, and region.

###  Vehicle Registry (Fleet)
Master list of vehicles with Registration Number (unique), Name/Model, Type, Max Load Capacity, Odometer, Acquisition Cost, and Status (`Available` / `On Trip` / `In Shop` / `Retired`).

###  Driver Management
Driver profiles with Name, License Number, License Category, License Expiry, Contact Number, Safety Score, and Status (`Available` / `On Trip` / `Off Duty` / `Suspended`). Expired licenses are visibly flagged.

###  Trip Dispatcher
Create trips by selecting a source, destination, available vehicle, available driver, cargo weight, and planned distance. Trip lifecycle: `Draft → Dispatched → Completed → Cancelled`. Cargo weight is validated live against vehicle capacity, blocking dispatch on overload.

###  Maintenance
Log service records per vehicle. Creating an active maintenance record automatically flips the vehicle to `In Shop`, removing it from the dispatch pool; closing the record restores it to `Available` (unless retired).

###  Fuel & Expense Management
Fuel logs (liters, cost, date) and other expenses (tolls, misc.), with automatic roll-up of total operational cost (Fuel + Maintenance) per vehicle.

###  Reports & Analytics
Fuel Efficiency, Fleet Utilization, Operational Cost, and Vehicle ROI:

```
ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost
```

###  Settings & RBAC
General depot settings (name, currency, distance unit) and a role-based access matrix showing which modules each role can view, edit, or is blocked from.
