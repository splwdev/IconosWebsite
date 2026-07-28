-- ============================================================================
-- 0018_add_featured_video_url_to_posts.sql
-- Optional YouTube URL — when set, replaces the featured image on the post
-- detail page (a video-led post, e.g. a vlog or talk, generally has no
-- separate need for a static hero image too).
-- ============================================================================
 
alter table public.posts add column featured_video_url text;
comment on column public.posts.featured_video_url is 'Optional YouTube URL — when set, replaces the featured image on the post detail page (a video-led post, e.g. a vlog or talk, generally has no separate need for a static hero image too).';