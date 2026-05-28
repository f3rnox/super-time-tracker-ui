-- Archive flags for sheets and entries (hide from hub/nav without delete).

alter table public.sheets
  add column if not exists archived boolean not null default false;

alter table public.entries
  add column if not exists archived boolean not null default false;

update public.tracker_accounts
set db_version = 4
where db_version < 4;
