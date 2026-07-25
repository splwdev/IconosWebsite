-- ============================================================================
-- 0007_add_show_in_nav_to_pages.sql
-- Lets a Custom Page opt into appearing as a top-level header nav link.
-- Service/program pages already have their own dropdown mechanism (see
-- public-nav.ts) and never use this — enforced by the check constraint.
-- ============================================================================
 
alter table public.pages
  add column show_in_nav boolean not null default false;
 
comment on column public.pages.show_in_nav is
  'Custom pages only — whether this appears as a top-level link in the header nav. Service/program pages have their own dropdown mechanism and never use this.';
 
alter table public.pages
  add constraint pages_show_in_nav_custom_only
  check (not show_in_nav or page_type = 'custom');