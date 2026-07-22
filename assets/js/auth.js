/**
 * Shared auth-form validation (email/password + HTML5 constraints).
 * Exposes window.DrSwiftFormValidation for phone/OTP and other buttons.
 */
(function () {
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
    });
  });
})();
