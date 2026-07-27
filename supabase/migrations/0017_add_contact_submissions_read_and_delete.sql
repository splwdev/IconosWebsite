-- ============================================================================
-- 0017_add_contact_submissions_read_and_delete.sql
-- Lets staff mark a submission as reviewed and delete old ones (useful for
-- GDPR-conscious data minimisation — notably relevant given this is a data
-- protection law firm's own site). Previously staff could only SELECT.
-- ============================================================================
 
alter table public.contact_submissions add column read_at timestamptz;
 
create policy "staff updates submissions"
  on public.contact_submissions
  for update
  to authenticated
  using (is_staff())
  with check (is_staff());
 
create policy "staff deletes submissions"
  on public.contact_submissions
  for delete
  to authenticated
  using (is_staff());