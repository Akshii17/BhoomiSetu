import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, X, RotateCcw, BookOpen, User, ShieldAlert } from "lucide-react";
import { ROLES } from "../roles";

/* ---------------- role-aware content ---------------- */
const INTRO = {
  public: "I can explain open land data, public maps, research and policies. Try asking about your district.",
  researcher: "I can find papers and datasets, summarise literature and point you to analytics and grants.",
  policymaker: "I can compare scenarios, explain indicators and help you prepare decision reports.",
  agency: "I can check data quality, pipeline status and which districts still owe data.",
  academic: "I can help with grant applications, competitions and your institution's research output.",
  industry: "I can match you to challenges and pilots, and help you use the APIs.",
  admin: "I can summarise approvals, security events and dataset permissions.",
};
const PROMPTS = {
  public: ["Explore Nashik district", "Latest dispute trends", "How do I report a map error?", "Run a policy simulation"],
  researcher: ["Summarise land fragmentation research", "Which grants are open?", "How do I use the API?", "Latest dispute trends"],
  policymaker: ["How does the policy simulator work?", "Which districts have rising disputes?", "Explore Nashik district", "Which pilots are running?"],
  agency: ["Any data quality problems?", "Which districts have not submitted data?", "How do I use the API?", "How do I report a map error?"],
  academic: ["Which grants are open?", "Which hackathons can we run?", "Summarise land fragmentation research", "Which pilots are running?"],
  industry: ["Which challenges suit GIS and AI?", "Which pilots need partners?", "How do I use the API?", "Which grants are open?"],
  admin: ["What needs my approval?", "Any security warnings?", "Any data quality problems?", "How do I report a map error?"],
};
// Public users cannot use these features, so the assistant declines and points them to sign-in
const LOCKED_FOR_PUBLIC = ["simulat", "parcel", "api", "upload", "workspace"];

/* DEMO ANSWERS: replace reply() with a call to your backend (POST /api/ai/chat). The real
   version should retrieve documents and data filtered by the user's role, then return
   { text, sources } exactly like below. Figures should come from the database, not the model. */
const RULES = [
  { keys: ["district", "nashik", "explore"], sources: ["Land-use layer, NRSC 2025", "Dispute statistics, DoLR"],
    text: "**Nashik district summary**\n• Agriculture covers 61.2% of land, forest 21.8%, built-up 9.4%\n• Built-up area grew from 6.1% to 9.4% between 2018 and 2025\n• 68% of disputes filed in 2025 were resolved within a year\n\nThese come from released layers. Parcel-level data is restricted." },
  { keys: ["dispute"], sources: ["Dispute statistics, DoLR", "Kerala triage pilot report"],
    text: "**Dispute trends**\n• Filings rose about 7% year on year in 3 of 5 monitored districts\n• Median resolution time fell from 41 to 33 weeks where e-court linking was piloted\n• Kerala and Nashik show the sharpest improvement\n\nModel estimates are labelled separately from official counts on the dashboards." },
  { keys: ["scenario", "simulat"], sources: ["Policy simulator guide"],
    text: "**Policy simulator**\n• Choose a region and baseline\n• Set your scenario inputs\n• Review the assumptions and model version\n• Run it to see land-use, farm and climate-risk impact on a map\n\nInputs and model version are stored, so any result can be reproduced. The simulator does the calculation, and I only explain it." },
  { keys: ["fragment", "literature", "paper", "research", "study"], sources: ["Land Fragmentation in Western Maharashtra, 2010 to 2024", "Repository review: consolidation of holdings"],
    text: "**Land fragmentation: what the research says**\n• 14 papers are indexed on this topic\n• Most link inheritance-driven splitting to lower farm productivity\n• Consolidation schemes show mixed results outside a few states\n• Gap: little evidence on fragmentation and climate resilience\n\nOpen a source to read the full paper." },
  { keys: ["quality", "pipeline", "ingest", "submitted", "completeness"], sources: ["Pipeline monitor", "Data catalogue"],
    text: "**Data quality check**\n• 1 pipeline failed today: the Rajasthan Bhulekh connector (timeout after 3 retries)\n• The land dispute dataset scores 79% quality, with 214 rows missing village codes\n• 6 districts have not submitted data this quarter\n\nOpen the data quality view to fix flagged errors." },
  { keys: ["grant", "hackathon", "challenge", "pilot", "innovation"], sources: ["Innovation portal"],
    text: "**Open opportunities**\n• Parcel boundary matching from satellite imagery: hackathon, ₹5,00,000, 14 days left\n• Low-cost IoT boundary markers: grant call, ₹10,00,000, 30 days left\n• 3 pilots are recruiting partners in Nashik, Kutch and Bihar\n\nOpen the Innovation portal to join or apply." },
  { keys: ["api", "key", "endpoint"], sources: ["API reference"],
    text: "**Using the APIs**\nCreate a key on the API page, then call an endpoint such as /v1/datasets or /v1/layers/land-use?district=Nashik with an Authorization: Bearer header.\n\nKeys are limited to your role, so you only receive data you are allowed to see." },
  { keys: ["approval", "approve", "security", "warning", "permission", "audit"], sources: ["Approvals queue", "Audit log"],
    text: "**Admin overview**\n• 4 accounts await approval: 2 agency, 1 academic, 1 researcher\n• 3 failed sign-in attempts came from one address in the last hour\n• 2 datasets are set to restricted\n\nOpen Approvals or the Audit log to act." },
  { keys: ["error", "wrong", "report", "feedback", "incorrect"], sources: [],
    text: "**Reporting a problem**\nUse the Report an issue option and pick a category: wrong data, map error, document issue or feature request.\n\nName the district and layer so the data owner can find it. Admins review every report." },
];
const FALLBACK = "I can help with district summaries, land-use and dispute trends, research papers, policies and the platform's tools.\n\nTry one of the suggestions below, or ask about a specific district or topic. Figures in my answers come from the database, and each answer lists its sources.";

function reply(q, role) {
  const s = q.toLowerCase();
  if (role === "public" && LOCKED_FOR_PUBLIC.some((k) => s.includes(k))) {
    return { locked: true, sources: [], text: "That feature is for signed-in roles. As a public user you can use open research, public maps and dashboards.\n\nSign in with an approved account to use simulations, workspaces and APIs." };
  }
  const hit = RULES.find((r) => r.keys.some((k) => s.includes(k)));
  return hit ? { text: hit.text, sources: hit.sources } : { text: FALLBACK, sources: [] };
}

/* ---------------- small pieces ---------------- */
const time = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const welcome = (role) => ({ id: "welcome", from: "ai", time: time(), sources: [], text: `Namaste! I am **Bhoomi AI**.\n\n${INTRO[role] || INTRO.public}` });

// Renders **bold** and line breaks without any HTML injection
function Rich({ text }) {
  return text.split("\n").map((line, i) =>
    line === "" ? <div key={i} className="h-2" /> : <p key={i}>{line.split("**").map((s, j) => (j % 2 ? <b key={j} className="font-semibold">{s}</b> : s))}</p>
  );
}

/* ---------------- component ---------------- */
export default function BhoomiAI({ role = "public" }) {
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
    }, 900);
  };

  const clear = () => { clearTimeout(timer.current); setTyping(false); setMessages([welcome(role)]); };

  if (!open) {
    return (
      <button
        type="button" onClick={() => setOpen(true)} aria-label="Open Bhoomi AI assistant"
        className="fixed bottom-5 right-5 z-[70] flex items-center gap-3 rounded-full bg-[#1f3d2b] py-2 pl-2 pr-5 text-left text-white shadow-xl border border-[#b8923a]/40 transition hover:-translate-y-0.5 hover:shadow-2xl hover:bg-[#2a5239] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f3d2b] cursor-pointer"
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
      className="fixed bottom-5 right-5 z-[70] flex h-[600px] max-h-[calc(100vh-2.5rem)] w-[calc(100vw-2.5rem)] max-w-[430px] flex-col overflow-hidden rounded-2xl bg-[#faf7f1] font-['Public_Sans',sans-serif] shadow-2xl border border-stone-300 ring-1 ring-stone-200"
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Public+Sans:wght@400;500;600&display=swap');`}</style>

      {/* header */}
      <header className="flex items-center justify-between bg-[#1f3d2b] px-4 py-3.5 text-white border-b border-[#b8923a]/20">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#b8923a] text-[#1f3d2b]"><Sparkles size={19} /></span>
          <div>
            <p className="font-['Newsreader',serif] text-lg font-semibold leading-tight text-[#f4efe6]">Bhoomi AI</p>
            <p className="text-xs text-[#d2b067]">Land governance assistant <span className="capitalize text-stone-300">({role})</span></p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button type="button" onClick={clear} aria-label="Start a new chat" title="New chat" className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 hover:bg-white/20 transition"><RotateCcw size={15} /></button>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 hover:bg-white/20 transition"><X size={16} /></button>
        </div>
      </header>

      {/* messages */}
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
                    {m.locked && <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-700"><ShieldAlert size={13} />Sign-in needed</p>}
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
              Checking official records
              <span className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#b8923a]" style={{ animationDelay: `${i * 0.15}s` }} />)}</span>
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* quick prompts */}
      <div className="flex gap-2 overflow-x-auto border-t border-stone-200 bg-[#faf7f1] px-3 py-2.5">
        {(PROMPTS[role] || PROMPTS.public).map((p) => (
          <button key={p} type="button" disabled={typing} onClick={() => send(p)} className="shrink-0 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-[#1f3d2b] hover:bg-[#1f3d2b]/10 hover:text-[#1f3d2b] disabled:opacity-50 cursor-pointer transition">{p}</button>
        ))}
      </div>

      {/* composer */}
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="border-t border-stone-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <input
            value={input} onChange={(e) => setInput(e.target.value)} aria-label="Ask Bhoomi AI"
            placeholder="Ask about a district, paper, layer or policy"
            className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#1f3d2b] focus:ring-2 focus:ring-[#1f3d2b]/15"
          />
          <button type="submit" disabled={!input.trim() || typing} aria-label="Send" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#1f3d2b] text-white hover:bg-[#2a5239] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer transition"><Send size={16} /></button>
        </div>
        <p className="mt-2 text-[11px] text-stone-400">AI answers can be wrong. Cross-check figures against official land records.</p>
      </form>
    </section>
  );
}
