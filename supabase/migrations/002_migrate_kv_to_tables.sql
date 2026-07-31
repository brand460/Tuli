-- ============================================================================
-- Tuli — Migration 002: Bestehende Daten aus kv_store übernehmen
-- ----------------------------------------------------------------------------
-- Liest die bestehenden JSON-Blobs aus kv_store_2a26506b und überführt sie in
-- die neuen Zeilen-Tabellen — für ALLE Haushalte, nicht nur den bekannten.
--
--   shopping:<hh>       -> shopping_items
--   store_settings:<hh> -> store_settings
--   custom_pages:<hh>   -> notes_pages (Metadaten)
--   custom_blocks:<hh>  -> notes_pages.content (Inhalt pro Seite)
--
-- SICHERHEIT:
--   * Die alten KV-Keys werden NICHT gelöscht (erst nach Verifikation, per
--     003_cleanup_old_kv.sql).
--   * "on conflict do nothing" -> mehrfaches Ausführen fügt keine Duplikate ein.
--   * Läuft im SQL-Editor mit vollen Rechten (umgeht RLS bewusst, einmalig).
-- ============================================================================

-- ── 1) shopping_items ───────────────────────────────────────────────────────
insert into public.shopping_items
  (id, household_id, store, name, category, is_checked, quantity, unit, position, manually_positioned)
select
  coalesce(nullif(elem->>'id', ''), gen_random_uuid()::text),
  split_part(k.key, ':', 2)::uuid,
  coalesce(elem->>'store', 'alle'),
  coalesce(elem->>'name', ''),
  elem->>'category',
  coalesce((elem->>'is_checked')::boolean, false),
  coalesce((elem->>'quantity')::numeric, 1),
  elem->>'unit',
  coalesce((elem->>'position')::numeric, 0),
  coalesce((elem->>'manually_positioned')::boolean, false)
from public.kv_store_2a26506b k
cross join lateral jsonb_array_elements(k.value) elem
where k.key like 'shopping:%'
  and jsonb_typeof(k.value) = 'array'
  and coalesce(elem->>'name', '') <> ''
on conflict (id) do nothing;

-- ── 2) store_settings ───────────────────────────────────────────────────────
insert into public.store_settings
  (household_id, store_id, position, is_visible, category_order, custom_store, item_frequency)
select
  split_part(k.key, ':', 2)::uuid,
  elem->>'store_id',
  coalesce((elem->>'position')::numeric, 0),
  coalesce((elem->>'is_visible')::boolean, true),
  coalesce(elem->'category_order', '[]'::jsonb),
  elem->'custom_store',
  coalesce(elem->'item_frequency', '{}'::jsonb)
from public.kv_store_2a26506b k
cross join lateral jsonb_array_elements(k.value) elem
where k.key like 'store_settings:%'
  and jsonb_typeof(k.value) = 'array'
  and coalesce(elem->>'store_id', '') <> ''
on conflict (household_id, store_id) do nothing;

-- ── 3) notes_pages (Metadaten aus custom_pages + Inhalt aus custom_blocks) ──
insert into public.notes_pages
  (id, household_id, title, icon, parent_id, position, content)
select
  page->>'id',
  split_part(p.key, ':', 2)::uuid,
  coalesce(page->>'title', ''),
  coalesce(nullif(page->>'icon', ''), '📄'),
  nullif(page->>'parent_id', ''),
  coalesce((page->>'position')::numeric, 0),
  coalesce(
    nullif(b.value ->> (page->>'id'), ''),
    '<p><br></p>'
  )
from public.kv_store_2a26506b p
cross join lateral jsonb_array_elements(p.value) page
left join public.kv_store_2a26506b b
  on b.key = 'custom_blocks:' || split_part(p.key, ':', 2)
where p.key like 'custom_pages:%'
  and jsonb_typeof(p.value) = 'array'
  and coalesce(page->>'id', '') <> ''
on conflict (id) do nothing;

-- ============================================================================
-- VERIFIKATION (optional, zum Anschauen der übernommenen Zeilen):
--   select household_id, count(*) from public.shopping_items group by 1;
--   select household_id, count(*) from public.store_settings group by 1;
--   select household_id, count(*) from public.notes_pages    group by 1;
-- Vergleiche mit den alten Blobs:
--   select key, jsonb_array_length(value) from public.kv_store_2a26506b
--     where key like 'shopping:%' or key like 'store_settings:%' or key like 'custom_pages:%';
-- ============================================================================
