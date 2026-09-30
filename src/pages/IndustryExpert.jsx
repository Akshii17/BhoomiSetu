
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Landmark, LogOut, Search, Plus, Trophy, Calendar, Users, Copy, Play, Lock, Bookmark, Sparkles, FileText,
  KeyRound, Check, X, Rocket, Layers, Briefcase, Loader2,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import "maplibre-gl/dist/maplibre-gl.css";
import { ROLES } from "../roles";

/* ---------------- mock data (swap for /api calls later) ---------------- */
const SKILLS = ["Remote sensing", "GIS", "AI/ML", "IoT", "Blockchain", "Data engineering", "Legal tech", "Mobile apps"];
const CHALLENGES = [
  { id: 1, title: "Parcel boundary matching from satellite imagery", type: "Hackathon", org: "Dept. of Land Resources", prize: "₹5,00,000", days: 14, level: "Advanced", tags: ["Remote sensing", "AI/ML", "GIS"] },
  { id: 2, title: "Early-warning model for land dispute escalation", type: "Challenge", org: "Ministry of Rural Development", prize: "₹3,00,000", days: 21, level: "Advanced", tags: ["AI/ML", "Data engineering", "Legal tech"] },
  { id: 3, title: "WhatsApp bot for mutation status", type: "Hackathon", org: "Revenue Dept., Maharashtra", prize: "₹1,50,000", days: 9, level: "Beginner", tags: ["Mobile apps", "AI/ML"] },
  { id: 4, title: "Low-cost IoT boundary markers", type: "Grant call", org: "IIT Bombay", prize: "₹10,00,000 grant", days: 30, level: "Intermediate", tags: ["IoT", "Remote sensing"] },
  { id: 5, title: "Tamper-proof audit trail for land records", type: "Challenge", org: "NIC", prize: "₹4,00,000", days: 18, level: "Intermediate", tags: ["Blockchain", "Data engineering"] },
  { id: 6, title: "Climate-risk overlay for village parcels", type: "Hackathon", org: "NRSC", prize: "₹2,50,000", days: 25, level: "Intermediate", tags: ["GIS", "Remote sensing", "Data engineering"] },
].map((c) => ({ ...c, joined: false }));
const PILOTS = [
  { id: 1, title: "ULPIN parcel verification, Nashik", lead: "Revenue Dept., Maharashtra", months: 6, stage: "Recruiting partners", needs: ["GIS", "Data engineering"] },
  { id: 2, title: "Drone survey of common land, Kutch", lead: "Gujarat Land Dept. and IIT Gandhinagar", months: 4, stage: "Recruiting partners", needs: ["Remote sensing", "IoT"] },
  { id: 3, title: "Dispute triage assistant, Kerala", lead: "Kerala Revenue Dept.", months: 8, stage: "Shortlisting", needs: ["AI/ML", "Legal tech"] },
  { id: 4, title: "Record digitisation quality checks, Bihar", lead: "Bihar Land Reforms Dept.", months: 5, stage: "Recruiting partners", needs: ["Mobile apps", "Data engineering"] },
].map((p) => ({ ...p, applied: false }));
const SUBS = [
  { id: 1, title: "Sentinel-2 field boundary extractor", to: "Parcel boundary matching", st: "Under review", on: "12 Sep 2026" },
  { id: 2, title: "Offline mutation tracker for village offices", to: "WhatsApp bot for mutation status", st: "Shortlisted", on: "4 Sep 2026" },
];
const SPACES = [
  { id: 1, name: "Coastal Erosion 2026", lead: "IIT Bombay", members: 18, joined: true },
  { id: 2, name: "Urban Sprawl around Pune", lead: "GeoNest Labs", members: 9, joined: false },
  { id: 3, name: "Dispute Analytics Consortium", lead: "DoLR", members: 26, joined: false },
  { id: 4, name: "Village Parcel Digitisation", lead: "NIC", members: 14, joined: false },
];
const CASES = [
  { id: 1, title: "Cutting mutation time from 45 to 12 days in Nashik", sector: "Land records", region: "Maharashtra", by: "Revenue Dept." },
  { id: 2, title: "Drone mapping of 1,200 villages under SVAMITVA", sector: "Surveying", region: "Uttar Pradesh", by: "Survey of India" },
  { id: 3, title: "AI triage for revenue court backlogs", sector: "Disputes", region: "Kerala", by: "Kerala Revenue Dept." },
  { id: 4, title: "Flood-risk overlay for 400 village plans", sector: "Climate", region: "Odisha", by: "NRSC" },
].map((c) => ({ ...c, saved: false }));
const REPO = [
  { id: 1, title: "Land Fragmentation in Western Maharashtra, 2010 to 2024", type: "Paper" },
  { id: 2, title: "National Land Records Modernisation Programme: Evaluation", type: "Policy" },
  { id: 3, title: "Sentinel-2 land cover, 2025 (public layer)", type: "Dataset" },
  { id: 4, title: "Census 2011 village amenities", type: "Dataset" },
  { id: 5, title: "Dispute Resolution Timelines, Kerala Case Study", type: "Paper" },
  { id: 6, title: "Model Land Titling Act: Explainer", type: "Policy" },
].map((r) => ({ ...r, saved: false }));
const SERIES = {
  "Land use": { unit: "Built-up area (%)", v: [18, 19.2, 20.1, 21.6, 22.9, 24.4, 25.8, 27.1] },
  Infrastructure: { unit: "Road and rail density (km per 100 sq km)", v: [61, 63, 66, 70, 73, 77, 82, 86] },
  "Climate risk": { unit: "Flood-prone area (%)", v: [9.4, 9.8, 10.5, 10.9, 11.8, 12.2, 12.9, 13.6] },
};
const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
const LOCKED = ["Parcel boundaries", "Dispute hotspots", "Satellite tiles"];
const IMPACT = [
  { name: "Nashik verification", baseline: 100, after: 38 },
  { name: "Kutch drone survey", baseline: 100, after: 55 },
  { name: "Kerala triage", baseline: 100, after: 72 },
];
const ENDPOINTS = [
  { path: "/v1/datasets", note: "List datasets you can access", res: { count: 3, items: [{ id: "ds_101", name: "Sentinel-2 land cover 2025", access: "public" }, { id: "ds_204", name: "Census 2011 village amenities", access: "public" }] } },
  { path: "/v1/layers/land-use?district=Nashik", note: "Land-use layer for a district", res: { district: "Nashik", year: 2025, classes: { agriculture: 61.2, built_up: 9.4, forest: 21.8, water: 3.1 } } },
  { path: "/v1/projects?status=active", note: "Active pilot projects", res: { count: 4, items: [{ id: "pl_1", title: "ULPIN parcel verification, Nashik", stage: "Recruiting partners" }] } },
  { path: "/v1/analytics/land-use-change?state=MH", note: "Land-use change, permitted summary only", res: { state: "MH", period: "2018-2025", built_up_change_pct: 9.1, note: "Parcel-level detail is restricted" } },
];
const LEVEL = { Beginner: "bg-emerald-100 text-emerald-800", Intermediate: "bg-amber-100 text-amber-800", Advanced: "bg-rose-100 text-rose-800" };
const ST = { "Under review": "bg-amber-100 text-amber-800", Shortlisted: "bg-blue-100 text-blue-800", Awarded: "bg-emerald-100 text-emerald-800", Submitted: "bg-slate-200 text-slate-700" };

const DISTRICTS = {
  type: "FeatureCollection",
  features: [
    ["Nashik", 73.79, 20.0, 22, 71, 9], ["Pune", 73.86, 18.52, 34, 88, 12], ["Nagpur", 79.09, 21.15, 27, 76, 8],
    ["Ahmedabad", 72.57, 23.02, 38, 94, 11], ["Kutch", 69.86, 23.73, 12, 45, 19], ["Surat", 72.83, 21.17, 33, 90, 17],
    ["Kochi", 76.27, 9.93, 31, 84, 23], ["Thrissur", 76.21, 10.53, 24, 72, 21], ["Kozhikode", 75.78, 11.25, 26, 70, 18],
  ].map(([name, lng, lat, land, infra, clim]) => ({ type: "Feature", geometry: { type: "Point", coordinates: [lng, lat] }, properties: { name, land, infra, clim } })),
};
const LAYER_PROP = { "Land use": ["land", "#e11d48", 10, 40, "Built-up area (%)"], Infrastructure: ["infra", "#2563eb", 40, 100, "Road and rail density"], "Climate risk": ["clim", "#d97706", 5, 25, "Flood-prone area (%)"] };
const VIEW = { Maharashtra: [[75.7, 19.4], 5.3], Gujarat: [[71.5, 22.7], 5.4], Kerala: [[76.3, 10.4], 6.4] };
const dotPaint = (layer) => {
  const [prop, color, lo, hi] = LAYER_PROP[layer];
  return { "circle-color": color, "circle-opacity": 0.75, "circle-stroke-color": "#ffffff", "circle-stroke-width": 1.5, "circle-radius": ["interpolate", ["linear"], ["get", prop], lo, 6, hi, 22] };
};

/* ---------------- helpers ---------------- */
const cx = (...a) => a.filter(Boolean).join(" ");
const rand = () => Math.random().toString(36).slice(2, 10);
const inp = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100";

function Btn({ kind = "ghost", className, ...p }) {
  const k = { primary: "bg-rose-600 text-white hover:bg-rose-700", ghost: "border border-slate-300 text-slate-700 hover:bg-slate-50", done: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100", dark: "bg-slate-800 text-white hover:bg-slate-900" }[kind];
  return <button {...p} className={cx("inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40", k, className)} />;
}
function Card({ title, right, children, className }) {
  return (
    <section className={cx("rounded-2xl bg-white ring-1 ring-slate-200", className)}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
        <h2 className="font-['Newsreader',serif] text-lg font-semibold text-slate-900">{title}</h2>{right}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}
const Chip = ({ children, className }) => <span className={cx("rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700", className)}>{children}</span>;
const Empty = ({ children }) => <p className="py-8 text-center text-sm text-slate-500">{children}</p>;
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-['Newsreader',serif] text-xl font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function MiniMap({ layer, stateSel }) {
  const box = useRef(null);
  const map = useRef(null);
  const cur = useRef(layer);
  cur.current = layer;
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const gl = await import("maplibre-gl");
        if (dead || !box.current) return;
        const m = new gl.Map({
          container: box.current, center: VIEW[stateSel][0], zoom: VIEW[stateSel][1],
          style: { version: 8, sources: { base: { type: "raster", tiles: ["https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© OpenStreetMap contributors © CARTO" } }, layers: [{ id: "base", type: "raster", source: "base" }] },
        });
        map.current = m;
        m.addControl(new gl.NavigationControl({ showCompass: false }), "top-right");
        m.on("load", () => {
          m.addSource("districts", { type: "geojson", data: DISTRICTS });
          m.addLayer({ id: "dots", type: "circle", source: "districts", paint: dotPaint(cur.current) });
          m.on("click", "dots", (e) => {
            const [prop, , , , label] = LAYER_PROP[cur.current];
            const p = e.features[0].properties;
            new gl.Popup({ closeButton: false }).setLngLat(e.lngLat).setHTML(`<b>${p.name}</b><br/>${label}: ${p[prop]}`).addTo(m);
          });
          m.on("mouseenter", "dots", () => { m.getCanvas().style.cursor = "pointer"; });
          m.on("mouseleave", "dots", () => { m.getCanvas().style.cursor = ""; });
          setReady(true);
        });
      } catch {
        setErr("The map could not load. Check your internet connection and refresh.");
      }
    })();
    return () => { dead = true; map.current?.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    Object.entries(dotPaint(layer)).forEach(([k, v]) => m.setPaintProperty("dots", k, v));
  }, [layer, ready]);

  useEffect(() => {
    const m = map.current;
    if (ready && m) m.flyTo({ center: VIEW[stateSel][0], zoom: VIEW[stateSel][1], duration: 1200 });
  }, [stateSel, ready]);

  return (
    <div className="mt-4">
      <div className="relative h-64 overflow-hidden rounded-xl ring-1 ring-slate-200">
        <div ref={box} className="h-full w-full" />
        {err && <p className="absolute inset-0 grid place-items-center bg-slate-50 p-6 text-center text-sm text-slate-500">{err}</p>}
      </div>
      <p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: LAYER_PROP[layer][1] }} />{LAYER_PROP[layer][4]}. Bigger dots mean higher values. Click a dot for details.</p>
    </div>
  );
}

/* ---------------- page ---------------- */
export default function Industry({ user: userProp, onLogout: logoutProp }) {
  const saved = (() => { try { return JSON.parse(localStorage.getItem("bhoomi_user")); } catch { return null; } })();
  const user = userProp || saved || { name: "Industry Expert", email: "industry@demo.in" };
  const onLogout = logoutProp || (() => { localStorage.removeItem("bhoomi_user"); window.location.href = "/"; });

  const [tab, setTab] = useState("opps");
  const [challenges, setChallenges] = useState(CHALLENGES);
  const [pilots, setPilots] = useState(PILOTS);
  const [subs, setSubs] = useState(SUBS);
  const [spaces, setSpaces] = useState(SPACES);
  const [cases, setCases] = useState(CASES);
  const [repo, setRepo] = useState(REPO);
  const [skills, setSkills] = useState(["GIS", "Remote sensing"]);
  const [q, setQ] = useState("");
  const [typeF, setTypeF] = useState("all");
  const [levelF, setLevelF] = useState("all");
  const [rq, setRq] = useState("");
  const [rType, setRType] = useState("all");
  const [layer, setLayer] = useState("Land use");
  const [stateSel, setStateSel] = useState("Maharashtra");
  const [requested, setRequested] = useState([]);
  const [ep, setEp] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [apiRes, setApiRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [calls, setCalls] = useState(0);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ title: "", ref: "", text: "", sector: "Land records" });
  const [toast, setToast] = useState("");

  const say = (m) => { setToast(m); setTimeout(() => setToast(""), 2500); };
  const upd = (set, id, patch) => set((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const openForm = (type) => { setForm({ title: "", ref: type === "submit" ? challenges[0].title : "", text: "", sector: "Land records" }); setModal(type); };

  /* opportunities */
  const shown = useMemo(() => challenges.filter((c) => (typeF === "all" || c.type === typeF) && (levelF === "all" || c.level === levelF) && `${c.title} ${c.org} ${c.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase())), [challenges, q, typeF, levelF]);
  const matches = useMemo(() => challenges.map((c) => ({ ...c, pct: Math.round((c.tags.filter((t) => skills.includes(t)).length / c.tags.length) * 100) })).filter((c) => c.pct > 0).sort((a, b) => b.pct - a.pct).slice(0, 3), [challenges, skills]);
  const toggleSkill = (s) => setSkills((l) => (l.includes(s) ? l.filter((x) => x !== s) : [...l, s]));
  const join = (c) => { upd(setChallenges, c.id, { joined: !c.joined }); say(c.joined ? `Left "${c.title}"` : `You joined "${c.title}"`); };
  const apply = (p) => { upd(setPilots, p.id, { applied: !p.applied }); say(p.applied ? "Application withdrawn" : "Application sent to the pilot lead"); };
  const toggleSpace = (s) => { upd(setSpaces, s.id, { joined: !s.joined, members: s.members + (s.joined ? -1 : 1) }); say(s.joined ? `Left ${s.name}` : `Joined ${s.name} as a collaborator`); };

  /* forms */
  const submitInnovation = () => {
    if (!form.title.trim() || !form.text.trim()) return say("Add a title and a short description");
    setSubs((l) => [{ id: Date.now(), title: form.title.trim(), to: form.ref, st: "Submitted", on: "Today" }, ...l]);
    setModal(null); setTab("work"); say("Innovation submitted");
  };
  const shareCase = () => {
    if (!form.title.trim() || !form.text.trim()) return say("Add a title and a short summary");
    setCases((l) => [{ id: Date.now(), title: form.title.trim(), sector: form.sector, region: "India", by: "You", saved: false, mine: true }, ...l]);
    setModal(null); setTab("cases"); say("Case study shared");
  };

  /* data and insights */
  const rShown = repo.filter((r) => (rType === "all" || r.type === rType) && r.title.toLowerCase().includes(rq.toLowerCase()));
  const factor = { Maharashtra: 1, Gujarat: 0.85, Kerala: 1.2 }[stateSel];
  const chart = YEARS.map((y, i) => ({ y, v: +(SERIES[layer].v[i] * factor).toFixed(1) }));
  const request = (l) => { setRequested((r) => [...r, l]); say(`Access to "${l}" requested from the admin`); };

  /* API playground */
  const genKey = () => { setApiKey(`bhm_${rand()}${rand()}${rand()}`); say("API key created"); };
  const send = () => {
    if (!apiKey) { setApiRes({ status: 401, ms: 0, body: { error: "Missing API key. Create one first." } }); return; }
    setBusy(true);
    setTimeout(() => { setApiRes({ status: 200, ms: 120 + Math.floor(Math.random() * 180), body: ENDPOINTS[ep].res }); setCalls((n) => n + 1); setBusy(false); }, 700);
  };
  const curl = `curl -H "Authorization: Bearer ${apiKey || "YOUR_KEY"}" https://api.bhoomi.gov.in${ENDPOINTS[ep].path}`;
  const copy = async (t) => { try { await navigator.clipboard.writeText(t); say("Copied"); } catch { say("Copy failed, select the text and copy it manually"); } };

  const TABS = [["opps", "Opportunities"], ["pilots", "Pilots"], ["work", "My work"], ["cases", "Case studies"], ["data", "Data and insights"], ["api", "API playground"]];
  const joinedCount = challenges.filter((c) => c.joined).length;

  return (
    <div className="min-h-screen bg-slate-50 font-['Public_Sans',sans-serif] text-slate-800">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Public+Sans:wght@400;500;600&display=swap');`}</style>

      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-[#0a1a44] px-5 py-3 text-white sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600"><Landmark size={18} /></span>
          <div><p className="font-['Newsreader',serif] text-xl font-semibold leading-none">Bhoomi</p><p className="mt-1 text-xs text-blue-200">Opportunity board</p></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block"><p className="text-sm font-medium">{user.name}</p><p className="text-xs text-blue-200">{ROLES.industry.label}</p></div>
          <button onClick={onLogout} className="flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 text-sm font-semibold hover:bg-white/20"><LogOut size={15} />Sign out</button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 p-5 sm:p-8">
        <section className="rounded-2xl bg-[#0a1a44] p-8 text-white sm:p-10">
          <h1 className="max-w-2xl font-['Newsreader',serif] text-4xl font-medium leading-tight sm:text-5xl">Find a challenge that fits your team, {String(user.name || "there").split(" ")[0]}.</h1>
          <p className="mt-3 max-w-xl text-lg text-blue-100">Build for land governance: join hackathons, partner on pilots and share what works.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => setTab("opps")} className="rounded-xl bg-rose-600 px-5 py-3 font-semibold hover:bg-rose-500">Browse challenges</button>
            <button onClick={() => openForm("submit")} className="rounded-xl bg-white/10 px-5 py-3 font-semibold hover:bg-white/20">Submit an innovation</button>
            <button onClick={() => openForm("case")} className="rounded-xl bg-white/10 px-5 py-3 font-semibold hover:bg-white/20">Share a case study</button>
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {[[Trophy, `${joinedCount} challenge${joinedCount === 1 ? "" : "s"} joined`], [Rocket, `${pilots.filter((p) => p.applied).length} pilot applications`], [Users, `${spaces.filter((s) => s.joined).length} workspaces`]].map(([I, t]) => (
              <li key={t} className="flex items-center gap-3 text-blue-50"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10"><I size={18} /></span>{t}</li>
            ))}
          </ul>
        </section>

        <div className="overflow-x-auto"><div className="inline-grid auto-cols-max grid-flow-col rounded-xl bg-slate-200 p-1" role="tablist">
          {TABS.map(([id, l]) => <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={cx("rounded-lg px-4 py-2.5 text-sm font-semibold", tab === id ? "bg-white text-rose-700 shadow" : "text-slate-600")}>{l}</button>)}
        </div></div>

        {/* ===== opportunities ===== */}
        {tab === "opps" && (
          <>
            <Card title="Match me" right={<span className="flex items-center gap-1.5 text-sm text-slate-500"><Sparkles size={15} />Pick what your team does</span>}>
              <div className="flex flex-wrap gap-2">{SKILLS.map((s) => <button key={s} aria-pressed={skills.includes(s)} onClick={() => toggleSkill(s)} className={cx("rounded-full px-3.5 py-1.5 text-sm font-medium", skills.includes(s) ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200")}>{s}</button>)}</div>
              {matches.length === 0 ? <p className="mt-4 text-sm text-slate-500">Pick at least one skill to see matching challenges.</p> : (
                <ul className="mt-4 grid gap-3 md:grid-cols-3">{matches.map((c) => (
                  <li key={c.id} className="rounded-xl bg-slate-50 p-4">
                    <p className="text-2xl font-semibold text-rose-600">{c.pct}%</p><p className="text-xs text-slate-500">skill match</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{c.title}</p>
                    <Btn kind={c.joined ? "done" : "ghost"} className="mt-3" onClick={() => join(c)}>{c.joined ? <><Check size={14} />Joined</> : "Join"}</Btn>
                  </li>))}</ul>
              )}
            </Card>

            <div className="flex flex-wrap gap-3">
              <div className="relative min-w-[220px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Search challenges" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by topic, organisation or skill" className={cx(inp, "pl-9")} /></div>
              <select aria-label="Filter by type" value={typeF} onChange={(e) => setTypeF(e.target.value)} className={cx(inp, "w-auto")}><option value="all">All types</option><option>Hackathon</option><option>Challenge</option><option>Grant call</option></select>
              <select aria-label="Filter by difficulty" value={levelF} onChange={(e) => setLevelF(e.target.value)} className={cx(inp, "w-auto")}><option value="all">Any difficulty</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select>
            </div>
            {shown.length === 0 ? <Empty>No challenges match. Clear the search or change a filter.</Empty> : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{shown.map((c) => (
                <article key={c.id} className="flex flex-col rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                  <div className="flex items-center gap-2"><Chip className="bg-blue-100 text-blue-800">{c.type}</Chip><Chip className={LEVEL[c.level]}>{c.level}</Chip></div>
                  <h3 className="mt-3 font-['Newsreader',serif] text-lg font-semibold leading-snug text-slate-900">{c.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{c.org}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">{c.tags.map((t) => <Chip key={t}>{t}</Chip>)}</div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-slate-600"><span className="flex items-center gap-1.5"><Trophy size={15} />{c.prize}</span><span className="flex items-center gap-1.5"><Calendar size={15} />{c.days} days left</span></div>
                  <div className="mt-auto flex gap-2 pt-4">
                    <Btn kind={c.joined ? "done" : "primary"} className="flex-1" onClick={() => join(c)}>{c.joined ? <><Check size={14} />Joined</> : "Join"}</Btn>
                    {c.joined && <Btn onClick={() => { setForm({ title: "", ref: c.title, text: "", sector: "" }); setModal("submit"); }}>Submit</Btn>}
                  </div>
                </article>))}</div>
            )}
          </>
        )}

        {/* ===== pilots ===== */}
        {tab === "pilots" && (
          <div className="grid gap-4 md:grid-cols-2">{pilots.map((p) => (
            <article key={p.id} className="flex flex-col rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <Chip className="w-fit bg-amber-100 text-amber-800">{p.stage}</Chip>
              <h3 className="mt-3 font-['Newsreader',serif] text-lg font-semibold text-slate-900">{p.title}</h3>
              <p className="mt-1 text-sm text-slate-500">Led by {p.lead} · {p.months} months</p>
              <p className="mt-3 text-xs font-semibold text-slate-500">Partners needed with</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">{p.needs.map((t) => <Chip key={t} className={skills.includes(t) ? "bg-rose-100 text-rose-800" : ""}>{t}</Chip>)}</div>
              <Btn kind={p.applied ? "done" : "primary"} className="mt-auto self-start" onClick={() => apply(p)}>{p.applied ? <><Check size={14} />Applied, withdraw</> : "Apply as partner"}</Btn>
            </article>))}</div>
        )}

        {/* ===== my work ===== */}
        {tab === "work" && (
          <div className="grid gap-5 lg:grid-cols-2">
            <Card title="My submissions" right={<Btn kind="primary" onClick={() => openForm("submit")}><Plus size={15} />New submission</Btn>}>
              {subs.length === 0 ? <Empty>No submissions yet. Submit an innovation to a challenge.</Empty> : (
                <ul className="divide-y divide-slate-100">{subs.map((s) => (
                  <li key={s.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0"><p className="font-medium text-slate-900">{s.title}</p><p className="text-xs text-slate-500">For: {s.to} · {s.on}</p></div>
                    <div className="flex items-center gap-2"><Chip className={ST[s.st]}>{s.st}</Chip><button aria-label={`Withdraw ${s.title}`} onClick={() => { setSubs((l) => l.filter((x) => x.id !== s.id)); say("Submission withdrawn"); }} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={16} /></button></div>
                  </li>))}</ul>
              )}
            </Card>
            <Card title="Workspaces">
              <ul className="divide-y divide-slate-100">{spaces.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div><p className="font-medium text-slate-900">{s.name}</p><p className="text-xs text-slate-500">{s.lead} · {s.members} members</p></div>
                  <Btn kind={s.joined ? "done" : "ghost"} onClick={() => toggleSpace(s)}>{s.joined ? <><Check size={14} />Joined</> : "Join as collaborator"}</Btn>
                </li>))}</ul>
            </Card>
          </div>
        )}

        {/* ===== case studies ===== */}
        {tab === "cases" && (
          <>
            <div className="flex justify-end"><Btn kind="primary" onClick={() => openForm("case")}><Plus size={15} />Share a case study</Btn></div>
            <div className="grid gap-4 md:grid-cols-2">{cases.map((c) => (
              <article key={c.id} className="flex flex-col rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <div className="flex items-center gap-2"><Chip className="bg-blue-100 text-blue-800">{c.sector}</Chip>{c.mine && <Chip className="bg-rose-100 text-rose-800">Shared by you</Chip>}</div>
                <h3 className="mt-3 font-['Newsreader',serif] text-lg font-semibold leading-snug text-slate-900">{c.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{c.by} · {c.region}</p>
                <Btn className="mt-4 self-start" onClick={() => { upd(setCases, c.id, { saved: !c.saved }); say(c.saved ? "Removed from saved" : "Saved to your library"); }}><Bookmark size={14} className={c.saved ? "fill-current" : ""} />{c.saved ? "Saved" : "Save"}</Btn>
              </article>))}</div>
          </>
        )}

        {/* ===== data and insights ===== */}
        {tab === "data" && (
          <div className="grid gap-5 lg:grid-cols-2">
            <Card title="Permitted repository">
              <div className="mb-4 flex flex-wrap gap-3">
                <div className="relative min-w-[180px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Search repository" value={rq} onChange={(e) => setRq(e.target.value)} placeholder="Search papers, policies, datasets" className={cx(inp, "pl-9")} /></div>
                <select aria-label="Filter by type" value={rType} onChange={(e) => setRType(e.target.value)} className={cx(inp, "w-auto")}><option value="all">All</option><option>Paper</option><option>Policy</option><option>Dataset</option></select>
              </div>
              {rShown.length === 0 ? <Empty>Nothing matches your search.</Empty> : (
                <ul className="divide-y divide-slate-100">{rShown.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="flex min-w-0 items-center gap-3"><FileText size={17} className="shrink-0 text-slate-400" /><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-900">{r.title}</p><p className="text-xs text-slate-500">{r.type}</p></div></div>
                    <Btn onClick={() => { upd(setRepo, r.id, { saved: !r.saved }); say(r.saved ? "Removed from library" : "Saved to your library"); }}><Bookmark size={14} className={r.saved ? "fill-current" : ""} />{r.saved ? "Saved" : "Save"}</Btn>
                  </li>))}</ul>
              )}
            </Card>

            <Card title="Limited GIS and analytics" right={<select aria-label="State" value={stateSel} onChange={(e) => setStateSel(e.target.value)} className={cx(inp, "w-auto py-1.5")}><option>Maharashtra</option><option>Gujarat</option><option>Kerala</option></select>}>
              <div className="flex flex-wrap gap-2">{Object.keys(SERIES).map((l) => <button key={l} aria-pressed={layer === l} onClick={() => setLayer(l)} className={cx("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium", layer === l ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200")}><Layers size={13} />{l}</button>)}</div>
              <MiniMap layer={layer} stateSel={stateSel} />
              <p className="mt-4 text-sm font-medium text-slate-800">Trend: {SERIES[layer].unit}, {stateSel}</p>
              <div className="mt-2 h-52"><ResponsiveContainer><LineChart data={chart}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="y" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} width={40} domain={["auto", "auto"]} /><Tooltip /><Line type="monotone" dataKey="v" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 3 }} name={layer} /></LineChart></ResponsiveContainer></div>
              <p className="mt-4 text-xs font-semibold text-slate-500">Layers that need admin approval</p>
              <ul className="mt-2 space-y-2">{LOCKED.map((l) => (
                <li key={l} className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2 text-slate-700"><Lock size={14} className="text-slate-400" />{l}</span>
                  <Btn disabled={requested.includes(l)} onClick={() => request(l)}>{requested.includes(l) ? "Requested" : "Request access"}</Btn></li>))}</ul>
            </Card>

            <Card title="Pilot impact assessments" className="lg:col-span-2">
              <p className="text-sm text-slate-600">Time to complete a case after the pilot, indexed so the baseline is 100. Lower is better.</p>
              <div className="mt-3 h-56"><ResponsiveContainer><BarChart data={IMPACT}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} width={36} /><Tooltip /><Legend /><Bar dataKey="baseline" name="Baseline" fill="#cbd5e1" radius={[6, 6, 0, 0]} /><Bar dataKey="after" name="After pilot" fill="#e11d48" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
            </Card>
          </div>
        )}

        {/* ===== API playground ===== */}
        {tab === "api" && (
          <div className="grid gap-5 lg:grid-cols-2">
            <Card title="Request" right={<span className="text-sm text-slate-500">{calls} of 1,000 calls used this month</span>}>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-800"><KeyRound size={15} />Your API key</p>
                {apiKey ? (
                  <div className="mt-2 flex items-center gap-2"><code className="min-w-0 flex-1 break-all rounded-lg bg-white px-3 py-2 text-xs ring-1 ring-slate-200">{apiKey}</code><Btn onClick={() => copy(apiKey)}><Copy size={14} />Copy</Btn></div>
                ) : <Btn kind="primary" className="mt-2" onClick={genKey}>Create API key</Btn>}
              </div>
              <label className="mt-4 block text-sm font-medium">Endpoint
                <select value={ep} onChange={(e) => { setEp(Number(e.target.value)); setApiRes(null); }} className={cx(inp, "mt-1.5")}>{ENDPOINTS.map((e, i) => <option key={e.path} value={i}>GET {e.path}</option>)}</select>
              </label>
              <p className="mt-1.5 text-xs text-slate-500">{ENDPOINTS[ep].note}</p>
              <pre className="mt-4 overflow-x-auto rounded-xl bg-[#0a1a44] p-4 text-xs leading-relaxed text-blue-100">{curl}</pre>
              <div className="mt-4 flex gap-2"><Btn kind="primary" disabled={busy} onClick={send}>{busy ? <><Loader2 size={15} className="animate-spin" />Sending</> : <><Play size={15} />Send request</>}</Btn><Btn onClick={() => copy(curl)}><Copy size={14} />Copy curl</Btn></div>
            </Card>
            <Card title="Response" right={apiRes && <Chip className={apiRes.status === 200 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}>{apiRes.status}{apiRes.ms ? ` · ${apiRes.ms} ms` : ""}</Chip>}>
              {apiRes ? <pre className="max-h-96 overflow-auto rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-800">{JSON.stringify(apiRes.body, null, 2)}</pre> : <Empty>Send a request to see the response here.</Empty>}
              <p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><Briefcase size={13} />Industry keys return permitted summaries only. Parcel-level data needs admin approval.</p>
            </Card>
          </div>
        )}
      </main>

      {/* ===== dialogs ===== */}
      {(modal === "submit" || modal === "case") && (
        <Modal title={modal === "submit" ? "Submit an innovation" : "Share a case study"} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <label className="block text-sm font-medium">Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={cx(inp, "mt-1")} autoFocus /></label>
            {modal === "submit" ? (
              <label className="block text-sm font-medium">Submit to<select value={form.ref} onChange={(e) => setForm({ ...form, ref: e.target.value })} className={cx(inp, "mt-1")}>{challenges.map((c) => <option key={c.id}>{c.title}</option>)}</select></label>
            ) : (
              <label className="block text-sm font-medium">Sector<select value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className={cx(inp, "mt-1")}>{["Land records", "Surveying", "Disputes", "Climate"].map((s) => <option key={s}>{s}</option>)}</select></label>
            )}
            <label className="block text-sm font-medium">{modal === "submit" ? "What does it do?" : "What was the result?"}<textarea rows={4} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className={cx(inp, "mt-1")} /></label>
          </div>
          <div className="mt-5 flex justify-end gap-2"><Btn onClick={() => setModal(null)}>Cancel</Btn><Btn kind="primary" onClick={modal === "submit" ? submitInnovation : shareCase}>{modal === "submit" ? "Submit" : "Share"}</Btn></div>
        </Modal>
      )}
      {toast && <div role="status" className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">{toast}</div>}
    </div>
  );
}