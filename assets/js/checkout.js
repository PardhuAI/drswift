/**
 * Booking / checkout form — guest allowed.
 * Required: name, gender, phone (OTP verified), address. Age optional.
 */
(function () {
  const VERIFY_STORAGE_KEY = "drswift.checkout.phoneVerified.v1";
  const CHECKOUT_STORAGE_KEY = "drswift.checkout.details.v1";
  const DRAFT_STORAGE_KEY = "drswift.checkout.draft.v1";
  const PAYMENT_STORAGE_KEY = "drswift.checkout.payment.v1";
  const LOCAL_DEMO_OTP = "123456";

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function readVerified() {
    try {
      const raw =
        localStorage.getItem(VERIFY_STORAGE_KEY) ||
        sessionStorage.getItem(VERIFY_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.phone || !parsed?.until || Date.now() > Number(parsed.until)) {
        localStorage.removeItem(VERIFY_STORAGE_KEY);
        sessionStorage.removeItem(VERIFY_STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  function writeVerified(phone) {
    const payload = JSON.stringify({ phone, until: Date.now() + 25 * 60 * 1000 });
    localStorage.setItem(VERIFY_STORAGE_KEY, payload);
    sessionStorage.setItem(VERIFY_STORAGE_KEY, payload);
  }

  function clearVerified() {
    localStorage.removeItem(VERIFY_STORAGE_KEY);
    sessionStorage.removeItem(VERIFY_STORAGE_KEY);
  }

  function setStatus(el, message, isError) {
    if (!el) return;
    el.hidden = !message;
    el.textContent = message || "";
    el.classList.toggle("is-error", !!isError);
  }

  function isValidCityVillage(value) {
    const text = String(value || "").trim();
    if (text.length < 3 || text.length > 99) return false;
    if (!/^[A-Za-z]/.test(text)) return false;
    const letterCount = (text.match(/[A-Za-z]/g) || []).length;
    return letterCount >= 3;
  }

  function setPhoneVerifiedUi(form, verified, otpVisible = false) {
    const badge = form.querySelector("[data-phone-verified-badge]");
    const otpBlock = form.querySelector("[data-otp-block]");
    const submit = form.querySelector("[type='submit']");
    const sendBtn = form.querySelector("[data-otp-send]");
    const phoneRow = form.querySelector(".checkout-wire-field--phone .phone-verify-row");
    if (badge) badge.hidden = !verified;
    if (otpBlock) otpBlock.hidden = verified || !otpVisible;
    if (submit) submit.disabled = !verified;
    if (phoneRow) phoneRow.classList.toggle("is-verified", !!verified);
    if (sendBtn) {
      sendBtn.hidden = !!verified;
      sendBtn.setAttribute("aria-hidden", verified ? "true" : "false");
      if (verified) sendBtn.setAttribute("tabindex", "-1");
      else sendBtn.removeAttribute("tabindex");
    }
  }

  function syncOtpSendEnabled(form) {
    const phoneInput = form.querySelector("#book-phone");
    const sendBtn = form.querySelector("[data-otp-send]");
    if (!phoneInput || !sendBtn) return;
    const digits = normalizedPhone(phoneInput.value);
    sendBtn.disabled = digits.length !== 10 || !!readVerified();
  }

  function normalizedPhone(value) {
    return String(value || "").replace(/\D/g, "").slice(-10);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatPrice(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  }

  function prefillFromGoogle(form, user) {
    if (!form || !user) return;
    const name = form.querySelector("#book-name");
    if (name && user.displayName && !name.value) name.value = user.displayName;
  }

  function cartLineItemsJson() {
    try {
      const params = new URLSearchParams(location.search);
      if (params.get("cart") !== "checkout") return null;
      const cart = JSON.parse(localStorage.getItem("drswift.cart.v1") || "[]");
      return JSON.stringify(cart);
    } catch {
      return null;
    }
  }

  function splitName(name) {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return { firstName: "", lastName: "" };
    if (parts.length === 1) return { firstName: parts[0], lastName: "" };
    return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
  }

  function cartLineItems() {
    try {
      return JSON.parse(localStorage.getItem("drswift.cart.v1") || "[]");
    } catch {
      return [];
    }
  }

  function cartItemsWithTests() {
    const tests = Array.isArray(window.DRSWIFT_TESTS) ? window.DRSWIFT_TESTS : [];
    return cartLineItems()
      .map((item) => ({
        test: tests.find((entry) => entry.slug === item.slug),
        customPanels: item.customPanels
      }))
      .filter((item) => item.test);
  }

  function itemPrice(item) {
    if (item.test.customizable && Array.isArray(item.customPanels) && window.DRSWIFT_PANELS) {
      return item.customPanels.reduce(
        (sum, panelId) => sum + Number(window.DRSWIFT_PANELS[panelId]?.price || 0),
        0
      );
    }
    return Number(item.test.price || 0);
  }

  function initPaymentFlow() {
    const brandCopy = {
      gpay: {
        title: "G Pay",
        brand: "G Pay · UPI",
        help: "Open Google Pay and scan this QR, or pay to the UPI ID below.",
        method: "G Pay",
      },
      phonepe: {
        title: "PhonePe",
        brand: "PhonePe · RuPay UPI",
        help: "Open PhonePe and scan this QR. Keep this screen open until confirmation.",
        method: "PhonePe",
      },
      upi: {
        title: "UPI",
        brand: "Any UPI app",
        help: "Scan with GPay, PhonePe, Paytm, or BHIM.",
        method: "UPI",
      },
    };

    let selectedBank = "";
    let selectedUpiBrand = "upi";

    function cartTotalLabel() {
      const total = cartItemsWithTests().reduce((sum, item) => sum + itemPrice(item), 0);
      return formatPrice(total);
    }

    function syncPayTotals() {
      document.querySelectorAll("[data-pay-total]").forEach((el) => {
        el.textContent = cartTotalLabel();
      });
    }

    document.querySelectorAll("[data-pay-go]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-pay-go");
        if (target === "pay-qr") {
          selectedUpiBrand = btn.getAttribute("data-brand") || "upi";
          const copy = brandCopy[selectedUpiBrand] || brandCopy.upi;
          const title = document.querySelector("[data-qr-title]");
          const brand = document.querySelector("[data-qr-brand]");
          const help = document.querySelector("[data-qr-help]");
          if (title) title.textContent = copy.title;
          if (brand) brand.textContent = copy.brand;
          if (help) help.textContent = copy.help;
          syncPayTotals();
        }
        activateDeckCard(target);
      });
    });

    document.querySelectorAll("[data-card-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll("[data-card-tab]").forEach((t) => t.classList.remove("is-on"));
        tab.classList.add("is-on");
      });
    });

    document.querySelectorAll("[data-bank]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-bank]").forEach((b) => b.classList.remove("is-on"));
        btn.classList.add("is-on");
        selectedBank = btn.textContent.trim();
        const cont = document.querySelector("[data-bank-continue]");
        if (cont) cont.disabled = false;
      });
    });

    const cardForm = document.querySelector("[data-card-pay-form]");
    initCardFieldGuards(cardForm || document);
    initBillingAddressUi(cardForm || document);
    cardForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!validateCardFields(cardForm)) return;
      const choice = cardForm.querySelector("[data-billing-choice]:checked")?.value;
      if (choice === "new") {
        const cityInput = cardForm.querySelector("[data-billing-city]");
        if (cityInput && !isValidCityVillage(cityInput.value)) {
          cityInput.setCustomValidity(
            "City/Town/Village must start with a letter, include at least 3 letters, and be under 100 characters."
          );
          cityInput.reportValidity();
          return;
        }
        cityInput?.setCustomValidity("");
      }
      if (!cardForm.reportValidity()) return;
      completePayment("Credit / Debit card");
    });

    document.querySelector("[data-bank-continue]")?.addEventListener("click", () => {
      if (!selectedBank) return;
      completePayment(`Net Banking · ${selectedBank}`);
    });

    document.querySelectorAll("[data-complete-pay]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const copy = brandCopy[selectedUpiBrand] || brandCopy.upi;
        completePayment(btn.getAttribute("data-complete-pay") || copy.method);
      });
    });

    syncPayTotals();
  }

  function completePayment(methodLabel) {
    const details = readCheckoutDetails();
    if (!details) {
      activateDeckCard("details");
      return;
    }
    const amount = cartItemsWithTests().reduce((sum, item) => sum + itemPrice(item), 0);
    const payment = {
      amount,
      method: methodLabel || "Online",
      reference: `DS-${Date.now().toString(36).toUpperCase()}`,
      paidAt: new Date().toISOString(),
    };
    sessionStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(payment));
    renderInlineConfirmation(details, payment);
    try {
      localStorage.removeItem("drswift.cart.v1");
      window.dispatchEvent(new CustomEvent("drswift:cart-updated"));
    } catch {
      /* ignore */
    }
  }

  function formatSampleDayLabel(value) {
    if (!value) return "";
    if (value === "Today" || value === "Tomorrow") return value;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return value;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function updateWhenConfirm(form) {
    const valueEl = form.querySelector("[data-when-confirm-value]");
    if (!valueEl) return;
    const day =
      form.querySelector("input[name='sampleDay']:checked")?.value || "Today";
    const window =
      form.querySelector("input[name='sampleWindow']:checked")?.value || "";
    const dayLabel = formatSampleDayLabel(day);
    valueEl.textContent = window ? `${dayLabel} · ${window}` : dayLabel;
  }

  /** Current clock in Asia/Kolkata (IST, UTC+5:30). */
  function getIstNow() {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
        .formatToParts(new Date())
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value])
    );
    return {
      hour: Number(parts.hour),
      minute: Number(parts.minute),
      ymd: `${parts.year}-${parts.month}-${parts.day}`,
    };
  }

  /**
   * Same-day window cutoffs (IST):
   * Morning  — hidden once morning has passed (from 12:00)
   * Afternoon — hidden from 12:00
   * Evening — hidden from 16:00 (4 PM)
   */
  function availableWindowsForIstHour(hour) {
    return {
      Morning: hour < 12,
      Afternoon: hour < 12,
      Evening: hour < 16,
    };
  }

  function isSampleDayToday(form) {
    const checked = form.querySelector("input[name='sampleDay']:checked");
    if (!checked) return false;
    if (checked.value === "Today") return true;
    if (checked.value === "Tomorrow") return false;
    return checked.value === getIstNow().ymd;
  }

  function syncSampleWindows(form) {
    const timeGroup = form.querySelector(".checkout-segments--time");
    if (!timeGroup) return;

    const ist = getIstNow();
    const todayAvailability = availableWindowsForIstHour(ist.hour);
    const todayHasAny = Object.values(todayAvailability).some(Boolean);
    const filterToday = isSampleDayToday(form);
    const available = filterToday
      ? todayAvailability
      : { Morning: true, Afternoon: true, Evening: true };

    const windows = [
      { value: "Morning", input: form.querySelector("#book-time-morning") },
      { value: "Afternoon", input: form.querySelector("#book-time-afternoon") },
      { value: "Evening", input: form.querySelector("#book-time-evening") },
    ];

    let firstVisible = null;
    let checkedStillVisible = false;

    windows.forEach(({ value, input }) => {
      if (!input) return;
      const label = form.querySelector(`label[for="${input.id}"]`);
      const show = !!available[value];
      input.disabled = !show;
      input.hidden = !show;
      if (label) label.hidden = !show;
      if (show && !firstVisible) firstVisible = input;
      if (show && input.checked) checkedStillVisible = true;
    });

    let hint = form.querySelector("[data-window-hint]");
    if (!hint && timeGroup.parentElement) {
      hint = document.createElement("p");
      hint.className = "checkout-window-hint";
      hint.setAttribute("data-window-hint", "");
      hint.hidden = true;
      timeGroup.insertAdjacentElement("afterend", hint);
    }

    const todayRadio = form.querySelector("#book-day-today");
    const tomorrowRadio = form.querySelector("#book-day-tomorrow");
    const customRadio = form.querySelector("[data-custom-day]");

    if (todayRadio) todayRadio.disabled = !todayHasAny;

    if (filterToday && !todayHasAny) {
      if (hint) {
        hint.hidden = false;
        hint.textContent = "No collection windows left for today (IST). Tomorrow is selected.";
      }
      if (todayRadio) todayRadio.checked = false;
      if (tomorrowRadio && !customRadio?.checked) {
        tomorrowRadio.checked = true;
      }
      windows.forEach(({ input }) => {
        if (!input) return;
        const label = form.querySelector(`label[for="${input.id}"]`);
        input.disabled = false;
        input.hidden = false;
        if (label) label.hidden = false;
      });
      const morning = form.querySelector("#book-time-morning");
      if (morning) morning.checked = true;
      updateWhenConfirm(form);
      return;
    }

    if (hint) {
      if (filterToday && (!todayAvailability.Morning || !todayAvailability.Afternoon)) {
        const remaining = ["Morning", "Afternoon", "Evening"]
          .filter((value) => todayAvailability[value])
          .join(" / ");
        hint.hidden = !remaining;
        hint.textContent = remaining
          ? `Earlier windows have passed (IST). Available today: ${remaining}.`
          : "";
      } else {
        hint.hidden = true;
        hint.textContent = "";
      }
    }

    if (!checkedStillVisible && firstVisible) {
      firstVisible.checked = true;
    }

    updateWhenConfirm(form);
  }

  function initCollectionCalendar(form) {
    const MAX_AHEAD_DAYS = 30;
    const trigger = form.querySelector("[data-cal-trigger]");
    const popover = form.querySelector("[data-cal-popover]");
    const grid = form.querySelector("[data-cal-grid]");
    const monthLabel = form.querySelector("[data-cal-month]");
    const chip = form.querySelector("[data-date-chip]");
    const chipLabel = form.querySelector("[data-date-chip-label]");
    const customRadio = form.querySelector("[data-custom-day]");
    const todayRadio = form.querySelector("#book-day-today");
    const tomorrowRadio = form.querySelector("#book-day-tomorrow");
    const prevBtn = form.querySelector("[data-cal-prev]");
    const nextBtn = form.querySelector("[data-cal-next]");
    const closeBtn = form.querySelector("[data-cal-close]");
    const clearBtn = form.querySelector("[data-clear-date]");

    if (!trigger || !popover || !grid || !customRadio || !todayRadio || !tomorrowRadio) {
      return;
    }

    const today = startOfDay(new Date());
    const maxDate = addDays(today, MAX_AHEAD_DAYS);
    let view = new Date(today.getFullYear(), today.getMonth(), 1);
    let selected = null;

    function startOfDay(d) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }

    function addDays(d, n) {
      const x = new Date(d);
      x.setDate(x.getDate() + n);
      return x;
    }

    function sameDay(a, b) {
      return (
        a &&
        b &&
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
      );
    }

    function formatDisplay(d) {
      return d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    function formatChip(d) {
      return d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    }

    function formatValue(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }

    function openCal() {
      popover.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      render();
    }

    function closeCal() {
      popover.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }

    function clearCustom() {
      selected = null;
      customRadio.value = "";
      customRadio.checked = false;
      if (chip) {
        chip.hidden = true;
        chip.classList.remove("is-visible");
      }
      if (chipLabel) chipLabel.textContent = "";
    }

    function applyCustomDate(d) {
      selected = startOfDay(d);
      customRadio.value = formatValue(selected);
      customRadio.checked = true;
      todayRadio.checked = false;
      tomorrowRadio.checked = false;
      if (chipLabel) chipLabel.textContent = formatChip(selected);
      if (chip) {
        chip.hidden = false;
        chip.classList.add("is-visible");
      }
      closeCal();
      render();
      syncSampleWindows(form);
      saveDraft(form);
    }

    function render() {
      const year = view.getFullYear();
      const month = view.getMonth();
      if (monthLabel) {
        monthLabel.textContent = view.toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        });
      }

      const first = new Date(year, month, 1);
      const startPad = first.getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const prevDays = new Date(year, month, 0).getDate();
      const minView = new Date(today.getFullYear(), today.getMonth(), 1);
      const maxView = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

      if (prevBtn) prevBtn.disabled = view <= minView;
      if (nextBtn) nextBtn.disabled = view >= maxView;

      grid.innerHTML = "";
      for (let i = 0; i < 42; i += 1) {
        const btn = document.createElement("button");
        btn.type = "button";
        let date;
        let outside = false;

        if (i < startPad) {
          date = new Date(year, month - 1, prevDays - startPad + i + 1);
          outside = true;
        } else if (i >= startPad + daysInMonth) {
          date = new Date(year, month + 1, i - startPad - daysInMonth + 1);
          outside = true;
        } else {
          date = new Date(year, month, i - startPad + 1);
        }

        const day = startOfDay(date);
        btn.textContent = String(day.getDate());
        btn.setAttribute("role", "gridcell");
        btn.setAttribute("aria-label", formatDisplay(day));
        if (outside) btn.classList.add("is-outside");
        if (sameDay(day, today)) btn.classList.add("is-today");
        if (selected && sameDay(day, selected)) {
          btn.classList.add("is-selected");
          btn.setAttribute("aria-current", "date");
        }

        const disabled = day < today || day > maxDate;
        btn.disabled = disabled;
        if (!disabled) {
          btn.addEventListener("click", () => applyCustomDate(day));
        }
        grid.appendChild(btn);
      }
    }

    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      if (popover.hidden) openCal();
      else closeCal();
    });

    closeBtn?.addEventListener("click", closeCal);
    prevBtn?.addEventListener("click", () => {
      view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
      render();
    });
    nextBtn?.addEventListener("click", () => {
      view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
      render();
    });
    clearBtn?.addEventListener("click", (event) => {
      event.stopPropagation();
      clearCustom();
      todayRadio.checked = true;
      syncSampleWindows(form);
    });

    todayRadio.addEventListener("change", () => {
      if (!todayRadio.checked) return;
      clearCustom();
      closeCal();
      syncSampleWindows(form);
    });
    tomorrowRadio.addEventListener("change", () => {
      if (!tomorrowRadio.checked) return;
      clearCustom();
      closeCal();
      syncSampleWindows(form);
    });

    document.addEventListener("click", (event) => {
      if (popover.hidden) return;
      if (popover.contains(event.target) || trigger.contains(event.target)) return;
      closeCal();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeCal();
    });

    render();
    syncSampleWindows(form);
  }

  function activateDeckCard(name) {
    const paymentStages = ["pay-choose", "pay-card", "pay-qr", "pay-bank"];
    document.querySelectorAll("[data-checkout-stage]").forEach((stage) => {
      const stageName = stage.getAttribute("data-checkout-stage");
      const isCurrent = stageName === name;
      stage.hidden = !isCurrent;
      stage.classList.toggle("is-active", isCurrent);
    });

    const customerSummary = document.querySelector("[data-summary-customer]");
    const paymentSummary = document.querySelector("[data-summary-payment]");
    if (customerSummary) {
      customerSummary.hidden = name === "details";
    }
    if (paymentSummary) {
      paymentSummary.hidden = name !== "confirmation";
    }

    if (name === "pay-card") {
      syncBillingAddress(readCheckoutDetails());
    }

    /* Scroll the stable frame, not the stage node — avoids left/right jumps
       when panel height changes between steps. */
    const frame =
      document.querySelector(".checkout-frame") ||
      document.querySelector(".checkout-wire-shell");
    if (frame) {
      const top =
        frame.getBoundingClientRect().top +
        window.scrollY -
        (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scroll-header-offset")) || 84) -
        12;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }

    if (paymentStages.includes(name)) {
      const total = cartItemsWithTests().reduce((sum, item) => sum + itemPrice(item), 0);
      document.querySelectorAll("[data-pay-total]").forEach((el) => {
        el.textContent = formatPrice(total);
      });
    }
  }

  function renderInlinePayment(details) {
    const patient = document.querySelector("[data-inline-payment-patient]");
    if (patient) {
      const rows = [
        ["Name", details.name],
        ["Gender", details.gender],
        ["Age", details.age],
        ["Phone", details.phone],
        ["When", `${details.sampleDayLabel || formatSampleDayLabel(details.sampleDay)} · ${details.sampleWindow}`],
        ["City", details.city],
        ["Address", details.address],
      ];
      patient.classList.add("checkout-kv");
      patient.innerHTML = rows
        .filter(([, value]) => value != null && String(value).trim() !== "")
        .map(
          ([label, value]) =>
            `<div class="checkout-kv__row"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`
        )
        .join("");
    }

    const cardName = document.querySelector("#cc-name");
    if (cardName && !cardName.value) {
      cardName.value = details.name || "";
    }

    syncBillingAddress(details);
    activateDeckCard("pay-choose");
  }

  function syncBillingAddress(details) {
    const addressEl = document.querySelector("[data-billing-customer-address]");
    const cityEl = document.querySelector("[data-billing-customer-city]");
    if (addressEl) addressEl.textContent = details?.address || "—";
    if (cityEl) cityEl.textContent = details?.city || "—";
  }

  function digitsOnly(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function formatCardNumber(value) {
    const digits = digitsOnly(value).slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  }

  function fillCardExpiryYears(select) {
    if (!select || select.dataset.filled === "1") return;
    const now = new Date();
    const start = now.getFullYear();
    for (let year = start; year <= start + 15; year += 1) {
      const opt = document.createElement("option");
      opt.value = String(year);
      opt.textContent = String(year);
      select.appendChild(opt);
    }
    select.dataset.filled = "1";
  }

  function initCardFieldGuards(root) {
    const scope = root || document;
    const number = scope.querySelector("[data-card-number]");
    const cvv = scope.querySelector("[data-card-cvv]");
    const name = scope.querySelector("[data-card-name]");
    const expYear = scope.querySelector("[data-card-exp-year]");
    const pin = scope.querySelector("[data-billing-pin]");

    fillCardExpiryYears(expYear);

    number?.addEventListener("input", () => {
      number.value = formatCardNumber(number.value);
      number.setCustomValidity("");
    });
    number?.addEventListener("blur", () => {
      const digits = digitsOnly(number.value);
      if (digits && digits.length !== 16) {
        number.setCustomValidity("Enter a valid 16-digit card number.");
      } else {
        number.setCustomValidity("");
      }
    });

    cvv?.addEventListener("input", () => {
      cvv.value = digitsOnly(cvv.value).slice(0, 4);
      cvv.setCustomValidity("");
    });
    cvv?.addEventListener("blur", () => {
      const digits = digitsOnly(cvv.value);
      if (digits && (digits.length < 3 || digits.length > 4)) {
        cvv.setCustomValidity("CVV must be 3 or 4 digits.");
      } else {
        cvv.setCustomValidity("");
      }
    });

    name?.addEventListener("input", () => {
      name.value = name.value.replace(/[^A-Za-z .'-]/g, "").slice(0, 60);
      name.setCustomValidity("");
    });

    pin?.addEventListener("input", () => {
      pin.value = digitsOnly(pin.value).slice(0, 6);
    });
  }

  function validateCardFields(form) {
    if (!form) return true;
    const number = form.querySelector("[data-card-number]");
    const cvv = form.querySelector("[data-card-cvv]");
    const month = form.querySelector("[data-card-exp-month]");
    const year = form.querySelector("[data-card-exp-year]");

    if (number) {
      const digits = digitsOnly(number.value);
      if (digits.length !== 16) {
        number.setCustomValidity("Enter a valid 16-digit card number.");
        number.reportValidity();
        return false;
      }
      number.value = formatCardNumber(digits);
      number.setCustomValidity("");
    }

    if (cvv) {
      const digits = digitsOnly(cvv.value);
      if (digits.length < 3 || digits.length > 4) {
        cvv.setCustomValidity("CVV must be 3 or 4 digits.");
        cvv.reportValidity();
        return false;
      }
      cvv.setCustomValidity("");
    }

    if (month?.value && year?.value) {
      const expMonth = Number(month.value);
      const expYear = Number(year.value);
      const now = new Date();
      const expEnd = new Date(expYear, expMonth, 0, 23, 59, 59);
      if (expEnd < now) {
        month.setCustomValidity("Card expiry cannot be in the past.");
        month.reportValidity();
        return false;
      }
      month.setCustomValidity("");
    }

    return true;
  }

  function initBillingAddressUi(root) {
    const scope = root || document;
    const cards = scope.querySelectorAll(".pay-address-card");
    const choices = scope.querySelectorAll("[data-billing-choice]");
    const newForm = scope.querySelector("[data-billing-new]");
    const street = scope.querySelector("[data-billing-street]");
    const city = scope.querySelector("[data-billing-city]");
    const pin = scope.querySelector("[data-billing-pin]");
    if (!choices.length || !newForm) return;

    function sync() {
      const selected = scope.querySelector("[data-billing-choice]:checked");
      const isNew = selected?.value === "new";
      newForm.hidden = !isNew;
      cards.forEach((card) => {
        const input = card.querySelector("[data-billing-choice]");
        card.classList.toggle("is-selected", !!input?.checked);
      });
      if (street) {
        street.required = isNew;
        if (!isNew) street.value = "";
      }
      if (city) {
        city.required = isNew;
        if (!isNew) city.value = "";
      }
      if (pin) {
        pin.required = isNew;
        if (!isNew) pin.value = "";
      }
    }

    choices.forEach((input) => input.addEventListener("change", sync));
    sync();
  }

  function renderInlineConfirmation(details, payment) {
    const summary = document.querySelector("[data-inline-confirm-summary]");
    if (summary) {
      summary.hidden = false;
      summary.classList.add("checkout-kv");
      summary.innerHTML = `
        <div class="checkout-kv__row"><dt>Method</dt><dd>${escapeHtml(payment.method || "Online")}</dd></div>
        <div class="checkout-kv__row"><dt>Amount</dt><dd>${escapeHtml(formatPrice(payment.amount))}</dd></div>
        <div class="checkout-kv__row"><dt>Ref</dt><dd>${escapeHtml(payment.reference || "Pending")}</dd></div>
        <div class="checkout-kv__row"><dt>Name</dt><dd>${escapeHtml(details.name)}</dd></div>
        <div class="checkout-kv__row"><dt>Phone</dt><dd>${escapeHtml(details.phone)}</dd></div>
      `;
    }

    const refEl = document.querySelector("[data-confirm-ref]");
    const slotEl = document.querySelector("[data-confirm-slot]");
    if (refEl) refEl.textContent = payment.reference || "Pending";
    if (slotEl) {
      const day = details.sampleDayLabel || formatSampleDayLabel(details.sampleDay) || "—";
      const windowLabel = details.sampleWindow || "—";
      slotEl.textContent = `${day} · ${windowLabel}`;
    }

    activateDeckCard("confirmation");
  }

  function readCheckoutDetails() {
    try {
      return JSON.parse(sessionStorage.getItem(CHECKOUT_STORAGE_KEY) || "") || null;
    } catch {
      return null;
    }
  }

  function readDraft() {
    try {
      return JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || "null");
    } catch {
      return null;
    }
  }

  function collectDraft(form) {
    const dayInput = form.querySelector("input[name='sampleDay']:checked");
    return {
      name: form.querySelector("#book-name")?.value || "",
      gender: form.querySelector("input[name='gender']:checked")?.value || "",
      age: form.querySelector("#book-age")?.value || "",
      phone: form.querySelector("#book-phone")?.value || "",
      city: form.querySelector("#book-city")?.value || "",
      address: form.querySelector("#book-address")?.value || "",
      sampleDay: dayInput?.value || "Today",
      sampleWindow: form.querySelector("input[name='sampleWindow']:checked")?.value || "Morning",
    };
  }

  function saveDraft(form) {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(collectDraft(form)));
    } catch {
      /* ignore quota */
    }
  }

  function restoreDraft(form) {
    const draft = readDraft();
    if (!draft || typeof draft !== "object") return;

    const name = form.querySelector("#book-name");
    const age = form.querySelector("#book-age");
    const phone = form.querySelector("#book-phone");
    const city = form.querySelector("#book-city");
    const address = form.querySelector("#book-address");
    if (name && draft.name) name.value = draft.name;
    if (age && draft.age !== undefined && draft.age !== null) age.value = draft.age;
    if (phone && draft.phone) phone.value = String(draft.phone).replace(/\D/g, "").slice(0, 10);
    if (city && draft.city) city.value = draft.city;
    if (address && draft.address) address.value = draft.address;

    if (draft.gender) {
      const gender = form.querySelector(`input[name='gender'][value="${draft.gender}"]`);
      if (gender) gender.checked = true;
    }

    const todayRadio = form.querySelector("#book-day-today");
    const tomorrowRadio = form.querySelector("#book-day-tomorrow");
    const customRadio = form.querySelector("[data-custom-day]");
    const dayValue = draft.sampleDay || "Today";
    if (dayValue === "Today" && todayRadio) {
      todayRadio.checked = true;
      if (customRadio) {
        customRadio.checked = false;
        customRadio.value = "";
      }
    } else if (dayValue === "Tomorrow" && tomorrowRadio) {
      tomorrowRadio.checked = true;
      if (customRadio) {
        customRadio.checked = false;
        customRadio.value = "";
      }
    } else if (customRadio && /^\d{4}-\d{2}-\d{2}$/.test(dayValue)) {
      customRadio.value = dayValue;
      customRadio.checked = true;
      if (todayRadio) todayRadio.checked = false;
      if (tomorrowRadio) tomorrowRadio.checked = false;
      const chip = form.querySelector("[data-date-chip]");
      const chipLabel = form.querySelector("[data-date-chip-label]");
      if (chipLabel) chipLabel.textContent = formatSampleDayLabel(dayValue);
      if (chip) {
        chip.hidden = false;
        chip.classList.add("is-visible");
      }
    }

    if (draft.sampleWindow) {
      const windowInput = form.querySelector(
        `input[name='sampleWindow'][value="${draft.sampleWindow}"]`
      );
      if (windowInput && !windowInput.disabled) windowInput.checked = true;
    }
  }

  function boot() {
    const form = document.querySelector("[data-checkout-form]");
    if (!form) return;

    initCollectionCalendar(form);
    restoreDraft(form);
    initPaymentFlow();
    syncSampleWindows(form);
    updateWhenConfirm(form);
    window.setInterval(() => syncSampleWindows(form), 60 * 1000);

    form.querySelectorAll("input[name='sampleWindow']").forEach((input) => {
      input.addEventListener("change", () => {
        updateWhenConfirm(form);
        saveDraft(form);
      });
    });
    form.querySelectorAll("input[name='sampleDay']").forEach((input) => {
      input.addEventListener("change", () => {
        updateWhenConfirm(form);
        saveDraft(form);
      });
    });

    const phoneInput = form.querySelector("#book-phone");
    const otpInput = form.querySelector("#book-otp");
    const statusEl = form.querySelector("[data-checkout-status]");
    const successEl = form.querySelector("[data-auth-success]");
    const sendBtn = form.querySelector("[data-otp-send]");
    const verifyBtn = form.querySelector("[data-otp-verify]");

    const existing = readVerified();
    if (existing && phoneInput) {
      phoneInput.value = existing.phone;
      setPhoneVerifiedUi(form, true);
    } else {
      setPhoneVerifiedUi(form, false, false);
    }

    prefillFromGoogle(form, window.DRSWIFT_USER);
    window.addEventListener("drswift:auth-changed", (event) => {
      prefillFromGoogle(form, event.detail?.user);
      saveDraft(form);
    });

    const persistEvents = ["input", "change"];
    persistEvents.forEach((evt) => {
      form.addEventListener(evt, () => saveDraft(form));
    });

    phoneInput?.addEventListener("input", () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
      const verified = readVerified();
      if (verified && normalizedPhone(phoneInput.value) !== String(verified.phone)) {
        clearVerified();
        setPhoneVerifiedUi(form, false, false);
      } else if (verified && normalizedPhone(phoneInput.value) === String(verified.phone)) {
        setPhoneVerifiedUi(form, true);
      } else if (!verified) {
        setPhoneVerifiedUi(form, false, false);
      }
      syncOtpSendEnabled(form);
      saveDraft(form);
    });

    syncOtpSendEnabled(form);
    saveDraft(form);

    sendBtn?.addEventListener("click", () => {
      setStatus(statusEl, "", false);
      const digits = normalizedPhone(phoneInput?.value);
      if (digits.length !== 10) {
        setStatus(statusEl, "Enter a valid 10-digit mobile number before sending OTP.", true);
        phoneInput?.focus();
        return;
      }
      if (phoneInput) phoneInput.value = digits;
      // Local demo only — no backend OTP API call.
      setPhoneVerifiedUi(form, false, true);
      setStatus(statusEl, `Enter OTP ${LOCAL_DEMO_OTP} to verify.`, false);
      if (otpInput) {
        otpInput.value = "";
        otpInput.focus();
      }
      syncOtpSendEnabled(form);
    });

    verifyBtn?.addEventListener("click", () => {
      setStatus(statusEl, "", false);
      const digits = normalizedPhone(phoneInput?.value);
      if (digits.length !== 10) {
        setStatus(statusEl, "Enter a valid 10-digit mobile number.", true);
        phoneInput?.focus();
        return;
      }
      const code = String(otpInput?.value || "").replace(/\D/g, "");
      if (code !== LOCAL_DEMO_OTP) {
        setStatus(statusEl, `Invalid OTP. Enter ${LOCAL_DEMO_OTP}.`, true);
        otpInput?.focus();
        return;
      }
      if (phoneInput) phoneInput.value = digits;
      writeVerified(digits);
      setPhoneVerifiedUi(form, true);
      setStatus(statusEl, "", false);
      saveDraft(form);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setStatus(statusEl, "", false);
      if (successEl) successEl.hidden = true;

      const verified = readVerified();
      if (!verified) {
        setStatus(statusEl, "Verify your phone number to continue to payment.", true);
        phoneInput?.focus();
        return;
      }

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const submitBtn = form.querySelector("[type='submit']");
      if (submitBtn) submitBtn.disabled = true;

      const name = form.querySelector("#book-name")?.value || "";
      const names = splitName(name);
      const payload = {
        name,
        ...names,
        gender: form.querySelector("input[name='gender']:checked")?.value
          || form.querySelector("#book-gender")?.value
          || "",
        age: form.querySelector("#book-age")?.value || "",
        phone: verified.phone,
        firebaseUid: window.DRSWIFT_USER?.uid || null,
        sampleDay: form.querySelector("input[name='sampleDay']:checked")?.value || "",
        sampleDayLabel: formatSampleDayLabel(
          form.querySelector("input[name='sampleDay']:checked")?.value || ""
        ),
        sampleWindow: form.querySelector("input[name='sampleWindow']:checked")?.value || "",
        city: form.querySelector("#book-city")?.value || "",
        address: form.querySelector("#book-address")?.value || "",
        cart: cartLineItems(),
        lineItemsJson: cartLineItemsJson(),
        createdAt: new Date().toISOString(),
      };

      const cityInput = form.querySelector("#book-city");
      if (cityInput && !isValidCityVillage(cityInput.value)) {
        setStatus(
          statusEl,
          "City/Town/Village must start with a letter, include at least 3 letters, and be under 100 characters.",
          true
        );
        cityInput.focus();
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      try {
        sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(payload));
        renderInlinePayment(payload);
        if (submitBtn) submitBtn.disabled = false;
      } catch (err) {
        setStatus(statusEl, err.message || "Could not continue. Please try again.", true);
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    document.querySelectorAll("[data-checkout-back]").forEach((button) => {
      button.addEventListener("click", () => {
        activateDeckCard(button.getAttribute("data-checkout-back") || "details");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
