/**
 * Centralized back-gesture handler (v2 — single history entry, batched sync).
 *
 * Instead of pushing one history entry per drawer, we maintain a SINGLE
 * guard entry in the browser history.  An in-memory stack tracks which
 * close-handler to call when popstate fires.
 *
 * Why:  history.back() is asynchronous — calling it followed by
 * history.pushState() in the same JS task creates race conditions.
 * The batched approach avoids this by deferring history changes to a
 * setTimeout(0), so multiple push/remove operations collapse into one.
 *
 * Usage:
 *   useBackHandler(isOpen, () => setIsOpen(false));
 *   // or manually:
 *   pushBack(() => closeView());
 *   popBack();  // remove last handler without calling it
 */

import { useEffect, useRef } from "react";

// ── Global state ────────────────────────────────────────────────────

interface BackEntry {
  id: number;
  fn: () => void;
}

const backStack: BackEntry[] = [];
let nextId = 1;
let historyGuardActive = false;
let skipPops = 0;
let syncScheduled = false;
let listenerAttached = false;

function ensureListener() {
  if (listenerAttached) return;
  listenerAttached = true;

  window.addEventListener("popstate", () => {
    if (skipPops > 0) {
      skipPops--;
      return;
    }

    historyGuardActive = false;

    if (backStack.length > 0) {
      const entry = backStack.pop()!;

      // If more handlers remain, immediately re-push the guard
      // so the next back gesture is also caught.
      if (backStack.length > 0) {
        history.pushState({ bh: true }, "");
        historyGuardActive = true;
      }

      entry.fn();
    }
  });
}

/**
 * Deferred history sync.  Collapses multiple push/remove calls that
 * happen in the same React effect batch into a single history operation.
 */
function scheduleSync() {
  if (syncScheduled) return;
  syncScheduled = true;

  setTimeout(() => {
    syncScheduled = false;
    const needGuard = backStack.length > 0;

    if (needGuard && !historyGuardActive) {
      history.pushState({ bh: true }, "");
      historyGuardActive = true;
    } else if (!needGuard && historyGuardActive) {
      skipPops++;
      historyGuardActive = false;
      history.back();
    }
  }, 0);
}

// ── Public API ──────────────────────────────────────────────────────

/** Push a close-handler onto the stack. Returns an ID for later removal. */
export function pushBack(closeFn: () => void): number {
  ensureListener();
  const id = nextId++;
  backStack.push({ id, fn: closeFn });
  scheduleSync();
  return id;
}

/**
 * Remove the LAST handler from the stack without calling it.
 * Used when manually navigating away from a view (e.g. save → detail).
 */
export function popBack() {
  if (backStack.length === 0) return;
  backStack.pop();
  scheduleSync();
}

/**
 * Remove a SPECIFIC handler by ID without calling it.
 * Used by useBackHandler when a drawer closes normally.
 */
export function removeBack(id: number) {
  const idx = backStack.findIndex((e) => e.id === id);
  if (idx >= 0) {
    backStack.splice(idx, 1);
    scheduleSync();
  }
}

// ── React hook ──────────────────────────────────────────────────────

/**
 * Automatically manages pushBack / removeBack based on an `isOpen` boolean.
 *
 * @param isOpen  Whether the drawer/modal is currently visible.
 * @param closeFn Called when the user swipe-backs (popstate).
 */
export function useBackHandler(isOpen: boolean, closeFn: () => void) {
  const closeFnRef = useRef(closeFn);
  closeFnRef.current = closeFn;

  const handlerIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen && handlerIdRef.current === null) {
      // Drawer just opened → register handler
      handlerIdRef.current = pushBack(() => {
        handlerIdRef.current = null;
        closeFnRef.current();
      });
    } else if (!isOpen && handlerIdRef.current !== null) {
      // Drawer closed normally (not via back gesture) → remove by ID
      const id = handlerIdRef.current;
      handlerIdRef.current = null;
      removeBack(id);
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (handlerIdRef.current !== null) {
        removeBack(handlerIdRef.current);
        handlerIdRef.current = null;
      }
    };
  }, []);
}
