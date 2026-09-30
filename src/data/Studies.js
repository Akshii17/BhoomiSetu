// Shared mock data used by LandingPage (repository + GIS) and StudyDetails.
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

// lu = [agriculture, urban, forest, other] (%); m = [flood, heat, disputes, projects] index 0-100
const reg = (id, name, area, pts, c, lu, m, infra, projects, temp, rain, disputes, studies) => ({
  id, name, area, pts, c, lu, m: { agri: lu[0], urban: Math.min(100, lu[1] * 3), forest: lu[2] * 2, flood: m[0], heat: m[1], disp: m[2], proj: m[3] },
  infra, projects, temp, rain, disputes, studies,
});

export const REGIONS = [
  reg("rj", "Rajasthan", "342,239", "60,90 200,60 260,130 230,230 120,240 50,170", [150, 150], [38, 4, 8, 50], [18, 88, 52, 40], "4 national highways, 1,200 km rail corridor", ["Solar land bank survey", "Rural cadastral drone mapping"], "+1.4°C", "−11%", 12840, ["BH-2023-007", "BH-2023-026"]),
  reg("gj", "Gujarat", "196,024", "40,255 130,250 215,255 195,335 120,365 30,315", [120, 305], [52, 9, 6, 33], [42, 70, 38, 78], "GIFT City, Dholera SIR, 5 expressways", ["Dholera smart city", "Land consolidation pilot"], "+1.1°C", "−6%", 9120, ["BH-2024-019"]),
  reg("up", "Uttar Pradesh", "240,928", "270,80 420,70 470,130 400,190 290,180 250,130", [360, 130], [68, 7, 4, 21], [61, 66, 94, 55], "Ganga & Purvanchal Expressways", ["e-Mutation statewide rollout", "Ganga corridor land pooling"], "+0.9°C", "−4%", 31550, ["BH-2022-031", "BH-2025-037"]),
  reg("mh", "Maharashtra", "307,713", "200,275 330,255 400,295 370,365 260,385 190,345", [290, 320], [55, 12, 17, 16], [48, 64, 72, 92], "Samruddhi Expressway, Mumbai Trans-Harbour Link", ["Mumbai Metro extension", "Samruddhi nodes land-use plan"], "+1.2°C", "−5%", 18760, ["BH-2025-001", "BH-2024-014", "BH-2022-018"]),
  reg("od", "Odisha", "155,707", "430,235 520,215 565,275 505,335 430,305", [495, 275], [44, 4, 34, 18], [90, 58, 33, 45], "Coastal highway, Paradip port linkages", ["Cyclone-resilient land planning", "Forest rights mapping"], "+0.8°C", "+3%", 7430, ["BH-2025-022", "BH-2023-040"]),
  reg("ka", "Karnataka", "191,791", "235,395 350,390 340,455 260,460", [295, 425], [56, 10, 20, 14], [22, 57, 41, 70], "Bengaluru–Mysuru Expressway, Peripheral Ring Road", ["Bhoomi-Kaveri integration", "Bengaluru lake buffer zones"], "+1.3°C", "−7%", 11080, ["BH-2021-003", "BH-2024-045"]),
];

export const HIGHWAYS = ["60,200 160,190 280,170 420,150", "120,300 210,310 300,320 400,300", "300,200 300,320 290,420"];
export const RAIL = ["70,120 180,170 270,250 300,330 290,430"];
export const MAP_LAYERS = {
  "Land Use": [["agri", "Agricultural land", "#7a8f3c"], ["urban", "Urban built-up", "#7b6a58"], ["forest", "Forest cover", "#1f5a3a"]],
  Climate: [["flood", "Flood risk", "#2f6f9a"], ["heat", "Heat stress", "#b4532a"]],
  Infrastructure: [["hwy", "Highways", "#26282b"], ["rail", "Railways", "#6b5b3a"]],
  Disputes: [["disp", "Land disputes", "#8c2f39"]],
  Projects: [["proj", "Active projects", "#b8923a"]],
};