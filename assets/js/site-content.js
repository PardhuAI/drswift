/**
 * Phase 1 design content for production trust / ops / legal surfaces.
 * Phase 2: replace values with verified ops/legal facts and set status to "live".
 * Do not invent launch claims — keep status "design" until verified.
 */
(() => {
  const CONTENT = {
    status: "design",
    designNote: "Design content — replace before launch",
    labs: [
      {
        legalName: "Partner Lab Alpha Diagnostics Pvt. Ltd.",
        accreditation: "NABL (ISO 15189)",
        certificateNo: "MC-XXXXX",
        validThrough: "31 Mar 2027",
      },
      {
        legalName: "Partner Lab Beta Pathology Centre",
        accreditation: "NABL (ISO 15189)",
        certificateNo: "MC-YYYYY",
        validThrough: "30 Sep 2026",
      },
    ],
    coverage: {
      cities: ["Hyderabad", "Nalgonda", "Secunderabad", "Warangal"],
      hours: "Mon – Sat, 6:30 AM – 8:00 PM collection windows",
      blackoutNote: "No collection on major public holidays and declared blackout dates.",
      pinHint: "Enter a 6-digit PIN in a service city. Final availability is confirmed before payment.",
    },
    contact: {
      address: "Dr.Swift Diagnostics, Registered office — Hyderabad, Telangana (full address in Phase 2)",
      phone: "+91 90004 24591",
      phoneHref: "tel:+919000424591",
      whatsappHref: "https://wa.me/919000424591",
      escalation: "Escalation desk: escalate@drswift.health · +91 90004 24591",
      email: "care@drswift.health",
      hours: "Mon – Sat, 7:00 AM – 9:00 PM",
    },
    collection: {
      phleboQualification:
        "Home visits are completed by trained phlebotomists who follow identity checks and hygiene protocols.",
      sampleHandling:
        "Samples are labelled at collection, sealed, and tracked until they reach the processing lab.",
      coldChain:
        "Temperature-sensitive samples use cold-chain kits and timed handoff to partner laboratories.",
    },
    policies: {
      payment:
        "Pay online by UPI, card, or netbanking through our secure payment partner after patient details are locked.",
      refund:
        "Refunds apply when a collection could not be completed due to Dr.Swift or lab failure. Processed tests are non-refundable unless required by law.",
      cancellation:
        "Cancel free of charge until the collection window starts. Late cancellations may retain a visit fee.",
      reschedule:
        "Reschedule once online or via WhatsApp care at least 2 hours before the slot, subject to availability.",
      href: "policies.html",
    },
    otp: {
      expiryMins: 10,
      resendCooldownSec: 30,
      hint: "OTP expires in 10 minutes. You can resend after 30 seconds.",
      rateLimitCopy: "Too many OTP requests. Please wait a few minutes and try again.",
      deliveryFailCopy: "We could not deliver the OTP. Check the number or try again in a moment.",
    },
    clinical: {
      dataRetention:
        "Account, booking, and report data are retained while your account is active and for the period required for clinical and legal records.",
      consent:
        "I agree to share patient and booking details with Dr.Swift care staff, phlebotomists, and accredited partner labs to complete this test.",
      clinicianReview:
        "Reports are informational and for clinician review. They are not a diagnosis or treatment plan.",
      urgentCare:
        "If you have severe or urgent symptoms, seek emergency care immediately. Do not wait for lab results.",
    },
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function designNoteHtml() {
    if (CONTENT.status !== "design") return "";
    return `<p class="content-design-note">${escapeHtml(CONTENT.designNote)}</p>`;
  }

  function renderLabPartners(root) {
    root.setAttribute("data-content-status", CONTENT.status);
    root.innerHTML = `
      ${designNoteHtml()}
      <div class="lab-partner-grid">
        ${CONTENT.labs
          .map(
            (lab) => `
          <article class="lab-partner-card">
            <p class="overline">${escapeHtml(lab.accreditation)}</p>
            <h3>${escapeHtml(lab.legalName)}</h3>
            <dl class="lab-partner-card__meta">
              <div><dt>Certificate</dt><dd>${escapeHtml(lab.certificateNo)}</dd></div>
              <div><dt>Valid through</dt><dd>${escapeHtml(lab.validThrough)}</dd></div>
            </dl>
          </article>`
          )
          .join("")}
      </div>
    `;
  }

  function renderLabStrip(root) {
    root.setAttribute("data-content-status", CONTENT.status);
    const names = CONTENT.labs.map((lab) => lab.accreditation).join(" · ");
    root.innerHTML = `
      ${designNoteHtml()}
      <ul class="lab-trust-strip" aria-label="Partner lab accreditations">
        ${CONTENT.labs
          .map(
            (lab) => `
          <li>
            <strong>${escapeHtml(lab.accreditation)}</strong>
            <small>Cert ${escapeHtml(lab.certificateNo)} · valid ${escapeHtml(lab.validThrough)}</small>
          </li>`
          )
          .join("")}
      </ul>
      <p class="lab-trust-strip__link"><a href="about.html#lab-partners">View partner lab details</a> · ${escapeHtml(names)}</p>
    `;
  }

  function renderCoverageMeta(root) {
    root.setAttribute("data-content-status", CONTENT.status);
    root.innerHTML = `
      ${designNoteHtml()}
      <div class="coverage-meta">
        <div class="coverage-meta__cities" aria-label="Service cities">
          ${CONTENT.coverage.cities.map((city) => `<span class="coverage-chip">${escapeHtml(city)}</span>`).join("")}
        </div>
        <p class="coverage-meta__hours"><strong>Collection hours:</strong> ${escapeHtml(CONTENT.coverage.hours)}</p>
        <p class="coverage-meta__blackout">${escapeHtml(CONTENT.coverage.blackoutNote)}</p>
        <p class="coverage-meta__hint">${escapeHtml(CONTENT.coverage.pinHint)}</p>
      </div>
    `;
  }

  function renderCollectionQuality(root) {
    root.setAttribute("data-content-status", CONTENT.status);
    root.innerHTML = `
      ${designNoteHtml()}
      <div class="collection-quality">
        <article>
          <h3>Phlebotomist qualification</h3>
          <p>${escapeHtml(CONTENT.collection.phleboQualification)}</p>
        </article>
        <article>
          <h3>Sample handling</h3>
          <p>${escapeHtml(CONTENT.collection.sampleHandling)}</p>
        </article>
        <article>
          <h3>Cold chain</h3>
          <p>${escapeHtml(CONTENT.collection.coldChain)}</p>
        </article>
      </div>
    `;
  }

  function renderContactExtras(root) {
    root.setAttribute("data-content-status", CONTENT.status);
    const c = CONTENT.contact;
    root.innerHTML = `
      ${designNoteHtml()}
      <ul class="contact-list contact-list--design">
        <li><strong>Registered address</strong><span>${escapeHtml(c.address)}</span></li>
        <li><strong>Phone / WhatsApp</strong><span><a href="${escapeHtml(c.phoneHref)}">${escapeHtml(c.phone)}</a></span></li>
        <li><strong>Escalation</strong><span>${escapeHtml(c.escalation)}</span></li>
        <li><strong>Email</strong><span><a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a></span></li>
        <li><strong>Hours</strong><span>${escapeHtml(c.hours)}</span></li>
        <li><strong>Service areas</strong><span>${escapeHtml(CONTENT.coverage.cities.join(", "))}</span></li>
      </ul>
    `;
  }

  function renderPolicySummary(root) {
    root.setAttribute("data-content-status", CONTENT.status);
    const p = CONTENT.policies;
    root.innerHTML = `
      ${designNoteHtml()}
      <div class="policy-summary">
        <article><h3>Payment</h3><p>${escapeHtml(p.payment)}</p></article>
        <article><h3>Refunds</h3><p>${escapeHtml(p.refund)}</p></article>
        <article><h3>Cancellation</h3><p>${escapeHtml(p.cancellation)}</p></article>
        <article><h3>Rescheduling</h3><p>${escapeHtml(p.reschedule)}</p></article>
      </div>
      <p class="policy-summary__link"><a href="${escapeHtml(p.href)}">Full booking &amp; payment policies</a></p>
    `;
  }

  function renderCheckoutCoverageNote(root) {
    root.setAttribute("data-content-status", CONTENT.status);
    root.innerHTML = `
      ${designNoteHtml()}
      <p class="checkout-coverage-note">
        <strong>Collection hours:</strong> ${escapeHtml(CONTENT.coverage.hours)}
        <span>${escapeHtml(CONTENT.coverage.blackoutNote)}</span>
        Service cities: ${escapeHtml(CONTENT.coverage.cities.join(", "))}. Availability is reconfirmed before payment.
      </p>
    `;
  }

  function renderOtpHint(root) {
    root.setAttribute("data-content-status", CONTENT.status);
    root.innerHTML = `<p class="otp-policy-hint">${escapeHtml(CONTENT.otp.hint)}</p>`;
  }

  function renderConsentLabel(root) {
    root.setAttribute("data-content-status", CONTENT.status);
    root.textContent = CONTENT.clinical.consent;
  }

  function renderUrgentCare(root) {
    root.setAttribute("data-content-status", CONTENT.status);
    root.innerHTML = `
      ${designNoteHtml()}
      <p class="clinical-disclaimer">
        <strong>Clinician review:</strong> ${escapeHtml(CONTENT.clinical.clinicianReview)}
        <strong>Urgent care:</strong> ${escapeHtml(CONTENT.clinical.urgentCare)}
      </p>
    `;
  }

  const RENDERERS = {
    "lab-partners": renderLabPartners,
    "lab-strip": renderLabStrip,
    "coverage-meta": renderCoverageMeta,
    "collection-quality": renderCollectionQuality,
    "contact-extras": renderContactExtras,
    "policy-summary": renderPolicySummary,
    "checkout-coverage": renderCheckoutCoverageNote,
    "otp-hint": renderOtpHint,
    "consent-label": renderConsentLabel,
    "urgent-care": renderUrgentCare,
  };

  function hydrateSiteContent(scope = document) {
    scope.querySelectorAll("[data-site-content]").forEach((node) => {
      const key = node.getAttribute("data-site-content");
      const render = RENDERERS[key];
      if (typeof render === "function") render(node);
    });
  }

  window.DRSWIFT_SITE_CONTENT = CONTENT;
  window.hydrateSiteContent = hydrateSiteContent;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => hydrateSiteContent());
  } else {
    hydrateSiteContent();
  }
})();
