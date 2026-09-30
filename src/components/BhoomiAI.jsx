import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, X, RotateCcw, BookOpen, User, ShieldAlert, FileText, GitCompare, HelpCircle, Layers } from "lucide-react";
import { ROLES } from "../roles";

/* ---------------- role-aware content ---------------- */
const INTRO = {
  public: "I can explain open land data, public maps, research and policies. Try asking about your district.",
  researcher: "I can find papers and datasets, synthesise literature, identify research gaps and point you to analytics and grants.",
  policymaker: "I can compare policies, explain indicators, simulate scenarios and help you prepare decision reports.",
  agency: "I can check data quality, pipeline status, schema validation and which districts still owe data.",
  academic: "I can help with grant applications, student hackathons and your institution's research impact.",
  industry: "I can match you to open challenges, pilots seeking partners and explain the REST/GIS APIs.",
  admin: "I can summarise approvals, security events, dataset permissions and audit logs.",
};

const TOOL_CHIPS = [
  { label: "Literature Synthesis", prompt: "Synthesise research on agricultural land fragmentation in Western India" },
  { label: "Document Summarisation", prompt: "Summarise the Digital India Land Records Modernisation evaluation brief" },
  { label: "Research Gap Finder", prompt: "Identify research gaps in peri-urban land pooling and tenure security" },
  { label: "Policy Comparison", prompt: "Compare Maharashtra and Karnataka dispute resolution timelines" },
  { label: "Trend Explanation", prompt: "Explain the causes behind farmland conversion trends along expressways" },
];

const PROMPTS = {
  public: ["Explore Nashik district", "Latest dispute trends", "How do I report a map error?", "Run a policy simulation"],
  researcher: ["Synthesise land fragmentation research", "Which grants are open?", "How do I use the API?", "Latest dispute trends"],
  policymaker: ["How does the policy simulator work?", "Which districts have rising disputes?", "Explore Nashik district", "Compare state policies"],
  agency: ["Any data quality problems?", "Which districts have not submitted data?", "How do I use the API?", "How do I report a map error?"],
  academic: ["Which grants are open?", "Which hackathons can we run?", "Synthesise land fragmentation research", "Supervise a pilot"],
  industry: ["Which challenges suit GIS and AI?", "Which pilots need partners?", "How do I use the API?", "Which grants are open?"],
  admin: ["What needs my approval?", "Any security warnings?", "Any data quality problems?", "Audit log overview"],
};

const LOCKED_FOR_PUBLIC = ["simulat", "parcel", "api", "upload", "workspace"];

const RULES = [
  { keys: ["synthesise", "synthesis", "fragment"], sources: ["Land Fragmentation in Western Maharashtra (BH-2025-001)", "IIM-A Farm Consolidation Study (BH-2024-019)"],
    text: "**Literature Synthesis: Land Fragmentation**\n• **Core Finding:** Inheritance-driven parcel fragmentation decreases average operational holding sizes by 1.8% annually, driving a 9–14% yield deficit in rain-fed tracts.\n• **State Variation:** Gujarat consolidation schemes mitigated productivity losses by 9% vs matched controls; unmitigated tracts in Maharashtra show elevated dispute rates.\n• **Identified Gap:** High-resolution spatial impact on climate resilience remains under-investigated in non-irrigated zones." },
  { keys: ["summarise", "summarize", "document", "brief"], sources: ["Digitised Land Records & Mutation Delays (BH-2024-014)", "SVAMITVA Technical Report (BH-2023-007)"],
    text: "**Document Executive Summary: Digitised Land Records**\n• **Objective:** Evaluated mutation processing across 120 talukas post-e-Mutation rollout.\n• **Outcome:** Median processing duration compressed from 38 to 14 days.\n• **Dispute Impact:** Civil court filings linked to boundary inaccuracies dropped 22% within 24 months." },
  { keys: ["gap", "research gap"], sources: ["National Land Knowledge Index 2026", "DoLR Horizon Review"],
    text: "**Research Gap Identification**\n1. **Climate-Tenure Nexus:** Limited quantitative linkage between ULPIN parcel titling and farmer credit access for climate adaptation.\n2. **Peri-Urban Pooling:** Scarcity of empirical post-occupancy evaluations on commercial land pooling along major greenfield expressways.\n3. **Customary Forest Tenure:** Data deficit on community forest rights overlap with mineral concession buffers." },
  { keys: ["compare", "comparison"], sources: ["DoLR e-Courts National Dashboard", "NLU Delhi Dispute Review (BH-2024-033)"],
    text: "**Policy Comparison: Maharashtra vs Karnataka**\n• **Mutation Integration:** Karnataka Bhoomi leads at 99% automated mutation; Maharashtra stands at 98.1% with accelerated Samruddhi corridor integration.\n• **Dispute Disposal:** Karnataka median tribunal time is 10.4 months; Maharashtra records 11.8 months with targeted fast-track courts in Pune and Nashik." },
  { keys: ["trend", "explanation", "expressway", "sprawl"], sources: ["Satellite LULC Sentinel-2 2015-2025", "NHAI Corridor Impact Study (BH-2022-018)"],
    text: "**Trend Explanation: Peri-Urban Land Conversion**\n• **Driver 1:** 5 km expressway buffer zones experienced 18–35% appreciation, accelerating farmland buyouts by logistics and warehousing hubs.\n• **Driver 2:** Speculative sub-division prior to master plan gazetting has quadrupled land fragmentation index in fringe blocks." },
  { keys: ["district", "nashik", "explore"], sources: ["Land-use layer, NRSC 2025", "Dispute statistics, DoLR"],
    text: "**Nashik district summary**\n• Agriculture covers 61.2% of land, forest 21.8%, built-up 9.4%\n• Built-up area grew from 6.1% to 9.4% between 2018 and 2025\n• 68% of disputes filed in 2025 were resolved within a year\n\nThese come from released public layers. Parcel-level cadastral ownership is restricted." },
  { keys: ["dispute"], sources: ["Dispute statistics, DoLR", "Kerala triage pilot report"],
    text: "**Dispute trends**\n• Filings rose about 7% year on year in 3 of 5 monitored districts\n• Median resolution time fell from 41 to 33 weeks where e-court linking was piloted\n• Kerala and Nashik show the sharpest improvement\n\nModel estimates are labelled separately from official counts on the dashboards." },
  { keys: ["scenario", "simulat"], sources: ["Policy simulator guide", "BHM-SIM Engine v2.4"],
    text: "**Policy simulator**\n• Choose a region and baseline\n• Set your scenario inputs (farmland cap, fast-track courts, flood buffers)\n• Review the assumptions and model version\n• Run it to see land-use, farm and climate-risk impact on a map\n\nInputs and model version are stored in the Reproducibility Panel." },
  { keys: ["quality", "pipeline", "ingest", "submitted", "completeness"], sources: ["Pipeline monitor", "Data catalogue"],
    text: "**Data quality check**\n• 1 pipeline failed today: the Rajasthan Bhulekh connector (timeout after 3 retries)\n• The land dispute dataset scores 79% quality, with 214 rows missing village codes\n• 6 districts have not submitted data this quarter\n\nOpen the Agency console to review flagged geometry errors." },
  { keys: ["grant", "hackathon", "challenge", "pilot", "innovation"], sources: ["Innovation portal"],
    text: "**Open opportunities**\n• AI Boundary Extraction Challenge: hackathon, ₹5,00,000, 14 days left\n• Applied Geospatial Governance Grant: ₹15,00,000, open to research institutions\n• 2 pilots recruiting partners in Nashik and Puri\n\nOpen the Innovation portal to join or apply." },
  { keys: ["api", "key", "endpoint"], sources: ["API reference"],
    text: "**Using the APIs**\nCreate a key on the API page, then call an endpoint such as /v1/datasets or /v1/layers/land-use?district=Nashik with an Authorization: Bearer header.\n\nKeys are restricted to your role permissions." },
  { keys: ["approval", "approve", "security", "warning", "permission", "audit"], sources: ["Approvals queue", "Audit log"],
    text: "**Admin overview**\n• 4 accounts await approval: 2 agency, 1 academic, 1 researcher\n• 3 failed sign-in attempts came from one address in the last hour\n• 2 datasets are set to restricted\n\nOpen Approvals or the Audit log in the Admin dashboard." },
  { keys: ["error", "wrong", "report", "feedback", "incorrect"], sources: ["Feedback Registry"],
    text: "**Reporting a problem**\nUse the Report an issue button and choose a category: wrong data, map error, document issue or feature request.\n\nReports are routed to the verified state custodian." },
];

const FALLBACK = "I can synthesise literature, explain land-use and dispute trends, summarise research papers, compare state policies and point you to platform tools.\n\nTry one of the research tools or suggestions below. Figures in my answers come from verified databases, with cited sources.";

function reply(q, role) {
  const s = q.toLowerCase();
  if (role === "public" && LOCKED_FOR_PUBLIC.some((k) => s.includes(k))) {
    return { locked: true, sources: [], text: "That feature is for signed-in roles. As a public user you can browse open research, public maps and dashboards.\n\nSign in with an approved account to access simulations, workspaces and APIs." };
  }
  const hit = RULES.find((r) => r.keys.some((k) => s.includes(k)));
  return hit ? { text: hit.text, sources: hit.sources } : { text: FALLBACK, sources: [] };
}

const time = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const welcome = (role) => ({ id: "welcome", from: "ai", time: time(), sources: [], text: `Namaste! I am **Bhoomi AI**, your land intelligence copilot.\n\n${INTRO[role] || INTRO.public}` });

function Rich({ text }) {
  return text.split("\n").map((line, i) =>
    line === "" ? <div key={i} className="h-2" /> : <p key={i}>{line.split("**").map((s, j) => (j % 2 ? <b key={j} className="font-semibold">{s}</b> : s))}</p>
  );
}

export default function BhoomiAI({ role = "public" }) {
  const roleLabel = ROLES[role]?.label || role;
  const accent = (ROLES[role] || ROLES.public).hex;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState(() => [welcome(role)]);
  const endRef = useRef(null);
  const timer = useRef(null);
  const n = useRef(0);

  useEffect(() => {
    setMessages([welcome(role)]);
  }, [role]);

  useEffect(() => {
    const handleOpen = (e) => {
      setOpen(true);
      if (e?.detail?.query) {
        setTimeout(() => send(e.detail.query), 100);
      }
    };
    window.addEventListener("open-bhoomi-ai", handleOpen);
    return () => window.removeEventListener("open-bhoomi-ai", handleOpen);
  }, [role]);

  useEffect(() => { if (open) endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing, open]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = (text) => {
    const q = (text ?? input).trim();
    if (!q || typing) return;
    setMessages((m) => [...m, { id: `u${n.current++}`, from: "user", text: q, time: time(), sources: [] }]);
    setInput("");
    setTyping(true);
    timer.current = setTimeout(() => {
      const r = reply(q, role);
      setMessages((m) => [...m, { id: `a${n.current++}`, from: "ai", time: time(), ...r }]);
      setTyping(false);
    }, 750);
  };

  const clear = () => { clearTimeout(timer.current); setTyping(false); setMessages([welcome(role)]); };

  if (!open) {
    return (
      <button
        type="button" onClick={() => setOpen(true)} aria-label="Open Bhoomi AI assistant"
        className="fixed bottom-5 right-5 z-[70] flex items-center gap-3 rounded-full bg-[#1f3d2b] py-2 pl-2 pr-5 text-left text-white shadow-xl border border-[#b8923a]/40 transition hover:-translate-y-0.5 hover:shadow-2xl hover:bg-[#2a5239] cursor-pointer"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#b8923a] text-[#1f3d2b] shadow-sm"><Sparkles size={19} /></span>
        <span className="leading-tight">
          <span className="block font-['Newsreader',serif] text-base font-semibold">Bhoomi AI</span>
          <span className="block text-xs text-[#d2b067]">Land governance assistant</span>
        </span>
      </button>
    );
  }

  return (
    <section
      role="dialog" aria-label="Bhoomi AI assistant"
      className="fixed bottom-5 right-5 z-[70] flex h-[620px] max-h-[calc(100vh-2.5rem)] w-[calc(100vw-2.5rem)] max-w-[460px] flex-col overflow-hidden rounded-2xl bg-[#faf7f1] font-['Public_Sans',sans-serif] shadow-2xl border border-stone-300 ring-1 ring-stone-200"
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Public+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Header */}
      <header className="flex items-center justify-between bg-[#1f3d2b] px-4 py-3 text-white border-b border-[#b8923a]/20">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#b8923a] text-[#1f3d2b]"><Sparkles size={18} /></span>
          <div>
            <p className="font-['Newsreader',serif] text-lg font-semibold leading-tight text-[#f4efe6]">Bhoomi AI</p>
            <p className="text-[11px] text-[#d2b067]">RAG Spatial Intelligence Copilot</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button type="button" onClick={clear} aria-label="Start a new chat" title="New chat" className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 hover:bg-white/20 transition"><RotateCcw size={15} /></button>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 hover:bg-white/20 transition"><X size={16} /></button>
        </div>
      </header>

      {/* Access Level Badge */}
      <div className="bg-[#e3ecdf] text-[#1f3d2b] px-4 py-1.5 text-[11px] font-medium border-b border-[#1f3d2b]/10 flex items-center justify-between">
        <span>Searching within access level: <strong>{roleLabel}</strong></span>
        <span className="text-[10px] text-stone-600 bg-white/60 px-2 py-0.2 rounded border border-[#1f3d2b]/15">RAG Verified</span>
      </div>

      {/* Research Mode Chips */}
      <div className="flex gap-1.5 overflow-x-auto bg-stone-100 px-3 py-1.5 border-b border-stone-200 text-xs">
        {TOOL_CHIPS.map((tc) => (
          <button
            key={tc.label}
            type="button"
            onClick={() => send(tc.prompt)}
            className="shrink-0 rounded-lg bg-white border border-stone-300 px-2.5 py-1 text-[11px] font-medium text-stone-700 hover:border-[#1f3d2b] hover:text-[#1f3d2b] transition"
          >
            {tc.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-[#f4efe6]/50 p-4" aria-live="polite">
        {messages.map((m) => {
          const user = m.from === "user";
          return (
            <div key={m.id} className={`flex flex-col ${user ? "items-end" : "items-start"}`}>
              <div className={`flex max-w-[92%] gap-2 ${user ? "flex-row-reverse" : ""}`}>
                <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${user ? "text-white" : "bg-white text-[#1f3d2b] border border-stone-200"}`} style={user ? { background: accent || "#1f3d2b" } : undefined}>
                  {user ? <User size={14} /> : <Sparkles size={14} />}
                </span>
                <div>
                  <div className={`space-y-0.5 rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${user ? "rounded-tr-sm text-white" : "rounded-tl-sm bg-white text-stone-800 border border-stone-200"}`} style={user ? { background: accent || "#1f3d2b" } : undefined}>
                    {m.locked && <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-700"><ShieldAlert size={13} />Access Restricted to Signed-In Roles</p>}
                    <Rich text={m.text} />
                  </div>
                  {m.sources?.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {m.sources.map((s) => <span key={s} className="flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs text-stone-600 border border-stone-200"><BookOpen size={11} className="text-[#b8923a]" />{s}</span>)}
                    </div>
                  )}
                </div>
              </div>
              <span className="mt-1 px-9 text-[11px] text-stone-400">{m.time}</span>
            </div>
          );
        })}
        {typing && (
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-[#1f3d2b] border border-stone-200"><Sparkles size={14} /></span>
            <span className="flex items-center gap-1.5 rounded-2xl bg-white px-3.5 py-2.5 text-sm text-stone-500 border border-stone-200">
              Retrieving verified records
              <span className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#b8923a]" style={{ animationDelay: `${i * 0.15}s` }} />)}</span>
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex gap-1.5 overflow-x-auto border-t border-stone-200 bg-[#faf7f1] px-3 py-2">
        {(PROMPTS[role] || PROMPTS.public).map((p) => (
          <button key={p} type="button" disabled={typing} onClick={() => send(p)} className="shrink-0 rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700 hover:border-[#1f3d2b] hover:bg-[#1f3d2b]/10 hover:text-[#1f3d2b] disabled:opacity-50 cursor-pointer transition">{p}</button>
        ))}
      </div>

      {/* Input Composer */}
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="border-t border-stone-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <input
            value={input} onChange={(e) => setInput(e.target.value)} aria-label="Ask Bhoomi AI"
            placeholder="Ask anything on land records, spatial trends or policies..."
            className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#1f3d2b] focus:ring-2 focus:ring-[#1f3d2b]/15"
          />
          <button type="submit" disabled={!input.trim() || typing} aria-label="Send" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#1f3d2b] text-white hover:bg-[#2a5239] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer transition"><Send size={16} /></button>
        </div>
        <p className="mt-1.5 text-[10px] text-stone-400">RAG pipeline filters queries within your assigned role security perimeter.</p>
      </form>
    </section>
  );
}
