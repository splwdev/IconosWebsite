-- ============================================================================
-- 0002_blog_cms.sql
-- Blog posts, staff-authored via /admin/posts, public reads published only.
-- ============================================================================

create table public.posts (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title              text not null,
  excerpt            text not null,
  body               text not null, -- Markdown source
  category           text not null,
  status             text not null default 'draft' check (status in ('draft', 'published')),
  featured_image_url text,
  meta_description   text,
  author_id          uuid references auth.users(id),
  published_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on column public.posts.body is 'Markdown source, rendered client-side via react-markdown with raw HTML disabled.';

create index posts_status_idx on public.posts (status);
create index posts_published_at_idx on public.posts (published_at desc);

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

-- Public visitors (anon + authenticated non-staff) only ever see genuinely
-- published posts — draft content is invisible even if the slug is guessed.
create policy "public reads published posts"
  on public.posts
  for select
  to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= now());

create policy "staff reads all posts"
  on public.posts
  for select
  to authenticated
  using (exists (select 1 from public.staff_users where user_id = auth.uid()));

create policy "staff creates posts"
  on public.posts
  for insert
  to authenticated
  with check (exists (select 1 from public.staff_users where user_id = auth.uid()));

create policy "staff updates posts"
  on public.posts
  for update
  to authenticated
  using (exists (select 1 from public.staff_users where user_id = auth.uid()))
  with check (exists (select 1 from public.staff_users where user_id = auth.uid()));

create policy "staff deletes posts"
  on public.posts
  for delete
  to authenticated
  using (exists (select 1 from public.staff_users where user_id = auth.uid()));

-- ----------------------------------------------------------------------------
-- Storage: featured images
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

create policy "staff uploads blog images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'blog-images'
    and exists (select 1 from public.staff_users where user_id = auth.uid())
  );

create policy "staff updates blog images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'blog-images'
    and exists (select 1 from public.staff_users where user_id = auth.uid())
  );

create policy "staff deletes blog images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'blog-images'
    and exists (select 1 from public.staff_users where user_id = auth.uid())
  );
