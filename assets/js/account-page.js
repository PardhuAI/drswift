/**
 * Account page access state for the static demo.
 * Real production data should replace this with server-backed auth and reports.
 */
(function () {
  const DEMO_KEY = "drswift.demoAccount.v1";
  const SESSION_KEY = "drswift.demoSession.v1";
  const HOUSEHOLD_KEY = "drswift.demoHousehold.v1";
  const gate = document.querySelector("[data-account-gate]");
  const dashboard = document.querySelector("[data-account-dashboard]");
  const previewButton = document.querySelector("[data-account-preview]");

  function readDemoAccount() {
    try {
      return (
        JSON.parse(localStorage.getItem(DEMO_KEY) || "null") ||
        JSON.parse(sessionStorage.getItem(DEMO_KEY) || "null")
      );
    } catch {
      return null;
    }
  }

  function readDemoSession() {
    try {
      return (
        JSON.parse(localStorage.getItem(SESSION_KEY) || "null") ||
        JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null")
      );
    } catch {
      return null;
    }
  }

  function readHousehold() {
    try {
      return (
        JSON.parse(localStorage.getItem(HOUSEHOLD_KEY) || "null") ||
        JSON.parse(sessionStorage.getItem(HOUSEHOLD_KEY) || "null")
      );
    } catch {
      return null;
    }
  }

  function initialsFor(name) {
    const parts = String(name || "Demo customer")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    return (parts[0]?.[0] || "D") + (parts[1]?.[0] || "S");
  }

  function relationLabel(person, fallback) {
    return person?.relation || fallback || "Family member";
  }

  function renderFamilyProfiles(household, ownerName) {
    const summary = document.querySelector("[data-family-summary]");
    const list = document.querySelector("[data-family-members]");
    const security = document.querySelector("[data-account-security]");
    const owner = household?.owner || { name: ownerName, relation: "Self" };
    const members = Array.isArray(household?.members) ? household.members : [];
    const names = [owner, ...members].map((person) => person.name).filter(Boolean);

    if (summary) {
      summary.textContent = names.length > 1
        ? `${members.length + 1} profiles · ${owner.name} plus ${members.length} loved ${members.length === 1 ? "one" : "ones"}`
        : `${owner.name || "Demo customer"} · Add loved ones anytime`;
    }

    if (security) {
      const phoneText = owner.phone ? "Phone verified" : "Phone OTP ready";
      const emailText = owner.email ? owner.email : "Email optional";
      security.textContent = `${phoneText} · ${emailText}`;
    }

    if (!list) return;

    const people = [
      { ...owner, relation: "Self" },
      ...members,
    ];

    list.innerHTML = people
      .map(
        (person) => `
          <div class="account-family-person">
            <span class="account-family-avatar" aria-hidden="true">${initialsFor(person.name).toUpperCase()}</span>
            <span>
              <strong>${escapeHtml(person.name || "Demo customer")}</strong>
              <small>${escapeHtml(relationLabel(person))}</small>
            </span>
          </div>`
      )
      .join("");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setDashboardCopy(user, isPreview) {
    const household = isPreview ? null : readHousehold();
    const owner = household?.owner || user;
    const name = owner?.displayName || owner?.name || "Demo customer";
    const nameEl = document.querySelector("[data-account-name]");
    const modeEl = document.querySelector("[data-account-mode]");
    const introEl = document.querySelector("[data-account-intro]");
    const avatar = document.querySelector(".account-avatar");

    if (nameEl) nameEl.textContent = name;
    if (avatar) avatar.textContent = initialsFor(name).toUpperCase();

    if (modeEl) {
      modeEl.textContent = isPreview ? "Sample dashboard preview" : "My account";
    }
    if (introEl) {
      introEl.textContent = isPreview
        ? "This is sample account data for the website demo. Real customer reports should load only after backend authentication."
        : "Review your bookings, reports, family profiles, and health trends from one secure workspace.";
    }

    renderFamilyProfiles(household, name);
  }

  function showDashboard(user, isPreview) {
    if (gate) gate.hidden = true;
    if (dashboard) dashboard.hidden = false;
    setDashboardCopy(user, isPreview);
    window.dispatchEvent(new CustomEvent("drswift:account-visible"));
  }

  function showGate() {
    if (gate) gate.hidden = false;
    if (dashboard) dashboard.hidden = true;
  }

  previewButton?.addEventListener("click", () => {
    showDashboard({ name: "Demo customer" }, true);
  });

  function sync() {
    const firebaseUser = window.DRSWIFT_USER;
    if (firebaseUser) {
      showDashboard(firebaseUser, false);
      return;
    }

    const demoUser = readDemoAccount();
    const demoSession = readDemoSession();
    if (demoUser && demoSession) {
      showDashboard(demoUser, false);
      return;
    }

    showGate();
  }

  window.addEventListener("drswift:auth-changed", sync);
  window.addEventListener("drswift:account-signed-out", sync);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", sync);
  } else {
    sync();
  }
})();
