import { useState } from "react";
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import {
  Sliders, Play, RotateCcw, Download, Sparkles, CheckCircle2, Bookmark, FileSpreadsheet, ShieldCheck, Layers, GitCompare,
} from "lucide-react";

const BASELINE = {
  farmlandLoss: 6.4,
  builtupGrowth: 9.2,
  infraPressure: 78,
  climateRisk: 26,
  disputeCount: 412,
  popDensityStress: 65,
};

const ASSUMPTIONS = [
  "Farmland zoning cap enforces a 40% reduction in diversion of triple-cropped irrigated land.",
  "Fast-track e-courts reduce disposal timelines from 14.2 months to 6.8 months.",
  "100-year flood zone restriction mandates a 500-meter buffer along active river corridors.",
  "Transit-oriented land pooling releases 15% more compact infill housing parcels.",
];

const DATASETS_USED = [
  "DoLR ULPIN Cadastral Cadastre v2025.4",
  "NRSC All-India LULC 10m High-Res Grid (2015–2025)",
  "Census 2011 + 2024 Intercensal Demographic Projections",
  "NJDG Geocoded Land Disputes Master Registry",
  "CWC Flood Frequency Hydrological Zones",
];

export default function PolicySimulator({ readOnly = false, onExportReport = null }) {
  const [levers, setLevers] = useState({
    farmlandCap: 45,
    fastTrackCourts: 60,
    floodBuffer: 50,
    compactInfill: 40,
    transitPooling: 55,
  });

  const [savedScenarios, setSavedScenarios] = useState([
    { id: "scen-1", name: "Status Quo (No Policy Intervention)", version: "BHM-SIM v2.4.1", date: "Baseline", values: { ...BASELINE } },
  ]);
  const [activeScenario, setActiveScenario] = useState("scen-1");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  // Calculate simulated values from levers
  const simulated = {
    farmlandLoss: +(BASELINE.farmlandLoss * (1 - (levers.farmlandCap * 0.6) / 100)).toFixed(1),
    builtupGrowth: +(BASELINE.builtupGrowth * (1 - (levers.compactInfill * 0.25) / 100)).toFixed(1),
    infraPressure: Math.round(BASELINE.infraPressure * (1 - (levers.transitPooling * 0.15) / 100)),
    climateRisk: Math.round(BASELINE.climateRisk * (1 - (levers.floodBuffer * 0.35) / 100)),
    disputeCount: Math.round(BASELINE.disputeCount * (1 - (levers.fastTrackCourts * 0.55) / 100)),
    popDensityStress: Math.round(BASELINE.popDensityStress * (1 - (levers.compactInfill * 0.2) / 100)),
  };

  const comparisonData = [
    { indicator: "Farmland Loss (%)", baseline: BASELINE.farmlandLoss, simulated: simulated.farmlandLoss },
    { indicator: "Built-up Growth (%)", baseline: BASELINE.builtupGrowth, simulated: simulated.builtupGrowth },
    { indicator: "Infra Pressure (Index)", baseline: BASELINE.infraPressure, simulated: simulated.infraPressure },
    { indicator: "Climate Risk (%)", baseline: BASELINE.climateRisk, simulated: simulated.climateRisk },
    { indicator: "Disputes (x1000)", baseline: BASELINE.disputeCount, simulated: simulated.disputeCount },
    { indicator: "Population Stress", baseline: BASELINE.popDensityStress, simulated: simulated.popDensityStress },
  ];

  const radarData = [
    { metric: "Farmland Preserved", baseline: 50, simulated: 50 + levers.farmlandCap * 0.4 },
    { metric: "Compact Growth", baseline: 40, simulated: 40 + levers.compactInfill * 0.5 },
    { metric: "Dispute Relief", baseline: 35, simulated: 35 + levers.fastTrackCourts * 0.55 },
    { metric: "Flood Protection", baseline: 45, simulated: 45 + levers.floodBuffer * 0.45 },
    { metric: "Infra Efficiency", baseline: 55, simulated: 55 + levers.transitPooling * 0.35 },
  ];

  const saveScenario = () => {
    setSaving(true);
    setTimeout(() => {
      const newScen = {
        id: `scen-${Date.now()}`,
        name: `Simulated Intervention (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`,
        version: "BHM-SIM v2.4.1",
        date: "Today",
        values: { ...simulated },
        levers: { ...levers },
      };
      setSavedScenarios((s) => [...s, newScen]);
      setActiveScenario(newScen.id);
      setSaving(false);
      setToast("Scenario saved with full reproducibility parameters!");
      setTimeout(() => setToast(""), 3000);
    }, 500);
  };

  const resetLevers = () => {
    setLevers({
      farmlandCap: 45,
      fastTrackCourts: 60,
      floodBuffer: 50,
      compactInfill: 40,
      transitPooling: 55,
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="rounded-2xl border border-stone-300 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#b8923a]">Multi-Lever Decision Modeling</span>
            <h2 className="font-['Newsreader',serif] text-2xl font-semibold text-[#1f3d2b] mt-0.5">
              National Policy Simulation Engine
            </h2>
            <p className="text-xs text-stone-600 mt-1 max-w-xl">
              Model inputs &rarr; Baseline data &rarr; Historical trends &rarr; Assumptions &rarr; Impact calculation &rarr; Reproducible Dossier.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {readOnly && (
              <span className="rounded-full bg-stone-100 border border-stone-300 px-3 py-1 text-xs font-medium text-stone-600">
                View Only Access (Institutional Audit)
              </span>
            )}
            <button
              onClick={() => onExportReport && onExportReport("Policy Simulation Scenario Dossier")}
              className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition shadow-sm"
            >
              <Download size={14} /> Download Scenario Report
            </button>
          </div>
        </div>

        {/* Levers & Controls Grid */}
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="flex justify-between text-xs font-semibold text-stone-800">
              <span>Farmland Conversion Cap:</span>
              <strong className="text-[#1f3d2b]">{levers.farmlandCap}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              disabled={readOnly}
              value={levers.farmlandCap}
              onChange={(e) => setLevers({ ...levers, farmlandCap: +e.target.value })}
              className="mt-2 w-full accent-[#1f3d2b]"
            />
            <span className="text-[11px] text-stone-500">Limits non-agri zoning on fertile parcels</span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-stone-800">
              <span>Fast-track Dispute Tribunal Speed:</span>
              <strong className="text-[#1f3d2b]">{levers.fastTrackCourts}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              disabled={readOnly}
              value={levers.fastTrackCourts}
              onChange={(e) => setLevers({ ...levers, fastTrackCourts: +e.target.value })}
              className="mt-2 w-full accent-[#1f3d2b]"
            />
            <span className="text-[11px] text-stone-500">e-Mutation lock + digital evidence hearings</span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-stone-800">
              <span>Floodplain Buffer Restriction:</span>
              <strong className="text-[#1f3d2b]">{levers.floodBuffer}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              disabled={readOnly}
              value={levers.floodBuffer}
              onChange={(e) => setLevers({ ...levers, floodBuffer: +e.target.value })}
              className="mt-2 w-full accent-[#1f3d2b]"
            />
            <span className="text-[11px] text-stone-500">500m mandatory buffer along high-water marks</span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-stone-800">
              <span>Compact Urban Infill Incentive:</span>
              <strong className="text-[#1f3d2b]">{levers.compactInfill}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              disabled={readOnly}
              value={levers.compactInfill}
              onChange={(e) => setLevers({ ...levers, compactInfill: +e.target.value })}
              className="mt-2 w-full accent-[#1f3d2b]"
            />
            <span className="text-[11px] text-stone-500">Increases FSI in core brownfield transit hubs</span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-stone-800">
              <span>Transit Land Pooling Mechanism:</span>
              <strong className="text-[#1f3d2b]">{levers.transitPooling}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              disabled={readOnly}
              value={levers.transitPooling}
              onChange={(e) => setLevers({ ...levers, transitPooling: +e.target.value })}
              className="mt-2 w-full accent-[#1f3d2b]"
            />
            <span className="text-[11px] text-stone-500">Equitable return of developed urban plots</span>
          </div>

          <div className="flex items-end gap-2">
            {!readOnly && (
              <>
                <button
                  onClick={saveScenario}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#1f3d2b] py-2.5 text-xs font-semibold text-white hover:bg-[#2a5239] transition shadow-sm"
                >
                  <Bookmark size={14} /> {saving ? "Saving..." : "Save Scenario"}
                </button>
                <button
                  onClick={resetLevers}
                  className="rounded-xl border border-stone-300 p-2.5 text-stone-600 hover:bg-stone-100 transition"
                  title="Reset to Baseline"
                >
                  <RotateCcw size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {toast && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-300 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} /> {toast}
          </div>
        )}
      </div>

      {/* Comparison: Status Quo vs Simulated Scenario */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar Comparison Chart */}
        <div className="rounded-2xl border border-stone-300 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h3 className="font-semibold text-stone-900 text-sm">Policy Intervention vs Status Quo</h3>
              <p className="text-xs text-stone-500">Quantitative indicator shifts across 6 governance domains</p>
            </div>
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-stone-700">
              Monte Carlo Model v2.4.1
            </span>
          </div>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="indicator" fontSize={10} stroke="#888" interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis fontSize={11} stroke="#888" />
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: 10 }} />
                <Bar dataKey="baseline" name="Status Quo Baseline" fill="#7b6a58" radius={[3, 3, 0, 0]} />
                <Bar dataKey="simulated" name="Simulated Outcome" fill="#1f3d2b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Impact Balance Chart */}
        <div className="rounded-2xl border border-stone-300 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h3 className="font-semibold text-stone-900 text-sm">Multi-Dimensional Policy Resilience</h3>
              <p className="text-xs text-stone-500">Comprehensive score out of 100 on key dimensions</p>
            </div>
            <span className="rounded-full bg-[#e3ecdf] text-[#1f3d2b] px-2.5 py-0.5 text-[11px] font-semibold">
              Balanced Growth
            </span>
          </div>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e0dcd3" />
                <PolarAngleAxis dataKey="metric" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={10} />
                <Radar name="Status Quo" dataKey="baseline" stroke="#7b6a58" fill="#7b6a58" fillOpacity={0.2} />
                <Radar name="Simulated Levers" dataKey="simulated" stroke="#b8923a" fill="#b8923a" fillOpacity={0.4} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reproducibility Panel */}
      <div className="rounded-2xl border border-stone-300 bg-[#faf7f1] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-300 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#1f3d2b]" />
            <h3 className="font-semibold text-[#1f3d2b] text-sm">Simulation Reproducibility &amp; Lineage Panel</h3>
          </div>
          <span className="text-xs text-stone-600">Model Version: <strong>BHM-SIM v2.4.1 (Git commit 816733c)</strong></span>
        </div>

        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          {/* Assumptions */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">Underlying Model Assumptions</h4>
            <ul className="mt-2 space-y-1.5 text-xs text-stone-600">
              {ASSUMPTIONS.map((a, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 text-[#b8923a] font-bold">▪</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Datasets Used */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">Verified Datasets &amp; Feature Feeds</h4>
            <ul className="mt-2 space-y-1.5 text-xs text-stone-600">
              {DATASETS_USED.map((d, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 text-[#1f3d2b] font-bold">✓</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Saved Scenarios History */}
        <div className="mt-5 border-t border-stone-300 pt-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">Saved Simulation Iterations</h4>
          <div className="flex flex-wrap gap-2">
            {savedScenarios.map((scen) => (
              <button
                key={scen.id}
                onClick={() => setActiveScenario(scen.id)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                  activeScenario === scen.id
                    ? "border-[#1f3d2b] bg-[#1f3d2b] text-white"
                    : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
                }`}
              >
                {scen.name} · <span className="opacity-75">{scen.version}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
