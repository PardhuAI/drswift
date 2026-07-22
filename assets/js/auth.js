/**
 * Shared auth-form validation (email/password + HTML5 constraints).
 * Exposes window.DrSwiftFormValidation for phone/OTP and other buttons.
 */
(function () {
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
      /* ignore local storage */
    }
    try {
      sessionStorage.setItem(key, payload);
    } catch {
      /* ignore session storage */
    }
  }

  function readHousehold() {
    return (
      readJson(localStorage, HOUSEHOLD_KEY) ||
      readJson(sessionStorage, HOUSEHOLD_KEY) ||
      null
    );
  }

  function accountFromForm(form) {
    return {
      name: form.querySelector("[name='name']")?.value?.trim() || "Account holder",
      email: form.querySelector("[name='email']")?.value?.trim() || "",
      phone: form.querySelector("[name='phone']")?.value?.trim() || "",
    };
  }

  function buildInitialsSeed(name) {
    return String(name || "account-holder").trim().toLowerCase().replace(/\s+/g, "-") || "account-holder";
  }

  function saveOwnerProfile(form) {
    const owner = accountFromForm(form);
    const updatedAt = new Date().toISOString();
    const household = {
      owner: {
        ...owner,
        relation: "Self",
        id: `owner-${buildInitialsSeed(owner.name)}`,
      },
      members: [],
      updatedAt,
    };

    writeBoth(HOUSEHOLD_KEY, household);
    writeBoth(DEMO_ACCOUNT_KEY, {
      ...owner,
      method: "signup",
      createdAt: updatedAt,
    });
    writeBoth(DEMO_SESSION_KEY, {
      ownerId: household.owner.id,
      method: "signup",
      signedInAt: updatedAt,
    });
  }

  function saveFamilyMember(form) {
    const member = accountFromForm(form);
    const relation = form.querySelector("[name='relation']")?.value?.trim() || "Family member";
    const existing = readHousehold();
    const fallbackOwner =
      readJson(localStorage, DEMO_ACCOUNT_KEY) ||
      readJson(sessionStorage, DEMO_ACCOUNT_KEY) ||
      { name: "Account holder", email: "", phone: "" };
    const household = existing || {
      owner: {
        name: fallbackOwner.name || "Account holder",
        email: fallbackOwner.email || "",
        phone: fallbackOwner.phone || "",
        relation: "Self",
        id: `owner-${buildInitialsSeed(fallbackOwner.name)}`,
      },
      members: [],
    };

    const nextMember = {
      ...member,
      relation,
      id: `member-${Date.now().toString(36)}-${buildInitialsSeed(member.name)}`,
      addedAt: new Date().toISOString(),
    };

    household.members = [
      ...(Array.isArray(household.members) ? household.members : []).filter(
        (entry) =>
          entry.name.toLowerCase() !== nextMember.name.toLowerCase() ||
          entry.relation.toLowerCase() !== nextMember.relation.toLowerCase()
      ),
      nextMember,
    ];
    household.updatedAt = new Date().toISOString();

    writeBoth(HOUSEHOLD_KEY, household);
    writeBoth(DEMO_ACCOUNT_KEY, {
      ...household.owner,
      method: "signup",
      createdAt: household.updatedAt,
    });
    writeBoth(DEMO_SESSION_KEY, {
      ownerId: household.owner.id,
      method: "family-update",
      signedInAt: household.updatedAt,
    });
  }

  function applySignupMode() {
    if (!location.pathname.endsWith("signup.html")) return;

    const params = new URLSearchParams(location.search);
    const isFamilyMode = params.get("mode") === "family";
    const form = document.querySelector("[data-auth-form]");
    if (!form) return;

    const title = document.querySelector("[data-signup-title]");
    const subtitle = document.querySelector("[data-signup-subtitle]");
    const note = document.querySelector("[data-signup-note]");
    const submit = document.querySelector("[data-signup-submit]");
    const alt = document.querySelector("[data-signup-alt]");
    const asideKicker = document.querySelector("[data-signup-aside-kicker]");
    const asideTitle = document.querySelector("[data-signup-aside-title]");
    const asideCopy = document.querySelector("[data-signup-aside-copy]");
    const tabLabel = document.querySelector("[data-signup-tab-label]");
    const secondaryLink = document.querySelector("[data-signup-secondary-link]");
    const social = document.querySelector("[data-signup-social]");
    const divider = document.querySelector("[data-signup-divider]");
    const relationField = document.querySelector("[data-family-relation-field]");
    const relation = form.querySelector("[name='relation']");
    const passwordField = document.querySelector("[data-password-field]");
    const password = form.querySelector("[name='password']");
    const termsField = document.querySelector("[data-terms-field]");
    const terms = form.querySelector("[name='terms']");
    const email = form.querySelector("[name='email']");
    const phone = form.querySelector("[name='phone']");
    const emailLabel = document.querySelector("label[for='signup-email']");
    const phoneLabel = document.querySelector("label[for='signup-phone']");

    form.dataset.signupMode = isFamilyMode ? "family" : "owner";

    if (!isFamilyMode) return;

    document.title = "Add family member | Dr.Swift Diagnostics";
    if (title) title.textContent = "Add family member";
    if (subtitle) subtitle.textContent = "Create a separate profile under your family account.";
    if (note) note.textContent = "Family member details help keep bookings, preparation notes, reports, and trends separate.";
    if (submit) submit.textContent = "Save family member";
    if (alt) alt.innerHTML = `Back to <a href="account.html">My Account</a>`;
    if (asideKicker) asideKicker.textContent = "Family profile";
    if (asideTitle) asideTitle.textContent = "Tests for yourself and loved ones";
    if (asideCopy) asideCopy.textContent = "Add each person once, then choose who a test is for at booking.";
    if (tabLabel) tabLabel.textContent = "Add profile";
    if (secondaryLink) {
      secondaryLink.textContent = "My Account";
      secondaryLink.href = "account.html";
    }
    if (social) social.hidden = true;
    if (divider) divider.hidden = true;

    if (relationField) relationField.hidden = false;
    if (relation) relation.required = true;

    if (passwordField) passwordField.hidden = true;
    if (password) {
      password.required = false;
      password.disabled = true;
    }

    if (termsField) termsField.hidden = true;
    if (terms) {
      terms.required = false;
      terms.disabled = true;
    }

    if (email) {
      email.required = false;
      email.placeholder = "Optional";
    }
    if (emailLabel) emailLabel.textContent = "Email (optional)";
    if (phone) {
      phone.required = false;
      phone.placeholder = "Optional";
    }
    if (phoneLabel) phoneLabel.textContent = "Phone (optional)";
  }

  function labelTextFor(form, field) {
    const id = field.id ? `label[for="${CSS.escape(field.id)}"]` : "";
    const label = id ? form.querySelector(id) : field.closest("label");
    return (
      label?.textContent?.replace(/\s+/g, " ").trim().replace(/\s*\(.*?\)\s*/g, "") ||
      "This field"
    );
  }

  function messageFor(form, field) {
    if (field.validity.valueMissing) {
      if (field.type === "checkbox") return "Please confirm this before continuing.";
      return `${labelTextFor(form, field)} is required.`;
    }
    if (field.validity.typeMismatch) {
      if (field.type === "email") return "Enter a valid email address.";
      return `Enter a valid ${labelTextFor(form, field).toLowerCase()}.`;
    }
    if (field.validity.tooShort) {
      return `${labelTextFor(form, field)} must be at least ${field.minLength} characters.`;
    }
    if (field.validity.tooLong) {
      return `${labelTextFor(form, field)} is too long.`;
    }
    if (field.validity.patternMismatch) {
      return field.title || `Enter a valid ${labelTextFor(form, field).toLowerCase()}.`;
    }
    if (field.validity.customError) {
      return field.validationMessage || "Check this field and try again.";
    }
    return "Check this field and try again.";
  }

  function clearError(field) {
    const wrapper = field.closest(".form-field") || field.closest(".form-check");
    wrapper?.classList.remove("is-error");
    field.removeAttribute("aria-invalid");
    field.setCustomValidity("");
    const errorId = field.getAttribute("aria-describedby");
    if (errorId?.endsWith("-error")) {
      document.getElementById(errorId)?.remove();
      field.removeAttribute("aria-describedby");
    }
  }

  function showError(form, field, customMessage) {
    const wrapper = field.closest(".form-field") || field.closest(".form-check");
    const baseId = field.id || field.name || "field";
    const errorId = `${baseId}-error`;
    let error = document.getElementById(errorId);
    if (!error) {
      error = document.createElement("p");
      error.className = "form-error";
      error.id = errorId;
      wrapper?.after(error);
    }
    error.textContent = customMessage || messageFor(form, field);
    wrapper?.classList.add("is-error");
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", errorId);
  }

  /** Returns true when field is valid. Shows inline error otherwise. */
  function validateField(form, field) {
    if (!field || field.disabled || field.hidden || field.closest("[hidden]")) {
      return true;
    }
    clearError(field);
    if (field.checkValidity()) return true;
    showError(form, field);
    return false;
  }

  /** Validates visible required fields in a form. Focuses first invalid. */
  function validateForm(form) {
    const fields = Array.from(form.querySelectorAll("input, select, textarea")).filter(
      (field) => !field.disabled && !field.closest("[hidden]")
    );
    let firstInvalid = null;
    fields.forEach((field) => {
      if (!validateField(form, field)) firstInvalid ||= field;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return false;
    }
    return true;
  }

  window.DrSwiftFormValidation = {
    clearError,
    showError,
    validateField,
    validateForm,
    messageFor,
  };

  document.querySelectorAll("[data-toggle-password]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-toggle-password");
      const input = id ? document.getElementById(id) : null;
      if (!input) return;
      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      btn.textContent = showing ? "Show" : "Hide";
      btn.setAttribute("aria-label", showing ? "Show password" : "Hide password");
    });
  });

  document.querySelectorAll("[data-auth-form]").forEach((form) => {
    const fields = Array.from(form.querySelectorAll("input, select, textarea"));

    fields.forEach((field) => {
      field.addEventListener("input", () => clearError(field));
      field.addEventListener("change", () => clearError(field));
      field.addEventListener("blur", () => {
        if (field.value.trim()) validateField(form, field);
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!validateForm(form)) return;

      const success = form.querySelector("[data-auth-success]");
      if (success) {
        success.hidden = false;
        form
          .querySelectorAll("input:not([type='checkbox']), select, textarea, button[type='submit']")
          .forEach((el) => {
            if (el.tagName === "BUTTON") {
              el.disabled = true;
            } else {
              el.readOnly = true;
            }
          });
      }

      if (location.pathname.endsWith("signup.html")) {
        try {
          if (form.dataset.signupMode === "family") {
            saveFamilyMember(form);
            if (success) {
              success.textContent = "Family member saved. Returning to My Account.";
            }
          } else {
            saveOwnerProfile(form);
            if (success) {
              success.textContent = "Account created. Opening My Account.";
            }
          }
        } catch {
          /* ignore demo session storage errors */
        }
        window.setTimeout(() => {
          window.location.href = "account.html";
        }, 650);
      }
    });
  });

  applySignupMode();
})();
