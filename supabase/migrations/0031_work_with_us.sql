-- ============================================================================
-- 0031_work_with_us.sql
-- Work With Us page and form, built to the approved wireframes (October 2026).
--
-- 1. contact_submissions: LinkedIn column, and three enquiry types for the
--    Work With Us form (Consultant Lawyer, Referral Partner, Work With Us
--    (Other)), so they land in the same admin inbox as client enquiries.
-- 2. Allows 'work-with-us' as an overview page and creates it from the
--    wireframe: ways to join, why join us, referral partners, dark CTA.
--
-- APPLY THIS FIRST, THEN DEPLOY. The new form stores linkedin_url and the
-- new enquiry types. Nothing here changes what the live site shows until
-- the code deploys (the current /work-with-us page is hard-coded).
-- ============================================================================

-- 1. Submissions -------------------------------------------------------------
alter table public.contact_submissions
  add column if not exists linkedin_url text not null default '';

comment on column public.contact_submissions.linkedin_url is
  'Work With Us form: the enquirer''s LinkedIn address (https://…linkedin.com/…), optional.';

alter table public.contact_submissions drop constraint if exists contact_submissions_enquiry_type_check;
alter table public.contact_submissions
  add constraint contact_submissions_enquiry_type_check
  check (enquiry_type in (
    'Managed Legal Services',
    'Virtual Data Protection Officer',
    'Data Protection Training',
    'Ad Hoc Work',
    'Not Sure Yet',
    'Consultant Lawyer',
    'Referral Partner',
    'Work With Us (Other)',
    'General Enquiry'
  ));

-- 2. Work With Us page -------------------------------------------------------
alter table public.pages drop constraint if exists pages_overview_slug_check;
alter table public.pages
  add constraint pages_overview_slug_check
  check (page_type <> 'overview' or slug in ('how-we-work', 'what-we-do', 'who-we-are', 'clients', 'work-with-us'));

do $$
declare
  v_page_id uuid;
begin
  if exists (select 1 from public.pages where page_type = 'overview' and slug = 'work-with-us') then
    raise notice 'Work With Us page already exists — skipping seed';
    return;
  end if;

  insert into public.pages (page_type, parent_section, slug, title, tag, summary, body, meta_description, status, sort_order)
  values (
    'overview', null, 'work-with-us',
    'Join a commercially minded legal team.',
    'Work with us',
    'We work with experienced consultant lawyers, data protection professionals and like-minded people who believe legal advice should help businesses grow, not slow them down.',
    '',
    'Consultant lawyers, data protection professionals and referral partners: work with Iconos Group, a commercially minded legal team that helps businesses grow.',
    'published', 0
  )
  returning id into v_page_id;

  insert into public.page_sections (page_id, section_type, background, content, sort_order)
  values
    (v_page_id, 'steps', 'none', $json${
      "eyebrow": "Ways to join us",
      "heading": "Whatever the role, a commercial mindset comes first.",
      "intro": "If you're practical, client-focused and believe legal advice should help close deals rather than slow them down, we'd like to hear from you.",
      "numbered": false,
      "columns": 3,
      "card_style": "outlined",
      "items": [
        { "eyebrow": "Consultancy", "title": "Consultant lawyers", "body": "Experienced, qualified lawyers who want to deliver practical, commercially focused legal support to growing businesses." },
        { "eyebrow": "Data protection", "title": "Data protection professionals", "body": "Help growing businesses stay compliant and manage risk through our Virtual DPO service." },
        { "eyebrow": "Employed roles", "title": "Current vacancies", "body": "Explore opportunities to join Iconos as the team grows. There are no open vacancies right now, but we're always happy to hear from people who share our approach." }
      ]
    }$json$::jsonb, 0),

    (v_page_id, 'steps', 'tint', $json${
      "eyebrow": "Why join us",
      "heading": "Work the way you want, with clients you'll enjoy.",
      "intro": "",
      "numbered": false,
      "columns": 4,
      "card_style": "filled",
      "items": [
        { "eyebrow": "", "title": "Flexible working", "body": "Work arrangements that fit around your life." },
        { "eyebrow": "", "title": "Interesting clients", "body": "Support ambitious businesses across a range of sectors." },
        { "eyebrow": "", "title": "Commercial focus", "body": "Deliver advice that helps clients make progress, not just manage risk." },
        { "eyebrow": "", "title": "A supportive team", "body": "Work independently, with a collaborative team behind you." }
      ]
    }$json$::jsonb, 1),

    (v_page_id, 'callout', 'none', $json${
      "layout": "side",
      "eyebrow": "Referral partners",
      "anchor": "referral-partners",
      "badge": "",
      "heading": "Help your clients access the right legal support.",
      "body": "We work with accountants, consultants and other trusted advisers who want to connect their clients with practical, commercially minded legal expertise.",
      "note": "",
      "button_label": "Discuss a referral partnership",
      "button_href": "/work-with-us/enquiry?interest=referral",
      "boxes": []
    }$json$::jsonb, 2),

    (v_page_id, 'cta', 'none', $json${
      "eyebrow": "",
      "heading": "Interested in working with us?",
      "body": "Tell us about your experience and how you'd like to work with Iconos.",
      "style": "dark",
      "button_label": "Start a conversation",
      "button_href": "/work-with-us/enquiry",
      "secondary_button_label": "",
      "secondary_button_href": ""
    }$json$::jsonb, 3);
end $$;
