-- ============================================================================
-- 0009_add_background_to_page_sections.sql
-- Admin-controlled per-section background (Plain / Tinted). Sibling to
-- section_type rather than nested inside content, since it's a
-- cross-cutting display concern, not type-specific data.
-- ============================================================================
 
alter table public.page_sections
  add column background text not null default 'none' check (background in ('none', 'tint'));
 
comment on column public.page_sections.background is
  'Admin-controlled per-section background styling. Not offered for cta sections in the UI (they already have a fixed dark background) but the column applies uniformly for schema simplicity.';
 
-- Re-create replace_page_sections to also carry background through the
-- atomic replace — same function/signature, one more field per row.
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
 
  insert into public.page_sections (page_id, section_type, background, content, sort_order)
  select
    p_page_id,
    (elem->>'section_type')::text,
    coalesce(elem->>'background', 'none'),
    elem->'content',
    (ord - 1)::integer
  from jsonb_array_elements(p_sections) with ordinality as t(elem, ord);
end;
$$;