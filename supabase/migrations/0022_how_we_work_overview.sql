-- ============================================================================
-- 0022_how_we_work_overview.sql
-- How We Work page rebuilt to the approved mockup (October 2026) and made
-- editable in /admin/pages, like the homepage.
--
-- 1. New page_type 'overview': one singleton per section, keyed by slug
--    ('how-we-work' / 'what-we-do'), parent_section null — so the existing
--    "child pages of a section" queries (nav dropdowns, program/service
--    grids, [slug] routes) never pick it up.
-- 2. New section type 'steps' (numbered process cards).
-- 3. Seeds the How We Work overview with the mockup's content.
-- 4. Updates the three program cards' tag/summary (and the ad hoc title) to
--    the mockup wording — only where still the original seeded text.
--
-- DEPLOY ORDER: ship the code first, then apply this. The new code falls
-- back to the old static layout until this page row exists; the old code
-- doesn't know the 'overview' type.
-- ============================================================================

-- 1. Page type ---------------------------------------------------------------
alter table public.pages drop constraint pages_page_type_check;
alter table public.pages
  add constraint pages_page_type_check
  check (page_type in ('service', 'program', 'custom', 'home', 'overview'));

alter table public.pages drop constraint pages_parent_section_matches_type;
alter table public.pages
  add constraint pages_parent_section_matches_type
  check (
    (page_type in ('service', 'program') and parent_section is not null)
    or (page_type in ('custom', 'home', 'overview') and parent_section is null)
  );

alter table public.pages
  add constraint pages_overview_slug_check
  check (page_type <> 'overview' or slug in ('how-we-work', 'what-we-do'));

create unique index pages_overview_slug_unique
  on public.pages (slug)
  where page_type = 'overview';

-- 2. Section type ------------------------------------------------------------
alter table public.page_sections drop constraint page_sections_section_type_check;
alter table public.page_sections
  add constraint page_sections_section_type_check
  check (section_type in (
    'hero', 'text', 'media', 'media_text', 'cta', 'tiers',
    'services_grid', 'programs_highlight', 'testimonials', 'blog_teaser',
    'issues', 'features', 'steps'
  ));

-- 3. How We Work overview ----------------------------------------------------
do $$
declare
  v_page_id uuid;
begin
  if exists (select 1 from public.pages where page_type = 'overview' and slug = 'how-we-work') then
    raise notice 'How We Work overview already exists — skipping seed';
    return;
  end if;

  insert into public.pages (page_type, parent_section, slug, title, tag, summary, body, meta_description, status, sort_order)
  values (
    'overview', null, 'how-we-work',
    'Fixed fees. No surprise invoices.',
    'How we work',
    'Our subscriptions offer one predictable monthly cost, with most ad hoc work agreed at a fixed fee. So you can get the advice you need early, before small issues become costly problems.',
    '',
    'Fixed-fee commercial legal support: Managed Legal Services and Virtual DPO subscriptions, plus ad hoc work agreed at a fixed fee. No surprise invoices.',
    'published', 0
  )
  returning id into v_page_id;

  insert into public.page_sections (page_id, section_type, background, content, sort_order)
  values
    (v_page_id, 'programs_highlight', 'none', $json${
      "eyebrow": "Ways to work with us",
      "heading": "Choose the support that fits."
    }$json$::jsonb, 0),

    (v_page_id, 'steps', 'tint', $json${
      "eyebrow": "Getting started",
      "heading": "Getting started is simple. Staying supported is easy.",
      "intro": "",
      "items": [
        { "title": "An initial conversation", "body": "We get to know your business, your goals and how much risk you're comfortable with." },
        { "title": "A clear proposal", "body": "We recommend the right service and level, with a fixed fee agreed up front." },
        { "title": "We get to work", "body": "We review what you already have, fill the gaps and become part of your team." },
        { "title": "Ongoing support", "body": "Quick answers and regular contact, so legal keeps pace as you grow." }
      ]
    }$json$::jsonb, 1),

    (v_page_id, 'cta', 'none', $json${
      "eyebrow": "",
      "heading": "Let's find the right legal support for your business.",
      "body": "Tell us what you need and we'll help you find the right approach.",
      "style": "dark",
      "button_label": "Discuss your requirements",
      "button_href": "/contact",
      "secondary_button_label": "",
      "secondary_button_href": ""
    }$json$::jsonb, 2);
end $$;

-- 4. Program cards (guarded on the original seeded values) --------------------
update public.pages
  set summary = 'Your outsourced, embedded commercial legal team, for one fixed monthly fee.'
  where page_type = 'program' and slug = 'subscription-model'
    and summary = 'One fixed monthly cost. No surprise invoices.';

update public.pages
  set tag = 'Subscription · Three tiers'
  where page_type = 'program' and slug = 'virtual-data-protection-officer'
    and tag = 'Three tiers';
update public.pages
  set summary = 'Essential, Growth or Managed data protection support, on a fixed monthly subscription.'
  where page_type = 'program' and slug = 'virtual-data-protection-officer'
    and summary = 'Outsourced DPO support so you stay compliant without hiring in-house.';

update public.pages
  set title = 'Ad hoc work'
  where page_type = 'program' and slug = 'ad-hoc-work'
    and title = 'Ad Hoc / One-Off Work';
update public.pages
  set tag = 'No subscription'
  where page_type = 'program' and slug = 'ad-hoc-work'
    and tag = 'No subscription required';
update public.pages
  set summary = 'Support for a single matter, usually at a fixed fee, without an ongoing commitment.'
  where page_type = 'program' and slug = 'ad-hoc-work'
    and summary = 'Support for a single matter, without committing to an ongoing arrangement.';
