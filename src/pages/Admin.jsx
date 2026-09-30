import { useEffect, useMemo, useRef, useState } from "react";
import {
  Landmark, LayoutDashboard, UserCheck, Users, ShieldCheck, KeyRound, Flag, Workflow, ScrollText, Bell,
  LogOut, Search, Download, Trash2, Plus, Copy, RotateCcw, Pause, Play, HardDrive, CheckCircle2,
  AlertTriangle, Loader2, X, Check, Lock, Ban, RefreshCw,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { ROLES } from "../roles";

/* ---------------- mock data (swap for /api calls later) ---------------- */
const NAV = [
  ["overview", "Overview", LayoutDashboard], ["approvals", "Approvals", UserCheck], ["users", "Users", Users],
  ["access", "Access and data", ShieldCheck], ["keys", "API keys", KeyRound], ["moderation", "Moderation", Flag],
  ["ops", "Pipelines and backups", Workflow], ["audit", "Audit log", ScrollText], ["notify", "Notifications", Bell],
];
const USERS = [
  { id: 1, name: "Ananya Rao", email: "ananya@demo.in", role: "researcher", on: true },
  { id: 2, name: "Vikram Desai", email: "vikram@dolr.gov.in", role: "policymaker", on: true },
  { id: 3, name: "R. K. Sharma", email: "rk.sharma@rajasthan.gov.in", role: "agency", on: true },
  { id: 4, name: "Dr. Kavya Nair", email: "kavya@iisc.ac.in", role: "academic", on: true },
  { id: 5, name: "TerraSense Analytics", email: "hello@terrasense.in", role: "industry", on: true },
  { id: 6, name: "Imran Sheikh", email: "imran@gmail.com", role: "public", on: true },
  { id: 7, name: "Neha Patil", email: "neha@vjti.ac.in", role: "researcher", on: false },
  { id: 8, name: "Site Admin", email: "admin@bhoomi.in", role: "admin", on: true },
];
const APPROVALS = [
  { id: 1, name: "Dr. Meera Iyer", org: "IIT Bombay, Civil Engineering", role: "academic", note: "Institution account, 42 members" },
  { id: 2, name: "S. Kulkarni", org: "Revenue Dept., Maharashtra", role: "agency", note: "Wants to connect the state land-records API" },
  { id: 3, name: "Arjun Menon", org: "Independent researcher, Kochi", role: "researcher", note: "Requests dataset upload rights" },
  { id: 4, name: "GeoNest Labs", org: "Pune", role: "industry", note: "Remote sensing startup, pilot partner" },
];
const FEATURES = ["Repository upload", "AI assistant", "GIS maps", "Analytics", "Policy simulation", "Workspaces", "Innovation portal", "Reports export", "API access"];
const PR = ["public", "researcher", "policymaker", "agency", "academic", "industry"];
const ALL = PR, NOPUB = PR.slice(1);
const PERMS = {
  "Repository upload": ["researcher", "agency", "academic"], "AI assistant": ALL, "GIS maps": ALL,
  Analytics: NOPUB, "Policy simulation": ["researcher", "policymaker", "agency"], Workspaces: NOPUB,
  "Innovation portal": ALL, "Reports export": ALL, "API access": ["researcher", "agency", "academic", "industry"],
};
const DATASETS = [
  { id: 1, name: "ULPIN land parcels, Maharashtra", owner: "Revenue Dept.", q: 96, access: "restricted" },
  { id: 2, name: "Sentinel-2 land cover 2025", owner: "ISRO / NRSC", q: 91, access: "public" },
  { id: 3, name: "Census 2011 village amenities", owner: "Census of India", q: 88, access: "public" },
  { id: 4, name: "Land dispute cases by district", owner: "DoLR", q: 79, access: "restricted" },
  { id: 5, name: "PM-KISAN beneficiary parcels", owner: "Agriculture Dept.", q: 84, access: "private" },
];
const KEYS = [
  { id: 1, name: "Rajasthan Bhulekh connector", role: "agency", key: "bhm_a91f…7c2e", made: "12 Sep 2026", on: true },
  { id: 2, name: "IIT Bombay research access", role: "academic", key: "bhm_3d08…b41a", made: "20 Sep 2026", on: true },
  { id: 3, name: "TerraSense pilot", role: "industry", key: "bhm_e772…09dd", made: "25 Sep 2026", on: false },
];
const CONTENT = [
  { id: 1, title: "Land Fragmentation in Western Maharashtra, 2010 to 2024", by: "Ananya Rao", st: "pending" },
  { id: 2, title: "Digital India Land Records Modernisation: Evaluation Report", by: "DoLR", st: "published" },
  { id: 3, title: "Urban Sprawl and Farmland Loss around Pune", by: "GeoNest Labs", st: "flagged" },
  { id: 4, title: "Dispute Resolution Timelines, Case Study Kerala", by: "Dr. Kavya Nair", st: "pending" },
];
const FEEDBACK = [
  { id: 1, kind: "Wrong data", text: "Dispute count for Nashik looks doubled in 2024.", by: "Public user" },
  { id: 2, kind: "Map error", text: "Forest layer overlaps a village boundary near Wayanad.", by: "Researcher" },
  { id: 3, kind: "Document issue", text: "Policy PDF opens blank after upload.", by: "Government agency" },
  { id: 4, kind: "Feature request", text: "Add Marathi to the language toggle.", by: "Public user" },
];
const PIPES = [
  { id: 1, name: "ULPIN land records sync", st: "running", pct: 42, meta: "Maharashtra" },
  { id: 2, name: "Sentinel-2 imagery ingest", st: "ok", pct: 100, meta: "412 tiles, finished 06:10" },
  { id: 3, name: "Census socio-economic load", st: "ok", pct: 100, meta: "1.2M rows, finished 04:45" },
  { id: 4, name: "Bhulekh Rajasthan connector", st: "failed", pct: 0, meta: "Timed out after 3 retries" },
  { id: 5, name: "Document OCR and embeddings", st: "paused", pct: 48, meta: "231 of 480 PDFs" },
];
const BACKUPS = [
  { id: 1, when: "30 Sep 2026, 02:00", size: "412 GB", kind: "Scheduled" },
  { id: 2, when: "29 Sep 2026, 02:00", size: "409 GB", kind: "Scheduled" },
  { id: 3, when: "27 Sep 2026, 16:20", size: "401 GB", kind: "Manual" },
];
const EVENTS = ["New datasets", "Pipeline failures", "Approval requests", "New feedback", "Backup completed", "Security alerts"];
const NOTIF = Object.fromEntries(EVENTS.map((e) => [e, { app: true, email: ["Pipeline failures", "Security alerts", "Approval requests"].includes(e) }]));
const POOL = [
  ["r.sharma@rajasthan.gov.in", "uploaded cadastral_jaipur_v3.gpkg", "info"],
  ["ananya@demo.in", "ran land-use change analysis for Pune", "info"],
  ["vikram@dolr.gov.in", "started simulation: irrigation subsidy reform", "info"],
  ["api-key bhm_…4f2a", "exceeded rate limit on /datasets", "warn"],
  ["unknown (203.0.113.7)", "3 failed sign-in attempts", "warn"],
  ["pipeline:ulpin-sync", "wrote 18,204 parcels to PostGIS", "ok"],
  ["kavya@iisc.ac.in", "created workspace Coastal Erosion 2026", "info"],
];

/* ---------------- helpers ---------------- */
const cx = (...a) => a.filter(Boolean).join(" ");
const stamp = () => new Date().toLocaleTimeString("en-IN", { hour12: false });
const rand = () => Math.random().toString(36).slice(2, 10);
const dot = { info: "bg-slate-400", ok: "bg-emerald-500", warn: "bg-amber-500" };
const th = "pb-2 pr-3 text-left text-xs font-semibold text-slate-500";
const td = "py-2.5 pr-3 align-middle";
const inp = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

function Btn({ kind = "ghost", className, ...p }) {
  const k = {
    primary: "bg-blue-700 text-white hover:bg-blue-800", dark: "bg-slate-800 text-white hover:bg-slate-900",
    ghost: "border border-slate-300 text-slate-700 hover:bg-slate-50", danger: "border border-red-200 text-red-700 hover:bg-red-50",
  }[kind];
  return <button {...p} className={cx("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40", k, className)} />;
}
function Card({ title, right, children, className }) {
  return (
    <section className={cx("rounded-xl bg-white ring-1 ring-slate-200", className)}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
        <h2 className="font-['Newsreader',serif] text-lg font-semibold text-slate-900">{title}</h2>{right}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}
const Empty = ({ children }) => <p className="py-8 text-center text-sm text-slate-500">{children}</p>;
const Pill = ({ role }) => <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ background: ROLES[role].hex }}>{ROLES[role].label}</span>;
function Switch({ on, onChange, label }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={onChange}
      className={cx("relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700", on ? "bg-blue-700" : "bg-slate-300")}>
      <span className={cx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", on ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}
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

/* ---------------- page ---------------- */
export default function Admin({ user: userProp, onLogout: logoutProp }) {
  // Falls back to the saved session if App.jsx does not pass props
  const saved = (() => { try { return JSON.parse(localStorage.getItem("bhoomi_user")); } catch { return null; } })();
  const user = userProp || saved || { name: "Admin", email: "admin@bhoomi.in" };
  const onLogout = logoutProp || (() => { localStorage.removeItem("bhoomi_user"); window.location.href = "/"; });
  const [tab, setTab] = useState("overview");
  const [users, setUsers] = useState(USERS);
  const [approvals, setApprovals] = useState(APPROVALS);
  const [perms, setPerms] = useState(PERMS);
  const [savedPerms, setSavedPerms] = useState(PERMS);
  const [datasets, setDatasets] = useState(DATASETS);
  const [keys, setKeys] = useState(KEYS);
  const [content, setContent] = useState(CONTENT);
  const [feedback, setFeedback] = useState(FEEDBACK);
  const [pipes, setPipes] = useState(PIPES);
  const [backups, setBackups] = useState(BACKUPS);
  const [backingUp, setBackingUp] = useState(false);
  const [notif, setNotif] = useState(NOTIF);
  const [savedNotif, setSavedNotif] = useState(NOTIF);
  const [logs, setLogs] = useState(() => POOL.slice(0, 5).map(([actor, text, kind], id) => ({ id, time: stamp(), actor, text, kind })));
  const [live, setLive] = useState(true);
  const [q, setQ] = useState("");
  const [roleF, setRoleF] = useState("all");
  const [logQ, setLogQ] = useState("");
  const [logK, setLogK] = useState("all");
  const [modTab, setModTab] = useState("repo");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: "researcher" });
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState("");
  const nid = useRef(100);

  const log = (text, kind = "info", actor = user.email) => setLogs((l) => [{ id: nid.current++, time: stamp(), actor, text, kind }, ...l].slice(0, 60));
  const say = (m) => { setToast(m); setTimeout(() => setToast(""), 2500); };
  const ask = (title, body, onOk) => setConfirm({ title, body, onOk });
  const openForm = (type) => { setForm({ name: "", email: "", role: "researcher" }); setModal({ type }); };

  /* live audit stream + pipeline progress */
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => { const [a, x, k] = POOL[Math.floor(Math.random() * POOL.length)]; log(x, k, a); }, 3500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);
  useEffect(() => {
    const t = setInterval(() => setPipes((p) => p.map((x) => x.st !== "running" ? x : x.pct + 10 >= 100 ? { ...x, st: "ok", pct: 100, meta: "Finished just now" } : { ...x, pct: x.pct + 10 })), 1500);
    return () => clearInterval(t);
  }, []);

  /* approvals */
  const decide = (a, ok) => {
    setApprovals((l) => l.filter((x) => x.id !== a.id));
    if (ok) setUsers((u) => [...u, { id: nid.current++, name: a.name, email: `${a.name.toLowerCase().replace(/[^a-z]+/g, ".")}@pending.in`, role: a.role, on: true }]);
    log(`${ok ? "approved" : "rejected"} ${ROLES[a.role].label.toLowerCase()} account for ${a.name}`, ok ? "ok" : "warn");
    say(`${ok ? "Approved" : "Rejected"} ${a.name}`);
  };

  /* users */
  const shownUsers = useMemo(() => users.filter((u) => (roleF === "all" || u.role === roleF) && `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())), [users, q, roleF]);
  const setRole = (u, role) => { setUsers((l) => l.map((x) => (x.id === u.id ? { ...x, role } : x))); log(`changed ${u.name} to ${ROLES[role].label}`, "warn"); say("Role updated"); };
  const toggleUser = (u) => { setUsers((l) => l.map((x) => (x.id === u.id ? { ...x, on: !x.on } : x))); log(`${u.on ? "suspended" : "reactivated"} ${u.name}`, "warn"); say(u.on ? "User suspended" : "User reactivated"); };
  const removeUser = (u) => ask("Remove user", `${u.name} will lose access immediately.`, () => { setUsers((l) => l.filter((x) => x.id !== u.id)); log(`removed user ${u.name}`, "warn"); say("User removed"); });
  const invite = () => {
    if (!form.name.trim() || !form.email.includes("@")) return say("Enter a name and a valid email");
    setUsers((l) => [...l, { id: nid.current++, name: form.name.trim(), email: form.email.trim(), role: form.role, on: true }]);
    log(`invited ${form.email} as ${ROLES[form.role].label}`, "ok"); setModal(null); say("Invitation sent");
  };

  /* permissions, datasets */
  const toggle = (f, r) => setPerms((p) => ({ ...p, [f]: p[f].includes(r) ? p[f].filter((x) => x !== r) : [...p[f], r] }));
  const permsDirty = JSON.stringify(perms) !== JSON.stringify(savedPerms);
  const savePerms = () => { setSavedPerms(perms); log("updated the role-permission grid", "warn"); say("Permissions saved"); };
  const setAccess = (d, access) => { setDatasets((l) => l.map((x) => (x.id === d.id ? { ...x, access } : x))); log(`set "${d.name}" to ${access}`, "warn"); say("Dataset access updated"); };

  /* API keys */
  const makeKey = (name, role, verb) => { const key = `bhm_${rand()}${rand()}${rand()}`; log(`${verb} API key "${name}"`, "ok"); setModal({ type: "reveal", key, name }); return key; };
  const createKey = () => {
    if (!form.name.trim()) return say("Give the key a name");
    const key = makeKey(form.name.trim(), form.role, "created");
    setKeys((l) => [...l, { id: nid.current++, name: form.name.trim(), role: form.role, key: `${key.slice(0, 8)}…${key.slice(-4)}`, made: "Today", on: true }]);
  };
  const rotate = (k) => { const key = makeKey(k.name, k.role, "rotated"); setKeys((l) => l.map((x) => (x.id === k.id ? { ...x, key: `${key.slice(0, 8)}…${key.slice(-4)}`, on: true } : x))); };
  const revoke = (k) => ask("Revoke API key", `"${k.name}" will stop working right away.`, () => { setKeys((l) => l.map((x) => (x.id === k.id ? { ...x, on: false } : x))); log(`revoked API key "${k.name}"`, "warn"); say("Key revoked"); });
  const copy = async (t) => { try { await navigator.clipboard.writeText(t); say("Copied"); } catch { say("Copy failed, select the key and copy it manually"); } };

  /* moderation */
  const setSt = (c, st) => { setContent((l) => l.map((x) => (x.id === c.id ? { ...x, st } : x))); log(`${st} "${c.title}"`, st === "flagged" ? "warn" : "ok"); say(`Marked ${st}`); };
  const dropContent = (c) => ask("Remove item", `"${c.title}" will be removed from the repository.`, () => { setContent((l) => l.filter((x) => x.id !== c.id)); log(`removed "${c.title}"`, "warn"); say("Item removed"); });
  const closeFb = (f, verb) => { setFeedback((l) => l.filter((x) => x.id !== f.id)); log(`${verb} feedback (${f.kind.toLowerCase()})`); say(`Feedback ${verb}`); };

  /* pipelines and backups */
  const pipe = (p, st, extra = {}, verb) => { setPipes((l) => l.map((x) => (x.id === p.id ? { ...x, st, ...extra } : x))); log(`${verb} pipeline "${p.name}"`); };
  const backupNow = () => {
    setBackingUp(true); log("started a manual backup");
    setTimeout(() => {
      setBackups((l) => [{ id: nid.current++, when: `Today, ${stamp().slice(0, 5)}`, size: "415 GB", kind: "Manual" }, ...l]);
      setBackingUp(false); log("manual backup completed", "ok"); say("Backup completed");
    }, 2000);
  };
  const restore = (b) => ask("Restore backup", `Restore the platform from ${b.when}? Data added after that time will be lost.`, () => { log(`started restore from ${b.when}`, "warn"); say("Restore started"); });
  const dropBackup = (b) => ask("Delete backup", `Delete the backup from ${b.when}?`, () => { setBackups((l) => l.filter((x) => x.id !== b.id)); log(`deleted backup ${b.when}`, "warn"); say("Backup deleted"); });

  /* audit */
  const shownLogs = logs.filter((l) => (logK === "all" || l.kind === logK) && `${l.actor} ${l.text}`.toLowerCase().includes(logQ.toLowerCase()));
  const exportCsv = () => {
    const rows = [["time", "actor", "action", "level"], ...shownLogs.map((l) => [l.time, l.actor, l.text, l.kind])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "audit-log.csv"; a.click(); URL.revokeObjectURL(a.href);
    say("Audit log exported");
  };

  /* notifications */
  const notifDirty = JSON.stringify(notif) !== JSON.stringify(savedNotif);
  const flip = (e, c) => setNotif((n) => ({ ...n, [e]: { ...n[e], [c]: !n[e][c] } }));
  const saveNotif = () => { setSavedNotif(notif); log("updated notification settings"); say("Notification settings saved"); };

  const counts = Object.keys(ROLES).map((r) => ({ role: r, n: users.filter((u) => u.role === r).length })).filter((x) => x.n);
  const failed = pipes.filter((p) => p.st === "failed").length;
  const openContent = content.filter((c) => c.st !== "published").length;
  const badge = { approvals: approvals.length, moderation: feedback.length + openContent, ops: failed };

  const PIPE = { running: [Loader2, "text-blue-600 animate-spin", "Running"], ok: [CheckCircle2, "text-emerald-600", "Done"], failed: [AlertTriangle, "text-red-600", "Failed"], paused: [Pause, "text-amber-600", "Paused"] };
  const stCls = { published: "bg-emerald-100 text-emerald-800", pending: "bg-amber-100 text-amber-800", flagged: "bg-red-100 text-red-800" };

  return (
    <div className="min-h-screen bg-slate-50 font-['Public_Sans',sans-serif] text-slate-800 lg:grid lg:grid-cols-[250px_1fr]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Public+Sans:wght@400;500;600&display=swap');`}</style>

      {/* sidebar (top bar on phones) */}
      <aside className="flex flex-col bg-[#0a1a44] text-white lg:sticky lg:top-0 lg:h-screen">
        <div className="flex items-center justify-between gap-2.5 p-4 lg:p-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600"><Landmark size={18} /></span>
            <div><p className="font-['Newsreader',serif] text-xl font-semibold leading-none">Bhoomi</p><p className="mt-1 text-xs text-blue-200">Admin control room</p></div>
          </div>
          <button onClick={onLogout} aria-label="Sign out" className="rounded-lg bg-white/10 p-2 hover:bg-white/20 lg:hidden"><LogOut size={16} /></button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {NAV.map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? "page" : undefined}
              className={cx("flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium", tab === id ? "bg-white/15 text-white" : "text-blue-100 hover:bg-white/10")}>
              <Icon size={17} />{label}
              {badge[id] > 0 && <span className="ml-auto rounded-full bg-blue-500 px-2 text-xs font-semibold">{badge[id]}</span>}
            </button>
          ))}
        </nav>
        <div className="hidden border-t border-white/10 p-4 lg:block">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-blue-200">{user.email}</p>
          <button onClick={onLogout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 py-2 text-sm font-semibold hover:bg-white/20"><LogOut size={15} />Sign out</button>
        </div>
      </aside>

      <main className="min-w-0 space-y-5 p-5 sm:p-8">
        <h1 className="font-['Newsreader',serif] text-3xl font-medium text-slate-900">{NAV.find((n) => n[0] === tab)[1]}</h1>

        {/* ===== overview ===== */}
        {tab === "overview" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Registered users", users.length, `${users.filter((u) => !u.on).length} suspended`, "users"],
                ["Awaiting approval", approvals.length, "institution and agency accounts", "approvals"],
                ["Failed pipelines", failed, failed ? "needs a retry" : "all healthy", "ops"],
                ["Open moderation items", feedback.length + openContent, "feedback and content", "moderation"],
              ].map(([l, v, n, t]) => (
                <button key={l} onClick={() => setTab(t)} className="rounded-xl bg-white p-4 text-left ring-1 ring-slate-200 hover:ring-blue-300">
                  <p className="text-sm text-slate-500">{l}</p><p className="mt-1 text-3xl font-semibold text-slate-900">{v}</p><p className="text-xs text-slate-500">{n}</p>
                </button>
              ))}
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              <Card title="Users by role">
                <div className="h-44">
                  <ResponsiveContainer><PieChart>
                    <Pie data={counts} dataKey="n" nameKey="role" innerRadius={46} outerRadius={76} paddingAngle={2} stroke="none">{counts.map((c) => <Cell key={c.role} fill={ROLES[c.role].hex} />)}</Pie>
                    <Tooltip formatter={(v, _n, p) => [v, ROLES[p.payload.role].label]} />
                  </PieChart></ResponsiveContainer>
                </div>
                <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  {counts.map((c) => <li key={c.role} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: ROLES[c.role].hex }} /><span className="truncate text-slate-600">{ROLES[c.role].label}</span><b className="ml-auto">{c.n}</b></li>)}
                </ul>
              </Card>
              <Card title="System health">
                {[["API uptime, 30 days", 99.94, "99.94%"], ["Database load", 38, "38%"], ["Object storage", 67, "6.7 of 10 TB"], ["Job queue", 22, "22 waiting"]].map(([l, v, t]) => (
                  <div key={l} className="mb-3 last:mb-0">
                    <div className="flex justify-between text-sm"><span>{l}</span><span className="text-slate-500">{t}</span></div>
                    <div className="mt-1 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${v}%` }} /></div>
                  </div>
                ))}
              </Card>
              <Card title="Recent activity" right={<Btn onClick={() => setTab("audit")}>View all</Btn>}>
                <ul className="space-y-2 text-sm">
                  {logs.slice(0, 5).map((l) => <li key={l.id} className="flex gap-2"><span className={cx("mt-1.5 h-2 w-2 shrink-0 rounded-full", dot[l.kind])} /><span className="min-w-0"><b className="font-medium">{l.actor}</b> <span className="text-slate-600">{l.text}</span></span></li>)}
                </ul>
              </Card>
            </div>
          </>
        )}

        {/* ===== approvals ===== */}
        {tab === "approvals" && (
          <Card title="Pending requests">
            {approvals.length === 0 ? <Empty>Nothing waiting. New institution and agency requests will show up here.</Empty> : (
              <ul className="divide-y divide-slate-100">
                {approvals.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0"><p className="font-medium text-slate-900">{a.name} <Pill role={a.role} /></p><p className="text-sm text-slate-600">{a.org}</p><p className="text-xs text-slate-500">{a.note}</p></div>
                    <div className="flex gap-2"><Btn kind="danger" onClick={() => decide(a, false)}><X size={15} />Reject</Btn><Btn kind="primary" onClick={() => decide(a, true)}><Check size={15} />Approve</Btn></div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {/* ===== users ===== */}
        {tab === "users" && (
          <Card title={`All users (${shownUsers.length})`} right={<Btn kind="primary" onClick={() => openForm("invite")}><Plus size={15} />Invite user</Btn>}>
            <div className="mb-4 flex flex-wrap gap-3">
              <div className="relative min-w-[200px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Search users" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" className={cx(inp, "pl-9")} /></div>
              <select aria-label="Filter by role" value={roleF} onChange={(e) => setRoleF(e.target.value)} className={cx(inp, "w-auto")}><option value="all">All roles</option>{Object.keys(ROLES).map((r) => <option key={r} value={r}>{ROLES[r].label}</option>)}</select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead><tr><th className={th}>Name</th><th className={th}>Role</th><th className={th}>Status</th><th className={th} /></tr></thead>
                <tbody>
                  {shownUsers.map((u) => (
                    <tr key={u.id} className="border-t border-slate-100">
                      <td className={td}><p className="font-medium text-slate-900">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></td>
                      <td className={td}><select aria-label={`Role for ${u.name}`} value={u.role} disabled={u.email === user.email} onChange={(e) => setRole(u, e.target.value)} className={cx(inp, "w-auto py-1.5")}>{Object.keys(ROLES).map((r) => <option key={r} value={r}>{ROLES[r].label}</option>)}</select></td>
                      <td className={td}><span className={cx("rounded-full px-2 py-0.5 text-xs font-semibold", u.on ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600")}>{u.on ? "Active" : "Suspended"}</span></td>
                      <td className={cx(td, "text-right")}><div className="flex justify-end gap-2">
                        <Btn onClick={() => toggleUser(u)}>{u.on ? <><Ban size={14} />Suspend</> : <><RefreshCw size={14} />Reactivate</>}</Btn>
                        <Btn kind="danger" aria-label={`Remove ${u.name}`} onClick={() => removeUser(u)}><Trash2 size={14} /></Btn>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {shownUsers.length === 0 && <Empty>No users match. Clear the search or change the role filter.</Empty>}
            </div>
          </Card>
        )}

        {/* ===== access and data ===== */}
        {tab === "access" && (
          <>
            <Card title="Role permissions" right={<div className="flex gap-2">{permsDirty && <Btn onClick={() => setPerms(savedPerms)}>Discard</Btn>}<Btn kind="primary" disabled={!permsDirty} onClick={savePerms}>Save changes</Btn></div>}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead><tr><th className={th}>Feature</th>{PR.map((r) => <th key={r} className="pb-2 text-center text-xs font-semibold text-slate-600"><span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: ROLES[r].hex }} />{ROLES[r].label}</span></th>)}<th className="pb-2 text-center text-xs font-semibold text-slate-600">Admin</th></tr></thead>
                  <tbody>{FEATURES.map((f) => (
                    <tr key={f} className="border-t border-slate-100"><td className={cx(td, "font-medium text-slate-900")}>{f}</td>
                      {PR.map((r) => <td key={r} className="py-2.5 text-center"><Switch on={perms[f].includes(r)} onChange={() => toggle(f, r)} label={`${f} for ${ROLES[r].label}`} /></td>)}
                      <td className="py-2.5 text-center"><Lock size={15} className="mx-auto text-slate-400" aria-label="Admin always has access" /></td></tr>
                  ))}</tbody>
                </table>
              </div>
            </Card>
            <Card title="Data catalogue and dataset access">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead><tr><th className={th}>Dataset</th><th className={th}>Owner</th><th className={th}>Quality</th><th className={th}>Access</th></tr></thead>
                  <tbody>{datasets.map((d) => (
                    <tr key={d.id} className="border-t border-slate-100"><td className={cx(td, "font-medium text-slate-900")}>{d.name}</td><td className={td}>{d.owner}</td>
                      <td className={td}><span className={cx("font-semibold", d.q >= 90 ? "text-emerald-700" : d.q >= 80 ? "text-amber-700" : "text-red-700")}>{d.q}%</span></td>
                      <td className={td}><select aria-label={`Access for ${d.name}`} value={d.access} onChange={(e) => setAccess(d, e.target.value)} className={cx(inp, "w-auto py-1.5")}><option value="public">Public</option><option value="restricted">Restricted (logged-in roles)</option><option value="private">Private (owner and admin)</option></select></td></tr>
                  ))}</tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-slate-500">Dataset access always overrides the role grid above.</p>
            </Card>
          </>
        )}

        {/* ===== API keys ===== */}
        {tab === "keys" && (
          <Card title="Keys" right={<Btn kind="primary" onClick={() => openForm("key")}><Plus size={15} />Create key</Btn>}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead><tr><th className={th}>Name</th><th className={th}>Role scope</th><th className={th}>Key</th><th className={th}>Created</th><th className={th}>Status</th><th className={th} /></tr></thead>
                <tbody>{keys.map((k) => (
                  <tr key={k.id} className="border-t border-slate-100"><td className={cx(td, "font-medium text-slate-900")}>{k.name}</td><td className={td}><Pill role={k.role} /></td>
                    <td className={cx(td, "font-mono text-xs")}>{k.key}</td><td className={td}>{k.made}</td>
                    <td className={td}><span className={cx("rounded-full px-2 py-0.5 text-xs font-semibold", k.on ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600")}>{k.on ? "Active" : "Revoked"}</span></td>
                    <td className={cx(td, "text-right")}><div className="flex justify-end gap-2"><Btn onClick={() => rotate(k)}><RotateCcw size={14} />Rotate</Btn><Btn kind="danger" disabled={!k.on} onClick={() => revoke(k)}>Revoke</Btn></div></td></tr>
                ))}</tbody>
              </table>
              {keys.length === 0 && <Empty>No keys yet. Create one for a connector or partner.</Empty>}
            </div>
          </Card>
        )}

        {/* ===== moderation ===== */}
        {tab === "moderation" && (
          <Card title="Review queue" right={
            <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm font-semibold">
              {[["repo", `Repository (${content.length})`], ["fb", `Feedback (${feedback.length})`]].map(([id, l]) => <button key={id} onClick={() => setModTab(id)} className={cx("rounded-md px-3 py-1.5", modTab === id ? "bg-white text-blue-800 shadow" : "text-slate-600")}>{l}</button>)}
            </div>}>
            {modTab === "repo" ? (content.length === 0 ? <Empty>Repository is empty.</Empty> : (
              <ul className="divide-y divide-slate-100">{content.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0"><p className="font-medium text-slate-900">{c.title}</p><p className="text-xs text-slate-500">{c.by} <span className={cx("ml-2 rounded-full px-2 py-0.5 font-semibold", stCls[c.st])}>{c.st}</span></p></div>
                  <div className="flex gap-2">{c.st !== "published" && <Btn kind="primary" onClick={() => setSt(c, "published")}>Publish</Btn>}{c.st !== "flagged" && <Btn onClick={() => setSt(c, "flagged")}><Flag size={14} />Flag</Btn>}<Btn kind="danger" aria-label={`Remove ${c.title}`} onClick={() => dropContent(c)}><Trash2 size={14} /></Btn></div>
                </li>))}</ul>
            )) : (feedback.length === 0 ? <Empty>Queue is clear.</Empty> : (
              <ul className="space-y-3">{feedback.map((f) => (
                <li key={f.id} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-600">{f.kind} · {f.by}</p><p className="mt-1 text-sm">{f.text}</p>
                  <div className="mt-2 flex gap-2"><Btn onClick={() => closeFb(f, "resolved")}><Check size={14} />Resolve</Btn><Btn onClick={() => closeFb(f, "dismissed")}>Dismiss</Btn></div>
                </li>))}</ul>
            ))}
          </Card>
        )}

        {/* ===== pipelines and backups ===== */}
        {tab === "ops" && (
          <div className="grid gap-5 lg:grid-cols-2">
            <Card title="Data pipelines">
              <ul className="space-y-4">{pipes.map((p) => {
                const [I, c, l] = PIPE[p.st];
                return (
                  <li key={p.id}>
                    <div className="flex items-start gap-3">
                      <I size={18} className={cx("mt-0.5 shrink-0", c)} />
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-900">{p.name}</p><p className="text-xs text-slate-500">{l}: {p.meta}</p></div>
                      {p.st === "running" && <Btn onClick={() => pipe(p, "paused", {}, "paused")}><Pause size={13} />Pause</Btn>}
                      {p.st === "paused" && <Btn onClick={() => pipe(p, "running", {}, "resumed")}><Play size={13} />Resume</Btn>}
                      {p.st === "ok" && <Btn onClick={() => pipe(p, "running", { pct: 0, meta: "Manual run" }, "started")}><Play size={13} />Run now</Btn>}
                      {p.st === "failed" && <Btn kind="danger" onClick={() => pipe(p, "running", { pct: 0, meta: "Retrying" }, "retried")}><RotateCcw size={13} />Retry</Btn>}
                    </div>
                    {(p.st === "running" || p.st === "paused") && <div className="ml-[30px] mt-2 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-blue-600 transition-all" style={{ width: `${p.pct}%` }} /></div>}
                  </li>
                );
              })}</ul>
            </Card>
            <Card title="Backups" right={<Btn kind="primary" disabled={backingUp} onClick={backupNow}>{backingUp ? <><Loader2 size={15} className="animate-spin" />Backing up</> : <><HardDrive size={15} />Back up now</>}</Btn>}>
              {backups.length === 0 ? <Empty>No backups. Run one now.</Empty> : (
                <ul className="divide-y divide-slate-100">{backups.map((b) => (
                  <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                    <div><p className="text-sm font-medium text-slate-900">{b.when}</p><p className="text-xs text-slate-500">{b.kind} · {b.size}</p></div>
                    <div className="flex gap-2"><Btn onClick={() => restore(b)}>Restore</Btn><Btn kind="danger" aria-label={`Delete backup ${b.when}`} onClick={() => dropBackup(b)}><Trash2 size={14} /></Btn></div>
                  </li>))}</ul>
              )}
            </Card>
          </div>
        )}

        {/* ===== audit ===== */}
        {tab === "audit" && (
          <Card title="Activity stream" right={
            <div className="flex flex-wrap gap-2">
              <Btn onClick={() => setLive(!live)}>{live ? <><Pause size={14} />Pause</> : <><Play size={14} />Resume</>}<span className={cx("h-2 w-2 rounded-full", live ? "animate-pulse bg-emerald-500" : "bg-slate-300")} /></Btn>
              <Btn onClick={exportCsv}><Download size={14} />Export CSV</Btn>
              <Btn kind="danger" onClick={() => ask("Clear view", "This clears the list on screen. Stored audit records are not deleted.", () => { setLogs([]); say("View cleared"); })}>Clear view</Btn>
            </div>}>
            <div className="mb-4 flex flex-wrap gap-3">
              <div className="relative min-w-[200px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Search log" value={logQ} onChange={(e) => setLogQ(e.target.value)} placeholder="Search actor or action" className={cx(inp, "pl-9")} /></div>
              <select aria-label="Filter by level" value={logK} onChange={(e) => setLogK(e.target.value)} className={cx(inp, "w-auto")}><option value="all">All levels</option><option value="info">Info</option><option value="ok">Success</option><option value="warn">Warning</option></select>
            </div>
            {shownLogs.length === 0 ? <Empty>No entries match.</Empty> : (
              <ul className="max-h-[28rem] space-y-1 overflow-y-auto pr-1 text-sm">{shownLogs.map((l) => (
                <li key={l.id} className="flex items-start gap-3 rounded-md px-2 py-1.5 odd:bg-slate-50"><span className={cx("mt-1.5 h-2 w-2 shrink-0 rounded-full", dot[l.kind])} /><span className="w-16 shrink-0 text-xs tabular-nums text-slate-500">{l.time}</span><span className="min-w-0"><b className="font-medium text-slate-900">{l.actor}</b> <span className="text-slate-600">{l.text}</span></span></li>))}</ul>
            )}
          </Card>
        )}

        {/* ===== notifications ===== */}
        {tab === "notify" && (
          <Card title="Admin alerts" right={<div className="flex gap-2">{notifDirty && <Btn onClick={() => setNotif(savedNotif)}>Discard</Btn>}<Btn kind="primary" disabled={!notifDirty} onClick={saveNotif}>Save changes</Btn></div>}>
            <table className="w-full max-w-xl text-sm">
              <thead><tr><th className={th}>Send me an alert for</th><th className="pb-2 text-center text-xs font-semibold text-slate-500">In app</th><th className="pb-2 text-center text-xs font-semibold text-slate-500">Email</th></tr></thead>
              <tbody>{EVENTS.map((e) => (
                <tr key={e} className="border-t border-slate-100"><td className={cx(td, "font-medium text-slate-900")}>{e}</td>
                  <td className="py-2.5 text-center"><Switch on={notif[e].app} onChange={() => flip(e, "app")} label={`${e}, in app`} /></td>
                  <td className="py-2.5 text-center"><Switch on={notif[e].email} onChange={() => flip(e, "email")} label={`${e}, email`} /></td></tr>))}</tbody>
            </table>
          </Card>
        )}
      </main>

      {/* ===== dialogs ===== */}
      {modal && (modal.type === "invite" || modal.type === "key") && (
        <Modal title={modal.type === "invite" ? "Invite user" : "Create API key"} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <label className="block text-sm font-medium">{modal.type === "invite" ? "Full name" : "Key name"}<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={cx(inp, "mt-1")} autoFocus /></label>
            {modal.type === "invite" && <label className="block text-sm font-medium">Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={cx(inp, "mt-1")} /></label>}
            <label className="block text-sm font-medium">{modal.type === "invite" ? "Role" : "Role scope"}<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={cx(inp, "mt-1")}>{Object.keys(ROLES).filter((r) => modal.type === "invite" || r !== "public").map((r) => <option key={r} value={r}>{ROLES[r].label}</option>)}</select></label>
          </div>
          <div className="mt-5 flex justify-end gap-2"><Btn onClick={() => setModal(null)}>Cancel</Btn><Btn kind="primary" onClick={modal.type === "invite" ? invite : createKey}>{modal.type === "invite" ? "Send invite" : "Create key"}</Btn></div>
        </Modal>
      )}
      {modal?.type === "reveal" && (
        <Modal title="Copy your key now" onClose={() => setModal(null)}>
          <p className="text-sm text-slate-600">This is the only time the full key for "{modal.name}" is shown.</p>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-100 p-3"><code className="min-w-0 flex-1 break-all text-xs">{modal.key}</code><Btn onClick={() => copy(modal.key)}><Copy size={14} />Copy</Btn></div>
          <div className="mt-5 flex justify-end"><Btn kind="primary" onClick={() => setModal(null)}>Done</Btn></div>
        </Modal>
      )}
      {confirm && (
        <Modal title={confirm.title} onClose={() => setConfirm(null)}>
          <p className="text-sm text-slate-600">{confirm.body}</p>
          <div className="mt-5 flex justify-end gap-2"><Btn onClick={() => setConfirm(null)}>Cancel</Btn><Btn kind="dark" onClick={() => { confirm.onOk(); setConfirm(null); }}>Confirm</Btn></div>
        </Modal>
      )}
      {toast && <div role="status" className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">{toast}</div>}
    </div>
  );
}
