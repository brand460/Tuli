/**
 * OneSignal Web Push SDK Integration
 *
 * Uses the OneSignal Web SDK v16 loaded via CDN.
 * - init: loads script + initializes with app ID
 * - setupPushForUser: sets external user ID, prompts for permission, returns subscription ID
 * - logout: clears external user ID mapping
 */

const ONESIGNAL_APP_ID = "a72cfa96-92c3-472b-8fa2-6b61bec1d724";

declare global {
  interface Window {
    OneSignalDeferred?: Array<(os: any) => void | Promise<void>>;
    OneSignal?: any;
  }
}

// ── SDK loader ─────────────────────────────────────────────────────

let _initPromise: Promise<any> | null = null;

function ensureScript(): void {
  if (document.querySelector('script[src*="OneSignalSDK"]')) return;
  const s = document.createElement("script");
  s.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
  s.defer = true;
  document.head.appendChild(s);
}

/**
 * Loads the OneSignal SDK and initializes it. Returns the OneSignal instance.
 * Safe to call multiple times — subsequent calls return the same promise.
 */
export function initOneSignal(): Promise<any> {
  if (_initPromise) return _initPromise;

  ensureScript();

  _initPromise = new Promise<any>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("OneSignal SDK load timeout")), 15000);

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      try {
        clearTimeout(timeout);
        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
          // Don't auto-prompt — we prompt explicitly after login
          autoPrompt: false,
        });
        console.log("[OneSignal] SDK initialized");
        resolve(OneSignal);
      } catch (err) {
        clearTimeout(timeout);
        console.log("[OneSignal] Init error:", err);
        reject(err);
      }
    });
  });

  return _initPromise;
}

// ── User setup ─────────────────────────────────────────────────────

/**
 * After the user logs in:
 * 1. Sets the OneSignal external user ID to the Supabase user ID
 * 2. Prompts for push notification permission
 * 3. Returns the OneSignal subscription (player) ID, or null if denied/unavailable
 */
export async function setupPushForUser(userId: string): Promise<string | null> {
  try {
    const OS = await initOneSignal();

    // Set external user ID = Supabase user ID for server-side targeting
    await OS.login(userId);
    console.log("[OneSignal] External user ID set:", userId);

    // Check if already subscribed
    const existingSub = OS.User?.PushSubscription?.id;
    if (existingSub) {
      console.log("[OneSignal] Already subscribed, player ID:", existingSub);
      return existingSub;
    }

    // Prompt for push permission
    try {
      await OS.Slidedown.promptPush();
    } catch (promptErr) {
      // User might dismiss the prompt — not a fatal error
      console.log("[OneSignal] Push prompt dismissed or error:", promptErr);
    }

    // Wait for subscription to register (may take a moment after permission grant)
    return new Promise<string | null>((resolve) => {
      const checkTimeout = setTimeout(() => {
        // Final check
        const id = OS.User?.PushSubscription?.id || null;
        console.log("[OneSignal] Timeout check, player ID:", id);
        resolve(id);
      }, 5000);

      // Listen for subscription change
      try {
        OS.User.PushSubscription.addEventListener("change", (event: any) => {
          clearTimeout(checkTimeout);
          const newId = event?.current?.id || null;
          console.log("[OneSignal] Subscription changed, player ID:", newId);
          resolve(newId);
        });
      } catch {
        // Listener not available — rely on timeout
      }

      // Quick check in case it's already available
      setTimeout(() => {
        const id = OS.User?.PushSubscription?.id;
        if (id) {
          clearTimeout(checkTimeout);
          resolve(id);
        }
      }, 1500);
    });
  } catch (err) {
    console.log("[OneSignal] setupPushForUser error:", err);
    return null;
  }
}

/**
 * Returns the current subscription/player ID without prompting.
 */
export async function getPlayerId(): Promise<string | null> {
  try {
    const OS = await initOneSignal();
    return OS.User?.PushSubscription?.id || null;
  } catch {
    return null;
  }
}

/**
 * Logout: clears the external user ID mapping on OneSignal's side.
 */
export async function logoutOneSignal(): Promise<void> {
  try {
    if (window.OneSignal) {
      await window.OneSignal.logout();
      console.log("[OneSignal] Logged out");
    }
  } catch (err) {
    console.log("[OneSignal] Logout error:", err);
  }
}
