-- =============================================================
-- RVNO Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- =============================================================

-- Albums (rides, rallies, events)
create table public.albums (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  event_date date not null,
  location_name text not null default '',
  location_lat double precision,
  location_lng double precision,
  cover_photo_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Photos within albums
create table public.photos (
  id uuid default gen_random_uuid() primary key,
  album_id uuid references public.albums(id) on delete cascade not null,
  url text not null,
  caption text,
  sort_order integer default 0 not null,
  created_at timestamptz default now() not null
);

-- Members / Officers
create table public.members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  title text,
  bio text,
  bikes text,
  photo_url text,
  sort_order integer default 0 not null,
  created_at timestamptz default now() not null
);

-- Auto-update updated_at on albums
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger albums_updated_at
  before update on public.albums
  for each row execute function public.update_updated_at();

-- Indexes
create index idx_albums_event_date on public.albums(event_date);
create index idx_photos_album_id on public.photos(album_id);
create index idx_members_sort_order on public.members(sort_order);

-- =============================================================
-- Row Level Security
-- Public can read everything, only authenticated users can write
-- =============================================================

alter table public.albums enable row level security;
alter table public.photos enable row level security;
alter table public.members enable row level security;

-- Read access for everyone
create policy "Albums are viewable by everyone"
  on public.albums for select using (true);

create policy "Photos are viewable by everyone"
  on public.photos for select using (true);

create policy "Members are viewable by everyone"
  on public.members for select using (true);

-- Write access for authenticated users only (Mark)
create policy "Authenticated users can insert albums"
  on public.albums for insert to authenticated with check (true);

create policy "Authenticated users can update albums"
  on public.albums for update to authenticated using (true);

create policy "Authenticated users can delete albums"
  on public.albums for delete to authenticated using (true);

create policy "Authenticated users can insert photos"
  on public.photos for insert to authenticated with check (true);

create policy "Authenticated users can update photos"
  on public.photos for update to authenticated using (true);

create policy "Authenticated users can delete photos"
  on public.photos for delete to authenticated using (true);

create policy "Authenticated users can insert members"
  on public.members for insert to authenticated with check (true);

create policy "Authenticated users can update members"
  on public.members for update to authenticated using (true);

create policy "Authenticated users can delete members"
  on public.members for delete to authenticated using (true);

-- =============================================================
-- Storage Buckets
-- Run these separately if the SQL editor doesn't support them
-- =============================================================

insert into storage.buckets (id, name, public)
values ('album-photos', 'album-photos', true);

insert into storage.buckets (id, name, public)
values ('member-photos', 'member-photos', true);

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true);

-- Storage policies
create policy "Public read access for album photos"
  on storage.objects for select using (bucket_id = 'album-photos');

create policy "Authenticated upload for album photos"
  on storage.objects for insert to authenticated with check (bucket_id = 'album-photos');

create policy "Authenticated delete for album photos"
  on storage.objects for delete to authenticated using (bucket_id = 'album-photos');

create policy "Public read access for member photos"
  on storage.objects for select using (bucket_id = 'member-photos');

create policy "Authenticated upload for member photos"
  on storage.objects for insert to authenticated with check (bucket_id = 'member-photos');

create policy "Authenticated delete for member photos"
  on storage.objects for delete to authenticated using (bucket_id = 'member-photos');

create policy "Public read access for site assets"
  on storage.objects for select using (bucket_id = 'site-assets');

create policy "Authenticated upload for site assets"
  on storage.objects for insert to authenticated with check (bucket_id = 'site-assets');

-- =============================================================
-- Seed data: The founding members
-- =============================================================

insert into public.members (name, title, bio, bikes, sort_order) values
  ('Mark Finkler', 'Founder', 'Retired veterinarian who traded his stethoscope for a kickstarter.', '1973 Norton 750 Commando', 1),
  ('Dave Youngblood', 'Co-Founder', 'Brought his 750 Commando to Roanoke in 1980 and started the whole thing.', '750 Commando', 2),
  ('Tom', 'Parliamentarian', 'Keeps order. Or at least tries to.', null, 3),
  ('Todd Blevins', 'Colorado Connection', 'Found Mark''s first Norton. We blame him for everything.', null, 4);
