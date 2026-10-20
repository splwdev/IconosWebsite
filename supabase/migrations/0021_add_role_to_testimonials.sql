-- ============================================================================
-- 0021_add_role_to_testimonials.sql
-- Splits the testimonial byline into two lines, per the approved homepage
-- mockup: the person's name (existing `attribution` column, now labelled
-- "Name" in admin) and a new `role` line for position and company.
--
-- Additive and safe to apply before the code that uses it: the currently
-- deployed code never selects or writes `role`. Apply this FIRST, then
-- deploy — the new code selects `role` and would get no testimonials back
-- if the column didn't exist yet.
-- ============================================================================

alter table public.testimonials
  add column role text not null default '';

comment on column public.testimonials.attribution is
  'The person''s name (first byline line). Column name kept from before role existed.';
comment on column public.testimonials.role is
  'Position and company, e.g. "President and CRO, CriticalArc" (second byline line). Optional.';

-- Split the one testimonial already entered in "Name, Role" form, so it
-- doesn't need re-typing. Matches the exact saved text only; everything
-- else is left for staff to edit.
update public.testimonials
  set attribution = 'Darren Chalmers-Stevens',
      role = 'President and CRO, CriticalArc'
  where attribution = 'Darren Chalmers-Stevens, President and CRO, CriticalArc'
    and role = '';
