import { useState } from "react";
import { CloudSun, Mail, Lock, User as UserIcon, MapPin } from "lucide-react";

export default function Login({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function submit(e) {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:5000/api/test");

    const data = await response.json();

 console.log("BACKEND MESSAGE:", data.message);

    onAuth();
  } catch (error) {
    console.error("Backend error:", error);
  }
}

  return (
    <div className="min-h-screen bg-sky-wash flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <span className="h-14 w-14 rounded-xl3 bg-hero-gradient flex items-center justify-center shadow-pop mb-4">
            <CloudSun size={26} className="text-white" strokeWidth={2.2} />
          </span>
          <h1 className="text-2xl font-display font-extrabold text-ink-900">WeatherCircle</h1>
          <p className="text-sm text-ink-400 mt-1">Weather, shared with the people who matter.</p>
        </div>

        <div className="bg-white rounded-xl3 shadow-card p-6">
          <div className="flex gap-1 bg-sky-50 rounded-full p-1 mb-6">
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 text-sm font-semibold py-2 rounded-full transition-colors capitalize ${
                  mode === m ? "bg-white text-sky-700 shadow-card" : "text-ink-500"
                }`}
              >
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3">
            {mode === "register" && (
              <Field icon={UserIcon} placeholder="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            )}
            <Field icon={Mail} type="email" placeholder="Email address" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field icon={Lock} type="password" placeholder="Password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />

            <button
              type="submit"
              className="mt-2 bg-sky-500 hover:bg-sky-600 transition-colors text-white font-semibold text-sm py-3 rounded-xl2 shadow-soft"
            >
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {mode === "register" && (
            <p className="flex items-center gap-1.5 text-xs text-ink-400 mt-4 justify-center">
              <MapPin size={12} /> We'll ask for your location after sign-up.
            </p>
          )}
        </div>

        <p className="text-center text-xs text-ink-400 mt-6">Demo build — any details will sign you in.</p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, type = "text", placeholder, value, onChange }) {
  return (
    <div className="relative">
      <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-sky-50 rounded-xl2 pl-10 pr-4 py-3 text-sm text-ink-800 placeholder:text-ink-400 outline-none focus:ring-2 focus:ring-sky-300 transition-shadow"
      />
    </div>
  );
}



