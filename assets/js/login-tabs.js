/**
 * Login card: Customer ↔ Doctor.
 * Customers: phone + OTP or Google only (no email/password).
 * After phone OTP / identity: existing users go to account;
 * new users see complete-profile (name, age, gender).
 */
(function () {
  const RESEND_SECONDS = Number(window.DRSWIFT_SITE_CONTENT?.otp?.resendCooldownSec) || 30;
  const DEMO_OTP = "123456";
  const card = document.querySelector("[data-login-card]");
  if (!card) return;

  const v = window.DrSwiftFormValidation;
  const auth = window.DrSwiftAuth;

  const audienceTabs = card.querySelectorAll("[data-audience]");
  const panels = {
    customer: card.querySelector('[data-panel="customer"]'),
    doctor: card.querySelector('[data-panel="doctor"]'),
  };

  const chromeEls = card.querySelectorAll("[data-login-chrome]");
  const profilePanel = card.querySelector("[data-complete-profile]");
  const profileForm = card.querySelector("[data-complete-profile-form]");
  const profileSubtitle = card.querySelector("[data-complete-profile-subtitle]");

  const phoneForm = card.querySelector('[data-login-method="phone"]');
  const phoneInput = card.querySelector("#cust-phone");
  const otpInput = card.querySelector("#cust-otp");
  const sendBtn = card.querySelector("[data-otp-send]");
  const otpBlock = card.querySelector("[data-otp-block]");
  const statusEl = card.querySelector("[data-login-status]");
  let cooldownTimer = null;
  let cooldownLeft = 0;
  let otpSentOnce = false;

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

  function showLoginChrome() {
    chromeEls.forEach((el) => {
      if (el.hasAttribute("data-panel")) {
        const isCustomer = el.getAttribute("data-panel") === "customer";
        el.hidden = !isCustomer;
        el.classList.toggle("is-active", isCustomer);
      } else {
        el.hidden = false;
      }
    });
    if (profilePanel) profilePanel.hidden = true;
    setAudience("customer");
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

    if (nameInput) nameInput.value = partial?.name || identity?.displayName || "";
    if (ageInput) ageInput.value = partial?.age || "";
    if (genderInput) genderInput.value = partial?.gender || "";
    if (emailInput) emailInput.value = partial?.email || email || "";

    nameInput?.focus();
  }

  window.DrSwiftLoginUi = {
    showCompleteProfile,
    showLoginChrome,
  };

  function setAudience(audience) {
    audienceTabs.forEach((tab) => {
      const on = tab.dataset.audience === audience;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    Object.entries(panels).forEach(([key, panel]) => {
      if (!panel) return;
      const on = key === audience;
      panel.hidden = !on;
      panel.classList.toggle("is-active", on);
    });
    if (audience === "customer") {
      updateSendButton();
    }
  }

  audienceTabs.forEach((tab) => {
    tab.addEventListener("click", () => setAudience(tab.dataset.audience));
  });

  phoneInput?.addEventListener("input", () => {
    const next = digitsOnly(phoneInput.value, 10);
    if (phoneInput.value !== next) phoneInput.value = next;
    v?.clearError(phoneInput);
    if (otpSentOnce) resetPhoneOtpUi();
  });

  phoneInput?.addEventListener("blur", () => {
    if (!phoneForm || phoneForm.hidden) return;
    v?.validateField(phoneForm, phoneInput);
  });

  otpInput?.addEventListener("input", () => {
    const next = digitsOnly(otpInput.value, 6);
    if (otpInput.value !== next) otpInput.value = next;
    v?.clearError(otpInput);
  });

  otpInput?.addEventListener("blur", () => {
    if (!otpBlock || otpBlock.hidden || !phoneForm) return;
    v?.validateField(phoneForm, otpInput);
  });

  sendBtn?.addEventListener("click", () => {
    if (cooldownLeft > 0) return;
    if (!phoneForm || !phoneInput) return;

    setStatus("");
    if (!v?.validateField(phoneForm, phoneInput)) {
      phoneInput.focus();
      return;
    }

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
    if (!v?.validateField(phoneForm, phoneInput) || !v?.validateField(phoneForm, otpInput)) {
      (otpInput.checkValidity() ? phoneInput : otpInput)?.focus();
      return;
    }

    if (otpInput.value !== DEMO_OTP) {
      setStatus("Incorrect OTP. Use the demo code 123456.", true);
      otpInput.focus();
      return;
    }

    setStatus("");
    const identity = {
      method: "phone",
      phone: phoneInput.value,
    };

    auth.continueAfterIdentity(identity, {
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
        showCompleteProfile(pendingIdentity, partial);
      },
    });
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
      showLoginChrome();
    }
  });

  card.querySelector("[data-complete-profile-back]")?.addEventListener("click", () => {
    auth?.clearPendingAuth?.();
    resetPhoneOtpUi();
    showLoginChrome();
    phoneInput?.focus();
  });

  // Resume complete-profile if user refreshed mid-flow
  const pending = auth?.getPendingAuth?.();
  if (pending) {
    showCompleteProfile(pending, null);
  } else {
    resetPhoneOtpUi();
    setAudience("customer");
  }
})();
