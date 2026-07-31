/**
 * shopping-sync.ts — Granularer, zeilenbasierter Datenzugriff für die
 * Einkaufsliste und die Laden-Einstellungen.
 *
 * Ersetzt die alten Blob-Endpunkte (/shopping, /store-settings über die Edge
 * Function) durch DIREKTE Supabase-Client-Calls mit RLS (User-Token) plus
 * echte Realtime-Subscriptions (postgres_changes). Jede Änderung betrifft nur
 * EINE Zeile → zwei Geräte können gleichzeitig arbeiten, ohne sich gegenseitig
 * zu überschreiben.
 *
 * Schreibvorgänge sind PRO ZEILE serialisiert (enqueueRowWrite) und werden bei
 * Fehlern mit Backoff automatisch wiederholt (offline-tolerant).
 */
import { supabase } from "../supabase-client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { ShoppingItem } from "./shopping-data";

// ── Store-Einstellungen: Typ (früher inline in einkaufen-screen.tsx) ────────
export interface StoreInfoLike {
  id: string;
  name: string;
  color?: string;
  [key: string]: unknown;
}

export interface StoreSettingEntry {
  store_id: string;
  position: number;
  is_visible: boolean;
  category_order: string[];
  custom_store?: StoreInfoLike;
  item_frequency?: Record<string, number>;
}

// ── Row ↔ App-Typ Mapping ───────────────────────────────────────────────────
type ShoppingRow = {
  id: string;
  household_id: string;
  store: string;
  name: string;
  category: string | null;
  is_checked: boolean;
  quantity: number | string;
  unit: string | null;
  position: number | string;
  manually_positioned: boolean;
};

function rowToItem(r: ShoppingRow): ShoppingItem {
  return {
    id: r.id,
    household_id: r.household_id,
    store: r.store,
    name: r.name,
    category: r.category ?? "",
    is_checked: !!r.is_checked,
    quantity: Number(r.quantity) || 0,
    unit: r.unit ?? undefined,
    position: Number(r.position) || 0,
    manually_positioned: !!r.manually_positioned,
  };
}

function itemToRow(item: ShoppingItem, householdId: string): ShoppingRow {
  return {
    id: item.id,
    household_id: householdId,
    store: item.store,
    name: item.name,
    category: item.category ?? "",
    is_checked: !!item.is_checked,
    quantity: Number(item.quantity) || 0,
    unit: item.unit ?? null,
    position: Number(item.position) || 0,
    manually_positioned: !!item.manually_positioned,
  };
}

type StoreRow = {
  household_id: string;
  store_id: string;
  position: number | string;
  is_visible: boolean;
  category_order: string[] | null;
  custom_store: StoreInfoLike | null;
  item_frequency: Record<string, number> | null;
};

function rowToStoreSetting(r: StoreRow): StoreSettingEntry {
  return {
    store_id: r.store_id,
    position: Number(r.position) || 0,
    is_visible: !!r.is_visible,
    category_order: Array.isArray(r.category_order) ? r.category_order : [],
    custom_store: r.custom_store ?? undefined,
    item_frequency: r.item_frequency ?? undefined,
  };
}

// ── Serialisierte Schreib-Queue mit Retry (pro Zeilen-Key) ──────────────────
const writeChains = new Map<string, Promise<unknown>>();

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runWithRetry(op: () => Promise<void>): Promise<void> {
  // Bis zu ~20 Versuche mit gedeckeltem exponentiellem Backoff (max 15s).
  // Deckt kurze Offline-Phasen zuverlässig ab; danach greift zusätzlich der
  // Refetch beim Sichtbarwerden der App.
  let lastErr: unknown;
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      await op();
      return;
    } catch (err) {
      lastErr = err;
      const delay = Math.min(15000, 700 * Math.pow(1.6, attempt));
      await sleep(delay);
    }
  }
  throw lastErr;
}

/**
 * Reiht einen Schreibvorgang für eine bestimmte Zeile ein. Schreibvorgänge auf
 * DERSELBEN Zeile laufen strikt nacheinander (nie zwei parallel), sodass z. B.
 * schnelles Mengen-±-Tippen keine Race-Condition auf dieser Zeile erzeugt.
 */
export function enqueueRowWrite(key: string, op: () => Promise<void>): Promise<void> {
  const prev = writeChains.get(key) ?? Promise.resolve();
  const next = prev.catch(() => {}).then(() => runWithRetry(op));
  writeChains.set(key, next);
  next.finally(() => {
    if (writeChains.get(key) === next) writeChains.delete(key);
  });
  return next;
}

/**
 * True, solange für diese Zeile noch ein Schreibvorgang läuft/ansteht. Wird
 * genutzt, um eingehende Realtime-Events für eine Zeile zu ignorieren, die wir
 * gerade selbst optimistisch bearbeiten (verhindert Echo-Überschreiben).
 */
export function hasPendingRowWrite(key: string): boolean {
  return writeChains.has(key);
}

// ── Shopping items: CRUD ────────────────────────────────────────────────────
export async function fetchShoppingItems(householdId: string): Promise<ShoppingItem[]> {
  const { data, error } = await supabase
    .from("shopping_items")
    .select("*")
    .eq("household_id", householdId);
  if (error) throw new Error(error.message);
  return (data as ShoppingRow[]).map(rowToItem);
}

export function insertShoppingItem(item: ShoppingItem, householdId: string): Promise<void> {
  return enqueueRowWrite(`item:${item.id}`, async () => {
    const { error } = await supabase
      .from("shopping_items")
      .upsert(itemToRow(item, householdId), { onConflict: "id" });
    if (error) throw new Error(error.message);
  });
}

export function patchShoppingItem(
  id: string,
  fields: Partial<Omit<ShoppingItem, "id" | "household_id">>,
): Promise<void> {
  return enqueueRowWrite(`item:${id}`, async () => {
    const patch: Record<string, unknown> = { ...fields };
    if ("unit" in patch && patch.unit === undefined) patch.unit = null;
    const { error } = await supabase
      .from("shopping_items")
      .update(patch)
      .eq("id", id);
    if (error) throw new Error(error.message);
  });
}

export function deleteShoppingItem(id: string): Promise<void> {
  return enqueueRowWrite(`item:${id}`, async () => {
    const { error } = await supabase.from("shopping_items").delete().eq("id", id);
    if (error) throw new Error(error.message);
  });
}

/** Bulk-Delete für "Liste leeren" / "Erledigte löschen" — kein Full-Replace. */
export async function deleteShoppingItems(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  // In Blöcken löschen, damit die URL nicht zu lang wird.
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    await runWithRetry(async () => {
      const { error } = await supabase.from("shopping_items").delete().in("id", chunk);
      if (error) throw new Error(error.message);
    });
  }
}

// ── Store settings: CRUD ────────────────────────────────────────────────────
export async function fetchStoreSettings(householdId: string): Promise<StoreSettingEntry[]> {
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("household_id", householdId);
  if (error) throw new Error(error.message);
  return (data as StoreRow[]).map(rowToStoreSetting);
}

export function upsertStoreSetting(
  householdId: string,
  entry: StoreSettingEntry,
): Promise<void> {
  return enqueueRowWrite(`store:${entry.store_id}`, async () => {
    const row = {
      household_id: householdId,
      store_id: entry.store_id,
      position: Number(entry.position) || 0,
      is_visible: !!entry.is_visible,
      category_order: entry.category_order ?? [],
      custom_store: entry.custom_store ?? null,
      item_frequency: entry.item_frequency ?? {},
    };
    const { error } = await supabase
      .from("store_settings")
      .upsert(row, { onConflict: "household_id,store_id" });
    if (error) throw new Error(error.message);
  });
}

// ── Realtime: postgres_changes ──────────────────────────────────────────────
export function subscribeShoppingItems(
  householdId: string,
  handlers: {
    onInsert: (item: ShoppingItem) => void;
    onUpdate: (item: ShoppingItem) => void;
    onDelete: (id: string) => void;
  },
): RealtimeChannel {
  const filter = `household_id=eq.${householdId}`;
  const channel = supabase
    .channel(`shopping_items:${householdId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "shopping_items", filter },
      (p) => handlers.onInsert(rowToItem(p.new as ShoppingRow)),
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "shopping_items", filter },
      (p) => handlers.onUpdate(rowToItem(p.new as ShoppingRow)),
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "shopping_items", filter },
      (p) => handlers.onDelete((p.old as { id: string }).id),
    )
    .subscribe();
  return channel;
}

export function subscribeStoreSettings(
  householdId: string,
  handlers: {
    onUpsert: (entry: StoreSettingEntry) => void;
    onDelete: (storeId: string) => void;
  },
): RealtimeChannel {
  const filter = `household_id=eq.${householdId}`;
  const channel = supabase
    .channel(`store_settings:${householdId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "store_settings", filter },
      (p) => handlers.onUpsert(rowToStoreSetting(p.new as StoreRow)),
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "store_settings", filter },
      (p) => handlers.onUpsert(rowToStoreSetting(p.new as StoreRow)),
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "store_settings", filter },
      (p) => handlers.onDelete((p.old as { store_id: string }).store_id),
    )
    .subscribe();
  return channel;
}

// ── Diff-basierte Persistenz ────────────────────────────────────────────────
// Statt die ganze Liste zu speichern, wird nur der Unterschied zwischen dem
// zuletzt bekannten (synchronisierten) Stand und dem neuen Stand berechnet und
// als granulare INSERT/PATCH/DELETE pro Zeile geschrieben. So überschreibt eine
// Änderung an Artikel A nie mehr Artikel B.
const ITEM_FIELDS: (keyof ShoppingItem)[] = [
  "name",
  "store",
  "category",
  "is_checked",
  "quantity",
  "unit",
  "position",
  "manually_positioned",
];

export function syncItemsDiff(
  householdId: string,
  prev: ShoppingItem[],
  next: ShoppingItem[],
): void {
  const prevMap = new Map(prev.map((i) => [i.id, i]));
  const nextMap = new Map(next.map((i) => [i.id, i]));
  for (const [id, item] of nextMap) {
    const p = prevMap.get(id);
    if (!p) {
      void insertShoppingItem(item, householdId);
      continue;
    }
    const fields: Record<string, unknown> = {};
    for (const f of ITEM_FIELDS) {
      if ((p as Record<string, unknown>)[f] !== (item as Record<string, unknown>)[f]) {
        fields[f] = (item as Record<string, unknown>)[f];
      }
    }
    if (Object.keys(fields).length > 0) {
      void patchShoppingItem(id, fields as Partial<ShoppingItem>);
    }
  }
  for (const id of prevMap.keys()) {
    if (!nextMap.has(id)) void deleteShoppingItem(id);
  }
}

function storeSettingEqual(a: StoreSettingEntry, b: StoreSettingEntry): boolean {
  return (
    a.position === b.position &&
    a.is_visible === b.is_visible &&
    JSON.stringify(a.category_order ?? []) === JSON.stringify(b.category_order ?? []) &&
    JSON.stringify(a.custom_store ?? null) === JSON.stringify(b.custom_store ?? null) &&
    JSON.stringify(a.item_frequency ?? {}) === JSON.stringify(b.item_frequency ?? {})
  );
}

export function syncStoreSettingsDiff(
  householdId: string,
  prev: StoreSettingEntry[],
  next: StoreSettingEntry[],
): void {
  const prevMap = new Map(prev.map((s) => [s.store_id, s]));
  for (const entry of next) {
    const p = prevMap.get(entry.store_id);
    if (!p || !storeSettingEqual(p, entry)) {
      void upsertStoreSetting(householdId, entry);
    }
  }
}
