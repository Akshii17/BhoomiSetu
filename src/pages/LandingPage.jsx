import { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Landmark, LogIn, UserPlus, Mail, Lock, User, Building2, Search, Lock as LockIcon, ArrowRight, X, Sparkles, Ruler, Hexagon, Flame, SplitSquareHorizontal, RotateCcw, CircleDot, Send, Layers, FileText, Menu } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ROLES, REGISTERABLE } from "../roles";
import { STUDIES, FACETS, REGIONS, HIGHWAYS, RAIL, MAP_LAYERS } from "../data/studies";

const G = "#1f3d2b", GOLD = "#b8923a", INK = "#26282b", LINEN = "#f4efe6";
const serif = "font-['Newsreader',serif]";
const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
const ACCESS_STYLE = { Open: "bg-[#e3ecdf] text-[#1f3d2b]", Registered: "bg-[#f3e8c9] text-[#6b5216]", Restricted: "bg-[#ecd9d9] text-[#7a2a33]" };

/* ---------------- Login / Register modal (existing demo logic kept) ---------------- */
function AuthModal({ initial, onClose }) {
  const nav = useNavigate();
  const [tab, setTab] = useState(initial);
  const [err, setErr] = useState("");
  const [f, setF] = useState({ name: "", email: "", org: "", password: "", role: "researcher" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  useEffect(() => { const h = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  function submit(e) {
    e.preventDefault();
    if (!f.email.trim() || !f.password.trim() || (tab === "register" && !f.name.trim())) return setErr("Fill in all required fields.");
    nav(ROLES[f.role].path); // DEMO ONLY: straight to the chosen role's experience
  }
  const field = "w-full rounded-lg border border-stone-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#1f3d2b] focus:ring-2 focus:ring-[#1f3d2b]/15";
  const Ic = ({ I }) => <I size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#26282b]/60 p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl border-t-4 border-[#b8923a] bg-[#faf7f1] p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className={`${serif} text-2xl font-semibold text-[#1f3d2b]`}>{tab === "login" ? "Sign in to Bhoomi" : "Create your account"}</h2>
            <p className="mt-1 text-sm text-stone-600">Analyse, generate insights and act in your role-specific workspace.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-stone-500 hover:bg-stone-200"><X size={18} /></button>
        </div>
        <div className="mt-5 grid grid-cols-2 rounded-lg bg-stone-200 p-1 text-sm font-medium">
          {["login", "register"].map((t) => (
            <button key={t} onClick={() => { setTab(t); setErr(""); }} className={`rounded-md py-2 ${tab === t ? "bg-white text-[#1f3d2b] shadow-sm" : "text-stone-600"}`}>{t === "login" ? "Login" : "Register"}</button>
          ))}
        </div>
        <form onSubmit={submit} className="mt-5 space-y-3">
          {tab === "register" && <>
            <div className="relative"><Ic I={User} /><input className={field} placeholder="Full name" value={f.name} onChange={set("name")} /></div>
            <div className="relative"><Ic I={Building2} /><input className={field} placeholder="Organisation (optional)" value={f.org} onChange={set("org")} /></div>
          </>}
          <div className="relative"><Ic I={Mail} /><input type="email" className={field} placeholder="Email" value={f.email} onChange={set("email")} /></div>
          <div className="relative"><Ic I={Lock} /><input type="password" className={field} placeholder="Password" value={f.password} onChange={set("password")} /></div>
          <select className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm" value={f.role} onChange={set("role")} aria-label="Role">
            {(tab === "register" ? REGISTERABLE : Object.keys(ROLES)).map((r) => <option key={r} value={r}>{ROLES[r].label}</option>)}
          </select>
          {err && <p className="text-sm text-[#8c2f39]" role="alert">{err}</p>}
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1f3d2b] py-2.5 font-medium text-white hover:bg-[#2a5239]">
            {tab === "login" ? <LogIn size={16} /> : <UserPlus size={16} />}{tab === "login" ? "Login" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Study Repository ---------------- */
function Repository() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("relevance");
  const [sel, setSel] = useState({ type: [], year: [], geo: [], source: [], access: [] });
  const toggle = (k, v) => setSel((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));
  const list = useMemo(() => {
    const t = q.toLowerCase().split(/\s+/).filter(Boolean);
    const known = FACETS.source.slice(0, -1);
    const out = STUDIES.filter((s) => {
      const hay = `${s.title} ${s.id} ${s.sum} ${s.tags} ${s.geo} ${s.source} ${s.type}`.toLowerCase();
      if (!t.every((w) => hay.includes(w))) return false;
      return Object.entries(sel).every(([k, vals]) => !vals.length || vals.some((v) => (k === "source" && v === "Other" ? !known.includes(s.source) : s[k] === v)));
    });
    return out.sort((a, b) => sort === "year" ? b.year - a.year : sort === "title" ? a.title.localeCompare(b.title) : b.score - a.score);
  }, [q, sel, sort]);
  const active = Object.values(sel).flat().length;
  return (
    <section id="repository" className="scroll-mt-16 bg-[#faf7f1] px-5 py-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold text-[#b8923a]">Public Study Repository</p>
        <h2 className={`${serif} mt-1 text-4xl font-semibold text-[#1f3d2b]`}>Discover what the evidence says</h2>
        <p className="mt-2 max-w-2xl text-stone-600">Research papers, policy briefs, datasets and case studies on land and geospatial governance, open to everyone. Each result carries an AI relevance score and summary.</p>
        <div className="mt-8 grid gap-6 lg:grid-cols-[250px_1fr]">
          <aside className="h-fit rounded-xl border border-stone-300 bg-white p-4">
            <div className="flex items-center justify-between"><h3 className="font-semibold text-[#26282b]">Filters</h3>
              {active > 0 && <button className="text-xs text-[#8c2f39] underline" onClick={() => setSel({ type: [], year: [], geo: [], source: [], access: [] })}>Clear ({active})</button>}</div>
            {[["type", "Study type"], ["year", "Year"], ["geo", "Geography"], ["source", "Source"], ["access", "Access level"]].map(([k, label]) => (
              <fieldset key={k} className="mt-4 border-t border-stone-200 pt-3">
                <legend className="text-sm font-semibold text-[#1f3d2b]">{label}</legend>
                {FACETS[k].map((v) => (
                  <label key={v} className="mt-1.5 flex cursor-pointer items-center gap-2 text-sm text-stone-700">
                    <input type="checkbox" className="accent-[#1f3d2b]" checked={sel[k].includes(v)} onChange={() => toggle(k, v)} />{v}
                  </label>
                ))}
              </fieldset>
            ))}
          </aside>
          <div>
            <div className="flex flex-wrap gap-3">
              <div className="relative min-w-60 flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search studies, e.g. flood risk Odisha, land records, urban expansion" className="w-full rounded-lg border border-stone-300 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#1f3d2b] focus:ring-2 focus:ring-[#1f3d2b]/15" />
              </div>
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort" className="rounded-lg border border-stone-300 bg-white px-3 text-sm">
                <option value="relevance">Sort: AI relevance</option><option value="year">Sort: Newest</option><option value="title">Sort: Title A–Z</option>
              </select>
            </div>
            <p className="mt-3 text-sm text-stone-600" aria-live="polite">{list.length} of {STUDIES.length} studies</p>
            <ul className="mt-3 space-y-3">
              {list.map((s) => (
                <li key={s.id} className="rounded-xl border border-stone-300 bg-white p-5 transition hover:border-[#1f3d2b]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className={`${serif} text-xl font-semibold leading-snug text-[#26282b]`}>{s.title}</h3>
                      <p className="mt-1 text-xs text-stone-500">{s.id} · {s.type} · {s.geo} · {s.year} · {s.source}</p>
                    </div>
                    <div className="text-right"><div className="text-2xl font-semibold text-[#1f3d2b]">{s.score}</div><div className="text-xs text-stone-500">AI relevance</div></div>
                  </div>
                  <p className="mt-3 flex gap-2 rounded-lg bg-[#f4efe6] p-3 text-sm text-stone-700"><Sparkles size={15} className="mt-0.5 shrink-0 text-[#b8923a]" />{s.sum}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${ACCESS_STYLE[s.access]}`}>{s.access !== "Open" && <LockIcon size={11} />}{s.access}</span>
                    <button onClick={() => nav(`/study/${s.id}`)} className="flex items-center gap-1.5 rounded-lg bg-[#1f3d2b] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a5239]">View Study <ArrowRight size={14} /></button>
                  </div>
                </li>
              ))}
              {!list.length && <li className="rounded-xl border border-dashed border-stone-400 p-10 text-center text-stone-600">No studies match. Remove a filter or try a broader search term.</li>}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- GIS Explorer ---------------- */
const TOOLS = [["buffer", "Buffer", CircleDot], ["dist", "Distance", Ruler], ["area", "Area", Hexagon], ["hot", "Hotspot", Flame], ["cmp", "Before / After", SplitSquareHorizontal]];
const EXAMPLES = ["Show agricultural land within 5 km of highways", "Show disputed land near Mumbai", "Show urban expansion from 2020 to 2025"];
const offs = [[-28, -18], [22, -26], [30, 20], [-20, 26], [4, 4]];
const mix = (hex, t) => { const n = parseInt(hex.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255]; const base = [236, 228, 212]; return `rgb(${c.map((v, i) => Math.round(base[i] + (v - base[i]) * t)).join(",")})`; };

function GIS() {
  const nav = useNavigate();
  const svg = useRef(null);
  const [on, setOn] = useState(["agri"]);
  const [tool, setTool] = useState(null);
  const [pts, setPts] = useState([]);
  const [sel, setSel] = useState(null);
  const [year, setYear] = useState(2025);
  const [kmBuf, setKmBuf] = useState(60);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const [corridor, setCorridor] = useState(false);
  const flat = Object.values(MAP_LAYERS).flat();
  const choro = ["agri", "urban", "forest", "flood", "heat", "disp", "proj"].find((k) => on.includes(k));
  const color = flat.find((l) => l[0] === choro)?.[2];
  const region = REGIONS.find((r) => r.id === sel);
  const t = (year - 2015) / 10;
  const val = (r) => (choro === "urban" && tool === "cmp" ? r.m.urban * (0.55 + 0.45 * t) : r.m[choro]);
  const toggleLayer = (k) => setOn((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  const reset = () => { setTool(null); setPts([]); setSel(null); setOn(["agri"]); setYear(2025); setCorridor(false); setMsg(""); setQ(""); };
  const pick = (k) => { setTool(tool === k ? null : k); setPts([]); if (k === "cmp") { setOn((s) => [...new Set([...s, "urban"])]); } };
  const coords = (e) => { const r = svg.current.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * 600, ((e.clientY - r.top) / r.height) * 470]; };
  const onMap = (e) => {
    if (!tool || tool === "hot" || tool === "cmp") return;
    const p = coords(e);
    setPts((a) => (tool === "buffer" ? [p] : tool === "dist" ? (a.length >= 2 ? [p] : [...a, p]) : [...a, p]));
  };
  const dist = pts.length === 2 ? Math.round(Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]) * 6) : null;
  const areaKm = pts.length >= 3 ? Math.round(Math.abs(pts.reduce((s, p, i) => { const n = pts[(i + 1) % pts.length]; return s + p[0] * n[1] - n[0] * p[1]; }, 0)) / 2 * 36) : null;
  function runQuery(text) {
    const s = text.toLowerCase(); setQ(text); setPts([]);
    if (s.includes("highway")) { setOn(["agri", "hwy"]); setCorridor(true); setTool(null); setMsg("Agricultural land within a 5 km highway corridor: about 41,300 km² across 4 regions, highest in Uttar Pradesh and Maharashtra. Corridor width is exaggerated on the map."); }
    else if (s.includes("disput")) { setOn(["disp"]); setSel("mh"); setTool("hot"); setCorridor(false); setMsg("Maharashtra has 18,760 recorded land disputes; the densest cluster lies around the Mumbai–Thane belt."); }
    else if (s.includes("urban")) { setOn(["urban"]); setTool("cmp"); setYear(2025); setCorridor(false); setMsg("Built-up area grew fastest in Maharashtra and Karnataka between 2020 and 2025. Drag the year slider to compare."); }
    else setMsg("Try an example query below. This demo understands highways, disputes and urban expansion.");
  }
  const lu = region && ["Agriculture", "Urban", "Forest", "Other"].map((n, i) => ({ n, v: region.lu[i] }));
  const PIE = ["#7a8f3c", "#7b6a58", "#1f5a3a", "#c9bfa9"];
  return (
    <section id="gis" className="scroll-mt-16 bg-[#1b2a21] px-3 py-16 text-[#f4efe6] sm:px-5">
      <div className="mx-auto max-w-[1500px]">
        <p className="text-sm font-semibold text-[#d2b067]">Public GIS Map Explorer</p>
        <h2 className={`${serif} mt-1 text-4xl font-semibold`}>Explore land on the map</h2>
        <p className="mt-2 max-w-2xl text-[#cfd6c9]">Toggle layers, measure, find hotspots, compare years and ask the map a question. Click any region for its profile. Demo data shown.</p>
        <div className="mt-6 overflow-hidden rounded-xl border border-[#3a4d40] bg-[#23352a]">
          <div className="flex flex-wrap items-center gap-2 border-b border-[#3a4d40] p-3">
            {TOOLS.map(([k, label, I]) => (
              <button key={k} onClick={() => pick(k)} aria-pressed={tool === k} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${tool === k ? "bg-[#b8923a] font-medium text-[#1b2a21]" : "bg-[#2f4538] hover:bg-[#3a5345]"}`}><I size={15} />{label}</button>
            ))}
            {tool === "buffer" && <select value={kmBuf} onChange={(e) => setKmBuf(+e.target.value)} aria-label="Buffer radius" className="rounded-md bg-[#2f4538] px-2 py-1.5 text-sm">{[25, 60, 120].map((k) => <option key={k} value={k}>{k} km</option>)}</select>}
            {tool === "cmp" && <label className="flex items-center gap-2 text-sm">2015<input type="range" min="2015" max="2025" value={year} onChange={(e) => setYear(+e.target.value)} className="accent-[#b8923a]" />{year}</label>}
            <button onClick={reset} className="ml-auto flex items-center gap-1.5 rounded-md bg-[#2f4538] px-3 py-1.5 text-sm hover:bg-[#3a5345]"><RotateCcw size={15} />Reset</button>
          </div>
          <div className="grid lg:grid-cols-[230px_1fr_310px]">
            <div className="border-b border-[#3a4d40] p-4 lg:border-b-0 lg:border-r">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><Layers size={15} />Layers</h3>
              {Object.entries(MAP_LAYERS).map(([g, ls]) => (
                <div key={g} className="mt-4"><p className="text-xs font-semibold text-[#d2b067]">{g}</p>
                  {ls.map(([k, name, c]) => (
                    <label key={k} className="mt-1.5 flex cursor-pointer items-center gap-2 text-sm">
                      <input type="checkbox" className="accent-[#b8923a]" checked={on.includes(k)} onChange={() => toggleLayer(k)} /><span className="h-3 w-3 rounded-sm" style={{ background: c }} />{name}
                    </label>
                  ))}</div>
              ))}
              <p className="mt-5 text-xs text-[#9fb0a2]">Region shading follows the first active land-use, climate, dispute or project layer.</p>
            </div>
            <div className="relative bg-[#e9e2d0]">
              <svg ref={svg} viewBox="0 0 600 470" className={`h-full min-h-[440px] w-full ${tool && tool !== "hot" && tool !== "cmp" ? "cursor-crosshair" : ""}`} onClick={onMap} role="img" aria-label="Schematic map of Indian states">
                <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#d6cdb6" strokeWidth="1" /></pattern></defs>
                <rect width="600" height="470" fill="url(#grid)" />
                {REGIONS.map((r) => (
                  <g key={r.id}>
                    <polygon points={r.pts} fill={choro ? mix(color, Math.min(1, val(r) / 100) * 0.9 + 0.1) : "#d9d0ba"} stroke={sel === r.id ? GOLD : "#6b6a5c"} strokeWidth={sel === r.id ? 3 : 1.2} className="cursor-pointer" onClick={(e) => { if (!tool || tool === "hot" || tool === "cmp") { e.stopPropagation(); setSel(r.id); } }} />
                    <text x={r.c[0]} y={r.c[1]} textAnchor="middle" fontSize="12" fill={INK} className="pointer-events-none" fontWeight="600">{r.name}</text>
                  </g>
                ))}
                {(on.includes("hwy") || corridor) && HIGHWAYS.map((h, i) => <polyline key={i} points={h} fill="none" stroke={corridor ? "#b8923a" : INK} strokeOpacity={corridor ? 0.45 : 1} strokeWidth={corridor ? 16 : 2.5} strokeLinecap="round" />)}
                {on.includes("hwy") && corridor && HIGHWAYS.map((h, i) => <polyline key={"l" + i} points={h} fill="none" stroke={INK} strokeWidth="2" />)}
                {on.includes("rail") && RAIL.map((h, i) => <polyline key={i} points={h} fill="none" stroke="#6b5b3a" strokeWidth="2.5" strokeDasharray="7 4" />)}
                {on.includes("disp") && REGIONS.flatMap((r) => offs.slice(0, 2 + (r.m.disp > 60 ? 3 : 1)).map(([dx, dy], i) => <circle key={r.id + i} cx={r.c[0] + dx} cy={r.c[1] + dy + 14} r="5" fill="#8c2f39" stroke="#fff" />))}
                {on.includes("proj") && REGIONS.flatMap((r) => offs.slice(1, 2 + Math.round(r.m.proj / 40)).map(([dx, dy], i) => <rect key={r.id + i} x={r.c[0] + dx - 5} y={r.c[1] + dy + 14 - 5} width="10" height="10" fill={GOLD} stroke="#fff" transform={`rotate(45 ${r.c[0] + dx} ${r.c[1] + dy + 14})`} />))}
                {tool === "hot" && REGIONS.map((r) => <circle key={r.id} cx={r.c[0]} cy={r.c[1] + 10} r={8 + r.m.disp * 0.45} fill="#d1432f" fillOpacity={0.14 + r.m.disp / 400} className="pointer-events-none" />)}
                {tool === "buffer" && pts[0] && <circle cx={pts[0][0]} cy={pts[0][1]} r={kmBuf / 6} fill={GOLD} fillOpacity=".3" stroke={GOLD} strokeWidth="2" />}
                {tool === "dist" && pts.length === 2 && <polyline points={pts.map((p) => p.join(",")).join(" ")} stroke="#8c2f39" strokeWidth="2.5" strokeDasharray="5 3" />}
                {tool === "area" && pts.length > 1 && <polygon points={pts.map((p) => p.join(",")).join(" ")} fill={GOLD} fillOpacity=".3" stroke={GOLD} strokeWidth="2" />}
                {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4" fill={INK} stroke="#fff" strokeWidth="1.5" />)}
                <g transform="translate(560 40)"><circle r="18" fill="#faf7f1" stroke={INK} /><path d="M0-13L5 4H-5Z" fill={INK} /><text y="15" fontSize="8" textAnchor="middle" fill={INK}>N</text></g>
                <text x="12" y="462" fontSize="10" fill="#5b5a4c">Schematic map, not to scale · 1 cm ≈ 600 km</text>
              </svg>
              <div className="absolute left-3 top-3 max-w-[240px] rounded-lg bg-[#1b2a21]/90 p-3 text-xs text-[#f4efe6]" aria-live="polite">
                {!tool && "Click a region to see its profile."}
                {tool === "buffer" && `Buffer: click the map to draw a ${kmBuf} km zone.`}
                {tool === "dist" && (dist ? `Distance: ${dist.toLocaleString()} km` : "Distance: click two points.")}
                {tool === "area" && (areaKm ? `Area: ${areaKm.toLocaleString()} km²` : "Area: click three or more points.")}
                {tool === "hot" && "Hotspot: dispute density, red is higher."}
                {tool === "cmp" && `Urban built-up comparison, ${year} vs 2015.`}
              </div>
            </div>
            <div className="max-h-[560px] overflow-y-auto border-t border-[#3a4d40] p-4 lg:border-l lg:border-t-0">
              {!region ? (
                <div className="grid h-full min-h-40 place-items-center text-center text-sm text-[#b9c7bb]">Select a region on the map to view land use, infrastructure, projects, climate, disputes and related studies.</div>
              ) : (<>
                <h3 className={`${serif} text-2xl font-semibold`}>{region.name}</h3>
                <p className="text-sm text-[#b9c7bb]">Area {region.area} km²</p>
                <h4 className="mt-4 text-xs font-semibold text-[#d2b067]">Land-use breakdown</h4>
                <div className="flex items-center gap-3">
                  <div className="h-28 w-28"><ResponsiveContainer><PieChart><Pie data={lu} dataKey="v" nameKey="n" innerRadius={28} outerRadius={50} stroke="none">{lu.map((_, i) => <Cell key={i} fill={PIE[i]} />)}</Pie><Tooltip formatter={(v) => v + "%"} /></PieChart></ResponsiveContainer></div>
                  <ul className="text-xs">{lu.map((d, i) => <li key={d.n} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5" style={{ background: PIE[i] }} />{d.n} {d.v}%</li>)}</ul>
                </div>
                <h4 className="mt-3 text-xs font-semibold text-[#d2b067]">Climate and risk index</h4>
                <div className="h-28"><ResponsiveContainer><BarChart data={[{ n: "Flood", v: region.m.flood }, { n: "Heat", v: region.m.heat }, { n: "Disputes", v: region.m.disp }, { n: "Projects", v: region.m.proj }]}><XAxis dataKey="n" tick={{ fill: "#cfd6c9", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis hide domain={[0, 100]} /><Tooltip cursor={false} contentStyle={{ color: INK }} /><Bar dataKey="v" fill={GOLD} radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div>
                <dl className="mt-2 space-y-2 text-sm">
                  <div><dt className="text-xs text-[#d2b067]">Climate indicators</dt><dd>Temperature anomaly {region.temp}, rainfall {region.rain}</dd></div>
                  <div><dt className="text-xs text-[#d2b067]">Infrastructure</dt><dd>{region.infra}</dd></div>
                  <div><dt className="text-xs text-[#d2b067]">Projects</dt><dd>{region.projects.join("; ")}</dd></div>
                  <div><dt className="text-xs text-[#d2b067]">Disputes</dt><dd>{region.disputes.toLocaleString()} recorded cases</dd></div>
                </dl>
                <h4 className="mt-3 text-xs font-semibold text-[#d2b067]">Related studies</h4>
                <ul className="mt-1 space-y-1.5">{region.studies.map((id) => { const s = STUDIES.find((x) => x.id === id); return (
                  <li key={id}><button onClick={() => nav(`/study/${id}`)} className="flex w-full items-start gap-2 rounded-md bg-[#2f4538] p-2 text-left text-xs hover:bg-[#3a5345]"><FileText size={14} className="mt-0.5 shrink-0 text-[#d2b067]" />{s.title}</button></li>); })}</ul>
              </>)}
            </div>
          </div>
          <div className="border-t border-[#3a4d40] p-3">
            <form onSubmit={(e) => { e.preventDefault(); runQuery(q); }} className="flex gap-2">
              <div className="relative flex-1"><Sparkles size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d2b067]" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask the map: Show agricultural land within 5 km of highways" aria-label="AI GIS query" className="w-full rounded-lg border border-[#3a4d40] bg-[#1b2a21] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#b8923a]" /></div>
              <button className="flex items-center gap-1.5 rounded-lg bg-[#b8923a] px-4 text-sm font-medium text-[#1b2a21]"><Send size={15} />Ask</button>
            </form>
            <div className="mt-2 flex flex-wrap gap-2">{EXAMPLES.map((e) => <button key={e} onClick={() => runQuery(e)} className="rounded-full border border-[#3a4d40] px-3 py-1 text-xs hover:bg-[#2f4538]">{e}</button>)}</div>
            {msg && <p className="mt-2 rounded-lg bg-[#2f4538] p-3 text-sm" aria-live="polite">{msg}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Page ---------------- */
export default function LandingPage() {
  const [auth, setAuth] = useState(null);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) setTimeout(() => go(id), 50);
  }, []);
  const links = [["home", "Home"], ["repository", "Study Repository"], ["gis", "GIS Explorer"]];
  const stats = [["14", "studies indexed"], ["6", "regions mapped"], ["5", "data layers"], ["7", "role workspaces"]];
  return (
    <div className="min-h-screen bg-[#f4efe6] font-['Public_Sans',sans-serif] text-[#26282b]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Public+Sans:wght@400;500;600&display=swap');`}</style>
      <header className="sticky top-0 z-40 border-b border-[#1f3d2b]/15 bg-[#f4efe6]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <button onClick={() => go("home")} className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-md bg-[#1f3d2b] text-[#d2b067]"><Landmark size={18} /></span><span className={`${serif} text-2xl font-semibold text-[#1f3d2b]`}>Bhoomi</span></button>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {links.map(([id, l]) => <button key={id} onClick={() => go(id)} className="rounded-md px-3 py-2 text-sm font-medium text-stone-700 hover:bg-[#1f3d2b]/10">{l}</button>)}
            <button onClick={() => setAuth("register")} className="ml-2 rounded-md px-3 py-2 text-sm font-medium text-[#1f3d2b] hover:bg-[#1f3d2b]/10">Register</button>
            <button onClick={() => setAuth("login")} className="flex items-center gap-1.5 rounded-md bg-[#1f3d2b] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a5239]"><LogIn size={15} />Login</button>
          </nav>
          <button className="md:hidden" onClick={() => setMenu(!menu)} aria-label="Menu"><Menu /></button>
        </div>
        {menu && <div className="flex flex-col gap-1 border-t border-stone-300 px-5 py-3 md:hidden">
          {links.map(([id, l]) => <button key={id} onClick={() => { go(id); setMenu(false); }} className="py-2 text-left text-sm">{l}</button>)}
          <button onClick={() => { setAuth("login"); setMenu(false); }} className="py-2 text-left text-sm font-semibold text-[#1f3d2b]">Login</button>
        </div>}
      </header>

      <section id="home" className="relative scroll-mt-16 overflow-hidden px-5 pb-16 pt-16 sm:pt-24">
        <svg className="pointer-events-none absolute -right-20 top-0 h-full w-[720px] opacity-40" viewBox="0 0 600 600" fill="none" stroke="#1f3d2b" strokeOpacity=".35" aria-hidden="true">
          {[...Array(11)].map((_, i) => <ellipse key={i} cx="350" cy="300" rx={40 + i * 26} ry={28 + i * 21} transform={`rotate(${-18 + i * 2} 350 300)`} />)}
        </svg>
        <div className="relative mx-auto max-w-7xl">
          <h1 className={`${serif} text-6xl font-semibold tracking-tight text-[#1f3d2b] sm:text-8xl`}>BHOOMI</h1>
          <p className={`${serif} mt-3 max-w-3xl text-2xl text-[#26282b] sm:text-3xl`}>A Unified Intelligence Platform for Land &amp; Geospatial Studies</p>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-700">Bhoomi brings land-governance research, policy papers, datasets and satellite-derived map layers into one open platform. Search the evidence, see it on the map, and sign in when you are ready to analyse, simulate and act.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => go("repository")} className="flex items-center gap-2 rounded-lg bg-[#1f3d2b] px-5 py-3 font-medium text-white hover:bg-[#2a5239]"><Search size={17} />Explore Study Repository</button>
            <button onClick={() => go("gis")} className="flex items-center gap-2 rounded-lg border border-[#1f3d2b] px-5 py-3 font-medium text-[#1f3d2b] hover:bg-[#1f3d2b]/10"><Layers size={17} />Explore GIS Map</button>
            <button onClick={() => setAuth("login")} className="flex items-center gap-2 rounded-lg border-b-2 border-[#b8923a] px-4 py-3 font-medium text-[#26282b] hover:bg-[#b8923a]/15"><LogIn size={17} />Login</button>
          </div>
          <dl className="mt-14 grid max-w-2xl grid-cols-2 gap-6 border-t border-[#1f3d2b]/25 pt-6 sm:grid-cols-4">
            {stats.map(([n, l]) => <div key={l}><dt className={`${serif} text-3xl font-semibold text-[#1f3d2b]`}>{n}</dt><dd className="text-sm text-stone-600">{l}</dd></div>)}
          </dl>
        </div>
      </section>

      <Repository />
      <GIS />

      <section className="bg-[#f4efe6] px-5 py-20">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-6 rounded-xl border border-[#1f3d2b]/25 border-l-4 border-l-[#b8923a] bg-white p-8">
          <div className="max-w-xl"><h2 className={`${serif} text-3xl font-semibold text-[#1f3d2b]`}>Ready to analyse and act?</h2>
            <p className="mt-2 text-stone-600">Sign in to reach your role-specific workspace: research tools, policy simulation, agency data operations, institutional hubs and more.</p></div>
          <div className="flex gap-3">
            <button onClick={() => setAuth("login")} className="flex items-center gap-2 rounded-lg bg-[#1f3d2b] px-5 py-3 font-medium text-white hover:bg-[#2a5239]"><LogIn size={16} />Login</button>
            <button onClick={() => setAuth("register")} className="flex items-center gap-2 rounded-lg border border-[#1f3d2b] px-5 py-3 font-medium text-[#1f3d2b] hover:bg-[#1f3d2b]/10"><UserPlus size={16} />Register</button>
          </div>
        </div>
      </section>
      <footer className="bg-[#1f3d2b] px-5 py-6 text-center text-sm text-[#cfd6c9]">Bhoomi · Department of Land Resources, Ministry of Rural Development · Demo build with mock data</footer>
      {auth && <AuthModal initial={auth} onClose={() => setAuth(null)} />}
    </div>
  );
}