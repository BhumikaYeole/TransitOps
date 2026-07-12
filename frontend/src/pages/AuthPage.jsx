import React, { useState } from "react";
import { LuX, LuChevronDown, LuUser, LuMail, LuLock } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import API from "../services/api.js";

const ROLES = [
  { label: "Fleet Manager", value: "Fleet Manager" },
  { label: "Dispatcher", value: "Dispatcher" },
  { label: "Safety Officer", value: "Safety Officer" },
  { label: "Financial Analyst", value: "Financial Analyst" },
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

function ErrorSticky({ error, onClose }) {
  if (!error) return null;
  return (
    <div className="xl:block auth-error-sticky text-[#ff4d4d] bg-[#121212] p-4 border-3 border-black shadow-neo-sm z-20" style={{ right: "-12rem" }} data-purpose="error-feedback">
      <p className="text-xs font-bold mb-1 uppercase opacity-70 flex justify-between items-center">
        <span>Error state</span>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
          <LuX size={14} strokeWidth={3} />
        </button>
      </p>
      <div className="flex items-start gap-2">
        <p className="text-sm font-medium leading-tight">
          {error}
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
          className="auth-input w-full p-4 rounded-lg focus:ring-0 appearance-none pr-12 text-white bg-[#1e1e1e]"
          id={id}
          name="role"
          value={value}
          onChange={onChange}
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value} className="text-white">
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

function LoginForm({ onSwitch, setError, loading, setLoading }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Dispatcher");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/sign-in", { email, password, role });
      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
      toast.success("Successfully logged in!");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Invalid credentials. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
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
            className="auth-input w-full p-4 rounded-lg focus:ring-0 text-white"
            id="email"
            name="email"
            placeholder="Raven.k@transitops.in"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div data-purpose="form-field">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="auth-input w-full p-4 rounded-lg focus:ring-0 text-white"
            id="password"
            name="password"
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
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

        <button
          className="auth-button w-full py-4 text-black bg-brand hover:bg-[#ffd100]/95 font-bold text-xl uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <p className="mt-8 text-gray-400 text-sm">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onSwitch} className="text-brand font-bold hover:underline cursor-pointer">
          Sign up
        </button>
      </p>
    </>
  );
}

function SignUpForm({ onSwitch, setError, loading, setLoading }) {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Dispatcher");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullname || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/sign-up", { name: fullname, email, password, role });
      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
      toast.success("Successfully registered!");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Registration failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
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
              className="auth-input w-full p-4 pl-12 rounded-lg focus:ring-0 text-white"
              id="fullname"
              name="fullname"
              placeholder="Raven Kapoor"
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              disabled={loading}
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
              className="auth-input w-full p-4 pl-12 rounded-lg focus:ring-0 text-white"
              id="signup-email"
              name="email"
              placeholder="Raven.k@transitops.in"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
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
              className="auth-input w-full p-4 pl-12 rounded-lg focus:ring-0 text-white"
              id="signup-password"
              name="password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
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
              className="auth-input w-full p-4 pl-12 rounded-lg focus:ring-0 text-white"
              id="confirm-password"
              name="confirmPassword"
              placeholder="••••••••"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
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

        <button
          className="auth-button w-full py-4 text-black bg-brand hover:bg-[#ffd100]/95 font-bold text-xl uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>

      <p className="mt-8 text-gray-400 text-sm">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="text-brand font-bold hover:underline cursor-pointer">
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setError("");
    setMode((m) => (m === "signin" ? "signup" : "signin"));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden font-sans">
      <BrandingSidebar mode={mode} />

      <main className="md:w-7/12 w-full bg-[#121212] p-8 md:p-16 flex items-center justify-center relative" data-purpose="login-container">
        <div className="w-full max-w-md relative">
          <ErrorSticky error={error} onClose={() => setError("")} />

          {mode === "signin" ? (
            <LoginForm onSwitch={toggleMode} setError={setError} loading={loading} setLoading={setLoading} />
          ) : (
            <SignUpForm onSwitch={toggleMode} setError={setError} loading={loading} setLoading={setLoading} />
          )}

          <AccessInfoFooter />
        </div>
      </main>
    </div>
  );
}