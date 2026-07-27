-- ============================================================================
-- 0012_add_home_page_type_and_sections.sql
-- Allows a singleton 'home' page_type, reusing the page_sections system for
-- the homepage. Adds four "smart" section types (services_grid,
-- programs_highlight, testimonials, blog_teaser) that render live data with
-- minimal editable fields, alongside the existing generic types.
-- ============================================================================
 
alter table public.pages
  drop constraint pages_page_type_check;
 
alter table public.pages
  add constraint pages_page_type_check
  check (page_type in ('service', 'program', 'custom', 'home'));
 
alter table public.pages
  drop constraint pages_parent_section_matches_type;
 
alter table public.pages
  add constraint pages_parent_section_matches_type
  check (
    (page_type in ('service', 'program') and parent_section is not null)
    or (page_type in ('custom', 'home') and parent_section is null)
  );
 
create unique index pages_only_one_home
  on public.pages ((page_type = 'home'))
  where page_type = 'home';
 
alter table public.page_sections
  drop constraint page_sections_section_type_check;
 
alter table public.page_sections
  add constraint page_sections_section_type_check
  check (section_type in (
    'text', 'media', 'media_text', 'cta', 'tiers',
    'services_grid', 'programs_highlight', 'testimonials', 'blog_teaser'
  ));