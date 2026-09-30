import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Landmark, LogIn, UserPlus, Mail, Lock, User, Building2, Map, BookOpen, Scale, Zap } from "lucide-react";
import { ROLES, REGISTERABLE } from "../roles";

const FEATURES = [
  [Map, "Map land use, climate risk and projects in one place"],
  [BookOpen, "Search research and policy papers with an AI assistant"],
  [Scale, "Simulate a reform before it is implemented"],
];

export default function LandingPage() {
  const nav = useNavigate();
  const [tab, setTab] = useState("login");
  const [err, setErr] = useState("");
  const [f, setF] = useState({ name: "", email: "", org: "", password: "", role: "researcher" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  function submit(e) {
    e.preventDefault();
    if (!f.email.trim() || !f.password.trim() || (tab === "register" && !f.name.trim())) {
      setErr("Fill in all required fields.");
      return;
    }
    setErr("");
    // DEMO ONLY: no real login yet. Goes straight to the chosen role's page.
    nav(ROLES[f.role].path);
  }

  const field = "w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
  const Icon = ({ I }) => <I size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />;

  return (
    <div className="grid min-h-screen bg-slate-50 font-['Public_Sans',sans-serif] lg:grid-cols-2">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Public+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Brand panel */}
      <section className="flex flex-col justify-between bg-[#0a1a44] p-8 text-white sm:p-12">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600"><Landmark size={20} /></span>
          <span className="font-['Newsreader',serif] text-2xl font-semibold">Bhoomi</span>
        </div>
        <div className="my-12">
          <h1 className="max-w-lg font-['Newsreader',serif] text-4xl font-medium leading-tight sm:text-5xl">
            Evidence for better land governance.
          </h1>
          <p className="mt-4 max-w-md text-lg text-blue-100">
            A national platform for research, policy testing and open land data.
          </p>
          <ul className="mt-8 space-y-4">
            {FEATURES.map(([I, t]) => (
              <li key={t} className="flex items-center gap-3 text-blue-50">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10"><I size={18} /></span>{t}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-blue-200">Department of Land Resources, Ministry of Rural Development</p>
      </section>

      {/* Auth panel */}
      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="grid grid-cols-2 rounded-xl bg-slate-200 p-1" role="tablist">
            {[["login", LogIn, "Sign in"], ["register", UserPlus, "Register"]].map(([id, I, l]) => (
              <button key={id} role="tab" aria-selected={tab === id} onClick={() => { setTab(id); setErr(""); }}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold ${tab === id ? "bg-white text-blue-800 shadow" : "text-slate-600"}`}>
                <I size={16} />{l}
              </button>
            ))}
          </div>

          <h2 className="mt-8 font-['Newsreader',serif] text-3xl font-medium text-slate-900">
            {tab === "login" ? "Welcome back" : "Create your account"}
          </h2>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {tab === "register" && (
              <div className="relative"><Icon I={User} /><input aria-label="Full name" placeholder="Full name" value={f.name} onChange={set("name")} className={field} /></div>
            )}
            <div className="relative"><Icon I={Mail} /><input type="email" aria-label="Email" placeholder="Email" value={f.email} onChange={set("email")} className={field} /></div>
            {tab === "register" && (
              <div className="relative"><Icon I={Building2} /><input aria-label="Organisation" placeholder="Organisation (optional)" value={f.org} onChange={set("org")} className={field} /></div>
            )}
            <div className="relative"><Icon I={Lock} /><input type="password" aria-label="Password" placeholder="Password" value={f.password} onChange={set("password")} className={field} /></div>

            <label className="block text-sm font-medium text-slate-700">
              {tab === "login" ? "Sign in as" : "I am joining as"}
              <select value={f.role} onChange={set("role")} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm">
                {(tab === "login" ? Object.keys(ROLES) : REGISTERABLE).map((r) => <option key={r} value={r}>{ROLES[r].label}</option>)}
              </select>
            </label>

            {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
            <button className="w-full rounded-xl bg-blue-700 py-3 font-semibold text-white hover:bg-blue-800">
              {tab === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button onClick={() => nav("/public")} className="mt-3 w-full rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 hover:bg-white">
            Continue as guest
          </button>

          {/* Demo shortcuts: delete before the final submission */}
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Zap size={15} className="text-amber-500" />Demo quick access</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(ROLES).map(([id, r]) => (
                <button key={id} onClick={() => nav(r.path)}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold text-white" style={{ background: r.hex }}>{r.label}</button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}