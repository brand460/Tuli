import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "/utils/supabase/info";

// Re-export so andere Module (z. B. notes-sync) diese Werte über einen
// auflösbaren relativen Pfad importieren können, statt über den absoluten
// "/utils/..."-Pfad (den der TS-Language-Service ohne tsconfig nicht auflöst).
export { projectId, publicAnonKey };

const supabaseUrl = `https://${projectId}.supabase.co`;

// Singleton: prevent duplicate GoTrueClient instances during HMR.
const GLOBAL_KEY = "__tuli_supabase_client_v1__" as const;
export const supabase: ReturnType<typeof createClient> =
  (globalThis as any)[GLOBAL_KEY] ??
  ((globalThis as any)[GLOBAL_KEY] = createClient(supabaseUrl, publicAnonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: false, // OAuthCallbackHandler übernimmt als einziger den exchangeCodeForSession-Aufruf
      autoRefreshToken: true,
      flowType: 'pkce',
      storage: {
        getItem: (key) => localStorage.getItem(key),
        setItem: (key, value) => localStorage.setItem(key, value),
        removeItem: (key) => localStorage.removeItem(key),
      },
      storageKey: 'tuli-supabase-auth',
      // Bypass the Navigator Locks API to prevent the
      // "lock was not released within 5000ms" warning caused by HMR
      // reloads or stale service-worker contexts holding the lock.
      // Concurrent auth operations within a single tab are still
      // serialised by the GoTrueClient's in-memory processLock.
      lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => fn(),
    },
  }));

export const API_BASE = `${supabaseUrl}/functions/v1/make-server-2a26506b`;

// ── Device-Credential Store + Silent Re-Login ──────────────────────
// Zweck: Jannis & Sandy sollen NIE wieder manuell neu einloggen müssen.
// Die Login-Logik bleibt komplett erhalten — sie wird nur automatisch im
// Hintergrund erneut ausgeführt, wenn die Supabase-Session verloren geht
// (abgelaufener/rotierter Refresh-Token oder iOS-PWA löscht nach ~7 Tagen
// den gesamten Storage). Dadurch behalten beide ihre echten Accounts,
// Rollen und den Haushalt inkl. gültigem JWT für RLS-Datenzugriffe.
//
// SICHERHEIT: Die Zugangsdaten werden nur leicht verschleiert (Base64) im
// localStorage des jeweiligen privaten Geräts gespeichert. Das ist KEINE
// echte Verschlüsselung (clientseitig ohne serverseitigen Schlüssel nicht
// möglich), sondern ein bewusster, vom Nutzer freigegebener Kompromiss für
// diese private 2-Personen-Haushalts-App. Wird bei explizitem Logout gelöscht.
const DEVICE_CREDS_KEY = "tuli-device-creds-v1";

export function saveDeviceCredentials(email: string, password: string): void {
  try {
    const encoded = btoa(
      unescape(encodeURIComponent(JSON.stringify({ email, password }))),
    );
    localStorage.setItem(DEVICE_CREDS_KEY, encoded);
  } catch (err) {
    console.log("[deviceCreds] save error:", err);
  }
}

export function readDeviceCredentials(): { email: string; password: string } | null {
  try {
    const raw = localStorage.getItem(DEVICE_CREDS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(decodeURIComponent(escape(atob(raw))));
    if (parsed?.email && parsed?.password) {
      return { email: parsed.email, password: parsed.password };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearDeviceCredentials(): void {
  try {
    localStorage.removeItem(DEVICE_CREDS_KEY);
  } catch {
    /* ignore */
  }
}

// Single in-flight guard so multiple concurrent triggers (initial load,
// SIGNED_OUT event, visibility-resume) never fire two parallel logins.
let _reloginPromise: Promise<boolean> | null = null;

// Attempts to silently restore the session from the saved device credentials.
// Returns true if a session was (re-)established. On success Supabase fires a
// SIGNED_IN event, which the AuthProvider handles to load profile + household.
export function attemptSilentRelogin(): Promise<boolean> {
  if (_reloginPromise) return _reloginPromise;
  _reloginPromise = (async () => {
    const creds = readDeviceCredentials();
    if (!creds) return false;
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: creds.email,
        password: creds.password,
      });
      if (error) {
        console.log("[silentRelogin] fehlgeschlagen:", error.message);
        // Nur bei WIRKLICH ungültigen Zugangsdaten (z. B. Passwort geändert)
        // verwerfen — sonst (Netzwerk/transient) behalten und später erneut versuchen.
        if (/invalid login credentials/i.test(error.message)) {
          clearDeviceCredentials();
        }
        return false;
      }
      console.log("[silentRelogin] Session erfolgreich wiederhergestellt");
      return true;
    } catch (err) {
      console.log("[silentRelogin] Fehler:", err);
      return false;
    } finally {
      _reloginPromise = null;
    }
  })();
  return _reloginPromise;
}

// ── Single in-flight refresh guard ─────────────────────────────────
// Shared by getFreshToken() AND the 401-retry path so that concurrent calls
// never trigger two simultaneous refreshSession() calls (which would
// invalidate the refresh token on the second call).
let _refreshPromise: Promise<string | null> | null = null;

function doRefresh(): Promise<string | null> {
  if (!_refreshPromise) {
    _refreshPromise = supabase.auth
      .refreshSession()
      .then(({ data }) => data.session?.access_token ?? null)
      .catch(() => null)
      .finally(() => { _refreshPromise = null; });
  }
  return _refreshPromise;
}

async function getFreshToken(): Promise<string> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return publicAnonKey;
    }

    // Token still valid for more than 60 seconds — use as-is, no refresh needed
    const nowSec = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at ?? 0;
    if (expiresAt - nowSec > 60) {
      return session.access_token;
    }

    // Token expiring within 60 s or already expired — refresh exactly once
    const newToken = await doRefresh();
    return newToken ?? publicAnonKey;
  } catch (err) {
    console.log("[getFreshToken] Error:", err);
    return publicAnonKey;
  }
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 1500;

  let token = await getFreshToken();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });
    } catch (networkErr) {
      if (attempt < MAX_RETRIES) {
        console.log(`[apiFetch] Netzwerkfehler bei ${path} (Versuch ${attempt}/${MAX_RETRIES}), retry in ${RETRY_DELAY}ms...`);
        await new Promise((r) => setTimeout(r, RETRY_DELAY * attempt));
        continue;
      }
      throw new Error(`Netzwerkfehler bei ${options.method || "GET"} ${path}: ${networkErr}`);
    }

    // On 401: force a session refresh, then fall back to publicAnonKey
    if (res.status === 401 && attempt <= 2) {
      if (attempt === 1) {
        console.log(`[apiFetch] 401 bei ${path} — erzwinge Token-Refresh und retry...`);
        // Use the shared doRefresh() guard — prevents a second concurrent refresh
        // if getFreshToken() already kicked one off simultaneously.
        const newToken = await doRefresh();
        token = newToken ?? publicAnonKey;
      } else {
        // Attempt 2 still 401 — session is truly broken, fall back to anon key
        console.log(`[apiFetch] 401 bei ${path} auch nach Refresh — Fallback auf publicAnonKey`);
        token = publicAnonKey;
      }
      continue;
    }

    // Retry on 5xx or 0 status (server error / edge function cold start)
    if (res.status >= 500 && attempt < MAX_RETRIES) {
      console.log(`[apiFetch] Server-Fehler ${res.status} bei ${path} (Versuch ${attempt}/${MAX_RETRIES}), retry...`);
      await new Promise((r) => setTimeout(r, RETRY_DELAY * attempt));
      continue;
    }

    let body: any;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        body = await res.json();
      } catch (parseErr) {
        throw new Error(`JSON-Parse-Fehler (Status ${res.status}) bei ${path}: ${parseErr}`);
      }
    } else {
      const text = await res.text();
      if (!res.ok) {
        throw new Error(`Server-Fehler ${res.status} bei ${path}: ${text}`);
      }
      try {
        body = JSON.parse(text);
      } catch {
        throw new Error(`Unerwartete Antwort (Status ${res.status}) bei ${path}: ${text.substring(0, 200)}`);
      }
    }

    if (!res.ok) {
      const msg = body?.error || body?.message || body?.msg || JSON.stringify(body);
      throw new Error(`Fehler ${res.status} bei ${path}: ${msg}`);
    }
    return body;
  }

  throw new Error(`apiFetch: max retries exhausted for ${path}`);
}