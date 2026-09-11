alter table public.ops_projects add column if not exists next_action text not null default 'Schedule walkthrough';
alter table public.ops_projects add column if not exists next_action_due date;
alter table public.ops_projects add constraint ops_next_action_nonempty check(length(trim(next_action))>0);
create or replace function ops_private.project_event() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is not null then
  insert into public.ops_audit(project_id,actor_id,action,entity_id) values(new.id,auth.uid(),case when tg_op='INSERT' then 'project_created' when new.status is distinct from old.status then 'project_stage_changed' else 'project_updated' end,new.id);
 end if;
 return new;
end$$;
revoke all on function ops_private.project_event() from public;
create trigger ops_project_event after insert or update on public.ops_projects for each row execute function ops_private.project_event();
