-- ============================================================================
-- Tuli — Migration 001: Blob → Zeilen-Tabellen
-- ----------------------------------------------------------------------------
-- Legt drei neue Tabellen an, damit Einkaufsliste, Laden-Einstellungen und
-- Notizseiten NICHT mehr als ein einziger JSON-Blob im kv_store gespeichert
-- werden, sondern jede Zeile einzeln. Das behebt die Datenverlust-Bugs durch
-- konkurrierende Speichervorgänge (zwei Geräte gleichzeitig).
--
-- WICHTIG:
--   * Primärschlüssel sind TEXT (nicht uuid), weil die App die IDs selbst
--     erzeugt (z. B. "p1", "p2" für Standard-Notizseiten oder
--     Date.now()+random für Artikel). Ein uuid-PK würde die Migration der
--     bestehenden Daten und die optimistischen Frontend-Inserts brechen.
--   * RLS nutzt die bestehende Funktion get_user_household_id() wie alle
--     anderen Haushalts-Tabellen (households, household_members, profiles).
--   * Realtime (postgres_changes) wird per Publication + REPLICA IDENTITY FULL
--     aktiviert, gefiltert wird clientseitig nach household_id (RLS schützt
--     zusätzlich serverseitig).
--
-- Idempotent: kann mehrfach ausgeführt werden (IF NOT EXISTS / DROP POLICY IF).
-- ============================================================================

-- ── Gemeinsame Trigger-Funktion: updated_at automatisch setzen ──────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 1) shopping_items — eine Zeile pro Artikel
-- ============================================================================
create table if not exists public.shopping_items (
  id                   text primary key default gen_random_uuid()::text,
  household_id         uuid not null,
  store                text not null,
  name                 text not null,
  category             text,
  is_checked           boolean not null default false,
  quantity             numeric not null default 1,
  unit                 text,
  position             numeric not null default 0,
  manually_positioned  boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists shopping_items_household_idx
  on public.shopping_items (household_id);

drop trigger if exists shopping_items_set_updated_at on public.shopping_items;
create trigger shopping_items_set_updated_at
  before update on public.shopping_items
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 2) store_settings — eine Zeile pro (Haushalt, Laden)
-- ============================================================================
create table if not exists public.store_settings (
  id              text primary key default gen_random_uuid()::text,
  household_id    uuid not null,
  store_id        text not null,
  position        numeric not null default 0,
  is_visible      boolean not null default true,
  category_order  jsonb not null default '[]'::jsonb,
  custom_store    jsonb,
  item_frequency  jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (household_id, store_id)
);

create index if not exists store_settings_household_idx
  on public.store_settings (household_id);

drop trigger if exists store_settings_set_updated_at on public.store_settings;
create trigger store_settings_set_updated_at
  before update on public.store_settings
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 3) notes_pages — eine Zeile pro Notizseite (Metadaten + Inhalt)
-- ----------------------------------------------------------------------------
-- parent_id ist bewusst OHNE Fremdschlüssel-Constraint: Die App verwaltet die
-- Hierarchie selbst; ein harter FK würde die Migration (Reihenfolge) und das
-- Löschen von Elternseiten unnötig verkomplizieren.
-- ============================================================================
create table if not exists public.notes_pages (
  id           text primary key default gen_random_uuid()::text,
  household_id uuid not null,
  title        text not null default '',
  icon         text not null default '📄',
  parent_id    text,
  position     numeric not null default 0,
  content      text not null default '<p><br></p>',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists notes_pages_household_idx
  on public.notes_pages (household_id);

drop trigger if exists notes_pages_set_updated_at on public.notes_pages;
create trigger notes_pages_set_updated_at
  before update on public.notes_pages
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 4) Row Level Security — nur Mitglieder des eigenen Haushalts
-- ----------------------------------------------------------------------------
-- get_user_household_id() ist SECURITY DEFINER und liefert die household_id
-- des aktuell eingeloggten Users (vermeidet RLS-Rekursion auf
-- household_members). Gleiche Konvention wie bei den bestehenden Tabellen.
-- ============================================================================
alter table public.shopping_items enable row level security;
alter table public.store_settings enable row level security;
alter table public.notes_pages    enable row level security;

-- shopping_items
drop policy if exists shopping_items_hh_all on public.shopping_items;
create policy shopping_items_hh_all on public.shopping_items
  for all
  using (household_id = public.get_user_household_id())
  with check (household_id = public.get_user_household_id());

-- store_settings
drop policy if exists store_settings_hh_all on public.store_settings;
create policy store_settings_hh_all on public.store_settings
  for all
  using (household_id = public.get_user_household_id())
  with check (household_id = public.get_user_household_id());

-- notes_pages
drop policy if exists notes_pages_hh_all on public.notes_pages;
create policy notes_pages_hh_all on public.notes_pages
  for all
  using (household_id = public.get_user_household_id())
  with check (household_id = public.get_user_household_id());

-- ============================================================================
-- 5) Realtime (postgres_changes)
-- ----------------------------------------------------------------------------
-- REPLICA IDENTITY FULL sorgt dafür, dass bei DELETE/UPDATE die komplette alte
-- Zeile (inkl. household_id) im Realtime-Payload steckt, damit Clients auch
-- Lösch-Events korrekt nach household_id filtern können.
-- ============================================================================
alter table public.shopping_items replica identity full;
alter table public.store_settings replica identity full;
alter table public.notes_pages    replica identity full;

-- Tabellen zur Realtime-Publication hinzufügen (nur falls noch nicht drin).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'shopping_items'
  ) then
    alter publication supabase_realtime add table public.shopping_items;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'store_settings'
  ) then
    alter publication supabase_realtime add table public.store_settings;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'notes_pages'
  ) then
    alter publication supabase_realtime add table public.notes_pages;
  end if;
end $$;

-- Fertig. Als Nächstes: 002_migrate_kv_to_tables.sql ausführen.
