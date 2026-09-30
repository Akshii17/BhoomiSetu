import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  Landmark, LogOut, FileText, Database, Users, UserPlus, FolderKanban, Award, Trophy, Plus, X, ChevronLeft, ChevronRight, Trash2, TrendingUp, Upload,
} from "lucide-react";

/* ---------- Sample data (replace with API calls) ---------- */
const ROLES = ["Institution admin", "Lead researcher", "Researcher", "Student", "Viewer"];
const COLS = ["Applied", "Under review", "Awarded", "Ongoing"];
const DEPTS = ["Dept of Land Resources", "Ministry of Rural Development", "NITI Aayog", "State Revenue Department"];
const YEARS0 = [
  { y: "2020", pubs: 14, data: 3 }, { y: "2021", pubs: 19, data: 5 }, { y: "2022", pubs: 23, data: 8 }, { y: "2023", pubs: 28, data: 12 },
  { y: "2024", pubs: 34, data: 15 }, { y: "2025", pubs: 41, data: 19 }, { y: "2026", pubs: 33, data: 17 },
];
const PUBS0 = [
  { id: 1, title: "Tenure security and farmland sales near growing towns", kind: "Research paper", author: "Dr. Meera Kulkarni", date: "Sep 2026", reads: 412 },
  { id: 2, title: "Village land use survey, Satara district", kind: "Dataset", author: "Rohan Deshmukh", date: "Aug 2026", reads: 268 },
  { id: 3, title: "Digital records and dispute resolution: a policy brief", kind: "Policy brief", author: "Dr. Anil Joshi", date: "Jul 2026", reads: 190 },
];
const MEMBERS0 = [
  { id: 1, name: "Dr. Meera Kulkarni", email: "meera.k@igirs.edu.in", role: "Institution admin", ws: 3 },
  { id: 2, name: "Dr. Anil Joshi", email: "anil.j@igirs.edu.in", role: "Lead researcher", ws: 2 },
  { id: 3, name: "Rohan Deshmukh", email: "rohan.d@igirs.edu.in", role: "Researcher", ws: 2 },
  { id: 4, name: "Sneha Patil", email: "sneha.p@igirs.edu.in", role: "Researcher", ws: 1 },
  { id: 5, name: "Kabir Shaikh", email: "kabir.s@igirs.edu.in", role: "Student", ws: 1 },
  { id: 6, name: "Ishita Rao", email: "ishita.r@igirs.edu.in", role: "Viewer", ws: 0 },
];
const WS0 = [
  { id: 1, name: "Farmland conversion study", desc: "Satellite and records analysis around Pune and Satara", members: [1, 2, 3] },
  { id: 2, name: "Land dispute trends", desc: "Court data across western Maharashtra", members: [1, 4, 5] },
  { id: 3, name: "Drone survey pilot", desc: "Village mapping with the state revenue department", members: [2, 3] },
];
const GRANTS0 = [
  { id: 1, title: "Peri-urban land conversion model", funder: "DoLR Research Grant", amt: 18, col: "Ongoing", note: "Year 1 of 2" },
  { id: 2, title: "Drone-based village mapping", funder: "NITI Aayog", amt: 24, col: "Ongoing", note: "Year 1 of 3" },
  { id: 3, title: "Flood risk and parcel values", funder: "DST", amt: 12, col: "Awarded", note: "Starts Nov 2026" },
  { id: 4, title: "Women's land rights atlas", funder: "ICSSR", amt: 9, col: "Under review", note: "Decision by Dec" },
  { id: 5, title: "AI search for court records", funder: "DoLR Research Grant", amt: 15, col: "Under review", note: "Decision by Nov" },
  { id: 6, title: "Tribal land tenure documentation", funder: "State Tribal Dept", amt: 7, col: "Applied", note: "Applied 12 Sep" },
];
const CALLS = ["DoLR Research Grant 2026", "ICSSR Land Governance Call", "DST Climate and Land Call", "NITI Aayog Innovation Call"];
const COMPS0 = [
  { id: 1, title: "Land Data Challenge", kind: "Hackathon", partner: "Dept of Land Resources", status: "Open", entries: 86, due: "30 Oct" },
  { id: 2, title: "Student paper contest on land reform", kind: "Knowledge competition", partner: "Ministry of Rural Development", status: "Judging", entries: 41, due: "closed 10 Sep" },
  { id: 3, title: "Village mapping sprint", kind: "Hackathon", partner: "State Revenue Department", status: "Closed", entries: 63, due: "closed 2 Jun" },
];
const PILOTS0 = [
  { id: 1, name: "Drone survey of 40 villages", site: "Satara, Maharashtra", partner: "State Revenue Department", progress: 62, status: "On track" },
  { id: 2, name: "Mobile app for boundary disputes", site: "Kolhapur, Maharashtra", partner: "District Collectorate", progress: 35, status: "At risk" },
  { id: 3, name: "ULPIN-linked village dashboard", site: "Nashik, Maharashtra", partner: "Dept of Land Resources", progress: 100, status: "Completed" },
];
const SCORE0 = [["Research output", 82], ["Reads and downloads", 76], ["Collaboration", 68], ["Policy uptake", 59], ["Grant success", 71]];
const CHIP = {
  Open: "bg-[#dbe6d5] text-[#2f5a43]", Judging: "bg-[#f3e3b8] text-[#7a5a12]", Closed: "bg-[#e6dcc2] text-[#5c5a4b]",
  "On track": "bg-[#dbe6d5] text-[#2f5a43]", "At risk": "bg-[#f1d3cb] text-[#8a3324]", Completed: "bg-[#d9e4ee] text-[#2b4d73]",
};

const MODALS = {
  publish: { title: "Publish research or data", sub: "It goes to the national repository once a reviewer approves it.", cta: "Submit for review", req: ["title", "file"],
    fields: [{ k: "kind", label: "What are you publishing?", options: ["Research paper", "Study or report", "Dataset", "Policy brief"] }, { k: "title", label: "Title" },
      { k: "author", label: "Lead author", options: "members" }, { k: "vis", label: "Who can see it?", options: ["Everyone", "Logged-in users only"] }, { k: "file", label: "File", file: true }] },
  invite: { title: "Invite a member", sub: "They get an email to join your institution.", cta: "Send invite", req: ["name", "email"],
    fields: [{ k: "name", label: "Full name" }, { k: "email", label: "Email" }, { k: "role", label: "Role", options: ROLES.slice(1) }] },
  workspace: { title: "Create a workspace", sub: "A shared space for datasets, documents, maps and discussion.", cta: "Create workspace", req: ["name"],
    fields: [{ k: "name", label: "Workspace name" }, { k: "desc", label: "What is it for?", area: true }, { k: "members", label: "Add members", pick: true }] },
  apply: { title: "Apply for a grant", sub: "Your application is added to the Applied column.", cta: "Add application", req: ["title"],
    fields: [{ k: "call", label: "Grant call", options: CALLS }, { k: "title", label: "Project title" }, { k: "lead", label: "Principal investigator", options: "members" }, { k: "amt", label: "Amount asked for (₹ lakh)", num: true }] },
  comp: { title: "Run a competition", sub: "Set it up with a government partner. It opens after approval.", cta: "Create competition", req: ["title"],
    fields: [{ k: "title", label: "Title" }, { k: "kind", label: "Type", options: ["Hackathon", "Knowledge competition"] }, { k: "partner", label: "Government partner", options: DEPTS }, { k: "due", label: "Closing date", date: true }] },
};

const hash = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const AV = ["bg-[#1f4d3a]", "bg-[#1e3a5f]", "bg-[#4d6f52]", "bg-[#3f6a94]", "bg-[#6b5b3e]"];
const initials = (n) => n.replace(/^Dr\.\s*/, "").split(" ").map((w) => w[0]).slice(0, 2).join("");
const card = "rounded-xl border border-[#e3dac2] bg-[#faf6ea] shadow-sm";
const th = "px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6b6857]";
const field = "mt-1.5 w-full rounded-lg border border-[#d8ceb2] bg-[#fffdf6] px-3 py-2.5 text-sm outline-none focus:border-[#1f4d3a]";

const Avatar = ({ name, size = "h-8 w-8" }) => <span className={`grid ${size} shrink-0 place-items-center rounded-full text-xs font-semibold text-white ${AV[hash(name) % AV.length]}`}>{initials(name)}</span>;

export default function Institution() {
  const nav = useNavigate();
  const [tab, setTab] = useState("Overview");
  const [years, setYears] = useState(YEARS0);
  const [pubs, setPubs] = useState(PUBS0);
  const [members, setMembers] = useState(MEMBERS0);
  const [wss, setWss] = useState(WS0);
  const [grants, setGrants] = useState(GRANTS0);
  const [comps, setComps] = useState(COMPS0);
  const [pilots, setPilots] = useState(PILOTS0);
  const [bonus, setBonus] = useState(0);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3200); return () => clearTimeout(t); } }, [toast]);
  useEffect(() => {
    if (!modal) return;
    const k = (e) => e.key === "Escape" && setModal(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [modal]);

  const totalPubs = years.reduce((s, y) => s + y.pubs, 0), totalData = years.reduce((s, y) => s + y.data, 0);
  const metrics = SCORE0.map(([l, v], i) => [l, Math.min(100, v + (i === 0 ? bonus : 0))]);
  const score = Math.round(metrics.reduce((s, m) => s + m[1], 0) / metrics.length);
  const optsOf = (f) => (f.options === "members" ? members.map((m) => m.name) : f.options);

  function open(m) {
    const init = {};
    MODALS[m].fields.forEach((f) => { init[f.k] = f.pick ? [] : f.file ? null : f.options ? optsOf(f)[0] : ""; });
    setForm(init); setErr(""); setModal(m);
  }

  function submit(e) {
    e.preventDefault();
    const M = MODALS[modal], miss = M.fields.find((f) => M.req.includes(f.k) && (!form[f.k] || !String(form[f.k].name || form[f.k]).trim()));
    if (miss) return setErr(`Fill in “${miss.label}”.`);
    if (modal === "invite" && !form.email.includes("@")) return setErr("Enter a valid email address.");
    const id = Date.now();
    // TODO: replace each branch with its API call (POST /api/publications, /members, /workspaces, /grants, /competitions)
    if (modal === "publish") {
      const isData = form.kind === "Dataset";
      setYears((y) => y.map((r) => (r.y === "2026" ? { ...r, pubs: r.pubs + (isData ? 0 : 1), data: r.data + (isData ? 1 : 0) } : r)));
      setPubs((p) => [{ id, title: form.title.trim(), kind: form.kind, author: form.author, date: "Sep 2026", reads: 0 }, ...p]);
      setBonus((b) => b + 1); setToast("Submitted for review. Counts and the scorecard are updated.");
    } else if (modal === "invite") {
      setMembers((m) => [...m, { id, name: form.name.trim(), email: form.email.trim(), role: form.role, ws: 0 }]); setToast("Invite sent.");
    } else if (modal === "workspace") {
      setWss((w) => [...w, { id, name: form.name.trim(), desc: form.desc, members: form.members }]);
      setMembers((m) => m.map((x) => (form.members.includes(x.id) ? { ...x, ws: x.ws + 1 } : x))); setToast("Workspace created.");
    } else if (modal === "apply") {
      setGrants((g) => [{ id, title: form.title.trim(), funder: form.call, amt: +form.amt || 0, col: "Applied", note: "Applied today" }, ...g]); setTab("Grants"); setToast("Application added.");
    } else {
      setComps((c) => [{ id, title: form.title.trim(), kind: form.kind, partner: form.partner, status: "Open", entries: 0, due: form.due || "date to be set" }, ...c]); setToast("Competition created.");
    }
    setModal(null);
  }

  const moveGrant = (id, col) => { if (COLS.includes(col)) setGrants((g) => g.map((x) => (x.id === id ? { ...x, col } : x))); };
  function setRole(m, role) {
    const admins = members.filter((x) => x.role === "Institution admin").length;
    if (m.role === "Institution admin" && admins === 1 && role !== m.role) return setToast("An institution needs at least one admin.");
    setMembers((x) => x.map((y) => (y.id === m.id ? { ...y, role } : y))); setToast("Role updated."); // TODO: PATCH /api/members/{id}
  }
  function removeMember(m) {
    if (m.role === "Institution admin" && members.filter((x) => x.role === "Institution admin").length === 1) return setToast("An institution needs at least one admin.");
    setMembers((x) => x.filter((y) => y.id !== m.id)); setWss((w) => w.map((s) => ({ ...s, members: s.members.filter((i) => i !== m.id) })));
  }

  const kpis = [[FileText, "Publications", totalPubs], [Database, "Datasets", totalData], [FolderKanban, "Active workspaces", wss.length], [Users, "Members", members.length]];

  return (
    <div className="min-h-screen bg-[#f3ecdc] text-[#1f2a24] font-['Public_Sans',sans-serif]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Public+Sans:wght@400;500;600&display=swap');`}</style>
      <header className="border-b border-[#ddd2b5]">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#1f4d3a] text-[#eef3ea]"><Landmark size={18} /></span>
          <span className="font-['Newsreader',serif] text-xl font-semibold">Bhoomi</span>
          <span className="rounded-full bg-[#d9e4ee] px-3 py-1 text-xs font-semibold text-[#2b4d73]">Academic institution</span>
          <button onClick={() => nav("/")} aria-label="Sign out" className="ml-auto grid h-10 w-10 place-items-center rounded-xl text-[#5c5a4b] hover:bg-[#e8dfc6]"><LogOut size={18} /></button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-5 py-8">
        {/* Institution banner */}
        <section className="flex flex-wrap items-center gap-5 rounded-2xl bg-[#1f4d3a] p-6 text-[#eef3ea]">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#f3ecdc] font-['Newsreader',serif] text-2xl font-semibold text-[#1f4d3a]">IG</span>
          <div className="min-w-0 flex-1">
            <h1 className="font-['Newsreader',serif] text-3xl font-medium">Indira Gandhi Institute of Rural Studies</h1>
            <p className="text-[#cfe0d2]">Pune, Maharashtra. Partner institution since 2021.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => open("publish")} className="flex items-center gap-2 rounded-lg bg-[#f3ecdc] px-4 py-2.5 text-sm font-semibold text-[#1f4d3a] hover:bg-white"><Upload size={16} /> Publish</button>
            <button onClick={() => open("apply")} className="flex items-center gap-2 rounded-lg border border-[#f3ecdc]/40 px-4 py-2.5 text-sm font-semibold hover:bg-white/10"><Award size={16} /> Apply for a grant</button>
          </div>
        </section>

        <div role="tablist" className="flex flex-wrap gap-1 rounded-xl bg-[#e8dfc6] p-1">
          {["Overview", "People and workspaces", "Grants", "Competitions and pilots"].map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === t ? "bg-[#faf6ea] text-[#1f4d3a] shadow-sm" : "text-[#5c5a4b] hover:text-[#1f2a24]"}`}>{t}</button>
          ))}
        </div>

        {tab === "Overview" && (
          <>
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Signature widget */}
              <section className="rounded-2xl bg-[#1e3a5f] p-6 text-[#eaf0f6]">
                <h2 className="flex items-center gap-2 font-semibold"><TrendingUp size={17} /> Research impact scorecard</h2>
                <div className="relative mx-auto mt-2 h-40 w-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{ v: score }, { v: 100 - score }]} dataKey="v" startAngle={90} endAngle={-270} innerRadius={56} outerRadius={72} stroke="none">
                        <Cell fill="#b6d8c0" /><Cell fill="#ffffff" fillOpacity={0.15} />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 grid place-content-center text-center"><span className="font-['Newsreader',serif] text-4xl font-semibold">{score}</span><span className="text-xs text-[#b9c9dc]">out of 100</span></div>
                </div>
                <p className="text-center text-sm text-[#b6d8c0]">Up 6 points on last year. Top 15% of 240 institutions.</p>
                <ul className="mt-4 space-y-2.5">
                  {metrics.map(([l, v]) => (
                    <li key={l}><div className="flex justify-between text-sm"><span>{l}</span><span className="font-semibold">{v}</span></div><div className="mt-1 h-1.5 rounded-full bg-white/15"><div className="h-full rounded-full bg-[#b6d8c0]" style={{ width: `${v}%` }} /></div></li>
                  ))}
                </ul>
              </section>

              <div className="space-y-6 lg:col-span-2">
                <div className="grid gap-4 sm:grid-cols-4">
                  {kpis.map(([I, l, v]) => (
                    <div key={l} className={`${card} border-t-2 border-t-[#4d8066] p-4`}>
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#6b6857]"><I size={13} />{l}</p>
                      <p className="mt-2 text-3xl font-bold">{v}</p>
                    </div>
                  ))}
                </div>
                <section className={`${card} p-5`}>
                  <h2 className="font-semibold">Publications and datasets by year</h2>
                  <div className="mt-3 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={years}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e6dcc2" vertical={false} />
                        <XAxis dataKey="y" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={28} />
                        <Tooltip /><Legend />
                        <Bar dataKey="pubs" name="Publications" fill="#1f4d3a" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="data" name="Datasets" fill="#3f6a94" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-[#a09c84]">2026 is the year so far.</p>
                </section>
              </div>
            </div>

            <section className={`${card} overflow-hidden`}>
              <div className="flex items-center justify-between p-5 pb-3"><h2 className="font-semibold">Recent publications</h2><button onClick={() => open("publish")} className="text-sm font-semibold text-[#1e3a5f]">Publish new</button></div>
              <table className="w-full text-sm">
                <thead className="bg-[#f3ecdc]"><tr><th className={th}>Title</th><th className={th}>Type</th><th className={th}>Author</th><th className={th}>Date</th><th className={th}>Reads</th></tr></thead>
                <tbody>{pubs.map((p) => <tr key={p.id} className="border-t border-[#e6dcc2]"><td className="px-3 py-2.5 font-medium">{p.title}</td><td className="px-3 py-2.5">{p.kind}</td><td className="px-3 py-2.5">{p.author}</td><td className="px-3 py-2.5 text-[#5c5a4b]">{p.date}</td><td className="px-3 py-2.5">{p.reads}</td></tr>)}</tbody>
              </table>
            </section>
          </>
        )}

        {tab === "People and workspaces" && (
          <>
            <section className={`${card} overflow-hidden`}>
              <div className="flex items-center justify-between p-5 pb-3"><h2 className="font-semibold">Members</h2>
                <button onClick={() => open("invite")} className="flex items-center gap-2 rounded-lg bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-[#eef3ea] hover:bg-[#173b2c]"><UserPlus size={15} /> Invite member</button></div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-sm">
                  <thead className="bg-[#f3ecdc]"><tr><th className={th}>Member</th><th className={th}>Role</th><th className={th}>Workspaces</th><th className={th}></th></tr></thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id} className="border-t border-[#e6dcc2]">
                        <td className="px-3 py-2.5"><div className="flex items-center gap-3"><Avatar name={m.name} /><div><p className="font-medium">{m.name}</p><p className="text-xs text-[#7a775f]">{m.email}</p></div></div></td>
                        <td className="px-3 py-2.5"><select value={m.role} aria-label={`Role of ${m.name}`} onChange={(e) => setRole(m, e.target.value)} className="rounded-lg border border-[#d8ceb2] bg-[#fffdf6] px-2.5 py-1.5 text-sm">{ROLES.map((r) => <option key={r}>{r}</option>)}</select></td>
                        <td className="px-3 py-2.5">{m.ws}</td>
                        <td className="px-3 py-2.5 text-right"><button onClick={() => removeMember(m)} aria-label={`Remove ${m.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#9b3b2f] hover:bg-[#f1d3cb]"><Trash2 size={15} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section>
              <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Workspaces</h2>
                <button onClick={() => open("workspace")} className="flex items-center gap-2 rounded-lg border border-[#cfc4a5] bg-[#faf6ea] px-4 py-2 text-sm font-semibold hover:bg-white"><Plus size={15} /> New workspace</button></div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {wss.map((w) => (
                  <div key={w.id} className={`${card} p-5`}>
                    <p className="font-semibold">{w.name}</p><p className="mt-1 min-h-[40px] text-sm text-[#5c5a4b]">{w.desc}</p>
                    <div className="mt-3 flex -space-x-2">{w.members.slice(0, 5).map((i) => { const m = members.find((x) => x.id === i); return m && <span key={i} title={m.name} className="rounded-full ring-2 ring-[#faf6ea]"><Avatar name={m.name} size="h-7 w-7" /></span>; })}</div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {tab === "Grants" && (
          <section>
            <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Grant pipeline</h2>
              <button onClick={() => open("apply")} className="flex items-center gap-2 rounded-lg bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-[#eef3ea] hover:bg-[#173b2c]"><Plus size={15} /> Apply for a grant</button></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {COLS.map((c, ci) => (
                <div key={c} onDragOver={(e) => e.preventDefault()} onDrop={(e) => moveGrant(+e.dataTransfer.getData("id"), c)} className="rounded-xl bg-[#e8dfc6] p-3">
                  <p className="mb-3 flex items-center justify-between px-1 text-sm font-semibold">{c}<span className="rounded-full bg-[#faf6ea] px-2 py-0.5 text-xs">{grants.filter((g) => g.col === c).length}</span></p>
                  <div className="space-y-2.5">
                    {grants.filter((g) => g.col === c).map((g) => (
                      <div key={g.id} draggable onDragStart={(e) => e.dataTransfer.setData("id", g.id)} className="cursor-grab rounded-lg bg-[#faf6ea] p-3 shadow-sm">
                        <p className="text-sm font-semibold leading-snug">{g.title}</p>
                        <p className="mt-1 text-xs text-[#5c5a4b]">{g.funder}</p>
                        <p className="mt-2 text-sm font-semibold text-[#1f4d3a]">₹{g.amt} lakh</p><p className="text-xs text-[#7a775f]">{g.note}</p>
                        <div className="mt-2 flex justify-between">
                          <button disabled={ci === 0} onClick={() => moveGrant(g.id, COLS[ci - 1])} aria-label="Move back" className="grid h-7 w-7 place-items-center rounded-md hover:bg-[#e8dfc6] disabled:opacity-30"><ChevronLeft size={15} /></button>
                          <button disabled={ci === 3} onClick={() => moveGrant(g.id, COLS[ci + 1])} aria-label="Move forward" className="grid h-7 w-7 place-items-center rounded-md hover:bg-[#e8dfc6] disabled:opacity-30"><ChevronRight size={15} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-[#7a775f]">Drag a card to another column, or use the arrows. Funders update the real status.</p>
          </section>
        )}

        {tab === "Competitions and pilots" && (
          <>
            <section>
              <div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 font-semibold"><Trophy size={17} /> Competitions we run</h2>
                <button onClick={() => open("comp")} className="flex items-center gap-2 rounded-lg bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-[#eef3ea] hover:bg-[#173b2c]"><Plus size={15} /> Run a competition</button></div>
              <div className="grid gap-4 md:grid-cols-3">
                {comps.map((c) => (
                  <div key={c.id} className={`${card} p-5`}>
                    <div className="flex items-start justify-between gap-2"><p className="font-semibold leading-snug">{c.title}</p><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${CHIP[c.status]}`}>{c.status}</span></div>
                    <p className="mt-1 text-sm text-[#5c5a4b]">{c.kind} with {c.partner}</p>
                    <p className="mt-3 text-2xl font-bold">{c.entries}<span className="ml-1 text-sm font-normal text-[#7a775f]">entries</span></p>
                    <p className="text-xs text-[#7a775f]">Closing: {c.due}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className={`${card} overflow-hidden`}>
              <h2 className="p-5 pb-3 font-semibold">Pilot projects we supervise</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-[#f3ecdc]"><tr><th className={th}>Pilot</th><th className={th}>Partner</th><th className={th}>Progress</th><th className={th}>Status</th></tr></thead>
                  <tbody>
                    {pilots.map((p) => (
                      <tr key={p.id} className="border-t border-[#e6dcc2]">
                        <td className="px-3 py-2.5 font-medium">{p.name}<span className="block text-xs font-normal text-[#7a775f]">{p.site}</span></td><td className="px-3 py-2.5">{p.partner}</td>
                        <td className="px-3 py-2.5"><div className="flex items-center gap-2"><div className="h-2 w-24 rounded-full bg-[#e6dcc2]"><div className="h-full rounded-full bg-[#4d8066]" style={{ width: `${p.progress}%` }} /></div><span className="w-9 font-semibold">{p.progress}%</span></div></td>
                        <td className="px-3 py-2.5"><select value={p.status} aria-label={`Status of ${p.name}`} onChange={(e) => { setPilots((x) => x.map((y) => (y.id === p.id ? { ...y, status: e.target.value } : y))); setToast("Pilot status updated."); }} className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold ${CHIP[p.status]}`}>{["On track", "At risk", "Completed"].map((s) => <option key={s}>{s}</option>)}</select></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      {toast && <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#1f2a24] px-5 py-3 text-sm text-[#f3ecdc] shadow-xl">{toast}</div>}

      {modal && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[#1f2a24]/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && setModal(null)}>
          <form onSubmit={submit} role="dialog" aria-modal="true" aria-label={MODALS[modal].title} className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#faf6ea] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="font-['Newsreader',serif] text-2xl font-medium">{MODALS[modal].title}</h2><p className="text-sm text-[#5c5a4b]">{MODALS[modal].sub}</p></div>
              <button type="button" onClick={() => setModal(null)} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#5c5a4b] hover:bg-[#e8dfc6]"><X size={18} /></button>
            </div>
            <div className="mt-4 space-y-4">
              {MODALS[modal].fields.map((f, i) => (
                <div key={f.k} className="text-sm font-medium">
                  {f.pick ? (
                    <fieldset><legend>{f.label}</legend>
                      <div className="mt-2 grid grid-cols-2 gap-2">{members.map((m) => (
                        <label key={m.id} className="flex items-center gap-2 rounded-lg bg-[#f3ecdc] px-3 py-2 font-normal">
                          <input type="checkbox" checked={form.members.includes(m.id)} onChange={() => setForm({ ...form, members: form.members.includes(m.id) ? form.members.filter((x) => x !== m.id) : [...form.members, m.id] })} className="accent-[#1f4d3a]" />{m.name}
                        </label>))}</div></fieldset>
                  ) : (
                    <label className="block">{f.label}
                      {f.file ? (
                        <span className="mt-1.5 flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-[#b9cfbe] bg-[#eef3e8] px-3 py-5 text-center font-normal">
                          <Upload size={18} className="text-[#1f4d3a]" /><span>{form.file ? form.file.name : "Choose a file"}</span>
                          <input type="file" className="sr-only" onChange={(e) => setForm({ ...form, file: e.target.files[0] || null })} />
                        </span>
                      ) : f.options ? (
                        <select value={form[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} className={field}>{optsOf(f).map((o) => <option key={o}>{o}</option>)}</select>
                      ) : f.area ? (
                        <textarea rows={3} value={form[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} className={field} />
                      ) : (
                        <input autoFocus={i === 0} type={f.date ? "date" : f.num ? "number" : "text"} value={form[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} className={field} />
                      )}
                    </label>
                  )}
                </div>
              ))}
            </div>
            {err && <p role="alert" className="mt-3 text-sm text-[#9b3b2f]">{err}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setModal(null)} className="rounded-lg border border-[#cfc4a5] px-5 py-2.5 text-sm font-semibold hover:bg-[#f3ecdc]">Cancel</button>
              <button className="rounded-lg bg-[#1f4d3a] px-5 py-2.5 text-sm font-semibold text-[#eef3ea] hover:bg-[#173b2c]">{MODALS[modal].cta}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}