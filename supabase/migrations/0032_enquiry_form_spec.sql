-- ============================================================================
-- 0032_enquiry_form_spec.sql
-- Changes from Iconos's enquiry form specification (October 2026).
--
-- 1. Marketing opt-in record: when it was given and the exact wording
--    agreed to, stored with each submission that ticks the box.
-- 2. Confirmation email wording: "Thank you, we've got your enquiry. We'll
--    be in touch within one working day." — only if the saved auto-reply is
--    still the original default. A copy of the enquirer's answers is added
--    underneath by the code.
-- 3. Data Protection and GDPR page buttons pre-select Virtual DPO.
-- 4. Work With Us page buttons point at the form's new address
--    (/work-with-us/enquiry). The old address redirects anyway.
--
-- APPLY THIS FIRST, THEN DEPLOY. The new code stores the opt-in columns.
-- ============================================================================

-- 1. Marketing opt-in record ------------------------------------------------
alter table public.contact_submissions
  add column if not exists marketing_opt_in_at timestamptz,
  add column if not exists marketing_opt_in_wording text not null default '';

comment on column public.contact_submissions.marketing_opt_in_at is
  'When the enquirer ticked the marketing box (null if they did not).';
comment on column public.contact_submissions.marketing_opt_in_wording is
  'The exact marketing tick-box wording they agreed to.';

-- 2. Confirmation email wording -------------------------------------------
update public.site_settings
  set value = jsonb_set(
    value,
    '{autoreply_message}',
    to_jsonb('Thank you, we''ve got your enquiry. We''ll be in touch within one working day.'::text)
  )
  where key = 'contact_form'
    and value->>'autoreply_message' = 'Thanks for getting in touch with Iconos Group. A member of our team will be in touch shortly.';

-- 3. Data Protection and GDPR → Virtual DPO --------------------------------
update public.page_sections s
  set content = replace(s.content::text, '"/contact"', '"/contact?service=vdpo"')::jsonb
  from public.pages p
  where p.id = s.page_id and p.page_type = 'service' and p.slug = 'data-protection-gdpr'
    and s.content::text like '%"/contact"%';

-- 4. Work With Us form's new address ---------------------------------------
update public.page_sections s
  set content = replace(s.content::text, '/work-with-us/get-in-touch', '/work-with-us/enquiry')::jsonb
  from public.pages p
  where p.id = s.page_id and p.page_type = 'overview' and p.slug = 'work-with-us'
    and s.content::text like '%/work-with-us/get-in-touch%';
