import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Landmark, LogOut, Database, Flag, Upload, Plug, RefreshCw, CheckCircle2, XCircle, Loader2, X, ChevronRight, Gauge, ClipboardList, MapPin, Sparkles, Layers,
} from "lucide-react";
import MapLibreMap, { MapModal } from "../components/MapLibreMap";
import NotificationCenter from "../components/NotificationCenter";

/* ---------- Sample data ---------- */
const TYPES = ["Land records", "Cadastral survey", "Satellite imagery", "Project data", "Socio-economic", "Dispute statistics", "Policy documents"];
const STATES = {
  Maharashtra: ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Jalgaon", "Kolhapur", "Latur", "Nagpur", "Nanded", "Nashik", "Pune", "Satara", "Solapur", "Thane"],
  Karnataka: ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Urban", "Bidar", "Dharwad", "Hassan", "Kalaburagi", "Mandya", "Mysuru", "Raichur", "Shivamogga", "Tumakuru", "Udupi"],
  Bihar: ["Araria", "Begusarai", "Bhagalpur", "Darbhanga", "Gaya", "Muzaffarpur", "Nalanda", "Patna", "Purnia", "Saran", "Siwan", "Vaishali"]
};

// District sample coords for spatial map
const DISTRICT_COORDS = {
  Pune: [73.8567, 18.5204], Nashik: [73.7898, 19.9975], Satara: [73.99, 17.68], Kolhapur: [74.24, 16.70],
  Nagpur: [79.08, 21.14], Aurangabad: [75.34, 19.87], Solapur: [75.91, 17.65], Thane: [72.97, 19.21],
  "Bengaluru Urban": [77.59, 12.97], Mysuru: [76.63, 12.29], Dharwad: [75.01, 15.45], Belagavi: [74.51, 15.84],
  Patna: [85.13, 25.59], Gaya: [85.00, 24.79], Muzaffarpur: [85.39, 26.12], Nalanda: [85.45, 25.19],
};

const DATASETS0 = [
  { id: 1, name: "Nashik cadastral parcels", type: "Cadastral survey", conn: "State GIS server", records: "1.24M", status: "Failed", last: "08:10 today", score: 71, dup: 1840, geom: 962, ulpin: 3120 },
  { id: 2, name: "Pune land records 2025", type: "Land records", conn: "Bhulekh API", records: "3.80M", status: "Completed", last: "06:00 today", score: 93, dup: 210, geom: 12, ulpin: 480 },
  { id: 3, name: "Sentinel-2 land cover, Q2", type: "Satellite imagery", conn: "ISRO Bhuvan", records: "84 tiles", status: "Completed", last: "yesterday", score: 97, dup: 0, geom: 3, ulpin: null },
  { id: 4, name: "Census village amenities", type: "Socio-economic", conn: "Census API", records: "640k", status: "Running", last: "10:32 today", score: 88, dup: 95, geom: 0, ulpin: null },
  { id: 5, name: "PM Gram Sadak projects", type: "Project data", conn: "Project portal", records: "12.4k", status: "Completed", last: "yesterday", score: 90, dup: 44, geom: 0, ulpin: null },
  { id: 6, name: "Dispute cases, Kolhapur", type: "Dispute statistics", conn: "eCourts feed", records: "58k", status: "Failed", last: "07:45 today", score: 64, dup: 4210, geom: 0, ulpin: null },
  { id: 7, name: "Land acts and notifications", type: "Policy documents", conn: "Manual upload", records: "126 docs", status: "Completed", last: "3 days ago", score: 99, dup: 2, geom: 0, ulpin: null },
];
const FLAGS0 = [
  { id: 1, from: "Researcher", issue: "Parcel areas look 10x too large in 41 villages", dataset: "Nashik cadastral parcels", when: "2h ago", done: false, center: [73.7898, 19.9975] },
  { id: 2, from: "Public", issue: "Village boundary is shifted on the map near Wai", dataset: "Pune land records 2025", when: "5h ago", done: false, center: [73.89, 17.94] },
  { id: 3, from: "Researcher", issue: "Duplicate case numbers in 2019 filings", dataset: "Dispute cases, Kolhapur", when: "yesterday", done: false, center: [74.24, 16.70] },
  { id: 4, from: "Public", issue: "Survey number missing for my village", dataset: "Pune land records 2025", when: "2 days ago", done: false, center: [73.85, 18.52] },
  { id: 5, from: "Researcher", issue: "Cloud cover not masked in tile 43QGV", dataset: "Sentinel-2 land cover, Q2", when: "3 days ago", done: false, center: [76.5, 19.2] },
];
const MILES0 = [
  { id: 1, project: "ULPIN assignment, Nashik", milestone: "Assign IDs to 60% of parcels", due: "2026-09-15", status: "In progress" },
  { id: 2, project: "Digital land records, Bihar", milestone: "Scan and upload 1990 to 2000 records", due: "2026-08-30", status: "Delayed" },
  { id: 3, project: "Village survey by drone", milestone: "Complete phase 2 flights", due: "2026-10-20", status: "In progress" },
  { id: 4, project: "Fast-track land courts", milestone: "Onboard 12 more courts to the portal", due: "2026-12-15", status: "Not started" },
  { id: 5, project: "Cadastral map updates, Karnataka", milestone: "Publish revised layers", due: "2027-01-31", status: "Not started" },
];
const CONN0 = [
  { name: "Bhulekh land records API", kind: "REST API", status: "Healthy", ms: 240, sync: "06:00 today", up: "99.6%" },
  { name: "ULPIN registry", kind: "REST API", status: "Degraded", ms: 1480, sync: "05:40 today", up: "96.2%" },
  { name: "ISRO Bhuvan tiles", kind: "WMS / WMTS", status: "Healthy", ms: 410, sync: "yesterday", up: "99.1%" },
  { name: "eCourts case feed", kind: "SFTP batch", status: "Down", ms: null, sync: "2 days ago", up: "88.4%" },
  { name: "State GIS server, Maharashtra", kind: "GeoServer", status: "Healthy", ms: 320, sync: "08:10 today", up: "98.7%" },
];
const MSTATUS = ["Not started", "In progress", "Delayed", "Completed"];
const STATUS_CLS = {
  Completed: "bg-[#e3ecdf] text-[#1f3d2b]",
  Healthy: "bg-[#e3ecdf] text-[#1f3d2b]",
  Running: "bg-[#f3e8c9] text-[#6b5216]",
  Degraded: "bg-[#f3e8c9] text-[#6b5216]",
  Failed: "bg-[#f1d3cb] text-[#8a3324]",
  Down: "bg-[#f1d3cb] text-[#8a3324]",
};
const CHECKS = [
  ["schema", "Schema check: required columns, valid types"],
  ["ulpin", "ULPIN format: 14 alphanumeric characters"],
  ["geom", "Geometry validation: valid polygons and coordinate bounds"],
  ["dup", "Duplicate check: uniqueness across survey numbers"],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

async function analyse(file, type) {
  await sleep(600);
  const text = await file.slice(0, 64 * 1024).text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
  const rows = Math.max(lines.length - 1, 1);
  const h = hash(file.name + file.size);
  const dup = (h >> 2) % 40;
  const geom = type.includes("Cadastral") || type.includes("Satellite") ? (h >> 5) % 30 : 0;
  const ulpin = type.includes("Land") || type.includes("Cadastral") ? (h >> 8) % 50 : 0;
  const empty = (h >> 11) % 60;
  const penalty = Math.min(35, Math.round((dup * 0.4) + (geom * 0.5) + (ulpin * 0.3) + (empty * 0.1)));
  const score = Math.max(60, 100 - penalty);
  return { rows: rows > 1 ? rows * 120 : 1240, dup, geom, ulpin, empty, score };
}

function Wizard({ onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [type, setType] = useState(TYPES[0]);
  const [state, setState] = useState("Maharashtra");
  const [rep, setRep] = useState(null);
  const [shown, setShown] = useState(0);
  const [err, setErr] = useState("");

  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  async function run() {
    if (!file) return setErr("Choose a file first.");
    setErr(""); setStep(2); setRep(null); setShown(0);
    try {
      const r = await analyse(file, type);
      setRep(r);
      for (let i = 1; i <= CHECKS.length; i++) { await sleep(450); setShown(i); }
    } catch {
      setStep(1); setErr("This file could not be read. Check that it is valid CSV or GeoJSON.");
    }
  }

  const field = "mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1f3d2b]";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#26282b]/60 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Upload data" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#faf7f1] border-t-4 border-[#b8923a] p-7 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-['Newsreader',serif] text-2xl font-semibold text-[#1f3d2b]">Upload data</h2>
            <p className="text-sm text-stone-600">Your file is verified against spatial schemas before entering the pipeline.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-stone-500 hover:bg-stone-200"><X size={18} /></button>
        </div>
        <ol className="mt-5 flex gap-2 text-xs font-semibold">
          {["Choose file", "Validation report", "Submit"].map((s, i) => (
            <li key={s} className={`flex-1 rounded-lg px-3 py-2 text-center ${step === i + 1 ? "bg-[#1f3d2b] text-white" : step > i + 1 ? "bg-[#e3ecdf] text-[#1f3d2b]" : "bg-stone-200 text-stone-600"}`}>{i + 1}. {s}</li>
          ))}
        </ol>

        {step === 1 && (
          <div className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-stone-700">Type of data<select value={type} onChange={(e) => setType(e.target.value)} className={field}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
              <label className="text-sm font-medium text-stone-700">Jurisdiction<select value={state} onChange={(e) => setState(e.target.value)} className={field}>{Object.keys(STATES).map((s) => <option key={s}>{s}</option>)}</select></label>
            </div>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[#b8923a]/50 bg-white px-4 py-8 text-center hover:bg-[#f4efe6]/50 transition">
              <Upload className="text-[#1f3d2b]" size={28} />
              <span className="text-sm font-medium text-stone-800">{file ? file.name : "Select a GeoJSON, CSV or GeoTIFF"}</span>
              <span className="text-xs text-stone-500">{file ? `${(file.size / 1024).toFixed(1)} KB` : "Max 200 MB per batch"}</span>
              <input type="file" className="sr-only" accept=".csv,.json,.geojson,.tif,.tiff,.zip" onChange={(e) => setFile(e.target.files[0] || null)} />
            </label>
            {err && <p className="text-sm text-[#8a3324]">{err}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} className="rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-200">Cancel</button>
              <button onClick={run} className="rounded-xl bg-[#1f3d2b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2a5239] transition">Validate file</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-5 space-y-4">
            <ul className="space-y-3">
              {CHECKS.map(([k, l], i) => (
                <li key={k} className="flex items-center justify-between rounded-xl bg-white border border-stone-200 p-3 text-sm">
                  <span>{l}</span>
                  {shown > i ? <span className="flex items-center gap-1 font-semibold text-[#1f3d2b] text-xs"><CheckCircle2 size={15} /> Passed</span> : <Loader2 size={15} className="animate-spin text-stone-400" />}
                </li>
              ))}
            </ul>
            {rep && shown >= CHECKS.length && (
              <div className="rounded-xl bg-[#faf7f1] border border-stone-200 p-4">
                <div className="flex justify-between items-center"><p className="font-semibold text-[#1f3d2b]">Quality Score</p><span className="text-2xl font-bold text-[#1f3d2b]">{rep.score}%</span></div>
                <p className="text-xs text-stone-600 mt-1">{rep.rows.toLocaleString()} records processed successfully.</p>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button disabled={shown < CHECKS.length} onClick={() => { onSubmit({ file, type, rep }); setStep(3); }} className="rounded-xl bg-[#1f3d2b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2a5239] disabled:opacity-50">Submit dataset</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 text-center space-y-3">
            <CheckCircle2 size={40} className="text-[#1f3d2b] mx-auto" />
            <h3 className="font-['Newsreader',serif] text-2xl font-semibold text-[#1f3d2b]">Dataset queued for ingestion</h3>
            <p className="text-sm text-stone-600">The pipeline has begun processing parcel layers.</p>
            <button onClick={onClose} className="rounded-xl bg-[#1f3d2b] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2a5239] mt-3">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GovAgency({ user, onLogout: logoutProp }) {
  const nav = useNavigate();
  const onLogout = logoutProp || (() => { localStorage.removeItem("bhoomi_user"); nav("/"); });
  const [ds, setDs] = useState(DATASETS0);
  const [tab, setTab] = useState("All");
  const [flags, setFlags] = useState(FLAGS0);
  const [miles, setMiles] = useState(MILES0);
  const [conns, setConns] = useState(CONN0);
  const [testing, setTesting] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [wizard, setWizard] = useState(false);
  const [toast, setToast] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'map'
  const [mapOpen, setMapOpen] = useState(false);
  const [mapConfig, setMapConfig] = useState({ title: "Spatial Layer Inspector", subtitle: "Inspect parcel discrepancies", center: [73.89, 17.94], zoom: 11, markers: [] });

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3200); return () => clearTimeout(t); } }, [toast]);

  const today = new Date().toISOString().slice(0, 10);
  const failed = ds.filter((d) => d.status === "Failed").length;
  const openFlags = flags.filter((f) => !f.done).length;
  const overdue = miles.filter((m) => m.status !== "Completed" && m.due < today).length;
  const badConn = conns.filter((c) => c.status !== "Healthy").length;
  const avg = Math.round(ds.reduce((s, d) => s + d.score, 0) / ds.length);

  function retry(id) {
    setDs((x) => x.map((d) => (d.id === id ? { ...d, status: "Running", last: "just now" } : d)));
    setTimeout(() => setDs((x) => x.map((d) => (d.id === id ? { ...d, status: "Completed" } : d))), 2500);
  }

  function submitUpload({ file, type, rep }) {
    const id = Date.now();
    setDs((x) => [{ id, name: file.name.replace(/\.[^.]+$/, ""), type, conn: "Manual upload", records: rep.rows.toLocaleString(), status: "Running", last: "just now", score: rep.score, dup: rep.dup, geom: rep.geom, ulpin: rep.ulpin }, ...x]);
    setTimeout(() => setDs((x) => x.map((d) => (d.id === id ? { ...d, status: "Completed" } : d))), 3000);
  }

  function testConn(name) {
    setTesting(name);
    setTimeout(() => {
      setConns((c) => c.map((x) => (x.name !== name ? x : x.status === "Down" ? x : { ...x, status: "Healthy", ms: 200 + (hash(name) % 200), sync: "just now" })));
      setToast(`${name} responded normally.`);
      setTesting("");
    }, 1200);
  }

  const openFlagMap = (f) => {
    setMapConfig({
      title: `Spatial Inspection: ${f.issue}`,
      subtitle: `${f.dataset} · Reported by ${f.from}`,
      center: f.center || [73.89, 17.94],
      zoom: 11,
      markers: [{ lng: (f.center || [73.89, 17.94])[0], lat: (f.center || [73.89, 17.94])[1], title: f.issue, description: f.dataset, color: "#8a3324" }],
    });
    setMapOpen(true);
  };

  const card = "rounded-2xl bg-white border border-stone-300 shadow-sm";
  const th = "p-3 font-semibold text-stone-600 text-left text-xs uppercase tracking-wider";
  const rows = ds.filter((d) => tab === "All" || d.status === tab);

  const heat = (v) => v < 40 ? "bg-[#f1d3cb] text-[#8a3324]" : v < 70 ? "bg-[#f3e3b8] text-[#7a5a12]" : v < 90 ? "bg-[#e3ecdf] text-[#1f3d2b]" : "bg-[#1f3d2b] text-white";

  const districtMarkers = (STATES[state] || []).map((d) => {
    const coords = DISTRICT_COORDS[d] || [74.0 + (hash(d) % 40) / 10, 18.0 + (hash(d + "lat") % 40) / 10];
    const v = 25 + (hash(state + d) % 76);
    return { lng: coords[0], lat: coords[1], title: `${d} (${v}%)`, description: `Completeness score: ${v}%`, color: v >= 70 ? "#1f3d2b" : "#b8923a" };
  });

  return (
    <div className="min-h-screen bg-[#f4efe6] font-['Public_Sans',sans-serif] text-[#26282b]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Public+Sans:wght@400;500;600&display=swap');`}</style>

      <header className="sticky top-0 z-40 border-b border-[#1f3d2b]/15 bg-[#f4efe6]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#1f3d2b] text-[#d2b067]"><Landmark size={18} /></span>
          <span className="font-['Newsreader',serif] text-2xl font-semibold text-[#1f3d2b]">Bhoomi</span>
          <span className="rounded-full bg-[#e3ecdf] px-3 py-0.5 text-xs font-semibold text-[#1f3d2b]">Data Agency</span>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("open-bhoomi-ai"))} className="flex items-center gap-1.5 rounded-lg border border-[#b8923a]/40 bg-[#faf7f1] px-3.5 py-2 text-sm font-semibold text-[#1f3d2b] hover:bg-[#b8923a]/15 transition"><Sparkles size={15} className="text-[#b8923a]" />Bhoomi AI</button>
            <button onClick={() => setWizard(true)} className="flex items-center gap-1.5 rounded-lg bg-[#1f3d2b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a5239] transition"><Upload size={15} /> Upload data</button>
            <NotificationCenter role="agency" />
            <button onClick={onLogout} aria-label="Sign out" title="Sign out" className="grid h-10 w-10 place-items-center rounded-xl text-stone-600 hover:bg-stone-200/60 transition"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-5 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-300 pb-5">
          <div>
            <p className="text-xs font-semibold text-[#b8923a] uppercase tracking-wider">Agency Operations Console</p>
            <h1 className="font-['Newsreader',serif] text-3xl font-medium text-[#1f3d2b] mt-1">Data Agency Workspace</h1>
            <p className="mt-1 text-sm text-stone-600">Datasets, pipelines and quality checks for your jurisdiction.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700">Average quality: <b className="text-[#1f3d2b]">{avg}%</b></span>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Database, "Datasets submitted", ds.length, "Across 7 data types"],
            [RefreshCw, "Failed ingestion jobs", failed, "Need a fix or a retry"],
            [Gauge, "Average quality score", `${avg}%`, "Across all datasets"],
            [Flag, "Open flagged issues", openFlags, "From public & researchers"],
          ].map(([I, l, v, n]) => (
            <div key={l} className={`${card} p-5 border-t-4 border-t-[#1f3d2b]`}>
              <div className="flex items-center justify-between"><span className="text-xs font-semibold text-stone-500">{l}</span><I size={18} className="text-[#1f3d2b]" /></div>
              <div className="mt-2 font-['Newsreader',serif] text-3xl font-bold text-[#1f3d2b]">{v}</div>
              <p className="text-xs text-stone-500 mt-1">{n}</p>
            </div>
          ))}
        </div>

        {/* Datasets & District Map */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Datasets table */}
          <section className={`${card} lg:col-span-2 overflow-hidden`}>
            <div className="flex flex-wrap items-center justify-between border-b border-stone-200 bg-[#faf7f1] p-4">
              <h2 className="font-semibold text-[#1f3d2b]">Registered datasets</h2>
              <div className="flex gap-1">
                {["All", "Running", "Failed", "Completed"].map((t) => (
                  <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${tab === t ? "bg-[#1f3d2b] text-white" : "text-stone-600 hover:bg-stone-200"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-stone-200 bg-stone-50"><th className={th}>Dataset</th><th className={th}>Status</th><th className={th}>Score</th><th className={th}>Action</th></tr></thead>
                <tbody>
                  {rows.map((d) => (
                    <tr key={d.id} className="border-b border-stone-100 last:border-0 hover:bg-[#faf7f1]">
                      <td className="p-3"><p className="font-semibold text-stone-900">{d.name}</p><span className="text-xs text-stone-500">{d.type} · {d.conn}</span></td>
                      <td className="p-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLS[d.status]}`}>{d.status}</span></td>
                      <td className="p-3 font-semibold text-[#1f3d2b]">{d.score}%</td>
                      <td className="p-3">
                        {d.status === "Failed" && <button onClick={() => retry(d.id)} className="text-xs font-semibold text-[#8a3324] hover:underline">Retry</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* District Spatial Completeness with MapLibre */}
          <section className={`${card} p-5 flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-[#1f3d2b] flex items-center gap-1.5 text-sm"><MapPin size={16} className="text-[#b8923a]" /> District submission</h2>
                <div className="flex gap-1 bg-stone-200 p-0.5 rounded-lg text-xs">
                  <button onClick={() => setViewMode("grid")} className={`px-2 py-0.5 rounded font-medium ${viewMode === "grid" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600"}`}>Grid</button>
                  <button onClick={() => setViewMode("map")} className={`px-2 py-0.5 rounded font-medium ${viewMode === "map" ? "bg-[#1f3d2b] text-white shadow-sm" : "text-stone-600"}`}>Map</button>
                </div>
              </div>

              <select value={state} onChange={(e) => setState(e.target.value)} aria-label="State" className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm mb-3">
                {Object.keys(STATES).map((s) => <option key={s}>{s}</option>)}
              </select>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1">
                  {STATES[state].map((d) => {
                    const v = 25 + (hash(state + d) % 76);
                    return <div key={d} className={`rounded-md p-1.5 text-xs text-center ${heat(v)}`}><p className="truncate font-medium">{d}</p><p className="font-bold">{v}%</p></div>;
                  })}
                </div>
              ) : (
                <div className="h-56 w-full rounded-xl overflow-hidden border border-stone-300">
                  <MapLibreMap
                    center={state === "Maharashtra" ? [75.5, 19.5] : state === "Karnataka" ? [76.5, 14.5] : [85.5, 25.5]}
                    zoom={5.5}
                    markers={districtMarkers}
                    className="h-full w-full"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200 flex flex-wrap gap-2 text-[11px] text-stone-500">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-[#f1d3cb]" /> &lt;40%</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-[#f3e3b8]" /> 40-70%</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-[#e3ecdf]" /> 70-90%</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-[#1f3d2b]" /> &gt;90%</span>
            </div>
          </section>
        </div>

        {/* Flagged issues + Connectors */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Flags */}
          <section className={`${card} overflow-hidden`}>
            <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-[#faf7f1]">
              <h2 className="font-semibold text-[#1f3d2b] flex items-center gap-2"><Flag size={16} className="text-[#b8923a]" /> Flagged spatial &amp; data issues</h2>
              <span className="rounded-full bg-[#f1d3cb] px-2.5 py-0.5 text-xs font-semibold text-[#8a3324]">{openFlags} open</span>
            </div>
            <ul className="divide-y divide-stone-100">
              {flags.map((f) => (
                <li key={f.id} className={`flex items-start gap-3 p-4 ${f.done ? "opacity-50" : ""}`}>
                  <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-stone-200 text-stone-800">{f.from}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold text-stone-900 ${f.done ? "line-through" : ""}`}>{f.issue}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{f.dataset} · {f.when}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openFlagMap(f)} className="flex items-center gap-1 rounded-lg border border-stone-300 px-2.5 py-1 text-xs font-semibold text-[#1f3d2b] hover:bg-stone-100"><MapPin size={12} />Map</button>
                    {!f.done && <button onClick={() => { setFlags((x) => x.map((y) => (y.id === f.id ? { ...y, done: true } : y))); setToast("Marked as resolved."); }} className="rounded-lg bg-[#1f3d2b] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#2a5239]">Resolve</button>}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Connectors */}
          <section className={`${card} overflow-hidden`}>
            <div className="p-4 border-b border-stone-200 bg-[#faf7f1]">
              <h2 className="font-semibold text-[#1f3d2b] flex items-center gap-2"><Plug size={16} className="text-[#b8923a]" /> Connector &amp; API Health</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-stone-200 bg-stone-50"><th className={th}>Connector</th><th className={th}>Status</th><th className={th}>Response</th><th className={th}></th></tr></thead>
                <tbody>
                  {conns.map((c) => (
                    <tr key={c.name} className="border-b border-stone-100 last:border-0">
                      <td className="p-3"><p className="font-semibold text-stone-900">{c.name}</p><span className="text-xs text-stone-500">{c.kind}</span></td>
                      <td className="p-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLS[c.status]}`}>{c.status}</span></td>
                      <td className="p-3 text-xs text-stone-600">{c.ms ? `${c.ms} ms` : "Offline"}</td>
                      <td className="p-3 text-right"><button onClick={() => testConn(c.name)} disabled={testing === c.name} className="rounded-lg border border-stone-300 px-2.5 py-1 text-xs font-semibold hover:bg-stone-100">Test</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* MapLibre Modal for Agency Issue Inspection */}
      <MapModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        title={mapConfig.title}
        subtitle={mapConfig.subtitle}
        center={mapConfig.center}
        zoom={mapConfig.zoom}
        markers={mapConfig.markers}
      />

      {toast && <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#1f3d2b] border border-[#b8923a] px-5 py-3 text-sm text-white shadow-xl">{toast}</div>}
      {wizard && <Wizard onClose={() => setWizard(false)} onSubmit={submitUpload} />}
    </div>
  );
}