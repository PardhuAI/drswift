/**
 * Account page access state. Only authenticated account content is exposed.
 */
(function () {
  const DEMO_KEY = "drswift.demoAccount.v1";
  const SESSION_KEY = "drswift.demoSession.v1";
  const HOUSEHOLD_KEY = "drswift.demoHousehold.v1";
  const gate = document.querySelector("[data-account-gate]");
  const dashboard = document.querySelector("[data-account-dashboard]");

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
    const parts = String(name || "Account")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    return (parts[0]?.[0] || "A") + (parts[1]?.[0] || "C");
  }

  function relationLabel(person, fallback) {
    return person?.relation || fallback || "Family member";
  }

  function profileTone(person) {
    const relation = String(person?.relation || "").toLowerCase();
    const gender = String(person?.gender || "").toLowerCase();
    const age = Number(person?.age || 0);

    if (
      age >= 60 ||
      /(father|mother|parent|grandfather|grandmother|grandparent|senior)/.test(relation)
    ) {
      return "senior";
    }
    if (/(female|woman|wife|sister|daughter|mother)/.test(`${gender} ${relation}`)) {
      return "women";
    }
    if (/(male|man|husband|brother|son|father)/.test(`${gender} ${relation}`)) {
      return "men";
    }
    return "neutral";
  }

  function profileDescriptor(person) {
    const relation = relationLabel(person, "Family member");
    const parts = [relation];
    if (person?.age) parts.push(`${person.age} yrs`);
    if (person?.phone) parts.push("phone added");
    else if (person?.email) parts.push("email added");
    return parts.join(" · ");
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
        ? `${names.length} profiles: ${names.slice(0, 3).join(", ")}${names.length > 3 ? ` +${names.length - 3} more` : ""}`
        : `${owner.name || "Your profile"} · Add loved ones anytime`;
    }

    if (security) {
      const phoneText = owner.phone ? "Phone number added" : "Phone number needed";
      const emailText = owner.email ? owner.email : "Email optional";
      security.textContent = `${phoneText} · ${emailText}`;
    }

    if (!list) return;

    const people = [
      { ...owner, relation: "Self" },
      ...members,
    ];

    if (!people.some((person) => person.name)) {
      list.innerHTML = `
        <div class="account-family-empty">
          <strong>No family profiles yet</strong>
          <span>Add parents, partner, children, or senior members so each booking is attached to the right person.</span>
        </div>
      `;
      return;
    }

    list.innerHTML = people
      .filter((person) => String(person.name || "").trim())
      .map((person) => {
        const tone = profileTone(person);
        return `
          <div class="account-family-person" data-profile-tone="${escapeHtml(tone)}">
            <span class="account-family-avatar" aria-hidden="true">${initialsFor(person.name).toUpperCase()}</span>
            <span class="account-family-person__copy">
              <strong>${escapeHtml(person.name || "Profile")}</strong>
              <small>${escapeHtml(profileDescriptor(person))}</small>
            </span>
            <span class="account-family-person__tag">${escapeHtml(relationLabel(person))}</span>
          </div>`;
      })
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

  function setDashboardCopy(user) {
    const household = readHousehold();
    const owner = household?.owner || user;
    const name = owner?.displayName || owner?.name || "Your account";
    const nameEl = document.querySelector("[data-account-name]");
    const modeEl = document.querySelector("[data-account-mode]");
    const introEl = document.querySelector("[data-account-intro]");
    const avatar = document.querySelector(".account-avatar");

    if (nameEl) nameEl.textContent = name;
    if (avatar) avatar.textContent = initialsFor(name).toUpperCase();

    if (modeEl) modeEl.textContent = "My account";
    if (introEl) {
      introEl.textContent = "Review your bookings, reports, family profiles, and health trends from one secure workspace.";
    }

    renderFamilyProfiles(household, name);
  }

  function showDashboard(user) {
    if (gate) gate.hidden = true;
    if (dashboard) {
      dashboard.hidden = false;
      dashboard.inert = false;
    }
    setDashboardCopy(user);
    window.dispatchEvent(new CustomEvent("drswift:account-visible"));
  }

  function showGate() {
    if (gate) gate.hidden = false;
    if (dashboard) {
      dashboard.hidden = true;
      dashboard.inert = true;
    }
  }

  function sync() {
    const firebaseUser = window.DRSWIFT_USER;
    if (firebaseUser) {
      showDashboard(firebaseUser);
      return;
    }

    const demoUser = readDemoAccount();
    const demoSession = readDemoSession();
    if (demoUser && demoSession) {
      showDashboard(demoUser);
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
