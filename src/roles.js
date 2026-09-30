// Single source of truth for roles: route path, accent colour and short plan.
export const ROLES = {
  public: { label: "Public user", path: "/public", hex: "#1d4ed8", plan: "Open data portal: hero AI search, national map, headline stats, district explorer." },
  researcher: { label: "Researcher", path: "/researcher", hex: "#7c3aed", plan: "Research workbench: my projects, AI paper suggestions, literature synthesis box, grants." },
  policymaker: { label: "Policymaker", path: "/policymaker", hex: "#15803d", plan: "Command centre: KPI strip, expected vs actual gauges, scenario comparison, simulator." },
  agency: { label: "Government agency", path: "/agency", hex: "#ea580c", plan: "Operations console: pipeline status, data quality scores, completeness heatmap, upload wizard." },
  academic: { label: "Academic institution", path: "/academic", hex: "#0d9488", plan: "Institution hub: publications, members, grant pipeline kanban, competitions." },
  industry: { label: "Industry expert", path: "/industry", hex: "#e11d48", plan: "Opportunity board: open challenges, pilots seeking partners, API playground." },
  admin: { label: "Admin", path: "/admin", hex: "#334155", plan: "Control room: approvals, system health, audit log, role-permission grid." },
};

// Roles a person can pick when registering (admins are created internally).
export const REGISTERABLE = Object.keys(ROLES).filter((r) => r !== "admin");