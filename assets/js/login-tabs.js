/**
 * Login card: Customer ↔ Doctor, Phone ↔ Mail (one form at a time).
 * Phone OTP: Send → 30s cooldown → Resend; OTP field appears after first send.
 */
(function () {
  const RESEND_SECONDS = 30;
  const card = document.querySelector("[data-login-card]");
  if (!card) return;

  const v = window.DrSwiftFormValidation;

  const audienceTabs = card.querySelectorAll("[data-audience]");
  const panels = {
    customer: card.querySelector('[data-panel="customer"]'),
    doctor: card.querySelector('[data-panel="doctor"]'),
  };
  const methodTabs = card.querySelectorAll("[data-method]");
  const methodForms = {
    phone: card.querySelector('[data-login-method="phone"]'),
    mail: card.querySelector('[data-login-method="mail"]'),
  };

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
    const success = methodForms.phone?.querySelector("[data-auth-success]");
    if (success) success.hidden = true;
  }

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
    if (audience === "customer") setMethod("phone");
  }

  function setMethod(method) {
    methodTabs.forEach((tab) => {
      const on = tab.dataset.method === method;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    Object.entries(methodForms).forEach(([key, form]) => {
      if (!form) return;
      form.hidden = key !== method;
    });
    setStatus("");
    if (method === "phone") updateSendButton();
  }

  audienceTabs.forEach((tab) => {
    tab.addEventListener("click", () => setAudience(tab.dataset.audience));
  });
  methodTabs.forEach((tab) => {
    tab.addEventListener("click", () => setMethod(tab.dataset.method));
  });

  phoneInput?.addEventListener("input", () => {
    const next = digitsOnly(phoneInput.value, 10);
    if (phoneInput.value !== next) phoneInput.value = next;
    v?.clearError(phoneInput);
    if (otpSentOnce) resetPhoneOtpUi();
  });

  phoneInput?.addEventListener("blur", () => {
    if (!methodForms.phone || methodForms.phone.hidden) return;
    v?.validateField(methodForms.phone, phoneInput);
  });

  otpInput?.addEventListener("input", () => {
    const next = digitsOnly(otpInput.value, 6);
    if (otpInput.value !== next) otpInput.value = next;
    v?.clearError(otpInput);
  });

  otpInput?.addEventListener("blur", () => {
    if (!otpBlock || otpBlock.hidden || !methodForms.phone) return;
    v?.validateField(methodForms.phone, otpInput);
  });

  sendBtn?.addEventListener("click", () => {
    if (cooldownLeft > 0) return;
    const form = methodForms.phone;
    if (!form || !phoneInput) return;

    setStatus("");
    if (!v?.validateField(form, phoneInput)) {
      phoneInput.focus();
      return;
    }

    otpSentOnce = true;
    if (otpBlock) otpBlock.hidden = false;
    otpInput?.focus();
    setStatus("OTP sent. Enter the 6-digit code below.");
    startCooldown();
  });

  card.querySelector("[data-otp-verify]")?.addEventListener("click", () => {
    const form = methodForms.phone;
    const success = form?.querySelector("[data-auth-success]");
    if (!form || !otpInput) return;

    if (!otpSentOnce) {
      setStatus("Send an OTP first.", true);
      return;
    }
    if (!v?.validateField(form, phoneInput) || !v?.validateField(form, otpInput)) {
      (otpInput.checkValidity() ? phoneInput : otpInput)?.focus();
      return;
    }

    setStatus("");
    if (success) {
      success.hidden = false;
      success.textContent = "Phone verified. Redirecting to your account…";
    }
    clearCooldown();
    if (sendBtn) sendBtn.disabled = true;
    window.setTimeout(() => {
      window.location.href = "account.html";
    }, 650);
  });

  resetPhoneOtpUi();
  setAudience("customer");
  setMethod("phone");
})();
