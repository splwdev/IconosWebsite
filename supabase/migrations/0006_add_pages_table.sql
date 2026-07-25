-- ============================================================================
-- 0006_add_pages_table.sql
-- Services (/what-we-do/[slug]) and Programs (/how-we-work/[slug]) move off
-- static .ts files into here; also supports free-standing Custom Pages at
-- /[slug]. Mirrors posts (0002) for RLS/authorization level, but uses the
-- is_staff()/is_staff_admin() SECURITY DEFINER helpers rather than the older
-- inline-subquery pattern, since those are the current best practice (see
-- 0001's recursion bug, fixed live but never captured in a migration file).
-- ============================================================================
 
create table public.pages (
  id                  uuid primary key default gen_random_uuid(),
  page_type           text not null check (page_type in ('service', 'program', 'custom')),
  parent_section      text check (parent_section in ('what-we-do', 'how-we-work')),
  slug                text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title               text not null,
  tag                 text, -- e.g. "Subscription", "Three tiers" — program type only
  summary             text not null,
  body                text not null default '', -- Tiptap HTML, sanitized like posts.body
  tiers               jsonb, -- [{ name, description }] — program type only, e.g. VDPO's 3 tiers
  meta_description    text,
  featured_image_url  text,
  status              text not null default 'draft' check (status in ('draft', 'published')),
  sort_order          integer not null default 0,
  author_id           uuid references auth.users(id),
  updated_by          uuid references auth.users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
 
  constraint pages_parent_section_matches_type check (
    (page_type in ('service', 'program') and parent_section is not null)
    or (page_type = 'custom' and parent_section is null)
  )
);
 
comment on column public.pages.body is
  'Tiptap HTML source, rendered the same way as posts.body (sanitized server-side with DOMPurify before storage). Replaces the old separate intro+points fields.';
comment on column public.pages.tiers is
  'Optional 3-card pricing/tier grid, currently only used by the Virtual Data Protection Officer program. Not applicable to service or custom pages.';
 
create unique index pages_section_slug_unique
  on public.pages (parent_section, slug)
  where page_type in ('service', 'program');
 
-- Custom page slugs are global — checked against reserved static routes in
-- the application layer (RESERVED_SLUGS in src/lib/content/pages.ts), since
-- Postgres has no way to know about Next.js's route table.
create unique index pages_custom_slug_unique
  on public.pages (slug)
  where page_type = 'custom';
 
create index pages_status_idx on public.pages (status);
create index pages_parent_section_idx on public.pages (parent_section);
 
create trigger pages_set_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();
 
alter table public.pages enable row level security;
 
create policy "public reads published pages"
  on public.pages
  for select
  to anon, authenticated
  using (status = 'published');
 
create policy "staff reads all pages"
  on public.pages
  for select
  to authenticated
  using (is_staff());
 
create policy "staff creates pages"
  on public.pages
  for insert
  to authenticated
  with check (is_staff());
 
create policy "staff updates pages"
  on public.pages
  for update
  to authenticated
  using (is_staff())
  with check (is_staff());
 
create policy "staff deletes pages"
  on public.pages
  for delete
  to authenticated
  using (is_staff());
 
-- ----------------------------------------------------------------------------
-- Data migration: the 6 existing services + 3 existing programs, moved from
-- src/lib/content/services.ts and how-we-work.ts. intro+points folded into
-- a single Tiptap-compatible HTML body; tiers kept structured.
-- ----------------------------------------------------------------------------
 
insert into public.pages (page_type, parent_section, slug, title, summary, body, status, sort_order)
values
  ('service', 'what-we-do', 'corporate', 'Corporate',
   'Structuring, governance and transactions handled commercially, not just correctly.',
   '<p>From company formation through to governance and shareholder matters, we support founders and boards with corporate legal work that keeps pace with a growing business.</p><ul><li>Company formation and group structuring</li><li>Shareholder agreements and cap table matters</li><li>Corporate governance and board support</li><li>Investment and funding round documentation</li></ul>',
   'published', 1),
 
  ('service', 'what-we-do', 'commercial', 'Commercial',
   'Contracts that help close deals, not stall them.',
   '<p>We work alongside your sales team so contracts move at the speed of the deal, not the speed of a law firm''s turnaround time.</p><ul><li>Customer and supplier contracts</li><li>Terms of service and SaaS agreements</li><li>Partnership and reseller agreements</li><li>Contract review turned around fast, in plain English</li></ul>',
   'published', 2),
 
  ('service', 'what-we-do', 'data-protection-gdpr', 'Data Protection & GDPR',
   'Practical compliance, not box-ticking — and the foundation of our Virtual DPO service.',
   '<p>Data protection risk builds quietly when nobody owns it day to day. We help growing businesses put real, working compliance in place, sized to the business.</p><ul><li>GDPR and UK data protection compliance</li><li>Data processing agreements and privacy notices</li><li>Data breach response support</li><li>Ongoing Virtual DPO service across three tiers</li></ul>',
   'published', 3),
 
  ('service', 'what-we-do', 'ip', 'IP',
   'Protecting what makes you different.',
   '<p>Your intellectual property is often the most valuable thing your business owns. We help you identify, protect and commercialise it.</p><ul><li>IP audits and protection strategy</li><li>Licensing and assignment agreements</li><li>Software and technology IP</li><li>Brand and trade mark considerations</li></ul>',
   'published', 4),
 
  ('service', 'what-we-do', 'employment', 'Employment',
   'Clear, fair, low-risk people decisions.',
   '<p>Employment law touches every stage of growth, from your first hire to restructuring. We keep it practical and grounded in commercial reality.</p><ul><li>Contracts of employment and consultancy agreements</li><li>Policies and staff handbooks</li><li>Disciplinary, grievance and exit support</li><li>Restructuring and redundancy guidance</li></ul>',
   'published', 5),
 
  ('service', 'what-we-do', 'mergers-and-acquisitions', 'Mergers & Acquisitions',
   'Deal support from term sheet to close.',
   '<p>Whether you''re acquiring, being acquired, or merging, we provide commercially minded M&A support that keeps the deal moving.</p><ul><li>Due diligence, buy-side and sell-side</li><li>Heads of terms and deal structuring</li><li>Sale and purchase agreements</li><li>Post-completion integration support</li></ul>',
   'published', 6);
 
insert into public.pages (page_type, parent_section, slug, title, tag, summary, body, tiers, status, sort_order)
values
  ('program', 'how-we-work', 'subscription-model', 'Managed Legal Services', 'Subscription',
   'One fixed monthly cost. No surprise invoices.',
   '<p>Ongoing embedded legal support across corporate, commercial and employment matters, scaled to the size of your business. Starts from as little as one hour a month, so you can try it, see the value, and adjust as you grow.</p><ul><li>A single predictable monthly fee, agreed upfront</li><li>Access to the team, not just one lawyer</li><li>Scales up or down as your needs change</li><li>No meter running on every question you ask</li></ul>',
   null, 'published', 1),
 
  ('program', 'how-we-work', 'virtual-data-protection-officer', 'Virtual Data Protection Officer', 'Three tiers',
   'Outsourced DPO support so you stay compliant without hiring in-house.',
   '<p>Data protection compliance without a full-time hire. Choose the tier that matches your risk profile and data volumes, and move between tiers as your business changes.</p><ul><li>A named DPO contact, not a rotating helpdesk</li><li>Practical, business-first compliance advice</li><li>Ongoing monitoring, not a one-off audit</li></ul>',
   '[{"name":"Essential","description":"Core DPO oversight for smaller data volumes and lower-risk processing."},{"name":"Standard","description":"Regular reviews and hands-on support for growing data processing needs."},{"name":"Comprehensive","description":"Full DPO service for complex or higher-risk data processing at scale."}]'::jsonb,
   'published', 2),
 
  ('program', 'how-we-work', 'ad-hoc-work', 'Ad Hoc / One-Off Work', 'No subscription required',
   'Support for a single matter, without committing to an ongoing arrangement.',
   '<p>Not every business is ready for a subscription, and not every need is ongoing. We take on one-off matters alongside our subscription clients, quoted clearly upfront.</p><ul><li>No ongoing commitment required</li><li>Clear, agreed pricing before work begins</li><li>The same commercially minded approach as our subscription clients</li></ul>',
   null, 'published', 3);