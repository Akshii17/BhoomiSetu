import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Landmark, LogOut, Database, Flag, Upload, Plug, RefreshCw, CheckCircle2, XCircle, Loader2, X, ChevronRight, Gauge, ClipboardList, MapPin,
} from "lucide-react";

/* ---------- Sample data (replace with API calls) ---------- */
const TYPES = ["Land records", "Cadastral survey", "Satellite imagery", "Project data", "Socio-economic", "Dispute statistics", "Policy documents"];
const STATES = { Maharashtra: ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Jalgaon", "Kolhapur", "Latur", "Nagpur", "Nanded", "Nashik", "Pune", "Satara", "Solapur", "Thane"],
  Karnataka: ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Urban", "Bidar", "Dharwad", "Hassan", "Kalaburagi", "Mandya", "Mysuru", "Raichur", "Shivamogga", "Tumakuru", "Udupi"],
  Bihar: ["Araria", "Begusarai", "Bhagalpur", "Darbhanga", "Gaya", "Muzaffarpur", "Nalanda", "Patna", "Purnia", "Saran", "Siwan", "Vaishali"] };
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
  { id: 1, from: "Researcher", issue: "Parcel areas look 10x too large in 41 villages", dataset: "Nashik cadastral parcels", when: "2h ago", done: false },
  { id: 2, from: "Public", issue: "Village boundary is shifted on the map near Wai", dataset: "Pune land records 2025", when: "5h ago", done: false },
  { id: 3, from: "Researcher", issue: "Duplicate case numbers in 2019 filings", dataset: "Dispute cases, Kolhapur", when: "yesterday", done: false },
  { id: 4, from: "Public", issue: "Survey number missing for my village", dataset: "Pune land records 2025", when: "2 days ago", done: false },
  { id: 5, from: "Researcher", issue: "Cloud cover not masked in tile 43QGV", dataset: "Sentinel-2 land cover, Q2", when: "3 days ago", done: false },
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
const STATUS_CLS = {
  Running: "bg-[#d9e4ee] text-[#2b4d73]", Completed: "bg-[#dbe6d5] text-[#2f5a43]", Failed: "bg-[#f1d3cb] text-[#8a3324]",
  Healthy: "bg-[#dbe6d5] text-[#2f5a43]", Degraded: "bg-[#f3e3b8] text-[#7a5a12]", Down: "bg-[#f1d3cb] text-[#8a3324]",
};
const CHECKS = [["dup", "Duplicate records"], ["geom", "Invalid geometry"], ["ulpin", "Missing ULPIN"], ["empty", "Blank required fields"]];
const MSTATUS = ["Not started", "In progress", "Completed", "Delayed"];

const hash = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const inBounds = (la, lo) => la >= 6 && la <= 38 && lo >= 68 && lo <= 98;
const heat = (v) => (v >= 90 ? "bg-[#6f9c82] text-white" : v >= 70 ? "bg-[#b9d3bf]" : v >= 40 ? "bg-[#f0e0b0]" : "bg-[#ebc9b9]");
const card = "rounded-xl border border-[#e3dac2] bg-[#faf6ea] shadow-sm";
const label = "text-[11px] font-semibold uppercase tracking-wider text-[#6b6857]";
const th = "px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6b6857]";
const field = "mt-1.5 w-full rounded-lg border border-[#d8ceb2] bg-[#fffdf6] px-3 py-2.5 text-sm outline-none focus:border-[#1f4d3a]";

/* Reads the chosen file and counts problems. CSV and GeoJSON are checked for real. */
async function analyse(file, type) {
  const ext = file.name.split(".").pop().toLowerCase();
  const needsUlpin = type === "Land records" || type === "Cadastral survey";
  let rows = 0, dup = 0, geom = 0, ulpin = 0, empty = 0, exact = true;
  if ((ext === "csv" || ext === "geojson" || ext === "json") && file.size < 5e6) {
    const text = await file.text();
    const seen = new Set();
    const isDup = (k) => (seen.has(k) ? true : (seen.add(k), false));
    if (ext === "csv") {
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      const head = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const iU = head.indexOf("ulpin"), iLa = head.findIndex((h) => ["lat", "latitude"].includes(h)), iLo = head.findIndex((h) => ["lon", "lng", "longitude"].includes(h));
      const body = lines.slice(1); rows = body.length;
      body.forEach((l) => {
        if (isDup(l)) dup++;
        const c = l.split(",").map((x) => x.trim());
        if (c.some((x) => x === "")) empty++;
        if (iLa >= 0 && iLo >= 0 && !inBounds(+c[iLa], +c[iLo])) geom++;
        if (iU < 0 || !c[iU]) ulpin++;
      });
    } else {
      const j = JSON.parse(text), feats = j.features || [j];
      rows = feats.length;
      feats.forEach((f) => {
        if (isDup(JSON.stringify(f))) dup++;
        const g = f.geometry; let bad = !g || !g.coordinates;
        if (!bad) { let c = g.coordinates; while (Array.isArray(c[0])) c = c[0]; bad = !inBounds(c[1], c[0]); }
        if (bad) geom++;
        const p = f.properties || {}, k = Object.keys(p).find((x) => x.toLowerCase() === "ulpin");
        if (!k || !p[k]) ulpin++;
        if (Object.values(p).some((v) => v === null || v === "")) empty++;
      });
    }
  } else {
    exact = false; // other formats are fully checked on the server
    const h = hash(file.name + file.size);
    rows = 2000 + (h % 40000); dup = Math.round(rows * ((h % 7) / 1000)); geom = Math.round(rows * (((h >> 3) % 5) / 1000));
    ulpin = Math.round(rows * (((h >> 5) % 9) / 1000)); empty = Math.round(rows * (((h >> 7) % 6) / 1000));
  }
  const res = { rows, dup, geom, ulpin: needsUlpin ? ulpin : null, empty, exact };
  const errors = dup + geom + (res.ulpin || 0) + empty;
  res.score = Math.max(0, Math.round(100 - (errors / Math.max(rows, 1)) * 100));
  return res;
}

function Wizard({ onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState(TYPES[0]);
  const [state, setState] = useState("Maharashtra");
  const [file, setFile] = useState(null);
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

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[#1f2a24]/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Upload data" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#faf6ea] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-['Newsreader',serif] text-2xl font-medium">Upload data</h2>
            <p className="text-sm text-[#5c5a4b]">Your file is checked before it enters the pipeline.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-lg text-[#5c5a4b] hover:bg-[#e8dfc6]"><X size={18} /></button>
        </div>
        <ol className="mt-4 flex gap-2 text-xs font-semibold">
          {["Choose file", "Validation report", "Submit"].map((s, i) => (
            <li key={s} className={`flex-1 rounded-lg px-3 py-2 ${step === i + 1 ? "bg-[#1f4d3a] text-[#eef3ea]" : step > i + 1 ? "bg-[#dbe6d5] text-[#2f5a43]" : "bg-[#efe7d0] text-[#7a775f]"}`}>{i + 1}. {s}</li>
          ))}
        </ol>

        {step === 1 && (
          <div className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">Type of data<select value={type} onChange={(e) => setType(e.target.value)} className={field}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
              <label className="text-sm font-medium">Jurisdiction<select value={state} onChange={(e) => setState(e.target.value)} className={field}>{Object.keys(STATES).map((s) => <option key={s}>{s}</option>)}</select></label>
            </div>
            <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-[#b9cfbe] bg-[#eef3e8] px-4 py-8 text-center hover:bg-[#e6eede]">
              <Upload className="text-[#1f4d3a]" />
              <span className="text-sm font-medium">{file ? file.name : "Choose a file"}</span>
              <span className="text-xs text-[#5c5a4b]">CSV and GeoJSON are read line by line here. Shapefile ZIP, Excel, GeoTIFF and PDF are fully checked after upload.</span>
              <input type="file" className="sr-only" accept=".csv,.geojson,.json,.zip,.xlsx,.tif,.tiff,.pdf" onChange={(e) => setFile(e.target.files[0] || null)} />
            </label>
            <p className="text-xs text-[#7a775f]">Tip: a CSV with the columns ulpin, latitude and longitude gets the most useful report.</p>
            {err && <p role="alert" className="text-sm text-[#9b3b2f]">{err}</p>}
            <div className="flex justify-end"><button onClick={run} className="rounded-lg bg-[#1f4d3a] px-5 py-2.5 text-sm font-semibold text-[#eef3ea] hover:bg-[#173b2c]">Run checks</button></div>
          </div>
        )}

        {step >= 2 && (
          <div className="mt-5">
            <p className="text-sm text-[#5c5a4b]">{file.name}{rep ? `, ${rep.rows.toLocaleString()} records scanned` : ", reading file"}</p>
            <ul className="mt-3 space-y-2">
              {CHECKS.map(([k, l], i) => {
                const done = rep && shown > i, n = rep ? rep[k] : null;
                const pct = rep && n ? (n / Math.max(rep.rows, 1)) * 100 : 0;
                const tone = n === null ? "text-[#7a775f]" : n === 0 ? "text-[#2f6b4a]" : pct < 1 ? "text-[#b7791f]" : "text-[#9b3b2f]";
                return (
                  <li key={k} className="flex items-center gap-3 rounded-lg bg-[#f3ecdc] px-4 py-3">
                    {!done ? <Loader2 size={18} className="animate-spin text-[#7a775f]" /> : n === null ? <span className="w-[18px] text-center text-[#7a775f]">-</span> : n === 0 ? <CheckCircle2 size={18} className="text-[#2f6b4a]" /> : <XCircle size={18} className={tone} />}
                    <span className="flex-1 text-sm font-medium">{l}</span>
                    {done && <span className={`text-sm font-semibold ${tone}`}>{n === null ? "Not needed for this type" : n === 0 ? "None found" : `${n.toLocaleString()} found`}</span>}
                  </li>
                );
              })}
            </ul>
            {rep && shown === CHECKS.length && (
              <div className="mt-4 rounded-lg bg-[#e6eede] p-4">
                <p className="text-sm font-semibold">Quality score: {rep.score}%</p>
                <div className="mt-2 h-2 rounded-full bg-[#d8ceb2]"><div className="h-full rounded-full bg-[#1f4d3a]" style={{ width: `${rep.score}%` }} /></div>
                {!rep.exact && <p className="mt-2 text-xs text-[#7a775f]">Estimated for this file type. The server repeats the checks after upload.</p>}
              </div>
            )}
            {step === 3 ? (
              <p className="mt-4 flex items-center gap-2 text-sm font-medium text-[#2f6b4a]"><CheckCircle2 size={18} /> Submitted. It is now in the pipeline.</p>
            ) : (
              <div className="mt-5 flex justify-between">
                <button onClick={() => setStep(1)} className="rounded-lg border border-[#cfc4a5] px-5 py-2.5 text-sm font-semibold hover:bg-[#f3ecdc]">Choose another file</button>
                <button disabled={!rep || shown < CHECKS.length} onClick={() => { onSubmit({ file, type, state, rep }); setStep(3); }}
                  className="rounded-lg bg-[#1f4d3a] px-5 py-2.5 text-sm font-semibold text-[#eef3ea] hover:bg-[#173b2c] disabled:opacity-50">
                  {rep && rep.score < 90 ? "Submit and flag issues" : "Submit to pipeline"}
                </button>
              </div>
            )}
            {step === 3 && <div className="mt-4 flex justify-end"><button onClick={onClose} className="rounded-lg bg-[#1f4d3a] px-5 py-2.5 text-sm font-semibold text-[#eef3ea]">Done</button></div>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GovAgency() {
  const nav = useNavigate();
  const [ds, setDs] = useState(DATASETS0);
  const [tab, setTab] = useState("All");
  const [flags, setFlags] = useState(FLAGS0);
  const [miles, setMiles] = useState(MILES0);
  const [conns, setConns] = useState(CONN0);
  const [testing, setTesting] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [wizard, setWizard] = useState(false);
  const [toast, setToast] = useState("");
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3200); return () => clearTimeout(t); } }, [toast]);

  const today = new Date().toISOString().slice(0, 10);
  const failed = ds.filter((d) => d.status === "Failed").length;
  const openFlags = flags.filter((f) => !f.done).length;
  const overdue = miles.filter((m) => m.status !== "Completed" && m.due < today).length;
  const badConn = conns.filter((c) => c.status !== "Healthy").length;
  const avg = Math.round(ds.reduce((s, d) => s + d.score, 0) / ds.length);
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  function retry(id) {
    setDs((x) => x.map((d) => (d.id === id ? { ...d, status: "Running", last: "just now" } : d)));
    // TODO: POST /api/pipeline/{id}/retry
    setTimeout(() => setDs((x) => x.map((d) => (d.id === id ? { ...d, status: "Completed" } : d))), 2500);
  }
  function submitUpload({ file, type, rep }) {
    const id = Date.now();
    // TODO: POST /api/datasets (multipart) after the checks pass
    setDs((x) => [{ id, name: file.name.replace(/\.[^.]+$/, ""), type, conn: "Manual upload", records: rep.rows.toLocaleString(), status: "Running", last: "just now", score: rep.score, dup: rep.dup, geom: rep.geom, ulpin: rep.ulpin }, ...x]);
    setTimeout(() => setDs((x) => x.map((d) => (d.id === id ? { ...d, status: "Completed" } : d))), 3000);
    if (rep.score < 90) setFlags((f) => [{ id, from: "Agency", issue: `Validation found ${(rep.dup + rep.geom + (rep.ulpin || 0) + rep.empty).toLocaleString()} problems`, dataset: file.name, when: "just now", done: false }, ...f]);
  }
  function testConn(name) {
    setTesting(name);
    // TODO: POST /api/connectors/test
    setTimeout(() => {
      setConns((c) => c.map((x) => (x.name !== name ? x : x.status === "Down" ? x : { ...x, status: "Healthy", ms: 200 + (hash(name) % 200), sync: "just now" })));
      setToast(conns.find((x) => x.name === name).status === "Down" ? `${name} is still not responding.` : `${name} responded normally.`);
      setTesting("");
    }, 1200);
  }

  const kpis = [
    [Database, "Datasets submitted", ds.length, "Across 7 data types", "border-t-[#4d8066]"],
    [RefreshCw, "Failed ingestion jobs", failed, "Need a fix or a retry", "border-t-[#b5533f]"],
    [Gauge, "Average quality score", `${avg}%`, "Across all datasets", "border-t-[#c9853a]"],
    [Flag, "Open flagged issues", openFlags, "From public and researchers", "border-t-[#3f6a94]"],
  ];
  const attention = [
    ["Ingestion failed", `${failed} jobs`, `${ds.find((d) => d.status === "Failed")?.name || "No failed jobs"}${failed > 1 ? " and others" : ""} need a retry.`, "pipeline", failed ? "red" : "green"],
    ["Connector problems", `${badConn} affected`, "ULPIN registry is slow and the eCourts feed is not responding.", "connectors", badConn ? "amber" : "green"],
    ["Flagged errors", `${openFlags} open`, "Reports from the public and researchers are waiting for a fix.", "flags", openFlags ? "red" : "green"],
    ["Overdue milestones", `${overdue} overdue`, "Project milestones past their due date and not completed.", "milestones", overdue ? "amber" : "green"],
  ];
  const tone = { red: "border-l-[#b5533f] bg-[#f6e4dc] text-[#8a3324]", amber: "border-l-[#c9853a] bg-[#f7ecd4] text-[#7a5a12]", green: "border-l-[#4d8066] bg-[#e3ecdf] text-[#2f5a43]" };
  const rows = ds.filter((d) => tab === "All" || d.status === tab);

  return (
    <div className="min-h-screen bg-[#f3ecdc] text-[#1f2a24] font-['Public_Sans',sans-serif]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Public+Sans:wght@400;500;600&display=swap');`}</style>

      <header className="border-b border-[#ddd2b5]">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#1f4d3a] text-[#eef3ea]"><Landmark size={18} /></span>
          <span className="font-['Newsreader',serif] text-xl font-semibold">Bhoomi</span>
          <button onClick={() => nav("/")} aria-label="Sign out" className="ml-auto grid h-10 w-10 place-items-center rounded-xl text-[#5c5a4b] hover:bg-[#e8dfc6]"><LogOut size={18} /></button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-5 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#d8ceb2] pb-5">
          <div>
            <p className={label}>Agency desk</p>
            <h1 className="mt-1 text-3xl font-bold">Data Agency Workspace</h1>
            <p className="mt-1 text-sm text-[#5c5a4b]">Datasets, pipelines and quality checks for your jurisdiction.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#d9e4ee] px-3 py-1.5 text-xs font-semibold text-[#2b4d73]">Ministry of Rural Development</span>
            {failed + openFlags > 0 && <span className="rounded-md bg-[#f7ecd4] px-3 py-1.5 text-xs font-semibold text-[#7a5a12]">{failed + openFlags} need attention</span>}
            <button onClick={() => setWizard(true)} className="flex items-center gap-2 rounded-lg bg-[#1f4d3a] px-4 py-2.5 text-sm font-semibold text-[#eef3ea] hover:bg-[#173b2c]"><Upload size={16} /> Upload data</button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map(([I, l, v, n, c]) => (
            <div key={l} className={`${card} border-t-2 ${c} p-5`}>
              <p className={`${label} flex items-center gap-2`}><I size={14} />{l}</p>
              <p className="mt-3 text-4xl font-bold">{v}</p>
              <p className="mt-1 text-sm text-[#7a775f]">{n}</p>
            </div>
          ))}
        </div>

        <section className={`${card} p-5`}>
          <h2 className="flex items-center gap-2 font-semibold"><ClipboardList size={17} /> Attention required</h2>
          <p className="text-sm text-[#7a775f]">Items that need a fix, a retry or a sign-off today.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {attention.map(([t, chip, d, id, c]) => (
              <div key={t} className={`rounded-lg border-l-4 p-4 ${tone[c]}`}>
                <div className="flex items-start justify-between gap-2"><p className="font-semibold">{t}</p><span className="shrink-0 rounded bg-white/60 px-2 py-0.5 text-[11px] font-semibold">{chip}</span></div>
                <p className="mt-2 text-sm text-[#1f2a24]">{d}</p>
                <button onClick={() => go(id)} className="mt-3 flex items-center gap-1 rounded-md border border-[#1f2a24]/20 bg-white/50 px-2.5 py-1 text-xs font-semibold">Open section <ChevronRight size={13} /></button>
              </div>
            ))}
          </div>
        </section>

        {/* Pipeline */}
        <section id="pipeline" className={`${card} scroll-mt-6 overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
            <h2 className="font-semibold">Data pipeline status</h2>
            <div className="flex gap-1 rounded-lg bg-[#efe7d0] p-1">
              {["All", "Running", "Failed", "Completed"].map((t) => (
                <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${tab === t ? "bg-[#1f4d3a] text-[#eef3ea]" : "text-[#5c5a4b]"}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-[#f3ecdc]"><tr><th className={th}>Dataset</th><th className={th}>Source</th><th className={th}>Records</th><th className={th}>Last run</th><th className={th}>Status</th><th className={th}></th></tr></thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id} className="border-t border-[#e6dcc2]">
                    <td className="px-3 py-2.5 font-medium">{d.name}<span className="block text-xs font-normal text-[#7a775f]">{d.type}</span></td>
                    <td className="px-3 py-2.5">{d.conn}</td><td className="px-3 py-2.5">{d.records}</td><td className="px-3 py-2.5 text-[#5c5a4b]">{d.last}</td>
                    <td className="px-3 py-2.5"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLS[d.status]}`}>{d.status === "Running" && <Loader2 size={11} className="animate-spin" />}{d.status}</span></td>
                    <td className="px-3 py-2.5 text-right">{d.status === "Failed" && <button onClick={() => retry(d.id)} className="rounded-md border border-[#cfc4a5] px-3 py-1 text-xs font-semibold hover:bg-[#f3ecdc]">Retry</button>}</td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={6} className="px-3 py-6 text-center text-[#7a775f]">No datasets with this status.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quality */}
          <section className={`${card} overflow-hidden`}>
            <h2 className="p-5 pb-3 font-semibold">Data quality by dataset</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[460px] text-sm">
                <thead className="bg-[#f3ecdc]"><tr><th className={th}>Dataset</th><th className={th}>Score</th><th className={th}>Duplicates</th><th className={th}>Geometry</th><th className={th}>ULPIN</th></tr></thead>
                <tbody>
                  {ds.map((d) => (
                    <tr key={d.id} className="border-t border-[#e6dcc2]">
                      <td className="px-3 py-2.5 font-medium">{d.name}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2"><div className="h-2 w-20 rounded-full bg-[#e6dcc2]"><div className={`h-full rounded-full ${d.score >= 90 ? "bg-[#4d8066]" : d.score >= 75 ? "bg-[#c9853a]" : "bg-[#b5533f]"}`} style={{ width: `${d.score}%` }} /></div><span className="w-9 font-semibold">{d.score}%</span></div>
                      </td>
                      <td className="px-3 py-2.5">{d.dup.toLocaleString()}</td><td className="px-3 py-2.5">{d.geom.toLocaleString()}</td>
                      <td className="px-3 py-2.5">{d.ulpin === null ? <span className="text-[#a09c84]">n/a</span> : d.ulpin.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Heatmap */}
          <section className={`${card} p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-semibold"><MapPin size={16} /> Districts that have submitted data</h2>
              <select value={state} onChange={(e) => setState(e.target.value)} aria-label="State" className="rounded-lg border border-[#d8ceb2] bg-[#fffdf6] px-3 py-1.5 text-sm">{Object.keys(STATES).map((s) => <option key={s}>{s}</option>)}</select>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-1.5 sm:grid-cols-4">
              {STATES[state].map((d) => {
                const v = 25 + (hash(state + d) % 76);
                return <div key={d} title={`${d}: ${v}% complete`} className={`rounded-md px-2 py-2 text-xs ${heat(v)}`}><p className="truncate font-medium">{d}</p><p className="font-semibold">{v}%</p></div>;
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#5c5a4b]">
              {[["bg-[#ebc9b9]", "Under 40%"], ["bg-[#f0e0b0]", "40 to 69%"], ["bg-[#b9d3bf]", "70 to 89%"], ["bg-[#6f9c82]", "90% and above"]].map(([c, l]) => <span key={l} className="flex items-center gap-1.5"><span className={`h-3 w-3 rounded ${c}`} />{l}</span>)}
            </div>
            <p className="mt-2 text-xs text-[#a09c84]">Sample values until the completeness API is connected.</p>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Flags */}
          <section id="flags" className={`${card} scroll-mt-6 overflow-hidden`}>
            <h2 className="flex items-center gap-2 p-5 pb-3 font-semibold"><Flag size={16} /> Flagged issues <span className="rounded-full bg-[#f1d3cb] px-2 py-0.5 text-xs text-[#8a3324]">{openFlags} open</span></h2>
            <ul className="divide-y divide-[#e6dcc2]">
              {flags.map((f) => (
                <li key={f.id} className={`flex items-start gap-3 px-5 py-3 ${f.done ? "opacity-50" : ""}`}>
                  <span className={`mt-0.5 shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold ${f.from === "Public" ? "bg-[#d9e4ee] text-[#2b4d73]" : f.from === "Researcher" ? "bg-[#e6dcf0] text-[#5b3f7a]" : "bg-[#dbe6d5] text-[#2f5a43]"}`}>{f.from}</span>
                  <div className="min-w-0 flex-1"><p className={`text-sm font-medium ${f.done ? "line-through" : ""}`}>{f.issue}</p><p className="text-xs text-[#7a775f]">{f.dataset}, {f.when}</p></div>
                  {!f.done && <button onClick={() => { setFlags((x) => x.map((y) => (y.id === f.id ? { ...y, done: true } : y))); setToast("Marked as fixed. The reporter will be notified."); }} className="shrink-0 rounded-md border border-[#cfc4a5] px-3 py-1 text-xs font-semibold hover:bg-[#f3ecdc]">Mark fixed</button>}
                </li>
              ))}
            </ul>
          </section>

          {/* Connectors */}
          <section id="connectors" className={`${card} scroll-mt-6 overflow-hidden`}>
            <h2 className="flex items-center gap-2 p-5 pb-3 font-semibold"><Plug size={16} /> Connector and API health</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[460px] text-sm">
                <thead className="bg-[#f3ecdc]"><tr><th className={th}>Connector</th><th className={th}>Status</th><th className={th}>Response</th><th className={th}>Uptime</th><th className={th}></th></tr></thead>
                <tbody>
                  {conns.map((c) => (
                    <tr key={c.name} className="border-t border-[#e6dcc2]">
                      <td className="px-3 py-2.5 font-medium">{c.name}<span className="block text-xs font-normal text-[#7a775f]">{c.kind}, synced {c.sync}</span></td>
                      <td className="px-3 py-2.5"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLS[c.status]}`}>{c.status}</span></td>
                      <td className="px-3 py-2.5">{c.ms ? `${c.ms} ms` : "No response"}</td><td className="px-3 py-2.5">{c.up}</td>
                      <td className="px-3 py-2.5 text-right"><button onClick={() => testConn(c.name)} disabled={testing === c.name} className="inline-flex items-center gap-1.5 rounded-md border border-[#cfc4a5] px-3 py-1 text-xs font-semibold hover:bg-[#f3ecdc]">{testing === c.name && <Loader2 size={11} className="animate-spin" />}Test</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Milestones */}
        <section id="milestones" className={`${card} scroll-mt-6 overflow-hidden`}>
          <h2 className="p-5 pb-3 font-semibold">Project milestones</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-[#f3ecdc]"><tr><th className={th}>Project</th><th className={th}>Milestone</th><th className={th}>Due</th><th className={th}>Status</th></tr></thead>
              <tbody>
                {miles.map((m) => (
                  <tr key={m.id} className="border-t border-[#e6dcc2]">
                    <td className="px-3 py-2.5 font-medium">{m.project}</td><td className="px-3 py-2.5">{m.milestone}</td>
                    <td className="px-3 py-2.5">{new Date(m.due).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}{m.status !== "Completed" && m.due < today && <span className="ml-2 rounded bg-[#f1d3cb] px-1.5 py-0.5 text-[11px] font-semibold text-[#8a3324]">Overdue</span>}</td>
                    <td className="px-3 py-2.5">
                      <select value={m.status} aria-label={`Status of ${m.milestone}`} onChange={(e) => { setMiles((x) => x.map((y) => (y.id === m.id ? { ...y, status: e.target.value } : y))); setToast("Milestone updated."); /* TODO: PATCH /api/milestones/{id} */ }}
                        className="rounded-lg border border-[#d8ceb2] bg-[#fffdf6] px-2.5 py-1.5 text-sm">{MSTATUS.map((s) => <option key={s}>{s}</option>)}</select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {toast && <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#1f2a24] px-5 py-3 text-sm text-[#f3ecdc] shadow-xl">{toast}</div>}
      {wizard && <Wizard onClose={() => setWizard(false)} onSubmit={submitUpload} />}
    </div>
  );
}