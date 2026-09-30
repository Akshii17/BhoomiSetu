import { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  BarChart3, Sparkles, MapPin, Calendar, CheckCircle2, AlertTriangle, Layers, Download, Play, Info, ShieldCheck,
} from "lucide-react";
import { ANALYTICS_TYPES, REGIONS } from "../data/Studies";

export default function AnalyticsModule({ role = "researcher", onExportReport = null }) {
  const [selectedAnalysis, setSelectedAnalysis] = useState(ANALYTICS_TYPES[0].id);
  const [selectedRegion, setSelectedRegion] = useState("Maharashtra");
  const [timeHorizon, setTimeHorizon] = useState("2020-2025");
  const [running, setRunning] = useState(false);

  const curAnalysis = useMemo(() => {
    return ANALYTICS_TYPES.find((a) => a.id === selectedAnalysis) || ANALYTICS_TYPES[0];
  }, [selectedAnalysis]);

  const isModelEstimate = [
    "predictive_model", "scenario_analysis", "land_suitability", "climate_vuln", "urban_expansion",
  ].includes(selectedAnalysis);

  // Dynamic sample data based on selection
  const chartData = useMemo(() => {
    const base = [
      { t: "T-4", observed: 42, estimate: isModelEstimate ? 40 : null },
      { t: "T-3", observed: 48, estimate: isModelEstimate ? 47 : null },
      { t: "T-2", observed: 55, estimate: isModelEstimate ? 53 : null },
      { t: "T-1", observed: 64, estimate: isModelEstimate ? 61 : null },
      { t: "Current (2025)", observed: 71, estimate: 71 },
      { t: "T+1 (2026)", observed: null, estimate: isModelEstimate ? 79 : null },
      { t: "T+2 (2027)", observed: null, estimate: isModelEstimate ? 88 : null },
    ];
    return base;
  }, [selectedAnalysis, isModelEstimate]);

  const triggerRun = () => {
    setRunning(true);
    setTimeout(() => setRunning(false), 600);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="rounded-2xl border border-stone-300 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#b8923a]">Spatial Decision Support</span>
            <h2 className="font-['Newsreader',serif] text-2xl font-semibold text-[#1f3d2b] mt-0.5">
              Advanced Land Governance Analytics
            </h2>
            <p className="text-xs text-stone-600 mt-1 max-w-xl">
              17 standardized analytical procedures evaluating cadastral changes, environmental stress, policy shifts, and predictive land allocations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isModelEstimate ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-900 shadow-sm">
                <Sparkles size={14} className="text-[#b8923a]" /> Model estimate (Simulated)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                <CheckCircle2 size={14} /> Official Observed Data
              </span>
            )}
          </div>
        </div>

        {/* Selectors Bar */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Analysis Type */}
          <div>
            <label className="text-xs font-semibold text-stone-600 uppercase">Analysis Module (17 Available)</label>
            <select
              value={selectedAnalysis}
              onChange={(e) => setSelectedAnalysis(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-900 outline-none focus:border-[#1f3d2b]"
            >
              {ANALYTICS_TYPES.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.group})</option>
              ))}
            </select>
          </div>

          {/* 2. Region */}
          <div>
            <label className="text-xs font-semibold text-stone-600 uppercase">Region / State</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-900 outline-none focus:border-[#1f3d2b]"
            >
              {["Pan-India", "Maharashtra", "Karnataka", "Uttar Pradesh", "Rajasthan", "Gujarat", "Odisha"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* 3. Time Horizon */}
          <div>
            <label className="text-xs font-semibold text-stone-600 uppercase">Time Window</label>
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-900 outline-none focus:border-[#1f3d2b]"
            >
              <option value="2015-2020">2015 – 2020 (Historical 5y)</option>
              <option value="2020-2025">2020 – 2025 (Active Decadal)</option>
              <option value="2025-2030">2025 – 2030 (Predictive 5y)</option>
            </select>
          </div>

          {/* 4. Action */}
          <div className="flex items-end">
            <button
              onClick={triggerRun}
              disabled={running}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1f3d2b] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#2a5239] transition shadow-sm"
            >
              <Play size={14} /> {running ? "Calculating..." : "Compute Analytics"}
            </button>
          </div>
        </div>

        {/* Selected Module Summary Pill */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#faf7f1] p-3 border border-stone-200 text-xs">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-[#1f3d2b]" />
            <strong className="text-stone-900">{curAnalysis.name}:</strong>
            <span className="text-stone-600">{curAnalysis.desc}</span>
          </div>
          <span className="rounded-full bg-white border border-stone-300 px-2.5 py-0.5 text-[11px] font-semibold text-stone-700">
            Category: {curAnalysis.group}
          </span>
        </div>
      </div>

      {/* Chart & Result Display */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-stone-300 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h3 className="font-semibold text-stone-900 text-sm">{curAnalysis.name} Trend &amp; Projections</h3>
              <p className="text-xs text-stone-500">Region: {selectedRegion} · Horizon: {timeHorizon}</p>
            </div>
            {isModelEstimate && (
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                Model estimate clearly delineated
              </span>
            )}
          </div>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="t" fontSize={11} stroke="#888" />
                <YAxis fontSize={11} stroke="#888" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="observed" name="Observed Field Data" stroke="#1f3d2b" fill="#e3ecdf" fillOpacity={0.6} />
                {isModelEstimate && (
                  <Area type="monotone" dataKey="estimate" name="Model Estimate" stroke="#b8923a" strokeDasharray="4 4" fill="#faf7f1" fillOpacity={0.3} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100 pt-2">
            <span>Algorithm: Spatial Autoregressive Kriging + Random Forest v2.4</span>
            <span>Confidence Interval: 95% (p &lt; 0.01)</span>
          </div>
        </div>

        {/* Spatial Assessment Card */}
        <div className="rounded-2xl border border-stone-300 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-600 border-b border-stone-200 pb-2">
              <span>Spatial Impact Summary</span>
              <Layers size={15} className="text-[#1f3d2b]" />
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Affected Area:</span>
                <strong className="text-stone-900">4,280 km²</strong>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Rate of Displacement:</span>
                <strong className="text-stone-900">+4.2% per year</strong>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Parcels Impacted:</span>
                <strong className="text-stone-900">38,120 Cadastral Units</strong>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Data Reliability Score:</span>
                <strong className="text-emerald-700">92 / 100 (High)</strong>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-[#faf7f1] p-3 text-xs text-stone-700 border border-stone-200">
              <p className="font-semibold text-[#1f3d2b] flex items-center gap-1">
                <Info size={13} className="text-[#b8923a]" /> Policy Takeaway:
              </p>
              <p className="mt-1 text-[11px] leading-relaxed">
                Prioritize farmland conservation zoning along expressways. Cluster development in brownfield buffers to mitigate displacement.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-stone-100">
            <button
              onClick={() => onExportReport && onExportReport(curAnalysis.name)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
            >
              <Download size={14} /> Export Analytics Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
