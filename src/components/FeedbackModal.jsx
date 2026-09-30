import { useState } from "react";
import { Flag, X, CheckCircle2, Upload, Send } from "lucide-react";

const CATEGORIES = [
  "Incorrect dataset",
  "Map error",
  "Document issue",
  "Research correction",
  "Platform problem",
  "Feature request",
];

export default function FeedbackModal({ isOpen, onClose, defaultCategory = CATEGORIES[0] }) {
  const [category, setCategory] = useState(defaultCategory);
  const [district, setDistrict] = useState("Nashik");
  const [layer, setLayer] = useState("Agricultural land-use");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDescription("");
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#26282b]/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-2xl bg-[#faf7f1] border-t-4 border-[#b8923a] p-6 sm:p-7 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-['Newsreader',serif] text-2xl font-semibold text-[#1f3d2b]">Report Feedback / Issue</h2>
            <p className="text-xs text-stone-600 mt-0.5">Help maintain spatial accuracy, dataset veracity, and platform reliability.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-stone-400 hover:bg-stone-200"><X size={18} /></button>
        </div>

        {submitted ? (
          <div className="mt-8 py-8 text-center space-y-2">
            <CheckCircle2 size={42} className="mx-auto text-emerald-600 animate-bounce" />
            <h3 className="font-['Newsreader',serif] text-xl font-semibold text-stone-900">Thank you for your report!</h3>
            <p className="text-xs text-stone-600 max-w-sm mx-auto">
              Your feedback has been logged in the audit queue (ID: FB-{Math.floor(1000 + Math.random() * 9000)}). The custodian agency will verify and update the layer.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Feedback Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1f3d2b]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">District / Region</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Pune, Nashik"
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1f3d2b]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Affected Layer / Dataset</label>
                <input
                  type="text"
                  value={layer}
                  onChange={(e) => setLayer(e.target.value)}
                  placeholder="e.g. Cadastral parcels"
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1f3d2b]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Detailed Description</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the discrepancy, broken link, or suggested improvement in detail..."
                className="mt-1 w-full rounded-xl border border-stone-300 bg-white p-3 text-sm outline-none focus:border-[#1f3d2b]"
              />
            </div>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-white p-3 text-center text-xs text-stone-600 hover:bg-stone-50">
              <Upload size={14} className="text-[#1f3d2b]" />
              <span>{file ? file.name : "Attach screenshot or GeoJSON error snippet (optional)"}</span>
              <input type="file" className="sr-only" onChange={(e) => setFile(e.target.files[0] || null)} />
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-[#1f3d2b] px-5 py-2 text-xs font-semibold text-white hover:bg-[#2a5239] transition shadow-sm"
              >
                <Send size={13} /> Submit Feedback
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
