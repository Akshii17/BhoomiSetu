import { useState, useRef, useEffect } from "react";
import { Bell, Check, Database, BookOpen, Flag, ShieldAlert, Sparkles, Trophy, X } from "lucide-react";

const INITIAL_NOTIFICATIONS = [
  { id: 1, category: "Datasets", title: "New dataset: ULPIN Maharashtra 2026 Sync", desc: "18,204 new cadastral parcels ingested and linked to PostGIS.", time: "10m ago", icon: Database, unread: true },
  { id: 2, category: "Research", title: "Study indexed: Peri-urban Farmland Conversion", desc: "IIT Bombay submitted new research on Samruddhi Expressway corridor.", time: "1h ago", icon: BookOpen, unread: true },
  { id: 3, category: "Milestones", title: "Nashik Land Pooling Milestone Completed", desc: "Phase 2 boundary validation reached 100% agreement.", time: "3h ago", icon: Flag, unread: true },
  { id: 4, category: "Innovation", title: "New Grant Call: Coastal Land Resilience", desc: "DST opened ₹25 Lakh consortium research funding.", time: "1d ago", icon: Trophy, unread: false },
  { id: 5, category: "Security", title: "API Rate Limit Warning (bhm_4f2a)", desc: "Connector exceeded 1,200 req/min threshold. Key suspended for audit.", time: "2d ago", icon: ShieldAlert, unread: false },
];

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [notifs, setNotifs] = useState(INITIAL_NOTIFICATIONS);
  const dropdownRef = useRef(null);

  const unreadCount = notifs.filter((n) => n.unread).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const markAllRead = () => {
    setNotifs((list) => list.map((n) => ({ ...n, unread: false })));
  };

  const markRead = (id) => {
    setNotifs((list) => list.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  const filtered = notifs.filter((n) => filter === "All" || n.category === filter);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        title="Notification Centre"
        className="relative grid h-10 w-10 place-items-center rounded-xl text-stone-600 hover:bg-stone-200/60 transition"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#8c2f39] text-[10px] font-bold text-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 sm:w-96 rounded-2xl border border-stone-300 bg-white p-4 shadow-2xl animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-[#1f3d2b] text-[#d2b067]">
                <Bell size={14} />
              </span>
              <h3 className="font-semibold text-stone-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#f3e8c9] px-2 py-0.5 text-xs font-bold text-[#6b5216]">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs font-medium text-[#1f3d2b] hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-stone-400 hover:bg-stone-100"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-2.5 flex gap-1 overflow-x-auto pb-1 text-xs">
            {["All", "Datasets", "Research", "Milestones", "Security"].map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-md px-2.5 py-1 font-medium transition shrink-0 ${
                  filter === c
                    ? "bg-[#1f3d2b] text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500">No notifications in this category.</div>
            ) : (
              filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => markRead(item.id)}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition border ${
                      item.unread
                        ? "bg-[#faf7f1] border-[#b8923a]/40"
                        : "bg-white border-stone-100 hover:bg-stone-50"
                    }`}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-stone-100 text-[#1f3d2b]">
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs font-semibold ${item.unread ? "text-[#1f3d2b]" : "text-stone-800"}`}>
                          {item.title}
                        </p>
                        <span className="text-[10px] text-stone-400 shrink-0">{item.time}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-stone-600 leading-snug line-clamp-2">{item.desc}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
