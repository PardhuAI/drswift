window.DRSWIFT_PANELS = {
  kft: {
    id: "kft",
    title: "Kidney Function Test (KFT)",
    testCode: "DRS127",
    price: 42,
    description:
      "Reviews kidney filtration and electrolyte balance through creatinine, urea, eGFR, and key electrolytes. Commonly used for preventive screening, diabetes monitoring, and blood-pressure related care.",
    markers: [
      { name: "Creatinine", description: "A muscle-produced waste product filtered out by the kidneys." },
      { name: "Urea", description: "A protein waste product removed from the blood by the kidneys." },
      { name: "eGFR", description: "Estimated glomerular filtration rate — a key indicator of kidney function." },
      { name: "Sodium", description: "An electrolyte that helps regulate fluid balance and nerve function." },
      { name: "Potassium", description: "An electrolyte essential for muscle function and fluid balance." }
    ]
  },
  lft: {
    id: "lft",
    title: "Liver Function Test (LFT)",
    testCode: "DRS133",
    price: 38,
    description:
      "Checks liver enzymes and proteins that reflect how well the liver processes nutrients, medications, and waste products.",
    markers: [
      { name: "ALT", description: "An enzyme found mostly in liver cells; elevated levels may suggest liver stress." },
      { name: "AST", description: "An enzyme found in liver and other tissues; helps assess liver and muscle health." },
      { name: "ALP", description: "Alkaline phosphatase — an enzyme linked to liver and bone health." },
      { name: "Bilirubin", description: "A waste product produced as the liver breaks down red blood cells." },
      { name: "Total protein", description: "The combined amount of proteins circulating in the blood." },
      { name: "Albumin", description: "The main blood protein that helps maintain fluid balance and transport nutrients." }
    ]
  },
  cbc: {
    id: "cbc",
    title: "Complete Blood Count (CBC)",
    testCode: "DRS048",
    price: 29,
    description:
      "Counts the cells that circulate in your blood — red cells, white cells, and platelets — offering a first-line view of anemia, infection clues, and overall blood health.",
    markers: [
      { name: "Hemoglobin", description: "The oxygen-carrying protein in red blood cells." },
      { name: "WBC count", description: "White blood cells that help the body fight infection." },
      { name: "RBC count", description: "Red blood cells that carry oxygen throughout the body." },
      { name: "Platelets", description: "Cell fragments essential for normal blood clotting." },
      { name: "Hematocrit", description: "The proportion of blood volume made up of red blood cells." },
      { name: "MCV", description: "Mean corpuscular volume — the average size of red blood cells." },
      { name: "MCH", description: "Mean corpuscular hemoglobin — average hemoglobin per red blood cell." },
      { name: "MCHC", description: "Mean corpuscular hemoglobin concentration in red blood cells." }
    ]
  },
  cue: {
    id: "cue",
    title: "Complete Urine Analysis (CUE)",
    testCode: "DRS056",
    price: 24,
    description:
      "A routine urine screen that can support early detection of urinary tract infections, kidney issues, and metabolic changes such as glucose or protein in urine.",
    markers: [
      { name: "Protein (urine)", description: "Protein in urine may suggest kidney stress or infection." },
      { name: "Glucose (urine)", description: "Glucose in urine can be associated with high blood sugar." },
      { name: "pH", description: "Measures the acidity or alkalinity of urine." },
      { name: "Specific gravity", description: "Helps evaluate urine concentration and hydration status." },
      { name: "Nitrite", description: "May indicate bacterial activity linked to urinary tract infection." },
      { name: "Occult blood", description: "Detects microscopic blood in urine." },
      { name: "WBC esterase", description: "Suggests white blood cells in urine, often seen with infection." },
      { name: "Bilirubin", description: "May appear in urine when liver or bile flow is affected." },
      { name: "Urobilinogen", description: "A bilirubin breakdown product eliminated through urine." }
    ]
  },
  lipid: {
    id: "lipid",
    title: "Cholesterol and Lipid Panel",
    testCode: "DRS131",
    price: 39,
    description:
      "Measures cholesterol and lipid markers that help assess cardiovascular risk and track the effect of lifestyle or medication changes.",
    markers: [
      { name: "Total cholesterol", description: "The combined amount of cholesterol circulating in the blood." },
      { name: "HDL cholesterol", description: "Often called good cholesterol; helps remove excess cholesterol from the body." },
      { name: "LDL cholesterol", description: "Often called bad cholesterol; high levels can increase heart disease risk." },
      { name: "Triglycerides", description: "A type of fat in the blood linked to diet and metabolic health." },
      { name: "VLDL cholesterol", description: "Carries triglycerides; elevated levels may raise cardiovascular risk." }
    ]
  },
  hba1c: {
    id: "hba1c",
    title: "Diabetes Risk (HbA1c)",
    testCode: "DRS094",
    price: 34,
    description:
      "HbA1c reflects average blood sugar over roughly the past 2–3 months and is useful for diabetes screening and follow-up.",
    markers: [
      { name: "Hemoglobin A1c", description: "Estimates average blood glucose over the previous 2–3 months." }
    ]
  },
  glucose: {
    id: "glucose",
    title: "Fasting Glucose",
    testCode: "DRS091",
    price: 18,
    description:
      "Measures blood sugar after fasting and supports diabetes screening alongside HbA1c and metabolic panels.",
    markers: [
      { name: "Fasting glucose", description: "The primary sugar in your blood measured after an overnight fast." }
    ]
  },
  thyroid: {
    id: "thyroid",
    title: "Thyroid Profile (Total)",
    testCode: "DRS173",
    price: 35,
    description:
      "Screens thyroid activity through T3, T4, and TSH — hormones that influence metabolism, energy, mood, and weight.",
    markers: [
      { name: "TSH", description: "Thyroid-stimulating hormone — the primary screening marker for thyroid function." },
      { name: "T3", description: "Triiodothyronine — an active thyroid hormone involved in metabolism." },
      { name: "T4", description: "Thyroxine — a thyroid hormone that helps regulate energy use." }
    ]
  },
  crp: {
    id: "crp",
    title: "Inflammation (CRP)",
    testCode: "DRS062",
    price: 28,
    description:
      "C-reactive protein rises with inflammation and can support conversations about infection, recovery, and cardiovascular risk.",
    markers: [
      { name: "C-Reactive Protein (CRP)", description: "A liver-produced protein that increases when inflammation is present." }
    ]
  },
  "vitamin-d": {
    id: "vitamin-d",
    title: "Vitamin D",
    testCode: "DRS002",
    price: 31,
    description:
      "Measures 25-hydroxy vitamin D, a key nutrient for bone strength, immune health, and energy.",
    markers: [
      { name: "25-OH Vitamin D", description: "The standard blood marker used to assess vitamin D status." }
    ]
  },
  "vitamin-b12": {
    id: "vitamin-b12",
    title: "Vitamin B12",
    testCode: "DRS190",
    price: 29,
    description:
      "Checks vitamin B12 levels linked to energy, nerve health, and red blood cell production.",
    markers: [
      { name: "Vitamin B12", description: "An essential vitamin for nerve function and healthy blood cells." }
    ]
  },
  iron: {
    id: "iron",
    title: "Iron Deficiency Profile",
    testCode: "DRS125",
    price: 36,
    description:
      "Reviews iron storage and transport markers that help identify deficiency patterns linked to fatigue and anemia.",
    markers: [
      { name: "Serum iron", description: "Measures iron circulating in the blood." },
      { name: "TIBC", description: "Total iron-binding capacity — reflects how much iron the blood can carry." },
      { name: "Transferrin saturation", description: "Shows how much iron is available for use in the body." },
      { name: "Ferritin", description: "Reflects iron stored in the body." }
    ]
  },
  homocysteine: {
    id: "homocysteine",
    title: "Homocysteine",
    testCode: "DRS114",
    price: 32,
    description:
      "Homocysteine is an amino acid that, at higher levels, may be discussed alongside heart and vascular health.",
    markers: [
      { name: "Homocysteine", description: "An amino acid marker sometimes evaluated for cardiovascular risk context." }
    ]
  },
  electrolyte: {
    id: "electrolyte",
    title: "Electrolyte Profile",
    testCode: "DRS080",
    price: 26,
    description:
      "Checks key electrolytes that support hydration, muscle function, and acid-base balance.",
    markers: [
      { name: "Sodium", description: "Helps regulate fluid balance and nerve signaling." },
      { name: "Potassium", description: "Essential for muscle contractions and cellular function." },
      { name: "Chloride", description: "Works with sodium to maintain fluid and acid-base balance." }
    ]
  },
  insulin: {
    id: "insulin",
    title: "Insulin",
    testCode: "DRS120",
    price: 34,
    description:
      "Measures fasting insulin, useful when evaluating blood sugar control and metabolic health.",
    markers: [
      { name: "Insulin", description: "A hormone that helps move glucose from the blood into cells." }
    ]
  },
  "c-peptide": {
    id: "c-peptide",
    title: "C-Peptide",
    testCode: "DRS061",
    price: 38,
    description:
      "C-peptide reflects how much insulin the body is producing and supports diabetes monitoring.",
    markers: [
      { name: "C-Peptide", description: "Released when insulin is produced; helps assess endogenous insulin output." }
    ]
  },
  calcium: {
    id: "calcium",
    title: "Calcium",
    testCode: "DRS041",
    price: 22,
    description:
      "Calcium is essential for bone strength, muscle function, and nerve signaling.",
    markers: [
      { name: "Calcium", description: "A mineral critical for bones, muscles, and nerve transmission." }
    ]
  }
};

window.DRSWIFT_PANEL_ORDER = [
  "kft",
  "lft",
  "cbc",
  "cue",
  "lipid",
  "hba1c",
  "glucose",
  "thyroid",
  "crp",
  "vitamin-d",
  "vitamin-b12",
  "iron",
  "homocysteine",
  "electrolyte",
  "insulin",
  "c-peptide",
  "calcium"
];

window.buildPanelsWhatsTested = function buildPanelsWhatsTested(panelIds) {
  const catalog = window.DRSWIFT_PANELS || {};
  return (panelIds || [])
    .map((id) => catalog[id])
    .filter(Boolean)
    .map((panel) => ({
      id: panel.id,
      title: panel.title,
      description: panel.description,
      markers: panel.markers
    }));
};
