-- ============================================================================
-- 0001_theme_management.sql
-- Staff allow-list + brand theme management for iconos-group.com
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- staff_users
-- SSO (Microsoft Entra ID) proves WHO someone is. This table decides WHETHER
-- that person is allowed into /admin at all, and whether they're an 'admin'
-- (can manage other staff) or plain 'staff' (can manage themes/blog only).
-- ----------------------------------------------------------------------------
create table public.staff_users (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  role        text not null default 'staff' check (role in ('staff', 'admin')),
  added_by    uuid references auth.users(id),
  created_at  timestamptz not null default now()
);

comment on table public.staff_users is
  'Allow-list of Iconos staff permitted to access /admin. SSO alone does not grant access.';

-- ----------------------------------------------------------------------------
-- themes
-- Each row is one brand concept. tokens is a constrained JSON shape (validated
-- in the application layer, not free-form CSS) covering fonts, colours and
-- radius style. Exactly one row may have status = 'published' at a time.
-- ----------------------------------------------------------------------------
create table public.themes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  status      text not null default 'draft'
              check (status in ('draft', 'published', 'archived')),
  tokens      jsonb not null,
  notes       text,
  created_by  uuid references auth.users(id),
  updated_by  uuid references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on column public.themes.tokens is
  'Expected shape: { font_display, font_body, colors: { dark, darker, accent, accent_soft, cream, white }, radius }';

-- Enforces "only one published theme" at the database level.
create unique index only_one_published_theme
  on public.themes (status)
  where status = 'published';

create index themes_status_idx on public.themes (status);

-- ----------------------------------------------------------------------------
-- theme_publish_log
-- Immutable audit trail. theme_name is a snapshot (not a live join) so the
-- log stays meaningful even if a theme is later edited or deleted.
-- ----------------------------------------------------------------------------
create table public.theme_publish_log (
  id            bigint generated always as identity primary key,
  theme_id      uuid not null references public.themes(id),
  theme_name    text not null,
  published_by  uuid references auth.users(id),
  published_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger themes_set_updated_at
  before update on public.themes
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.staff_users enable row level security;
alter table public.themes enable row level security;
alter table public.theme_publish_log enable row level security;

-- staff_users: only admins can see/manage the staff list. Staff cannot read
-- this table at all (prevents enumerating who else has access).
create policy "admins manage staff list"
  on public.staff_users
  for all
  using (
    exists (
      select 1 from public.staff_users su
      where su.user_id = auth.uid() and su.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.staff_users su
      where su.user_id = auth.uid() and su.role = 'admin'
    )
  );

-- themes: the public site (anon + authenticated visitors) can only ever read
-- the single published theme. This is what the public homepage queries.
create policy "public reads published theme"
  on public.themes
  for select
  to anon, authenticated
  using (status = 'published');

-- themes: staff can read every theme (draft/archived included) for the
-- admin UI's theme list and preview feature.
create policy "staff reads all themes"
  on public.themes
  for select
  to authenticated
  using (exists (select 1 from public.staff_users where user_id = auth.uid()));

create policy "staff creates themes"
  on public.themes
  for insert
  to authenticated
  with check (exists (select 1 from public.staff_users where user_id = auth.uid()));

create policy "staff updates non-published themes"
  on public.themes
  for update
  to authenticated
  using (
    status <> 'published'
    and exists (select 1 from public.staff_users where user_id = auth.uid())
  )
  with check (
    status <> 'published'
    and exists (select 1 from public.staff_users where user_id = auth.uid())
  );
-- Note: publishing itself only ever happens through publish_theme() below,
-- never a direct UPDATE, so "published" rows are edited only by that RPC.

create policy "staff deletes non-published themes"
  on public.themes
  for delete
  to authenticated
  using (
    status <> 'published'
    and exists (select 1 from public.staff_users where user_id = auth.uid())
  );

-- theme_publish_log: staff can read history; nobody can write directly
-- (only the security-definer RPC below inserts rows).
create policy "staff reads publish log"
  on public.theme_publish_log
  for select
  to authenticated
  using (exists (select 1 from public.staff_users where user_id = auth.uid()));

-- ----------------------------------------------------------------------------
-- publish_theme(target_id)
-- Atomically archives whatever is currently published and publishes the
-- target theme, then writes an audit log row. Runs as security definer so it
-- can perform the archive+publish swap even though staff only have UPDATE
-- rights on non-published rows via RLS — the authorization check inside the
-- function is what actually gates this, not table-level grants.
-- ----------------------------------------------------------------------------
create or replace function public.publish_theme(target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_theme_name text;
begin
  if not exists (select 1 from public.staff_users where user_id = auth.uid()) then
    raise exception 'Not authorized to publish themes';
  end if;

  if not exists (select 1 from public.themes where id = target_id) then
    raise exception 'Theme % does not exist', target_id;
  end if;

  update public.themes
    set status = 'archived'
    where status = 'published'
      and id <> target_id;

  update public.themes
    set status = 'published', updated_by = auth.uid()
    where id = target_id
    returning name into v_theme_name;

  insert into public.theme_publish_log (theme_id, theme_name, published_by)
    values (target_id, v_theme_name, auth.uid());
end;
$$;

revoke all on function public.publish_theme(uuid) from public;
grant execute on function public.publish_theme(uuid) to authenticated;
