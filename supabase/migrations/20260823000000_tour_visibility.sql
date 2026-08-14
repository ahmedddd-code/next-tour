alter table public.app_tours
  add column if not exists hidden boolean not null default false;

create index if not exists app_tours_public_catalog_idx
  on public.app_tours (sync_status, hidden, updated_at desc);
