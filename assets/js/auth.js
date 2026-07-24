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

  function applySignupMode() {
    if (!location.pathname.endsWith("signup.html")) return;

    const params = new URLSearchParams(location.search);
    const isFamilyMode = params.get("mode") === "family";
    const ownerPanel = document.querySelector("[data-signup-owner]");
    const familyPanel = document.querySelector("[data-signup-family]");
    const profilePanel = document.querySelector("[data-complete-profile]");
    const fineprint = document.querySelector(".auth-split__fineprint");

    const asideKicker = document.querySelector("[data-signup-aside-kicker]");
    const asideTitle = document.querySelector("[data-signup-aside-title]");
    const asideCopy = document.querySelector("[data-signup-aside-copy]");
    const backLink = document.querySelector(".auth-split__back");
    const backLabel = document.querySelector("[data-signup-back-label]");

    if (isFamilyMode) {
      document.title = "Add family member | Dr.Swift Diagnostics";
      if (ownerPanel) ownerPanel.hidden = true;
      if (profilePanel) profilePanel.hidden = true;
      if (familyPanel) {
        familyPanel.hidden = false;
        familyPanel.classList.add("is-active");
      }
      if (asideKicker) asideKicker.textContent = "Family profile";
      if (asideTitle) asideTitle.textContent = "Tests for yourself and loved ones.";
      if (asideCopy) asideCopy.textContent = "Add each person once, then choose who a test is for at booking.";
      if (backLink) backLink.href = "account.html";
      if (backLabel) backLabel.textContent = "Back to My Account";
      return;
    }

    if (familyPanel) familyPanel.hidden = true;
    if (ownerPanel && !profilePanel?.classList.contains("is-active")) {
      ownerPanel.hidden = false;
      ownerPanel.classList.add("is-active");
    }
    if (fineprint) fineprint.hidden = false;
  }

  function initSignupPhoneAuth() {
    if (!location.pathname.endsWith("signup.html")) return;
    if (new URLSearchParams(location.search).get("mode") === "family") return;

    const card = document.querySelector("[data-signup-card]");
    if (!card) return;

    const RESEND_SECONDS = Number(window.DRSWIFT_SITE_CONTENT?.otp?.resendCooldownSec) || 30;
    const DEMO_OTP = "123456";
    const v = window.DrSwiftFormValidation;
    const auth = window.DrSwiftAuth;

    const ownerPanel = card.querySelector("[data-signup-owner]");
    const chromeEls = card.querySelectorAll("[data-signup-chrome]");
    const profilePanel = card.querySelector("[data-complete-profile]");
    const profileForm = card.querySelector("[data-complete-profile-form]");
    const profileSubtitle = card.querySelector("[data-complete-profile-subtitle]");
    const phoneForm = card.querySelector("[data-signup-phone-form]");
    const nameInput = card.querySelector("#signup-name");
    const phoneInput = card.querySelector("#signup-phone");
    const otpInput = card.querySelector("#signup-otp");
    const sendBtn = card.querySelector("[data-otp-send]");
    const otpBlock = card.querySelector("[data-otp-block]");
    const terms = phoneForm?.querySelector("[name='terms']");
    const statusEl = card.querySelector("[data-login-status]");

    let cooldownTimer = null;
    let cooldownLeft = 0;
    let otpSentOnce = false;
    let capturedName = "";

    function setStatus(message, isError) {
      if (!statusEl) return;
      if (!message) {
        statusEl.hidden = true;
        statusEl.textContent = "";
        statusEl.classList.remove("is-error");
        return;
      }
      statusEl.hidden = false;
      statusEl.textContent = message;
      statusEl.classList.toggle("is-error", !!isError);
    }

    function digitsOnly(value, max) {
      return String(value || "")
        .replace(/\D/g, "")
        .slice(0, max);
    }

    function clearCooldown() {
      if (cooldownTimer) {
        window.clearInterval(cooldownTimer);
        cooldownTimer = null;
      }
      cooldownLeft = 0;
    }

    function updateSendButton() {
      if (!sendBtn) return;
      if (cooldownLeft > 0) {
        sendBtn.disabled = true;
        sendBtn.textContent = `Resend in ${cooldownLeft}s`;
        return;
      }
      sendBtn.disabled = false;
      sendBtn.textContent = otpSentOnce ? "Resend OTP" : "Send OTP";
    }

    function startCooldown() {
      clearCooldown();
      cooldownLeft = RESEND_SECONDS;
      updateSendButton();
      cooldownTimer = window.setInterval(() => {
        cooldownLeft -= 1;
        if (cooldownLeft <= 0) {
          clearCooldown();
          updateSendButton();
          return;
        }
        updateSendButton();
      }, 1000);
    }

    function resetPhoneOtpUi() {
      clearCooldown();
      otpSentOnce = false;
      if (otpBlock) otpBlock.hidden = true;
      if (otpInput) {
        otpInput.value = "";
        v?.clearError(otpInput);
      }
      updateSendButton();
      setStatus("");
      const success = phoneForm?.querySelector("[data-auth-success]");
      if (success) success.hidden = true;
    }

    function showSignupChrome() {
      chromeEls.forEach((el) => {
        el.hidden = false;
        el.classList.add("is-active");
      });
      if (profilePanel) {
        profilePanel.hidden = true;
        profilePanel.classList.remove("is-active");
      }
    }

    function showCompleteProfile(identity, partial) {
      chromeEls.forEach((el) => {
        el.hidden = true;
        el.classList.remove("is-active");
      });
      if (!profilePanel || !profileForm) return;

      profilePanel.hidden = false;
      profilePanel.classList.add("is-active");

      const phone = auth?.digitsPhone?.(identity?.phone) || identity?.phone || "";
      const email = identity?.email || "";
      if (profileSubtitle) {
        if (phone) {
          profileSubtitle.textContent = `Verified +91 ${phone}. Add your details once — next time you’ll go straight in.`;
        } else if (email) {
          profileSubtitle.textContent = `Signed in as ${email}. Add your details once — next time you’ll go straight in.`;
        } else {
          profileSubtitle.textContent =
            "You’re verified. Add a few details so we can personalize bookings and reports.";
        }
      }

      const nameInput = profileForm.querySelector("[name='name']");
      const ageInput = profileForm.querySelector("[name='age']");
      const genderInput = profileForm.querySelector("[name='gender']");
      const emailInput = profileForm.querySelector("[name='email']");

      if (nameInput) nameInput.value = partial?.name || identity?.displayName || capturedName || "";
      if (ageInput) ageInput.value = partial?.age || "";
      if (genderInput) genderInput.value = partial?.gender || "";
      if (emailInput) emailInput.value = partial?.email || email || "";

      if (nameInput?.value) ageInput?.focus();
      else nameInput?.focus();
    }

    window.DrSwiftLoginUi = {
      showCompleteProfile,
      showLoginChrome: showSignupChrome,
    };

    phoneInput?.addEventListener("input", () => {
      const next = digitsOnly(phoneInput.value, 10);
      if (phoneInput.value !== next) phoneInput.value = next;
      v?.clearError(phoneInput);
      if (otpSentOnce) resetPhoneOtpUi();
    });

    otpInput?.addEventListener("input", () => {
      const next = digitsOnly(otpInput.value, 6);
      if (otpInput.value !== next) otpInput.value = next;
      v?.clearError(otpInput);
    });

    sendBtn?.addEventListener("click", () => {
      if (cooldownLeft > 0) return;
      if (!phoneForm || !phoneInput) return;

      setStatus("");
      if (!v?.validateField(phoneForm, nameInput) || !v?.validateField(phoneForm, phoneInput)) {
        (nameInput?.checkValidity() ? phoneInput : nameInput)?.focus();
        return;
      }
      if (terms && !terms.checked) {
        v?.validateField(phoneForm, terms);
        terms.focus();
        return;
      }

      capturedName = nameInput?.value?.trim() || "";
      otpSentOnce = true;
      if (otpBlock) otpBlock.hidden = false;
      otpInput?.focus();
      const hint = window.DRSWIFT_SITE_CONTENT?.otp?.hint || "OTP sent. Enter the 6-digit code below.";
      setStatus(`OTP sent. ${hint} (demo code ${DEMO_OTP})`);
      startCooldown();
    });

    card.querySelector("[data-otp-verify]")?.addEventListener("click", () => {
      const success = phoneForm?.querySelector("[data-auth-success]");
      if (!phoneForm || !otpInput || !auth) return;

      if (!otpSentOnce) {
        setStatus("Send an OTP first.", true);
        return;
      }
      if (terms && !terms.checked) {
        v?.validateField(phoneForm, terms);
        terms.focus();
        return;
      }
      if (
        !v?.validateField(phoneForm, nameInput) ||
        !v?.validateField(phoneForm, phoneInput) ||
        !v?.validateField(phoneForm, otpInput)
      ) {
        if (!nameInput?.checkValidity()) nameInput?.focus();
        else if (!phoneInput?.checkValidity()) phoneInput?.focus();
        else otpInput?.focus();
        return;
      }
      if (otpInput.value !== DEMO_OTP) {
        setStatus("Incorrect OTP. Use the demo code 123456.", true);
        otpInput.focus();
        return;
      }

      setStatus("");
      capturedName = nameInput?.value?.trim() || capturedName;
      auth.continueAfterIdentity(
        {
          method: "phone",
          phone: phoneInput.value,
          displayName: capturedName,
        },
        {
          onExisting() {
            if (success) {
              success.hidden = false;
              success.textContent = "Welcome back. Opening your account…";
            }
            clearCooldown();
            if (sendBtn) sendBtn.disabled = true;
            window.setTimeout(() => {
              window.location.href = "account.html";
            }, 500);
          },
          onNew(pendingIdentity, partial) {
            if (success) success.hidden = true;
            clearCooldown();
            showCompleteProfile(
              { ...pendingIdentity, displayName: capturedName },
              { ...partial, name: partial?.name || capturedName }
            );
          },
        }
      );
    });

    profileForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!auth || !v?.validateForm(profileForm)) return;

      const success = profileForm.querySelector("[data-auth-success]");
      const result = auth.completeProfile(
        {
          name: profileForm.querySelector("[name='name']")?.value?.trim(),
          age: profileForm.querySelector("[name='age']")?.value,
          gender: profileForm.querySelector("[name='gender']")?.value,
          email: profileForm.querySelector("[name='email']")?.value?.trim(),
        },
        {
          onComplete() {
            if (success) {
              success.hidden = false;
              success.textContent = "Profile saved. Opening your account…";
            }
            profileForm.querySelectorAll("input, select, button").forEach((el) => {
              if (el.tagName === "BUTTON") el.disabled = true;
              else el.readOnly = true;
            });
            window.setTimeout(() => {
              window.location.href = "account.html";
            }, 550);
          },
        }
      );

      if (result.status === "error") {
        setStatus(result.message, true);
        showSignupChrome();
      }
    });

    card.querySelector("[data-complete-profile-back]")?.addEventListener("click", () => {
      auth?.clearPendingAuth?.();
      resetPhoneOtpUi();
      showSignupChrome();
      phoneInput?.focus();
    });

    const pending = auth?.getPendingAuth?.();
    if (pending) {
      showCompleteProfile(pending, null);
    } else {
      resetPhoneOtpUi();
      showSignupChrome();
    }

    // silence unused lint for ownerPanel
    void ownerPanel;
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
      profileComplete: true,
    });
    writeBoth(DEMO_SESSION_KEY, {
      ownerId: household.owner.id,
      method: "signup",
      signedInAt: updatedAt,
    });

    // Keep progressive login registry in sync (may still need age/gender later)
    if (window.DrSwiftAuth?.upsertUser) {
      window.DrSwiftAuth.upsertUser(
        { method: "signup", phone: owner.phone, email: owner.email },
        {
          name: owner.name,
          email: owner.email,
          phone: owner.phone,
          age: form.querySelector("[name='age']")?.value || "",
          gender: form.querySelector("[name='gender']")?.value || "",
        }
      );
    }
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
            window.setTimeout(() => {
              window.location.href = "account.html";
            }, 650);
          }
        } catch {
          /* ignore demo session storage errors */
        }
      }
    });
  });

  applySignupMode();
  initSignupPhoneAuth();
})();
