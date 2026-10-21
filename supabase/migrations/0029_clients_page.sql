-- ============================================================================
-- 0029_clients_page.sql
-- Clients page rebuilt to the approved wireframe (October 2026), and made
-- editable.
--
-- 1. Testimonials get three optional fields for the Clients page:
--      headline          bold line above the quote
--      full_quote        longer version (the short `quote` stays on the
--                        homepage, and is used when this is blank)
--      show_on_homepage  homepage shows only these; Clients shows all
-- 2. Fills in headline and full quote for the three existing testimonials
--    (only where still blank), and adds the three further testimonials from
--    the wireframe (only if not already there), hidden from the homepage.
--    Quotes are worded as on Iconos's current website.
-- 3. Allows 'clients' as an overview page and creates it: header from the
--    page fields, then the testimonials ("All published") and a dark CTA.
--
-- APPLY THIS FIRST, THEN DEPLOY. The new code reads the new testimonial
-- columns and would get no testimonials back without them. Before the
-- deploy, the currently live code simply ignores everything here (new
-- testimonials would briefly join the homepage's three — run this just
-- before merging).
-- ============================================================================

-- 1. Columns -----------------------------------------------------------------
alter table public.testimonials add column if not exists headline text not null default '';
alter table public.testimonials add column if not exists full_quote text not null default '';
alter table public.testimonials add column if not exists show_on_homepage boolean not null default true;

comment on column public.testimonials.headline is
  'Optional bold line above the quote on the Clients page.';
comment on column public.testimonials.full_quote is
  'Optional longer quote for the Clients page. When blank, quote is used.';
comment on column public.testimonials.show_on_homepage is
  'Whether the homepage testimonials section shows this one. The Clients page shows every published testimonial.';

-- 2. Content -----------------------------------------------------------------
update public.testimonials set
  headline = 'An extremely valuable service to our global organisation.',
  full_quote = 'CriticalArc have been working with Erika and her team for a number of years, Iconos provide an extremely valuable service to our global organisation. As our in-house (virtual) counsel, Erika supports a range of critical functions to include, contract management, compliance, governance, registration of entities, data privacy, trademarks, IP protection to name a few core functions across our ever expanding international operations. As a trusted advisor we also enjoy the opportunity to seek Iconos expert advice acting as a sounding board for matters that businesses wouldn''t normally seek external legal advice for, delivering maximum value.'
  where attribution = 'Darren Chalmers-Stevens' and headline = '' and full_quote = '';

update public.testimonials set
  headline = 'Commercial and flexible in their approach.',
  full_quote = 'Iconos Group were recommended to us when we set up our consultancy specialising in all aspects of residential lettings compliance, audits, due diligence, and risk management. We needed a set of terms and conditions, including a data processing agreement. They understood our requirements straightaway and were commercial and flexible in their approach.'
  where attribution = 'Ben Stokes' and headline = '' and full_quote = '';

update public.testimonials set
  headline = 'We closed the deal smoothly and with confidence.',
  full_quote = 'The Iconos legal team provided unwavering support during the sale of High Performance Learning, helping navigate the complexities of the due diligence process and providing clear and strategic guidance throughout. Thanks to their deep understanding of both the legal and commercial landscape, we closed the deal smoothly and with confidence. I would like to thank the team for all their hard work, patience and good humour, which were much appreciated.'
  where attribution = 'Professor Deborah Eyre' and headline = '' and full_quote = '';

insert into public.testimonials (quote, attribution, role, headline, full_quote, show_on_homepage, status, sort_order)
select v.quote, v.attribution, v.role, v.headline, v.full_quote, false, 'published', v.sort_order
from (values
  (
    'Erika at Iconos Group has been acting as in-house counsel and consultant to the Board, ensuring all the directors have peace of mind.',
    'Kevin Brownell',
    'Director, Nuxform',
    'Ensuring all the directors have peace of mind.',
    'Erika at Iconos Group has been acting as in-house counsel and consultant to the Board, guiding us through difficult shareholder matters and helping us set up sound practices for our relaunched business, including IP, contractual agreements with staff and customers, and T&C’s, ensuring all the directors have peace of mind.',
    3
  ),
  (
    'We have had record attendance for such a training course.',
    'Commercial Director',
    'Leading technology platform provider',
    'Record attendance for such a training course.',
    'I would just like to say many thanks and well done for the delivery of the Data Protection training that you have carried out over the last few months. We have had record attendance for such a training course. The interaction from my colleagues has been really positive and they were certainly engaged and that is down to the way in which you delivered the training to retain their attention and focus. I am sure they are now all better aware of the importance of Data Protection, the impact it has in their day-to-day roles/activity and how they can improve which ultimately better protect the company.',
    4
  ),
  (
    'Our money well spent with you!',
    'Jarmo Kesanto',
    'Director, 24 Laundrette UK Ltd',
    '',
    '',
    5
  )
) as v(quote, attribution, role, headline, full_quote, sort_order)
where not exists (
  select 1 from public.testimonials t where t.attribution = v.attribution
);

-- 3. Clients page ------------------------------------------------------------
alter table public.pages drop constraint if exists pages_overview_slug_check;
alter table public.pages
  add constraint pages_overview_slug_check
  check (page_type <> 'overview' or slug in ('how-we-work', 'what-we-do', 'who-we-are', 'clients'));

do $$
declare
  v_page_id uuid;
begin
  if exists (select 1 from public.pages where page_type = 'overview' and slug = 'clients') then
    raise notice 'Clients page already exists — skipping seed';
    return;
  end if;

  insert into public.pages (page_type, parent_section, slug, title, tag, summary, body, meta_description, status, sort_order)
  values (
    'overview', null, 'clients',
    'Trusted by growing businesses.',
    'Clients',
    'Hear from the businesses that rely on Iconos for practical, commercially minded legal support.',
    '',
    'What clients say about Iconos Group: practical, commercially minded legal support for growing businesses in the UK and internationally.',
    'published', 0
  )
  returning id into v_page_id;

  insert into public.page_sections (page_id, section_type, background, content, sort_order)
  values
    (v_page_id, 'testimonials', 'tint', $json${
      "eyebrow": "",
      "heading": "",
      "display": "all",
      "button_label": "",
      "button_href": ""
    }$json$::jsonb, 0),

    (v_page_id, 'cta', 'none', $json${
      "eyebrow": "",
      "heading": "Looking for a more commercially minded legal partner?",
      "body": "Tell us about your business and where you need support.",
      "style": "dark",
      "button_label": "Talk to Iconos",
      "button_href": "/contact",
      "secondary_button_label": "",
      "secondary_button_href": ""
    }$json$::jsonb, 1);
end $$;
