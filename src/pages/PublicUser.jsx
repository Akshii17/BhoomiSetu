import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Landmark, Search, Sparkles, Layers, ArrowRight, MapPin, Thermometer, Droplets,
  Loader2, Flag, Trophy, BookOpen, Scale, CloudRain, FolderKanban, TrendingUp, Send, CheckCircle2,
} from "lucide-react";

/* ---------- Map sources (free public tile APIs) ---------- */
const BASES = {
  street: { label: "Street", max: 19, attr: "© OpenStreetMap contributors", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"] },
  satellite: { label: "Satellite", max: 18, attr: "Esri, Maxar, Earthstar Geographics", tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"] },
  terrain: { label: "Terrain", max: 17, attr: "© OpenTopoMap (CC-BY-SA)", tiles: ["https://a.tile.opentopomap.org/{z}/{x}/{y}.png"] },
};
// NASA GIBS overlays. If one fails to load, swap the layer id (see NASA GIBS layer list).
const OVERLAYS = {
  ndvi: { label: "Vegetation (NDVI)", max: 9, tiles: ["https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png"] },
  heat: { label: "Land surface heat", max: 7, tiles: ["https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temp_Day/default/default/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png"] },
};

/* ---------- Sample content (replace with your backend later) ---------- */
const spark = (a) => a.map((v, i) => ({ i, v }));
const STATS = [
  { icon: TrendingUp, label: "Land-use change since 2015", value: "4.2%", note: "farmland converted to built-up", data: spark([2, 2.4, 2.9, 3.1, 3.5, 3.8, 4, 4.2]) },
  { icon: Scale, label: "Land disputes resolved", value: "68%", note: "of cases filed in the last 5 years", data: spark([51, 54, 57, 60, 62, 64, 66, 68]) },
  { icon: CloudRain, label: "Climate-vulnerable land", value: "23%", note: "of mapped area at flood or drought risk", data: spark([19, 20, 20.5, 21, 21.8, 22.2, 22.7, 23]) },
  { icon: FolderKanban, label: "Active land projects", value: "1,284", note: "across 28 states and 8 UTs", data: spark([800, 870, 950, 1010, 1100, 1160, 1230, 1284]) },
];
const RESEARCH = [
  { tag: "Climate", title: "Climate vulnerability mapping of coastal land parcels", org: "IIT Bombay", year: 2025 },
  { tag: "Urbanisation", title: "Farmland conversion around tier-2 cities", org: "NIUA", year: 2025 },
  { tag: "Disputes", title: "Digitised land records and dispute resolution time", org: "NLU Delhi", year: 2024 },
  { tag: "Policy", title: "What ULPIN rollout changed for parcel transparency", org: "DoLR", year: 2024 },
];
const ISSUE_TYPES = ["Incorrect dataset", "Map error", "Document issue", "Research correction", "Platform problem", "Feature request"];
const PIE_COLORS = ["#1d4ed8", "#16a34a", "#f59e0b", "#0ea5e9", "#94a3b8"];

const hash = (s) => [...s.toLowerCase()].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
function landUseFor(name) {
  const h = hash(name);
  const agri = 35 + (h % 20), forest = 8 + ((h >> 3) % 15), built = 5 + ((h >> 5) % 12), water = 2 + ((h >> 7) % 6);
  return [
    { name: "Agriculture", value: agri }, { name: "Forest", value: forest },
    { name: "Built-up", value: built }, { name: "Water", value: water },
    { name: "Other", value: 100 - agri - forest - built - water },
  ];
}

export default function PublicUser() {
  const mapEl = useRef(null), mapRef = useRef(null), markerRef = useRef(null), districtRef = useRef(null);
  const [base, setBase] = useState("satellite");
  const [overlays, setOverlays] = useState({ ndvi: false, heat: false });
  const [ask, setAsk] = useState("");
  const [answer, setAnswer] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [district, setDistrict] = useState(null);
  const [issue, setIssue] = useState({ type: ISSUE_TYPES[0], text: "" });
  const [sent, setSent] = useState(false);

  /* Map init */
  useEffect(() => {
    const sources = {}, layers = [];
    Object.entries({ ...BASES, ...OVERLAYS }).forEach(([id, c]) => {
      sources[id] = { type: "raster", tiles: c.tiles, tileSize: 256, maxzoom: c.max, attribution: c.attr || "NASA GIBS / EOSDIS" };
      layers.push({ id, type: "raster", source: id, layout: { visibility: "none" }, paint: OVERLAYS[id] ? { "raster-opacity": 0.65 } : {} });
    });
    const map = new maplibregl.Map({ container: mapEl.current, style: { version: 8, sources, layers }, center: [78.96, 22.59], zoom: 3.8, minZoom: 3 });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.scrollZoom.disable();
    mapRef.current = map;
    return () => map.remove();
  }, []);

  /* Layer switcher */
  useEffect(() => {
    const map = mapRef.current;
    const apply = () => {
      Object.keys(BASES).forEach((id) => map.setLayoutProperty(id, "visibility", id === base ? "visible" : "none"));
      Object.keys(OVERLAYS).forEach((id) => map.setLayoutProperty(id, "visibility", overlays[id] ? "visible" : "none"));
    };
    map.loaded() ? apply() : map.once("load", apply);
  }, [base, overlays]);

  /* Fly to searched district */
  useEffect(() => {
    if (!district || !mapRef.current) return;
    markerRef.current?.remove();
    markerRef.current = new maplibregl.Marker({ color: "#1d4ed8" }).setLngLat([district.lon, district.lat]).addTo(mapRef.current);
    mapRef.current.flyTo({ center: [district.lon, district.lat], zoom: 8, duration: 1800 });
  }, [district]);

  function runAsk(e) {
    e.preventDefault();
    const q = ask.trim().toLowerCase();
    if (!q) return;
    const hits = RESEARCH.filter((r) => q.split(/\s+/).some((w) => w.length > 3 && (r.title + r.tag).toLowerCase().includes(w)));
    setAnswer({ q: ask, hits: hits.length ? hits : RESEARCH.slice(0, 2) });
    // TODO: replace with POST /api/assistant (RAG) returning answer + sources
  }

  async function explore(e, preset) {
    e?.preventDefault();
    const name = (preset || query).trim();
    if (!name) return;
    setQuery(name); setLoading(true); setError("");
    try {
      const geo = await (await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name + ", India")}&format=json&addressdetails=1&limit=1&countrycodes=in`)).json();
      if (!geo.length) throw new Error("nf");
      const { lat, lon, address } = geo[0];
      const wx = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation`)).json();
      setDistrict({
        name: address.state_district || address.county || address.city || name,
        state: address.state || "India", lat: +lat, lon: +lon, wx: wx.current, use: landUseFor(name),
      });
      setTimeout(() => districtRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    } catch {
      setError("We couldn't find that place. Try a district name such as Pune or Guntur.");
    } finally { setLoading(false); }
  }

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-['Public_Sans',sans-serif]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Public+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Top navigation */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0a1a44]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600"><Landmark size={19} /></span>
            <span className="font-['Newsreader',serif] text-xl font-semibold">Bhoomi</span>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-blue-100 md:flex">
            {[["Map", "map"], ["Research", "research"], ["Innovation", "innovation"], ["Report an issue", "report"]].map(([l, id]) => (
              <button key={id} onClick={() => go(id)} className="hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">{l}</button>
            ))}
          </nav>
          <button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50">Sign in</button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#0a1a44] pb-32 pt-16 text-white">
        <div className="mx-auto max-w-7xl px-5">
          <h1 className="max-w-3xl font-['Newsreader',serif] text-4xl font-medium leading-[1.1] sm:text-6xl">
            Land in India, explained with open data.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-blue-100">
            Search research, policies and maps from across the country, or ask a question in plain language.
          </p>
          <form onSubmit={runAsk} className="mt-9 flex max-w-3xl items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl">
            <Sparkles className="ml-3 shrink-0 text-blue-600" size={22} />
            <input
              value={ask} onChange={(e) => setAsk(e.target.value)} aria-label="Ask about land governance"
              placeholder="Ask anything about land governance in India"
              className="min-w-0 flex-1 bg-transparent px-2 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold hover:bg-blue-800">
              <Search size={18} /> Ask
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {["How are land disputes resolved?", "Farmland lost to cities", "What is ULPIN?"].map((s) => (
              <button key={s} onClick={() => setAsk(s)} className="rounded-full border border-white/20 px-3.5 py-1.5 text-blue-100 hover:bg-white/10">{s}</button>
            ))}
          </div>
          {answer && (
            <div className="mt-6 max-w-3xl rounded-2xl bg-white/10 p-5 ring-1 ring-white/20">
              <p className="text-sm text-blue-100">Best matches in the public library for “{answer.q}”</p>
              <ul className="mt-3 space-y-2">
                {answer.hits.map((h) => (
                  <li key={h.title} className="flex items-start gap-3 rounded-lg bg-white/10 px-4 py-3">
                    <BookOpen size={18} className="mt-0.5 shrink-0 text-blue-300" />
                    <span>{h.title}<span className="block text-sm text-blue-200">{h.org}, {h.year}</span></span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Headline stats */}
      <section className="mx-auto -mt-20 max-w-7xl px-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map(({ icon: Icon, label, value, note, data }) => (
            <div key={label} className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
              <div className="p-5 pb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><Icon size={16} className="text-blue-600" />{label}</div>
                <div className="mt-2 font-['Newsreader',serif] text-4xl font-semibold text-slate-900">{value}</div>
                <p className="text-sm text-slate-500">{note}</p>
              </div>
              <div className="h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                    <Area type="monotone" dataKey="v" stroke="#1d4ed8" strokeWidth={2} fill="#dbeafe" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Map */}
      <section id="map" className="mx-auto mt-20 max-w-7xl px-5">
        <h2 className="font-['Newsreader',serif] text-3xl font-medium text-slate-900">See the land</h2>
        <p className="mt-2 max-w-xl text-slate-600">Switch the base map, then add satellite-measured layers for vegetation and surface heat.</p>
        <div className="relative mt-6 overflow-hidden rounded-2xl ring-1 ring-slate-300">
          <div ref={mapEl} className="h-[520px] w-full" />
          <div className="absolute left-4 top-4 w-56 rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Layers size={16} className="text-blue-600" />Layers</div>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
              {Object.entries(BASES).map(([id, b]) => (
                <button key={id} onClick={() => setBase(id)} aria-pressed={base === id}
                  className={`rounded-md py-1.5 text-xs font-medium ${base === id ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-white"}`}>{b.label}</button>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              {Object.entries(OVERLAYS).map(([id, o]) => (
                <label key={id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={overlays[id]} onChange={() => setOverlays((s) => ({ ...s, [id]: !s[id] }))} className="h-4 w-4 accent-blue-700" />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Explore your district */}
      <section className="mx-auto mt-20 max-w-7xl px-5">
        <div className="rounded-3xl bg-blue-700 p-8 text-white sm:p-12">
          <h2 className="max-w-2xl font-['Newsreader',serif] text-3xl font-medium sm:text-4xl">What does land look like where you live?</h2>
          <p className="mt-3 max-w-xl text-blue-100">Type your district and get a one-page summary. The map above will fly there.</p>
          <form onSubmit={explore} className="mt-6 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="District name" placeholder="Try Nashik, Guntur or Kangra"
                className="w-full rounded-xl py-3.5 pl-10 pr-3 text-slate-900 outline-none placeholder:text-slate-400" />
            </div>
            <button disabled={loading} className="flex items-center gap-2 rounded-xl bg-[#0a1a44] px-5 font-semibold hover:bg-black disabled:opacity-60">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />} Explore
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-amber-200" role="alert">{error}</p>}
        </div>

        <div ref={districtRef} className="scroll-mt-24">
          {district && (
            <div className="mt-6 grid gap-6 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200 md:grid-cols-5 sm:p-8">
              <div className="md:col-span-3">
                <h3 className="font-['Newsreader',serif] text-3xl font-semibold text-slate-900">{district.name}</h3>
                <p className="text-slate-500">{district.state}</p>
                <p className="mt-4 max-w-prose leading-relaxed text-slate-700">
                  About {district.use[0].value}% of {district.name} is farmland and {district.use[1].value}% is forest.
                  Built-up area covers {district.use[2].value}%, and it is the fastest-growing category in most districts of {district.state}.
                </p>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[
                    [Thermometer, `${district.wx?.temperature_2m ?? "-"}°C`, "Temperature now"],
                    [Droplets, `${district.wx?.relative_humidity_2m ?? "-"}%`, "Humidity now"],
                    [CloudRain, `${district.wx?.precipitation ?? 0} mm`, "Rain now"],
                  ].map(([I, v, l]) => (
                    <div key={l} className="rounded-xl bg-blue-50 p-3">
                      <I size={16} className="text-blue-700" />
                      <div className="mt-1 text-lg font-semibold text-slate-900">{v}</div>
                      <div className="text-xs text-slate-500">{l}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-slate-400">Weather is live from Open-Meteo. Land-use shares are sample values until the land data platform is connected.</p>
              </div>
              <div className="md:col-span-2">
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={district.use} dataKey="value" innerRadius={48} outerRadius={82} paddingAngle={2}>
                        {district.use.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {district.use.map((u, i) => (
                    <li key={u.name} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />{u.name} {u.value}%</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured research */}
      <section id="research" className="mx-auto mt-20 max-w-7xl px-5">
        <h2 className="font-['Newsreader',serif] text-3xl font-medium text-slate-900">Featured research and case studies</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {RESEARCH.map((r) => (
            <article key={r.title} className="flex flex-col rounded-2xl bg-white p-5 ring-1 ring-slate-200 transition hover:ring-blue-400">
              <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{r.tag}</span>
              <h3 className="mt-4 flex-1 text-lg font-semibold leading-snug text-slate-900">{r.title}</h3>
              <p className="mt-4 text-sm text-slate-500">{r.org}, {r.year}</p>
              <button className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-blue-700">Read summary <ArrowRight size={15} /></button>
            </article>
          ))}
        </div>
      </section>

      {/* Hackathon banner */}
      <section id="innovation" className="mx-auto mt-20 max-w-7xl px-5">
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-gradient-to-r from-[#0a1a44] to-blue-800 p-8 text-white sm:flex-row sm:items-center sm:p-10">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/15"><Trophy size={24} /></span>
            <div>
              <h2 className="font-['Newsreader',serif] text-2xl font-medium sm:text-3xl">Land Data Challenge is open for entries</h2>
              <p className="mt-1 max-w-xl text-blue-100">Build a tool with open land datasets. Winning ideas are considered for pilot projects.</p>
            </div>
          </div>
          <button className="shrink-0 rounded-xl bg-white px-6 py-3 font-semibold text-blue-800 hover:bg-blue-50">See details</button>
        </div>
      </section>

      {/* Report an issue */}
      <section id="report" className="mt-20 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <Flag className="mt-1 text-blue-700" size={22} />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Spotted something wrong?</h2>
              <p className="text-slate-600">Tell us about a data error, map problem or missing document.</p>
            </div>
          </div>
          {sent ? (
            <p className="flex items-center gap-2 font-medium text-green-700"><CheckCircle2 size={20} /> Thanks, your report was sent.</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (issue.text.trim()) setSent(true); /* TODO: POST /api/feedback */ }} className="flex flex-1 flex-col gap-2 sm:flex-row lg:max-w-2xl">
              <select value={issue.type} onChange={(e) => setIssue({ ...issue, type: e.target.value })} aria-label="Issue type" className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm">
                {ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <input value={issue.text} onChange={(e) => setIssue({ ...issue, text: e.target.value })} aria-label="Describe the issue" placeholder="Describe the issue"
                className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-600" />
              <button className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"><Send size={16} /> Send report</button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}