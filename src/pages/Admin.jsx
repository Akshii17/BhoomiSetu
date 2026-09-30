import { useEffect, useRef, useState } from "react";
import {
  LogOut, ShieldCheck, Activity, Workflow, HardDrive, MessageSquareWarning, Check, X,
  Pause, Play, CheckCircle2, AlertTriangle, Loader2, Lock, RotateCcw, Save, Users,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area } from "recharts";
import { ROLES } from "../roles";

/* ---------- mock data (replace with API calls) ---------- */
const APPROVALS = [
  { id: 1, name: "Dr. Meera Iyer", org: "IIT Bombay, Dept. of Civil Engineering", role: "academic", note: "Institution account with 42 members" },
  { id: 2, name: "R. K. Sharma", org: "Revenue Dept., Government of Rajasthan", role: "agency", note: "Wants to connect the state Bhulekh API" },
  { id: 3, name: "Ananya Rao", org: "Independent researcher, Bengaluru", role: "researcher", note: "Requests dataset upload rights" },
  { id: 4, name: "TerraSense Analytics", org: "Pune", role: "industry", note: "Remote sensing startup, pilot partner" },
];

const USER_COUNTS = [
  { role: "public", n: 5820 }, { role: "researcher", n: 1240 }, { role: "policymaker", n: 186 },
  { role: "agency", n: 312 }, { role: "academic", n: 94 }, { role: "industry", n: 158 }, { role: "admin", n: 6 },
];

const PIPELINES = [
  { name: "ULPIN land records sync", state: "running", meta: "Maharashtra, 68%" },
  { name: "Sentinel-2 imagery ingest", state: "ok", meta: "Finished 06:10, 412 tiles" },
  { name: "Census socio-economic load", state: "ok", meta: "Finished 04:45, 1.2M rows" },
  { name: "Bhulekh Rajasthan connector", state: "failed", meta: "Timeout after 3 retries" },
  { name: "Document OCR and embeddings", state: "running", meta: "231 of 480 PDFs" },
];

const FEEDBACK = [
  { id: 1, kind: "Wrong data", text: "Dispute count for Nashik district looks doubled in 2024.", by: "Public user" },
  { id: 2, kind: "Map error", text: "Forest layer overlaps a village boundary near Wayanad.", by: "Researcher" },
  { id: 3, kind: "Document issue", text: "Policy PDF opens blank after upload.", by: "Government agency" },
  { id: 4, kind: "Feature request", text: "Add Marathi to the language toggle.", by: "Public user" },
];

const FEATURES = [
  "Repository upload", "AI assistant", "GIS maps", "Analytics", "Policy simulation",
  "Workspaces", "Innovation portal", "Reports export", "API access",
];
const PERM_ROLES = ["public", "researcher", "policymaker", "agency", "academic", "industry"];
const DEFAULT_PERMS = {
  "Repository upload": ["researcher", "agency", "academic"],
  "AI assistant": PERM_ROLES,
  "GIS maps": PERM_ROLES,
  Analytics: ["researcher", "policymaker", "agency", "academic", "industry"],
  "Policy simulation": ["researcher", "policymaker", "agency"],
  Workspaces: ["researcher", "policymaker", "agency", "academic", "industry"],
  "Innovation portal": PERM_ROLES,
  "Reports export": PERM_ROLES,
  "API access": ["researcher", "agency", "academic", "industry"],
};

const LOG_POOL = [
  ["r.sharma@rajasthan.gov.in", "uploaded cadastral_jaipur_v3.gpkg", "info"],
  ["ananya@demo.in", "ran land-use change analysis, Pune district", "info"],
  ["policy.desk@dolr.gov.in", "started simulation: irrigation subsidy reform", "info"],
  ["api-key ***4f2a", "exceeded rate limit on /datasets", "warn"],
  ["unknown (203.0.113.7)", "3 failed sign-in attempts", "warn"],
  ["admin@bhoomi.in", "rotated an API key", "ok"],
  ["pipeline:ulpin-sync", "wrote 18,204 parcels to PostGIS", "ok"],
  ["meera@iitb.ac.in", "created workspace Coastal Erosion 2026", "info"],
];

const SPARK = {
  api: [99.9, 99.8, 99.9, 100, 99.7, 99.9, 99.95, 99.9, 99.98, 99.94].map((v, i) => ({ i, v })),
  jobs: [3, 5, 4, 6, 5, 7, 4, 5, 6, 5].map((v, i) => ({ i, v })),
  disk: [61, 62, 62, 63, 64, 64, 65, 66, 66, 67].map((v, i) => ({ i, v })),
  fb: [9, 7, 8, 6, 7, 5, 6, 5, 4, 4].map((v, i) => ({ i, v })),
};

const ACCENT = ROLES.admin.hex;
const stamp = () => new Date().toLocaleTimeString("en-IN", { hour12: false });
const tone = { info: "bg-slate-400", ok: "bg-emerald-500", warn: "bg-amber-500", err: "bg-red-500" };

/* ---------- small pieces ---------- */
function Card({ title, right, children, className = "" }) {
  return (
    <section className={`rounded-xl bg-white ring-1 ring-slate-200 ${className}`}>
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
        <h2 className="font-['Newsreader',serif] text-lg font-semibold text-slate-900">{title}</h2>
        {right}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Kpi({ icon: Icon, label, value, note, data, color }) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <div className="flex items-center gap-2 text-sm text-slate-500"><Icon size={16} />{label}</div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div>
          <p className="text-2xl font-semibold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{note}</p>
        </div>
        <div className="h-10 w-24">
          <ResponsiveContainer>
            <AreaChart data={data}>
              <Area type="monotone" dataKey="v" stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Switch({ on, onChange, label, disabled }) {
  return (
    <button
      role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 ${on ? "bg-slate-700" : "bg-slate-300"} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

const PIPE_STYLE = {
  running: { icon: Loader2, cls: "text-blue-600", spin: true, label: "Running" },
  ok: { icon: CheckCircle2, cls: "text-emerald-600", label: "Done" },
  failed: { icon: AlertTriangle, cls: "text-red-600", label: "Failed" },
};

/* ---------- page ---------- */
export default function Admin({ user, onLogout }) {
  const [approvals, setApprovals] = useState(APPROVALS);
  const [feedback, setFeedback] = useState(FEEDBACK);
  const [pipes, setPipes] = useState(PIPELINES);
  const [perms, setPerms] = useState(DEFAULT_PERMS);
  const [saved, setSaved] = useState(DEFAULT_PERMS);
  const [logs, setLogs] = useState(() => LOG_POOL.slice(0, 5).map(([a, t, k], i) => ({ id: i, time: stamp(), actor: a, text: t, kind: k })));
  const [live, setLive] = useState(true);
  const [toast, setToast] = useState("");
  const nextId = useRef(100);

  const addLog = (actor, text, kind = "info") =>
    setLogs((l) => [{ id: nextId.current++, time: stamp(), actor, text, kind }, ...l].slice(0, 30));

  const say = (m) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  // simulated live audit stream
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => {
      const [a, x, k] = LOG_POOL[Math.floor(Math.random() * LOG_POOL.length)];
      addLog(a, x, k);
    }, 3000);
    return () => clearInterval(t);
  }, [live]);

  const decide = (a, ok) => {
    setApprovals((l) => l.filter((x) => x.id !== a.id));
    addLog(user.email, `${ok ? "approved" : "rejected"} ${ROLES[a.role].label.toLowerCase()} account for ${a.name}`, ok ? "ok" : "warn");
    say(ok ? `Approved ${a.name}` : `Rejected ${a.name}`);
  };

  const resolve = (f, verb) => {
    setFeedback((l) => l.filter((x) => x.id !== f.id));
    addLog(user.email, `${verb} feedback: ${f.kind.toLowerCase()}`, "info");
    say(`Feedback ${verb}`);
  };

  const retry = (name) => {
    setPipes((p) => p.map((x) => (x.name === name ? { ...x, state: "running", meta: "Retrying, 0%" } : x)));
    addLog(user.email, `retried pipeline ${name}`, "info");
  };

  const toggle = (feature, role) =>
    setPerms((p) => ({ ...p, [feature]: p[feature].includes(role) ? p[feature].filter((r) => r !== role) : [...p[feature], role] }));

  const dirty = JSON.stringify(perms) !== JSON.stringify(saved);
  const save = () => { setSaved(perms); addLog(user.email, "updated the role-permission grid", "warn"); say("Permissions saved"); };

  const total = USER_COUNTS.reduce((s, x) => s + x.n, 0);
  const failed = pipes.filter((p) => p.state === "failed").length;

  return (
    <div className="min-h-screen bg-slate-100 font-['Public_Sans',sans-serif] text-slate-800">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Public+Sans:wght@400;500;600&display=swap');`}</style>

      <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 text-white sm:px-8" style={{ background: ACCENT }}>
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15"><ShieldCheck size={20} /></span>
          <div>
            <p className="font-['Newsreader',serif] text-xl font-semibold leading-tight">Control room</p>
            <p className="text-xs text-slate-300">{user.name} · {user.email}</p>
          </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25">
          <LogOut size={16} /> Sign out
        </button>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 p-5 sm:p-8">
        {/* status strip */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi icon={Activity} label="API uptime, 30 days" value="99.94%" note="2 short incidents" data={SPARK.api} color="#059669" />
          <Kpi icon={Workflow} label="Pipeline jobs today" value={pipes.length} note={failed ? `${failed} failed, needs a retry` : "All healthy"} data={SPARK.jobs} color={failed ? "#dc2626" : "#2563eb"} />
          <Kpi icon={HardDrive} label="Object storage used" value="6.7 TB" note="of 10 TB · last backup 02:00" data={SPARK.disk} color="#d97706" />
          <Kpi icon={MessageSquareWarning} label="Open feedback" value={feedback.length} note={`${approvals.length} accounts awaiting approval`} data={SPARK.fb} color="#7c3aed" />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* approvals */}
          <Card title="Pending approvals" right={<span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold">{approvals.length}</span>} className="lg:col-span-2">
            {approvals.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">Nothing waiting. New institution and agency requests will show up here.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {approvals.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">
                        {a.name}
                        <span className="ml-2 rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ background: ROLES[a.role].hex }}>{ROLES[a.role].label}</span>
                      </p>
                      <p className="truncate text-sm text-slate-600">{a.org}</p>
                      <p className="text-xs text-slate-500">{a.note}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => decide(a, false)} className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"><X size={15} />Reject</button>
                      <button onClick={() => decide(a, true)} className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-900"><Check size={15} />Approve</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* users by role */}
          <Card title="Users by role" right={<span className="flex items-center gap-1 text-xs text-slate-500"><Users size={14} />{total.toLocaleString("en-IN")}</span>}>
            <div className="h-44">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={USER_COUNTS} dataKey="n" nameKey="role" innerRadius={48} outerRadius={78} paddingAngle={2} stroke="none">
                    {USER_COUNTS.map((u) => <Cell key={u.role} fill={ROLES[u.role].hex} />)}
                  </Pie>
                  <Tooltip formatter={(v, _n, p) => [v.toLocaleString("en-IN"), ROLES[p.payload.role].label]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              {USER_COUNTS.map((u) => (
                <li key={u.role} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: ROLES[u.role].hex }} />
                  <span className="truncate text-slate-600">{ROLES[u.role].label}</span>
                  <span className="ml-auto font-medium">{u.n.toLocaleString("en-IN")}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* pipelines */}
          <Card title="Data pipelines">
            <ul className="space-y-3">
              {pipes.map((p) => {
                const s = PIPE_STYLE[p.state];
                return (
                  <li key={p.name} className="flex items-start gap-3">
                    <s.icon size={18} className={`mt-0.5 shrink-0 ${s.cls} ${s.spin ? "animate-spin" : ""}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">{s.label}: {p.meta}</p>
                    </div>
                    {p.state === "failed" && (
                      <button onClick={() => retry(p.name)} className="flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-50"><RotateCcw size={12} />Retry</button>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* audit log */}
          <Card
            title="Audit log"
            className="lg:col-span-2"
            right={
              <button onClick={() => setLive(!live)} className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium hover:bg-slate-50">
                {live ? <><Pause size={13} />Pause</> : <><Play size={13} />Resume</>}
                <span className={`h-2 w-2 rounded-full ${live ? "animate-pulse bg-emerald-500" : "bg-slate-300"}`} />
              </button>
            }
          >
            <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-1 text-sm" aria-live="off">
              {logs.map((l) => (
                <li key={l.id} className="flex items-start gap-3 rounded-md px-2 py-1.5 odd:bg-slate-50">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${tone[l.kind]}`} />
                  <span className="w-16 shrink-0 tabular-nums text-xs text-slate-500">{l.time}</span>
                  <span className="min-w-0"><span className="font-medium text-slate-900">{l.actor}</span> <span className="text-slate-600">{l.text}</span></span>
                </li>
              ))}
            </ul>
          </Card>

          {/* moderation */}
          <Card title="Feedback and moderation" className="lg:col-span-1">
            {feedback.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">Queue is clear.</p>
            ) : (
              <ul className="space-y-3">
                {feedback.map((f) => (
                  <li key={f.id} className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-600">{f.kind} · {f.by}</p>
                    <p className="mt-1 text-sm text-slate-800">{f.text}</p>
                    <div className="mt-2 flex gap-3 text-xs font-semibold">
                      <button onClick={() => resolve(f, "resolved")} className="text-emerald-700 hover:underline">Resolve</button>
                      <button onClick={() => resolve(f, "dismissed")} className="text-slate-500 hover:underline">Dismiss</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* role-permission grid: the signature widget */}
          <Card
            title="Role permissions"
            className="lg:col-span-3"
            right={
              <div className="flex items-center gap-2">
                {dirty && <button onClick={() => setPerms(saved)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">Discard</button>}
                <button onClick={save} disabled={!dirty} className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40">
                  <Save size={15} />Save changes
                </button>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="pb-3 pr-4 font-medium text-slate-500">Feature</th>
                    {PERM_ROLES.map((r) => (
                      <th key={r} className="pb-3 text-center">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: ROLES[r].hex }} />{ROLES[r].label}
                        </span>
                      </th>
                    ))}
                    <th className="pb-3 text-center text-xs font-semibold text-slate-700">Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map((f) => (
                    <tr key={f} className="border-t border-slate-100">
                      <td className="py-2.5 pr-4 font-medium text-slate-900">{f}</td>
                      {PERM_ROLES.map((r) => (
                        <td key={r} className="py-2.5 text-center">
                          <Switch on={perms[f].includes(r)} onChange={() => toggle(f, r)} label={`${f} for ${ROLES[r].label}`} />
                        </td>
                      ))}
                      <td className="py-2.5 text-center"><Lock size={15} className="mx-auto text-slate-400" aria-label="Admin always has access" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Dataset-level rules (public or restricted) are set in the data catalogue and always override this grid.
            </p>
          </Card>
        </div>
      </main>

      {toast && (
        <div role="status" className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}