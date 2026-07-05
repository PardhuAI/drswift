document.querySelectorAll("[data-auth-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
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
