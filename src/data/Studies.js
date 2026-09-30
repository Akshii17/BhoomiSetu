// Shared mock data used by LandingPage (repository + GIS), StudyDetails, and all role pages.
const row = ([id, title, type, geo, year, source, access, score, sum, tags]) => ({ id, title, type, geo, year, source, access, score, sum, tags });

export const STUDIES = [
  ["BH-2025-001", "Urban Expansion onto Agricultural Land in the Mumbai Metropolitan Region, 2015–2025", "Research Paper", "Maharashtra", 2025, "IIT Bombay", "Open", 96, "Satellite change detection shows 11.4% of peri-urban farmland converted to built-up use, concentrated along the Samruddhi and Mumbai–Pune corridors.", "urban expansion agriculture remote sensing mumbai"],
  ["BH-2024-014", "Digitised Land Records and Mutation Delays: Evidence from 120 Talukas", "Policy Brief", "Maharashtra", 2024, "Dept of Land Resources", "Open", 91, "Talukas with integrated e-Mutation cut average mutation time from 38 to 14 days; disputes fell by a fifth within two years.", "land records digitisation mutation disputes"],
  ["BH-2023-007", "Cadastral Survey Accuracy using Drone Imagery under SVAMITVA", "Technical Report", "Rajasthan", 2023, "Survey of India", "Open", 84, "Drone-based mapping achieved 4 cm positional accuracy and reduced survey time per village by roughly 60%.", "cadastral drone survey svamitva"],
  ["BH-2025-022", "Flood Vulnerability Mapping of Coastal Odisha Using Sentinel-1 SAR", "Research Paper", "Odisha", 2025, "IIT Kharagpur", "Open", 88, "Identifies 14 high-exposure blocks where 1-in-25-year floods would affect more than 30% of cultivated land.", "flood climate vulnerability sar odisha"],
  ["BH-2022-031", "Land Dispute Hotspots in Uttar Pradesh: A Spatial Analysis of Civil Court Data", "Dataset", "Uttar Pradesh", 2022, "NJDG / NIC", "Registered", 79, "Geocoded 2.1 million land-related cases; hotspots cluster in districts with fragmented holdings and outdated records.", "disputes court hotspot uttar pradesh"],
  ["BH-2024-019", "Impact Evaluation of Consolidation of Holdings on Farm Productivity", "Case Study", "Gujarat", 2024, "IIM Ahmedabad", "Open", 82, "Consolidated villages reported 9% higher yields and lower irrigation costs compared with matched control villages.", "consolidation agriculture productivity policy"],
  ["BH-2021-003", "Land Use Land Cover Atlas of Karnataka, 2005–2020", "Dataset", "Karnataka", 2021, "NRSC / ISRO", "Open", 75, "Fifteen-year LULC time series at 30 m resolution with accuracy assessment, covering all 31 districts.", "lulc atlas karnataka satellite"],
  ["BH-2025-010", "Simulating Transfer-of-Development-Rights Reform in Tier-2 Cities", "Policy Brief", "Pan-India", 2025, "NITI Aayog", "Restricted", 86, "A policy simulation projects 6–9% more land released for housing with limited impact on green cover.", "policy simulation tdr urban housing"],
  ["BH-2023-026", "Groundwater Stress and Land Use Change in Semi-arid Rajasthan", "Research Paper", "Rajasthan", 2023, "IIT Jodhpur", "Open", 73, "Irrigated area expanded 22% while the water table fell 0.6 m per year; cropping shifts recommended for 9 blocks.", "groundwater climate land use rajasthan"],
  ["BH-2024-033", "Legal Review of Land Acquisition and Rehabilitation Provisions, 2013–2024", "Legal Document", "Pan-India", 2024, "National Law University", "Open", 70, "Compares state amendments to the 2013 Act and flags provisions linked to project delays and litigation.", "legal acquisition rehabilitation law"],
  ["BH-2022-018", "Highway Corridors and Land Value Appreciation: Evidence from Five States", "Case Study", "Pan-India", 2022, "NHAI / IIM Bangalore", "Registered", 77, "Parcels within 5 km of new highways appreciated 18–35% within three years of completion.", "highway infrastructure land value corridor"],
  ["BH-2025-037", "AI-assisted Extraction of Land Titles from Handwritten Records", "Technical Report", "Uttar Pradesh", 2025, "IIIT Hyderabad", "Open", 81, "OCR and language models reached 93% field-level accuracy on Devanagari records, cutting manual entry by half.", "ai ocr land records digitisation"],
  ["BH-2023-040", "Forest Rights Claims and Tenure Security in Central India", "Research Paper", "Odisha", 2023, "TISS Mumbai", "Open", 68, "Community forest rights recognition correlates with lower encroachment and stronger local land governance.", "forest rights tenure community"],
  ["BH-2024-045", "Urban Heat Island Growth and Built-up Density in Bengaluru", "Research Paper", "Karnataka", 2024, "IISc Bengaluru", "Open", 80, "Land surface temperature in dense built-up zones rose 2.1°C over a decade; green buffers lowered it by up to 3°C.", "climate urban heat built-up bengaluru"],
].map(row);

export const FACETS = {
  type: ["Research Paper", "Policy Brief", "Technical Report", "Dataset", "Case Study", "Legal Document"],
  year: [2025, 2024, 2023, 2022, 2021],
  geo: ["Pan-India", "Maharashtra", "Rajasthan", "Gujarat", "Uttar Pradesh", "Karnataka", "Odisha"],
  source: ["IIT Bombay", "Dept of Land Resources", "Survey of India", "NRSC / ISRO", "NITI Aayog", "IIM Ahmedabad", "Other"],
  access: ["Open", "Registered", "Restricted"],
};

export const CITATIONS = {
  "BH-2025-001": {
    apa: "Kulkarni, S., & Rao, A. (2025). Urban Expansion onto Agricultural Land in the Mumbai Metropolitan Region, 2015–2025. Journal of Geospatial Land Governance, 18(2), 112–129. https://doi.org/10.1016/j.bhoomi.2025.001",
    bibtex: `@article{kulkarni2025urban,\n  title={Urban Expansion onto Agricultural Land in the Mumbai Metropolitan Region, 2015--2025},\n  author={Kulkarni, S. and Rao, A.},\n  journal={Journal of Geospatial Land Governance},\n  volume={18},\n  number={2},\n  pages={112--129},\n  year={2025},\n  publisher={Bhoomi / IIT Bombay}\n}`,
  },
  "BH-2024-014": {
    apa: "Department of Land Resources. (2024). Digitised Land Records and Mutation Delays: Evidence from 120 Talukas (Policy Brief No. 14). Government of India.",
    bibtex: `@techreport{dolr2024mutation,\n  title={Digitised Land Records and Mutation Delays: Evidence from 120 Talukas},\n  author={{Department of Land Resources}},\n  institution={Ministry of Rural Development, Government of India},\n  year={2024}\n}`,
  },
};

// lu = [agriculture, urban, forest, other] (%); m = [flood, heat, disputes, projects] index 0-100
const reg = (id, name, area, pts, c, lu, m, infra, projects, temp, rain, disputes, studies) => ({
  id, name, area, pts, c, lu, m: { agri: lu[0], urban: Math.min(100, lu[1] * 3), forest: lu[2] * 2, flood: m[0], heat: m[1], disp: m[2], proj: m[3] },
  infra, projects, temp, rain, disputes, studies,
});

const RAW = [
  reg("rj", "Rajasthan", "342,239", "60,90 200,60 260,130 230,230 120,240 50,170", [150, 150], [38, 4, 8, 50], [18, 88, 52, 40], "4 national highways, 1,200 km rail corridor", ["Solar land bank survey", "Rural cadastral drone mapping"], "+1.4°C", "−11%", 12840, ["BH-2023-007", "BH-2023-026"]),
  reg("gj", "Gujarat", "196,024", "40,255 130,250 215,255 195,335 120,365 30,315", [120, 305], [52, 9, 6, 33], [42, 70, 38, 78], "GIFT City, Dholera SIR, 5 expressways", ["Dholera smart city", "Land consolidation pilot"], "+1.1°C", "−6%", 9120, ["BH-2024-019"]),
  reg("up", "Uttar Pradesh", "240,928", "270,80 420,70 470,130 400,190 290,180 250,130", [360, 130], [68, 7, 4, 21], [61, 66, 94, 55], "Ganga & Purvanchal Expressways", ["e-Mutation statewide rollout", "Ganga corridor land pooling"], "+0.9°C", "−4%", 31550, ["BH-2022-031", "BH-2025-037"]),
  reg("mh", "Maharashtra", "307,713", "200,275 330,255 400,295 370,365 260,385 190,345", [290, 320], [55, 12, 17, 16], [48, 64, 72, 92], "Samruddhi Expressway, Mumbai Trans-Harbour Link", ["Mumbai Metro extension", "Samruddhi nodes land-use plan"], "+1.2°C", "−5%", 18760, ["BH-2025-001", "BH-2024-014", "BH-2022-018"]),
  reg("od", "Odisha", "155,707", "430,235 520,215 565,275 505,335 430,305", [495, 275], [44, 4, 34, 18], [90, 58, 33, 45], "Coastal highway, Paradip port linkages", ["Cyclone-resilient land planning", "Forest rights mapping"], "+0.8°C", "+3%", 7430, ["BH-2025-022", "BH-2023-040"]),
  reg("ka", "Karnataka", "191,791", "235,395 350,390 340,455 260,460", [295, 425], [56, 10, 20, 14], [22, 57, 41, 70], "Bengaluru–Mysuru Expressway, Peripheral Ring Road", ["Bhoomi-Kaveri integration", "Bengaluru lake buffer zones"], "+1.3°C", "−7%", 11080, ["BH-2021-003", "BH-2024-045"]),
];

const GEO = {
  rj: { ctr: [74.2, 26.6], poly: [[69.5,27.6],[70.3,25.0],[72.5,24.8],[74.5,23.5],[76.2,24.7],[78.2,26.0],[77.0,28.5],[75.5,30.1],[74.0,29.4],[72.0,28.5]] },
  gj: { ctr: [71.6, 22.6], poly: [[68.2,23.7],[69.5,22.4],[70.5,20.9],[72.6,20.4],[73.8,21.0],[74.3,22.2],[73.5,24.2],[71.0,24.6],[69.5,24.3]] },
  up: { ctr: [80.8, 26.8], poly: [[77.1,28.6],[78.5,30.0],[80.5,29.3],[81.5,28.8],[83.5,27.4],[84.6,27.0],[84.0,25.7],[83.3,24.2],[81.5,24.2],[79.5,25.0],[78.3,25.9],[77.5,26.7]] },
  mh: { ctr: [76.5, 19.2], poly: [[72.7,20.0],[73.8,21.2],[75.5,21.3],[76.5,21.6],[78.5,21.8],[80.3,21.5],[80.9,19.9],[79.9,19.1],[79.5,18.5],[77.5,18.0],[77.2,17.0],[76.0,15.8],[74.3,15.8],[73.3,17.5]] },
  od: { ctr: [84.5, 20.8], poly: [[81.4,19.9],[82.3,21.0],[83.2,22.3],[85.0,22.5],[86.6,22.0],[87.5,21.5],[86.9,20.3],[85.0,19.3],[84.3,18.6],[83.0,18.2],[82.0,18.9]] },
  ka: { ctr: [76.3, 14.8], poly: [[74.1,15.0],[74.5,16.5],[75.6,17.8],[77.2,17.5],[77.6,16.0],[78.5,14.5],[78.0,12.8],[77.2,11.8],[76.0,11.6],[75.3,12.5],[74.6,13.6]] },
};
export const REGIONS = RAW.map((r) => ({ ...r, ...GEO[r.id] }));

// Illustrative corridors in [lon, lat]
export const HIGHWAYS = [
  [[72.85,19.05],[73.85,18.5],[74.6,17.0],[75.7,14.5],[77.6,12.97]],
  [[77.2,28.6],[75.8,26.9],[73.7,24.6],[72.6,23.0]],
  [[77.2,28.6],[80.9,26.85],[83.0,25.3]],
  [[72.9,19.2],[75.3,19.9],[77.5,20.5],[79.1,21.15]],
];
export const RAIL = [[[72.85,19.0],[73.2,22.3],[75.8,26.9],[77.2,28.6]], [[85.8,20.3],[84.9,19.3],[83.3,18.1]]];

// Same tile sources used on the PublicUser map
export const BASEMAPS = {
  street: { label: "Street", max: 19, attr: "© OpenStreetMap contributors", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"] },
  satellite: { label: "Satellite", max: 18, attr: "Esri, Maxar, Earthstar Geographics", tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"] },
  terrain: { label: "Terrain", max: 17, attr: "© OpenTopoMap (CC-BY-SA)", tiles: ["https://a.tile.opentopomap.org/{z}/{x}/{y}.png"] },
};
export const baseStyle = () => ({
  version: 8,
  sources: Object.fromEntries(Object.entries(BASEMAPS).map(([k, c]) => [k, { type: "raster", tiles: c.tiles, tileSize: 256, maxzoom: c.max, attribution: c.attr }])),
  layers: Object.keys(BASEMAPS).map((k) => ({ id: "base-" + k, type: "raster", source: k, layout: { visibility: k === "satellite" ? "visible" : "none" } })),
});

export const MAP_LAYERS = {
  "Land Use": [
    ["agri", "Agricultural land", "#7a8f3c"],
    ["urban", "Urban built-up", "#7b6a58"],
    ["forest", "Forest cover", "#1f5a3a"],
  ],
  "Water & Resources": [
    ["water", "Surface water bodies", "#2b75a0"],
    ["groundwater", "Groundwater stress", "#4b8ea8"],
  ],
  Climate: [
    ["flood", "Flood risk", "#2f6f9a"],
    ["heat", "Heat stress", "#b4532a"],
    ["drought", "Drought vulnerability", "#c2893f"],
  ],
  Demographics: [
    ["pop", "Population pressure", "#8a4b75"],
  ],
  Infrastructure: [
    ["hwy", "Highways", "#26282b"],
    ["rail", "Railways", "#6b5b3a"],
  ],
  Disputes: [
    ["disp", "Land disputes", "#8c2f39"],
  ],
  Projects: [
    ["proj", "Active projects", "#b8923a"],
  ],
  "Cadastral & Parcel (Locked)": [
    ["cadastral_parcels", "Cadastral Parcels (Login Required)", "#8c2f39", true],
    ["beneficiary_land", "Beneficiary Land Holdings (Login Required)", "#a0522d", true],
  ],
};

/* ---------------- 4-Level Drill-Down Dashboard Mock Data ---------------- */
export const DRILLDOWN_DATA = {
  national: {
    name: "National Overview (India)",
    area: "3,287,263 km²",
    research: { count: 1284, papers: 842, datasets: 442, topInstitutes: ["IIT Bombay", "ISRO NRSC", "IIM Ahmedabad", "Survey of India"] },
    policy: { ulpin: "78.4%", mutationDays: 18, digitisation: "94.2%", schemesActive: 14 },
    landuse: { agri: 54.2, urban: 8.6, forest: 21.7, other: 15.5, conversion5yr: "3.8%" },
    climate: { floodExposure: "18.2%", heatIndex: 64, droughtRisk: "28.5%", coastalVulnerableKm: 7516 },
    disputes: { total: 412850, resolvedPct: "68.2%", avgMonths: 14.2, pendingTribunals: 48 },
    projects: { active: 1284, onTrack: "81%", budgetUtilised: "76.4%", beneficiaries: "4.2M" },
    geospatial: { satPasses: 412, droneVillages: 184200, highResCoverage: "62%" },
    trends: { periurbanIndex: 72, poolingUptake: "42%", greenBufferDelta: "-2.1%" },
  },
  states: {
    Maharashtra: {
      name: "Maharashtra",
      area: "307,713 km²",
      districts: ["Pune", "Nashik", "Thane", "Nagpur"],
      research: { count: 284, papers: 192, datasets: 92, topInstitutes: ["IIT Bombay", "TISS Mumbai", "YASHADA"] },
      policy: { ulpin: "88.6%", mutationDays: 14, digitisation: "98.1%", schemesActive: 9 },
      landuse: { agri: 55.0, urban: 12.0, forest: 17.0, other: 16.0, conversion5yr: "4.6%" },
      climate: { floodExposure: "21.4%", heatIndex: 68, droughtRisk: "34.1%", coastalVulnerableKm: 720 },
      disputes: { total: 18760, resolvedPct: "72.4%", avgMonths: 11.8, pendingTribunals: 12 },
      projects: { active: 184, onTrack: "84%", budgetUtilised: "82.1%", beneficiaries: "820K" },
      geospatial: { satPasses: 88, droneVillages: 32400, highResCoverage: "78%" },
      trends: { periurbanIndex: 84, poolingUptake: "58%", greenBufferDelta: "-3.4%" },
    },
    Karnataka: {
      name: "Karnataka",
      area: "191,791 km²",
      districts: ["Bengaluru Urban", "Mysuru", "Belagavi", "Dharwad"],
      research: { count: 215, papers: 154, datasets: 61, topInstitutes: ["IISc Bengaluru", "IIM Bangalore", "ISRO"] },
      policy: { ulpin: "91.2%", mutationDays: 12, digitisation: "99.0%", schemesActive: 8 },
      landuse: { agri: 56.0, urban: 10.0, forest: 20.0, other: 14.0, conversion5yr: "4.1%" },
      climate: { floodExposure: "16.8%", heatIndex: 59, droughtRisk: "31.2%", coastalVulnerableKm: 320 },
      disputes: { total: 11080, resolvedPct: "74.1%", avgMonths: 10.4, pendingTribunals: 8 },
      projects: { active: 142, onTrack: "86%", budgetUtilised: "79.3%", beneficiaries: "640K" },
      geospatial: { satPasses: 74, droneVillages: 27100, highResCoverage: "82%" },
      trends: { periurbanIndex: 79, poolingUptake: "49%", greenBufferDelta: "-2.8%" },
    },
    "Uttar Pradesh": {
      name: "Uttar Pradesh",
      area: "240,928 km²",
      districts: ["Lucknow", "Varanasi", "Gorakhpur", "Agra"],
      research: { count: 242, papers: 168, datasets: 74, topInstitutes: ["IIT Kanpur", "BHU Varanasi", "IIIT Allahabad"] },
      policy: { ulpin: "74.1%", mutationDays: 22, digitisation: "91.5%", schemesActive: 11 },
      landuse: { agri: 68.0, urban: 7.0, forest: 4.0, other: 21.0, conversion5yr: "3.2%" },
      climate: { floodExposure: "32.1%", heatIndex: 71, droughtRisk: "22.4%", coastalVulnerableKm: 0 },
      disputes: { total: 31550, resolvedPct: "61.3%", avgMonths: 17.5, pendingTribunals: 16 },
      projects: { active: 220, onTrack: "77%", budgetUtilised: "71.0%", beneficiaries: "1.4M" },
      geospatial: { satPasses: 92, droneVillages: 44200, highResCoverage: "59%" },
      trends: { periurbanIndex: 69, poolingUptake: "36%", greenBufferDelta: "-1.9%" },
    },
  },
  districts: {
    Pune: {
      name: "Pune District",
      state: "Maharashtra",
      area: "15,643 km²",
      locals: ["Haveli Taluka", "Mulshi", "Shirur", "Baramati"],
      research: { count: 82, papers: 58, datasets: 24, topInstitutes: ["Savitribai Phule Pune Univ", "CWPRS"] },
      policy: { ulpin: "94.2%", mutationDays: 9, digitisation: "99.4%", schemesActive: 6 },
      landuse: { agri: 58.2, urban: 16.4, forest: 14.1, other: 11.3, conversion5yr: "5.8%" },
      climate: { floodExposure: "14.2%", heatIndex: 62, droughtRisk: "19.5%", coastalVulnerableKm: 0 },
      disputes: { total: 4120, resolvedPct: "78.2%", avgMonths: 8.9, pendingTribunals: 4 },
      projects: { active: 48, onTrack: "89%", budgetUtilised: "88.4%", beneficiaries: "240K" },
      geospatial: { satPasses: 34, droneVillages: 1420, highResCoverage: "92%" },
      trends: { periurbanIndex: 88, poolingUptake: "64%", greenBufferDelta: "-4.2%" },
    },
    Nashik: {
      name: "Nashik District",
      state: "Maharashtra",
      area: "15,530 km²",
      locals: ["Dindori Block", "Niphad", "Sinnar", "Igatpuri"],
      research: { count: 44, papers: 31, datasets: 13, topInstitutes: ["KTHM College", "Maharashtra Eng Research Academy"] },
      policy: { ulpin: "89.1%", mutationDays: 14, digitisation: "96.2%", schemesActive: 5 },
      landuse: { agri: 61.2, urban: 9.4, forest: 21.8, other: 7.6, conversion5yr: "3.7%" },
      climate: { floodExposure: "12.8%", heatIndex: 58, droughtRisk: "24.6%", coastalVulnerableKm: 0 },
      disputes: { total: 2940, resolvedPct: "68.4%", avgMonths: 11.2, pendingTribunals: 2 },
      projects: { active: 36, onTrack: "82%", budgetUtilised: "79.1%", beneficiaries: "165K" },
      geospatial: { satPasses: 28, droneVillages: 1180, highResCoverage: "74%" },
      trends: { periurbanIndex: 71, poolingUptake: "42%", greenBufferDelta: "-2.1%" },
    },
    "Bengaluru Urban": {
      name: "Bengaluru Urban",
      state: "Karnataka",
      area: "2,196 km²",
      locals: ["Devanahalli", "Anekal", "Yelahanka", "Bangalore South"],
      research: { count: 112, papers: 84, datasets: 28, topInstitutes: ["IISc", "IIIT-B", "ISRO Headquarters"] },
      policy: { ulpin: "96.8%", mutationDays: 7, digitisation: "100.0%", schemesActive: 7 },
      landuse: { agri: 24.1, urban: 58.4, forest: 8.2, other: 9.3, conversion5yr: "8.4%" },
      climate: { floodExposure: "28.4%", heatIndex: 81, droughtRisk: "12.0%", coastalVulnerableKm: 0 },
      disputes: { total: 5410, resolvedPct: "81.0%", avgMonths: 7.8, pendingTribunals: 5 },
      projects: { active: 56, onTrack: "91%", budgetUtilised: "92.0%", beneficiaries: "480K" },
      geospatial: { satPasses: 42, droneVillages: 640, highResCoverage: "98%" },
      trends: { periurbanIndex: 94, poolingUptake: "72%", greenBufferDelta: "-6.1%" },
    },
  },
  locals: {
    "Haveli Taluka": {
      name: "Haveli Taluka (Pune)",
      district: "Pune",
      area: "1,240 km²",
      research: { count: 28, papers: 21, datasets: 7, topInstitutes: ["Local Cadastral Cell"] },
      policy: { ulpin: "98.1%", mutationDays: 6, digitisation: "100.0%", schemesActive: 4 },
      landuse: { agri: 42.1, urban: 44.2, forest: 7.2, other: 6.5, conversion5yr: "7.9%" },
      climate: { floodExposure: "16.1%", heatIndex: 74, droughtRisk: "8.5%", coastalVulnerableKm: 0 },
      disputes: { total: 980, resolvedPct: "84.2%", avgMonths: 6.4, pendingTribunals: 1 },
      projects: { active: 18, onTrack: "94%", budgetUtilised: "94.2%", beneficiaries: "88K" },
      geospatial: { satPasses: 18, droneVillages: 112, highResCoverage: "100%" },
      trends: { periurbanIndex: 92, poolingUptake: "81%", greenBufferDelta: "-5.2%" },
    },
    "Dindori Block": {
      name: "Dindori Block (Nashik)",
      district: "Nashik",
      area: "1,310 km²",
      research: { count: 14, papers: 10, datasets: 4, topInstitutes: ["Nashik Agriculture Station"] },
      policy: { ulpin: "92.4%", mutationDays: 11, digitisation: "98.2%", schemesActive: 3 },
      landuse: { agri: 71.4, urban: 4.8, forest: 19.2, other: 4.6, conversion5yr: "2.1%" },
      climate: { floodExposure: "9.4%", heatIndex: 51, droughtRisk: "29.1%", coastalVulnerableKm: 0 },
      disputes: { total: 640, resolvedPct: "72.1%", avgMonths: 9.8, pendingTribunals: 1 },
      projects: { active: 12, onTrack: "83%", budgetUtilised: "78.4%", beneficiaries: "42K" },
      geospatial: { satPasses: 12, droneVillages: 148, highResCoverage: "81%" },
      trends: { periurbanIndex: 58, poolingUptake: "34%", greenBufferDelta: "-1.2%" },
    },
    Devanahalli: {
      name: "Devanahalli (Bengaluru)",
      district: "Bengaluru Urban",
      area: "448 km²",
      research: { count: 34, papers: 24, datasets: 10, topInstitutes: ["Airport Corridor Cell"] },
      policy: { ulpin: "99.2%", mutationDays: 5, digitisation: "100.0%", schemesActive: 5 },
      landuse: { agri: 31.0, urban: 52.1, forest: 6.4, other: 10.5, conversion5yr: "9.8%" },
      climate: { floodExposure: "22.0%", heatIndex: 84, droughtRisk: "14.2%", coastalVulnerableKm: 0 },
      disputes: { total: 1120, resolvedPct: "86.4%", avgMonths: 5.8, pendingTribunals: 2 },
      projects: { active: 22, onTrack: "95%", budgetUtilised: "96.1%", beneficiaries: "120K" },
      geospatial: { satPasses: 22, droneVillages: 84, highResCoverage: "100%" },
      trends: { periurbanIndex: 98, poolingUptake: "88%", greenBufferDelta: "-7.4%" },
    },
  },
};

/* ---------------- 17 Analytics Modules Definition ---------------- */
export const ANALYTICS_TYPES = [
  { id: "land_use_change", name: "Land-Use Change", group: "Spatial Trends", desc: "Longitudinal satellite LULC classification across decadal intervals." },
  { id: "urban_expansion", name: "Urban Expansion", group: "Spatial Trends", desc: "Peri-urban sprawl detection and built-up encroachment vector analysis." },
  { id: "agri_land_loss", name: "Agricultural Land Loss", group: "Agriculture", desc: "Prime agricultural soil conversion rates by irrigation class." },
  { id: "land_fragmentation", name: "Land Fragmentation", group: "Cadastral", desc: "Holdings size dispersion and Gini coefficient of cadastral subdivisions." },
  { id: "land_suitability", name: "Land Suitability", group: "Planning", desc: "Multi-criteria land-capability evaluation for housing and industry." },
  { id: "infra_impact", name: "Infrastructure Impact", group: "Infrastructure", desc: "Buffer-based land valuation and transit corridor development pressure." },
  { id: "climate_vuln", name: "Climate Vulnerability", group: "Environment", desc: "Overlay of 100-year flood lines, surface temperature and drought indices." },
  { id: "pop_pressure", name: "Population Pressure", group: "Demographics", desc: "Carrying capacity and population-to-arable-land spatial ratio." },
  { id: "land_conflict", name: "Land-Use Conflict", group: "Disputes", desc: "Spatial juxtaposition of forest boundaries, tribal rights and industrial leases." },
  { id: "hotspot_detect", name: "Hotspot Detection", group: "Disputes", desc: "Kernel density estimation of active court litigation and encroachment." },
  { id: "dispute_trends", name: "Dispute Trend Analysis", group: "Disputes", desc: "Tribunal disposal duration, mutation delays and filing rates." },
  { id: "proj_performance", name: "Project Performance", group: "Implementation", desc: "Infrastructure project milestones against scheduled land clearance." },
  { id: "policy_impact", name: "Policy Impact (Before/After)", group: "Policy", desc: "Difference-in-differences evaluation of land digitisation interventions." },
  { id: "trend_analysis", name: "Trend Analysis", group: "Forecasting", desc: "ARIMA time-series smoothing of state-wide revenue transactions." },
  { id: "anomaly_detect", name: "Anomaly Detection", group: "Audit", desc: "Outlier detection in registered land transaction values and stamp duty." },
  { id: "predictive_model", name: "Predictive Modelling", group: "Forecasting", desc: "Random Forest model forecasting 2030 land-use patterns under status quo." },
  { id: "scenario_analysis", name: "Scenario Analysis", group: "Policy", desc: "Policy lever sensitivity testing with Monte Carlo uncertainty bounds." },
];

/* ---------------- Innovation Portal Data ---------------- */
export const INNOVATION_PIPELINE = {
  hackathons: [
    { id: 1, title: "AI-Powered Boundary Extraction from Drone Imagery", prize: "₹5,00,000", deadline: "15 Nov 2026", org: "DoLR & Survey of India", status: "Open for Submissions", applicants: 42, theme: "Cadastral Automation" },
    { id: 2, title: "Decentralised Land Dispute Triage System", prize: "₹3,50,000", deadline: "30 Nov 2026", org: "NLU Delhi & NIC", status: "Open for Submissions", applicants: 28, theme: "Legal Tech" },
  ],
  grants: [
    { id: 1, title: "Applied Geospatial Governance Grant 2026", fund: "₹15,00,000", deadline: "20 Dec 2026", funder: "DST / ICSSR", eligibility: "Academic Institutions & Research Labs", status: "Active Call" },
    { id: 2, title: "Climate Vulnerable Land Resilience Fund", fund: "₹25,00,000", deadline: "10 Jan 2027", funder: "Ministry of Rural Development", eligibility: "Multi-institutional consortiums", status: "Active Call" },
  ],
  submissions: [
    { id: 1, title: "Spectral Crop-Water Verification Protocol", team: "AgriSense Labs", date: "Yesterday", status: "Under Peer Review", score: "88/100" },
    { id: 2, title: "Automated Devanagari Record Parsing Engine", team: "IIIT Hyderabad Research Group", date: "3 days ago", status: "Approved for Pilot", score: "94/100" },
  ],
  pilots: [
    { id: 1, name: "Nashik Peri-urban Land Pooling Pilot", site: "Nashik, MH", partner: "MHADA & Revenue Dept", budget: "₹45 Lakh", progress: 68, impact: "Cut parcel assembly time by 42%" },
    { id: 2, name: "Coastal Salinity Mapping & Community Land Banks", site: "Puri, Odisha", partner: "Odisha Coastal Zone Authority", budget: "₹32 Lakh", progress: 54, impact: "8,200 ha mapped for salt-tolerant zoning" },
  ],
  caseStudies: [
    { id: 1, title: "Samruddhi Expressway Land Pooling Success Factor Analysis", author: "IIM Ahmedabad", sector: "Infrastructure", year: 2025, summary: "Voluntary land pooling mechanism reduced court litigation by 78% compared with conventional acquisition." },
    { id: 2, title: "Digital Mutation & Court e-Filing Integration in Belagavi", author: "NLSIU Bengaluru", sector: "Disputes", year: 2024, summary: "Real-time mutation freeze upon suit registration prevented 410 fraudulent subsequent transfers." },
  ],
};

/* ---------------- Data Catalogue for Agency & Admin ---------------- */
export const DATA_CATALOGUE = [
  { id: 1, name: "ULPIN Cadastral Land Parcels (Maharashtra)", source: "Revenue Dept. MH", geo: "Maharashtra", freq: "Weekly sync", access: "Restricted", quality: 96, rows: "18.2M parcels", format: "PostGIS / GeoJSON" },
  { id: 2, name: "Sentinel-2 10m LULC Surface Grid", source: "ISRO / NRSC", geo: "Pan-India", freq: "Monthly", access: "Public", quality: 91, rows: "412 raster tiles", format: "Cloud Optimized GeoTIFF" },
  { id: 3, name: "Census Village Amenities & Socio-Economics", source: "Census of India", geo: "Pan-India", freq: "Decennial + intercensal", access: "Public", quality: 88, rows: "640K villages", format: "Parquet / CSV" },
  { id: 4, name: "Civil Court Land Dispute Geocoded Registries", source: "e-Courts / DoLR", geo: "Pan-India", freq: "Bi-weekly", access: "Restricted", quality: 79, rows: "2.1M proceedings", format: "PostgreSQL" },
  { id: 5, name: "SVAMITVA Village Drone Orthomosaic Maps", source: "Survey of India", geo: "12 States", freq: "Continuous", access: "Registered", quality: 94, rows: "184K village maps", format: "GeoTIFF / GeoPackage" },
  { id: 6, name: "State Forest Advisory Clearances & Encroachments", source: "MoEFCC", geo: "Pan-India", freq: "Quarterly", access: "Registered", quality: 85, rows: "42K clearances", format: "GeoJSON" },
];

/* ---------------- Document Processing Status (Knowledge Hub) ---------------- */
export const KNOWLEDGE_HUB_DOCS = [
  { id: "DOC-8901", title: "National Land Records Modernisation Programme 2.0 Guidelines.pdf", size: "14.2 MB", ocr: "Completed (100%)", metadata: "Indexed", chunking: "582 chunks", embeddings: "text-embedding-3 (1536d)", searchable: true },
  { id: "DOC-8902", title: "Maharashtra Land Revenue Code (Amendments up to 2025).pdf", size: "28.6 MB", ocr: "Completed (100%)", metadata: "Indexed", chunking: "1,240 chunks", embeddings: "text-embedding-3 (1536d)", searchable: true },
  { id: "DOC-8903", title: "Karnataka Bhoomi-Kaveri Technical Integration Architecture.pdf", size: "8.4 MB", ocr: "Completed (100%)", metadata: "Indexed", chunking: "318 chunks", embeddings: "text-embedding-3 (1536d)", searchable: true },
  { id: "DOC-8904", title: "SVAMITVA Drone Survey Positional Accuracy Standard v3.1.pdf", size: "5.1 MB", ocr: "In Progress (64%)", metadata: "Pending", chunking: "Queued", embeddings: "Pending", searchable: false },
];