/**
 * Shared demo auth helpers: identity → existing user or complete-profile.
 * Keys: localStorage users registry + pending auth after phone/Google verify.
 */
(function () {
  const USERS_KEY = "drswift.users.v1";
  const PENDING_KEY = "drswift.pendingAuth.v1";
  const DEMO_ACCOUNT_KEY = "drswift.demoAccount.v1";
  const DEMO_SESSION_KEY = "drswift.demoSession.v1";
  const HOUSEHOLD_KEY = "drswift.demoHousehold.v1";

  function readJson(storage, key) {
    try {
      return JSON.parse(storage.getItem(key) || "null");
    } catch {
      return null;
    }
  }

  function writeBoth(key, value) {
    const payload = JSON.stringify(value);
    try {
      localStorage.setItem(key, payload);
    } catch {
      /* ignore */
    }
    try {
      sessionStorage.setItem(key, payload);
    } catch {
      /* ignore */
    }
  }

  function clearKey(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }

  function digitsPhone(value) {
    return String(value || "").replace(/\D/g, "").slice(-10);
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function readUsers() {
    return readJson(localStorage, USERS_KEY) || readJson(sessionStorage, USERS_KEY) || {};
  }

  function writeUsers(users) {
    writeBoth(USERS_KEY, users);
  }

  function userKeyFromIdentity(identity) {
    const phone = digitsPhone(identity?.phone);
    if (phone.length === 10) return `phone:${phone}`;
    const email = normalizeEmail(identity?.email);
    if (email) return `email:${email}`;
    if (identity?.googleUid) return `google:${identity.googleUid}`;
    return "";
  }

  function findUser(identity) {
    const users = readUsers();
    const key = userKeyFromIdentity(identity);
    if (key && users[key]) return { key, user: users[key] };

    const phone = digitsPhone(identity?.phone);
    const email = normalizeEmail(identity?.email);
    const googleUid = identity?.googleUid || "";

    for (const [entryKey, user] of Object.entries(users)) {
      if (phone && digitsPhone(user.phone) === phone) return { key: entryKey, user };
      if (email && normalizeEmail(user.email) === email) return { key: entryKey, user };
      if (googleUid && user.googleUid === googleUid) return { key: entryKey, user };
    }
    return null;
  }

  function isProfileComplete(user) {
    if (!user) return false;
    const name = String(user.name || "").trim();
    const age = Number(user.age);
    const gender = String(user.gender || "").trim();
    return Boolean(name && name !== "Account holder" && age >= 1 && age <= 120 && gender);
  }

  function buildInitialsSeed(name) {
    return String(name || "account-holder").trim().toLowerCase().replace(/\s+/g, "-") || "account-holder";
  }

  function establishSession(user, method) {
    const updatedAt = new Date().toISOString();
    const owner = {
      name: user.name,
      email: user.email || "",
      phone: user.phone || "",
      age: user.age,
      gender: user.gender || "",
      relation: "Self",
      id: user.id || `owner-${buildInitialsSeed(user.name)}`,
    };

    const existingHousehold = readJson(localStorage, HOUSEHOLD_KEY) || readJson(sessionStorage, HOUSEHOLD_KEY);
    const household = {
      owner,
      members: Array.isArray(existingHousehold?.members) ? existingHousehold.members : [],
      updatedAt,
    };

    writeBoth(HOUSEHOLD_KEY, household);
    writeBoth(DEMO_ACCOUNT_KEY, {
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      age: owner.age,
      gender: owner.gender,
      method: method || user.method || "login",
      createdAt: user.createdAt || updatedAt,
      profileComplete: true,
    });
    writeBoth(DEMO_SESSION_KEY, {
      ownerId: owner.id,
      method: method || user.method || "login",
      signedInAt: updatedAt,
    });
  }

  function setPendingAuth(identity) {
    writeBoth(PENDING_KEY, {
      ...identity,
      phone: digitsPhone(identity?.phone) || "",
      email: normalizeEmail(identity?.email) || "",
      createdAt: new Date().toISOString(),
    });
  }

  function getPendingAuth() {
    return readJson(sessionStorage, PENDING_KEY) || readJson(localStorage, PENDING_KEY);
  }

  function clearPendingAuth() {
    clearKey(PENDING_KEY);
  }

  function upsertUser(identity, profile) {
    const users = readUsers();
    const found = findUser(identity);
    const key = found?.key || userKeyFromIdentity(identity) || `user:${Date.now().toString(36)}`;
    const prev = found?.user || {};
    const next = {
      ...prev,
      id: prev.id || `owner-${buildInitialsSeed(profile?.name || prev.name)}`,
      phone: digitsPhone(profile?.phone || identity?.phone || prev.phone) || "",
      email: normalizeEmail(profile?.email || identity?.email || prev.email) || "",
      googleUid: identity?.googleUid || prev.googleUid || "",
      name: String(profile?.name || prev.name || "").trim(),
      age: Number(profile?.age || prev.age) || "",
      gender: String(profile?.gender || prev.gender || "").trim(),
      method: identity?.method || prev.method || "login",
      createdAt: prev.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    next.profileComplete = isProfileComplete(next);
    users[key] = next;
    writeUsers(users);
    return next;
  }

  /**
   * After phone/Google/email verify:
   * - existing complete profile → session + account
   * - otherwise → pending + complete-profile step
   */
  function continueAfterIdentity(identity, options = {}) {
    const found = findUser(identity);
    if (found && isProfileComplete(found.user)) {
      const merged = {
        ...found.user,
        phone: digitsPhone(identity.phone) || found.user.phone,
        email: normalizeEmail(identity.email) || found.user.email,
        googleUid: identity.googleUid || found.user.googleUid,
        method: identity.method || found.user.method,
      };
      const users = readUsers();
      users[found.key] = { ...merged, updatedAt: new Date().toISOString() };
      writeUsers(users);
      clearPendingAuth();
      establishSession(merged, identity.method);
      if (options.onExisting) options.onExisting(merged);
      else window.location.href = options.redirectTo || "account.html";
      return { status: "existing", user: merged };
    }

    setPendingAuth(identity);
    if (options.onNew) options.onNew(identity, found?.user || null);
    return { status: "needs_profile", identity, existingPartial: found?.user || null };
  }

  function completeProfile(profile, options = {}) {
    const pending = getPendingAuth();
    if (!pending) {
      return { status: "error", message: "Start with phone or Google sign-in first." };
    }
    const user = upsertUser(pending, {
      ...profile,
      phone: profile.phone || pending.phone,
      email: profile.email || pending.email,
    });
    if (!isProfileComplete(user)) {
      return { status: "error", message: "Please enter your name, age, and gender." };
    }
    clearPendingAuth();
    establishSession(user, pending.method || "login");
    if (options.onComplete) options.onComplete(user);
    else window.location.href = options.redirectTo || "account.html";
    return { status: "ok", user };
  }

  window.DrSwiftAuth = {
    findUser,
    isProfileComplete,
    continueAfterIdentity,
    completeProfile,
    upsertUser,
    getPendingAuth,
    clearPendingAuth,
    setPendingAuth,
    establishSession,
    digitsPhone,
    normalizeEmail,
  };
})();
