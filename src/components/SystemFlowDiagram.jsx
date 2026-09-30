import { useState } from "react";
import {
  Database, Workflow, ShieldCheck, ArrowRight, RefreshCw, Sparkles, Sliders, Users, BarChart3, Lock, Eye,
} from "lucide-react";
import { SYSTEM_FLOW, SECURITY_CHAIN } from "../roles";

export default function SystemFlowDiagram() {
  const [activeStep, setActiveStep] = useState(0);

  const ME_CYCLE = [
    { name: "1. Research", desc: "Scientific studies & satellite evidence identification" },
    { name: "2. Policy", desc: "Regulatory reform, draft bills & land-pooling frameworks" },
    { name: "3. Implementation", desc: "ULPIN rollout, e-Mutation & infrastructure deployment" },
    { name: "4. Monitoring", desc: "Drone audits, high-resolution SAR & dispute tracking" },
    { name: "5. New Evidence", desc: "Refreshed spatial datasets feedback into national repository" },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Closed-Loop System Architecture Flow */}
      <div className="rounded-2xl border border-stone-300 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#b8923a]">End-to-End System Lineage</span>
            <h3 className="font-['Newsreader',serif] text-2xl font-semibold text-[#1f3d2b] mt-0.5">
              Closed-Loop Data &amp; Governance Flow
            </h3>
            <p className="text-xs text-stone-600 mt-1 max-w-xl">
              From raw telemetry and state revenue registries through spatial cleaning, vector embeddings, policy simulation, and iterative evidence monitoring.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1f3d2b] bg-[#e3ecdf] px-3 py-1.5 rounded-full">
            <RefreshCw size={13} className="animate-spin" /> Continuous Data Feedback Loop
          </div>
        </div>

        {/* Horizontal Flow Steps */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {SYSTEM_FLOW.map((s, i) => (
            <div
              key={i}
              onClick={() => setActiveStep(i)}
              className={`cursor-pointer rounded-xl p-3 border transition text-left ${
                activeStep === i
                  ? "border-[#1f3d2b] bg-[#1f3d2b] text-white shadow-md"
                  : "border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold ${activeStep === i ? "text-[#ffd166]" : "text-stone-400"}`}>
                  Step {i + 1}
                </span>
                {i < SYSTEM_FLOW.length - 1 ? (
                  <ArrowRight size={11} className={activeStep === i ? "text-white" : "text-stone-300"} />
                ) : (
                  <RefreshCw size={11} className="text-[#b8923a]" />
                )}
              </div>
              <h4 className="mt-1 text-xs font-bold leading-tight">{s.step}</h4>
            </div>
          ))}
        </div>

        {/* Detailed Step Inspector */}
        <div className="mt-5 rounded-xl bg-[#faf7f1] p-4 border border-stone-200 flex items-start gap-3 text-xs">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#1f3d2b] text-[#d2b067] font-bold">
            {activeStep + 1}
          </span>
          <div>
            <h4 className="font-bold text-stone-900">{SYSTEM_FLOW[activeStep].step}</h4>
            <p className="mt-0.5 text-stone-600 leading-relaxed">{SYSTEM_FLOW[activeStep].detail}</p>
          </div>
        </div>
      </div>

      {/* 2. Security Chain & M&E Dual Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Security & Access Chain */}
        <div className="rounded-2xl border border-stone-300 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
            <ShieldCheck size={18} className="text-[#1f3d2b]" />
            <h4 className="font-semibold text-stone-900 text-sm">Security &amp; RBAC Authorization Chain</h4>
          </div>
          <p className="mt-2 text-xs text-stone-600">
            Every query and data mutation passes through strict sequential policy gates:
          </p>
          <div className="mt-4 space-y-2.5">
            {SECURITY_CHAIN.map((sec, i) => (
              <div key={sec.id} className="flex items-center justify-between rounded-xl bg-stone-50 p-2.5 border border-stone-200 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[#1f3d2b] text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <strong className="text-stone-900">{sec.name}</strong>
                    <p className="text-[11px] text-stone-500">{sec.desc}</p>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Enforced
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monitoring & Evaluation Cycle */}
        <div className="rounded-2xl border border-stone-300 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
            <RefreshCw size={18} className="text-[#b8923a]" />
            <h4 className="font-semibold text-stone-900 text-sm">Continuous M&amp;E Governance Cycle</h4>
          </div>
          <p className="mt-2 text-xs text-stone-600">
            Iterative feedback loop connecting research evidence to administrative outcomes:
          </p>
          <div className="mt-4 space-y-2.5">
            {ME_CYCLE.map((stage, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-[#faf7f1] p-2.5 border border-stone-200 text-xs">
                <div>
                  <strong className="text-[#1f3d2b]">{stage.name}</strong>
                  <p className="text-[11px] text-stone-600">{stage.desc}</p>
                </div>
                {i < ME_CYCLE.length - 1 ? (
                  <ArrowRight size={14} className="text-stone-400 shrink-0" />
                ) : (
                  <RefreshCw size={14} className="text-[#b8923a] shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
