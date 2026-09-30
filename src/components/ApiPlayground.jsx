import { useState } from "react";
import { Terminal, Key, Copy, Check, Play, ShieldAlert, Sparkles, BookOpen } from "lucide-react";

const ENDPOINTS = [
  { id: "datasets", path: "/v1/datasets", method: "GET", desc: "List all accessible datasets with spatial metadata and quality scores", sampleRes: { count: 6, datasets: [{ id: "ULPIN-MH", name: "Maharashtra Cadastral Parcels", records: "18.2M", quality: 96 }] } },
  { id: "layers", path: "/v1/layers/land-use?district=Pune", method: "GET", desc: "Retrieve GeoJSON vectors for land-use classification by district", sampleRes: { type: "FeatureCollection", features: [{ type: "Feature", properties: { zoning: "Agriculture", area_ha: 4120 } }] } },
  { id: "locations", path: "/v1/locations/districts", method: "GET", desc: "Get all indexed states, districts and taluka spatial centroids", sampleRes: { states: ["Maharashtra", "Karnataka", "Uttar Pradesh", "Rajasthan"], total_districts: 768 } },
  { id: "analytics", path: "/v1/analytics/trends?indicator=sprawl&years=2020-2025", method: "GET", desc: "Query spatial autocorrelation and conversion rate trends", sampleRes: { indicator: "urban_sprawl", conversion_rate_pct: 4.2, confidence: 0.95 } },
  { id: "research", path: "/v1/research/publications?topic=fragmentation", method: "GET", desc: "Full-text and semantic search over repository publications", sampleRes: { total_hits: 14, top_matches: [{ id: "BH-2025-001", relevance: 96 }] } },
  { id: "simulations", path: "/v1/simulations/run", method: "POST", desc: "Trigger multi-lever scenario calculation with custom bounds", sampleRes: { status: "completed", run_id: "SIM-84920", delta_farmland_loss: -3.3 } },
];

export default function ApiPlayground({ role = "researcher" }) {
  const [apiKey, setApiKey] = useState(`bhm_${role}_${Math.random().toString(36).slice(2, 8)}`);
  const [selectedEp, setSelectedEp] = useState(ENDPOINTS[0].id);
  const [copied, setCopied] = useState(false);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const curEp = ENDPOINTS.find((e) => e.id === selectedEp) || ENDPOINTS[0];
  const curlCmd = `curl -X ${curEp.method} "https://api.bhoomi.gov.in${curEp.path}" \\\n  -H "Authorization: Bearer ${apiKey}" \\\n  -H "Content-Type: application/json"`;

  const copyCurl = async () => {
    try {
      await navigator.clipboard.writeText(curlCmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleRun = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResponse(curEp.sampleRes);
    }, 450);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-stone-300 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#b8923a]">Developer &amp; Integration Hub</span>
            <h2 className="font-['Newsreader',serif] text-2xl font-semibold text-[#1f3d2b] mt-0.5">
              Bhoomi REST &amp; Spatial API Playground
            </h2>
            <p className="text-xs text-stone-600 mt-1 max-w-xl">
              Programmatic access to cadastral registries, satellite tiles, analytics routines and policy simulations scoped to your role.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#e3ecdf] text-[#1f3d2b] px-3 py-1 text-xs font-semibold">
              Role Scope: {role.toUpperCase()}
            </span>
          </div>
        </div>

        {/* API Key Strip */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-stone-50 p-3.5 border border-stone-200">
          <div className="flex items-center gap-2">
            <Key size={16} className="text-[#b8923a]" />
            <span className="text-xs font-medium text-stone-700">Active API Key:</span>
            <code className="rounded bg-white border border-stone-300 px-2 py-0.5 text-xs font-mono font-bold text-stone-900">
              {apiKey}
            </code>
          </div>
          <button
            onClick={() => setApiKey(`bhm_${role}_${Math.random().toString(36).slice(2, 8)}`)}
            className="text-xs font-semibold text-[#1f3d2b] hover:underline"
          >
            Rotate Key
          </button>
        </div>
      </div>

      {/* Explorer Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Endpoints Sidebar */}
        <div className="lg:col-span-4 rounded-2xl border border-stone-300 bg-white p-4 shadow-sm space-y-1">
          <h3 className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-stone-500 border-b border-stone-100">
            Available Endpoints
          </h3>
          <div className="pt-2 space-y-1">
            {ENDPOINTS.map((ep) => (
              <button
                key={ep.id}
                onClick={() => { setSelectedEp(ep.id); setResponse(null); }}
                className={`w-full text-left rounded-xl p-2.5 text-xs transition border ${
                  selectedEp === ep.id
                    ? "border-[#1f3d2b] bg-[#1f3d2b] text-white font-semibold"
                    : "border-transparent hover:bg-stone-100 text-stone-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    ep.method === "POST" ? "bg-amber-700 text-white" : "bg-stone-200 text-stone-800"
                  }`}>
                    {ep.method}
                  </span>
                  <code className="font-mono">{ep.path.split("?")[0]}</code>
                </div>
                <p className={`mt-1 text-[11px] truncate ${selectedEp === ep.id ? "text-stone-200" : "text-stone-500"}`}>
                  {ep.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Request & Response Tester */}
        <div className="lg:col-span-8 space-y-4">
          {/* Request Header */}
          <div className="rounded-2xl border border-stone-300 bg-[#26282b] p-5 text-white shadow-sm font-mono text-xs">
            <div className="flex items-center justify-between border-b border-stone-700 pb-3">
              <span className="text-stone-400 font-sans font-semibold uppercase tracking-wider text-[11px]">
                cURL Request Preview
              </span>
              <button
                onClick={copyCurl}
                className="flex items-center gap-1.5 rounded-lg bg-stone-700 px-2.5 py-1 text-[11px] text-stone-200 hover:bg-stone-600 transition"
              >
                {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy cURL</>}
              </button>
            </div>
            <pre className="mt-3 text-emerald-400 overflow-x-auto leading-relaxed">{curlCmd}</pre>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleRun}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#1f3d2b] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#2a5239] transition shadow-sm"
            >
              <Play size={14} /> {loading ? "Invoking API..." : "Send Test Request"}
            </button>
          </div>

          {/* Response Inspector */}
          {response && (
            <div className="rounded-2xl border border-stone-300 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2.5 text-xs font-semibold">
                <span className="text-stone-700">Response Status: <strong className="text-emerald-700">200 OK</strong></span>
                <span className="text-stone-500">Latency: 142 ms</span>
              </div>
              <pre className="mt-3 max-h-60 overflow-y-auto rounded-xl bg-stone-50 p-4 font-mono text-xs text-stone-800 border border-stone-200">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
