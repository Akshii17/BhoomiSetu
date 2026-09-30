import { useState } from "react";
import {
  FolderKanban, Users, Database, FileText, MessageSquare, MapPin, CheckCircle2, Plus, X, Upload, Send, ExternalLink,
} from "lucide-react";

export default function WorkspaceModal({ isOpen, onClose, role = "academic", initialProject = null }) {
  const [activeTab, setActiveTab] = useState("overview"); // overview, members, datasets, docs, discussion
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([
    { id: 1, user: "Dr. Kavya Nair (IISc)", text: "Updated the coastal flood polygon shapefiles. Please verify parcel overlap with local settlement boundaries.", time: "2h ago" },
    { id: 2, user: "TerraSense Analytics (Industry)", text: "Completed Sentinel-2 10m automated cloud-removal pass. Results synced to workspace store.", time: "4h ago" },
  ]);

  if (!isOpen) return null;

  const project = initialProject || {
    name: "Farmland Fragmentation & Sprawl in Mumbai-Pune Corridor",
    id: "WS-MH-2026-08",
    lead: "Dr. Meera Iyer (IIT Bombay)",
    progress: 68,
    members: [
      { name: "Dr. Meera Iyer", role: "Principal Investigator", org: "IIT Bombay", type: "academic" },
      { name: "Ananya Rao", role: "Senior Researcher", org: "Autonomous", type: "researcher" },
      { name: "R. K. Sharma", role: "Government Liaison", org: "DoLR", type: "agency" },
      { name: "TerraSense Analytics", role: "Industry Partner", org: "TerraSense", type: "industry" },
    ],
    datasets: [
      { name: "cadastral_pune_periurban_v2.gpkg", size: "142 MB", access: "Shared within Workspace", rows: "34,200 parcels" },
      { name: "samruddhi_corridor_highways_buffer.geojson", size: "28 MB", access: "Shared within Workspace", rows: "1,200 km" },
      { name: "nashik_civil_court_disputes_2024.csv", size: "12 MB", access: "Shared within Workspace", rows: "4,120 cases" },
    ],
    documents: [
      { name: "Methodology_Note_Cadastral_Sprawl_v3.pdf", updated: "Yesterday", author: "Dr. Meera Iyer" },
      { name: "Interim_Findings_Samruddhi_Pooling.docx", updated: "3 days ago", author: "Ananya Rao" },
    ],
  };

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments([
      ...comments,
      { id: Date.now(), user: `You (${role})`, text: commentText.trim(), time: "Just now" },
    ]);
    setCommentText("");
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#26282b]/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#faf7f1] border-t-4 border-[#b8923a] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-stone-200 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#e3ecdf] px-2.5 py-0.5 text-xs font-semibold text-[#1f3d2b]">
                {project.id}
              </span>
              <span className="text-xs text-stone-500">Lead: {project.lead}</span>
            </div>
            <h2 className="mt-1 font-['Newsreader',serif] text-2xl font-semibold text-[#1f3d2b]">
              {project.name}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-stone-400 hover:bg-stone-100">
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-100 px-6 gap-1 text-xs font-semibold overflow-x-auto">
          {[
            ["overview", "Overview & Progress"],
            ["members", `Members (${project.members.length})`],
            ["datasets", `Shared Datasets (${project.datasets.length})`],
            ["docs", `Shared Documents (${project.documents.length})`],
            ["discussion", `Comments (${comments.length})`],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`py-3 px-4 border-b-2 font-medium transition shrink-0 ${
                activeTab === id
                  ? "border-[#1f3d2b] text-[#1f3d2b] bg-[#faf7f1] font-bold"
                  : "border-transparent text-stone-600 hover:text-stone-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-stone-300 bg-white p-5">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                  <span>Project Completion Progress</span>
                  <strong className="text-[#1f3d2b] text-sm">{project.progress}%</strong>
                </div>
                <div className="mt-2 h-2.5 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1f3d2b]" style={{ width: `${project.progress}%` }} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                    <p className="text-stone-500">Datasets Linked</p>
                    <p className="mt-0.5 font-bold text-stone-900">{project.datasets.length}</p>
                  </div>
                  <div className="rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                    <p className="text-stone-500">Draft Chapters</p>
                    <p className="mt-0.5 font-bold text-stone-900">4 / 6</p>
                  </div>
                  <div className="rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                    <p className="text-stone-500">Peer Reviews</p>
                    <p className="mt-0.5 font-bold text-emerald-700">2 Approved</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-stone-300 bg-white p-5">
                <h3 className="font-semibold text-stone-900 text-sm">Key Research Findings &amp; Spatial Insights</h3>
                <ul className="mt-3 space-y-2 text-xs text-stone-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#1f3d2b]" />
                    <span><strong>11.4% conversion:</strong> Irrigated farmland around Pune ring road decreased by 11.4% over 2018–2025.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#1f3d2b]" />
                    <span><strong>Mutation speedup:</strong> Talukas with ULPIN linkage resolved mutation requests 62% faster than paper registries.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#1f3d2b]" />
                    <span><strong>Dispute concentration:</strong> 72% of pending civil suits correspond to unpartitioned joint family ancestral holdings.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-600">Cross-institutional research team with role-based workspace permissions.</p>
                {["academic", "admin"].includes(role) && (
                  <button className="flex items-center gap-1 rounded-lg bg-[#1f3d2b] px-3 py-1.5 text-xs font-semibold text-white">
                    <Plus size={13} /> Add Collaborator
                  </button>
                )}
              </div>
              <div className="overflow-hidden rounded-xl border border-stone-300 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="p-3 font-semibold text-stone-600">Member</th>
                      <th className="p-3 font-semibold text-stone-600">Project Role</th>
                      <th className="p-3 font-semibold text-stone-600">Organisation</th>
                      <th className="p-3 font-semibold text-stone-600">Role Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {project.members.map((m, i) => (
                      <tr key={i} className="hover:bg-stone-50">
                        <td className="p-3 font-semibold text-stone-900">{m.name}</td>
                        <td className="p-3 text-stone-700">{m.role}</td>
                        <td className="p-3 text-stone-500">{m.org}</td>
                        <td className="p-3">
                          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-700 uppercase">
                            {m.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "datasets" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-600">Datasets verified against schema and shared securely within this workspace.</p>
                <button className="flex items-center gap-1 rounded-lg bg-[#1f3d2b] px-3 py-1.5 text-xs font-semibold text-white">
                  <Upload size={13} /> Upload Dataset
                </button>
              </div>
              <div className="space-y-2">
                {project.datasets.map((d, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-3.5">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-stone-100 text-[#1f3d2b]">
                        <Database size={16} />
                      </span>
                      <div>
                        <p className="font-semibold text-stone-900 text-xs">{d.name}</p>
                        <p className="text-[11px] text-stone-500">{d.size} · {d.rows}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#e3ecdf] text-[#1f3d2b] px-2.5 py-0.5 text-[11px] font-medium">
                      {d.access}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "docs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-600">Collaborative papers, briefs and reports under drafting.</p>
                <button className="flex items-center gap-1 rounded-lg bg-[#1f3d2b] px-3 py-1.5 text-xs font-semibold text-white">
                  <Upload size={13} /> Add Document
                </button>
              </div>
              <div className="space-y-2">
                {project.documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-3.5">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-stone-100 text-[#b8923a]">
                        <FileText size={16} />
                      </span>
                      <div>
                        <p className="font-semibold text-stone-900 text-xs">{doc.name}</p>
                        <p className="text-[11px] text-stone-500">Author: {doc.author} · Updated {doc.updated}</p>
                      </div>
                    </div>
                    <button className="text-xs font-semibold text-[#1f3d2b] hover:underline flex items-center gap-1">
                      Open <ExternalLink size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "discussion" && (
            <div className="space-y-4">
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {comments.map((c) => (
                  <div key={c.id} className="rounded-xl border border-stone-200 bg-white p-3 text-xs">
                    <div className="flex justify-between font-semibold text-stone-800">
                      <span>{c.user}</span>
                      <span className="font-normal text-stone-400 text-[10px]">{c.time}</span>
                    </div>
                    <p className="mt-1 text-stone-600">{c.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Share a finding, question or dataset update..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#1f3d2b]"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-xl bg-[#1f3d2b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2a5239]"
                >
                  <Send size={13} /> Send
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-stone-200 bg-stone-50 text-xs text-stone-500">
          <span>Role view: <strong>{role}</strong></span>
          <button onClick={onClose} className="rounded-lg border border-stone-300 bg-white px-4 py-1.5 font-semibold text-stone-700 hover:bg-stone-100">
            Close Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
