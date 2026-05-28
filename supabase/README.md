# Supabase

## Setup

1. Create a project (e.g. `super-time-tracker-ui`).
2. Run migrations via the Supabase SQL editor or `supabase db push`:
   - `migrations/20250519120000_initial_schema.sql` (new projects)
   - `migrations/20250528120000_archive_flags.sql` (existing projects created
     before archive support)
3. In **Authentication → URL configuration**, add redirect URLs:
   - `http://127.0.0.1:3000/auth/callback`
   - `http://localhost:3000/auth/callback`
4. Set environment variables (see `.env.example` at repo root):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Create a single user under **Authentication → Users** (or sign up from `/login`).

When signed in, the app uses Supabase instead of
`~/.super-time-tracker/db.json` and imports the local file on first connect if
the cloud database is empty.
