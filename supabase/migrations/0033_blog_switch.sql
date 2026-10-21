-- ============================================================================
-- 0033_blog_switch.sql
-- An on/off switch for the Blog (admin → Settings). Iconos want it hidden
-- until three posts are ready (October 2026).
--
-- Stored as site_settings key 'blog' (admin-only, like the contact form
-- settings). The public site reads it through a narrow SECURITY DEFINER
-- function that returns only this one boolean — same pattern as
-- get_contact_form_settings() in 0005.
--
-- Starts switched OFF. Either deploy order is fine: until this runs, the
-- new code can't read the switch and keeps the Blog hidden.
-- ============================================================================

insert into public.site_settings (key, value)
values ('blog', '{"enabled": false}'::jsonb)
on conflict (key) do nothing;

create or replace function public.get_blog_enabled()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select (value->>'enabled')::boolean from public.site_settings where key = 'blog'), false);
$$;

revoke all on function public.get_blog_enabled() from public;
grant execute on function public.get_blog_enabled() to anon, authenticated;

comment on function public.get_blog_enabled() is
  'Whether the Blog is shown on the public site. Returns only that boolean, so site_settings stays admin-only via RLS.';
