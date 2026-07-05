document.querySelectorAll("[data-auth-form]").forEach((form) => {
  const fields = Array.from(form.querySelectorAll("input, select, textarea"));

  const labelTextFor = (field) => {
    const id = field.id ? `label[for="${field.id}"]` : "";
    const label = id ? form.querySelector(id) : field.closest("label");
    return label?.textContent?.replace(/\s+/g, " ").trim().replace(/\s*\(.*?\)\s*/g, "") || "This field";
  };

  const messageFor = (field) => {
    if (field.validity.valueMissing) {
      if (field.type === "checkbox") return "Please confirm this before continuing.";
      return `${labelTextFor(field)} is required.`;
    }
    if (field.validity.typeMismatch) return `Enter a valid ${labelTextFor(field).toLowerCase()}.`;
    if (field.validity.tooShort) return `${labelTextFor(field)} must be at least ${field.minLength} characters.`;
    return "Check this field and try again.";
  };

  const clearError = (field) => {
    const wrapper = field.closest(".form-field") || field.closest(".form-check");
    wrapper?.classList.remove("is-error");
    field.removeAttribute("aria-invalid");
    const errorId = field.getAttribute("aria-describedby");
    if (errorId?.endsWith("-error")) {
      document.getElementById(errorId)?.remove();
      field.removeAttribute("aria-describedby");
    }
  };

  const showError = (field) => {
    const wrapper = field.closest(".form-field") || field.closest(".form-check");
    const baseId = field.id || field.name || `field-${fields.indexOf(field)}`;
    const errorId = `${baseId}-error`;
    let error = document.getElementById(errorId);
    if (!error) {
      error = document.createElement("p");
      error.className = "form-error";
      error.id = errorId;
      wrapper?.after(error);
    }
    error.textContent = messageFor(field);
    wrapper?.classList.add("is-error");
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", errorId);
  };

  fields.forEach((field) => {
    field.addEventListener("input", () => clearError(field));
    field.addEventListener("change", () => clearError(field));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let firstInvalid = null;

    fields.forEach((field) => {
      clearError(field);
      if (!field.checkValidity()) {
        firstInvalid ||= field;
        showError(field);
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const success = form.querySelector("[data-auth-success]");
    if (success) {
      success.hidden = false;
      form.querySelectorAll("input:not([type='checkbox']), select, textarea, button[type='submit']").forEach((el) => {
        if (el.tagName === "BUTTON") {
          el.disabled = true;
        } else {
          el.readOnly = true;
        }
      });
    }
  });
});
