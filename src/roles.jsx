import React from "react";
import { Lock, ShieldAlert, AlertTriangle } from "lucide-react";

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

/**
 * Access Matrix:
 * Feature | Public | Researcher | Policymaker | Agency | Academic | Industry | Admin
 * Repository | public only | upload | view | upload | upload | view | manage
 * AI assistant | public content | yes | yes | yes | yes | yes | yes
 * GIS maps | public layers | yes | yes | yes (manage layers) | yes | limited | yes
 * Analytics | no | yes | yes | yes | yes | limited | yes
 * Policy simulation | no | yes | yes (primary) | yes | view only | no | yes
 * Workspaces | no | yes | yes | yes | yes (manage) | yes | manage
 * Innovation portal | view | yes | post challenges | yes | yes | yes | manage
 * Dashboards | public | yes | yes | yes | yes | yes | yes
 * Report export | public | yes | yes | yes | yes | yes | yes
 * APIs | no | yes | no | yes (primary) | yes | yes | manage
 * Feedback | yes | yes | yes | yes | yes | yes | resolve
 */
export const ACCESS_MATRIX = {
  Repository: {
    public: "public only",
    researcher: "upload",
    policymaker: "view",
    agency: "upload",
    academic: "upload",
    industry: "view",
    admin: "manage",
  },
  "AI assistant": {
    public: "public content",
    researcher: "yes",
    policymaker: "yes",
    agency: "yes",
    academic: "yes",
    industry: "yes",
    admin: "yes",
  },
  "GIS maps": {
    public: "public layers",
    researcher: "yes",
    policymaker: "yes",
    agency: "yes (manage layers)",
    academic: "yes",
    industry: "limited",
    admin: "yes",
  },
  Analytics: {
    public: "no",
    researcher: "yes",
    policymaker: "yes",
    agency: "yes",
    academic: "yes",
    industry: "limited",
    admin: "yes",
  },
  "Policy simulation": {
    public: "no",
    researcher: "yes",
    policymaker: "yes (primary)",
    agency: "yes",
    academic: "view only",
    industry: "no",
    admin: "yes",
  },
  Workspaces: {
    public: "no",
    researcher: "yes",
    policymaker: "yes",
    agency: "yes",
    academic: "yes (manage)",
    industry: "yes",
    admin: "manage",
  },
  "Innovation portal": {
    public: "view",
    researcher: "yes",
    policymaker: "post challenges",
    agency: "yes",
    academic: "yes",
    industry: "yes",
    admin: "manage",
  },
  Dashboards: {
    public: "public",
    researcher: "yes",
    policymaker: "yes",
    agency: "yes",
    academic: "yes",
    industry: "yes",
    admin: "yes",
  },
  "Report export": {
    public: "public",
    researcher: "yes",
    policymaker: "yes",
    agency: "yes",
    academic: "yes",
    industry: "yes",
    admin: "yes",
  },
  APIs: {
    public: "no",
    researcher: "yes",
    policymaker: "no",
    agency: "yes (primary)",
    academic: "yes",
    industry: "yes",
    admin: "manage",
  },
  Feedback: {
    public: "yes",
    researcher: "yes",
    policymaker: "yes",
    agency: "yes",
    academic: "yes",
    industry: "yes",
    admin: "resolve",
  },
};

/**
 * Check if a role has access to a feature.
 * Returns true if the permission is NOT 'no' and exists.
 */
export function hasAccess(role, feature) {
  const perm = ACCESS_MATRIX[feature]?.[role];
  if (!perm || perm === "no") return false;
  return true;
}

/**
 * Get the specific permission string for a role on a feature.
 */
export function getPermission(role, feature) {
  return ACCESS_MATRIX[feature]?.[role] || "no";
}

/**
 * Security Chain steps for RBAC auditing
 */
export const SECURITY_CHAIN = [
  { id: "auth", name: "Authentication", desc: "Session token & password verification with role attribution" },
  { id: "rbac", name: "RBAC", desc: "Access matrix rule enforcement at route and component levels" },
  { id: "perms", name: "Dataset Permissions", desc: "Granular access checks: Public, Registered, Restricted, Private" },
  { id: "api", name: "API Authorisation", desc: "Role-scoped bearer key verification & rate limiting" },
  { id: "audit", name: "Audit Logs", desc: "Immutable logging of every query, mutation and export" },
];

/**
 * Closed-loop System Architecture Flow
 */
export const SYSTEM_FLOW = [
  { step: "Data Sources", detail: "Land records, satellite, GIS layers, census, climate, court disputes" },
  { step: "Connectors", detail: "State Bhulekh APIs, ISRO/NRSC WMS, open data portals, batch uploads" },
  { step: "Raw Data Store", detail: "Object storage bucket staging incoming spatial and tabular files" },
  { step: "Cleaning & Validation", detail: "Deduplication, geometry repair, missing-value flags, schema verification" },
  { step: "Standardisation & Geo-linking", detail: "ULPIN cadastral linking, census codes, PostGIS projection (EPSG:4326)" },
  { step: "Central Core Store", detail: "PostgreSQL/PostGIS database + embedded vector knowledge hub" },
  { step: "Intelligence Engines", detail: "GIS Map Engine, 17 Analytics Modules, AI/RAG Assistant, Knowledge Hub" },
  { step: "Policy Simulation", detail: "Multi-lever scenario builder, baseline comparison, reproducibility metadata" },
  { step: "Collaboration & Innovation", detail: "Workspaces, Hackathons, Research Grants, Innovation Submissions, Pilots" },
  { step: "Dashboards & Reports", detail: "4-level drill-down dashboards, multi-format export (PDF/Excel/CSV)" },
  { step: "Monitoring & Evaluation", detail: "Expected vs actual tracking, milestone audits, environmental indicators" },
  { step: "Feedback Loop", detail: "Field evidence and dispute updates feed back as new data into the pipeline" },
];

/**
 * <Gate> Component:
 * Guards children based on role permissions from ACCESS_MATRIX.
 * If permission is "no", shows a clear and accessible fallback message.
 */
export function Gate({ role = "public", feature, children, fallback = null, requireAction = null }) {
  const perm = getPermission(role, feature);
  const roleName = ROLES[role]?.label || role;

  if (perm === "no") {
    if (fallback) return fallback;
    return (
      <div className="rounded-2xl border border-stone-300 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-stone-100 text-stone-500">
          <Lock size={22} />
        </div>
        <h3 className="mt-3 font-['Newsreader',serif] text-xl font-semibold text-[#1f3d2b]">
          {feature} is not available for your role
        </h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-stone-600">
          Your current profile ({roleName}) does not have access permissions for {feature.toLowerCase()}.
          Authorized roles for this feature include{" "}
          <strong className="text-stone-800">
            {Object.entries(ACCESS_MATRIX[feature] || {})
              .filter(([, p]) => p !== "no")
              .map(([r]) => ROLES[r]?.label || r)
              .join(", ")}
          </strong>.
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
          <ShieldAlert size={14} className="text-[#b8923a]" />
          Access Level: Restricted (RBAC Matrix)
        </div>
      </div>
    );
  }

  // If specific action is required (e.g. "upload", "manage"), check if permitted
  if (requireAction && !perm.includes(requireAction) && perm !== "yes" && perm !== "manage") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 flex items-center gap-2">
        <AlertTriangle size={16} className="shrink-0 text-amber-600" />
        <span>You have <strong>{perm}</strong> permission for {feature}. Action <em>{requireAction}</em> requires elevated role privileges.</span>
      </div>
    );
  }

  return <>{children}</>;
}