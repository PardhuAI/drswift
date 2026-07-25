/**
 * Open customer login as an 80% viewport overlay (keeps current login design).
 * Sign-in links open the overlay on the current page instead of navigating away.
 */
(function () {
  const LOGIN_PATHS = new Set(["/login", "/login.html", "login.html", "login"]);
  const MESSAGE_CLOSE = "drswift:login-close";

  function isLoginPage() {
    return document.body?.classList.contains("login-page");
  }

  function isEmbedMode() {
    const params = new URLSearchParams(location.search);
    return params.get("embed") === "1" || window.self !== window.top;
  }

  function loginHref(embed) {
    const base = location.pathname.endsWith(".html") || location.protocol === "file:"
      ? "login.html"
      : "/login";
    return embed ? `${base}?embed=1` : base;
  }

  function isLoginAnchor(anchor) {
    if (!anchor || !anchor.getAttribute) return false;
    const raw = (anchor.getAttribute("href") || "").trim();
    if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) {
      return false;
    }
    try {
      const url = new URL(raw, location.href);
      const path = url.pathname.replace(/\/+$/, "") || "/";
      const leaf = path.split("/").pop() || "";
      if (LOGIN_PATHS.has(path) || LOGIN_PATHS.has(leaf) || LOGIN_PATHS.has(raw)) {
        return true;
      }
      return /\/login(?:\.html)?$/i.test(path);
    } catch {
      return /login\.html(?:$|\?)/i.test(raw) || raw === "/login" || raw === "login";
    }
  }

  function ensureHostOverlay() {
    let root = document.querySelector("[data-site-login-overlay]");
    if (root) return root;

    root = document.createElement("div");
    root.className = "site-login-overlay";
    root.setAttribute("data-site-login-overlay", "");
    root.hidden = true;
    root.innerHTML = `
      <button type="button" class="site-login-overlay__scrim" data-site-login-close aria-label="Close sign in"></button>
      <div class="site-login-overlay__frame" role="dialog" aria-modal="true" aria-label="Sign in">
        <iframe title="Sign in to Dr.Swift" data-site-login-frame></iframe>
      </div>
    `;
    document.body.appendChild(root);

    root.querySelector("[data-site-login-close]")?.addEventListener("click", closeHostOverlay);
    root.addEventListener("click", (event) => {
      if (event.target === root) closeHostOverlay();
    });
    return root;
  }

  function openHostOverlay() {
    if (isLoginPage()) return;
    const root = ensureHostOverlay();
    const frame = root.querySelector("[data-site-login-frame]");
    if (frame && frame.getAttribute("src") !== loginHref(true)) {
      frame.setAttribute("src", loginHref(true));
    }
    root.hidden = false;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }

  function closeHostOverlay() {
    const root = document.querySelector("[data-site-login-overlay]");
    if (!root) return;
    root.hidden = true;
    const frame = root.querySelector("[data-site-login-frame]");
    if (frame) frame.removeAttribute("src");
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }

  function wireLoginPageOverlay() {
    if (!isLoginPage()) return;

    document.body.classList.add("auth-page--overlay");
    if (isEmbedMode()) {
      document.body.classList.add("auth-page--embed");
    }

    const dismiss = () => {
      if (window.self !== window.top) {
        window.parent.postMessage({ type: MESSAGE_CLOSE }, "*");
        return;
      }
      const ref = document.referrer;
      try {
        if (ref && new URL(ref).origin === location.origin && !/\/login(?:\.html)?$/i.test(ref)) {
          location.href = ref;
          return;
        }
      } catch {
        /* ignore */
      }
      location.href = location.pathname.endsWith(".html") ? "index.html" : "/";
    };

    document.querySelectorAll("[data-login-overlay-dismiss], .auth-split__close, .auth-split__back").forEach((el) => {
      el.addEventListener("click", (event) => {
        if (isEmbedMode() || el.hasAttribute("data-login-overlay-dismiss")) {
          event.preventDefault();
          dismiss();
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
      }
    });
  }

  function onDocumentClick(event) {
    if (isLoginPage()) return;
    const anchor = event.target.closest?.("a[href]");
    if (!isLoginAnchor(anchor)) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.target === "_blank") {
      return;
    }
    event.preventDefault();
    openHostOverlay();
  }

  function onMessage(event) {
    if (event?.data?.type === MESSAGE_CLOSE) {
      closeHostOverlay();
    }
  }

  function boot() {
    wireLoginPageOverlay();
    if (!isLoginPage()) {
      document.addEventListener("click", onDocumentClick, true);
      window.addEventListener("message", onMessage);
      if (location.hash === "#signin" || new URLSearchParams(location.search).get("signin") === "1") {
        openHostOverlay();
      }
    }
    window.DrSwiftLoginOverlay = {
      open: openHostOverlay,
      close: closeHostOverlay,
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
