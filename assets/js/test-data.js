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
    whatsTested: [
      {
        title: "Complete Blood Count (CBC)",
        description:
          "Reviews red blood cells, white blood cells, hemoglobin, hematocrit, and platelets. Commonly used as a first-line wellness screen and follow-up marker for fatigue, infections, anemia, and recovery.",
        markers: ["Hemoglobin", "WBC count", "RBC count", "Platelets", "Hematocrit"]
      }
    ],
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
    whatsTested: [
      {
        title: "Cholesterol and Lipid Panel",
        description:
          "Measures key fats in your blood, including total cholesterol, HDL, LDL, VLDL, and triglycerides. Helps track heart-health risk and the effect of lifestyle or medication changes.",
        markers: ["Total cholesterol", "HDL", "LDL", "Triglycerides", "VLDL"]
      }
    ],
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
    whatsTested: [
      {
        title: "Thyroid Hormone Health",
        description:
          "Evaluates thyroid activity through T3, T4, and TSH. Often considered for fatigue, weight changes, hair fall, irregular cycles, or follow-up of known thyroid concerns.",
        markers: ["T3", "T4", "TSH"]
      }
    ],
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
    whatsTested: [
      {
        title: "Vitamin D",
        description:
          "Measures 25-hydroxy vitamin D, a key nutrient for bone strength, immune health, and energy. Often used for fatigue, low sun exposure, and supplement follow-up.",
        markers: ["25-OH Vitamin D"]
      }
    ],
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
    sampleType: "Blood",
    collection: "At-home sample collection",
    age: "18+ recommended",
    results: "Within 48 hours after sample reaches the lab",
    preparation: "Fast for 9-12 hours. Drink water and avoid heavy exercise before collection.",
    hsa: "Accepted",
    purchaser: "Can be booked for family profiles",
    markers: ["CBC", "Lipid profile", "Liver function", "Kidney function", "HbA1c", "TSH"],
    whatsTested: [
      {
        title: "Complete Blood Count (CBC)",
        description:
          "Reviews red and white blood cells, hemoglobin, hematocrit, and platelets for anemia, infection clues, and baseline blood health.",
        markers: ["Hemoglobin", "WBC count", "RBC count", "Platelets", "Hematocrit"]
      },
      {
        title: "Cholesterol and Lipid Panel",
        description:
          "Measures cholesterol and lipid markers that help assess cardiovascular risk and track lifestyle or medication changes.",
        markers: ["Total cholesterol", "HDL", "LDL", "Triglycerides", "VLDL"]
      },
      {
        title: "Liver Function",
        description:
          "Checks liver enzymes and related markers that reflect how well the liver is processing nutrients and waste.",
        markers: ["ALT", "AST", "ALP", "Bilirubin", "Total protein", "Albumin"]
      },
      {
        title: "Kidney Function",
        description:
          "Reviews filtration and electrolyte balance markers commonly used in preventive screening and chronic-care follow-up.",
        markers: ["Creatinine", "eGFR", "Urea", "Sodium", "Potassium"]
      },
      {
        title: "Diabetes Risk (HbA1c)",
        description:
          "HbA1c reflects average blood sugar over roughly the past 2-3 months and supports diabetes screening and follow-up.",
        markers: ["HbA1c"]
      },
      {
        title: "Thyroid Hormone Health",
        description:
          "Measures TSH to screen thyroid activity, which influences metabolism, energy, and overall wellness.",
        markers: ["TSH"]
      }
    ],
    reasons: [
      ["Annual preventive screen", "A convenient way to review several organ systems in one booking."],
      ["Starting a health plan", "Use it as a baseline before nutrition, fitness, or lifestyle changes."],
      ["Family profiles", "Book for parents, partner, or dependents and keep reports organized."]
    ],
    related: ["lipid-profile", "hba1c-glucose", "vitamin-d"],
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
      "This panel combines HbA1c with fasting glucose to support diabetes screening and follow-up. HbA1c reflects average blood sugar over roughly the past 2-3 months, while fasting glucose shows your current level.",
    sampleType: "Blood",
    collection: "At-home sample collection",
    age: "18+ recommended",
    results: "24-48 hours after sample reaches the lab",
    preparation: "Fast for 9-12 hours (water only) so the fasting glucose result can be interpreted accurately.",
    hsa: "Accepted",
    purchaser: "Can be booked for family profiles",
    markers: ["Hemoglobin A1c", "Fasting glucose"],
    whatsTested: [
      {
        title: "Diabetes Risk (HbA1c)",
        description:
          "HbA1c reflects average blood sugar over roughly the past 2-3 months and supports diabetes screening and follow-up.",
        markers: ["Hemoglobin A1c"]
      },
      {
        title: "Fasting Glucose",
        description:
          "Measures blood sugar after fasting and complements HbA1c for a clearer view of glucose control.",
        markers: ["Fasting glucose"]
      }
    ],
    reasons: [
      ["Diabetes screening", "Useful if you have risk factors or want a baseline view of glucose control."],
      ["Progress tracking", "Compare values over time in the Dr.Swift report view."],
      ["Lifestyle changes", "See how nutrition, activity, and medication plans are affecting your markers."]
    ],
    related: ["lipid-profile", "kidney-function", "full-body-checkup"],
    faqs: [
      ["What does HbA1c show?", "HbA1c estimates average blood sugar over the previous 2-3 months."],
      ["Do I need fasting?", "Yes for this combined panel. Fast for 9-12 hours so the fasting glucose value is reliable. HbA1c alone does not require fasting."]
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
    whatsTested: [
      {
        title: "Reproductive Hormones",
        description:
          "Reviews selected reproductive hormone markers that support conversations around cycle health, fertility planning, and symptom follow-up.",
        markers: ["FSH", "LH", "Estradiol", "Progesterone", "Prolactin"]
      },
      {
        title: "Thyroid Hormone Health",
        description:
          "Includes TSH as a thyroid screening marker often paired with hormone panels for women's health.",
        markers: ["TSH"]
      }
    ],
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
    imageTone: "blood",
    price: 42,
    oldPrice: 60,
    summary: "Creatinine, eGFR, and electrolytes for renal health monitoring.",
    headline: "Review kidney filtration and electrolyte balance.",
    description:
      "The Kidney Function Panel checks markers such as creatinine, urea, eGFR, and electrolytes. It is commonly used for preventive screening, medication follow-up, diabetes monitoring, and blood-pressure related care.",
    sampleType: "Blood",
    collection: "At-home sample collection",
    age: "18+ recommended",
    results: "24-48 hours after sample reaches the lab",
    preparation: "Drink water normally. Avoid heavy exercise just before sample collection.",
    hsa: "Accepted",
    purchaser: "Can be booked for family profiles",
    markers: ["Creatinine", "eGFR", "Urea", "Sodium", "Potassium"],
    whatsTested: [
      {
        title: "Kidney Function Test (KFT)",
        description:
          "Checks creatinine, eGFR, urea, and electrolytes for filtration health and electrolyte balance.",
        markers: ["Creatinine", "eGFR", "Urea", "Sodium", "Potassium"]
      }
    ],
    reasons: [
      ["Monitoring diabetes or blood pressure", "Kidney markers are often followed when these conditions are present."],
      ["Medication follow-up", "Some medicines require periodic kidney function review."],
      ["Preventive wellness", "A practical check for hydration, filtration, and electrolyte balance."]
    ],
    related: ["hba1c-glucose", "full-body-checkup", "lipid-profile"],
    faqs: [
      ["Is urine required?", "This kidney panel is a blood test. If a urine test is added separately, booking instructions will confirm collection steps."],
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
    markers: ["TB interferon-gamma response", "TB exposure screening"],
    whatsTested: [
      {
        title: "TB Blood Screening",
        description:
          "Screens the immune response associated with tuberculosis exposure. It does not confirm active TB disease on its own.",
        markers: ["TB interferon-gamma response", "TB exposure screening"]
      }
    ],
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
  },
  {
    slug: "mens-health-test",
    name: "Men's Health Test",
    shortName: "Men's Health",
    category: "Men's health",
    filters: ["all", "men"],
    image: "assets/images/test-heart.jpg",
    imageTone: "heart",
    badge: "Popular",
    price: 199,
    oldPrice: 259,
    summary: "A fixed wellness bundle for metabolic, heart, thyroid, and routine blood screening.",
    headline: "A comprehensive blood test for men's everyday wellness.",
    description:
      "The Men's Health Test bundles the same core screenings many clinicians review during an annual check — kidney and liver function, complete blood count, urine analysis, lipids, glucose control, and thyroid markers. It is designed for men who want a practical preventive snapshot without building a custom panel.",
    sampleType: "Blood and urine",
    collection: "At-home sample collection",
    age: "18+ recommended",
    results: "24-48 hours after sample reaches the lab",
    preparation:
      "Fast for 9-12 hours (water only). Avoid heavy exercise before collection. Share current supplements and medications during booking.",
    hsa: "Accepted",
    purchaser: "Must be taken by the intended patient",
    customizable: false,
    panelIds: ["kft", "lft", "cbc", "cue", "lipid", "hba1c", "glucose", "thyroid"],
    markers: [
      "Kidney function",
      "Liver function",
      "CBC",
      "Urine analysis",
      "Lipid profile",
      "HbA1c",
      "Fasting glucose",
      "Thyroid profile"
    ],
    compareWith: "custom-mens-health-test",
    reasons: [
      [
        "Concerned about heart health?",
        "Heart disease remains a leading health concern for men. Lipid markers help assess cardiovascular risk alongside lifestyle factors."
      ],
      [
        "Annual preventive screening",
        "A convenient fixed bundle covering blood, urine, metabolic, and thyroid markers in one booking."
      ],
      [
        "Prefer a ready-made panel?",
        "No customization needed — this package is pre-built from Dr.Swift's standard men's wellness tests."
      ]
    ],
    related: ["custom-mens-health-test", "full-body-checkup", "vitamin-d"],
    faqs: [
      [
        "How is this different from Custom Men's Health?",
        "This is a fixed bundle at a package price. Custom Men's Health starts with the same core panels and lets you add or remove tests before checkout."
      ],
      [
        "Do I need to fast?",
        "Yes. Fast for 9-12 hours before sample collection unless the care team advises otherwise."
      ],
      [
        "Does this replace a doctor visit?",
        "No. It supports preventive screening and should be reviewed with a clinician when values are abnormal."
      ]
    ]
  },
  {
    slug: "custom-mens-health-test",
    name: "Custom Men's Health Test",
    shortName: "Custom Men's",
    category: "Men's health",
    filters: ["all", "men"],
    image: "assets/images/test-full-body.jpg",
    imageTone: "body",
    badge: "Customizable",
    price: 259,
    oldPrice: 349,
    summary: "Build your men's wellness panel by selecting only the tests you want.",
    headline: "Customize metabolic, heart, thyroid, and wellness markers for men's health insights.",
    description:
      "Build a men's wellness panel by selecting the tests you want included. Start with core kidney, liver, blood count, urine, lipid, glucose, and thyroid panels, then add inflammation, vitamin, iron, or metabolic markers before adding the panel to cart.",
    sampleType: "Blood and urine",
    collection: "At-home sample collection",
    age: "18+ recommended",
    results: "24-48 hours after sample reaches the lab",
    preparation:
      "Fast for 9-12 hours (water only). Avoid heavy exercise before collection. Share current supplements and medications during booking.",
    hsa: "Accepted",
    purchaser: "Must be taken by the intended patient",
    customizable: true,
    basePanelIds: ["kft", "lft", "cbc", "cue", "lipid", "hba1c", "glucose", "thyroid"],
    optionalPanelIds: ["crp", "vitamin-d", "vitamin-b12", "iron", "homocysteine", "electrolyte", "insulin", "c-peptide", "calcium"],
    markers: [
      "Kidney function",
      "Liver function",
      "CBC",
      "Urine analysis",
      "Lipid profile",
      "HbA1c",
      "Fasting glucose",
      "Thyroid profile",
      "CRP",
      "Vitamin D",
      "Vitamin B12",
      "Iron profile"
    ],
    compareWith: "mens-health-test",
    reasons: [
      [
        "Proactive health management",
        "Select the measurements that matter most for your goals, from routine blood and urine screening to inflammation and vitamins."
      ],
      [
        "Metabolic and heart health focus",
        "Choose lipids, glucose, kidney, liver, thyroid, and cardiometabolic tests based on the health picture you want to review."
      ],
      [
        "Personalized preventive screening",
        "Include only the tests you need instead of paying for a one-size-fits-all mega panel."
      ]
    ],
    related: ["mens-health-test", "full-body-checkup", "vitamin-d"],
    faqs: [
      [
        "What is selected by default?",
        "The core men's wellness panels are selected first: kidney, liver, CBC, urine, lipids, HbA1c, fasting glucose, and thyroid. Optional add-ons start unselected."
      ],
      [
        "Can I remove any test?",
        "Yes. Every card in What's Tested can be selected or removed so the final panel reflects your preferences."
      ],
      [
        "How is pricing calculated?",
        "The total is the sum of the tests currently selected. The fixed Men's Health Test offers the same core panels at a package price."
      ]
    ]
  },
  {
    slug: "women-s-health-test",
    name: "Women's Health Test",
    shortName: "Women's Health",
    category: "Women's health",
    filters: ["all", "women"],
    image: "assets/images/test-thyroid.jpg",
    imageTone: "women",
    badge: "Popular",
    price: 6999,
    oldPrice: 8999,
    summary: "A fixed women's wellness bundle covering blood, metabolic, thyroid, and urine markers.",
    headline: "A comprehensive blood test for women's everyday wellness.",
    description:
      "The Women's Health Test bundles core screenings commonly reviewed during preventive care — kidney and liver function, complete blood count, urine analysis, lipids, glucose control, and thyroid markers.",
    sampleType: "Blood and urine",
    collection: "At-home sample collection",
    age: "18+ recommended",
    results: "24-48 hours after sample reaches the lab",
    preparation: "Fast for 9-12 hours (water only) before sample collection unless advised otherwise.",
    hsa: "Accepted",
    purchaser: "Can be booked for family profiles",
    customizable: false,
    panelIds: ["kft", "lft", "cbc", "cue", "lipid", "hba1c", "glucose", "thyroid"],
    markers: ["Kidney function", "Liver function", "CBC", "Urine analysis", "Lipid profile", "HbA1c", "Fasting glucose", "Thyroid profile"],
    compareWith: "custom-women-s-health-test",
    reasons: [
      ["Annual preventive screening", "A convenient fixed bundle for women's wellness markers."],
      ["Prefer a ready-made panel?", "No customization needed — pre-built from Dr.Swift core wellness tests."]
    ],
    related: ["custom-women-s-health-test", "thyroid-profile", "cbc"],
    faqs: [
      ["How is this different from Custom Women's Health?", "This is a fixed package. Custom Women's Health lets you select panels before checkout."],
      ["Do I need to fast?", "Yes. Fast for 9-12 hours unless advised otherwise."]
    ]
  },
  {
    slug: "custom-women-s-health-test",
    name: "Custom Women's Health Test",
    shortName: "Custom Women's",
    category: "Women's health",
    filters: ["all", "women"],
    image: "assets/images/test-full-body.jpg",
    imageTone: "women",
    badge: "Customizable",
    price: 19999,
    oldPrice: 25999,
    summary: "Build your women's wellness panel by selecting only the tests you want.",
    headline: "Customize metabolic, hormone, thyroid, and wellness markers for women's health insights.",
    description:
      "Build a women's wellness panel by selecting the tests you want. Start with core panels, then add hormones, vitamins, iron, or inflammation markers.",
    sampleType: "Blood and urine",
    collection: "At-home sample collection",
    age: "18+ recommended",
    results: "24-48 hours after sample reaches the lab",
    preparation: "Fast for 9-12 hours (water only) before sample collection unless advised otherwise.",
    hsa: "Accepted",
    purchaser: "Can be booked for family profiles",
    customizable: true,
    basePanelIds: ["kft", "lft", "cbc", "cue", "lipid", "hba1c", "glucose", "thyroid"],
    optionalPanelIds: ["crp", "vitamin-d", "vitamin-b12", "iron", "calcium"],
    markers: ["Kidney function", "Liver function", "CBC", "Urine analysis", "Lipid profile", "HbA1c", "Thyroid profile", "Hormones", "Vitamins"],
    compareWith: "women-s-health-test",
    reasons: [
      ["Hormone and cycle health conversations", "Include estradiol, progesterone, or prolactin when relevant."],
      ["Personalized preventive screening", "Select only the panels you need."]
    ],
    related: ["women-s-health-test", "thyroid-profile", "vitamin-d"],
    faqs: [
      ["How does pricing work?", "Your total is the sum of the panels you select."],
      ["Can I remove core panels?", "Yes. Select only the tests you want before adding to cart."]
    ]
  }
];
