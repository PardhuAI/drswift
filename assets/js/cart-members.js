/**
 * Multi-member cart + household helpers for Orange Health–style checkout.
 * Cart line identity: lineId + memberId + slug (same test allowed for different members).
 */
(function () {
  const CART_KEY = "drswift.cart.v1";
  const HOUSEHOLD_KEY = "drswift.demoHousehold.v1";
  const BOOKING_MEMBERS_KEY = "drswift.bookingMembers.v1";

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

  function uid(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function seedFromName(name) {
    return String(name || "person")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") || "person";
  }

  function readHousehold() {
    return readJson(localStorage, HOUSEHOLD_KEY) || readJson(sessionStorage, HOUSEHOLD_KEY) || null;
  }

  function ensureHousehold() {
    let household = readHousehold();
    if (household?.owner?.id) {
      if (!Array.isArray(household.members)) household.members = [];
      return household;
    }
    const account =
      readJson(localStorage, "drswift.demoAccount.v1") ||
      readJson(sessionStorage, "drswift.demoAccount.v1") ||
      window.DRSWIFT_USER ||
      {};
    const name = String(account.displayName || account.name || "Me").trim() || "Me";
    household = {
      owner: {
        id: `owner-${seedFromName(name)}`,
        name,
        relation: "Self",
        age: account.age || "",
        gender: account.gender || "",
        phone: account.phone || "",
        email: account.email || "",
      },
      members: [],
      updatedAt: new Date().toISOString(),
    };
    writeBoth(HOUSEHOLD_KEY, household);
    return household;
  }

  function listProfiles() {
    const household = ensureHousehold();
    const people = [
      { ...household.owner, relation: household.owner.relation || "Self" },
      ...(Array.isArray(household.members) ? household.members : []),
    ];
    return people.filter((p) => p && p.id && String(p.name || "").trim());
  }

  function findProfile(memberId) {
    return listProfiles().find((p) => p.id === memberId) || null;
  }

  function saveHousehold(household) {
    household.updatedAt = new Date().toISOString();
    writeBoth(HOUSEHOLD_KEY, household);
    window.dispatchEvent(new CustomEvent("drswift:household-updated", { detail: household }));
    return household;
  }

  function upsertMember(input) {
    const household = ensureHousehold();
    const name = String(input.name || "").trim();
    if (!name) return null;
    const relation = String(input.relation || "Family member").trim() || "Family member";
    const age = String(input.age || "").trim();
    const gender = String(input.gender || "").trim();
    const phone = String(input.phone || "").trim();

    if (input.id && household.owner?.id === input.id) {
      household.owner = {
        ...household.owner,
        name,
        age,
        gender,
        phone: phone || household.owner.phone || "",
        relation: "Self",
      };
      return saveHousehold(household).owner;
    }

    const existingIdx = (household.members || []).findIndex((m) => m.id === input.id);
    if (existingIdx >= 0) {
      household.members[existingIdx] = {
        ...household.members[existingIdx],
        name,
        relation,
        age,
        gender,
        phone,
      };
      saveHousehold(household);
      return household.members[existingIdx];
    }

    const member = {
      id: input.id || uid("member"),
      name,
      relation,
      age,
      gender,
      phone,
      addedAt: new Date().toISOString(),
    };
    household.members = [...(household.members || []), member];
    saveHousehold(household);
    return member;
  }

  function defaultMemberId() {
    return ensureHousehold().owner.id;
  }

  function normalizeLine(raw) {
    if (!raw || !raw.slug) return null;
    const profiles = listProfiles();
    let memberId = String(raw.memberId || "").trim();
    let memberName = String(raw.memberName || "").trim();
    let memberRelation = String(raw.memberRelation || "").trim();

    if (!memberId && raw.recipient) {
      const label = String(raw.recipient).trim();
      const match = profiles.find((p) => {
        const withRel =
          p.relation && p.relation !== "Self" ? `${p.name} (${p.relation})` : p.name;
        return withRel === label || p.name === label;
      });
      if (match) {
        memberId = match.id;
        memberName = match.name;
        memberRelation = match.relation || "";
      }
    }

    if (!memberId) {
      memberId = defaultMemberId();
      const owner = findProfile(memberId);
      memberName = owner?.name || "Me";
      memberRelation = owner?.relation || "Self";
    } else if (!memberName) {
      const profile = findProfile(memberId);
      memberName = profile?.name || "Me";
      memberRelation = profile?.relation || memberRelation || "";
    }

    return {
      lineId: String(raw.lineId || "").trim() || uid("line"),
      slug: String(raw.slug),
      quantity: 1,
      memberId,
      memberName,
      memberRelation,
      ...(typeof raw.name === "string" && raw.name.trim() ? { name: raw.name.trim() } : {}),
      ...(Number.isFinite(Number(raw.price)) ? { price: Number(raw.price) } : {}),
      ...(typeof raw.image === "string" && raw.image.trim() ? { image: raw.image.trim() } : {}),
      ...(typeof raw.imageTone === "string" && raw.imageTone.trim()
        ? { imageTone: raw.imageTone.trim() }
        : {}),
      ...(Array.isArray(raw.customPanels) ? { customPanels: raw.customPanels } : {}),
    };
  }

  function readCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      if (!Array.isArray(parsed)) return [];
      const seen = new Set();
      return parsed
        .map(normalizeLine)
        .filter(Boolean)
        .filter((line) => {
          const key = `${line.memberId}::${line.slug}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
    } catch {
      return [];
    }
  }

  function writeCart(cart) {
    const normalized = (Array.isArray(cart) ? cart : []).map(normalizeLine).filter(Boolean);
    localStorage.setItem(CART_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent("drswift:cart-updated"));
    return normalized;
  }

  function groupCartByMember(cart) {
    const lines = Array.isArray(cart) ? cart : readCart();
    const groups = [];
    const indexById = new Map();
    lines.forEach((line) => {
      let group = indexById.get(line.memberId);
      if (!group) {
        const profile = findProfile(line.memberId);
        group = {
          memberId: line.memberId,
          memberName: profile?.name || line.memberName || "Me",
          memberRelation: profile?.relation || line.memberRelation || "",
          age: profile?.age || "",
          gender: profile?.gender || "",
          phone: profile?.phone || "",
          lines: [],
        };
        indexById.set(line.memberId, group);
        groups.push(group);
      }
      group.lines.push(line);
    });
    return groups;
  }

  function readBookingMemberIds() {
    const raw = readJson(localStorage, BOOKING_MEMBERS_KEY) || readJson(sessionStorage, BOOKING_MEMBERS_KEY);
    return Array.isArray(raw) ? raw.map(String).filter(Boolean) : [];
  }

  function writeBookingMemberIds(ids) {
    const unique = [...new Set((Array.isArray(ids) ? ids : []).map(String).filter(Boolean))];
    writeBoth(BOOKING_MEMBERS_KEY, unique);
    return unique;
  }

  function ensureBookingMembers() {
    const cartIds = [...new Set(readCart().map((line) => line.memberId).filter(Boolean))];
    let ids = readBookingMemberIds().filter((id) => findProfile(id));
    cartIds.forEach((id) => {
      if (!ids.includes(id)) ids.push(id);
    });
    if (!ids.length) ids = [defaultMemberId()];
    return writeBookingMemberIds(ids);
  }

  function addBookingMember(memberId) {
    const id = String(memberId || "").trim();
    if (!id || !findProfile(id)) return ensureBookingMembers();
    const ids = ensureBookingMembers();
    if (!ids.includes(id)) ids.push(id);
    return writeBookingMemberIds(ids);
  }

  function removeBookingMember(memberId) {
    const id = String(memberId || "").trim();
    const ownerId = defaultMemberId();
    if (!id || id === ownerId) return ensureBookingMembers();
    writeCart(readCart().filter((line) => line.memberId !== id));
    return writeBookingMemberIds(ensureBookingMembers().filter((entry) => entry !== id));
  }

  /** Booking participants for checkout — includes members with zero tests yet. */
  function groupBookingMembers(cart) {
    const lines = Array.isArray(cart) ? cart : readCart();
    const ownerId = defaultMemberId();
    return ensureBookingMembers()
      .map((memberId) => {
        const profile = findProfile(memberId);
        if (!profile) return null;
        return {
          memberId,
          memberName: profile.name || "Me",
          memberRelation: profile.relation || "",
          age: profile.age || "",
          gender: profile.gender || "",
          phone: profile.phone || "",
          isOwner: memberId === ownerId,
          lines: lines.filter((line) => line.memberId === memberId),
        };
      })
      .filter(Boolean);
  }

  function addToCartForMember(slug, memberId, meta) {
    const cart = readCart();
    const mid = memberId || defaultMemberId();
    const profile = findProfile(mid) || { id: mid, name: "Me", relation: "Self" };
    const existing = cart.find((line) => line.slug === slug && line.memberId === mid);
    if (existing) {
      if (meta?.customPanels) {
        existing.customPanels = meta.customPanels;
        writeCart(cart);
      }
      return { status: "exists", line: existing };
    }
    const line = normalizeLine({
      lineId: uid("line"),
      slug,
      memberId: mid,
      memberName: profile.name,
      memberRelation: profile.relation || "",
      name: meta?.name,
      price: meta?.price,
      image: meta?.image,
      imageTone: meta?.imageTone,
      customPanels: meta?.customPanels,
    });
    cart.push(line);
    writeCart(cart);
    return { status: "added", line };
  }

  function removeLine(lineId) {
    writeCart(readCart().filter((line) => line.lineId !== lineId));
  }

  function assignLineMember(lineId, memberId) {
    const cart = readCart();
    const line = cart.find((entry) => entry.lineId === lineId);
    const profile = findProfile(memberId);
    if (!line || !profile) return;
    const clash = cart.find(
      (entry) =>
        entry.lineId !== lineId && entry.slug === line.slug && entry.memberId === memberId
    );
    if (clash) {
      removeLine(lineId);
      return { status: "merged" };
    }
    line.memberId = profile.id;
    line.memberName = profile.name;
    line.memberRelation = profile.relation || "";
    writeCart(cart);
    return { status: "updated" };
  }

  function preferredMemberFromQuery() {
    try {
      return new URLSearchParams(location.search).get("for") || "";
    } catch {
      return "";
    }
  }

  window.DrSwiftCart = {
    CART_KEY,
    HOUSEHOLD_KEY,
    BOOKING_MEMBERS_KEY,
    readCart,
    writeCart,
    readHousehold,
    ensureHousehold,
    listProfiles,
    findProfile,
    upsertMember,
    saveHousehold,
    defaultMemberId,
    groupCartByMember,
    groupBookingMembers,
    ensureBookingMembers,
    addBookingMember,
    removeBookingMember,
    addToCartForMember,
    removeLine,
    assignLineMember,
    preferredMemberFromQuery,
    normalizeLine,
  };
})();
