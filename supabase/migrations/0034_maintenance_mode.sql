-- ============================================================================
-- 0034_maintenance_mode.sql
-- Maintenance mode (admin → Settings). While it's on, every public address
-- shows a "We'll be back soon" page; /admin, sign-in and signed-in staff
-- are unaffected.
--
-- Stored as site_settings key 'maintenance' (admin-only RLS). The site
-- reads it through a narrow SECURITY DEFINER function that returns only
-- the switch, heading and message — same pattern as get_blog_enabled().
--
-- Starts switched OFF. Either deploy order is fine: if the code can't read
-- the switch, the site stays up.
-- ============================================================================

insert into public.site_settings (key, value)
values (
  'maintenance',
  jsonb_build_object(
    'enabled', false,
    'heading', 'We''ll be back soon.',
    'message', 'Our website is being updated and will be back shortly. In the meantime, we''re still here to help.'
  )
)
on conflict (key) do nothing;

create or replace function public.get_maintenance()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select jsonb_build_object(
        'enabled', coalesce((value->>'enabled')::boolean, false),
        'heading', coalesce(value->>'heading', ''),
        'message', coalesce(value->>'message', '')
      )
      from public.site_settings
      where key = 'maintenance'
    ),
    jsonb_build_object('enabled', false, 'heading', '', 'message', '')
  );
$$;

revoke all on function public.get_maintenance() from public;
grant execute on function public.get_maintenance() to anon, authenticated;

comment on function public.get_maintenance() is
  'Maintenance mode: whether it''s on, and the heading and message shown. Returns only those, so site_settings stays admin-only via RLS.';
