-- ============================================================================
-- 0010_add_video_section_type.sql
-- Adds 'video' as a valid page_sections.section_type — a YouTube embed
-- block, usable on any page (service/program/custom), same as the other
-- three section types.
-- ============================================================================
 
alter table public.page_sections
  drop constraint page_sections_section_type_check;
 
alter table public.page_sections
  add constraint page_sections_section_type_check
  check (section_type in ('text', 'image_text', 'cta', 'tiers', 'video'));