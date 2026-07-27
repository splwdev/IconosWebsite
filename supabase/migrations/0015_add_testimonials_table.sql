-- ============================================================================
-- 0015_add_testimonials_table.sql
-- Testimonials — moves off the static src/lib/content/testimonials.ts
-- array. Mirrors posts/pages for RLS/authorization: public reads published
-- only, staff reads/writes all, via the is_staff() helper.
-- ============================================================================
 
create table public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  quote         text not null,
  attribution   text not null,
  status        text not null default 'draft' check (status in ('draft', 'published')),
  sort_order    integer not null default 0,
  created_by    uuid references auth.users(id),
  updated_by    uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
 
create index testimonials_status_idx on public.testimonials (status);
 
create trigger testimonials_set_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();
 
alter table public.testimonials enable row level security;
 
create policy "public reads published testimonials"
  on public.testimonials
  for select
  to anon, authenticated
  using (status = 'published');
 
create policy "staff reads all testimonials"
  on public.testimonials
  for select
  to authenticated
  using (is_staff());
 
create policy "staff creates testimonials"
  on public.testimonials
  for insert
  to authenticated
  with check (is_staff());
 
create policy "staff updates testimonials"
  on public.testimonials
  for update
  to authenticated
  using (is_staff())
  with check (is_staff());
 
create policy "staff deletes testimonials"
  on public.testimonials
  for delete
  to authenticated
  using (is_staff());
 
-- ----------------------------------------------------------------------------
-- Seed the 3 existing placeholder testimonials as published — they're
-- already live on the site today via the static array, so this preserves
-- current appearance exactly. Explicitly still placeholders pending real
-- client quotes + permission (see original questionnaire Q23) — the point
-- of this feature is giving staff the ability to replace/unpublish them
-- without a developer once permission is confirmed.
-- ----------------------------------------------------------------------------
 
insert into public.testimonials (quote, attribution, status, sort_order)
values
  ('Iconos feel like part of our own team — commercially sharp, and never a blocker.', 'Founder, SaaS scale-up', 'published', 0),
  ('A predictable monthly cost meant we finally asked the questions we''d been avoiding.', 'COO, EdTech company', 'published', 1),
  ('They''ve genuinely helped us get deals across the line, not just review paperwork after the fact.', 'Sales Director, Health tech', 'published', 2);