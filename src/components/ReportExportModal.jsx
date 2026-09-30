import { useState } from "react";
import { Download, FileText, CheckCircle2, Lock, X, Table, FileSpreadsheet } from "lucide-react";
import { getPermission } from "../roles";

export default function ReportExportModal({ isOpen, onClose, role = "public", defaultTitle = "Bhoomi Land Governance Intelligence Report" }) {
  const [format, setFormat] = useState("pdf");
  const [title, setTitle] = useState(defaultTitle);
  const [sections, setSections] = useState({
    summary: true,
    indicators: true,
    spatial: true,
    research: true,
    scenarios: role !== "public",
    rawCadastral: false,
  });
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const toggleSection = (k) => {
    if (k === "scenarios" && role === "public") return;
    if (k === "rawCadastral" && !["admin", "agency"].includes(role)) return;
    setSections((s) => ({ ...s, [k]: !s[k] }));
  };

  const handleDownload = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setDone(true);

      if (format === "csv" || format === "excel") {
        const csvContent =
          `"Report: ${title}"\n"Exported by Role: ${role}"\n"Date: ${new Date().toISOString()}"\n\n` +
          `"Indicator","Baseline","Actual Outcome","Status"\n` +
          `"ULPIN Cadastral Mapping","80%","78.4%","On Track"\n` +
          `"Dispute Resolution Rate","65%","68.2%","Ahead of Target"\n` +
          `"Agricultural Land Conversion","4.0%","3.8%","Within Threshold"\n` +
          `"Climate Flood Risk Exposure","20%","18.2%","Protected Zone Buffer"\n`;

        const blob = new Blob([csvContent], { type: format === "csv" ? "text/csv" : "application/vnd.ms-excel" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${format === "csv" ? "csv" : "xls"}`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // PDF simulated trigger
        window.print();
      }

      setTimeout(() => {
        setDone(false);
        onClose();
      }, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#26282b]/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-2xl bg-[#faf7f1] border-t-4 border-[#b8923a] p-6 sm:p-7 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-['Newsreader',serif] text-2xl font-semibold text-[#1f3d2b]">Export Intelligence Report</h2>
            <p className="text-xs text-stone-600 mt-0.5">Generate verified policy, research and geospatial dossiers.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-stone-400 hover:bg-stone-200"><X size={18} /></button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Report Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1f3d2b] focus:ring-2 focus:ring-[#1f3d2b]/15"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Format</label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {[
                ["pdf", "PDF Document", FileText],
                ["excel", "Excel (.xlsx)", FileSpreadsheet],
                ["csv", "CSV Raw Data", Table],
              ].map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFormat(id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition ${
                    format === id
                      ? "border-[#1f3d2b] bg-[#1f3d2b] text-white shadow-sm"
                      : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Included Sections</label>
            <div className="mt-2 space-y-2 text-sm text-stone-800">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={sections.summary} onChange={() => toggleSection("summary")} className="accent-[#1f3d2b]" />
                Executive Summary &amp; Meta-Analysis
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={sections.indicators} onChange={() => toggleSection("indicators")} className="accent-[#1f3d2b]" />
                8 Core Indicator Drilldowns (National to Local)
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={sections.spatial} onChange={() => toggleSection("spatial")} className="accent-[#1f3d2b]" />
                Geospatial Overlays &amp; Map Coordinates
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={sections.research} onChange={() => toggleSection("research")} className="accent-[#1f3d2b]" />
                Related Research Papers &amp; Policy Citations
              </label>
              <label className={`flex items-center gap-2.5 ${role === "public" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                <input
                  type="checkbox"
                  checked={sections.scenarios}
                  disabled={role === "public"}
                  onChange={() => toggleSection("scenarios")}
                  className="accent-[#1f3d2b]"
                />
                <span>Policy Simulator Multi-Lever Scenarios</span>
                {role === "public" && <span className="inline-flex items-center gap-0.5 text-[11px] text-stone-500"><Lock size={10} /> Signed-in roles</span>}
              </label>
              <label className={`flex items-center gap-2.5 ${!["admin", "agency"].includes(role) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                <input
                  type="checkbox"
                  checked={sections.rawCadastral}
                  disabled={!["admin", "agency"].includes(role)}
                  onChange={() => toggleSection("rawCadastral")}
                  className="accent-[#1f3d2b]"
                />
                <span>Raw Parcel-Level Cadastral Registry (Confidential)</span>
                {!["admin", "agency"].includes(role) && <span className="inline-flex items-center gap-0.5 text-[11px] text-stone-500"><Lock size={10} /> Agency/Admin only</span>}
              </label>
            </div>
          </div>

          <div className="rounded-xl bg-[#e3ecdf] p-3 text-xs text-[#1f3d2b]">
            <strong>Role Clearance ({role}):</strong> Exports strictly respect data governance bounds. Restricted parcel tables and draft legal decrees are redacted.
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-stone-200 pt-4">
          <button onClick={onClose} className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100">
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={exporting}
            className="flex items-center gap-2 rounded-xl bg-[#1f3d2b] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2a5239] transition disabled:opacity-50 shadow-sm"
          >
            {done ? <><CheckCircle2 size={16} /> Exported!</> : exporting ? "Compiling..." : <><Download size={16} /> Export {format.toUpperCase()}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
