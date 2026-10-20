-- ============================================================================
-- 0024_vdpo_page.sql
-- Virtual Data Protection Officer page rebuilt to the approved mockup
-- (October 2026).
--
-- 1. New section type: callout (outlined feature panel with side boxes).
--    Tier sections gain optional price / features / button fields and the
--    spotlight gains placeholder + text fields — both are JSON content
--    changes with defaults, so no schema change is needed for them.
-- 2. Sets the VDPO intro and replaces its sections with the mockup's — only
--    if the page still has its original seeded text + tiers sections. Tiers
--    renamed Essential / Growth / Managed per the mockup (descriptions
--    unchanged).
-- 3. Points the homepage "Data protection training" card at the new
--    training panel, if that card still has its original link.
--
-- PLACEHOLDERS to replace before launch: tier prices "[£ price]", Growth and
-- Managed "[Inclusion]" items, and the testimonial placeholder box.
--
-- DEPLOY ORDER: ship the code first, then apply this.
-- ============================================================================

-- 1. Section types -----------------------------------------------------------
alter table public.page_sections drop constraint page_sections_section_type_check;
alter table public.page_sections
  add constraint page_sections_section_type_check
  check (section_type in (
    'hero', 'text', 'media', 'media_text', 'cta', 'tiers',
    'services_grid', 'programs_highlight', 'testimonials', 'blog_teaser',
    'issues', 'features', 'steps',
    'text_checklist', 'comparison', 'testimonial_spotlight', 'callout'
  ));

-- 2. VDPO content ------------------------------------------------------------
update public.pages
  set intro = 'We take data protection off your plate, reducing regulatory and reputational risk, so your leadership team can focus on growing the business.'
  where page_type = 'program' and slug = 'virtual-data-protection-officer' and intro is null;

do $$
declare
  v_page_id uuid;
begin
  select id into v_page_id from public.pages
    where page_type = 'program' and slug = 'virtual-data-protection-officer';
  if v_page_id is null then
    raise notice 'VDPO page not found — skipping';
    return;
  end if;

  if (select count(*) from public.page_sections where page_id = v_page_id) <> 2
     or not exists (
       select 1 from public.page_sections
       where page_id = v_page_id and section_type = 'text'
         and content->>'body' like '<p>Data protection compliance without a full-time hire%'
     )
     or not exists (
       select 1 from public.page_sections
       where page_id = v_page_id and section_type = 'tiers'
         and content->'tiers'->1->>'name' = 'Standard'
     ) then
    raise notice 'VDPO sections have been edited — leaving them as they are';
    return;
  end if;

  delete from public.page_sections where page_id = v_page_id;

  insert into public.page_sections (page_id, section_type, background, content, sort_order)
  values
    (v_page_id, 'text_checklist', 'none', $json${
      "body": "As your dedicated virtual DPO, we take ownership of Subject Access Requests, policies and day-to-day data protection issues. We translate the requirements into clear, practical actions, so you don't need to become the expert.",
      "list_label": "Ideal if",
      "items": [
        "There's no time to become an expert",
        "Customers or investors need you to demonstrate you're compliant",
        "You recognise data protection is essential, not a nice to have"
      ]
    }$json$::jsonb, 0),

    (v_page_id, 'steps', 'tint', $json${
      "eyebrow": "What you get",
      "heading": "Compliance that supports growth without bureaucracy.",
      "intro": "",
      "numbered": false,
      "columns": 3,
      "items": [
        { "title": "We handle the detail", "body": "From SARs to policies, we handle data protection so you can focus on your business." },
        { "title": "Know where you stand", "body": "Clear, practical actions, with board-ready reporting that gives leadership confidence." },
        { "title": "Proactive, not reactive", "body": "Ongoing support spots gaps early, before they become urgent." },
        { "title": "Ready when customers ask", "body": "Strong documentation means DPAs and due diligence requests don't hold up deals." },
        { "title": "Investment and acquisition ready", "body": "A documented compliance programme strengthens your position in due diligence." },
        { "title": "Tech-savvy support", "body": "Software sector experience, with a real understanding of AI, SaaS and technology sales." }
      ]
    }$json$::jsonb, 1),

    (v_page_id, 'comparison', 'none', $json${
      "eyebrow": "Why a virtual DPO?",
      "heading": "A dedicated DPO, without the hire.",
      "left": {
        "title": "Managing it yourselves",
        "items": [
          "Senior time spent on data protection",
          "Policies that drift out of date",
          "Reacting when something goes wrong",
          "Scrambling when customers or investors ask for proof"
        ]
      },
      "right": {
        "title": "Iconos Virtual DPO",
        "items": [
          "We take it off your plate",
          "Ongoing reviews and a consistent, documented approach",
          "Gaps spotted before they become urgent",
          "Documentation ready when you need it"
        ]
      }
    }$json$::jsonb, 2),

    (v_page_id, 'tiers', 'tint', $json${
      "eyebrow": "Three tiers",
      "heading": "The right level of support for your business.",
      "tiers": [
        {
          "name": "Essential",
          "description": "Core DPO oversight for smaller data volumes and lower-risk processing.",
          "price": "[£ price]",
          "price_note": "+ VAT a month",
          "features_intro": "",
          "features": [
            "Privacy policy template",
            "Data protection policy",
            "Data breach response template",
            "Subject Access Request (SAR) template",
            "Monthly data protection newsletter"
          ],
          "button_label": "Ask about Essential",
          "button_href": "/contact"
        },
        {
          "name": "Growth",
          "description": "Regular reviews and hands-on support for growing data processing needs.",
          "price": "[£ price]",
          "price_note": "+ VAT a month",
          "features_intro": "Everything in Essential, plus:",
          "features": ["[Inclusion 1]", "[Inclusion 2]", "[Inclusion 3]", "[Inclusion 4]"],
          "button_label": "Ask about Growth",
          "button_href": "/contact"
        },
        {
          "name": "Managed",
          "description": "A full DPO service for complex or higher-risk processing at scale.",
          "price": "[£ price]",
          "price_note": "+ VAT a month",
          "features_intro": "Everything in Growth, plus:",
          "features": ["[Inclusion 1]", "[Inclusion 2]", "[Inclusion 3]", "[Inclusion 4]"],
          "button_label": "Ask about Managed",
          "button_href": "/contact"
        }
      ]
    }$json$::jsonb, 3),

    (v_page_id, 'callout', 'none', $json${
      "anchor": "data-protection-training",
      "badge": "No subscription needed",
      "heading": "Data protection training",
      "body": "Practical training that helps your people understand their responsibilities and handle personal data with confidence. Available as a one-off session, an annual programme or as part of a vDPO subscription.",
      "note": "As light touch or in depth as your business requires, tailored to the team being trained.",
      "button_label": "Ask about training",
      "button_href": "/contact",
      "boxes": [
        {
          "label": "Delivered your way",
          "items": [
            "Virtually or in person at your offices",
            "In one session or split over several days for larger teams",
            "Bespoke to fit your business, systems or processes"
          ],
          "text": ""
        },
        {
          "label": "Pricing",
          "items": [],
          "text": "Each package is quoted individually, depending on the number of attendees, how many sessions are needed and whether it's delivered virtually or in person. You'll know the price before we start."
        }
      ]
    }$json$::jsonb, 4),

    (v_page_id, 'testimonial_spotlight', 'none', $json${
      "testimonial_id": null,
      "placeholder_text": "[vDPO client testimonial, to follow]",
      "text": "Not sure which level you need? We'll help you find the right level of data protection support for your business.",
      "button_label": "Discuss your requirements",
      "button_href": "/contact"
    }$json$::jsonb, 5),

    (v_page_id, 'cta', 'none', $json${
      "eyebrow": "",
      "heading": "Ready to simplify data protection?",
      "body": "Let's discuss your needs and find the right support for your business.",
      "style": "dark",
      "button_label": "Talk to Iconos",
      "button_href": "/contact",
      "secondary_button_label": "",
      "secondary_button_href": ""
    }$json$::jsonb, 6);
end $$;

-- 3. Homepage training card → the new training panel -------------------------
update public.page_sections s
  set content = jsonb_set(
    jsonb_set(s.content, '{cards,2,button_label}', '"Learn more"'),
    '{cards,2,button_href}', '"/how-we-work/virtual-data-protection-officer#data-protection-training"'
  )
  from public.pages p
  where p.id = s.page_id and p.page_type = 'home'
    and s.section_type = 'hero'
    and s.content->'cards'->2->>'title' = 'Data protection training'
    and s.content->'cards'->2->>'button_href' = '/contact';
