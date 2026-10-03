# Rung — Task 4 (Vercel + Gemini + Supabase)

Live feature: **"Am I ready for this job?"** — paste a JD, get your 3 biggest skill
gaps + a module and proof artifact for each. Every request/response is stored in
Supabase; the page shows live usage numbers and a "most-demanded skills" leaderboard
read back from that table.

## Architecture
- `index.html` — static frontend (the landing page extended with the feature).
- `api/ready.js` — Vercel serverless function. Holds the **Gemini key** (env only),
  enforces the per-visitor cap via Supabase, calls Gemini with a guarded system
  prompt, stores the exchange, returns the gaps.
- `api/leaderboard.js` — aggregates Supabase rows into the numbers the page shows.
- `supabase.sql` — the table (RLS on, no public policies → browser can't touch it).

## One-time setup
1. **Supabase**: create a project → SQL editor → paste `supabase.sql` → run.
2. **Gemini key**: Google AI Studio → create API key (free tier).
3. **Deploy**: push this folder to GitHub, import the repo in Vercel.
4. In Vercel → Settings → Environment Variables add (see `.env.example`):
   `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`. Redeploy.

## Why it's safe
- Key is only in Vercel env; it never appears in the page source or the repo
  (`.gitignore` excludes `.env`; grep the repo for the key → zero hits).
- `readiness_checks` has RLS enabled and **no** public policy, so only the
  serverless function (service key) can read/write it.
- Guardrails: refuses non-JD input (e.g. a pasted resume), judges the gap not the
  person, caps output at 350 tokens and 3 requests/visitor/day.

## Local test
`npm i` then `vercel dev` (needs the three env vars in `.env.local`).
