-- ============================================================================
-- 0028_who_we_are_page.sql
-- Who We Are becomes an editable page, built to the approved wireframe
-- (October 2026).
--
-- 1. Allows 'who-we-are' as an overview page (singleton, fixed URL, header
--    from the page's eyebrow/heading/intro fields, sections below).
-- 2. Creates the page with the wireframe's content, unless it already
--    exists. The founder photo is copied from the homepage's "Meet the
--    founder" section, so there's nothing to upload.
--
-- APPLY AFTER THE CODE DEPLOYS. Until then the site still shows the old
-- static page, and the admin would refuse to save this page (the deployed
-- code doesn't yet accept /who-we-are as an overview).
-- ============================================================================

alter table public.pages drop constraint if exists pages_overview_slug_check;
alter table public.pages
  add constraint pages_overview_slug_check
  check (page_type <> 'overview' or slug in ('how-we-work', 'what-we-do', 'who-we-are'));

do $$
declare
  v_page_id uuid;
  v_founder_image text;
begin
  if exists (select 1 from public.pages where page_type = 'overview' and slug = 'who-we-are') then
    raise notice 'Who We Are page already exists — skipping seed';
    return;
  end if;

  select s.content->>'image_url' into v_founder_image
    from public.page_sections s
    join public.pages p on p.id = s.page_id
    where p.page_type = 'home' and s.section_type = 'media_text'
      and s.content->>'image_url' is not null
    order by s.sort_order
    limit 1;

  insert into public.pages (page_type, parent_section, slug, title, tag, summary, body, meta_description, status, sort_order)
  values (
    'overview', null, 'who-we-are',
    'Part of your team, not just your legal adviser.',
    'Who we are',
    'We combine legal expertise with real commercial experience, working alongside your business to deliver practical advice that adds value.',
    '',
    'Iconos Group combines legal expertise with real commercial experience. Founded by Erika Moralez-Perez, we work alongside your business to deliver practical advice that adds value.',
    'published', 0
  )
  returning id into v_page_id;

  insert into public.page_sections (page_id, section_type, background, content, sort_order)
  values
    (v_page_id, 'text_checklist', 'none', $json${
      "body": "We work alongside sales teams, business leaders and boards to identify risks, unlock opportunities and improve profitability. Our advice is practical, commercially focused and designed to add value, not just cost.",
      "button_label": "",
      "button_href": "",
      "note": "",
      "note_link_label": "",
      "note_link_href": "",
      "note_after": "",
      "list_label": "Who we help",
      "items": [
        "Growing UK and international businesses",
        "SaaS and technology companies",
        "EdTech and training providers",
        "Marketing and creative agencies",
        "Estate agents and wellness businesses"
      ],
      "divided": false
    }$json$::jsonb, 0),

    (v_page_id, 'media_text', 'tint',
      jsonb_set($json${
        "eyebrow": "Our founder",
        "media_type": "image",
        "image_url": null,
        "image_alt": "Erika Moralez-Perez, founder of Iconos Group",
        "video_url": "",
        "body": "<h2>Erika Moralez-Perez</h2><p>Erika combines legal expertise with first-hand commercial experience, having spent nearly a decade in IT and software businesses before qualifying as a solicitor.</p><p>Having seen business from both sides, she understands the pressures leaders face and how legal advice can support better commercial decisions.</p><p>She has built a team of experienced, qualified lawyers who share her practical, commercially minded approach, supported by a dedicated operations team who look after account management and client service.</p><blockquote><p>Legal advice should add to your bottom line, not just sit there as a cost centre.</p></blockquote>",
        "layout": "media-left",
        "button_label": "",
        "button_href": ""
      }$json$::jsonb, '{image_url}', coalesce(to_jsonb(v_founder_image), 'null'::jsonb)), 1),

    (v_page_id, 'steps', 'tint', $json${
      "eyebrow": "What we believe",
      "heading": "Business enablers, not sales prevention.",
      "intro": "",
      "numbered": false,
      "columns": 4,
      "items": [
        { "title": "Your decisions, clearly informed", "body": "We set out the options and implications, and only dig in when it really matters." },
        { "title": "Part of your team", "body": "We work alongside your sales and leadership teams, not at arm's length." },
        { "title": "Commercially minded", "body": "We understand the business objective and find a practical way forward." },
        { "title": "Plain English, always", "body": "Clear advice you can act on, without the jargon." }
      ]
    }$json$::jsonb, 2),

    (v_page_id, 'cta', 'none', $json${
      "eyebrow": "",
      "heading": "Want to see how we work with businesses like yours?",
      "body": "Explore how we help businesses turn legal challenges into commercial opportunities.",
      "style": "dark",
      "button_label": "See how we work",
      "button_href": "/how-we-work",
      "secondary_button_label": "",
      "secondary_button_href": ""
    }$json$::jsonb, 3);
end $$;
