-- Business-configurable, non-secret settings editable by admins via /admin/settings.
-- API credentials (Microsoft Graph, Turnstile, etc.) must NEVER be stored here —
-- they remain server-only environment variables. This table is for things like
-- the contact form recipient address, sender display name, and auto-reply copy.

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

comment on table public.site_settings is
  'Business-configurable, non-secret settings editable by admins via /admin/settings. API credentials (Microsoft Graph, Turnstile, etc.) must never be stored here — they remain server-only environment variables.';

alter table public.site_settings enable row level security;

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- Reuses the same is_staff_admin() SECURITY DEFINER helper as staff_users,
-- deliberately admin-only (not is_staff()) since this controls where
-- enquiries are routed.
create policy "admins manage site settings"
  on public.site_settings
  for all
  using (is_staff_admin())
  with check (is_staff_admin());

insert into public.site_settings (key, value)
values (
  'contact_form',
  jsonb_build_object(
    'recipient_email', 'enquiries@iconos-group.com',
    'cc_emails', jsonb_build_array(),
    'sender_display_name', 'Iconos Group Website',
    'send_autoreply', true,
    'autoreply_subject', 'We''ve received your enquiry',
    'autoreply_message', 'Thanks for getting in touch with Iconos Group. A member of our team will be in touch shortly.'
  )
)
on conflict (key) do nothing;