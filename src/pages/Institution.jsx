import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  Landmark, LogOut, FileText, Database, Users, UserPlus, FolderKanban, Award, Trophy, Plus, X, ChevronLeft, ChevronRight, Trash2, TrendingUp, Upload, Sparkles, MapPin,
} from "lucide-react";
import { MapModal } from "../components/MapLibreMap";
import NotificationCenter from "../components/NotificationCenter";

/* ---------- Sample data ---------- */
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
  { id: 1, name: "Farmland conversion study", desc: "Satellite and records analysis around Pune and Satara", members: [1, 2, 3], center: [73.8567, 18.5204] },
  { id: 2, name: "Land dispute trends", desc: "Court data across western Maharashtra", members: [1, 4, 5], center: [74.24, 16.70] },
  { id: 3, name: "Drone survey pilot", desc: "Village mapping with the state revenue department", members: [2, 3], center: [73.99, 17.68] },
];
const GRANTS0 = [
  { id: 1, title: "Peri-urban land conversion model", funder: "DoLR Research Grant", amt: 18, col: "Ongoing", note: "Year 1 of 2" },
  { id: 2, title: "Drone-based village mapping", funder: "NITI Aayog", amt: 24, col: "Ongoing", note: "Year 1 of 3" },
  { id: 3, title: "Flood risk and parcel values", funder: "DST", amt: 12, col: "Awarded", note: "Starts Nov 2026" },
  { id: 4, title: "Women's land rights atlas", funder: "ICSSR", amt: 9, col: "Under review", note: "Decision by Dec" },
  { id: 5, title: "AI search for court records", funder: "DoLR Research Grant", amt: 15, col: "Under review", note: "Decision by Nov" },
  { id: 6, title: "Tribal land tenure documentation", funder: "State Tribal Dept", amt: 7, col: "Applied", note: "Applied 12 Sep" },
];
const COMPS0 = [
  { id: 1, title: "Land Data Challenge", kind: "Hackathon", partner: "Dept of Land Resources", status: "Open", entries: 86, due: "30 Oct" },
  { id: 2, title: "Student paper contest on land reform", kind: "Knowledge competition", partner: "Ministry of Rural Development", status: "Judging", entries: 41, due: "closed 10 Sep" },
  { id: 3, title: "Village mapping sprint", kind: "Hackathon", partner: "State Revenue Department", status: "Closed", entries: 63, due: "closed 2 Jun" },
];
const PILOTS0 = [
  { id: 1, name: "Drone survey of 40 villages", site: "Satara, Maharashtra", partner: "State Revenue Department", progress: 62, status: "On track", center: [73.99, 17.68] },
  { id: 2, name: "Mobile app for boundary disputes", site: "Kolhapur, Maharashtra", partner: "District Collectorate", progress: 35, status: "At risk", center: [74.24, 16.70] },
  { id: 3, name: "ULPIN-linked village dashboard", site: "Nashik, Maharashtra", partner: "Dept of Land Resources", progress: 100, status: "Completed", center: [73.7898, 19.9975] },
];
const SCORE0 = [["Research output", 82], ["Reads and downloads", 76], ["Collaboration", 68], ["Policy uptake", 59], ["Grant success", 71]];
const CHIP = {
  Open: "bg-[#e3ecdf] text-[#1f3d2b]", Judging: "bg-[#f3e3b8] text-[#7a5a12]", Closed: "bg-stone-200 text-stone-600",
  "On track": "bg-[#e3ecdf] text-[#1f3d2b]", "At risk": "bg-[#f1d3cb] text-[#8a3324]", Completed: "bg-[#dbe6d5] text-[#1f3d2b]",
};

const MODALS = {
  publish: { title: "Publish research or data", sub: "It goes to the national repository once a reviewer approves it.", cta: "Submit for review", req: ["title", "file"],
    fields: [{ k: "title", label: "Title" }, { k: "kind", label: "Kind", options: ["Research paper", "Policy brief", "Dataset", "Case study"] }, { k: "author", label: "Author", options: "members" }, { k: "file", label: "File (PDF, CSV, GeoJSON)", file: true }] },
  apply: { title: "Apply for a grant", sub: "Adds a card to your grant pipeline Kanban board.", cta: "Add grant application", req: ["title", "funder"],
    fields: [{ k: "title", label: "Project title" }, { k: "funder", label: "Funder / Grant call", options: ["DoLR Research Grant 2026", "ICSSR Land Governance Call", "DST Climate and Land Call", "NITI Aayog Innovation Call"] }, { k: "amt", label: "Grant amount (₹ lakh)", num: true }, { k: "lead", label: "Principal Investigator", options: "members" }] },
  member: { title: "Add an institution member", sub: "They receive an invite to join the Bhoomi workspace.", cta: "Send invite", req: ["name", "email"],
    fields: [{ k: "name", label: "Full name" }, { k: "email", label: "Email" }, { k: "role", label: "Role", options: ROLES }] },
  workspace: { title: "Create a workspace", sub: "A shared space for datasets, documents, maps and spatial discussion.", cta: "Create workspace", req: ["name"],
    fields: [{ k: "name", label: "Workspace name" }, { k: "desc", label: "Description", area: true }, { k: "members", label: "Assign members", checkMembers: true }] },
  comp: { title: "Run a competition or hackathon", sub: "It appears in the national innovation portal.", cta: "Launch competition", req: ["title"],
    fields: [{ k: "title", label: "Competition title" }, { k: "kind", label: "Kind", options: ["Hackathon", "Student paper contest", "Challenge"] }, { k: "partner", label: "Government partner", options: DEPTS }, { k: "due", label: "Deadline", date: true }] },
};

function Avatar({ name, size = "h-8 w-8" }) {
  const ini = name.replace(/^Dr\.\s*/, "").split(" ").map((w) => w[0]).slice(0, 2).join("");
  return <span className={`grid ${size} place-items-center rounded-full bg-[#1f3d2b] text-[11px] font-semibold text-[#f4efe6]`}>{ini}</span>;
}

export default function Institution({ user, onLogout: logoutProp }) {
  const nav = useNavigate();
  const onLogout = logoutProp || (() => { localStorage.removeItem("bhoomi_user"); nav("/"); });
  const [tab, setTab] = useState("Overview");
  const [years, setYears] = useState(YEARS0);
  const [pubs, setPubs] = useState(PUBS0);
  const [members, setMembers] = useState(MEMBERS0);
  const [wss, setWss] = useState(WS0);
  const [grants, setGrants] = useState(GRANTS0);
  const [comps, setComps] = useState(COMPS0);
  const [pilots, setPilots] = useState(PILOTS0);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [mapConfig, setMapConfig] = useState({ title: "Pilot Drone Survey Map", subtitle: "Satara village mapping site", center: [73.99, 17.68], zoom: 11, markers: [] });

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3200); return () => clearTimeout(t); } }, [toast]);

  const pubsCount = years.reduce((s, r) => s + r.pubs, 0);
  const dataCount = years.reduce((s, r) => s + r.data, 0);
  const kpis = [
    [FileText, "Publications", pubsCount],
    [Database, "Datasets", dataCount],
    [Award, "Active grants", grants.filter((g) => g.col === "Ongoing" || g.col === "Awarded").length],
    [Users, "Members", members.length],
  ];

  const score = 78;
  const metrics = SCORE0.map(([l, v]) => [l, v]);

  const openMapForPilot = (p) => {
    setMapConfig({
      title: `Spatial View: ${p.name}`,
      subtitle: `${p.site} · Partner: ${p.partner}`,
      center: p.center || [73.99, 17.68],
      zoom: 12,
      markers: [{ lng: (p.center || [73.99, 17.68])[0], lat: (p.center || [73.99, 17.68])[1], title: p.name, description: `${p.site} (${p.progress}% done)`, color: "#1f3d2b" }],
    });
    setMapOpen(true);
  };

  const card = "rounded-2xl bg-white border border-stone-300 shadow-sm";
  const th = "p-3 font-semibold text-stone-600 text-left text-xs uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-[#f4efe6] font-['Public_Sans',sans-serif] text-[#26282b]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Public+Sans:wght@400;500;600&display=swap');`}</style>

      <header className="sticky top-0 z-40 border-b border-[#1f3d2b]/15 bg-[#f4efe6]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#1f3d2b] text-[#d2b067]"><Landmark size={18} /></span>
          <span className="font-['Newsreader',serif] text-2xl font-semibold text-[#1f3d2b]">Bhoomi</span>
          <span className="rounded-full bg-[#e3ecdf] px-3 py-0.5 text-xs font-semibold text-[#1f3d2b]">Academic Institution</span>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("open-bhoomi-ai"))} className="flex items-center gap-1.5 rounded-lg border border-[#b8923a]/40 bg-[#faf7f1] px-3.5 py-2 text-sm font-semibold text-[#1f3d2b] hover:bg-[#b8923a]/15 transition"><Sparkles size={15} className="text-[#b8923a]" />Bhoomi AI</button>
            <NotificationCenter role="academic" />
            <button onClick={onLogout} aria-label="Sign out" title="Sign out" className="grid h-10 w-10 place-items-center rounded-xl text-stone-600 hover:bg-stone-200/60 transition"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-5 py-8">
        {/* Institution banner */}
        <section className="flex flex-wrap items-center gap-5 rounded-2xl bg-[#1f3d2b] p-6 text-white border-t-4 border-[#b8923a] shadow-md">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#f4efe6] font-['Newsreader',serif] text-2xl font-semibold text-[#1f3d2b]">IG</span>
          <div className="min-w-0 flex-1">
            <h1 className="font-['Newsreader',serif] text-3xl font-medium text-[#f4efe6]">Indira Gandhi Institute of Rural Studies</h1>
            <p className="text-stone-300 text-sm mt-0.5">Pune, Maharashtra · Geospatial &amp; Rural Governance Centre of Excellence</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setModal("publish")} className="flex items-center gap-2 rounded-xl bg-[#b8923a] px-4 py-2.5 text-sm font-semibold text-[#1f2a24] hover:bg-[#c9a34b] transition"><Upload size={16} /> Publish</button>
            <button onClick={() => setModal("apply")} className="flex items-center gap-2 rounded-xl border border-stone-400 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition"><Award size={16} /> Apply for grant</button>
          </div>
        </section>

        {/* Tab switcher */}
        <div role="tablist" className="flex flex-wrap gap-1 rounded-xl bg-stone-200/80 p-1">
          {["Overview", "People and workspaces", "Grants", "Competitions and pilots"].map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === t ? "bg-white text-[#1f3d2b] shadow-sm" : "text-stone-600 hover:text-stone-900"}`}>{t}</button>
          ))}
        </div>

        {tab === "Overview" && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Scorecard */}
            <section className="rounded-2xl bg-[#1f3d2b] p-6 text-white border-t-4 border-[#b8923a] shadow-md">
              <h2 className="flex items-center gap-2 font-semibold text-[#f4efe6]"><TrendingUp size={17} className="text-[#b8923a]" /> Research impact scorecard</h2>
              <div className="relative mx-auto mt-4 h-36 w-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ v: score }, { v: 100 - score }]} dataKey="v" startAngle={90} endAngle={-270} innerRadius={50} outerRadius={66} stroke="none">
                      <Cell fill="#b8923a" /><Cell fill="#ffffff" fillOpacity={0.15} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 grid place-content-center text-center"><span className="font-['Newsreader',serif] text-4xl font-semibold text-white">{score}</span><span className="text-[11px] text-stone-300">out of 100</span></div>
              </div>
              <p className="text-center text-xs text-[#b8923a] mt-2 font-medium">Top 15% across national land research hubs.</p>
              <ul className="mt-4 space-y-2">
                {metrics.map(([l, v]) => (
                  <li key={l}><div className="flex justify-between text-xs"><span>{l}</span><span className="font-semibold">{v}</span></div><div className="mt-1 h-1.5 rounded-full bg-white/15 overflow-hidden"><div className="h-full rounded-full bg-[#b8923a]" style={{ width: `${v}%` }} /></div></li>
                ))}
              </ul>
            </section>

            <div className="space-y-6 lg:col-span-2">
              <div className="grid gap-4 sm:grid-cols-4">
                {kpis.map(([I, l, v]) => (
                  <div key={l} className={`${card} p-4 border-t-2 border-t-[#1f3d2b]`}>
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500"><I size={13} className="text-[#1f3d2b]" />{l}</p>
                    <p className="mt-2 text-3xl font-bold text-[#1f3d2b] font-['Newsreader',serif]">{v}</p>
                  </div>
                ))}
              </div>

              {/* Recent outputs */}
              <section className={`${card} overflow-hidden`}>
                <div className="p-4 border-b border-stone-200 bg-[#faf7f1] flex justify-between items-center">
                  <h2 className="font-semibold text-[#1f3d2b]">Recent published research</h2>
                  <button onClick={() => setModal("publish")} className="text-xs font-semibold text-[#1f3d2b] hover:underline">+ New study</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-stone-200 bg-stone-50"><th className={th}>Title</th><th className={th}>Type</th><th className={th}>Author</th><th className={th}>Reads</th></tr></thead>
                    <tbody>
                      {pubs.map((p) => (
                        <tr key={p.id} className="border-b border-stone-100 last:border-0 hover:bg-[#faf7f1]">
                          <td className="p-3 font-semibold text-stone-900">{p.title}</td>
                          <td className="p-3 text-xs text-stone-600">{p.kind}</td>
                          <td className="p-3 text-xs text-stone-600">{p.author}</td>
                          <td className="p-3 font-bold text-[#1f3d2b]">{p.reads}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        )}

        {tab === "People and workspaces" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <section className={`${card} lg:col-span-2 overflow-hidden`}>
              <div className="p-4 border-b border-stone-200 bg-[#faf7f1] flex justify-between items-center">
                <h2 className="font-semibold text-[#1f3d2b]">Faculty and Researchers</h2>
                <button onClick={() => setModal("member")} className="text-xs font-semibold text-[#1f3d2b] hover:underline">+ Add member</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-stone-200 bg-stone-50"><th className={th}>Member</th><th className={th}>Role</th><th className={th}>Workspaces</th></tr></thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id} className="border-b border-stone-100 last:border-0">
                        <td className="p-3 flex items-center gap-3"><Avatar name={m.name} /><p className="font-semibold text-stone-900">{m.name}</p></td>
                        <td className="p-3 text-xs text-stone-600">{m.role}</td>
                        <td className="p-3 font-semibold text-[#1f3d2b]">{m.ws}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex justify-between items-center"><h2 className="font-semibold text-[#1f3d2b]">Workspaces</h2></div>
              {wss.map((w) => (
                <div key={w.id} className={`${card} p-4 hover:border-[#b8923a] transition`}>
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-stone-900 text-sm">{w.name}</p>
                    <button onClick={() => openMapForPilot({ name: w.name, site: "Study Area", partner: "IGIRS", center: w.center })} className="flex items-center gap-1 text-xs text-[#1f3d2b] border border-stone-300 rounded px-2 py-0.5 hover:bg-stone-100"><MapPin size={11} className="text-[#b8923a]" />Map</button>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">{w.desc}</p>
                </div>
              ))}
            </section>
          </div>
        )}

        {tab === "Grants" && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[#1f3d2b]">Grant pipeline kanban</h2>
              <button onClick={() => setModal("apply")} className="rounded-lg bg-[#1f3d2b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a5239] transition">+ Apply for grant</button>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {COLS.map((c) => (
                <div key={c} className="rounded-2xl border border-stone-300 bg-[#faf7f1] p-3">
                  <div className="flex justify-between items-center mb-3 px-1"><span className="text-xs font-semibold text-stone-700">{c}</span><span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-[#1f3d2b] border border-stone-200">{grants.filter((g) => g.col === c).length}</span></div>
                  <div className="space-y-2">
                    {grants.filter((g) => g.col === c).map((g) => (
                      <div key={g.id} className="rounded-xl bg-white border border-stone-200 p-3 shadow-sm">
                        <p className="text-xs font-semibold text-stone-900 leading-snug">{g.title}</p>
                        <p className="text-[11px] text-stone-500 mt-0.5">{g.funder}</p>
                        <p className="mt-2 text-sm font-bold text-[#1f3d2b]">₹{g.amt} lakh</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "Competitions and pilots" && (
          <div className="space-y-6">
            <section className={`${card} overflow-hidden`}>
              <div className="p-4 border-b border-stone-200 bg-[#faf7f1] flex justify-between items-center">
                <h2 className="font-semibold text-[#1f3d2b]">Field pilot projects supervised</h2>
                <span className="text-xs text-stone-500">Live ground and drone verification</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-stone-200 bg-stone-50"><th className={th}>Pilot</th><th className={th}>Site</th><th className={th}>Partner</th><th className={th}>Progress</th><th className={th}>Spatial Map</th></tr></thead>
                  <tbody>
                    {pilots.map((p) => (
                      <tr key={p.id} className="border-b border-stone-100 last:border-0 hover:bg-[#faf7f1]">
                        <td className="p-3 font-semibold text-stone-900">{p.name}</td>
                        <td className="p-3 text-xs text-stone-600">{p.site}</td>
                        <td className="p-3 text-xs text-stone-600">{p.partner}</td>
                        <td className="p-3 font-bold text-[#1f3d2b]">{p.progress}%</td>
                        <td className="p-3">
                          <button onClick={() => openMapForPilot(p)} className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1 text-xs font-semibold text-[#1f3d2b] hover:bg-[#1f3d2b] hover:text-white transition">
                            <MapPin size={13} className="text-[#b8923a]" /> View site
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* MapLibre Modal for Academic Field Sites */}
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
    </div>
  );
}