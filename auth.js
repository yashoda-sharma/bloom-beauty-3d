/* ============================================================
   Supabase setup
   ============================================================ */
const SUPABASE_URL = "https://vwhuutpercmptxhvqspa.supabase.co";
const SUPABASE_KEY = "sb_publishable_qB6suF5qitIcvgyMk-jhTQ_rXKmqQq_";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ============================================================
   Elements
   ============================================================ */
const authTrigger = document.getElementById("authTrigger");
const authOverlay = document.getElementById("authOverlay");
const authClose = document.getElementById("authClose");
const authForm = document.getElementById("authForm");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authMessage = document.getElementById("authMessage");
const authSubmit = document.getElementById("authSubmit");
const authModeLabel = document.getElementById("authModeLabel");
const authSwitchText = document.getElementById("authSwitchText");
const authSwitchBtn = document.getElementById("authSwitchBtn");

const authSignedOut = document.getElementById("authSignedOut");
const authSignedIn = document.getElementById("authSignedIn");
const authUserEmail = document.getElementById("authUserEmail");
const authSignOut = document.getElementById("authSignOut");

let mode = "signin"; // or "signup"

/* ============================================================
   Modal open/close
   ============================================================ */
function openAuth() {
  authOverlay.hidden = false;
  clearMessage();
}

function closeAuth() {
  authOverlay.hidden = true;
}

authTrigger.addEventListener("click", openAuth);
authClose.addEventListener("click", closeAuth);
authOverlay.addEventListener("click", (e) => {
  if (e.target === authOverlay) closeAuth();
});

/* ============================================================
   Sign in / Sign up toggle
   ============================================================ */
authSwitchBtn.addEventListener("click", () => {
  mode = mode === "signin" ? "signup" : "signin";
  updateModeUI();
  clearMessage();
});

function updateModeUI() {
  if (mode === "signin") {
    authModeLabel.textContent = "Sign in";
    authSubmit.textContent = "Sign in";
    authSwitchText.textContent = "Don't have an account?";
    authSwitchBtn.textContent = "Sign up";
    authPassword.setAttribute("autocomplete", "current-password");
  } else {
    authModeLabel.textContent = "Create account";
    authSubmit.textContent = "Sign up";
    authSwitchText.textContent = "Already have an account?";
    authSwitchBtn.textContent = "Sign in";
    authPassword.setAttribute("autocomplete", "new-password");
  }
}

function showMessage(text, isSuccess = false) {
  authMessage.textContent = text;
  authMessage.hidden = false;
  authMessage.classList.toggle("success", isSuccess);
}

function clearMessage() {
  authMessage.hidden = true;
  authMessage.textContent = "";
}

/* ============================================================
   Form submit — sign in or sign up depending on mode
   ============================================================ */
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessage();

  const email = authEmail.value.trim();
  const password = authPassword.value;

  authSubmit.disabled = true;
  authSubmit.textContent = mode === "signin" ? "Signing in..." : "Signing up...";

  try {
    if (mode === "signin") {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } else {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      if (data.session) {
        // Email confirmation is off — user is signed in immediately
      } else {
        showMessage(
          "Check your email to confirm your account, then sign in.",
          true
        );
        mode = "signin";
        updateModeUI();
      }
    }
  } catch (err) {
    showMessage(err.message || "Something went wrong. Try again.");
  } finally {
    authSubmit.disabled = false;
    updateModeUI();
  }
});

/* ============================================================
   Sign out
   ============================================================ */
authSignOut.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
});

/* ============================================================
   React to auth state (initial load + sign in/out)
   ============================================================ */
function renderSignedIn(user) {
  authSignedOut.hidden = true;
  authSignedIn.hidden = false;
  authUserEmail.textContent = user.email;
  authTrigger.textContent = "Account";
}

function renderSignedOut() {
  authSignedOut.hidden = false;
  authSignedIn.hidden = true;
  authForm.reset();
  clearMessage();
  authTrigger.textContent = "Sign in";
}

supabaseClient.auth.getSession().then(({ data }) => {
  if (data.session) {
    renderSignedIn(data.session.user);
  } else {
    renderSignedOut();
  }
});

supabaseClient.auth.onAuthStateChange((_event, session) => {
  if (session) {
    renderSignedIn(session.user);
    closeAuth();
  } else {
    renderSignedOut();
  }
});
