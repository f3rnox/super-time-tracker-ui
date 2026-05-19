-- Normalized schema for super-time-tracker-ui cloud sync.

create extension if not exists "pgcrypto";

create table public.tracker_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  active_sheet_name text,
  db_version integer not null default 3,
  ui_preferences jsonb not null default '{}'::jsonb,
  local_imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sheets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.tracker_accounts (user_id) on delete cascade,
  name text not null,
  active_entry_id integer,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index sheets_user_id_idx on public.sheets (user_id);

create table public.entries (
  sheet_id uuid not null references public.sheets (id) on delete cascade,
  id integer not null,
  start_at timestamptz not null,
  end_at timestamptz,
  description text not null default '',
  tags text[] not null default '{}',
  primary key (sheet_id, id)
);

create index entries_sheet_id_idx on public.entries (sheet_id);

create table public.entry_notes (
  sheet_id uuid not null,
  entry_id integer not null,
  note_index integer not null,
  noted_at timestamptz not null,
  text text not null,
  primary key (sheet_id, entry_id, note_index),
  foreign key (sheet_id, entry_id)
    references public.entries (sheet_id, id)
    on delete cascade
);

create index entry_notes_sheet_id_idx on public.entry_notes (sheet_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tracker_accounts_updated_at
  before update on public.tracker_accounts
  for each row
  execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.tracker_accounts (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

alter table public.tracker_accounts enable row level security;
alter table public.sheets enable row level security;
alter table public.entries enable row level security;
alter table public.entry_notes enable row level security;

create policy tracker_accounts_select_own
  on public.tracker_accounts
  for select
  using (auth.uid() = user_id);

create policy tracker_accounts_insert_own
  on public.tracker_accounts
  for insert
  with check (auth.uid() = user_id);

create policy tracker_accounts_update_own
  on public.tracker_accounts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy sheets_all_own
  on public.sheets
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy entries_all_own
  on public.entries
  for all
  using (
    exists (
      select 1
      from public.sheets s
      where s.id = entries.sheet_id
        and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.sheets s
      where s.id = entries.sheet_id
        and s.user_id = auth.uid()
    )
  );

create policy entry_notes_all_own
  on public.entry_notes
  for all
  using (
    exists (
      select 1
      from public.sheets s
      where s.id = entry_notes.sheet_id
        and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.sheets s
      where s.id = entry_notes.sheet_id
        and s.user_id = auth.uid()
    )
  );
