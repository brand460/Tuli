-- ============================================================================
-- Tuli — Migration 000: Neue Tabellen zurücksetzen (Reparatur)
-- ----------------------------------------------------------------------------
-- NUR ausführen, wenn 001/002 fehlgeschlagen sind, weil eine der Tabellen
-- bereits (unvollständig) existierte — z. B. Fehler:
--   "column position of relation shopping_items does not exist".
--
-- Warum ungefährlich?
--   * Deine ECHTEN Daten liegen weiterhin im alten kv_store_2a26506b (Blobs).
--     Der wird hier NICHT angefasst.
--   * Die neuen Tabellen enthalten noch keine wichtigen Daten (die App nutzt
--     sie erst nach dem Deploy). Wir verwerfen also nur leere/halbfertige Reste.
--
-- REIHENFOLGE danach:
--   1) 000_reset_new_tables.sql   (diese Datei)
--   2) 001_shopping_store_notes_tables.sql
--   3) 002_migrate_kv_to_tables.sql
-- ============================================================================

-- Optional zuerst prüfen, dass wirklich nichts Wichtiges drin ist:
--   select
--     (select count(*) from public.shopping_items) as items,
--     (select count(*) from public.store_settings) as stores,
--     (select count(*) from public.notes_pages)    as pages;

drop table if exists public.shopping_items cascade;
drop table if exists public.store_settings cascade;
drop table if exists public.notes_pages    cascade;

-- Danach 001_shopping_store_notes_tables.sql ausführen.
