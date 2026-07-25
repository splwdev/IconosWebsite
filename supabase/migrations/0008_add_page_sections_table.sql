-- ============================================================================
-- 0008_add_page_sections_table.sql
-- Ordered, typed content blocks belonging to a page. Supersedes pages.body
-- (single rich-text field) and pages.tiers (program-only pricing grid) —
-- both are migrated into sections below and left in place afterward,
-- unused, rather than dropped immediately.
-- ============================================================================
 
create table public.page_sections (
  id            uuid primary key default gen_random_uuid(),
  page_id       uuid not null references public.pages(id) on delete cascade,
  section_type  text not null check (section_type in ('text', 'image_text', 'cta', 'tiers')),
  content       jsonb not null,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
 
comment on column public.page_sections.content is
  'Shape depends on section_type, validated in the application layer (see pageSectionSchema in src/lib/content/page-sections.ts) — same pattern as themes.tokens.';
 
create index page_sections_page_id_idx on public.page_sections (page_id, sort_order);
 
create trigger page_sections_set_updated_at
  before update on public.page_sections
  for each row execute function public.set_updated_at();
 
alter table public.page_sections enable row level security;
 
-- Public visitors only ever see sections belonging to a published page —
-- checked via a subquery against pages' own RLS-protected published rows,
-- not a self-reference, so this doesn't risk the kind of recursion bug
-- staff_users hit in 0001.
create policy "public reads sections of published pages"
  on public.page_sections
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.pages p
      where p.id = page_sections.page_id and p.status = 'published'
    )
  );
 
create policy "staff reads all sections"
  on public.page_sections
  for select
  to authenticated
  using (is_staff());
 
create policy "staff creates sections"
  on public.page_sections
  for insert
  to authenticated
  with check (is_staff());
 
create policy "staff updates sections"
  on public.page_sections
  for update
  to authenticated
  using (is_staff())
  with check (is_staff());
 
create policy "staff deletes sections"
  on public.page_sections
  for delete
  to authenticated
  using (is_staff());
 
-- ----------------------------------------------------------------------------
-- replace_page_sections(page_id, sections)
-- Atomically replaces a page's entire section list — delete all, then
-- insert the submitted array in order. Mirrors the publish_theme() pattern
-- from 0001: SECURITY DEFINER with an explicit is_staff() check inside,
-- since the delete+insert pair needs to happen as one indivisible step
-- rather than two separate RLS-gated client calls that could partially fail.
-- ----------------------------------------------------------------------------
create or replace function public.replace_page_sections(p_page_id uuid, p_sections jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_staff() then
    raise exception 'Not authorized to edit page sections';
  end if;
 
  if not exists (select 1 from public.pages where id = p_page_id) then
    raise exception 'Page % does not exist', p_page_id;
  end if;
 
  delete from public.page_sections where page_id = p_page_id;
 
  insert into public.page_sections (page_id, section_type, content, sort_order)
  select
    p_page_id,
    (elem->>'section_type')::text,
    elem->'content',
    (ord - 1)::integer
  from jsonb_array_elements(p_sections) with ordinality as t(elem, ord);
end;
$$;
 
revoke all on function public.replace_page_sections(uuid, jsonb) from public;
grant execute on function public.replace_page_sections(uuid, jsonb) to authenticated;
 
-- ----------------------------------------------------------------------------
-- Data migration: convert existing body/tiers into sections.
-- ----------------------------------------------------------------------------
 
insert into public.page_sections (page_id, section_type, content, sort_order)
select id, 'text', jsonb_build_object('body', body), 0
from public.pages
where coalesce(body, '') <> '';
 
insert into public.page_sections (page_id, section_type, content, sort_order)
select id, 'tiers', jsonb_build_object('tiers', tiers), 1
from public.pages
where tiers is not null;