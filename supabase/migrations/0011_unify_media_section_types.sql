-- ============================================================================
-- 0011_unify_media_section_types.sql
-- Replaces the separate 'image_text' and 'video' section types with a
-- unified 'media' (single image-or-video block, with a size control) and
-- 'media_text' (image-or-video + text, replacing image_text). No data
-- migration needed — confirmed zero existing rows used either old type.
-- ============================================================================
 
alter table public.page_sections
  drop constraint page_sections_section_type_check;
 
alter table public.page_sections
  add constraint page_sections_section_type_check
  check (section_type in ('text', 'media', 'media_text', 'cta', 'tiers'));