import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import {
  Landmark, LogOut, ArrowUpRight, ArrowDownRight, Play, Scale, FileText, Megaphone, Target, Bell, Loader2, X, CheckCircle2, MapPin,
} from "lucide-react";

/* Palette: cream page, deep green and deep blue cards, soft sage and soft blue panels */

/* ---------- Sample data (replace with API calls) ---------- */
const KPIS = [
  { label: "Policy performance index", value: "74", unit: "/ 100", delta: "+3.2 this quarter", up: true, good: true, tone: "green", data: [61, 63, 66, 65, 69, 71, 72, 74] },
  { label: "Dispute resolution rate", value: "68%", unit: "", delta: "+2 pts this quarter", up: true, good: true, tone: "blue", data: [58, 60, 61, 63, 64, 66, 67, 68] },
  { label: "Climate risk index", value: "41", unit: "/ 100", delta: "+1.8 this quarter", up: true, good: false, tone: "green", data: [35, 36, 37, 38, 38, 39, 40, 41] },
  { label: "Projects on schedule", value: "79%", unit: "", delta: "-1.4 pts this quarter", up: false, good: false, tone: "blue", data: [84, 83, 83, 82, 81, 80, 80, 79] },
];
const POLICIES = [
  { name: "ULPIN rollout", actual: 72, expected: 80, stages: ["done", "active", "todo"], dates: ["Mar 2023", "Apr 2023 to now", "Due Dec 2026"] },
  { name: "Land records digitisation", actual: 88, expected: 85, stages: ["done", "active", "todo"], dates: ["Jan 2022", "Feb 2022 to now", "Due Jun 2027"] },
  { name: "Fast-track land courts", actual: 41, expected: 60, stages: ["done", "active", "todo"], dates: ["Jul 2023", "Sep 2023 to now", "Due Mar 2027"] },
  { name: "Farmland protection scheme", actual: 57, expected: 55, stages: ["done", "done", "active"], dates: ["Jun 2021", "Jul 2021 to Mar 2025", "Measured Jan 2026"] },
];
const METRICS = [
  ["farm", "Farmland lost by 2035", "%", "Farmland"], ["built", "Built-up growth", "%", "Built-up"], ["infra", "Infrastructure pressure", "index", "Infra"],
  ["climate", "Climate-risk exposure", "% of area", "Climate"], ["disputes", "Pending disputes", "thousand", "Disputes"],
];
const SCEN = [
  { id: "s1", name: "Status quo (no change)", vals: { farm: 6.4, built: 9.2, infra: 78, climate: 26, disputes: 412 } },
  { id: "s2", name: "Cap conversion of irrigated land", vals: { farm: 3.1, built: 7.4, infra: 71, climate: 24, disputes: 398 } },
  { id: "s3", name: "Faster digital dispute resolution", vals: { farm: 6.0, built: 9.0, infra: 76, climate: 25, disputes: 265 } },
];
const BASE = SCEN[0].vals;
const LEVERS = {
  "Limit farmland conversion": { farm: 0.6, built: 0.25, infra: 0.05 },
  "Fast-track dispute resolution": { disputes: 0.55 },
  "Restrict building in flood zones": { climate: 0.35, infra: 0.1, built: 0.1 },
  "Encourage compact urban growth": { built: 0.3, farm: 0.35, infra: 0.2 },
};
const REGIONS = ["All India", "Maharashtra", "Karnataka", "Bihar", "Assam", "Odisha", "Uttar Pradesh"];
const ALERTS = [
  { sev: "High", title: "Farmland conversion is 2.3 times its usual rate around Nashik", note: "Found in the latest satellite pass, Nashik district" },
  { sev: "Medium", title: "Dispute filings are rising in three Bihar districts", note: "Up 31% over the last two months" },
  { sev: "Medium", title: "New construction inside a mapped flood zone", note: "Near Guwahati, Kamrup Metropolitan" },
  { sev: "Low", title: "Project milestone delays are clustering in Odisha", note: "9 of 24 projects are behind plan" },
];
const SEV = { High: "bg-[#f1d3cb] text-[#8a3324]", Medium: "bg-[#f3e3b8] text-[#7a5a12]", Low: "bg-[#dbe6d5] text-[#2f5a43]" };

const MODALS = {
  challenge: {
    title: "Post a challenge or pilot", sub: "It appears in the Innovation portal for researchers and industry experts.", cta: "Post to portal",
    fields: [
      { k: "title", label: "Title" }, { k: "type", label: "Type", options: ["Research challenge", "Pilot project", "Hackathon"] },
      { k: "region", label: "Region", options: REGIONS }, { k: "brief", label: "What should applicants deliver?", area: true }, { k: "deadline", label: "Deadline", date: true },
    ],
  },
  baseline: {
    title: "Set a monitoring baseline", sub: "New data is compared with this value to show actual against expected results.", cta: "Save baseline",
    fields: [
      { k: "policy", label: "Policy", options: POLICIES.map((p) => p.name) },
      { k: "indicator", label: "Indicator", options: ["Parcels with ULPIN", "Records digitised", "Cases resolved", "Farmland area"] },
      { k: "value", label: "Baseline value" }, { k: "date", label: "Baseline date", date: true },
    ],
  },
  report: {
    title: "Generate a decision report", sub: "Combines indicators, maps and the scenario results you pick.", cta: "Generate report",
    fields: [
      { k: "title", label: "Report title" }, { k: "source", label: "Based on", options: [...SCEN.map((s) => s.name), ...POLICIES.map((p) => p.name)] },
      { k: "format", label: "Format", options: ["PDF", "Excel", "CSV"] },
    ],
  },
};

const input = "mt-1.5 w-full rounded-xl border border-[#d8ceb2] bg-[#fffdf6] px-3 py-2.5 text-sm outline-none focus:border-[#1f4d3a]";

export default function PolicyMaker() {
  const nav = useNavigate();
  const [scen, setScen] = useState(SCEN);
  const [a, setA] = useState("s1");
  const [b, setB] = useState("s2");
  const [sim, setSim] = useState({ region: REGIONS[0], lever: Object.keys(LEVERS)[0], strength: 60 });
  const [reports, setReports] = useState([
    { id: 1, title: "Impact of ULPIN rollout, FY25", date: "20 Sep", status: "Ready" },
    { id: 2, title: "Fast-track courts: first year review", date: "02 Sep", status: "Ready" },
    { id: 3, title: "Flood-zone construction options", date: "18 Aug", status: "Ready" },
  ]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [formErr, setFormErr] = useState("");
  const [toast, setToast] = useState("");
  const firstRef = useRef(null);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3200); return () => clearTimeout(t); } }, [toast]);
  useEffect(() => {
    if (!modal) return;
    firstRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && setModal(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  function openModal(m) {
    const init = {};
    MODALS[m].fields.forEach((f) => { init[f.k] = f.options ? f.options[0] : ""; });
    setForm(init); setFormErr(""); setModal(m);
  }

  function submitModal(e) {
    e.preventDefault();
    const first = MODALS[modal].fields[0];
    if (!String(form[first.k]).trim()) return setFormErr(`Fill in “${first.label}”.`);
    if (modal === "report") {
      const id = Date.now();
      // TODO: POST /api/reports
      setReports((r) => [{ id, title: form.title, date: "today", status: "Generating" }, ...r]);
      setTimeout(() => setReports((r) => r.map((x) => (x.id === id ? { ...x, status: "Ready" } : x))), 2500);
      setToast("Report is being generated.");
    } else if (modal === "challenge") {
      setToast("Posted to the Innovation portal."); // TODO: POST /api/innovation/challenges
    } else {
      setToast("Baseline saved."); // TODO: POST /api/monitoring/baselines
    }
    setModal(null);
  }

  function runSimulation(e) {
    e.preventDefault();
    const f = LEVERS[sim.lever], vals = {};
    Object.keys(BASE).forEach((k) => {
      const v = BASE[k] * (1 - ((f[k] || 0) * sim.strength) / 100);
      vals[k] = k === "infra" || k === "disputes" ? Math.round(v) : +v.toFixed(1);
    });
    // TODO: POST /api/simulations and use the returned model results
    const s = { id: `s${Date.now()}`, name: `${sim.lever}, ${sim.strength}% strength (${sim.region})`, vals };
    setScen((x) => [...x, s]); setB(s.id);
    setToast("Simulation finished. It is now Scenario B below.");
  }

  const A = scen.find((s) => s.id === a), B = scen.find((s) => s.id === b);
  const chart = METRICS.map(([k, , , short]) => ({ m: short, A: Math.round((A.vals[k] / BASE[k]) * 100), B: Math.round((B.vals[k] / BASE[k]) * 100) }));
  const tone = { green: "bg-[#1f4d3a] text-[#eef3ea]", blue: "bg-[#1e3a5f] text-[#eaf0f6]" };

  return (
    <div className="min-h-screen bg-[#f3ecdc] text-[#1f2a24] font-['Public_Sans',sans-serif]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Public+Sans:wght@400;500;600&display=swap');`}</style>

      <header className="border-b border-[#ddd2b5] bg-[#f3ecdc]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-5 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#1f4d3a] text-[#eef3ea]"><Landmark size={18} /></span>
          <span className="font-['Newsreader',serif] text-xl font-semibold">Bhoomi</span>
          <span className="rounded-full bg-[#dbe6d5] px-3 py-1 text-xs font-semibold text-[#2f5a43]">Policymaker</span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {[["challenge", Megaphone, "Post challenge"], ["baseline", Target, "Set baseline"], ["report", FileText, "Generate report"]].map(([m, I, l]) => (
              <button key={m} onClick={() => openModal(m)} className="flex items-center gap-2 rounded-xl border border-[#cfc4a5] bg-[#faf6ea] px-3.5 py-2 text-sm font-semibold hover:bg-white"><I size={15} />{l}</button>
            ))}
            <button onClick={() => nav("/")} aria-label="Sign out" className="grid h-10 w-10 place-items-center rounded-xl text-[#5c5a4b] hover:bg-[#e8dfc6]"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-5 py-8">
        <div>
          <h1 className="font-['Newsreader',serif] text-3xl font-medium">Policy command centre</h1>
          <p className="text-[#5c5a4b]">How policies are performing, what could change, and what needs attention.</p>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KPIS.map((k) => {
            const Arrow = k.up ? ArrowUpRight : ArrowDownRight;
            return (
              <div key={k.label} className={`overflow-hidden rounded-2xl ${tone[k.tone]}`}>
                <div className="p-5 pb-1">
                  <p className="text-sm opacity-80">{k.label}</p>
                  <p className="mt-1 font-['Newsreader',serif] text-4xl font-semibold">{k.value}<span className="ml-1 text-base font-normal opacity-70">{k.unit}</span></p>
                  <p className={`mt-1 flex items-center gap-1 text-sm font-medium ${k.good ? "text-[#b6e3c1]" : "text-[#f4c2b4]"}`}><Arrow size={16} />{k.delta}</p>
                </div>
                <div className="h-14">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={k.data.map((v, i) => ({ i, v }))} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                      <Area type="monotone" dataKey="v" stroke="#f3ecdc" strokeWidth={2} fill="#f3ecdc" fillOpacity={0.15} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scenario comparison + launch */}
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl bg-[#dfe9d8] p-6 lg:col-span-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Scale size={18} /> Compare scenarios</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[["A", a, setA, "bg-[#1f4d3a]"], ["B", b, setB, "bg-[#1e3a5f]"]].map(([l, val, fn, c]) => (
                <label key={l} className="text-sm font-medium">
                  <span className={`mr-2 inline-grid h-6 w-6 place-items-center rounded-md text-xs text-white ${c}`}>{l}</span>Scenario {l}
                  <select value={val} onChange={(e) => fn(e.target.value)} className={input}>{scen.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                </label>
              ))}
            </div>
            <div className="mt-4 overflow-x-auto rounded-xl bg-[#faf6ea]">
              <table className="w-full min-w-[480px] text-sm">
                <thead><tr className="text-left text-[#5c5a4b]"><th className="p-3 font-medium">Indicator</th><th className="p-3 font-medium">A</th><th className="p-3 font-medium">B</th><th className="p-3 font-medium">B compared with A</th></tr></thead>
                <tbody>
                  {METRICS.map(([k, label, unit]) => {
                    const d = +(B.vals[k] - A.vals[k]).toFixed(1);
                    return (
                      <tr key={k} className="border-t border-[#e6dcc2]">
                        <td className="p-3">{label} <span className="text-xs text-[#7a775f]">({unit})</span></td>
                        <td className="p-3 font-semibold">{A.vals[k]}</td><td className="p-3 font-semibold">{B.vals[k]}</td>
                        <td className={`p-3 font-medium ${d < 0 ? "text-[#2f6b4a]" : d > 0 ? "text-[#9b3b2f]" : "text-[#7a775f]"}`}>{d === 0 ? "No change" : `${d > 0 ? "+" : ""}${d} (${d < 0 ? "better" : "worse"})`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm font-medium">Each scenario against the status quo (status quo = 100, lower is better)</p>
            <div className="mt-2 h-52 rounded-xl bg-[#faf6ea] p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6dcc2" vertical={false} />
                  <XAxis dataKey="m" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 120]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip /><Legend />
                  <Bar dataKey="A" name="Scenario A" fill="#1f4d3a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="B" name="Scenario B" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-2xl bg-[#1f4d3a] p-6 text-[#eef3ea]">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Play size={18} /> Run a new simulation</h2>
            <p className="mt-1 text-sm text-[#cfe0d2]">Pick a change and how strongly it is applied. The result joins the comparison.</p>
            <form onSubmit={runSimulation} className="mt-5 space-y-4 text-sm font-medium">
              <label className="block">Region
                <select value={sim.region} onChange={(e) => setSim({ ...sim, region: e.target.value })} className={`${input} text-[#1f2a24]`}>{REGIONS.map((r) => <option key={r}>{r}</option>)}</select>
              </label>
              <label className="block">Policy change
                <select value={sim.lever} onChange={(e) => setSim({ ...sim, lever: e.target.value })} className={`${input} text-[#1f2a24]`}>{Object.keys(LEVERS).map((l) => <option key={l}>{l}</option>)}</select>
              </label>
              <label className="block">Strength: {sim.strength}%
                <input type="range" min="10" max="100" step="10" value={sim.strength} onChange={(e) => setSim({ ...sim, strength: +e.target.value })} className="mt-2 w-full accent-[#f3ecdc]" />
              </label>
              <button className="w-full rounded-xl bg-[#f3ecdc] py-3 font-semibold text-[#1f4d3a] hover:bg-white">Run simulation</button>
            </form>
            <p className="mt-3 text-xs text-[#a9c4b0]">Sample model. Results will come from the simulation service.</p>
          </section>
        </div>

        {/* Gauges */}
        <section className="rounded-2xl bg-[#d9e4ee] p-6">
          <h2 className="text-lg font-semibold">Expected and actual results</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {POLICIES.map((p) => {
              const gap = p.actual - p.expected;
              const st = gap >= 0 ? ["Ahead of plan", "#2f6b4a"] : gap >= -8 ? ["Slightly behind", "#b7791f"] : ["Behind plan", "#9b3b2f"];
              return (
                <div key={p.name} className="rounded-xl bg-[#faf6ea] p-4 text-center">
                  <p className="text-sm font-medium">{p.name}</p>
                  <div className="relative mx-auto h-24 w-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={[{ v: p.actual }, { v: 100 - p.actual }]} dataKey="v" startAngle={180} endAngle={0} cy="100%" innerRadius={62} outerRadius={82} stroke="none">
                          <Cell fill={st[1]} /><Cell fill="#e6dcc2" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <span className="absolute inset-x-0 bottom-0 font-['Newsreader',serif] text-3xl font-semibold">{p.actual}%</span>
                  </div>
                  <p className="mt-1 text-sm text-[#5c5a4b]">Expected {p.expected}%</p>
                  <p className="text-sm font-semibold" style={{ color: st[1] }}>{st[0]}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Timeline */}
        <section className="rounded-2xl bg-[#faf6ea] p-6 ring-1 ring-[#e0d6bb]">
          <h2 className="text-lg font-semibold">Policy timeline</h2>
          <div className="mt-4 space-y-5">
            {POLICIES.map((p) => (
              <div key={p.name} className="grid items-center gap-3 md:grid-cols-[200px_1fr]">
                <p className="font-medium">{p.name}</p>
                <div className="grid grid-cols-3">
                  {["Baseline", "Implementation", "Outcome"].map((s, i) => (
                    <div key={s} className="relative">
                      {i > 0 && <span className={`absolute right-1/2 top-3 h-0.5 w-full ${p.stages[i] === "todo" ? "bg-[#d8ceb2]" : "bg-[#1f4d3a]"}`} />}
                      <div className="relative flex flex-col items-center text-center">
                        <span className={`grid h-6 w-6 place-items-center rounded-full ring-4 ring-[#faf6ea] ${p.stages[i] === "done" ? "bg-[#1f4d3a] text-white" : p.stages[i] === "active" ? "bg-[#1e3a5f] text-white" : "bg-[#d8ceb2]"}`}>
                          {p.stages[i] === "done" && <CheckCircle2 size={14} />}
                        </span>
                        <p className="mt-1 text-sm font-medium">{s}</p>
                        <p className="text-xs text-[#7a775f]">{p.dates[i]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Alerts + reports */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl bg-[#faf6ea] p-6 ring-1 ring-[#e0d6bb]">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Bell size={18} /> Emerging trend alerts</h2>
            <ul className="mt-4 space-y-3">
              {ALERTS.map((al) => (
                <li key={al.title} className="flex items-start gap-3 rounded-xl bg-[#f3ecdc] p-3">
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${SEV[al.sev]}`}>{al.sev}</span>
                  <div className="min-w-0 flex-1"><p className="text-sm font-medium">{al.title}</p><p className="text-xs text-[#7a775f]">{al.note}</p></div>
                  <button onClick={() => setToast("The map explorer opens here once it is built.")} className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#1e3a5f]"><MapPin size={13} />Map</button>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl bg-[#d9e4ee] p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold"><FileText size={18} /> Recent decision reports</h2>
              <button onClick={() => openModal("report")} className="text-sm font-semibold text-[#1e3a5f]">New report</button>
            </div>
            <ul className="mt-4 space-y-2">
              {reports.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#faf6ea] px-4 py-3">
                  <div className="min-w-0"><p className="truncate text-sm font-medium">{r.title}</p><p className="text-xs text-[#7a775f]">{r.date}</p></div>
                  <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${r.status === "Ready" ? "bg-[#dbe6d5] text-[#2f5a43]" : "bg-[#f3e3b8] text-[#7a5a12]"}`}>
                    {r.status === "Generating" && <Loader2 size={12} className="animate-spin" />}{r.status}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      {toast && <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#1f2a24] px-5 py-3 text-sm text-[#f3ecdc] shadow-xl">{toast}</div>}

      {modal && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[#1f2a24]/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && setModal(null)}>
          <form onSubmit={submitModal} role="dialog" aria-modal="true" aria-label={MODALS[modal].title} className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#faf6ea] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-['Newsreader',serif] text-2xl font-medium">{MODALS[modal].title}</h2>
                <p className="text-sm text-[#5c5a4b]">{MODALS[modal].sub}</p>
              </div>
              <button type="button" onClick={() => setModal(null)} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#5c5a4b] hover:bg-[#e8dfc6]"><X size={18} /></button>
            </div>
            <div className="mt-4 space-y-4">
              {MODALS[modal].fields.map((f, i) => (
                <label key={f.k} className="block text-sm font-medium">{f.label}
                  {f.options ? (
                    <select value={form[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} className={input}>{f.options.map((o) => <option key={o}>{o}</option>)}</select>
                  ) : f.area ? (
                    <textarea rows={3} value={form[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} className={input} />
                  ) : (
                    <input ref={i === 0 ? firstRef : null} type={f.date ? "date" : "text"} value={form[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} className={input} />
                  )}
                </label>
              ))}
            </div>
            {formErr && <p role="alert" className="mt-3 text-sm text-[#9b3b2f]">{formErr}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setModal(null)} className="rounded-xl border border-[#cfc4a5] px-5 py-2.5 text-sm font-semibold hover:bg-[#f3ecdc]">Cancel</button>
              <button className="rounded-xl bg-[#1f4d3a] px-5 py-2.5 text-sm font-semibold text-[#eef3ea] hover:bg-[#173b2c]">{MODALS[modal].cta}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}