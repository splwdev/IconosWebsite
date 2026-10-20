-- ============================================================================
-- 0023_managed_legal_services_page.sql
-- Managed Legal Services page rebuilt to the approved mockup (October 2026).
--
-- 1. pages.intro: optional header paragraph for service/program pages, so
--    the page header can differ from the short summary used on cards.
-- 2. New section types: text_checklist, comparison, testimonial_spotlight.
-- 3. Sets the Managed Legal Services intro and replaces its sections with
--    the mockup's — only if the page still has its original seeded single
--    text section (any staff edits are left alone).
--
-- DEPLOY ORDER: ship the code first, then apply this (old code doesn't know
-- the new section types and would skip them).
-- ============================================================================

-- 1. Intro column ------------------------------------------------------------
alter table public.pages add column if not exists intro text;

comment on column public.pages.intro is
  'Optional header paragraph for service/program pages. When null the page header shows summary (which is also used on cards and in search results).';

-- 2. Section types -----------------------------------------------------------
alter table public.page_sections drop constraint page_sections_section_type_check;
alter table public.page_sections
  add constraint page_sections_section_type_check
  check (section_type in (
    'hero', 'text', 'media', 'media_text', 'cta', 'tiers',
    'services_grid', 'programs_highlight', 'testimonials', 'blog_teaser',
    'issues', 'features', 'steps',
    'text_checklist', 'comparison', 'testimonial_spotlight'
  ));

-- 3. Managed Legal Services content -----------------------------------------
update public.pages
  set intro = 'Turn legal challenges into business opportunities with outsourced legal support tailored to your business, for one predictable monthly fee.'
  where page_type = 'program' and slug = 'subscription-model' and intro is null;

do $$
declare
  v_page_id uuid;
  v_testimonial_id uuid;
begin
  select id into v_page_id from public.pages
    where page_type = 'program' and slug = 'subscription-model';
  if v_page_id is null then
    raise notice 'Managed Legal Services page not found — skipping';
    return;
  end if;

  -- Only replace the original seeded content.
  if (select count(*) from public.page_sections where page_id = v_page_id) <> 1
     or not exists (
       select 1 from public.page_sections
       where page_id = v_page_id and section_type = 'text'
         and content->>'body' like '<p>Ongoing embedded legal support across corporate, commercial and employment matters%'
     ) then
    raise notice 'Managed Legal Services sections have been edited — leaving them as they are';
    return;
  end if;

  -- Looked up by name, not a hard-coded id.
  select id into v_testimonial_id from public.testimonials
    where attribution = 'Darren Chalmers-Stevens' order by sort_order limit 1;

  delete from public.page_sections where page_id = v_page_id;

  insert into public.page_sections (page_id, section_type, background, content, sort_order)
  values
    (v_page_id, 'text_checklist', 'none', $json${
      "body": "Ongoing, embedded legal support across your contracts, corporate matters, IP, employment and more, scaled to the size of your business. Start from as little as one hour a month, see the value, and add time as you grow.",
      "list_label": "Ideal if",
      "items": [
        "You're growing and don't have in-house legal",
        "You want senior expertise without a full-time hire",
        "Your in-house lawyer needs a team behind them"
      ]
    }$json$::jsonb, 0),

    (v_page_id, 'steps', 'tint', $json${
      "eyebrow": "What you get",
      "heading": "Legal that helps you grow, not slows you down.",
      "intro": "",
      "numbered": false,
      "columns": 3,
      "items": [
        { "title": "Deals that keep moving", "body": "Contract issues resolved quickly, so legal never becomes a sales bottleneck." },
        { "title": "Commercial, not just legal", "body": "We understand the business objective and find a practical way forward." },
        { "title": "Stronger foundations", "body": "We spot contract gaps, improve consistency and put repeatable processes in place." },
        { "title": "Tech-savvy support", "body": "We understand SaaS, licensing, AI and the realities of technology businesses." },
        { "title": "Less on your plate", "body": "We take the legal burden off your leadership team, so you can focus on growth." },
        { "title": "On hand when you need us", "body": "As part of your team, you can ask early, before a small question becomes a big problem." }
      ]
    }$json$::jsonb, 1),

    (v_page_id, 'comparison', 'none', $json${
      "eyebrow": "Why not hire in-house?",
      "heading": "A whole legal team, without the overheads of a hire.",
      "left": {
        "title": "An in-house hire",
        "items": [
          "Salary, pension contributions and recruitment costs",
          "Holiday and sick pay, with no cover while they're away",
          "One person's experience",
          "A fixed headcount, whatever your workload"
        ]
      },
      "right": {
        "title": "Iconos Managed Legal Services",
        "items": [
          "One fixed monthly fee",
          "A whole team, so there's always cover",
          "Senior expertise across commercial, corporate, IP, employment and data protection",
          "Add time as your needs change"
        ]
      }
    }$json$::jsonb, 2),

    (v_page_id, 'testimonial_spotlight', 'none',
      jsonb_build_object(
        'testimonial_id', v_testimonial_id,
        'button_label', 'Ask about Managed Legal Services',
        'button_href', '/contact'
      ), 3),

    (v_page_id, 'cta', 'none', $json${
      "eyebrow": "",
      "heading": "Ready for legal support that grows with your business?",
      "body": "Let's discuss your business, your priorities, and the right level of ongoing support.",
      "style": "dark",
      "button_label": "Discuss your requirements",
      "button_href": "/contact",
      "secondary_button_label": "",
      "secondary_button_href": ""
    }$json$::jsonb, 4);
end $$;
