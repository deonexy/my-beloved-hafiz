-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Users profile (extends Supabase auth.users) ──────────────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- ─── User stats ───────────────────────────────────────────────────────────────
create table if not exists public.user_stats (
  id                   uuid references auth.users on delete cascade primary key,
  total_xp             integer default 0,
  level                integer default 1,
  streak_days          integer default 0,
  last_active_date     date,
  total_ayat_hafal     integer default 0,
  total_ayat_mutqin    integer default 0,
  total_surah_complete integer default 0,
  longest_streak       integer default 0,
  updated_at           timestamptz default now()
);

alter table public.user_stats enable row level security;
create policy "Users own their stats" on public.user_stats
  for all using (auth.uid() = id);

-- ─── Ayat progress ────────────────────────────────────────────────────────────
create table if not exists public.ayat_progress (
  id               bigserial primary key,
  user_id          uuid references auth.users on delete cascade not null,
  surah_number     smallint not null,
  ayat_number      smallint not null,
  status           text not null default 'belum'
                   check (status in ('belum','belajar','hafal','mutqin')),
  review_count     integer default 0,
  correct_streak   integer default 0,
  last_reviewed_at timestamptz,
  next_review_at   timestamptz,
  xp_earned        integer default 0,
  updated_at       timestamptz default now(),
  unique (user_id, surah_number, ayat_number)
);

alter table public.ayat_progress enable row level security;
create policy "Users own their progress" on public.ayat_progress
  for all using (auth.uid() = user_id);

create index idx_ayat_progress_user on public.ayat_progress(user_id);
create index idx_ayat_progress_review on public.ayat_progress(user_id, next_review_at);

-- ─── Practice sessions ────────────────────────────────────────────────────────
create table if not exists public.practice_sessions (
  id               bigserial primary key,
  user_id          uuid references auth.users on delete cascade not null,
  mode             text not null check (mode in ('baca','tulis','kata','terjemah')),
  surah_number     smallint not null,
  ayat_start       smallint not null,
  ayat_end         smallint not null,
  score            smallint not null,
  duration_seconds integer not null,
  xp_earned        integer not null,
  completed_at     timestamptz not null default now()
);

alter table public.practice_sessions enable row level security;
create policy "Users own their sessions" on public.practice_sessions
  for all using (auth.uid() = user_id);

-- ─── Hafalan targets ──────────────────────────────────────────────────────────
create table if not exists public.hafalan_targets (
  id                    bigserial primary key,
  user_id               uuid references auth.users on delete cascade not null,
  target_years          smallint not null,
  start_date            date not null,
  target_date           date not null,
  daily_ayat_target     smallint not null,
  weekly_review_target  smallint not null,
  current_phase         text default 'new' check (current_phase in ('new','review','mutqin')),
  is_active             boolean default true,
  created_at            timestamptz default now()
);

alter table public.hafalan_targets enable row level security;
create policy "Users own their targets" on public.hafalan_targets
  for all using (auth.uid() = user_id);

-- ─── Trigger: auto-create profile on signup ───────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');

  insert into public.user_stats (id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
