-- ============================================================================
-- 0005_add_contact_form_settings_rpc.sql
-- Lets the anonymous public contact form Server Action read the
-- 'contact_form' row of site_settings without a public SELECT policy on the
-- table (which stays admin-only). Mirrors the security-definer RPC pattern
-- used by publish_theme() in 0001_theme_management.sql.
-- ============================================================================

create or replace function public.get_contact_form_settings()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select value from public.site_settings where key = 'contact_form';
$$;

revoke all on function public.get_contact_form_settings() from public;
grant execute on function public.get_contact_form_settings() to anon, authenticated;

comment on function public.get_contact_form_settings() is
  'Lets the public contact form Server Action read routing config (recipient email, auto-reply copy) without granting direct SELECT on site_settings, which stays admin-only via RLS. Mirrors the security-definer RPC pattern used by publish_theme() in 0001.';