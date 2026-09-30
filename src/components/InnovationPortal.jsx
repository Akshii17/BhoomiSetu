import { useState } from "react";
import {
  Trophy, Award, Rocket, CheckCircle2, ChevronRight, Plus, ExternalLink, BookOpen, Clock, Users, ArrowUpRight,
} from "lucide-react";
import { INNOVATION_PIPELINE } from "../data/Studies";

export default function InnovationPortal({ role = "public", onPostChallenge = null, onApplyGrant = null }) {
  const [activeStage, setActiveStage] = useState("all");
  const [toast, setToast] = useState("");

  const STAGES = [
    { id: "hackathons", name: "1. Hackathons", count: INNOVATION_PIPELINE.hackathons.length, icon: Trophy },
    { id: "grants", name: "2. Research Grants", count: INNOVATION_PIPELINE.grants.length, icon: Award },
    { id: "submissions", name: "3. Innovations", count: INNOVATION_PIPELINE.submissions.length, icon: Rocket },
    { id: "pilots", name: "4. Pilot Projects", count: INNOVATION_PIPELINE.pilots.length, icon: CheckCircle2 },
    { id: "cases", name: "5. Case Studies", count: INNOVATION_PIPELINE.caseStudies.length, icon: BookOpen },
  ];

  const canPost = ["policymaker", "agency", "admin"].includes(role);
  const canApply = ["researcher", "industry", "academic"].includes(role);

  const handleAction = (itemTitle) => {
    setToast(`Applied to ${itemTitle}! Your submission has been recorded.`);
    setTimeout(() => setToast(""), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-stone-300 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#b8923a]">Open Innovation Ecosystem</span>
            <h2 className="font-['Newsreader',serif] text-2xl font-semibold text-[#1f3d2b] mt-0.5">
              Land Governance Innovation Pipeline
            </h2>
            <p className="text-xs text-stone-600 mt-1 max-w-xl">
              Track the progression from open hackathons and research grants to field pilot deployments and evaluated public case studies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canPost && (
              <button
                onClick={() => onPostChallenge && onPostChallenge()}
                className="flex items-center gap-1.5 rounded-xl bg-[#1f3d2b] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#2a5239] transition shadow-sm"
              >
                <Plus size={14} /> Post Challenge / Pilot
              </button>
            )}
            {role === "public" && (
              <span className="rounded-full bg-stone-100 border border-stone-300 px-3 py-1 text-xs font-medium text-stone-600">
                Public Showcase (View Only)
              </span>
            )}
          </div>
        </div>

        {/* 6-Stage Progress Flow Indicator */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setActiveStage("all")}
            className={`rounded-xl px-3.5 py-2 font-semibold transition ${
              activeStage === "all"
                ? "bg-[#1f3d2b] text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            All Pipeline Stages
          </button>
          {STAGES.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStage(s.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-semibold transition border ${
                activeStage === s.id
                  ? "border-[#1f3d2b] bg-[#1f3d2b] text-white"
                  : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
              }`}
            >
              <s.icon size={13} />
              {s.name}
              <span className="ml-1 rounded-full bg-[#faf7f1] px-1.5 py-0.2 text-[10px] text-stone-800 font-bold">
                {s.count}
              </span>
            </button>
          ))}
        </div>

        {toast && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-300 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} /> {toast}
          </div>
        )}
      </div>

      {/* Grid of Active Pipeline Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Hackathons */}
        {(activeStage === "all" || activeStage === "hackathons") &&
          INNOVATION_PIPELINE.hackathons.map((h) => (
            <div key={h.id} className="rounded-2xl border border-stone-300 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full bg-[#f3e8c9] px-2.5 py-0.5 font-bold text-[#6b5216]">Hackathon</span>
                  <span className="text-stone-500 font-medium">Prize: {h.prize}</span>
                </div>
                <h3 className="mt-3 font-semibold text-stone-900 text-sm leading-snug">{h.title}</h3>
                <p className="mt-1 text-xs text-stone-500">{h.org} · Theme: {h.theme}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-stone-600">
                  <span className="flex items-center gap-1"><Clock size={12} /> {h.deadline}</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {h.applicants} teams</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-700">{h.status}</span>
                {canApply && (
                  <button onClick={() => handleAction(h.title)} className="text-xs font-semibold text-[#1f3d2b] hover:underline flex items-center gap-1">
                    Join Challenge <ArrowUpRight size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}

        {/* Grants */}
        {(activeStage === "all" || activeStage === "grants") &&
          INNOVATION_PIPELINE.grants.map((g) => (
            <div key={g.id} className="rounded-2xl border border-stone-300 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full bg-[#e3ecdf] px-2.5 py-0.5 font-bold text-[#1f3d2b]">Grant Call</span>
                  <span className="text-[#1f3d2b] font-bold">{g.fund}</span>
                </div>
                <h3 className="mt-3 font-semibold text-stone-900 text-sm leading-snug">{g.title}</h3>
                <p className="mt-1 text-xs text-stone-500">{g.funder}</p>
                <p className="mt-2 text-xs text-stone-600 leading-snug">Eligibility: {g.eligibility}</p>
                <div className="mt-3 text-xs text-stone-500 flex items-center gap-1">
                  <Clock size={12} /> Deadline: {g.deadline}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#1f3d2b]">{g.status}</span>
                {canApply && (
                  <button onClick={() => handleAction(g.title)} className="text-xs font-semibold text-[#1f3d2b] hover:underline flex items-center gap-1">
                    Apply for Grant <ArrowUpRight size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}

        {/* Pilot Deployments */}
        {(activeStage === "all" || activeStage === "pilots") &&
          INNOVATION_PIPELINE.pilots.map((p) => (
            <div key={p.id} className="rounded-2xl border border-stone-300 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 font-bold text-blue-900">Live Pilot</span>
                  <span className="text-stone-500">{p.site}</span>
                </div>
                <h3 className="mt-3 font-semibold text-stone-900 text-sm leading-snug">{p.name}</h3>
                <p className="mt-1 text-xs text-stone-500">Partner: {p.partner}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-stone-600 mb-1">
                    <span>Field Progress</span>
                    <strong>{p.progress}%</strong>
                  </div>
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1f3d2b]" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
                <p className="mt-3 text-xs text-stone-700 bg-stone-50 p-2 rounded-lg border border-stone-100">
                  <strong>Impact:</strong> {p.impact}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-600">Budget: {p.budget}</span>
                <span className="text-[11px] font-medium text-stone-500">Supervised by Academic CoE</span>
              </div>
            </div>
          ))}

        {/* Evaluated Case Studies */}
        {(activeStage === "all" || activeStage === "cases") &&
          INNOVATION_PIPELINE.caseStudies.map((c) => (
            <div key={c.id} className="rounded-2xl border border-stone-300 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full bg-purple-100 px-2.5 py-0.5 font-bold text-purple-900">Case Study</span>
                  <span className="text-stone-500">{c.sector} · {c.year}</span>
                </div>
                <h3 className="mt-3 font-semibold text-stone-900 text-sm leading-snug">{c.title}</h3>
                <p className="mt-1 text-xs text-stone-500">Author: {c.author}</p>
                <p className="mt-2 text-xs text-stone-600 leading-relaxed bg-[#faf7f1] p-2.5 rounded-lg border border-stone-200">
                  {c.summary}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-800">Verified Evidence</span>
                <button className="text-xs font-semibold text-[#1f3d2b] hover:underline flex items-center gap-1">
                  Read Case Study <ArrowUpRight size={12} />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
