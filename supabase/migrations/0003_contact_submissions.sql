-- ============================================================================
-- 0003_contact_submissions.sql
-- Stores contact form enquiries as an audit trail alongside emailing them.
-- Public (anon) visitors can INSERT only — never read, update, or delete
-- their own or anyone else's submission. Staff can read everything.
-- ============================================================================

create table public.contact_submissions (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  company        text not null,
  email          text not null,
  phone          text not null,
  enquiry_type   text not null check (
                   enquiry_type in (
                     'Managed Legal Services',
                     'Virtual Data Protection Officer',
                     'Ad Hoc Work',
                     'General Enquiry'
                   )
                 ),
  message        text not null,
  turnstile_verified boolean not null default false,
  email_sent     boolean not null default false,
  created_at     timestamptz not null default now()
);

create index contact_submissions_created_at_idx on public.contact_submissions (created_at desc);

alter table public.contact_submissions enable row level security;

-- Public visitors can submit the form (insert only) — this is the only
-- table in the schema anon is ever granted INSERT on.
create policy "anyone can submit the contact form"
  on public.contact_submissions
  for insert
  to anon, authenticated
  with check (true);

-- Nobody but staff can ever read submissions back — prevents an anon
-- visitor from enumerating other people's enquiries via the API.
create policy "staff reads submissions"
  on public.contact_submissions
  for select
  to authenticated
  using (exists (select 1 from public.staff_users where user_id = auth.uid()));
