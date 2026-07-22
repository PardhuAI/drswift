/**
 * Google Sign-In via Firebase Auth.
 * Sign-in UI lives only on the login form ([data-google-auth="signin"]).
 * The site header never shows a Google control — menu bar stays Cart + My Account.
 * Uses popup only (redirect breaks under storage partitioning on custom domains).
 */
(function () {
  let currentUser = null;

  function isIgnorableAuthError(err) {
    const code = err?.code || "";
    const message = String(err?.message || "");
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return true;
    if (code === "auth/missing-initial-state") return true;
    if (/missing initial state/i.test(message)) return true;
    return false;
  }

  function removeNavGoogleControls() {
    document.querySelectorAll(".nav-google-wrap").forEach((wrap) => wrap.remove());
  }

  function showAuthError(message) {
    console.error("[drswift-auth]", message);
    let toast = document.getElementById("drswift-auth-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "drswift-auth-toast";
      toast.className = "nav-google-toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.setTimeout(() => toast.classList.remove("is-visible"), 4200);
  }

  async function signInWithGoogle(auth, provider, triggerEl) {
    if (triggerEl) triggerEl.disabled = true;
    try {
      await auth.signInWithPopup(provider);
      // After login-page Google sign-in, open account
      if (triggerEl?.hasAttribute("data-google-auth-primary") || document.querySelector("[data-login-card]")) {
        window.location.href = "account.html";
      }
    } catch (err) {
      if (isIgnorableAuthError(err)) {
        // User dismissed — no toast.
      } else if (err?.code === "auth/popup-blocked") {
        showAuthError("Allow popups for drswift.in, then try Google sign-in again.");
      } else if (err?.code === "auth/unauthorized-domain") {
        showAuthError("This domain is not authorized in Firebase Auth.");
      } else {
        showAuthError(err?.message || "Google sign-in failed.");
      }
    } finally {
      if (triggerEl) triggerEl.disabled = false;
    }
  }

  async function boot() {
    // Strip any leftover header Google control (older script versions).
    removeNavGoogleControls();

    if (typeof firebase === "undefined" || !firebase.auth) {
      console.warn("[drswift-auth] Firebase Auth unavailable.");
      return;
    }

    const config = window.DRSWIFT_FIREBASE_CONFIG;
    if (!config?.apiKey) {
      console.warn("[drswift-auth] Firebase is not configured.");
      return;
    }

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }
    } catch (err) {
      console.error(err);
      return;
    }

    const auth = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      await auth.getRedirectResult();
    } catch (err) {
      if (!isIgnorableAuthError(err)) {
        console.warn("[drswift-auth] getRedirectResult:", err);
      }
    }

    auth.onAuthStateChanged((user) => {
      currentUser = user || null;
      window.DRSWIFT_USER = currentUser;
      window.dispatchEvent(new CustomEvent("drswift:auth-changed", { detail: { user } }));
    });

    document.addEventListener("click", async (event) => {
      const signOutBtn = event.target.closest("[data-google-auth='signout']");
      if (signOutBtn) {
        event.preventDefault();
        try {
          await auth.signOut();
        } catch (err) {
          showAuthError(err?.message || "Sign out failed.");
        }
        return;
      }

      const signInBtn = event.target.closest("[data-google-auth='signin']");
      if (signInBtn) {
        event.preventDefault();
        await signInWithGoogle(auth, provider, signInBtn);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
