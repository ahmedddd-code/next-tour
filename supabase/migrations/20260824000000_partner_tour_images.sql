create table if not exists public.partner_tour_images (
  id bigint generated always as identity primary key,
  tour_id text not null references public.app_tours(id) on delete cascade,
  source text not null,
  external_tour_id text not null,
  image_url text not null,
  local_path text,
  is_main boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  external_image_id text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, external_tour_id, image_url)
);

create index if not exists partner_tour_images_tour_idx
  on public.partner_tour_images (tour_id, active, sort_order);
create unique index if not exists partner_tour_images_main_idx
  on public.partner_tour_images (tour_id) where is_main and active;

alter table public.partner_tour_images enable row level security;
revoke all on public.partner_tour_images from anon, authenticated;
grant all on public.partner_tour_images to service_role;

-- Remove legacy random/country-level substitutions from synchronized partner tours.
with cleaned as (
  select t.id,
    coalesce(
      jsonb_agg(to_jsonb(image.value) order by image.ordinality)
        filter (where image.value !~* 'picsum\.photos|images\.unsplash\.com|photo-1500530855697-b586d89ba3ee'),
      '["/images/tour-placeholder.svg"]'::jsonb
    ) as images
  from public.app_tours t
  left join lateral jsonb_array_elements_text(coalesce(t.data->'images', '[]'::jsonb))
    with ordinality as image(value, ordinality) on true
  where t.id like 'partner-%'
  group by t.id
)
update public.app_tours t
set data = jsonb_set(t.data, '{images}', cleaned.images, true)
from cleaned where cleaned.id = t.id;

insert into public.partner_tour_images
  (tour_id, source, external_tour_id, image_url, is_main, sort_order, active)
select t.id,
  coalesce(t.data->>'partnerSource', 'unknown'),
  coalesce(t.data->>'externalOfferId', t.id),
  image.value,
  image.ordinality = 1,
  image.ordinality - 1,
  true
from public.app_tours t
cross join lateral jsonb_array_elements_text(coalesce(t.data->'images', '[]'::jsonb))
  with ordinality as image(value, ordinality)
where t.id like 'partner-%'
on conflict (source, external_tour_id, image_url) do nothing;
