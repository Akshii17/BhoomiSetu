import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import {
  TrendingUp, Award, Scale, CloudRain, FolderKanban, Satellite, Sparkles, Filter, ChevronRight, CheckCircle2, AlertCircle, Info,
} from "lucide-react";
import { DRILLDOWN_DATA } from "../data/Studies";

const PIE_COLORS = ["#7a8f3c", "#7b6a58", "#1f5a3a", "#c9bfa9"];

export default function PublicDashboard({ defaultLevel = "national" }) {
  const [level, setLevel] = useState(defaultLevel); // 'national' | 'state' | 'district' | 'local'
  const [selectedState, setSelectedState] = useState("Maharashtra");
  const [selectedDistrict, setSelectedDistrict] = useState("Pune");
  const [selectedLocal, setSelectedLocal] = useState("Haveli Taluka");
  const [activeTab, setActiveTab] = useState("overview");

  // Determine active data entity based on selected level
  const data = useMemo(() => {
    if (level === "national") return DRILLDOWN_DATA.national;
    if (level === "state") return DRILLDOWN_DATA.states[selectedState] || DRILLDOWN_DATA.states["Maharashtra"];
    if (level === "district") return DRILLDOWN_DATA.districts[selectedDistrict] || DRILLDOWN_DATA.districts["Pune"];
    return DRILLDOWN_DATA.locals[selectedLocal] || DRILLDOWN_DATA.locals["Haveli Taluka"];
  }, [level, selectedState, selectedDistrict, selectedLocal]);

  // Land use pie format
  const luData = useMemo(() => [
    { name: "Agriculture", value: data.landuse.agri },
    { name: "Urban", value: data.landuse.urban },
    { name: "Forest", value: data.landuse.forest },
    { name: "Other", value: data.landuse.other },
  ], [data]);

  // Historical trend mock
  const trendHistory = [
    { year: "2020", observed: 5.2, estimate: null },
    { year: "2021", observed: 5.6, estimate: null },
    { year: "2022", observed: 6.1, estimate: null },
    { year: "2023", observed: 6.8, estimate: null },
    { year: "2024", observed: 7.4, estimate: null },
    { year: "2025", observed: 8.0, estimate: 8.0 },
    { year: "2026", observed: null, estimate: 8.7 },
    { year: "2027", observed: null, estimate: 9.4 },
  ];

  return (
    <div className="space-y-6">
      {/* 4-Level Drill-down Selector */}
      <div className="rounded-2xl border border-stone-300 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#b8923a]">Granular Spatial Intelligence</span>
            <h2 className="font-['Newsreader',serif] text-2xl font-semibold text-[#1f3d2b] mt-0.5">
              Multi-Level Indicator Dashboard
            </h2>
          </div>

          {/* Level Switcher */}
          <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-300 text-xs font-semibold">
            {[
              ["national", "1. National"],
              ["state", "2. State"],
              ["district", "3. District"],
              ["local", "4. Local / Taluka"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setLevel(id)}
                className={`rounded-lg px-3 py-1.5 transition ${
                  level === id
                    ? "bg-[#1f3d2b] text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Drill-down Controls */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1">
            <Filter size={13} /> Jurisdiction Filter:
          </span>

          {level !== "national" && (
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                const firstDist = DRILLDOWN_DATA.states[e.target.value]?.districts[0] || "Pune";
                setSelectedDistrict(firstDist);
              }}
              className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-800 outline-none focus:border-[#1f3d2b]"
            >
              {Object.keys(DRILLDOWN_DATA.states).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}

          {(level === "district" || level === "local") && (
            <>
              <ChevronRight size={14} className="text-stone-400" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-800 outline-none focus:border-[#1f3d2b]"
              >
                {Object.keys(DRILLDOWN_DATA.districts).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </>
          )}

          {level === "local" && (
            <>
              <ChevronRight size={14} className="text-stone-400" />
              <select
                value={selectedLocal}
                onChange={(e) => setSelectedLocal(e.target.value)}
                className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-800 outline-none focus:border-[#1f3d2b]"
              >
                {Object.keys(DRILLDOWN_DATA.locals).map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </>
          )}

          <div className="ml-auto text-xs text-stone-600 bg-[#faf7f1] border border-stone-200 px-3 py-1 rounded-lg">
            Active: <strong className="text-[#1f3d2b]">{data.name}</strong> ({data.area})
          </div>
        </div>
      </div>

      {/* 8 Core Widgets Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Research Outputs */}
        <div className="rounded-2xl border border-stone-300 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>Research Outputs</span>
            <Award size={16} className="text-[#b8923a]" />
          </div>
          <div className="mt-2 text-3xl font-semibold text-[#1f3d2b] font-['Newsreader',serif]">
            {data.research.count.toLocaleString()}
          </div>
          <p className="mt-1 text-xs text-stone-500">
            {data.research.papers} papers · {data.research.datasets} datasets
          </p>
          <div className="mt-3 border-t border-stone-100 pt-2 text-[11px] text-stone-600">
            Top: {data.research.topInstitutes.slice(0, 2).join(", ")}
          </div>
        </div>

        {/* 2. Policy Performance */}
        <div className="rounded-2xl border border-stone-300 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>Policy Performance</span>
            <TrendingUp size={16} className="text-[#1f3d2b]" />
          </div>
          <div className="mt-2 text-3xl font-semibold text-[#1f3d2b] font-['Newsreader',serif]">
            {data.policy.ulpin}
          </div>
          <p className="mt-1 text-xs text-stone-500">ULPIN Cadastral Parcel Coverage</p>
          <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2 text-[11px] text-stone-600">
            <span>e-Mutation speed:</span>
            <strong className="text-[#1f3d2b]">{data.policy.mutationDays} days avg</strong>
          </div>
        </div>

        {/* 3. Climate Resilience */}
        <div className="rounded-2xl border border-stone-300 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>Climate Resilience</span>
            <CloudRain size={16} className="text-[#2f6f9a]" />
          </div>
          <div className="mt-2 text-3xl font-semibold text-[#1f3d2b] font-['Newsreader',serif]">
            {data.climate.heatIndex}<span className="text-sm font-normal text-stone-400">/100</span>
          </div>
          <p className="mt-1 text-xs text-stone-500">Surface Heat Vulnerability Index</p>
          <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2 text-[11px] text-stone-600">
            <span>Flood exposure:</span>
            <span className="font-semibold text-stone-700">{data.climate.floodExposure}</span>
          </div>
        </div>

        {/* 4. Dispute Statistics */}
        <div className="rounded-2xl border border-stone-300 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
            <span>Dispute Statistics</span>
            <Scale size={16} className="text-[#8c2f39]" />
          </div>
          <div className="mt-2 text-3xl font-semibold text-[#1f3d2b] font-['Newsreader',serif]">
            {data.disputes.resolvedPct}
          </div>
          <p className="mt-1 text-xs text-stone-500">Cases resolved within 12 months</p>
          <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2 text-[11px] text-stone-600">
            <span>Pending total:</span>
            <span className="font-semibold text-stone-700">{data.disputes.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Deep-Dive Visualizations (Observed vs Model Estimates) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Land-Use Breakdown & 5-year Trends */}
        <div className="rounded-2xl border border-stone-300 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h3 className="font-semibold text-[#1f3d2b] text-base">Land-Use Structure &amp; Trends</h3>
              <p className="text-xs text-stone-500 mt-0.5">5-year conversion rate: {data.landuse.conversion5yr}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
              <CheckCircle2 size={12} /> Observed Satellite Data (NRSC)
            </span>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center gap-6">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={luData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68} stroke="none">
                    {luData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 space-y-2 text-xs">
              {luData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="font-medium text-stone-800">{item.name}</span>
                  </div>
                  <strong className="text-stone-900">{item.value}%</strong>
                </div>
              ))}
              <p className="pt-2 text-[11px] text-stone-500 border-t border-stone-100 leading-snug">
                Farmland preservation protocols applied. Verified against high-resolution Sentinel-2 raster tiles.
              </p>
            </div>
          </div>
        </div>

        {/* Predictive Urban Sprawl: Observed vs Model Estimate */}
        <div className="rounded-2xl border border-stone-300 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
            <div>
              <h3 className="font-semibold text-[#1f3d2b] text-base">Built-up Growth Trajectory</h3>
              <p className="text-xs text-stone-500 mt-0.5">Historical observed data vs 2026–2027 forecast</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700">
                ● Observed
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                <Sparkles size={11} /> Model estimate
              </span>
            </div>
          </div>

          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendHistory}>
                <XAxis dataKey="year" stroke="#999" fontSize={11} />
                <YAxis unit="%" stroke="#999" fontSize={11} domain={[4, 11]} />
                <Tooltip />
                <Line type="monotone" dataKey="observed" name="Observed Built-up" stroke="#1f3d2b" strokeWidth={2.5} dot={{ r: 4, fill: "#1f3d2b" }} />
                <Line type="monotone" dataKey="estimate" name="Model Estimate" stroke="#b8923a" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 4, fill: "#b8923a" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-center text-[11px] text-stone-500">
            Note: Dotted line denotes <em>Random Forest Predictive Model estimate</em> (v2.4). Not official census records.
          </p>
        </div>
      </div>

      {/* Emerging Trends & Geospatial Insights */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 5. Project Implementation Outcomes */}
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
            <FolderKanban size={15} className="text-[#1f3d2b]" /> Project Outcomes
          </div>
          <p className="mt-2 text-2xl font-semibold text-stone-900 font-['Newsreader',serif]">{data.projects.onTrack}</p>
          <p className="text-xs text-stone-500">{data.projects.active} active projects ({data.projects.beneficiaries} citizens)</p>
          <div className="mt-2 h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#1f3d2b]" style={{ width: data.projects.onTrack }} />
          </div>
        </div>

        {/* 6. Geospatial Insights */}
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
            <Satellite size={15} className="text-[#1f3d2b]" /> Geospatial Insights
          </div>
          <p className="mt-2 text-2xl font-semibold text-stone-900 font-['Newsreader',serif]">{data.geospatial.highResCoverage}</p>
          <p className="text-xs text-stone-500">{data.geospatial.droneVillages.toLocaleString()} drone-mapped settlements</p>
          <p className="mt-1 text-[11px] text-[#b8923a] font-medium">{data.geospatial.satPasses} satellite passes archived</p>
        </div>

        {/* 7. Emerging Trends */}
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
            <Sparkles size={15} className="text-[#b8923a]" /> Peri-urban Pressure
          </div>
          <p className="mt-2 text-2xl font-semibold text-stone-900 font-['Newsreader',serif]">{data.trends.periurbanIndex}<span className="text-sm font-normal text-stone-400">/100</span></p>
          <p className="text-xs text-stone-500">Pooling adoption: {data.trends.poolingUptake}</p>
          <p className="mt-1 text-[11px] text-amber-700 font-medium">Buffer shift: {data.trends.greenBufferDelta}</p>
        </div>

        {/* 8. Data Source Attributions */}
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
            <Info size={15} className="text-stone-500" /> Source Attributions
          </div>
          <p className="mt-2 text-xs text-stone-600 leading-snug">
            Integrated from DoLR, Survey of India, ISRO/NRSC, Census of India and District Revenue Collectorates.
          </p>
          <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#1f3d2b]">
            <CheckCircle2 size={12} /> Daily Open Sync
          </div>
        </div>
      </div>
    </div>
  );
}
