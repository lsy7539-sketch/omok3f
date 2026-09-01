-- 3층오목: 플레이어 명단 + 경기 기록
-- Supabase 대시보드 -> SQL Editor에 붙여넣고 실행하세요.

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  unique (owner_id, name)
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  player1_id uuid not null references players (id) on delete cascade,
  player2_id uuid not null references players (id) on delete cascade,
  winner_id uuid not null references players (id) on delete cascade,
  win_reason text not null check (
    win_reason in ('EXACT_FIVE', 'FIVE_THIRD_FLOOR', 'THREE_CONNECTED_THIRD_FLOOR')
  ),
  played_at timestamptz not null default now(),
  check (winner_id = player1_id or winner_id = player2_id),
  check (player1_id <> player2_id)
);

create index if not exists matches_owner_idx on matches (owner_id, played_at desc);

alter table players enable row level security;
alter table matches enable row level security;

-- 로그인한 계정은 자기 소유의 행만 보고/쓸 수 있음.
create policy "players are owner-scoped" on players
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "matches are owner-scoped" on matches
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
