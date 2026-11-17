# Database — Supabase project "CSIN Platform" (`hvoyvordtddgddptivti`)

The database version of the app (`npm run build`, settings in `.env.production`) runs on this project.
`npx vite build --mode demo` builds the offline demo that runs on `src/api/mockData.js` instead.

## Changes applied 2026-11-17 (Supabase migration history holds the full SQL)

1. `20261117204248 upseller_core_schema` — tables `visits`, `offer_events`, `follow_ups`, `video_requests`;
   columns `companies.industry/admin_name/admin_email/status`, `profiles.status`, `services.price_range`;
   row-level security per role; `close_visit(p_visit)` (refuses until every required offer has a decision);
   `record_order_revenue(p_visit, p_items)`; public storage bucket `videos`; new-user roles taken only from
   server-set app metadata; a guard so users cannot change their own role or company.
2. `20261117205232 upseller_function_hardening` — trigger functions not callable from the web; helper
   functions signed-in only, fixed search path.

## Edge functions (redeployed 2026-11-17, sign-in required)

- `create-user` — super admin: any role and company; company admin: technician or admin in their own company.
- `delete-user` — super admin: anyone but themselves; company admin: technicians in their own company.
- `generate-services` — company admins and the super admin only (it spends the Anthropic key).

Demo logins and their password are kept outside this repository.
