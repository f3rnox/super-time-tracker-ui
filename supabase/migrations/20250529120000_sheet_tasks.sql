-- Sheet-scoped tasks for lightweight task management.

create table if not exists public.sheet_tasks (
  sheet_id uuid not null references public.sheets (id) on delete cascade,
  id uuid not null default gen_random_uuid(),
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (sheet_id, id)
);

create index if not exists sheet_tasks_sheet_id_idx
  on public.sheet_tasks (sheet_id);

alter table public.sheet_tasks enable row level security;

drop policy if exists sheet_tasks_all_own on public.sheet_tasks;

create policy sheet_tasks_all_own
  on public.sheet_tasks
  for all
  using (
    exists (
      select 1
      from public.sheets s
      where s.id = sheet_tasks.sheet_id
        and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.sheets s
      where s.id = sheet_tasks.sheet_id
        and s.user_id = auth.uid()
    )
  );

alter table public.tracker_accounts
  alter column db_version set default 5;

update public.tracker_accounts
set db_version = 5
where db_version < 5;
