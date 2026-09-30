import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  Landmark, BookOpen, Database, Upload, Plus, Sparkles, Map as MapIcon, BarChart3, FileText, FolderOpen,
  Trophy, Award, LogOut, X, Loader2, CheckCircle2, MessageSquare, Clock, Search, ArrowRight, Bell, CalendarDays, MapPin,
} from "lucide-react";
import { MapModal } from "../components/MapLibreMap";
import { REGIONS } from "../data/Studies";

/* ---------- Sample data ---------- */
const PROJECTS = [
  { id: 1, name: "Farmland loss around Pune", progress: 64, members: 4, updated: "2h ago", center: [73.8567, 18.5204] },
  { id: 2, name: "Flood-prone parcels in Assam", progress: 38, members: 3, updated: "yesterday", center: [91.7362, 26.1445] },
  { id: 3, name: "Dispute resolution times, Karnataka", progress: 82, members: 2, updated: "3 days ago", center: [77.5946, 12.9716] },
];
const RESUME = [
  { kind: "Workspace", title: "Farmland loss around Pune", meta: "2 new comments from Dr. Rao", icon: FolderOpen, center: [73.8567, 18.5204] },
  { kind: "Draft", title: "Peri-urban conversion: methods note", meta: "Edited yesterday, 1,240 words", icon: FileText, center: [73.8567, 18.5204] },
  { kind: "Analysis", title: "Land-use change, 2015 to 2024", meta: "Finished, results ready to review", icon: BarChart3, center: [73.8567, 18.5204] },
];
const AI_PAPERS = [
  { title: "Satellite-based detection of farmland conversion in peri-urban India", org: "ISRO NRSC", year: 2025, match: 96 },
  { title: "Tenure security and urban fringe expansion", org: "IIM Ahmedabad", year: 2024, match: 91 },
  { title: "Parcel fragmentation and yield in small holdings", org: "ICRISAT", year: 2023, match: 87 },
];
const AI_DATA = [
  { title: "Land use / land cover, 2005 to 2023 (district level)", org: "NRSC", match: 94 },
  { title: "Census 2011 village amenities directory", org: "Census of India", match: 88 },
];
const OPPS = [
  { icon: Award, title: "Applied Land Research Grant", note: "Closes 15 Nov, up to ₹15 lakh" },
  { icon: Trophy, title: "Land Data Challenge", note: "Hackathon, closes 30 Oct" },
];
const FEED = [
  { icon: MessageSquare, text: "Dr. Rao commented on “Farmland loss around Pune”", time: "2h ago" },
  { icon: Database, text: "New dataset: Land use / land cover 2023 was added", time: "5h ago" },
  { icon: CheckCircle2, text: "Your upload “Assam flood parcels” was indexed", time: "yesterday" },
  { icon: Bell, text: "Land Data Challenge closes in 30 days", time: "2 days ago" },
];
const READS = [{ m: "Apr", v: 32 }, { m: "May", v: 41 }, { m: "Jun", v: 38 }, { m: "Jul", v: 56 }, { m: "Aug", v: 71 }, { m: "Sep", v: 88 }];
const KINDS = ["Research paper", "Study or report", "Dataset", "Case study"];
const STATES = ["All India", "Andhra Pradesh", "Assam", "Bihar", "Gujarat", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"];
const STATUS = {
  Processing: "bg-[#f3e8c9] text-[#6b5216]",
  "Pending review": "bg-stone-200 text-stone-800",
  Indexed: "bg-[#e3ecdf] text-[#1f3d2b]",
  Published: "bg-[#dbe6d5] text-[#1f3d2b]",
};
const EMPTY = { kind: KINDS[0], study: "1", newStudy: "", title: "", authors: "", state: STATES[0], tags: "", access: "public", description: "", file: null };

export default function Researcher({ user }) {
  const nav = useNavigate();
  const [uploads, setUploads] = useState([
    { id: "a", title: "Assam flood parcels 2019 to 2024", kind: "Dataset", study: "Flood-prone parcels in Assam", status: "Indexed", date: "yesterday" },
    { id: "b", title: "Karnataka land dispute tribunal analysis", kind: "Research paper", study: "Dispute resolution times, Karnataka", status: "Published", date: "12 Sep" },
  ]);
  const [open, setOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapConfig, setMapConfig] = useState({
    title: "Natural-language GIS & Spatial Explorer",
    subtitle: "Satellite imagery, cadastral surveys and research study corridors",
    center: [73.8567, 18.5204],
    zoom: 7,
    markers: [
      { lng: 73.8567, lat: 18.5204, title: "Pune Peri-urban Study", description: "Farmland conversion along Pune-Mumbai expressways", color: "#1f3d2b" },
      { lng: 74.0, lat: 19.9975, title: "Nashik Corridor", description: "68% dispute resolution rate baseline", color: "#b8923a" },
      { lng: 91.7362, lat: 26.1445, title: "Assam Flood Study", description: "Flood-prone parcel mapping", color: "#2f6f9a" },
    ],
  });
  const [form, setForm] = useState(EMPTY);
  const [formErr, setFormErr] = useState("");
  const [toast, setToast] = useState("");
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [syn, setSyn] = useState(null);
  const synRef = useRef(null), firstField = useRef(null);
  const first = (user?.name || "there").split(" ")[0];

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3200); return () => clearTimeout(t); } }, [toast]);
  useEffect(() => {
    if (!open) return;
    firstField.current?.focus();
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function submitUpload(e) {
    e.preventDefault();
    if (!form.title.trim()) return setFormErr("Add a title.");
    if (form.study === "new" && !form.newStudy.trim()) return setFormErr("Name the new study.");
    if (!form.file) return setFormErr("Attach a file.");
    const study = form.study === "new" ? form.newStudy.trim() : PROJECTS.find((p) => String(p.id) === form.study).name;
    const id = Date.now();
    setUploads((u) => [{ id, title: form.title.trim(), kind: form.kind, study, status: "Processing", date: "just now" }, ...u]);
    setTimeout(() => setUploads((u) => u.map((x) => (x.id === id ? { ...x, status: "Pending review" } : x))), 3000);
    setOpen(false); setForm(EMPTY); setFormErr("");
    setToast("Upload received. It will go live once a reviewer approves it.");
  }

  function runSynthesis(e) {
    e.preventDefault();
    if (!topic.trim()) return;
    setBusy(true); setSyn(null);
    setTimeout(() => {
      setSyn({ topic: topic.trim(), refs: AI_PAPERS });
      setBusy(false);
    }, 1200);
  }

  const soon = (name) => setToast(`${name} opens in its own workspace. That page is coming soon.`);
  const card = "rounded-2xl bg-white p-5 border border-stone-300 shadow-sm";

  const openStudyMap = (title, center) => {
    setMapConfig({
      title: `Spatial Explorer: ${title}`,
      subtitle: "MapLibre raster satellite imagery with cadastral boundaries",
      center: center || [73.8567, 18.5204],
      zoom: 8,
      markers: [
        { lng: (center || [73.8567, 18.5204])[0], lat: (center || [73.8567, 18.5204])[1], title, description: "Active research area", color: "#1f3d2b" },
      ],
    });
    setMapOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f4efe6] font-['Public_Sans',sans-serif] text-[#26282b]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Public+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-[#1f3d2b]/15 bg-[#f4efe6]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#1f3d2b] text-[#d2b067]"><Landmark size={18} /></span>
            <span className="font-['Newsreader',serif] text-2xl font-semibold text-[#1f3d2b]">Bhoomi</span>
            <span className="hidden rounded-full bg-[#e3ecdf] px-3 py-0.5 text-xs font-semibold text-[#1f3d2b] sm:inline">Researcher</span>
          </div>
          <div className="relative mx-auto hidden w-full max-w-lg md:block">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input aria-label="Search the library" placeholder="Search papers, datasets, layers and policies" className="w-full rounded-xl bg-white border border-stone-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#1f3d2b] focus:ring-2 focus:ring-[#1f3d2b]/15" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("open-bhoomi-ai"))} className="flex items-center gap-1.5 rounded-lg border border-[#b8923a]/40 bg-[#faf7f1] px-3.5 py-2 text-sm font-semibold text-[#1f3d2b] hover:bg-[#b8923a]/15 transition">
              <Sparkles size={16} className="text-[#b8923a]" /> Bhoomi AI
            </button>
            <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-lg bg-[#1f3d2b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a5239] transition">
              <Plus size={16} /> Add research
            </button>
            <button onClick={() => nav("/")} aria-label="Sign out" className="grid h-10 w-10 place-items-center rounded-xl text-stone-600 hover:bg-stone-200/60 transition"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] gap-6 px-5 py-8 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
        {/* Left: projects */}
        <aside className="space-y-5">
          <section className={card}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[#1f3d2b]">My projects</h2>
              <button onClick={() => soon("New project")} aria-label="New project" className="grid h-8 w-8 place-items-center rounded-lg text-[#1f3d2b] hover:bg-[#1f3d2b]/10"><Plus size={16} /></button>
            </div>
            <ul className="mt-3 space-y-4">
              {PROJECTS.map((p) => (
                <li key={p.id}>
                  <button onClick={() => openStudyMap(p.name, p.center)} className="w-full text-left group">
                    <p className="text-sm font-medium text-stone-800 group-hover:text-[#1f3d2b]">{p.name}</p>
                    <div className="mt-2 h-1.5 rounded-full bg-stone-200 overflow-hidden"><div className="h-full rounded-full bg-[#1f3d2b]" style={{ width: `${p.progress}%` }} /></div>
                    <p className="mt-1.5 text-xs text-stone-500">{p.progress}% done, {p.members} members, {p.updated}</p>
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section className={card}>
            <h2 className="font-semibold text-[#1f3d2b]">Reads of my work</h2>
            <div className="mt-3 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={READS}>
                  <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#78716c" }} />
                  <Tooltip cursor={{ fill: "#faf7f1" }} />
                  <Bar dataKey="v" fill="#1f3d2b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </aside>

        {/* Centre */}
        <div className="min-w-0 space-y-6">
          <div>
            <h1 className="font-['Newsreader',serif] text-3xl font-medium text-[#1f3d2b]">Good to see you, {first}</h1>
            <p className="text-stone-600 text-sm">Pick up where you stopped, explore satellite layers, or start a synthesis.</p>
          </div>

          {/* Signature widget */}
          <section ref={synRef} className="rounded-2xl bg-[#1f3d2b] p-6 text-white border-t-4 border-[#b8923a] shadow-md">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#f4efe6]"><Sparkles size={18} className="text-[#b8923a]" /> Literature synthesis</h2>
            <p className="mt-1 text-sm text-stone-200">Enter a topic and get a short synthesis with linked repository citations.</p>
            <form onSubmit={runSynthesis} className="mt-4 flex gap-2">
              <input value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Research topic" placeholder="e.g. farmland conversion near growing cities"
                className="min-w-0 flex-1 rounded-xl px-4 py-3 text-stone-900 bg-white outline-none placeholder:text-stone-400" />
              <button disabled={busy} className="flex items-center gap-2 rounded-xl bg-[#b8923a] px-5 font-semibold text-[#1f2a24] hover:bg-[#c9a34b] disabled:opacity-70 transition">
                {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />} Summarise
              </button>
            </form>
            {syn && (
              <div className="mt-5 rounded-xl bg-[#faf7f1] p-5 text-stone-800 border border-stone-200 shadow-sm">
                <p className="leading-relaxed text-sm">
                  Studies on <b>{syn.topic}</b> agree that conversion is fastest along road and rail corridors [1]. Weak tenure security makes owners more likely to sell early [2],
                  and smaller, fragmented holdings are less productive, which speeds up exit from farming [3]. Most evidence is from western and southern India, so eastern states are under-studied.
                </p>
                <ol className="mt-3 space-y-1 text-xs text-stone-600">
                  {syn.refs.map((r, i) => <li key={r.title}>[{i + 1}] {r.title}, {r.org}, {r.year}</li>)}
                </ol>
                <p className="mt-3 text-xs text-[#b8923a] font-medium">Synthesised with official open publications and studies.</p>
              </div>
            )}
          </section>

          {/* Quick start with MapLibre */}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              [BarChart3, "Run analysis", "Land-use change, trends, forecasts", () => soon("Analytics Studio")],
              [BookOpen, "Literature synthesis", "Summarise papers on a topic", () => { synRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }],
              [MapIcon, "Natural-language GIS", "Interactive MapLibre satellite explorer", () => setMapOpen(true)],
            ].map(([I, t, d, fn]) => (
              <button key={t} onClick={fn} className="rounded-2xl bg-white p-4 text-left border border-stone-300 shadow-sm hover:border-[#1f3d2b] transition group">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e3ecdf] text-[#1f3d2b] group-hover:bg-[#1f3d2b] group-hover:text-white transition"><I size={19} /></span>
                <p className="mt-3 font-semibold text-stone-900 group-hover:text-[#1f3d2b]">{t}</p>
                <p className="text-xs text-stone-500 mt-1">{d}</p>
              </button>
            ))}
          </div>

          {/* Continue */}
          <section>
            <h2 className="mb-3 font-semibold text-[#1f3d2b]">Continue where you left off</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {RESUME.map(({ kind, title, meta, icon: I, center }) => (
                <button key={title} onClick={() => openStudyMap(title, center)} className="rounded-2xl bg-white p-4 text-left border border-stone-300 shadow-sm hover:border-[#b8923a] transition group">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[#b8923a]"><I size={14} />{kind}</span>
                  <p className="mt-2 font-medium leading-snug text-stone-900 group-hover:text-[#1f3d2b]">{title}</p>
                  <p className="mt-1 text-xs text-stone-500">{meta}</p>
                </button>
              ))}
            </div>
          </section>

          {/* My uploads */}
          <section className={card}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[#1f3d2b]">My uploads</h2>
              <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-sm font-semibold text-[#1f3d2b] hover:underline"><Upload size={15} /> Add research</button>
            </div>
            <ul className="mt-3 divide-y divide-stone-200">
              {uploads.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-stone-900 text-sm">{u.title}</p>
                    <p className="text-xs text-stone-500">{u.kind}, for {u.study}, {u.date}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS[u.status] || "bg-stone-100"}`}>{u.status}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-5">
          {/* Spatial GIS preview card */}
          <section className={card}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-sm text-[#1f3d2b] flex items-center gap-1.5"><MapPin size={15} className="text-[#b8923a]" />Spatial GIS View</h2>
              <button onClick={() => setMapOpen(true)} className="text-xs text-[#b8923a] font-semibold hover:underline">Full map</button>
            </div>
            <div className="h-36 w-full rounded-xl overflow-hidden border border-stone-200 relative cursor-pointer" onClick={() => setMapOpen(true)}>
              <img src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/6/28/45" alt="Satellite preview" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/20 hover:bg-black/10 flex items-center justify-center transition">
                <span className="rounded-lg bg-[#1f3d2b]/90 text-[#f4efe6] px-3 py-1 text-xs font-medium backdrop-blur">Open MapLibre Explorer</span>
              </div>
            </div>
            <p className="text-xs text-stone-500 mt-2">Active layers: Peri-urban agricultural parcels, highways &amp; water bodies.</p>
          </section>

          <section className={card}>
            <h2 className="font-semibold text-sm text-[#1f3d2b] flex items-center gap-1.5"><Sparkles size={15} className="text-[#b8923a]" /> Suggested papers</h2>
            <ul className="mt-3 space-y-3">
              {AI_PAPERS.map((p) => (
                <li key={p.title} className="text-xs border-b border-stone-100 pb-2 last:border-0 last:pb-0">
                  <p className="font-medium text-stone-800 leading-snug">{p.title}</p>
                  <p className="text-stone-500 mt-0.5">{p.org} · {p.year} · <span className="text-[#1f3d2b] font-semibold">{p.match}% match</span></p>
                </li>
              ))}
            </ul>
          </section>

          <section className={card}>
            <h2 className="font-semibold text-sm text-[#1f3d2b]">Open opportunities</h2>
            <ul className="mt-3 space-y-2">
              {OPPS.map(({ icon: I, title, note }) => (
                <li key={title} className="flex items-start gap-2.5 rounded-xl border border-stone-200 bg-[#faf7f1] p-3">
                  <I size={16} className="mt-0.5 text-[#b8923a] shrink-0" />
                  <div><p className="text-xs font-semibold text-stone-900">{title}</p><p className="text-[11px] text-stone-500">{note}</p></div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </main>

      {/* MapLibre Modal for Researcher */}
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

      {/* Add research modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#26282b]/60 p-4" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <form onSubmit={submitUpload} role="dialog" aria-modal="true" aria-label="Add research" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#faf7f1] border-t-4 border-[#b8923a] p-7 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-['Newsreader',serif] text-2xl font-semibold text-[#1f3d2b]">Add research</h2>
                <p className="text-sm text-stone-600">Upload a paper, study or dataset. A reviewer approves it before it goes public.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-1 text-stone-500 hover:bg-stone-200"><X size={18} /></button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-stone-700">What are you adding?
                <select value={form.kind} onChange={set("kind")} className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm">{KINDS.map((k) => <option key={k}>{k}</option>)}</select>
              </label>
              <label className="text-sm font-medium text-stone-700">Which study is it for?
                <select value={form.study} onChange={set("study")} className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm">
                  {PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  <option value="new">A new study</option>
                </select>
              </label>
              {form.study === "new" && (
                <label className="text-sm font-medium text-stone-700 sm:col-span-2">Name of the new study
                  <input value={form.newStudy} onChange={set("newStudy")} className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm" />
                </label>
              )}
              <label className="text-sm font-medium text-stone-700 sm:col-span-2">Title
                <input ref={firstField} value={form.title} onChange={set("title")} className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm" />
              </label>
              <label className="text-sm font-medium text-stone-700">Authors
                <input value={form.authors} onChange={set("authors")} placeholder="Separate names with commas" className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm" />
              </label>
              <label className="text-sm font-medium text-stone-700">Region covered
                <select value={form.state} onChange={set("state")} className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm">{STATES.map((s) => <option key={s}>{s}</option>)}</select>
              </label>
              <label className="text-sm font-medium text-stone-700 sm:col-span-2">Summary or data description
                <textarea rows={3} value={form.description} onChange={set("description")} placeholder="What does it show? For datasets, describe columns, units and time period." className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm" />
              </label>
              <label className="text-sm font-medium text-stone-700">Tags
                <input value={form.tags} onChange={set("tags")} placeholder="climate, urbanisation, satellite" className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm" />
              </label>
              <fieldset className="text-sm font-medium text-stone-700">
                <legend>Who can see it?</legend>
                <div className="mt-2 flex gap-4">
                  {[["public", "Everyone"], ["restricted", "Logged-in users only"]].map(([v, l]) => (
                    <label key={v} className="flex items-center gap-2 font-normal"><input type="radio" name="access" checked={form.access === v} onChange={() => setForm({ ...form, access: v })} className="accent-[#1f3d2b]" />{l}</label>
                  ))}
                </div>
              </fieldset>
              <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-[#b8923a]/50 bg-white px-4 py-6 text-center sm:col-span-2 hover:bg-[#f4efe6]/50 transition">
                <Upload className="text-[#1f3d2b]" />
                <span className="text-sm font-medium text-stone-800">{form.file ? form.file.name : "Choose a file to upload"}</span>
                <span className="text-xs text-stone-500">{form.file ? `${(form.file.size / 1048576).toFixed(1)} MB` : "PDF, Word, CSV, Excel, GeoJSON, GeoTIFF or ZIP"}</span>
                <input type="file" className="sr-only" accept=".pdf,.doc,.docx,.csv,.xlsx,.json,.geojson,.tif,.tiff,.zip" onChange={(e) => setForm({ ...form, file: e.target.files[0] || null })} />
              </label>
            </div>

            {formErr && <p role="alert" className="mt-4 text-sm text-[#8c2f39]">{formErr}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-200">Cancel</button>
              <button className="rounded-xl bg-[#1f3d2b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2a5239] transition">Upload for review</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}