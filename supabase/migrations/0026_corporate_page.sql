-- ============================================================================
-- 0026_corporate_page.sql
-- Corporate service page rebuilt to the approved wireframe (October 2026).
--
-- Sets the page intro and replaces its sections with the wireframe's — only
-- if the page still has its original seeded single text section.
--
-- No new section types or columns (the Text + Checklist button, note link
-- and dividers are optional JSON fields), so this can be applied before or
-- after the code deploys. Before, the button/note simply don't show yet.
-- ============================================================================

update public.pages
  set intro = 'Structuring, governance and transactions, approached with commercial understanding.'
  where page_type = 'service' and slug = 'corporate' and intro is null;

do $$
declare
  v_page_id uuid;
begin
  select id into v_page_id from public.pages
    where page_type = 'service' and slug = 'corporate';
  if v_page_id is null then
    raise notice 'Corporate page not found — skipping';
    return;
  end if;

  if (select count(*) from public.page_sections where page_id = v_page_id) <> 1
     or not exists (
       select 1 from public.page_sections
       where page_id = v_page_id and section_type = 'text'
         and content->>'body' like '<p>From company formation through to governance and shareholder matter%'
     ) then
    raise notice 'Corporate sections have been edited — leaving them as they are';
    return;
  end if;

  delete from public.page_sections where page_id = v_page_id;

  insert into public.page_sections (page_id, section_type, background, content, sort_order)
  values
    (v_page_id, 'text_checklist', 'none', $json${
      "body": "From company formation through to governance and shareholder matters, we support founders and boards with corporate legal work that keeps pace with a growing business.",
      "button_label": "Talk to us about corporate",
      "button_href": "/contact",
      "note": "Need ongoing support? See",
      "note_link_label": "Managed Legal Services",
      "note_link_href": "/how-we-work/subscription-model",
      "list_label": "Ways we can help",
      "items": [
        "Company formation and group structuring",
        "Shareholders' agreements and cap table matters",
        "Corporate governance and board support",
        "Investment and funding round documentation"
      ],
      "divided": true
    }$json$::jsonb, 0),

    (v_page_id, 'cta', 'none', $json${
      "eyebrow": "",
      "heading": "Making important decisions about your business?",
      "body": "Tell us what you're planning, and we'll discuss how we can help.",
      "style": "dark",
      "button_label": "Discuss your needs",
      "button_href": "/contact",
      "secondary_button_label": "",
      "secondary_button_href": ""
    }$json$::jsonb, 1);
end $$;
