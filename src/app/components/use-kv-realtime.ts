/**
 * useKvRealtime — Shared hook for Supabase Realtime sync via **Broadcast**.
 *
 * Why Broadcast instead of postgres_changes?
 *   postgres_changes requires Realtime to be manually enabled on the
 *   kv_store table in the Supabase dashboard. Broadcast is pure pub/sub
 *   and works out of the box — no table config needed.
 *
 * Flow:
 *   1. Client writes to server → calls `broadcastChange(keys)`
 *   2. broadcastChange publishes the changed keys on a shared channel
 *   3. Other clients receive the broadcast, check if any watched key matches,
 *      and call their reload callback (debounced, echo-suppressed)
 *
 * Also reconnects + reloads on visibilitychange.
 * Cleans up listeners on unmount.
 */
import { useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase-client";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ── Singleton broadcast channel ────────────────────────────────────

const BROADCAST_CHANNEL_NAME = "zuhause-sync";
const ECHO_SUPPRESS_MS = 500;

/** Timestamp of last local write — shared across all hooks */
let lastLocalWrite = 0;

/** Registered listener callbacks: key → Set<callback> */
const keyListeners = new Map<string, Set<() => void>>();

/** The single broadcast channel */
let broadcastChannel: RealtimeChannel | null = null;
let channelReady = false;

function ensureBroadcastChannel() {
  if (broadcastChannel) return broadcastChannel;

  broadcastChannel = supabase.channel(BROADCAST_CHANNEL_NAME, {
    config: { broadcast: { self: true } },
  });

  broadcastChannel.on("broadcast", { event: "kv-change" }, (payload) => {
    const changedKeys: string[] = payload.payload?.keys || [];
    const senderTimestamp: number = payload.payload?.ts || 0;

    // Skip if this is likely our own echo
    if (Math.abs(senderTimestamp - lastLocalWrite) < ECHO_SUPPRESS_MS) return;

    // Find all listeners interested in the changed keys
    const callbacks = new Set<() => void>();
    for (const key of changedKeys) {
      const cbs = keyListeners.get(key);
      if (cbs) cbs.forEach((cb) => callbacks.add(cb));
    }

    // Fire each unique callback
    callbacks.forEach((cb) => cb());
  });

  broadcastChannel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      channelReady = true;
      console.log("[Realtime] Broadcast channel connected");
    }
  });

  return broadcastChannel;
}

/**
 * Call after every successful write to:
 *   1. Suppress echo for this client
 *   2. Notify all other clients about the changed keys
 */
export function markLocalWrite() {
  lastLocalWrite = Date.now();
}

/**
 * Broadcast which KV keys were changed so other clients can reload.
 * Call this AFTER a successful API write.
 */
export function broadcastChange(keys: string[]) {
  lastLocalWrite = Date.now();
  const ch = ensureBroadcastChannel();

  // Notify local listeners immediately (same-tab, different components).
  // The broadcast echo would be suppressed by the echo-check, so we must
  // fire them directly here instead of relying on the round-trip.
  const callbacks = new Set<() => void>();
  for (const key of keys) {
    const cbs = keyListeners.get(key);
    if (cbs) cbs.forEach((cb) => callbacks.add(cb));
  }
  callbacks.forEach((cb) => cb());

  // Also send over the wire so OTHER devices / tabs are notified.
  if (channelReady) {
    ch.send({
      type: "broadcast",
      event: "kv-change",
      payload: { keys, ts: lastLocalWrite },
    }).catch((err: any) => {
      console.warn("[Realtime] Broadcast send error:", err);
    });
  }
}

// ── React Hook ─────────────────────────────────────────────────────

/**
 * @param keys  — KV key(s) to watch, e.g. `["shopping:dev-household"]`
 * @param onRemoteChange — called when a remote write is detected (debounced)
 * @param enabled — optional flag to pause/resume the subscription (default true)
 */
export function useKvRealtime(
  keys: string[],
  onRemoteChange: () => void,
  enabled = true,
) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(onRemoteChange);
  callbackRef.current = onRemoteChange;

  // Debounced wrapper — collapses rapid-fire events into one reload
  const debouncedCallback = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      callbackRef.current();
    }, 300);
  }, []);

  // Register / unregister listeners
  useEffect(() => {
    if (!enabled || keys.length === 0) return;

    // Ensure broadcast channel is alive
    ensureBroadcastChannel();

    // Register this hook's callback for each key
    for (const key of keys) {
      if (!keyListeners.has(key)) keyListeners.set(key, new Set());
      keyListeners.get(key)!.add(debouncedCallback);
    }

    console.log(`[Realtime] Watching keys: ${keys.join(", ")}`);

    return () => {
      for (const key of keys) {
        const set = keyListeners.get(key);
        if (set) {
          set.delete(debouncedCallback);
          if (set.size === 0) keyListeners.delete(key);
        }
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [keys.join(","), enabled, debouncedCallback]);

  // Reconnect + reload on visibility change
  useEffect(() => {
    if (!enabled) return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        console.log(
          `[Realtime] Visible again — reconnecting + reloading ${keys.join(", ")}`,
        );
        // Re-ensure broadcast channel (may have been dropped by OS)
        if (broadcastChannel) {
          supabase.removeChannel(broadcastChannel);
          broadcastChannel = null;
          channelReady = false;
        }
        ensureBroadcastChannel();
        // Reload data to catch anything missed while hidden
        callbackRef.current();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [keys.join(","), enabled]);
}