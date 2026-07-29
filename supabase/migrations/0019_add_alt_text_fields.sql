-- ============================================================================
-- 0019_add_alt_text_fields.sql
-- Alt text for the three featured/logo image fields that had none. Section
-- images (Media / Media+Text page sections) get alt text via a new field
-- in their JSONB content schema, not a DB column change — see
-- src/lib/content/page-sections.ts.
-- ============================================================================
 
alter table public.pages add column featured_image_alt text;
alter table public.posts add column featured_image_alt text;
alter table public.testimonials add column logo_alt text;
 
comment on column public.pages.featured_image_alt is 'Alt text for featured_image_url — accessibility/SEO, optional but encouraged.';
comment on column public.posts.featured_image_alt is 'Alt text for featured_image_url — accessibility/SEO, optional but encouraged.';
comment on column public.testimonials.logo_alt is 'Alt text for logo_url, typically the company name — accessibility, optional.';