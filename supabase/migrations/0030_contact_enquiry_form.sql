-- ============================================================================
-- 0030_contact_enquiry_form.sql
-- The new contact form (October 2026 wireframes): more about the person and
-- business, a service choice with follow-up questions, and consent options.
--
-- 1. contact_submissions gets the new fields. `name` stays (first + last,
--    so older code, admin and exports keep working); phone becomes optional.
-- 2. enquiry_type accepts the two new services (Data Protection Training,
--    Not Sure Yet). The old values stay valid for existing rows.
-- 3. Buttons on the Managed Legal Services, Virtual DPO and Ad hoc pages
--    link straight to their service on the form (/contact?service=…). Only
--    links that are still exactly "/contact" are changed.
--
-- APPLY THIS FIRST, THEN DEPLOY. The new form stores the new columns and
-- the new enquiry types. Before the deploy, the live form keeps working:
-- every new column has a default, and the old enquiry types still pass.
-- The ?service= links just open the old form until then.
-- ============================================================================

-- 1. Columns -----------------------------------------------------------------
alter table public.contact_submissions
  add column if not exists first_name       text not null default '',
  add column if not exists last_name        text not null default '',
  add column if not exists job_title        text not null default '',
  add column if not exists company_size     text not null default '',
  add column if not exists sector           text not null default '',
  add column if not exists service_details  jsonb not null default '[]'::jsonb,
  add column if not exists heard_about      text not null default '',
  add column if not exists privacy_agreed   boolean not null default false,
  add column if not exists marketing_opt_in boolean not null default false;

alter table public.contact_submissions alter column phone set default '';

alter table public.contact_submissions
  drop constraint if exists contact_submissions_service_details_is_array;
alter table public.contact_submissions
  add constraint contact_submissions_service_details_is_array
  check (jsonb_typeof(service_details) = 'array');

comment on column public.contact_submissions.service_details is
  'Follow-up answers for the chosen service, as [{"question": "...", "answer": "..."}] in display order.';
comment on column public.contact_submissions.privacy_agreed is
  'The enquirer confirmed the privacy notice checkbox (required by the form).';
comment on column public.contact_submissions.marketing_opt_in is
  'The enquirer ticked the optional box to receive news and insights by email. Unticked by default.';

-- 2. Enquiry types -----------------------------------------------------------
alter table public.contact_submissions drop constraint if exists contact_submissions_enquiry_type_check;
alter table public.contact_submissions
  add constraint contact_submissions_enquiry_type_check
  check (enquiry_type in (
    'Managed Legal Services',
    'Virtual Data Protection Officer',
    'Data Protection Training',
    'Ad Hoc Work',
    'Not Sure Yet',
    'General Enquiry'
  ));

-- 3. Service links -----------------------------------------------------------
-- Replaces only exact "/contact" link values inside each section's JSON
-- (button links, tier buttons, card links), so edited links are left alone.
update public.page_sections s
  set content = replace(s.content::text, '"/contact"', '"/contact?service=mls"')::jsonb
  from public.pages p
  where p.id = s.page_id and p.page_type = 'program' and p.slug = 'subscription-model'
    and s.content::text like '%"/contact"%';

update public.page_sections s
  set content = replace(s.content::text, '"/contact"', '"/contact?service=adhoc"')::jsonb
  from public.pages p
  where p.id = s.page_id and p.page_type = 'program' and p.slug = 'ad-hoc-work'
    and s.content::text like '%"/contact"%';

-- Virtual DPO: the data protection training callout goes to training…
update public.page_sections s
  set content = replace(s.content::text, '"/contact"', '"/contact?service=training"')::jsonb
  from public.pages p
  where p.id = s.page_id and p.page_type = 'program' and p.slug = 'virtual-data-protection-officer'
    and s.section_type = 'callout'
    and s.content::text like '%"/contact"%';

-- …and everything else on the page to Virtual DPO.
update public.page_sections s
  set content = replace(s.content::text, '"/contact"', '"/contact?service=vdpo"')::jsonb
  from public.pages p
  where p.id = s.page_id and p.page_type = 'program' and p.slug = 'virtual-data-protection-officer'
    and s.section_type <> 'callout'
    and s.content::text like '%"/contact"%';
