-- ============================================================================
-- 0020_homepage_redesign.sql
-- Homepage rebuilt to the client-approved mockup (October 2026).
--
-- 1. Allows three new section types: hero, issues, features.
-- 2. Replaces the homepage's sections with the mockup's structure and copy.
-- 3. Updates the six practice-area summaries to the mockup wording — only
--    where the summary is still the original seeded text, so any edits
--    staff have made since are left alone.
--
-- DEPLOY ORDER: ship the application code first, then apply this. Older
-- code doesn't know hero/issues/features and silently skips those rows,
-- which would leave the live homepage missing its top half.
--
-- Images are deliberately left null — upload them in /admin/pages → Homepage
-- (hero, issues and founder sections). The brand circle placeholder shows
-- until then.
-- ============================================================================

alter table public.page_sections
  drop constraint page_sections_section_type_check;

alter table public.page_sections
  add constraint page_sections_section_type_check
  check (section_type in (
    'hero', 'text', 'media', 'media_text', 'cta', 'tiers',
    'services_grid', 'programs_highlight', 'testimonials', 'blog_teaser',
    'issues', 'features'
  ));

do $$
declare
  v_home_id uuid;
begin
  select id into v_home_id from public.pages where page_type = 'home';
  if v_home_id is null then
    raise exception 'Homepage row not found';
  end if;

  delete from public.page_sections where page_id = v_home_id;

  insert into public.page_sections (page_id, section_type, background, content, sort_order)
  values
    (v_home_id, 'hero', 'tint', $json${
      "heading": "Your outsourced commercial legal team for ambitious businesses.",
      "lead": "Helping you grow, close deals faster and reduce risk, with the confidence of an in-house legal function without the cost.",
      "image_url": null,
      "image_alt": "",
      "cards": [
        {
          "eyebrow": "Subscription",
          "title": "Managed Legal Services",
          "summary": "Your outsourced, embedded commercial legal team.",
          "points": [
            "Ideal if you're growing and don't have in-house legal",
            "Senior expertise without a full-time hire"
          ],
          "button_label": "Learn more",
          "button_href": "/how-we-work/subscription-model",
          "wide": false
        },
        {
          "eyebrow": "Subscription",
          "title": "Virtual Data Protection Officer",
          "summary": "Practical data protection advice that supports growth, not bureaucracy.",
          "points": [
            "Protect your reputation as well as your business",
            "Help identify gaps before they are urgent"
          ],
          "button_label": "Learn more",
          "button_href": "/how-we-work/virtual-data-protection-officer",
          "wide": false
        },
        {
          "eyebrow": "No subscription needed",
          "title": "Data protection training",
          "summary": "Practical training that gives your team the confidence to handle personal data properly, delivered virtually or in person.",
          "points": [],
          "button_label": "Get in touch",
          "button_href": "/contact",
          "wide": true
        }
      ],
      "footnote": "Need help with a one-off matter? We also take on ad hoc work.",
      "footnote_link_label": "Learn more",
      "footnote_link_href": "/how-we-work/ad-hoc-work"
    }$json$::jsonb, 0),

    (v_home_id, 'services_grid', 'tint', $json${
      "eyebrow": "Areas we cover",
      "heading": "Legal support in the areas that matter to growing businesses.",
      "intro": ""
    }$json$::jsonb, 1),

    (v_home_id, 'issues', 'none', $json${
      "eyebrow": "How we help",
      "heading": "Legal issues we help you resolve.",
      "image_url": null,
      "image_alt": "",
      "primary_items": [
        "A client pushing back on your contract",
        "Their lawyers on the call. Not yours.",
        "A client who won't pay"
      ],
      "secondary_items": [
        "A Subject Access Request",
        "A customer asking for a DPA",
        "Investors asking about compliance"
      ],
      "tagline": "For deals that keep moving, cash flow that's protected and compliance that stands up",
      "button_label": "Talk to us",
      "button_href": "/contact"
    }$json$::jsonb, 2),

    (v_home_id, 'features', 'none', $json${
      "eyebrow": "Why Iconos",
      "heading": "We're business enablers, not blockers.",
      "intro": "A friendly, SRA-regulated team that works as part of yours.",
      "style": "dark",
      "items": [
        { "title": "Your risk, your call", "body": "We set out the options and implications, and only dig in when it really matters." },
        { "title": "Part of your team", "body": "We've worked on the sales side, so we help enable your team to close deals, not stall them." },
        { "title": "We speak tech", "body": "Years inside global tech businesses, so SaaS, licensing, IP and AI are second nature." },
        { "title": "GDPR, simplified", "body": "Practical data protection advice on a fixed monthly subscription, without the bureaucracy." }
      ]
    }$json$::jsonb, 3),

    (v_home_id, 'media_text', 'none', $json${
      "eyebrow": "Meet the founder",
      "media_type": "image",
      "image_url": null,
      "image_alt": "Erika Moralez-Perez, founder of Iconos Group",
      "video_url": "",
      "layout": "media-left",
      "body": "<blockquote><p>Legal advice should add to your bottom line, not just sit there as a cost centre.</p></blockquote><p><strong>Erika Moralez-Perez</strong><br>Founder, Iconos Group</p><p>A commercially astute corporate and commercial lawyer, Erika spent nearly a decade in commercial roles within IT and software businesses before qualifying as a solicitor.</p>",
      "button_label": "Our story",
      "button_href": "/who-we-are"
    }$json$::jsonb, 4),

    (v_home_id, 'testimonials', 'none', $json${
      "eyebrow": "Trusted by growing businesses",
      "heading": "What our clients say",
      "button_label": "More from our clients",
      "button_href": "/clients"
    }$json$::jsonb, 5),

    (v_home_id, 'blog_teaser', 'tint', $json${
      "eyebrow": "From the blog",
      "heading": "Practical legal insight for growing businesses."
    }$json$::jsonb, 6),

    (v_home_id, 'cta', 'none', $json${
      "eyebrow": "",
      "heading": "Let's make legal work for your business.",
      "body": "Tell us about your business and where you need support. We'll help you find the right approach.",
      "style": "dark",
      "button_label": "Talk to Iconos",
      "button_href": "/contact",
      "secondary_button_label": "",
      "secondary_button_href": ""
    }$json$::jsonb, 7);
end $$;

-- Practice-area summaries (shown in the "Areas we cover" grid and the What
-- We Do pages). Guarded on the old value so staff edits are never clobbered.
update public.pages set summary = 'Structuring, governance and transactions, handled commercially, not just technically.'
  where page_type = 'service' and slug = 'corporate'
    and summary = 'Structuring, governance and transactions handled commercially, not just correctly.';
update public.pages set summary = 'From customer terms to supplier and partner agreements, legal that keeps deals moving.'
  where page_type = 'service' and slug = 'commercial'
    and summary = 'Contracts that help close deals, not stall them.';
update public.pages set summary = 'Practical compliance, building confidence for customers, investors, and partners.'
  where page_type = 'service' and slug = 'data-protection-gdpr'
    and summary = 'Practical compliance, not box-ticking — and the foundation of our Virtual DPO service.';
update public.pages set summary = 'Protecting what makes you different, with strategic advice on trade marks, licensing and ownership.'
  where page_type = 'service' and slug = 'ip'
    and summary = 'Protecting what makes you different.';
update public.pages set summary = 'Employment contracts and policies that keep pace with your growth.'
  where page_type = 'service' and slug = 'employment'
    and summary = 'Clear, fair, low-risk people decisions.';
update public.pages set summary = 'From due diligence to completion, helping you buy, sell, or invest with confidence.'
  where page_type = 'service' and slug = 'mergers-and-acquisitions'
    and summary = 'Deal support from term sheet to close.';
