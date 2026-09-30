import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Download, Lock, LogIn, FileText, MapPin } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { STUDIES, REGIONS, baseStyle } from "../data/Studies";

function RegionMap({ region }) {
  const box = useRef(null);
  useEffect(() => {
    const map = new maplibregl.Map({ container: box.current, style: baseStyle(), center: region.ctr, zoom: 5.2, attributionControl: { compact: true } });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.on("load", () => {
      map.addSource("r", { type: "geojson", data: { type: "Feature", geometry: { type: "Polygon", coordinates: [[...region.poly, region.poly[0]]] } } });
      map.addLayer({ id: "r-fill", type: "fill", source: "r", paint: { "fill-color": "#b8923a", "fill-opacity": 0.3 } });
      map.addLayer({ id: "r-line", type: "line", source: "r", paint: { "line-color": "#ffd166", "line-width": 3 } });
    });
    return () => map.remove();
  }, [region]);
  return <div ref={box} className="mt-3 h-72 w-full overflow-hidden rounded-lg" role="img" aria-label={`${region.name} on satellite map`} />;
}

const serif = "font-['Newsreader',serif]";
const METHOD = {
  "Research Paper": "Peer-reviewed analysis combining satellite or administrative data with statistical and spatial methods.",
  "Policy Brief": "Synthesis of programme data and field evidence, summarised for decision makers.",
  "Technical Report": "Documented methods, accuracy assessment and reproducible workflow.",
  Dataset: "Curated, quality-checked records with documented schema and coverage.",
  "Case Study": "Matched comparison of treated and control areas over a multi-year window.",
  "Legal Document": "Comparative legal review of statutes, amendments and case law.",
};

export default function StudyDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const s = STUDIES.find((x) => x.id === id);
  if (!s) return <Navigate to="/" replace />;
  const region = REGIONS.find((r) => r.name === s.geo);
  const related = STUDIES.filter((x) => x.id !== s.id && (x.geo === s.geo || x.type === s.type)).slice(0, 3);
  const trend = [0, 1, 2, 3, 4].map((i) => ({ y: s.year - 4 + i, v: Math.round(40 + (s.score - 60) * 0.4 + i * 6 + (i % 2) * 3) }));
  const tags = s.tags.split(" ");
  const restricted = s.access !== "Open";
  const meta = [["Study ID", s.id], ["Type", s.type], ["Geography", s.geo], ["Year", s.year], ["Source", s.source], ["Access level", s.access], ["AI relevance", `${s.score} / 100`]];
  return (
    <div className="min-h-screen bg-[#f4efe6] font-['Public_Sans',sans-serif] text-[#26282b]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Public+Sans:wght@400;500;600&display=swap');`}</style>
      <header className="border-b border-[#1f3d2b]/15 bg-[#1f3d2b] px-5 py-3 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className={`${serif} text-xl font-semibold`}>Bhoomi</span>
          <button onClick={() => nav("/#repository")} className="flex items-center gap-1.5 text-sm hover:text-[#d2b067]"><ArrowLeft size={15} />Back to Study Repository</button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-sm text-stone-600">Study Repository / {s.type} / {s.id}</p>
        <h1 className={`${serif} mt-2 max-w-4xl text-4xl font-semibold leading-tight text-[#1f3d2b]`}>{s.title}</h1>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <section className="rounded-xl border border-stone-300 bg-white p-6">
              <h2 className={`${serif} text-2xl font-semibold`}>Summary</h2>
              <p className="mt-3 flex gap-2 rounded-lg bg-[#f4efe6] p-3 text-stone-700"><Sparkles size={16} className="mt-1 shrink-0 text-[#b8923a]" />{s.sum}</p>
              <h3 className="mt-5 font-semibold text-[#1f3d2b]">Method</h3>
              <p className="mt-1 max-w-prose text-stone-700">{METHOD[s.type]}</p>
              <h3 className="mt-5 font-semibold text-[#1f3d2b]">Keywords</h3>
              <div className="mt-2 flex flex-wrap gap-2">{tags.map((t) => <span key={t} className="rounded-full bg-[#e3ecdf] px-3 py-1 text-xs text-[#1f3d2b]">{t}</span>)}</div>
            </section>
            <section className="rounded-xl border border-stone-300 bg-white p-6">
              <h2 className={`${serif} text-2xl font-semibold`}>Indicator trend</h2>
              <p className="text-sm text-stone-500">Illustrative index for the study theme, 2015 = base. Demo data.</p>
              <div className="mt-3 h-64"><ResponsiveContainer><LineChart data={trend}><CartesianGrid stroke="#e7e0d0" /><XAxis dataKey="y" /><YAxis /><Tooltip /><Line type="monotone" dataKey="v" stroke="#1f3d2b" strokeWidth={2.5} dot={{ fill: "#b8923a", r: 4 }} /></LineChart></ResponsiveContainer></div>
            </section>
            {region && <section className="rounded-xl border border-stone-300 bg-white p-6">
              <h2 className={`${serif} flex items-center gap-2 text-2xl font-semibold`}><MapPin size={20} className="text-[#b8923a]" />Study region: {region.name}</h2>
              <RegionMap region={region} />
              <p className="mt-2 text-sm text-stone-600">{region.area} km² · {region.infra}</p>
            </section>}
            <section className="rounded-xl border border-stone-300 bg-white p-6">
              <h2 className={`${serif} text-2xl font-semibold`}>Related studies</h2>
              <ul className="mt-3 space-y-2">{related.map((r) => (
                <li key={r.id}><button onClick={() => { nav(`/study/${r.id}`); window.scrollTo(0, 0); }} className="flex w-full items-start gap-2 rounded-lg border border-stone-200 p-3 text-left hover:border-[#1f3d2b]"><FileText size={16} className="mt-0.5 shrink-0 text-[#b8923a]" /><span><span className="block font-medium">{r.title}</span><span className="text-xs text-stone-500">{r.id} · {r.year} · {r.source}</span></span></button></li>))}</ul>
            </section>
          </div>
          <aside className="h-fit space-y-4">
            <div className="rounded-xl border border-stone-300 border-t-4 border-t-[#b8923a] bg-white p-5">
              <h2 className="font-semibold text-[#1f3d2b]">Study details</h2>
              <dl className="mt-3 divide-y divide-stone-200 text-sm">{meta.map(([k, v]) => <div key={k} className="flex justify-between gap-3 py-2"><dt className="text-stone-500">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl>
            </div>
            <div className="rounded-xl border border-stone-300 bg-white p-5">
              {restricted ? (<>
                <p className="flex items-center gap-2 text-sm font-medium"><Lock size={15} />{s.access} access</p>
                <p className="mt-1 text-sm text-stone-600">{s.access === "Registered" ? "Create a free account to download the full document." : "Full access is limited to authorised government and institutional roles."}</p>
                <button onClick={() => nav("/")} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1f3d2b] py-2.5 text-sm font-medium text-white"><LogIn size={15} />Login to continue</button>
              </>) : (
                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1f3d2b] py-2.5 text-sm font-medium text-white hover:bg-[#2a5239]"><Download size={15} />Download full document</button>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}