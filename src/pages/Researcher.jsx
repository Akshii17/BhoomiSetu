import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  Landmark, BookOpen, Database, Upload, Plus, Sparkles, Map as MapIcon, BarChart3, FileText, FolderOpen,
  Trophy, Award, LogOut, X, Loader2, CheckCircle2, MessageSquare, Clock, Search, ArrowRight, Bell, CalendarDays,
} from "lucide-react";

/* ---------- Sample data (replace with API calls) ---------- */
const PROJECTS = [
  { id: 1, name: "Farmland loss around Pune", progress: 64, members: 4, updated: "2h ago" },
  { id: 2, name: "Flood-prone parcels in Assam", progress: 38, members: 3, updated: "yesterday" },
  { id: 3, name: "Dispute resolution times, Karnataka", progress: 82, members: 2, updated: "3 days ago" },
];
const RESUME = [
  { kind: "Workspace", title: "Farmland loss around Pune", meta: "2 new comments from Dr. Rao", icon: FolderOpen },
  { kind: "Draft", title: "Peri-urban conversion: methods note", meta: "Edited yesterday, 1,240 words", icon: FileText },
  { kind: "Analysis", title: "Land-use change, 2015 to 2024", meta: "Finished, results ready to review", icon: BarChart3 },
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
  Processing: "bg-amber-100 text-amber-800",
  "Pending review": "bg-sky-100 text-sky-800",
  Indexed: "bg-violet-100 text-violet-800",
  Published: "bg-green-100 text-green-800",
};
const EMPTY = { kind: KINDS[0], study: "1", newStudy: "", title: "", authors: "", state: STATES[0], tags: "", access: "public", description: "", file: null };

export default function Researcher({ user }) {
  const nav = useNavigate();
  const [uploads, setUploads] = useState([
    { id: "a", title: "Assam flood parcels 2019 to 2024", kind: "Dataset", study: "Flood-prone parcels in Assam", status: "Indexed", date: "yesterday" },
    { id: "b", title: "Karnataka land dispute tribunal analysis", kind: "Research paper", study: "Dispute resolution times, Karnataka", status: "Published", date: "12 Sep" },
  ]);
  const [open, setOpen] = useState(false);
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
    // TODO: POST /api/repository/upload as multipart/form-data (file + metadata)
    setUploads((u) => [{ id, title: form.title.trim(), kind: form.kind, study, status: "Processing", date: "just now" }, ...u]);
    setTimeout(() => setUploads((u) => u.map((x) => (x.id === id ? { ...x, status: "Pending review" } : x))), 3000);
    setOpen(false); setForm(EMPTY); setFormErr("");
    setToast("Upload received. It will go live once a reviewer approves it.");
  }

  function runSynthesis(e) {
    e.preventDefault();
    if (!topic.trim()) return;
    setBusy(true); setSyn(null);
    // TODO: POST /api/assistant/synthesis (RAG) returning summary + sources
    setTimeout(() => {
      setSyn({ topic: topic.trim(), refs: AI_PAPERS });
      setBusy(false);
    }, 1200);
  }

  const soon = (name) => setToast(`${name} opens in its own workspace. That page is coming soon.`);
  const card = "rounded-2xl bg-white p-5 ring-1 ring-violet-100";

  return (
    <div className="min-h-screen bg-[#f6f4fb] text-slate-800 font-['Public_Sans',sans-serif]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Public+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-violet-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-700 text-white"><Landmark size={18} /></span>
            <span className="font-['Newsreader',serif] text-xl font-semibold text-slate-900">Bhoomi</span>
            <span className="hidden rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800 sm:inline">Researcher</span>
          </div>
          <div className="relative mx-auto hidden w-full max-w-lg md:block">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input aria-label="Search the library" placeholder="Search papers, datasets and policies" className="w-full rounded-xl bg-violet-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-violet-300" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800">
              <Plus size={16} /> Add research
            </button>
            <button onClick={() => nav("/")} aria-label="Sign out" className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-violet-50"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] gap-5 px-5 py-6 lg:grid-cols-[270px_minmax(0,1fr)_330px]">
        {/* Left: projects */}
        <aside className="space-y-5">
          <section className={card}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">My projects</h2>
              <button onClick={() => soon("New project")} aria-label="New project" className="grid h-8 w-8 place-items-center rounded-lg text-violet-700 hover:bg-violet-50"><Plus size={16} /></button>
            </div>
            <ul className="mt-3 space-y-4">
              {PROJECTS.map((p) => (
                <li key={p.id}>
                  <button onClick={() => soon(p.name)} className="w-full text-left">
                    <p className="text-sm font-medium text-slate-900 hover:text-violet-700">{p.name}</p>
                    <div className="mt-2 h-1.5 rounded-full bg-violet-100"><div className="h-full rounded-full bg-violet-600" style={{ width: `${p.progress}%` }} /></div>
                    <p className="mt-1.5 text-xs text-slate-500">{p.progress}% done, {p.members} members, {p.updated}</p>
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section className={card}>
            <h2 className="font-semibold text-slate-900">Reads of my work</h2>
            <div className="mt-3 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={READS}>
                  <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip cursor={{ fill: "#f5f3ff" }} />
                  <Bar dataKey="v" fill="#7c3aed" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </aside>

        {/* Centre */}
        <div className="min-w-0 space-y-5">
          <div>
            <h1 className="font-['Newsreader',serif] text-3xl font-medium text-slate-900">Good to see you, {first}</h1>
            <p className="text-slate-600">Pick up where you stopped, or start something new.</p>
          </div>

          {/* Signature widget */}
          <section ref={synRef} className="rounded-2xl bg-violet-700 p-6 text-white">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Sparkles size={18} /> Literature synthesis</h2>
            <p className="mt-1 text-violet-100">Enter a topic and get a short summary with sources.</p>
            <form onSubmit={runSynthesis} className="mt-4 flex gap-2">
              <input value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Research topic" placeholder="e.g. farmland conversion near growing cities"
                className="min-w-0 flex-1 rounded-xl px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400" />
              <button disabled={busy} className="flex items-center gap-2 rounded-xl bg-white px-5 font-semibold text-violet-800 hover:bg-violet-50 disabled:opacity-70">
                {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />} Summarise
              </button>
            </form>
            {syn && (
              <div className="mt-5 rounded-xl bg-white p-5 text-slate-700">
                <p className="leading-relaxed">
                  Studies on <b>{syn.topic}</b> agree that conversion is fastest along road and rail corridors [1]. Weak tenure security makes owners more likely to sell early [2],
                  and smaller, fragmented holdings are less productive, which speeds up exit from farming [3]. Most evidence is from western and southern India, so eastern states are under-studied.
                </p>
                <ol className="mt-3 space-y-1 text-sm text-slate-500">
                  {syn.refs.map((r, i) => <li key={r.title}>[{i + 1}] {r.title}, {r.org}, {r.year}</li>)}
                </ol>
                <p className="mt-3 text-xs text-slate-400">Sample output. It will use your RAG endpoint once connected.</p>
              </div>
            )}
          </section>

          {/* Quick start */}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              [BarChart3, "Run analysis", "Land-use change, trends, forecasts", () => soon("Analytics Studio")],
              [BookOpen, "Literature synthesis", "Summarise papers on a topic", () => { synRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }],
              [MapIcon, "Natural-language GIS", "Ask for a map in plain words", () => soon("Map explorer")],
            ].map(([I, t, d, fn]) => (
              <button key={t} onClick={fn} className="rounded-2xl bg-white p-4 text-left ring-1 ring-violet-100 hover:ring-violet-400">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-violet-700"><I size={19} /></span>
                <p className="mt-3 font-semibold text-slate-900">{t}</p>
                <p className="text-sm text-slate-500">{d}</p>
              </button>
            ))}
          </div>

          {/* Continue */}
          <section>
            <h2 className="mb-3 font-semibold text-slate-900">Continue where you left off</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {RESUME.map(({ kind, title, meta, icon: I }) => (
                <button key={title} onClick={() => soon(title)} className="rounded-2xl bg-white p-4 text-left ring-1 ring-violet-100 hover:ring-violet-400">
                  <span className="flex items-center gap-2 text-xs font-semibold text-violet-700"><I size={14} />{kind}</span>
                  <p className="mt-2 font-medium leading-snug text-slate-900">{title}</p>
                  <p className="mt-1 text-sm text-slate-500">{meta}</p>
                </button>
              ))}
            </div>
          </section>

          {/* My uploads */}
          <section className={card}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">My uploads</h2>
              <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-sm font-semibold text-violet-700"><Upload size={15} /> Add research</button>
            </div>
            <ul className="mt-3 divide-y divide-violet-100">
              {uploads.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{u.title}</p>
                    <p className="text-sm text-slate-500">{u.kind}, for {u.study}, {u.date}</p>
                  </div>
                  <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${STATUS[u.status]}`}>
                    {u.status === "Processing" && <Loader2 size={12} className="animate-spin" />}{u.status}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Feed */}
          <section className={card}>
            <h2 className="font-semibold text-slate-900">Activity</h2>
            <ul className="mt-3 space-y-3">
              {FEED.map(({ icon: I, text, time }) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-700"><I size={15} /></span>
                  <div><p className="text-sm text-slate-700">{text}</p><p className="flex items-center gap-1 text-xs text-slate-400"><Clock size={11} />{time}</p></div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right: AI suggestions */}
        <aside className="space-y-5">
          <section className={card}>
            <h2 className="flex items-center gap-2 font-semibold text-slate-900"><Sparkles size={16} className="text-violet-600" /> Suggested papers</h2>
            <ul className="mt-3 space-y-4">
              {AI_PAPERS.map((p) => (
                <li key={p.title}>
                  <p className="text-sm font-medium leading-snug text-slate-900">{p.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{p.org}, {p.year}, <span className="font-semibold text-violet-700">{p.match}% match</span></p>
                </li>
              ))}
            </ul>
          </section>
          <section className={card}>
            <h2 className="flex items-center gap-2 font-semibold text-slate-900"><Database size={16} className="text-violet-600" /> Suggested datasets</h2>
            <ul className="mt-3 space-y-4">
              {AI_DATA.map((p) => (
                <li key={p.title}>
                  <p className="text-sm font-medium leading-snug text-slate-900">{p.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{p.org}, <span className="font-semibold text-violet-700">{p.match}% match</span></p>
                </li>
              ))}
            </ul>
          </section>
          <section className={card}>
            <h2 className="font-semibold text-slate-900">Open grants and hackathons</h2>
            <ul className="mt-3 space-y-3">
              {OPPS.map(({ icon: I, title, note }) => (
                <li key={title} className="flex items-start gap-3 rounded-xl bg-violet-50 p-3">
                  <I size={18} className="mt-0.5 shrink-0 text-violet-700" />
                  <div><p className="text-sm font-medium text-slate-900">{title}</p><p className="flex items-center gap-1 text-xs text-slate-500"><CalendarDays size={11} />{note}</p></div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </main>

      {/* Toast */}
      {toast && <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm text-white shadow-xl">{toast}</div>}

      {/* Add research modal */}
      {open && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <form onSubmit={submitUpload} role="dialog" aria-modal="true" aria-label="Add research" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-['Newsreader',serif] text-2xl font-medium text-slate-900">Add research</h2>
                <p className="text-sm text-slate-500">Upload a paper, study or dataset. A reviewer approves it before it goes public.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">What are you adding?
                <select value={form.kind} onChange={set("kind")} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5">{KINDS.map((k) => <option key={k}>{k}</option>)}</select>
              </label>
              <label className="text-sm font-medium text-slate-700">Which study is it for?
                <select value={form.study} onChange={set("study")} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5">
                  {PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  <option value="new">A new study</option>
                </select>
              </label>
              {form.study === "new" && (
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">Name of the new study
                  <input value={form.newStudy} onChange={set("newStudy")} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
                </label>
              )}
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">Title
                <input ref={firstField} value={form.title} onChange={set("title")} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
              </label>
              <label className="text-sm font-medium text-slate-700">Authors
                <input value={form.authors} onChange={set("authors")} placeholder="Separate names with commas" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
              </label>
              <label className="text-sm font-medium text-slate-700">Region covered
                <select value={form.state} onChange={set("state")} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5">{STATES.map((s) => <option key={s}>{s}</option>)}</select>
              </label>
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">Summary or data description
                <textarea rows={3} value={form.description} onChange={set("description")} placeholder="What does it show? For datasets, describe the columns, units and time period." className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
              </label>
              <label className="text-sm font-medium text-slate-700">Tags
                <input value={form.tags} onChange={set("tags")} placeholder="climate, urbanisation" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
              </label>
              <fieldset className="text-sm font-medium text-slate-700">
                <legend>Who can see it?</legend>
                <div className="mt-2 flex gap-4">
                  {[["public", "Everyone"], ["restricted", "Logged-in users only"]].map(([v, l]) => (
                    <label key={v} className="flex items-center gap-2 font-normal"><input type="radio" name="access" checked={form.access === v} onChange={() => setForm({ ...form, access: v })} className="accent-violet-700" />{l}</label>
                  ))}
                </div>
              </fieldset>
              <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-violet-300 bg-violet-50/50 px-4 py-6 text-center sm:col-span-2 hover:bg-violet-50">
                <Upload className="text-violet-700" />
                <span className="text-sm font-medium text-slate-800">{form.file ? form.file.name : "Choose a file to upload"}</span>
                <span className="text-xs text-slate-500">{form.file ? `${(form.file.size / 1048576).toFixed(1)} MB` : "PDF, Word, CSV, Excel, GeoJSON, GeoTIFF or ZIP"}</span>
                <input type="file" className="sr-only" accept=".pdf,.doc,.docx,.csv,.xlsx,.json,.geojson,.tif,.tiff,.zip" onChange={(e) => setForm({ ...form, file: e.target.files[0] || null })} />
              </label>
            </div>

            {formErr && <p role="alert" className="mt-4 text-sm text-red-600">{formErr}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button className="rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-800">Upload for review</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}