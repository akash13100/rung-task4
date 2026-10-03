-- Run this in Supabase -> SQL editor.
create table if not exists public.readiness_checks (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  visitor_id   text,                 -- coarse id for the per-visitor cap (no names)
  target_role  text,
  refused      boolean default false,
  gaps         jsonb,                -- [{skill, why, module, proof}]
  skills       text[],               -- top skills for the leaderboard
  input_tokens  int,
  output_tokens int
);
-- Only the serverless function (service key) touches this table.
alter table public.readiness_checks enable row level security;
-- No public policies => browser cannot read/write directly. Good.
