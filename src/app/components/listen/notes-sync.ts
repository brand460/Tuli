/**
 * notes-sync.ts — Zeilenbasierter Datenzugriff für die Notizseiten.
 *
 * Ersetzt die alten Blob-Endpunkte (/custom-pages + /custom-blocks) durch
 * direkte Supabase-Client-Calls mit RLS und echte Realtime-Subscriptions.
 * Jede Seite ist eine eigene Zeile mit eigenem `content` → eine Aktion auf
 * Seite A überschreibt nie mehr den Inhalt von Seite B.
 *
 * Content-Speichern ist PRO SEITE serialisiert: Während ein Save läuft, wird
 * eine neue Änderung nur als "dirty" gemerkt und danach GENAU EINMAL mit dem
 * aktuellsten Stand nachgespeichert (nie zwei parallele Requests für dieselbe
 * Seite).
 */
import { supabase, projectId, publicAnonKey } from "../supabase-client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface NotePage {
  id: string;
  title: string;
  icon: string;
  parent_id: string | null;
  position: number;
}

type NoteRow = {
  id: string;
  household_id: string;
  title: string;
  icon: string;
  parent_id: string | null;
  position: number | string;
  content: string;
};

function rowToPage(r: NoteRow): NotePage {
  return {
    id: r.id,
    title: r.title ?? "",
    icon: r.icon ?? "📄",
    parent_id: r.parent_id ?? null,
    position: Number(r.position) || 0,
  };
}

// ── Laden ───────────────────────────────────────────────────────────────────
export interface NotesSnapshot {
  pages: NotePage[];
  contents: Record<string, string>;
}

export async function fetchNotes(householdId: string): Promise<NotesSnapshot> {
  const { data, error } = await supabase
    .from("notes_pages")
    .select("*")
    .eq("household_id", householdId);
  if (error) throw new Error(error.message);
  const rows = data as NoteRow[];
  const pages = rows.map(rowToPage);
  const contents: Record<string, string> = {};
  for (const r of rows) contents[r.id] = r.content ?? "<p><br></p>";
  return { pages, contents };
}

/** Nur die Seiten-Metadaten (ohne Inhalt) — z. B. für die Seiten-Verknüpfung
 *  im Kalender. Spart das Übertragen der (potenziell großen) content-Spalte. */
export async function fetchNotePagesMeta(householdId: string): Promise<NotePage[]> {
  const { data, error } = await supabase
    .from("notes_pages")
    .select("id, title, icon, parent_id, position")
    .eq("household_id", householdId);
  if (error) throw new Error(error.message);
  return (data as NoteRow[]).map(rowToPage);
}

/** Aktuellen Inhalt EINER Seite laden — für das Nachladen beim Verlassen des
 *  Editors (Blur), damit der Sync „aufholt", nachdem man die Seite fokussiert
 *  hatte und Remote-Updates währenddessen bewusst nicht übernommen wurden. */
export async function fetchPageContent(pageId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("notes_pages")
    .select("content")
    .eq("id", pageId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as { content: string } | null)?.content ?? null;
}

// ── Metadaten (Titel/Icon/Reihenfolge/Parent) einer Seite ───────────────────
export async function upsertPageMeta(
  householdId: string,
  page: NotePage,
  content?: string,
): Promise<void> {
  const row: Record<string, unknown> = {
    id: page.id,
    household_id: householdId,
    title: page.title,
    icon: page.icon,
    parent_id: page.parent_id,
    position: Number(page.position) || 0,
  };
  if (content !== undefined) row.content = content;
  const { error } = await supabase
    .from("notes_pages")
    .upsert(row, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

/** Reihenfolge/Struktur mehrerer Seiten gemeinsam speichern (selten, klein). */
export async function upsertPagesMeta(
  householdId: string,
  pages: NotePage[],
): Promise<void> {
  if (pages.length === 0) return;
  const rows = pages.map((p) => ({
    id: p.id,
    household_id: householdId,
    title: p.title,
    icon: p.icon,
    parent_id: p.parent_id,
    position: Number(p.position) || 0,
  }));
  const { error } = await supabase
    .from("notes_pages")
    .upsert(rows, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export async function deletePage(id: string): Promise<void> {
  const { error } = await supabase.from("notes_pages").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deletePages(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase.from("notes_pages").delete().in("id", ids);
  if (error) throw new Error(error.message);
}

// ── Content pro Seite: serialisiertes Speichern mit "dirty"-Nachzug ─────────
// Pro Seite läuft immer nur EIN Schreibvorgang gleichzeitig. Kommt während des
// Speicherns eine neue Änderung rein, wird sie nur gemerkt (coalesced) und
// danach genau einmal mit dem aktuellsten Stand nachgespeichert. Fehler werden
// mit Backoff wiederholt. savePageContent liefert ein Promise, das erst
// auflöst, wenn der (finale) Content durablen auf dem Server steht — dadurch
// kann der Aufrufer sein lokales Backup erst nach bestätigtem Save löschen.
const pageChains = new Map<string, Promise<void>>();
const latestPageContent = new Map<string, string>();

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runWithRetry(op: () => Promise<void>): Promise<void> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      await op();
      return;
    } catch (err) {
      lastErr = err;
      await sleep(Math.min(15000, 700 * Math.pow(1.6, attempt)));
    }
  }
  throw lastErr;
}

export function savePageContent(
  householdId: string,
  pageId: string,
  content: string,
): Promise<void> {
  latestPageContent.set(pageId, content);
  const prev = pageChains.get(pageId) ?? Promise.resolve();
  const next = prev.catch(() => {}).then(async () => {
    const c = latestPageContent.get(pageId);
    if (c === undefined) return;
    latestPageContent.delete(pageId);
    await runWithRetry(async () => {
      const { error } = await supabase
        .from("notes_pages")
        .update({ content: c })
        .eq("id", pageId);
      if (error) throw new Error(error.message);
    });
  });
  pageChains.set(pageId, next);
  next.finally(() => {
    if (pageChains.get(pageId) === next) pageChains.delete(pageId);
  });
  return next;
}

/** Läuft für DIESE Seite gerade noch ein ungespeicherter Content-Save? */
export function hasPendingContentWrite(pageId: string): boolean {
  return pageChains.has(pageId);
}

/** Läuft für IRGENDEINE Seite gerade noch ein ungespeicherter Content-Save? */
export function hasPendingContentWrites(): boolean {
  return pageChains.size > 0;
}

// ── Keepalive-Notfall-Save für das tatsächliche App-Schließen (pagehide) ────
// Beim echten Teardown (Tab/PWA schließen) wird der JS-Kontext verworfen, bevor
// ein normaler supabase-js-Request fertig ist — und supabase-js unterstützt
// `keepalive` auf seinen internen fetch-Calls nicht. Daher hier ein direkter
// fetch() mit keepalive:true gegen den PostgREST-Endpunkt notes_pages, mit dem
// aktuellen Access-Token als Bearer (RLS greift also weiterhin: es lässt sich
// nur der eigene Haushalt ändern). Best-effort — das localStorage-Backup bleibt
// als eigentliches Sicherheitsnetz bestehen.

// Access-Token synchron aus dem localStorage lesen (kein await beim pagehide
// möglich). Schlüssel = storageKey des Supabase-Clients ('tuli-supabase-auth').
function readAccessTokenSync(): string | null {
  try {
    const raw = localStorage.getItem("tuli-supabase-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return (
      parsed?.access_token ??
      parsed?.currentSession?.access_token ??
      parsed?.session?.access_token ??
      null
    );
  } catch {
    return null;
  }
}

/**
 * Persistiert die übergebenen Seiten-Inhalte per keepalive-fetch, sodass sie das
 * Schließen der App überleben. Nur für den pagehide-Fall gedacht.
 * `contents`: Map pageId -> HTML (nur die tatsächlich geänderten Seiten).
 */
export function flushContentsKeepalive(contents: Record<string, string>): void {
  const token = readAccessTokenSync();
  // Ohne gültiges User-Token würde RLS den Update verwerfen — dann lieber gar
  // nicht senden und auf das localStorage-Backup + Retry beim nächsten Start
  // vertrauen.
  if (!token) return;
  const baseUrl = `https://${projectId}.supabase.co/rest/v1/notes_pages`;
  for (const [pageId, content] of Object.entries(contents)) {
    try {
      void fetch(`${baseUrl}?id=eq.${encodeURIComponent(pageId)}`, {
        method: "PATCH",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          apikey: publicAnonKey,
          Authorization: `Bearer ${token}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ content }),
      }).catch(() => {
        /* best-effort — Backup greift beim nächsten Start */
      });
    } catch {
      /* ignore */
    }
  }
}

// ── Realtime: postgres_changes ──────────────────────────────────────────────
export function subscribeNotes(
  householdId: string,
  handlers: {
    onUpsert: (page: NotePage, content: string) => void;
    onDelete: (id: string) => void;
  },
): RealtimeChannel {
  const filter = `household_id=eq.${householdId}`;
  const channel = supabase
    .channel(`notes_pages:${householdId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notes_pages", filter },
      (p) => {
        const r = p.new as NoteRow;
        handlers.onUpsert(rowToPage(r), r.content ?? "<p><br></p>");
      },
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "notes_pages", filter },
      (p) => {
        const r = p.new as NoteRow;
        handlers.onUpsert(rowToPage(r), r.content ?? "<p><br></p>");
      },
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "notes_pages", filter },
      (p) => handlers.onDelete((p.old as { id: string }).id),
    )
    .subscribe();
  return channel;
}
