-- ============================================================================
-- 0027_service_pages.sql
-- Commercial, Data Protection and GDPR, Intellectual Property, Employment and
-- Mergers and Acquisitions pages rebuilt to the approved wireframes
-- (October 2026) — same layout as Corporate (0026).
--
-- For each page: sets the intro, and replaces its sections with the
-- wireframe's (Text + Checklist, then a dark CTA) — only if the page still
-- has its original seeded single text section.
--
-- Also renames three titles to the full names used in the wireframes and
-- the homepage "Areas we cover" grid (only if still the original value).
-- Titles are the nav and card labels; URLs (slugs) don't change.
--
-- No new section types or columns, so this can be applied before or after
-- the code deploys. Before, the Data Protection note just won't show the
-- word "service." after its link yet.
-- ============================================================================

update public.pages set title = 'Data Protection and GDPR'
  where page_type = 'service' and slug = 'data-protection-gdpr' and title = 'Data Protection & GDPR';
update public.pages set title = 'Intellectual Property'
  where page_type = 'service' and slug = 'ip' and title = 'IP';
update public.pages set title = 'Mergers and Acquisitions'
  where page_type = 'service' and slug = 'mergers-and-acquisitions' and title = 'Mergers & Acquisitions';

do $$
declare
  r record;
  v_page_id uuid;
begin
  for r in
    select * from jsonb_to_recordset($pages$[
      {
        "slug": "commercial",
        "original_like": "<p>We work alongside your sales team so contracts move at the speed of%",
        "intro": "From customer terms to supplier and partner agreements, practical legal support that protects your interests and keeps business moving.",
        "checklist": {
          "body": "We work alongside your sales team, so contracts move at the speed of the deal and legal never becomes a bottleneck.",
          "button_label": "Talk to us about commercial",
          "button_href": "/contact",
          "note": "Need ongoing support? See",
          "note_link_label": "Managed Legal Services",
          "note_link_href": "/how-we-work/subscription-model",
          "note_after": "",
          "list_label": "Ways we can help",
          "items": [
            "Customer and supplier contracts",
            "Terms of service and SaaS agreements",
            "Partnership and reseller agreements",
            "Contract review turned around fast, in plain English"
          ],
          "divided": true
        },
        "cta": {
          "eyebrow": "",
          "heading": "Need contracts that keep business moving?",
          "body": "Tell us about your commercial legal needs and we'll discuss how we can help.",
          "style": "dark",
          "button_label": "Discuss your needs",
          "button_href": "/contact",
          "secondary_button_label": "",
          "secondary_button_href": ""
        }
      },
      {
        "slug": "data-protection-gdpr",
        "original_like": "<p>Data protection risk builds quietly when nobody owns it day to day.%",
        "intro": "Practical data protection that builds trust and supports growth.",
        "checklist": {
          "body": "Data protection risk grows when nobody owns it day to day. We help growing businesses put practical, proportionate compliance in place.",
          "button_label": "Talk to us about data protection",
          "button_href": "/contact",
          "note": "Want it handled for you? See our",
          "note_link_label": "Virtual DPO",
          "note_link_href": "/how-we-work/virtual-data-protection-officer",
          "note_after": "service.",
          "list_label": "Ways we can help",
          "items": [
            "UK GDPR and data protection compliance",
            "Data processing agreements and privacy notices",
            "Data breach response support",
            "Ongoing Virtual DPO service across three tiers"
          ],
          "divided": true
        },
        "cta": {
          "eyebrow": "",
          "heading": "Need help with data protection?",
          "body": "Find out how Iconos can make compliance simpler and more manageable.",
          "style": "dark",
          "button_label": "Discuss your requirements",
          "button_href": "/contact",
          "secondary_button_label": "",
          "secondary_button_href": ""
        }
      },
      {
        "slug": "ip",
        "original_like": "<p>Your intellectual property is often the most valuable thing your bu%",
        "intro": "Practical advice to protect your ideas, brand and intellectual property.",
        "checklist": {
          "body": "Your intellectual property can be one of your most valuable business assets. We help you identify, protect and maximise its value.",
          "button_label": "Talk to us about IP",
          "button_href": "/contact",
          "note": "Need ongoing support? See",
          "note_link_label": "Managed Legal Services",
          "note_link_href": "/how-we-work/subscription-model",
          "note_after": "",
          "list_label": "Ways we can help",
          "items": [
            "IP audits and protection strategy",
            "Trade mark registration and brand protection",
            "Licensing and assignment agreements",
            "Software and technology IP",
            "Tackling IP infringement"
          ],
          "divided": true
        },
        "cta": {
          "eyebrow": "",
          "heading": "Protect what makes your business valuable.",
          "body": "Tell us about your intellectual property needs and we'll discuss how we can help.",
          "style": "dark",
          "button_label": "Discuss your IP needs",
          "button_href": "/contact",
          "secondary_button_label": "",
          "secondary_button_href": ""
        }
      },
      {
        "slug": "employment",
        "original_like": "<p>Employment law touches every stage of growth, from your first hire %",
        "intro": "Practical employment law support as your business grows.",
        "checklist": {
          "body": "From your first hire to complex employment issues, we provide practical advice to help you manage risk and make confident decisions as your business grows.",
          "button_label": "Talk to us about employment",
          "button_href": "/contact",
          "note": "Need ongoing support? See",
          "note_link_label": "Managed Legal Services",
          "note_link_href": "/how-we-work/subscription-model",
          "note_after": "",
          "list_label": "Ways we can help",
          "items": [
            "Contracts of employment and consultancy agreements",
            "Policies and staff handbooks",
            "Disciplinary, grievance and exit support",
            "Settlement agreements",
            "Restructuring and redundancy guidance"
          ],
          "divided": true
        },
        "cta": {
          "eyebrow": "",
          "heading": "Need employment law advice?",
          "body": "Tell us about your business and employment needs, and we'll discuss how we can help.",
          "style": "dark",
          "button_label": "Discuss your needs",
          "button_href": "/contact",
          "secondary_button_label": "",
          "secondary_button_href": ""
        }
      },
      {
        "slug": "mergers-and-acquisitions",
        "original_like": "<p>Whether you%re acquiring, being acquired, or merging%",
        "intro": "Commercial legal support to help you buy, sell or invest with confidence.",
        "checklist": {
          "body": "Whether you're buying, selling or investing, we provide commercially minded support that keeps the deal moving.",
          "button_label": "Talk to us about M&A",
          "button_href": "/contact",
          "note": "",
          "note_link_label": "",
          "note_link_href": "",
          "note_after": "",
          "list_label": "Ways we can help",
          "items": [
            "Due diligence, buy-side and sell-side",
            "Heads of terms and deal structuring",
            "Sale and purchase agreements",
            "Investment documentation"
          ],
          "divided": true
        },
        "cta": {
          "eyebrow": "",
          "heading": "Planning a business transaction?",
          "body": "Tell us about your plans and we'll discuss how we can help.",
          "style": "dark",
          "button_label": "Discuss your transaction",
          "button_href": "/contact",
          "secondary_button_label": "",
          "secondary_button_href": ""
        }
      }
    ]$pages$::jsonb) as x(slug text, original_like text, intro text, checklist jsonb, cta jsonb)
  loop
    select id into v_page_id from public.pages
      where page_type = 'service' and slug = r.slug;
    if v_page_id is null then
      raise notice '% not found — skipping', r.slug;
      continue;
    end if;

    update public.pages set intro = r.intro where id = v_page_id and intro is null;

    if (select count(*) from public.page_sections where page_id = v_page_id) <> 1
       or not exists (
         select 1 from public.page_sections
         where page_id = v_page_id and section_type = 'text'
           and content->>'body' like r.original_like
       ) then
      raise notice '% sections have been edited — leaving them as they are', r.slug;
      continue;
    end if;

    delete from public.page_sections where page_id = v_page_id;

    insert into public.page_sections (page_id, section_type, background, content, sort_order)
    values
      (v_page_id, 'text_checklist', 'none', r.checklist, 0),
      (v_page_id, 'cta', 'none', r.cta, 1);
  end loop;
end $$;
