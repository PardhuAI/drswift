window.DRSWIFT_TESTS = [
  {
    slug: "cbc",
    name: "Complete Blood Count",
    shortName: "CBC",
    category: "General",
    filters: ["all"],
    image: "assets/images/test-cbc.jpg",
    imageTone: "blood",
    badge: "Popular",
    price: 29,
    oldPrice: 45,
    summary: "Checks blood cells, anemia indicators, and infection clues.",
    headline: "A simple blood test for everyday health screening.",
    description:
      "The Complete Blood Count panel reviews red blood cells, white blood cells, hemoglobin, hematocrit, and platelets. It is commonly used as a first-line wellness screen and a follow-up marker for fatigue, infections, anemia, and recovery.",
    sampleType: "Blood",
    collection: "At-home sample collection",
    age: "All ages with guardian consent",
    results: "24-48 hours after sample reaches the lab",
    preparation: "No fasting required unless paired with another fasting test.",
    hsa: "Accepted",
    purchaser: "Can be booked for family profiles",
    markers: ["Hemoglobin", "WBC count", "RBC count", "Platelets", "Hematocrit"],
    reasons: [
      ["Feeling unusually tired?", "CBC can help reveal anemia patterns, infection clues, or inflammation signals that may need follow-up."],
      ["Routine annual check", "A useful baseline panel when you want a quick read on core blood health."],
      ["Family health tracking", "Results can be stored in the Dr.Swift app and compared over time."]
    ],
    related: ["lipid-profile", "hba1c-glucose", "thyroid-profile"],
    faqs: [
      ["Do I need to fast for CBC?", "CBC alone does not usually require fasting. If you add fasting glucose or lipid tests, follow the fasting instructions shown at booking."],
      ["Can this diagnose a condition?", "It is a screening panel. A clinician should review abnormal results and recommend next steps."]
    ]
  },
  {
    slug: "lipid-profile",
    name: "Lipid Profile",
    shortName: "Lipid",
    category: "Heart",
    filters: ["all", "heart"],
    image: "assets/images/test-heart.jpg",
    imageTone: "heart",
    price: 39,
    oldPrice: 58,
    summary: "Measures cholesterol, triglycerides, HDL, and LDL.",
    headline: "Understand your cholesterol and heart-risk markers.",
    description:
      "This panel measures key fats in your blood, including total cholesterol, HDL, LDL, VLDL, and triglycerides. It helps track heart-health risk and the effect of lifestyle or medication changes.",
    sampleType: "Blood",
    collection: "At-home sample collection",
    age: "18+ recommended",
    results: "24-48 hours after sample reaches the lab",
    preparation: "Fast for 9-12 hours unless your doctor advised a non-fasting lipid test.",
    hsa: "Accepted",
    purchaser: "Can be booked for family profiles",
    markers: ["Total cholesterol", "HDL", "LDL", "Triglycerides", "VLDL"],
    reasons: [
      ["Tracking cholesterol?", "Helpful for people monitoring HDL, LDL, and triglyceride trends."],
      ["Family history of heart disease", "A lipid profile is a practical baseline when risk factors run in the family."],
      ["Lifestyle follow-up", "Compare results after nutrition, fitness, or medication changes."]
    ],
    related: ["full-body-checkup", "hba1c-glucose", "kidney-function"],
    faqs: [
      ["Why is fasting recommended?", "Fasting can make triglyceride and calculated LDL values easier to interpret for many patients."],
      ["How often should I test?", "Your clinician can guide frequency based on age, risk factors, and previous results."]
    ]
  },
  {
    slug: "thyroid-profile",
    name: "Thyroid Profile",
    shortName: "Thyroid",
    category: "Thyroid",
    filters: ["all", "thyroid"],
    image: "assets/images/test-thyroid.jpg",
    imageTone: "thyroid",
    price: 35,
    oldPrice: 52,
    summary: "Includes T3, T4, and TSH for thyroid screening.",
    headline: "Screen the key hormones that guide thyroid health.",
    description:
      "The Thyroid Profile checks T3, T4, and TSH to help evaluate thyroid activity. It is often considered for fatigue, weight changes, hair fall, irregular cycles, or follow-up of known thyroid concerns.",
    sampleType: "Blood",
    collection: "At-home sample collection",
    age: "18+ recommended",
    results: "24-48 hours after sample reaches the lab",
    preparation: "No fasting required. Share current thyroid medication details during booking.",
    hsa: "Accepted",
    purchaser: "Can be booked for family profiles",
    markers: ["T3", "T4", "TSH"],
    reasons: [
      ["Energy or weight changes?", "Thyroid imbalance can affect metabolism, mood, sleep, and energy."],
      ["Medication follow-up", "Useful for tracking thyroid values over time with your clinician."],
      ["Women's health screening", "Thyroid testing is commonly paired with hormone and wellness panels."]
    ],
    related: ["womens-hormone-panel", "vitamin-d", "cbc"],
    faqs: [
      ["Can I take my thyroid medicine before the test?", "Follow your clinician's instructions. If unsure, tell the care team during booking so they can guide preparation."],
      ["Is this a complete diagnosis?", "This is a screening profile. Abnormal results should be reviewed with a qualified clinician."]
    ]
  },
  {
    slug: "vitamin-d",
    name: "Vitamin D Test",
    shortName: "Vitamin D",
    category: "Wellness",
    filters: ["all"],
    image: "assets/images/test-vitamin-d.jpg",
    imageTone: "vitamin",
    price: 31,
    oldPrice: 49,
    summary: "Useful for fatigue, bone health, and wellness checks.",
    headline: "Check a key nutrient for bone and immune health.",
    description:
      "Vitamin D testing measures your current vitamin D level and helps identify deficiency or excess. It is often used for fatigue, low sun exposure, bone health, and supplement follow-up.",
    sampleType: "Blood",
    collection: "At-home sample collection",
    age: "All ages with guardian consent",
    results: "24-48 hours after sample reaches the lab",
    preparation: "No fasting required.",
    hsa: "Accepted",
    purchaser: "Can be booked for family profiles",
    markers: ["25-OH Vitamin D"],
    reasons: [
      ["Low sun exposure?", "Indoor routines and sunscreen use can contribute to lower vitamin D levels."],
      ["Bone health", "Vitamin D supports calcium absorption and bone maintenance."],
      ["Supplement tracking", "Measure whether your supplement plan is moving levels in the right direction."]
    ],
    related: ["cbc", "thyroid-profile", "full-body-checkup"],
    faqs: [
      ["Do supplements affect results?", "Yes. Share current supplement use when booking so your report context is clearer."],
      ["Is fasting needed?", "No fasting is usually needed for this test."]
    ]
  },
  {
    slug: "full-body-checkup",
    name: "Full Body Checkup",
    shortName: "Full Body",
    category: "Full body",
    filters: ["all", "full-body"],
    image: "assets/images/test-full-body.jpg",
    imageTone: "body",
    price: 99,
    oldPrice: 149,
    summary: "A broad wellness panel for annual preventive testing.",
    headline: "A broad preventive panel for your annual health review.",
    description:
      "The Full Body Checkup combines core blood, liver, kidney, thyroid, diabetes, and lipid markers. It is designed for preventive screening and trend tracking in the Dr.Swift app.",
    sampleType: "Blood and urine",
    collection: "At-home sample collection",
    age: "18+ recommended",
    results: "Within 48 hours after sample reaches the lab",
    preparation: "Fast for 9-12 hours. Drink water and avoid heavy exercise before collection.",
    hsa: "Accepted",
    purchaser: "Can be booked for family profiles",
    markers: ["CBC", "Lipid profile", "Liver function", "Kidney function", "HbA1c", "TSH"],
    reasons: [
      ["Annual preventive screen", "A convenient way to review several organ systems in one booking."],
      ["Starting a health plan", "Use it as a baseline before nutrition, fitness, or lifestyle changes."],
      ["Family profiles", "Book for parents, partner, or dependents and keep reports organized."]
    ],
    related: ["lipid-profile", "hba1c-glucose", "kidney-function"],
    faqs: [
      ["How long should I fast?", "Fast for 9-12 hours unless the care team gives different instructions."],
      ["Does this replace a doctor visit?", "No. It supports preventive screening and should be reviewed with a clinician when values are abnormal."]
    ]
  },
  {
    slug: "hba1c-glucose",
    name: "HbA1c & Glucose",
    shortName: "HbA1c",
    category: "Diabetes",
    filters: ["all", "diabetes"],
    image: "assets/images/test-cbc.jpg",
    imageTone: "blood",
    price: 34,
    oldPrice: 48,
    summary: "Diabetes screening with trend-friendly follow-up markers.",
    headline: "Track average blood sugar and current glucose level.",
    description:
      "This panel combines HbA1c with glucose to support diabetes screening and follow-up. HbA1c reflects average blood sugar over roughly the past 2-3 months.",
    sampleType: "Blood",
    collection: "At-home sample collection",
    age: "18+ recommended",
    results: "24-48 hours after sample reaches the lab",
    preparation: "Fasting may be required for fasting glucose. Confirm the selected glucose option at booking.",
    hsa: "Accepted",
    purchaser: "Can be booked for family profiles",
    markers: ["HbA1c", "Glucose"],
    reasons: [
      ["Diabetes screening", "Useful if you have risk factors or want a baseline view of glucose control."],
      ["Progress tracking", "Compare values over time in the Dr.Swift report view."],
      ["Lifestyle changes", "See how nutrition, activity, and medication plans are affecting your markers."]
    ],
    related: ["lipid-profile", "kidney-function", "full-body-checkup"],
    faqs: [
      ["What does HbA1c show?", "HbA1c estimates average blood sugar over the previous 2-3 months."],
      ["Do I need fasting?", "HbA1c does not require fasting, but a fasting glucose option may require it."]
    ]
  },
  {
    slug: "womens-hormone-panel",
    name: "Women's Hormone Panel",
    shortName: "Hormone",
    category: "Women's",
    filters: ["all", "women"],
    image: "assets/images/test-womens-health.jpg",
    imageTone: "her",
    price: 79,
    oldPrice: 99,
    summary: "Key hormones for cycle health, fertility, and postpartum care.",
    headline: "A focused hormone panel for women's health conversations.",
    description:
      "This panel reviews selected reproductive and thyroid-adjacent hormone markers that can support conversations around cycle health, fertility planning, postpartum recovery, and symptom follow-up.",
    sampleType: "Blood",
    collection: "At-home sample collection",
    age: "18+ recommended",
    results: "Within 48 hours after sample reaches the lab",
    preparation: "Some hormones are cycle-day sensitive. The care team may confirm timing before collection.",
    hsa: "Accepted",
    purchaser: "Must be taken by the intended patient",
    markers: ["FSH", "LH", "Estradiol", "Progesterone", "Prolactin", "TSH"],
    reasons: [
      ["Cycle changes", "Helpful when tracking irregular cycles or symptoms with a clinician."],
      ["Fertility planning", "A useful starting panel before deeper fertility evaluation."],
      ["Postpartum follow-up", "Supports conversations about recovery, energy, and hormonal symptoms."]
    ],
    related: ["thyroid-profile", "vitamin-d", "cbc"],
    faqs: [
      ["Does timing matter?", "Yes, some markers are best collected on specific cycle days. The care team can confirm timing."],
      ["Can this confirm pregnancy?", "No. Use a pregnancy-specific test for that purpose."]
    ]
  },
  {
    slug: "kidney-function",
    name: "Kidney Function Panel",
    shortName: "Kidney",
    category: "Kidney",
    filters: ["all"],
    image: "assets/images/test-kidney.jpg",
    imageTone: "thyroid",
    price: 42,
    oldPrice: 60,
    summary: "Creatinine, eGFR, and electrolytes for renal health monitoring.",
    headline: "Review kidney filtration and electrolyte balance.",
    description:
      "The Kidney Function Panel checks markers such as creatinine, urea, eGFR, and electrolytes. It is commonly used for preventive screening, medication follow-up, diabetes monitoring, and blood-pressure related care.",
    sampleType: "Blood and urine",
    collection: "At-home sample collection",
    age: "18+ recommended",
    results: "24-48 hours after sample reaches the lab",
    preparation: "Drink water normally. Avoid heavy exercise just before sample collection.",
    hsa: "Accepted",
    purchaser: "Can be booked for family profiles",
    markers: ["Creatinine", "eGFR", "Urea", "Sodium", "Potassium", "Urine routine"],
    reasons: [
      ["Monitoring diabetes or blood pressure", "Kidney markers are often followed when these conditions are present."],
      ["Medication follow-up", "Some medicines require periodic kidney function review."],
      ["Preventive wellness", "A practical check for hydration, filtration, and electrolyte balance."]
    ],
    related: ["hba1c-glucose", "full-body-checkup", "lipid-profile"],
    faqs: [
      ["Is urine required?", "This panel may include urine markers. The booking instructions will confirm collection steps."],
      ["Can dehydration affect results?", "Hydration can influence some kidney markers, so drink water normally before collection."]
    ]
  },
  {
    slug: "tuberculosis-test",
    name: "Tuberculosis (TB) Blood Test",
    shortName: "TB Blood Test",
    category: "Immunity",
    filters: ["all", "immunity"],
    image: "assets/images/test-cbc.jpg",
    imageTone: "blood",
    badge: "New",
    price: 59,
    oldPrice: 79,
    summary: "Blood screening for TB exposure with at-home sample collection.",
    headline: "Screen for possible TB exposure with a convenient blood test.",
    description:
      "This blood screening test helps identify immune response patterns associated with tuberculosis exposure. It is useful when school, work, travel, or occupational requirements ask for TB screening documentation.",
    sampleType: "Blood",
    collection: "At-home sample collection",
    age: "18+ recommended",
    results: "2-4 days after sample reaches the lab",
    preparation: "Tell the care team about recent live vaccines or current TB symptoms before booking.",
    hsa: "Accepted",
    purchaser: "Must be taken by the intended patient",
    markers: ["Interferon-gamma release assay style screening", "TB exposure response"],
    reasons: [
      ["Need screening proof?", "TB screening is often requested for work, school, travel, or healthcare-related roles."],
      ["Higher exposure risk?", "Consider screening if you work in healthcare, shelters, long-term care, or other high-risk settings."],
      ["Prefer a blood draw?", "A blood-based screen can be more convenient than skin-test workflows that may require a return visit."]
    ],
    related: ["cbc", "full-body-checkup", "vitamin-d"],
    faqs: [
      ["Does this diagnose active TB?", "No. This is a screening test. If you have cough for more than two weeks, fever, night sweats, weight loss, chest pain, or known exposure, contact a clinician promptly."],
      ["Can vaccines affect timing?", "Some live vaccines can affect TB screening timing. Share recent vaccination details during booking."],
      ["What happens if results are positive?", "A clinician should review positive or unclear results and may recommend additional evaluation."]
    ]
  }
];
