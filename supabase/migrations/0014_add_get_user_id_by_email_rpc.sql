-- ============================================================================
-- 0014_add_get_user_id_by_email_rpc.sql
-- Lets the staff-management admin UI look up a user's id by email (needed
-- to insert into staff_users, whose user_id is a real FK into auth.users)
-- without exposing the full user list. auth.users isn't reachable via the
-- normal PostgREST API at all — this is the standard, Supabase-recommended
-- way to bridge that gap safely. Admin-gated inside the function itself,
-- same SECURITY DEFINER pattern as publish_theme()/replace_page_sections().
-- ============================================================================
 
create or replace function public.get_user_id_by_email(p_email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if not is_staff_admin() then
    raise exception 'Not authorized to look up users';
  end if;
 
  select id into v_user_id from auth.users where email = p_email limit 1;
  return v_user_id;
end;
$$;
 
revoke all on function public.get_user_id_by_email(text) from public;
grant execute on function public.get_user_id_by_email(text) to authenticated;