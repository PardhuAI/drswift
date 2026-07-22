/**
 * Account health-trends MVP — animated SVG spark/line charts for 10+ markers.
 */
(function () {
  const MARKERS = [
    {
      id: "hba1c",
      name: "HbA1c",
      unit: "%",
      rangeLabel: "Healthy range ~4.0–5.6%",
      summary: "Your HbA1c improved from borderline high toward the healthy range since mid-2024.",
      neverTested: false,
      points: [
        { date: "04 Sep 24", value: 6.0, status: "borderline", statusLabel: "Borderline high" },
        { date: "28 Sep 24", value: 5.6, status: "good", statusLabel: "Good" },
        { date: "17 Nov 24", value: 5.2, status: "healthy", statusLabel: "Healthy" },
        { date: "05 Jan 25", value: 5.1, status: "healthy", statusLabel: "Healthy" },
      ],
      tips: [
        { text: "Walk every day", action: "Set phone notification", enabled: false },
        { text: "Drink plenty of water", action: "Phone notification enabled", enabled: true },
      ],
    },
    {
      id: "creatinine",
      name: "Creatinine",
      unit: "mg/dL",
      rangeLabel: "Typical adult range ~0.6–1.2 mg/dL",
      summary: "",
      neverTested: true,
      points: [],
      tips: [],
    },
    {
      id: "ldl",
      name: "LDL cholesterol",
      unit: "mg/dL",
      rangeLabel: "Optimal often &lt;100 mg/dL (ask your clinician)",
      summary: "LDL drifted down after diet changes. Keep fibre high and retest with your next lipid panel.",
      neverTested: false,
      points: [
        { date: "12 Mar 24", value: 142, status: "borderline", statusLabel: "High" },
        { date: "08 Jul 24", value: 128, status: "borderline", statusLabel: "Borderline" },
        { date: "20 Nov 25", value: 108, status: "good", statusLabel: "Near optimal" },
        { date: "14 Jan 26", value: 96, status: "healthy", statusLabel: "Optimal" },
      ],
      tips: [
        { text: "Add oats / soluble fibre", action: "Set reminder", enabled: false },
        { text: "Limit fried snacks", action: "Reminder on", enabled: true },
      ],
    },
    {
      id: "glucose",
      name: "Fasting glucose",
      unit: "mg/dL",
      rangeLabel: "Typical fasting ~70–99 mg/dL",
      summary: "Fasting glucose settled into the normal band after earlier elevations.",
      neverTested: false,
      points: [
        { date: "04 Sep 24", value: 112, status: "borderline", statusLabel: "Elevated" },
        { date: "17 Nov 24", value: 101, status: "borderline", statusLabel: "High-normal" },
        { date: "14 Jan 26", value: 92, status: "healthy", statusLabel: "Normal" },
      ],
      tips: [{ text: "Prefer protein at breakfast", action: "Set reminder", enabled: false }],
    },
    {
      id: "total-chol",
      name: "Total cholesterol",
      unit: "mg/dL",
      rangeLabel: "Often desirable &lt;200 mg/dL",
      summary: "Total cholesterol improved alongside LDL after lifestyle changes.",
      neverTested: false,
      points: [
        { date: "12 Mar 24", value: 228, status: "borderline", statusLabel: "High" },
        { date: "08 Jul 24", value: 210, status: "borderline", statusLabel: "Borderline" },
        { date: "14 Jan 26", value: 186, status: "healthy", statusLabel: "Desirable" },
      ],
      tips: [],
    },
    {
      id: "hdl",
      name: "HDL cholesterol",
      unit: "mg/dL",
      rangeLabel: "Higher is generally better (≥40 men / ≥50 women)",
      summary: "HDL edged upward with regular walking — a positive trend.",
      neverTested: false,
      points: [
        { date: "12 Mar 24", value: 38, status: "borderline", statusLabel: "Low" },
        { date: "08 Jul 24", value: 42, status: "good", statusLabel: "Improving" },
        { date: "14 Jan 26", value: 48, status: "healthy", statusLabel: "Good" },
      ],
      tips: [{ text: "2–3 brisk walks / week", action: "Notification on", enabled: true }],
    },
    {
      id: "trig",
      name: "Triglycerides",
      unit: "mg/dL",
      rangeLabel: "Often desirable &lt;150 mg/dL",
      summary: "Triglycerides fell after cutting sugary drinks. Maintain the habit before the next draw.",
      neverTested: false,
      points: [
        { date: "12 Mar 24", value: 210, status: "borderline", statusLabel: "High" },
        { date: "20 Nov 25", value: 168, status: "borderline", statusLabel: "Borderline" },
        { date: "14 Jan 26", value: 132, status: "healthy", statusLabel: "Normal" },
      ],
      tips: [{ text: "Skip sweetened beverages", action: "Set reminder", enabled: false }],
    },
    {
      id: "vitd",
      name: "Vitamin D (25-OH)",
      unit: "ng/mL",
      rangeLabel: "Often sufficient ≥30 ng/mL (lab-dependent)",
      summary: "Vitamin D rose after supplementation. Recheck seasonally with your clinician.",
      neverTested: false,
      points: [
        { date: "08 Jul 24", value: 18, status: "borderline", statusLabel: "Deficient" },
        { date: "20 Nov 25", value: 27, status: "good", statusLabel: "Insufficient" },
        { date: "14 Jan 26", value: 36, status: "healthy", statusLabel: "Sufficient" },
      ],
      tips: [{ text: "Morning sun 10–15 min", action: "Set reminder", enabled: false }],
    },
    {
      id: "b12",
      name: "Vitamin B12",
      unit: "pg/mL",
      rangeLabel: "Common reference ~200–900 pg/mL",
      summary: "B12 moved from low-normal into a comfortable mid-range after diet updates.",
      neverTested: false,
      points: [
        { date: "18 Nov 25", value: 248, status: "borderline", statusLabel: "Low-normal" },
        { date: "14 Jan 26", value: 412, status: "healthy", statusLabel: "Normal" },
      ],
      tips: [],
    },
    {
      id: "hb",
      name: "Hemoglobin",
      unit: "g/dL",
      rangeLabel: "Typical adult ~12–17 g/dL (sex-dependent)",
      summary: "Hemoglobin is stable and within a healthy band across recent CBCs.",
      neverTested: false,
      points: [
        { date: "08 Jul 24", value: 13.2, status: "healthy", statusLabel: "Normal" },
        { date: "18 Nov 25", value: 13.8, status: "healthy", statusLabel: "Normal" },
        { date: "14 Jan 26", value: 14.1, status: "healthy", statusLabel: "Normal" },
      ],
      tips: [],
    },
    {
      id: "tsh",
      name: "TSH",
      unit: "mIU/L",
      rangeLabel: "Common adult range ~0.4–4.0 mIU/L",
      summary: "TSH remains euthyroid. No action needed unless symptoms change.",
      neverTested: false,
      points: [
        { date: "18 Nov 25", value: 2.4, status: "healthy", statusLabel: "Normal" },
        { date: "14 Jan 26", value: 2.1, status: "healthy", statusLabel: "Normal" },
      ],
      tips: [],
    },
    {
      id: "egfr",
      name: "eGFR",
      unit: "mL/min/1.73m²",
      rangeLabel: "Often ≥90 is normal; 60–89 may be acceptable with age",
      summary: "Kidney filtration estimate is stable. Creatinine panel not ordered yet for a fuller picture.",
      neverTested: false,
      points: [
        { date: "18 Nov 25", value: 98, status: "healthy", statusLabel: "Normal" },
        { date: "14 Jan 26", value: 101, status: "healthy", statusLabel: "Normal" },
      ],
      tips: [{ text: "Stay hydrated on test mornings", action: "Reminder on", enabled: true }],
    },
  ];

  const W = 720;
  const H = 180;
  const PAD = { t: 28, r: 18, b: 28, l: 40 };

  function statusClass(status) {
    if (status === "healthy" || status === "good") return "is-good";
    if (status === "borderline") return "is-warn";
    return "";
  }

  function buildChart(marker) {
    const pts = marker.points;
    if (!pts.length) return "";

    const values = pts.map((p) => p.value);
    const minV = Math.min(...values);
    const maxV = Math.max(...values);
    const span = maxV - minV || 1;
    const padV = span * 0.18;
    const yMin = minV - padV;
    const yMax = maxV + padV;
    const plotW = W - PAD.l - PAD.r;
    const plotH = H - PAD.t - PAD.b;

    const coords = pts.map((p, i) => {
      const x = PAD.l + (pts.length === 1 ? plotW / 2 : (i / (pts.length - 1)) * plotW);
      const y = PAD.t + (1 - (p.value - yMin) / (yMax - yMin)) * plotH;
      return { ...p, x, y };
    });

    const lineD = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
    const areaD = `${lineD} L${coords[coords.length - 1].x.toFixed(1)},${(PAD.t + plotH).toFixed(1)} L${coords[0].x.toFixed(1)},${(PAD.t + plotH).toFixed(1)} Z`;

    const dots = coords
      .map(
        (c, i) => `
      <g class="trend-dot ${statusClass(c.status)}" style="--i:${i}">
        <circle cx="${c.x}" cy="${c.y}" r="5" class="trend-dot__ring"></circle>
        <circle cx="${c.x}" cy="${c.y}" r="2.8" class="trend-dot__core"></circle>
        <text x="${c.x}" y="${c.y - 11}" text-anchor="middle" class="trend-value">${c.value}</text>
        <text x="${c.x}" y="${H - 10}" text-anchor="middle" class="trend-date">${c.date}</text>
      </g>`
      )
      .join("");

    const labels = coords
      .map(
        (c, i) => `
      <text x="${c.x}" y="${PAD.t - 10}" text-anchor="middle" class="trend-status ${statusClass(c.status)}" style="--i:${i}">${c.statusLabel}</text>`
      )
      .join("");

    return `
      <svg class="trend-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${marker.name} trend chart" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="fill-${marker.id}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1e5bd7" stop-opacity="0.22"></stop>
            <stop offset="100%" stop-color="#1e5bd7" stop-opacity="0.02"></stop>
          </linearGradient>
        </defs>
        <line x1="${PAD.l}" y1="${PAD.t}" x2="${PAD.l}" y2="${PAD.t + plotH}" class="trend-axis"></line>
        <line x1="${PAD.l}" y1="${PAD.t + plotH}" x2="${W - PAD.r}" y2="${PAD.t + plotH}" class="trend-axis"></line>
        <path class="trend-area" d="${areaD}" fill="url(#fill-${marker.id})"></path>
        <path class="trend-line" d="${lineD}"></path>
        ${labels}
        ${dots}
      </svg>`;
  }

  function renderMarker(marker) {
    if (marker.neverTested) {
      return `
        <article class="trend-panel" data-marker="${marker.id}">
          <div class="trend-panel__head">
            <h3>${marker.name}</h3>
            <span class="trend-unit">${marker.unit}</span>
          </div>
          <div class="trend-never">
            <p>Never tested before</p>
            <a class="button secondary" href="tests.html">Browse related tests</a>
          </div>
        </article>`;
    }

    const tips = (marker.tips || [])
      .map(
        (t) => `
      <li class="trend-tip">
        <span>${t.text}</span>
        <button type="button" class="trend-tip__btn ${t.enabled ? "is-on" : ""}" disabled>
          ${t.enabled ? "✓ " : ""}${t.action}
        </button>
      </li>`
      )
      .join("");

    return `
      <article class="trend-panel" data-marker="${marker.id}">
        <div class="trend-panel__head">
          <h3>${marker.name}</h3>
          <span class="trend-unit">${marker.unit}</span>
        </div>
        <div class="trend-panel__body">
        <div class="trend-chart-wrap">
            ${buildChart(marker)}
          </div>
          <aside class="trend-side">
            <p class="trend-range">${marker.rangeLabel}</p>
            <p class="trend-summary"><strong>Summary</strong> — ${marker.summary}</p>
            ${tips ? `<ul class="trend-tips">${tips}</ul>` : ""}
          </aside>
        </div>
      </article>`;
  }

  function boot() {
    const root = document.querySelector("[data-account-trends]");
    if (!root) return;
    root.innerHTML = MARKERS.map(renderMarker).join("");

    // Stagger draw animations when panels enter view
    const panels = root.querySelectorAll(".trend-panel");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    panels.forEach((p) => io.observe(p));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
