-- ============================================================================
-- Tuli — Migration 003: Alte KV-Blobs aufräumen (ERST NACH VERIFIKATION!)
-- ----------------------------------------------------------------------------
-- NICHT sofort ausführen. Erst wenn du in der App bestätigt hast, dass
-- Einkaufsliste, Läden und alle Notizseiten inkl. Inhalten vollständig da sind
-- und über mehrere Tage stabil laufen.
--
-- Entfernt die nun überflüssigen Blob-Keys aus kv_store_2a26506b. Die anderen
-- Keys (calendar_events, recipes, meal_plan, global_items, custom_categories,
-- category_colors, onesignal_player, last_page ...) bleiben unangetastet.
-- ============================================================================

-- Zur Kontrolle vorher anschauen, WAS gelöscht würde:
--   select key from public.kv_store_2a26506b
--   where key like 'shopping:%'
--      or key like 'store_settings:%'
--      or key like 'custom_pages:%'
--      or key like 'custom_blocks:%';

delete from public.kv_store_2a26506b
where key like 'shopping:%'
   or key like 'store_settings:%'
   or key like 'custom_pages:%'
   or key like 'custom_blocks:%';
