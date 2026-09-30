import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Landmark, Search, Sparkles, Layers, ArrowRight, MapPin, Thermometer, Droplets,
  Loader2, Flag, Trophy, BookOpen, Scale, CloudRain, FolderKanban, TrendingUp, Send, CheckCircle2,
} from "lucide-react";
import { BASEMAPS, baseStyle } from "../data/Studies";

/* ---------- Map sources (free public tile APIs) ---------- */
const BASES = {
  satellite: { label: "Satellite", max: 18, attr: "Esri, Maxar, Earthstar Geographics", tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"] },
  street: { label: "Street", max: 19, attr: "© OpenStreetMap contributors", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"] },
  terrain: { label: "Terrain", max: 17, attr: "© OpenTopoMap (CC-BY-SA)", tiles: ["https://a.tile.opentopomap.org/{z}/{x}/{y}.png"] },
};
// NASA GIBS overlays.
const OVERLAYS = {
  ndvi: { label: "Vegetation (NDVI)", max: 9, tiles: ["https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png"] },
  heat: { label: "Land surface heat", max: 7, tiles: ["https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temp_Day/default/default/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png"] },
};

/* ---------- Sample content ---------- */
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
const PIE_COLORS = ["#1f3d2b", "#7a8f3c", "#b8923a", "#2f6f9a", "#8c2f39"];

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
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");
    map.scrollZoom.disable();
    mapRef.current = map;
    return () => map.remove();
  }, []);

  /* Layer switcher */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      Object.keys(BASES).forEach((id) => {
        if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", id === base ? "visible" : "none");
      });
      Object.keys(OVERLAYS).forEach((id) => {
        if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", overlays[id] ? "visible" : "none");
      });
    };
    map.loaded() ? apply() : map.once("load", apply);
  }, [base, overlays]);

  /* Fly to searched district */
  useEffect(() => {
    if (!district || !mapRef.current) return;
    markerRef.current?.remove();
    markerRef.current = new maplibregl.Marker({ color: "#b8923a" }).setLngLat([district.lon, district.lat]).addTo(mapRef.current);
    mapRef.current.flyTo({ center: [district.lon, district.lat], zoom: 8, duration: 1800 });
  }, [district]);

  function runAsk(e) {
    e.preventDefault();
    const q = ask.trim().toLowerCase();
    if (!q) return;
    const hits = RESEARCH.filter((r) => q.split(/\s+/).some((w) => w.length > 3 && (r.title + r.tag).toLowerCase().includes(w)));
    setAnswer({ q: ask, hits: hits.length ? hits : RESEARCH.slice(0, 2) });
    window.dispatchEvent(new CustomEvent("open-bhoomi-ai", { detail: { query: ask } }));
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
      setError("We couldn't find that place. Try a district name such as Pune, Nashik or Guntur.");
    } finally { setLoading(false); }
  }

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-[#f4efe6] font-['Public_Sans',sans-serif] text-[#26282b]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Public+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Top navigation */}
      <header className="sticky top-0 z-40 border-b border-[#1f3d2b]/15 bg-[#f4efe6]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#1f3d2b] text-[#d2b067]"><Landmark size={18} /></span>
            <span className="font-['Newsreader',serif] text-2xl font-semibold text-[#1f3d2b]">Bhoomi</span>
            <span className="rounded-full bg-[#e3ecdf] px-3 py-0.5 text-xs font-semibold text-[#1f3d2b]">Public Portal</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-stone-700 md:flex">
            {[["Map", "map"], ["Research", "research"], ["Innovation", "innovation"], ["Report an issue", "report"]].map(([l, id]) => (
              <button key={id} onClick={() => go(id)} className="hover:text-[#1f3d2b] font-medium transition">{l}</button>
            ))}
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("open-bhoomi-ai"))} className="flex items-center gap-1.5 rounded-lg border border-[#b8923a]/40 bg-[#faf7f1] px-3.5 py-1.5 text-xs font-semibold text-[#1f3d2b] hover:bg-[#b8923a]/15 transition">
              <Sparkles size={14} className="text-[#b8923a]" /> Bhoomi AI
            </button>
          </nav>
          <button className="rounded-lg bg-[#1f3d2b] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a5239] transition">Sign in</button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#1f3d2b] pb-28 pt-16 text-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 relative z-10">
          <h1 className="max-w-3xl font-['Newsreader',serif] text-4xl font-medium leading-[1.1] sm:text-6xl text-[#f4efe6]">
            Land in India, explained with open data.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-stone-200 leading-relaxed">
            Search open land research, national policies, satellite layers and district records in plain language.
          </p>
          <form onSubmit={runAsk} className="mt-8 flex max-w-3xl items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl border border-[#b8923a]/30">
            <Sparkles className="ml-3 shrink-0 text-[#b8923a]" size={22} />
            <input
              value={ask} onChange={(e) => setAsk(e.target.value)} aria-label="Ask about land governance"
              placeholder="Ask anything about land governance, dispute trends or maps in India"
              className="min-w-0 flex-1 bg-transparent px-2 py-3 text-base text-[#26282b] outline-none placeholder:text-stone-400"
            />
            <button className="flex items-center gap-2 rounded-xl bg-[#1f3d2b] px-5 py-3 font-semibold text-white hover:bg-[#2a5239] transition">
              <Search size={18} /> Ask
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {["How are land disputes resolved?", "Farmland lost to cities", "What is ULPIN?"].map((s) => (
              <button key={s} onClick={() => setAsk(s)} className="rounded-full border border-stone-400/40 bg-white/10 px-3.5 py-1.5 text-stone-200 hover:bg-white/20 transition">{s}</button>
            ))}
          </div>
          {answer && (
            <div className="mt-6 max-w-3xl rounded-2xl bg-[#faf7f1] p-5 text-[#26282b] shadow-xl border border-stone-200">
              <p className="text-sm font-semibold text-[#1f3d2b]">Best matches in the repository for “{answer.q}”</p>
              <ul className="mt-3 space-y-2">
                {answer.hits.map((h) => (
                  <li key={h.title} className="flex items-start gap-3 rounded-lg bg-white p-3 border border-stone-200">
                    <BookOpen size={18} className="mt-0.5 shrink-0 text-[#b8923a]" />
                    <span><strong className="block text-sm font-semibold text-[#1f3d2b]">{h.title}</strong><span className="block text-xs text-stone-500">{h.org} · {h.year} · {h.tag}</span></span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Headline stats */}
      <section className="mx-auto -mt-16 max-w-7xl px-5 relative z-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map(({ icon: Icon, label, value, note, data }) => (
            <div key={label} className="overflow-hidden rounded-2xl bg-white shadow-md border border-stone-300">
              <div className="p-5 pb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-600"><Icon size={16} className="text-[#1f3d2b]" />{label}</div>
                <div className="mt-2 font-['Newsreader',serif] text-4xl font-semibold text-[#1f3d2b]">{value}</div>
                <p className="text-xs text-stone-500 mt-1">{note}</p>
              </div>
              <div className="h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                    <Area type="monotone" dataKey="v" stroke="#1f3d2b" strokeWidth={2} fill="#e3ecdf" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Map */}
      <section id="map" className="mx-auto mt-20 max-w-7xl px-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold text-[#b8923a] uppercase tracking-wider">Geospatial Intelligence</p>
            <h2 className="font-['Newsreader',serif] text-3xl font-medium text-[#1f3d2b] mt-1">See the land</h2>
            <p className="mt-1 max-w-xl text-stone-600 text-sm">Switch the base map, then add satellite-measured layers for vegetation and surface heat.</p>
          </div>
        </div>
        <div className="relative mt-6 overflow-hidden rounded-2xl border border-stone-300 shadow-md">
          <div ref={mapEl} className="h-[520px] w-full" />
          <div className="absolute left-4 top-4 w-60 rounded-xl bg-[#faf7f1]/95 p-3.5 shadow-lg border border-stone-300 backdrop-blur">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#1f3d2b]"><Layers size={16} className="text-[#b8923a]" />Layers</div>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-stone-200 p-1">
              {Object.entries(BASES).map(([id, b]) => (
                <button key={id} onClick={() => setBase(id)} aria-pressed={base === id}
                  className={`rounded-md py-1.5 text-xs font-medium transition ${base === id ? "bg-[#1f3d2b] text-white shadow-sm" : "text-stone-700 hover:bg-white"}`}>{b.label}</button>
              ))}
            </div>
            <div className="mt-3 space-y-2 text-stone-800">
              {Object.entries(OVERLAYS).map(([id, o]) => (
                <label key={id} className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                  <input type="checkbox" checked={overlays[id]} onChange={() => setOverlays((s) => ({ ...s, [id]: !s[id] }))} className="h-4 w-4 accent-[#1f3d2b]" />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Explore your district */}
      <section className="mx-auto mt-20 max-w-7xl px-5">
        <div className="rounded-3xl bg-[#1f3d2b] p-8 text-white sm:p-12 border-t-4 border-[#b8923a] shadow-xl">
          <h2 className="max-w-2xl font-['Newsreader',serif] text-3xl font-medium sm:text-4xl text-[#f4efe6]">What does land look like where you live?</h2>
          <p className="mt-3 max-w-xl text-stone-200 text-sm">Type your district and get a one-page summary. The map above will fly there.</p>
          <form onSubmit={explore} className="mt-6 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="District name" placeholder="Try Nashik, Pune, Guntur or Kamrup"
                className="w-full rounded-xl py-3.5 pl-10 pr-3 text-[#26282b] bg-white outline-none placeholder:text-stone-400" />
            </div>
            <button disabled={loading} className="flex items-center gap-2 rounded-xl bg-[#b8923a] px-6 font-semibold text-[#1f2a24] hover:bg-[#c9a34b] disabled:opacity-60 transition">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />} Explore
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-[#f1d3cb]" role="alert">{error}</p>}
        </div>

        <div ref={districtRef} className="scroll-mt-24">
          {district && (
            <div className="mt-6 grid gap-6 rounded-3xl bg-white p-6 shadow-md border border-stone-300 md:grid-cols-5 sm:p-8">
              <div className="md:col-span-3">
                <h3 className="font-['Newsreader',serif] text-3xl font-semibold text-[#1f3d2b]">{district.name}</h3>
                <p className="text-sm text-stone-500">{district.state} · Lat {district.lat.toFixed(2)}°, Lon {district.lon.toFixed(2)}°</p>

                {district.wx && (
                  <div className="mt-4 flex gap-4 text-sm text-stone-700">
                    <span className="flex items-center gap-1.5"><Thermometer size={16} className="text-[#b8923a]" />{district.wx.temperature_2m}°C</span>
                    <span className="flex items-center gap-1.5"><Droplets size={16} className="text-[#2f6f9a]" />{district.wx.relative_humidity_2m}% humidity</span>
                  </div>
                )}

                <h4 className="mt-6 font-semibold text-sm text-[#1f3d2b]">Estimated Land Use Composition</h4>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                  {district.use.map((u, i) => (
                    <div key={u.name} className="rounded-xl border border-stone-200 bg-[#faf7f1] p-3 text-center">
                      <div className="h-2 w-2 rounded-full mx-auto mb-1" style={{ backgroundColor: PIE_COLORS[i] }} />
                      <div className="font-semibold text-stone-800">{u.name}</div>
                      <div className="text-lg font-bold text-[#1f3d2b] mt-0.5">{u.value}%</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center border-t border-stone-200 pt-4 md:col-span-2 md:border-l md:border-t-0 md:pt-0">
                <div className="h-48 w-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={district.use} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} stroke="none">
                        {district.use.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-stone-500 mt-2 text-center">Derived from ISRO / NRSC Land Use Layers</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Innovation Challenge Banner */}
      <section id="innovation" className="mx-auto mt-20 max-w-7xl px-5">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-stone-300 border-l-4 border-l-[#b8923a] bg-white p-8 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#f4efe6] text-[#b8923a]"><Trophy size={24} /></span>
            <div>
              <h2 className="font-['Newsreader',serif] text-2xl font-medium text-[#1f3d2b] sm:text-3xl">Land Data Challenge is open for entries</h2>
              <p className="mt-1 max-w-xl text-stone-600 text-sm">Build a tool with open land datasets. Winning ideas receive grants and are considered for official pilots.</p>
            </div>
          </div>
          <button className="shrink-0 rounded-xl bg-[#1f3d2b] px-6 py-3 font-semibold text-white hover:bg-[#2a5239] transition">See details</button>
        </div>
      </section>

      {/* Report an issue */}
      <section id="report" className="mt-20 border-t border-stone-300 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <Flag className="mt-1 text-[#b8923a]" size={22} />
            <div>
              <h2 className="text-lg font-semibold text-[#1f3d2b]">Spotted something wrong?</h2>
              <p className="text-sm text-stone-600">Tell us about a data error, map problem or missing document.</p>
            </div>
          </div>
          {sent ? (
            <p className="flex items-center gap-2 font-medium text-[#1f3d2b]"><CheckCircle2 size={20} className="text-[#1f3d2b]" /> Thanks, your report was sent to administrators.</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (issue.text.trim()) setSent(true); }} className="flex flex-1 flex-col gap-2 sm:flex-row lg:max-w-2xl">
              <select value={issue.type} onChange={(e) => setIssue({ ...issue, type: e.target.value })} aria-label="Issue type" className="rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm">
                {ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <input value={issue.text} onChange={(e) => setIssue({ ...issue, text: e.target.value })} aria-label="Describe the issue" placeholder="Describe the issue with district or layer name"
                className="min-w-0 flex-1 rounded-xl border border-stone-300 px-3 py-3 text-sm outline-none focus:border-[#1f3d2b]" />
              <button className="flex items-center justify-center gap-2 rounded-xl bg-[#1f3d2b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2a5239] transition"><Send size={16} /> Send report</button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}