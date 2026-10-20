-- ============================================================================
-- 0025_ad_hoc_page.sql
-- Ad hoc work page rebuilt to the approved mockup (October 2026).
--
-- 1. pages.heading: optional H1 for service/program pages. The title stays
--    the label used in the nav and on cards ("Ad hoc work"); the page itself
--    can say "Ad hoc legal support".
-- 2. Sets the ad hoc heading and intro, and replaces its sections with the
--    mockup's — only if the page still has its original seeded single text
--    section.
--
-- No new section types (the card grid's final card and the spotlight's
-- heading are optional JSON fields), so this is SAFE TO APPLY BEFORE the
-- code deploys: the deployed code ignores the new fields and column until
-- then.
-- ============================================================================

alter table public.pages add column if not exists heading text;

comment on column public.pages.heading is
  'Optional H1 for service/program pages. When null the page header shows title (which is also the nav and card label).';

update public.pages
  set heading = 'Ad hoc legal support'
  where page_type = 'program' and slug = 'ad-hoc-work' and heading is null;

update public.pages
  set intro = 'Practical legal advice for specific issues, with an agreed fee and no ongoing commitment.'
  where page_type = 'program' and slug = 'ad-hoc-work' and intro is null;

do $$
declare
  v_page_id uuid;
  v_testimonial_id uuid;
begin
  select id into v_page_id from public.pages
    where page_type = 'program' and slug = 'ad-hoc-work';
  if v_page_id is null then
    raise notice 'Ad hoc page not found — skipping';
    return;
  end if;

  if (select count(*) from public.page_sections where page_id = v_page_id) <> 1
     or not exists (
       select 1 from public.page_sections
       where page_id = v_page_id and section_type = 'text'
         and content->>'body' like '<p>Not every business is ready for a subscription%'
     ) then
    raise notice 'Ad hoc sections have been edited — leaving them as they are';
    return;
  end if;

  select id into v_testimonial_id from public.testimonials
    where attribution = 'Ben Stokes' order by sort_order limit 1;

  delete from public.page_sections where page_id = v_page_id;

  insert into public.page_sections (page_id, section_type, background, content, sort_order)
  values
    (v_page_id, 'text_checklist', 'none', $json${
      "body": "Not every business needs ongoing legal support. We provide practical advice on individual matters, usually for a fixed fee, agreed before work begins.",
      "list_label": "What to expect",
      "items": [
        "No ongoing commitment",
        "Clear pricing, agreed before work begins",
        "The same commercial approach as our subscription clients"
      ]
    }$json$::jsonb, 0),

    (v_page_id, 'steps', 'tint', $json${
      "eyebrow": "Typical one-off matters",
      "heading": "Practical help, exactly when you need it.",
      "intro": "",
      "numbered": false,
      "columns": 4,
      "items": [
        { "title": "Commercial leases", "body": "Drafting, reviewing and negotiating leases, for landlords and tenants." },
        { "title": "Shareholders' agreements", "body": "Clear terms between founders and investors, before anything goes wrong." },
        { "title": "Buying, selling and investing", "body": "Acquisitions, business sales and investment, from due diligence to completion." },
        { "title": "Terms and contracts", "body": "Terms and conditions, and consultancy agreements for businesses using contractors." },
        { "title": "Settlement agreements", "body": "Clear, commercial advice when an employment relationship comes to an end." },
        { "title": "Disputes and recovery", "body": "Recovering money you're owed and tackling IP infringement." },
        { "title": "Data breach response", "body": "Fast, practical help when a data protection issue threatens to stop you trading." }
      ],
      "final_card": {
        "title": "Need help with something else?",
        "body": "If it's commercial, corporate or data protection, ask us.",
        "link_label": "Get in touch",
        "link_href": "/contact"
      }
    }$json$::jsonb, 1),

    (v_page_id, 'testimonial_spotlight', 'none',
      jsonb_build_object(
        'testimonial_id', v_testimonial_id,
        'placeholder_text', '',
        'heading', 'Need legal support regularly?',
        'text', 'A subscription could provide more predictable costs and ongoing access to practical legal advice.',
        'button_label', 'Explore subscription support',
        'button_href', '/how-we-work/subscription-model'
      ), 2),

    (v_page_id, 'cta', 'none', $json${
      "eyebrow": "",
      "heading": "Need help with a legal matter?",
      "body": "Tell us what you need help with, and we'll discuss the right approach.",
      "style": "dark",
      "button_label": "Discuss your legal needs",
      "button_href": "/contact",
      "secondary_button_label": "",
      "secondary_button_href": ""
    }$json$::jsonb, 3);
end $$;
