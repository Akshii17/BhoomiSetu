import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import {
  Landmark, LogOut, ArrowUpRight, ArrowDownRight, Play, Scale, FileText, Megaphone, Target, Bell, Loader2, X, CheckCircle2, MapPin, Sparkles, Layers,
} from "lucide-react";
import { MapModal } from "../components/MapLibreMap";
import NotificationCenter from "../components/NotificationCenter";
import { REGIONS as GEO_REGIONS } from "../data/Studies";

/* ---------- Sample data ---------- */
const KPIS = [
  { label: "Policy performance index", value: "74", unit: "/ 100", delta: "+3.2 this quarter", up: true, good: true, tone: "forest", data: [61, 63, 66, 65, 69, 71, 72, 74] },
  { label: "Dispute resolution rate", value: "68%", unit: "", delta: "+2 pts this quarter", up: true, good: true, tone: "gold", data: [58, 60, 61, 63, 64, 66, 67, 68] },
  { label: "Climate risk index", value: "41", unit: "/ 100", delta: "+1.8 this quarter", up: true, good: false, tone: "forest", data: [35, 36, 37, 38, 38, 39, 40, 41] },
  { label: "Projects on schedule", value: "79%", unit: "", delta: "-1.4 pts this quarter", up: false, good: false, tone: "gold", data: [84, 83, 83, 82, 81, 80, 80, 79] },
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
  { sev: "High", title: "Farmland conversion is 2.3 times its usual rate around Nashik", note: "Found in latest satellite pass, Nashik district", center: [73.7898, 19.9975], zoom: 9 },
  { sev: "Medium", title: "Dispute filings are rising in three Bihar districts", note: "Up 31% over the last two months", center: [85.1376, 25.5941], zoom: 8 },
  { sev: "Medium", title: "New construction inside a mapped flood zone", note: "Near Guwahati, Kamrup Metropolitan", center: [91.7362, 26.1445], zoom: 10 },
  { sev: "Low", title: "Project milestone delays are clustering in Odisha", note: "9 of 24 projects are behind plan", center: [85.8245, 20.2961], zoom: 7 },
];
const SEV = { High: "bg-[#f1d3cb] text-[#8a3324]", Medium: "bg-[#f3e3b8] text-[#7a5a12]", Low: "bg-[#dbe6d5] text-[#1f3d2b]" };

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
      { k: "region", label: "Region", options: REGIONS }, { k: "target", label: "Target value (e.g. 85%)" }, { k: "date", label: "Target date", date: true },
    ],
  },
  report: {
    title: "Generate a decision report", sub: "Combines indicators, maps and the scenario results you pick.", cta: "Generate report",
    fields: [
      { k: "title", label: "Report title" }, { k: "source", label: "Based on", options: [...SCEN.map((s) => s.name), ...POLICIES.map((p) => p.name)] },
      { k: "notes", label: "Executive summary or context", area: true },
    ],
  },
};

const input = "mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1f3d2b] focus:ring-2 focus:ring-[#1f3d2b]/15";

export default function PolicyMaker({ user, onLogout: logoutProp }) {
  const nav = useNavigate();
  const onLogout = logoutProp || (() => { localStorage.removeItem("bhoomi_user"); nav("/"); });
  const [scen, setScen] = useState(SCEN);
  const [a, setA] = useState(SCEN[0].id);
  const [b, setB] = useState(SCEN[1].id);
  const [sim, setSim] = useState({ region: REGIONS[0], lever: Object.keys(LEVERS)[0], strength: 50 });
  const [reports, setReports] = useState([
    { id: 1, title: "Farmland conversion outlook, Maharashtra 2035", date: "Yesterday", status: "Ready" },
    { id: 2, title: "e-Courts integration and dispute reduction", date: "3 days ago", status: "Ready" },
  ]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [formErr, setFormErr] = useState("");
  const [toast, setToast] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [mapConfig, setMapConfig] = useState({
    title: "Policy Hotspot Map",
    subtitle: "Satellite detection of land indicators and policy trends",
    center: [73.7898, 19.9975],
    zoom: 8,
    markers: [],
  });

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3200); return () => clearTimeout(t); } }, [toast]);
  useEffect(() => {
    if (!modal) return;
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
      setReports((r) => [{ id, title: form.title, date: "today", status: "Generating" }, ...r]);
      setTimeout(() => setReports((r) => r.map((x) => (x.id === id ? { ...x, status: "Ready" } : x))), 2500);
      setToast("Report is being generated.");
    } else if (modal === "challenge") {
      setToast("Posted to the Innovation portal.");
    } else {
      setToast("Baseline saved.");
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
    const s = { id: `s${Date.now()}`, name: `${sim.lever}, ${sim.strength}% strength (${sim.region})`, vals };
    setScen((x) => [...x, s]); setB(s.id);
    setToast("Simulation finished. It is now Scenario B below.");
  }

  const openAlertMap = (al) => {
    setMapConfig({
      title: `Spatial Trend Alert: ${al.title}`,
      subtitle: `${al.note} · MapLibre high-res satellite & risk overlay`,
      center: al.center || [73.7898, 19.9975],
      zoom: al.zoom || 8,
      markers: [
        { lng: (al.center || [73.7898, 19.9975])[0], lat: (al.center || [73.7898, 19.9975])[1], title: al.title, description: al.note, color: al.sev === "High" ? "#8a3324" : "#b8923a" },
      ],
    });
    setMapOpen(true);
  };

  const A = scen.find((s) => s.id === a), B = scen.find((s) => s.id === b);
  const chart = METRICS.map(([k, , , short]) => ({ m: short, A: Math.round((A.vals[k] / BASE[k]) * 100), B: Math.round((B.vals[k] / BASE[k]) * 100) }));
  const tone = { forest: "bg-[#1f3d2b] text-white border-t-4 border-[#b8923a]", gold: "bg-[#faf7f1] text-[#26282b] border border-stone-300" };

  return (
    <div className="min-h-screen bg-[#f4efe6] font-['Public_Sans',sans-serif] text-[#26282b]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Public+Sans:wght@400;500;600&display=swap');`}</style>

      <header className="sticky top-0 z-40 border-b border-[#1f3d2b]/15 bg-[#f4efe6]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-5 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#1f3d2b] text-[#d2b067]"><Landmark size={18} /></span>
          <span className="font-['Newsreader',serif] text-2xl font-semibold text-[#1f3d2b]">Bhoomi</span>
          <span className="rounded-full bg-[#e3ecdf] px-3 py-0.5 text-xs font-semibold text-[#1f3d2b]">Policymaker</span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("open-bhoomi-ai"))} className="flex items-center gap-1.5 rounded-lg border border-[#b8923a]/40 bg-[#faf7f1] px-3.5 py-2 text-sm font-semibold text-[#1f3d2b] hover:bg-[#b8923a]/15 transition"><Sparkles size={15} className="text-[#b8923a]" />Bhoomi AI</button>
            {[["challenge", Megaphone, "Post challenge"], ["baseline", Target, "Set baseline"], ["report", FileText, "Generate report"]].map(([m, I, l]) => (
              <button key={m} onClick={() => openModal(m)} className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm font-semibold text-stone-700 hover:bg-[#faf7f1] transition"><I size={15} />{l}</button>
            ))}
            <NotificationCenter role="policymaker" />
            <button onClick={onLogout} aria-label="Sign out" title="Sign out" className="grid h-10 w-10 place-items-center rounded-xl text-stone-600 hover:bg-stone-200/60 transition"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-5 py-8">
        <div>
          <h1 className="font-['Newsreader',serif] text-3xl font-medium text-[#1f3d2b]">Policy command centre</h1>
          <p className="text-stone-600 text-sm">How national policies are performing, what could change, and spatial indicators needing attention.</p>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KPIS.map((k) => {
            const Arrow = k.up ? ArrowUpRight : ArrowDownRight;
            const isDark = k.tone === "forest";
            return (
              <div key={k.label} className={`overflow-hidden rounded-2xl shadow-sm ${tone[k.tone]}`}>
                <div className="p-5 pb-1">
                  <p className={`text-xs font-semibold ${isDark ? "text-stone-200" : "text-stone-500"}`}>{k.label}</p>
                  <p className={`mt-1 font-['Newsreader',serif] text-4xl font-semibold ${isDark ? "text-white" : "text-[#1f3d2b]"}`}>{k.value}<span className="ml-1 text-base font-normal opacity-70">{k.unit}</span></p>
                  <p className={`mt-1 flex items-center gap-1 text-xs font-semibold ${k.good ? (isDark ? "text-[#b6e3c1]" : "text-[#1f3d2b]") : "text-[#9b3b2f]"}`}><Arrow size={15} />{k.delta}</p>
                </div>
                <div className="h-14">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={k.data.map((v, i) => ({ i, v }))} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                      <Area type="monotone" dataKey="v" stroke={isDark ? "#b8923a" : "#1f3d2b"} strokeWidth={2} fill={isDark ? "#b8923a" : "#e3ecdf"} fillOpacity={0.25} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scenario comparison + launch */}
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl bg-white p-6 border border-stone-300 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1f3d2b]"><Scale size={18} className="text-[#b8923a]" /> Compare scenarios</h2>
              <button onClick={() => {
                setMapConfig({
                  title: "Spatial Policy Impact Simulator",
                  subtitle: `Comparing ${A.name} against ${B.name}`,
                  center: [76.5, 19.2],
                  zoom: 6,
                  markers: [
                    { lng: 73.8567, lat: 18.5204, title: "Western Zone Impact", description: `Farmland delta: ${+(B.vals.farm - A.vals.farm).toFixed(1)}%`, color: "#1f3d2b" },
                    { lng: 77.2090, lat: 28.6139, title: "Northern Corridor", description: `Disputes delta: ${+(B.vals.disputes - A.vals.disputes).toFixed(1)}k`, color: "#b8923a" },
                  ],
                });
                setMapOpen(true);
              }} className="flex items-center gap-1.5 text-xs font-semibold text-[#1f3d2b] border border-stone-300 rounded-lg px-2.5 py-1.5 hover:bg-[#faf7f1] transition">
                <MapPin size={13} className="text-[#b8923a]" /> View on Map
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[["A", a, setA, "bg-[#1f3d2b]"], ["B", b, setB, "bg-[#b8923a]"]].map(([l, val, fn, c]) => (
                <label key={l} className="text-sm font-medium text-stone-700">
                  <span className={`mr-2 inline-grid h-6 w-6 place-items-center rounded-md text-xs text-white ${c}`}>{l}</span>Scenario {l}
                  <select value={val} onChange={(e) => fn(e.target.value)} className={input}>{scen.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                </label>
              ))}
            </div>
            <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 bg-[#faf7f1]">
              <table className="w-full min-w-[480px] text-sm">
                <thead><tr className="text-left text-stone-600 bg-stone-100/70"><th className="p-3 font-semibold">Indicator</th><th className="p-3 font-semibold">A</th><th className="p-3 font-semibold">B</th><th className="p-3 font-semibold">B compared with A</th></tr></thead>
                <tbody>
                  {METRICS.map(([k, label, unit]) => {
                    const d = +(B.vals[k] - A.vals[k]).toFixed(1);
                    return (
                      <tr key={k} className="border-t border-stone-200">
                        <td className="p-3 font-medium text-stone-800">{label} <span className="text-xs text-stone-500">({unit})</span></td>
                        <td className="p-3 font-semibold text-[#1f3d2b]">{A.vals[k]}</td><td className="p-3 font-semibold text-[#b8923a]">{B.vals[k]}</td>
                        <td className={`p-3 font-medium ${d < 0 ? "text-[#1f3d2b]" : d > 0 ? "text-[#8a3324]" : "text-stone-500"}`}>{d === 0 ? "No change" : `${d > 0 ? "+" : ""}${d} (${d < 0 ? "better" : "worse"})`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Visual comparison bar */}
            <div className="mt-4 h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#78716c" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#78716c" }} unit="%" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="A" fill="#1f3d2b" name={A.name} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="B" fill="#b8923a" name={B.name} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Simulator launch card */}
          <section className="rounded-2xl bg-[#1f3d2b] p-6 text-white border-t-4 border-[#b8923a] shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#d2b067] uppercase tracking-wider"><Play size={14} /> Interactive Policy Engine</div>
              <h2 className="font-['Newsreader',serif] text-2xl font-semibold mt-1 text-[#f4efe6]">Run a policy simulation</h2>
              <p className="mt-2 text-xs text-stone-200 leading-relaxed">Model spatial land conversion, infrastructure strain and court dispute impact.</p>

              <form onSubmit={runSimulation} className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-stone-200">Region</label>
                  <select value={sim.region} onChange={(e) => setSim({ ...sim, region: e.target.value })} className={`${input} text-stone-900`}>{REGIONS.map((r) => <option key={r}>{r}</option>)}</select>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-200">Policy lever</label>
                  <select value={sim.lever} onChange={(e) => setSim({ ...sim, lever: e.target.value })} className={`${input} text-stone-900`}>{Object.keys(LEVERS).map((l) => <option key={l}>{l}</option>)}</select>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-stone-200"><span>Policy strength</span><span className="font-semibold text-[#b8923a]">{sim.strength}%</span></div>
                  <input type="range" min="10" max="100" step="5" value={sim.strength} onChange={(e) => setSim({ ...sim, strength: +e.target.value })} className="mt-2 w-full accent-[#b8923a]" />
                </div>
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#b8923a] py-3 text-sm font-semibold text-[#1f2a24] hover:bg-[#c9a34b] transition shadow-md">
                  <Play size={16} /> Run simulation
                </button>
              </form>
            </div>
            <p className="text-[11px] text-stone-300 mt-4 text-center">Outputs reflect empirical satellite calibration from western &amp; southern states.</p>
          </section>
        </div>

        {/* Alerts + reports */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 border border-stone-300 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1f3d2b]"><Bell size={18} className="text-[#b8923a]" /> Emerging trend alerts</h2>
            <ul className="mt-4 space-y-3">
              {ALERTS.map((al) => (
                <li key={al.title} className="flex items-start gap-3 rounded-xl border border-stone-200 bg-[#faf7f1] p-3.5 hover:border-[#b8923a] transition">
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${SEV[al.sev]}`}>{al.sev}</span>
                  <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-stone-900">{al.title}</p><p className="text-xs text-stone-500 mt-0.5">{al.note}</p></div>
                  <button onClick={() => openAlertMap(al)} className="flex shrink-0 items-center gap-1 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1f3d2b] hover:bg-[#1f3d2b] hover:text-white transition"><MapPin size={13} />Map</button>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl bg-white p-6 border border-stone-300 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1f3d2b]"><FileText size={18} className="text-[#b8923a]" /> Recent decision reports</h2>
              <button onClick={() => openModal("report")} className="text-xs font-semibold text-[#1f3d2b] hover:underline">+ New report</button>
            </div>
            <ul className="mt-4 space-y-2">
              {reports.map((r) => (
                <li key={r.id} className="flex items-center justify-between rounded-xl border border-stone-200 bg-[#faf7f1] p-3 text-sm">
                  <div className="flex items-center gap-2.5">
                    <FileText size={16} className="text-[#b8923a]" />
                    <div><p className="font-semibold text-stone-900 text-xs sm:text-sm">{r.title}</p><p className="text-xs text-stone-500">{r.date}</p></div>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.status === "Ready" ? "bg-[#e3ecdf] text-[#1f3d2b]" : "bg-[#f3e8c9] text-[#6b5216]"}`}>{r.status}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      {/* MapLibre Modal for Policy Alerts */}
      <MapModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        title={mapConfig.title}
        subtitle={mapConfig.subtitle}
        center={mapConfig.center}
        zoom={mapConfig.zoom}
        markers={mapConfig.markers}
      />

      {/* Toast */}
      {toast && <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#1f3d2b] border border-[#b8923a] px-5 py-3 text-sm text-[#f4efe6] shadow-xl">{toast}</div>}

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#26282b]/60 p-4" onMouseDown={(e) => e.target === e.currentTarget && setModal(null)}>
          <form onSubmit={submitModal} role="dialog" aria-modal="true" aria-label={MODALS[modal].title} className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#faf7f1] border-t-4 border-[#b8923a] p-7 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-['Newsreader',serif] text-2xl font-semibold text-[#1f3d2b]">{MODALS[modal].title}</h2>
                <p className="text-xs text-stone-600 mt-1">{MODALS[modal].sub}</p>
              </div>
              <button type="button" onClick={() => setModal(null)} aria-label="Close" className="rounded-lg p-1 text-stone-500 hover:bg-stone-200"><X size={18} /></button>
            </div>

            <div className="mt-5 space-y-4">
              {MODALS[modal].fields.map((f, i) => (
                <label key={f.k} className="block text-sm font-medium text-stone-700">{f.label}
                  {f.options ? (
                    <select value={form[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} className={input}>{f.options.map((o) => <option key={o}>{o}</option>)}</select>
                  ) : f.area ? (
                    <textarea rows={3} value={form[f.k] || ""} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} className={input} />
                  ) : (
                    <input type={f.date ? "date" : "text"} value={form[f.k] || ""} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} className={input} />
                  )}
                </label>
              ))}
            </div>

            {formErr && <p role="alert" className="mt-3 text-xs text-[#8c2f39]">{formErr}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setModal(null)} className="rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-200">Cancel</button>
              <button className="rounded-xl bg-[#1f3d2b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2a5239] transition">{MODALS[modal].cta}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}