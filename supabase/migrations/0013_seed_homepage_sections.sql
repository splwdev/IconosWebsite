-- ============================================================================
-- 0013_seed_homepage_sections.sql
-- Seeds the singleton homepage row and converts the current hardcoded
-- homepage content (src/app/(site)/page.tsx) into real, editable,
-- reorderable section rows.
-- ============================================================================
 
insert into public.pages (page_type, parent_section, slug, title, summary, status, sort_order)
values (
  'home', null, 'home', 'Homepage',
  'The site homepage — built from sections, same as any other page.',
  'published', 0
);
 
do $$
declare
  v_home_id uuid;
begin
  select id into v_home_id from public.pages where page_type = 'home';
 
  insert into public.page_sections (page_id, section_type, background, content, sort_order)
  values
    (v_home_id, 'cta', 'none', jsonb_build_object(
      'eyebrow', 'Outsourced in-house counsel',
      'heading', 'Commercially focused legal support, embedded in your team.',
      'body', 'Business enablers, not blockers. We work alongside your sales team for a fixed monthly fee — adding money to your bottom line, not just sitting there as a cost centre.',
      'style', 'light',
      'button_label', 'Get in touch',
      'button_href', '/contact',
      'secondary_button_label', 'See how we work',
      'secondary_button_href', '/how-we-work'
    ), 0),
 
    (v_home_id, 'media_text', 'none', jsonb_build_object(
      'eyebrow', 'Who we are',
      'media_type', 'image',
      'image_url', null,
      'video_url', '',
      'layout', 'media-left',
      'body', '<h2>Founded to be part of your team — not outside it.</h2><p>Iconos Group is an SRA-regulated commercial legal consultancy, led by Erika Moralez Perez, who combines years of legal practice with a decade of business management inside international IT and software companies.</p><p>We serve growing UK and international businesses of roughly 10–150 people who''ve outgrown DIY legal but aren''t ready for a full-time hire — starting from as little as one hour a month.</p><p><a href="/who-we-are">Our story</a></p>'
    ), 1),
 
    (v_home_id, 'services_grid', 'tint', jsonb_build_object(
      'eyebrow', 'What we do',
      'heading', 'Legal support across the areas that matter to growing businesses.',
      'intro', 'We only practise in corporate, commercial, and data protection law — so you always know exactly what you''re getting.'
    ), 2),
 
    (v_home_id, 'programs_highlight', 'none', jsonb_build_object(
      'eyebrow', 'How we work',
      'heading', 'One fixed monthly cost. No surprise invoices.'
    ), 3),
 
    (v_home_id, 'media_text', 'tint', jsonb_build_object(
      'eyebrow', 'Meet the founder',
      'media_type', 'video',
      'image_url', null,
      'video_url', '',
      'layout', 'media-left',
      'body', '<blockquote>Legal advice should add to your bottom line — not just sit there as a cost centre.</blockquote><p><strong>Erika Moralez Perez</strong><br>Founder, Iconos Group</p>'
    ), 4),
 
    (v_home_id, 'testimonials', 'none', jsonb_build_object(
      'eyebrow', 'Clients',
      'heading', 'What our clients say'
    ), 5),
 
    (v_home_id, 'blog_teaser', 'tint', jsonb_build_object(
      'eyebrow', 'From the blog',
      'heading', 'Weekly, practical, commercially minded.'
    ), 6),
 
    (v_home_id, 'cta', 'none', jsonb_build_object(
      'eyebrow', '',
      'heading', 'Ready to talk?',
      'body', 'Tell us a little about your business and what you''re enquiring about — we''ll come back to you quickly.',
      'style', 'dark',
      'button_label', 'Get in touch',
      'button_href', '/contact',
      'secondary_button_label', '',
      'secondary_button_href', ''
    ), 7);
end $$;