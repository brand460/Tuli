import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * Vollbild-Lade-Overlay das während der Claude-Extraktion gezeigt wird.
 * Einheitlich für alle drei Import-Wege: URL, Foto und Text.
 */
export function RecipeExtractionLoader({ visible }: { visible: boolean }) {
  // Animierte Punkte: "" → "." → ".." → "..." → ""
  const [dots, setDots] = useState(0);

  useEffect(() => {
    if (!visible) { setDots(0); return; }
    const id = setInterval(() => setDots((d) => (d + 1) % 4), 500);
    return () => clearInterval(id);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[3000] flex flex-col items-center justify-center"
          style={{ background: "var(--zu-bg)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Pulsierendes Emoji */}
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="text-6xl mb-6 select-none"
            aria-hidden="true"
          >
            🍳
          </motion.div>

          {/* Haupttext mit animierten Punkten */}
          <p className="text-base font-semibold mb-1" style={{ color: "var(--color-text-1)" }}>
            Rezept wird erkannt{".".repeat(dots)}
            {/* unsichtbare Punkte damit die Breite stabil bleibt */}
            <span className="invisible">{".".repeat(3 - dots)}</span>
          </p>

          <p className="text-sm mb-6" style={{ color: "var(--color-text-3)" }}>
            Bitte einen Moment Geduld
          </p>

          {/* Accent-farbener Spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 rounded-full border-2 border-t-transparent"
            style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
