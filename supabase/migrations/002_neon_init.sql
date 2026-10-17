-- ─── Hafiz App — Neon PostgreSQL Schema ──────────────────────────────────────
-- NextAuth JWT-only (no sessions table), CredentialsProvider with bcrypt

-- Users table (managed by app — register + NextAuth)
create table if not exists users (
  id            text primary key default gen_random_uuid()::text,
  name          text,
  email         text unique not null,
  password_hash text,
  created_at    timestamptz default now()
);

-- User stats (1:1 with users)
create table if not exists user_stats (
  user_id              text primary key references users(id) on delete cascade,
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

-- Ayat progress
create table if not exists ayat_progress (
  id               bigserial primary key,
  user_id          text not null references users(id) on delete cascade,
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

create index if not exists idx_ayat_progress_user   on ayat_progress(user_id);
create index if not exists idx_ayat_progress_review on ayat_progress(user_id, next_review_at);

-- Practice sessions
create table if not exists practice_sessions (
  id               bigserial primary key,
  user_id          text not null references users(id) on delete cascade,
  mode             text not null check (mode in ('baca','tulis','kata','terjemah')),
  surah_number     smallint not null,
  ayat_start       smallint not null,
  ayat_end         smallint not null,
  score            smallint not null,
  duration_seconds integer not null,
  xp_earned        integer not null,
  completed_at     timestamptz not null default now()
);

-- Hafalan targets
create table if not exists hafalan_targets (
  id                   bigserial primary key,
  user_id              text not null references users(id) on delete cascade,
  target_years         smallint not null,
  start_date           date not null,
  target_date          date not null,
  daily_ayat_target    smallint not null,
  weekly_review_target smallint not null,
  current_phase        text default 'new' check (current_phase in ('new','review','mutqin')),
  is_active            boolean default true,
  created_at           timestamptz default now()
);
