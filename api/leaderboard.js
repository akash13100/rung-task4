// api/leaderboard.js — read-back the page shows: live usage + most-demanded skills.
// Reads from Supabase and returns an aggregated leaderboard (no personal data).
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const sinceWeek = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  // Total checks run (the "it's being used" number on the page).
  const { count: totalChecks } = await supabase
    .from('readiness_checks').select('*', { count: 'exact', head: true });

  // Pull this week's skills and tally them in the function (small volumes).
  const { data: rows } = await supabase
    .from('readiness_checks')
    .select('skills, target_role, created_at')
    .eq('refused', false)
    .gte('created_at', sinceWeek)
    .limit(2000);

  const tally = {};
  const roles = new Set();
  (rows || []).forEach(r => {
    if (r.target_role) roles.add(r.target_role.toLowerCase());
    (r.skills || []).forEach(s => { const k = String(s).trim(); if (k) tally[k] = (tally[k] || 0) + 1; });
  });
  const leaderboard = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([skill, demand], i) => ({ rank: i + 1, skill, demand }));

  return res.status(200).json({
    total_checks: totalChecks || 0,
    checks_this_week: (rows || []).length,
    roles_mapped: roles.size,
    leaderboard,
  });
}
