import React, { useState } from "react";
import { LuX, LuChevronDown, LuUser, LuMail, LuLock } from "react-icons/lu";

const ROLES = [
  { label: "Fleet Manager", value: "fleet-manager" },
  { label: "Dispatcher", value: "dispatcher" },
  { label: "Safety Officer", value: "safety" },
  { label: "Financial Analyst", value: "analyst" },
];

const ACCESS_SCOPE = [
  "Fleet Manager → Fleet, Maintenance",
  "Dispatcher → Dashboard, Trips",
  "Safety Officer → Drivers, Compliance",
  "Financial Analyst → Fuel & Expenses, Analytics",
];

function BrandingSidebar({ mode }) {
  return (
    <section className="md:w-5/12 w-full p-8 md:p-16 flex flex-col justify-between bg-[#ccd1d9]" data-purpose="branding-sidebar">
      <div>
        <div className="mb-6">
          <div className="w-12 h-12 border-3 border-black bg-[#a65d00] flex items-center justify-center overflow-hidden">
            <div
              className="w-full h-full opacity-30"
              style={{
                backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
                backgroundSize: "4px 4px",
              }}
            />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">TransitOps</h1>
        <p className="text-xl font-medium mb-12">Smart Transport Operations Platform</p>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-6">
            {mode === "signin" ? "One login, four roles:" : "Built for every role:"}
          </h2>
          <ul className="space-y-3">
            {ROLES.map((role) => (
              <li key={role.value} className="flex items-center gap-3 text-lg font-medium">
                <span className="w-3 h-3 bg-[#a65d00] rounded-full border-2 border-black" />
                {role.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12 text-sm uppercase tracking-widest opacity-60">
        TransitOps © 2026 · RBAC ENABLED
      </div>
    </section>
  );
}

function ErrorSticky() {
  return (
    <div className="hidden xl:block auth-error-sticky text-[#ff4d4d]" data-purpose="error-feedback">
      <p className="text-xs font-bold mb-1 uppercase opacity-70">Error state</p>
      <div className="flex items-start gap-2">
        <LuX size={18} strokeWidth={3} className="shrink-0 mt-0.5" />
        <p className="text-sm font-medium leading-tight">
          Invalid credentials. Account locked after 5 failed attempts.
        </p>
      </div>
    </div>
  );
}

function RoleSelect({ id, value, onChange }) {
  return (
    <div data-purpose="form-field">
      <label className="block text-xs font-bold text-gray-400 uppercase mb-2" htmlFor={id}>
        Role (RBAC)
      </label>
      <div className="relative">
        <select
          className="auth-input w-full p-4 rounded-lg focus:ring-0 appearance-none pr-12"
          id={id}
          name="role"
          value={value}
          onChange={onChange}
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <LuChevronDown
          size={20}
          strokeWidth={2.5}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </div>
  );
}

function LoginForm({ onSwitch }) {
  const [role, setRole] = useState("dispatcher");

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <>
      <header className="mb-10">
        <h2 className="text-white text-4xl font-bold mb-2">Sign in to your account</h2>
        <p className="text-gray-400 font-medium">Enter your credentials to continue</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div data-purpose="form-field">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="auth-input w-full p-4 rounded-lg focus:ring-0"
            id="email"
            name="email"
            placeholder="Raven.k@transitops.in"
            type="email"
          />
        </div>

        <div data-purpose="form-field">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="auth-input w-full p-4 rounded-lg focus:ring-0"
            id="password"
            name="password"
            placeholder="••••••••"
            type="password"
          />
        </div>

        <RoleSelect id="role" value={role} onChange={(e) => setRole(e.target.value)} />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              className="w-5 h-5 bg-transparent border-2 border-brand text-brand focus:ring-0 focus:ring-offset-0 rounded"
              type="checkbox"
            />
            <span className="text-white font-medium">Remember me</span>
          </label>
          <a className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors" href="#">
            Forgot password?
          </a>
        </div>

        <button className="auth-button w-full py-4 text-white font-bold text-xl uppercase tracking-wider" type="submit">
          Sign In
        </button>
      </form>

      <p className="mt-8 text-gray-400 text-sm">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onSwitch} className="text-brand font-bold hover:underline">
          Sign up
        </button>
      </p>
    </>
  );
}

function SignUpForm({ onSwitch }) {
  const [role, setRole] = useState("dispatcher");

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <>
      <header className="mb-10">
        <h2 className="text-white text-4xl font-bold mb-2">Create your account</h2>
        <p className="text-gray-400 font-medium">Set up access to the TransitOps platform</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div data-purpose="form-field">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2" htmlFor="fullname">
            Full name
          </label>
          <div className="relative">
            <input
              className="auth-input w-full p-4 pl-12 rounded-lg focus:ring-0"
              id="fullname"
              name="fullname"
              placeholder="Raven Kapoor"
              type="text"
            />
            <LuUser size={18} strokeWidth={2.5} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div data-purpose="form-field">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2" htmlFor="signup-email">
            Email
          </label>
          <div className="relative">
            <input
              className="auth-input w-full p-4 pl-12 rounded-lg focus:ring-0"
              id="signup-email"
              name="email"
              placeholder="Raven.k@transitops.in"
              type="email"
            />
            <LuMail size={18} strokeWidth={2.5} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div data-purpose="form-field">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2" htmlFor="signup-password">
            Password
          </label>
          <div className="relative">
            <input
              className="auth-input w-full p-4 pl-12 rounded-lg focus:ring-0"
              id="signup-password"
              name="password"
              placeholder="••••••••"
              type="password"
            />
            <LuLock size={18} strokeWidth={2.5} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div data-purpose="form-field">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2" htmlFor="confirm-password">
            Confirm password
          </label>
          <div className="relative">
            <input
              className="auth-input w-full p-4 pl-12 rounded-lg focus:ring-0"
              id="confirm-password"
              name="confirmPassword"
              placeholder="••••••••"
              type="password"
            />
            <LuLock size={18} strokeWidth={2.5} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <RoleSelect id="signup-role" value={role} onChange={(e) => setRole(e.target.value)} />

        <label className="flex items-start gap-2 cursor-pointer group">
          <input
            className="w-5 h-5 mt-0.5 bg-transparent border-2 border-brand text-brand focus:ring-0 focus:ring-offset-0 rounded shrink-0"
            type="checkbox"
          />
          <span className="text-white font-medium text-sm">
            I agree to the Terms of Service and Privacy Policy
          </span>
        </label>

        <button className="auth-button w-full py-4 text-white font-bold text-xl uppercase tracking-wider" type="submit">
          Create Account
        </button>
      </form>

      <p className="mt-8 text-gray-400 text-sm">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="text-brand font-bold hover:underline">
          Sign in
        </button>
      </p>
    </>
  );
}

function AccessInfoFooter() {
  return (
    <footer className="mt-10 text-gray-400 text-sm italic" data-purpose="access-info">
      <p className="mb-4">Access is scoped by role after login:</p>
      <ul className="space-y-1 ml-2">
        {ACCESS_SCOPE.map((line) => (
          <li key={line}>• {line}</li>
        ))}
      </ul>
    </footer>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState("signin");

  const toggleMode = () => setMode((m) => (m === "signin" ? "signup" : "signin"));

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden font-sans">
      <BrandingSidebar mode={mode} />

      <main className="md:w-7/12 w-full bg-[#121212] p-8 md:p-16 flex items-center justify-center relative" data-purpose="login-container">
        <div className="w-full max-w-md relative">
          {mode === "signin" && <ErrorSticky />}

          {mode === "signin" ? <LoginForm onSwitch={toggleMode} /> : <SignUpForm onSwitch={toggleMode} />}

          <AccessInfoFooter />
        </div>
      </main>
    </div>
  );
}