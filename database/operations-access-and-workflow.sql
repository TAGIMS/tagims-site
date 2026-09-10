-- Additive follow-up to operations_mvp applied earlier in this task.
-- No changes to fin_* records or policies. Project owners are the initial business boundary.
create schema if not exists ops_private;
revoke all on schema ops_private from public;
grant usage on schema ops_private to authenticated;

create or replace function ops_private.project_role(project uuid) returns text
language sql stable security definer set search_path='' as $$
 select case when auth.uid() is null then null
 when exists(select 1 from public.ops_projects p where p.id=project and p.owner_id=auth.uid()) then 'owner'
 else (select m.role from public.ops_project_members m where m.project_id=project and m.user_id=auth.uid()) end;
$$;
revoke all on function ops_private.project_role(uuid) from public;
grant execute on function ops_private.project_role(uuid) to authenticated;
create or replace function public.ops_can_access_project(p uuid) returns boolean
language sql stable security invoker set search_path='' as $$select ops_private.project_role(p) is not null$$;
revoke all on function public.ops_can_access_project(uuid) from public;
grant execute on function public.ops_can_access_project(uuid) to authenticated;

alter table public.ops_photos add column if not exists name text;
alter table public.ops_photos add column if not exists stage text not null default 'unsorted' check(stage in ('unsorted','before','during','after'));
alter table public.ops_estimates add column if not exists scope_confirmed boolean not null default false;
alter table public.ops_estimates drop constraint if exists ops_estimates_status_check;
alter table public.ops_estimates add constraint ops_estimates_status_check check(status in ('draft','internal_review','final_review','client_ready','accepted','revised','void'));
alter table public.ops_estimate_items alter column quantity drop not null;
alter table public.ops_estimate_items alter column unit_price drop not null;
create table if not exists public.ops_audit (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references public.ops_projects(id),
 actor_id uuid not null references auth.users(id), action text not null, entity_id uuid not null,
 created_at timestamptz not null default now()
);
alter table public.ops_audit enable row level security;

-- Replace broad first-pass policies: viewers cannot edit; field users cannot read estimates.
do $$declare r record;begin
 for r in select tablename,policyname from pg_policies where schemaname='public' and tablename like 'ops_%'
 loop execute format('drop policy %I on public.%I',r.policyname,r.tablename);end loop;
end$$;
revoke all on public.ops_clients,public.ops_projects,public.ops_project_members,public.ops_walkthroughs,public.ops_photos,public.ops_estimates,public.ops_estimate_items,public.ops_field_items,public.ops_audit from anon,authenticated;
grant select,insert,update on public.ops_clients,public.ops_projects,public.ops_walkthroughs,public.ops_photos,public.ops_estimates,public.ops_estimate_items,public.ops_field_items to authenticated;
grant select on public.ops_project_members,public.ops_audit to authenticated;
create policy owner_clients on public.ops_clients for all to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy read_projects on public.ops_projects for select to authenticated using(ops_private.project_role(id) is not null);
create policy write_projects on public.ops_projects for all to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()) and exists(select 1 from public.ops_clients c where c.id=client_id and c.owner_id=(select auth.uid())) and (fin_project_id is null or exists(select 1 from public.fin_projects f where f.id=fin_project_id and f.owner_id=(select auth.uid()))));
create policy read_members on public.ops_project_members for select to authenticated using(user_id=(select auth.uid()) or ops_private.project_role(project_id)='owner');
create policy read_notes on public.ops_walkthroughs for select to authenticated using(ops_private.project_role(project_id) is not null);
create policy write_notes on public.ops_walkthroughs for all to authenticated using(ops_private.project_role(project_id) in ('owner','manager','estimator','field')) with check(ops_private.project_role(project_id) in ('owner','manager','estimator','field'));
create policy read_photos on public.ops_photos for select to authenticated using(ops_private.project_role(project_id) is not null);
create policy write_photos on public.ops_photos for all to authenticated using(ops_private.project_role(project_id) in ('owner','manager','estimator','field')) with check(ops_private.project_role(project_id) in ('owner','manager','estimator','field'));
create policy read_estimates on public.ops_estimates for select to authenticated using(ops_private.project_role(project_id) in ('owner','manager','estimator'));
create policy write_estimates on public.ops_estimates for all to authenticated using(ops_private.project_role(project_id) in ('owner','manager','estimator')) with check(ops_private.project_role(project_id) in ('owner','manager','estimator'));
create policy read_items on public.ops_estimate_items for select to authenticated using(exists(select 1 from public.ops_estimates e where e.id=estimate_id));
create policy write_items on public.ops_estimate_items for all to authenticated using(exists(select 1 from public.ops_estimates e where e.id=estimate_id and e.status='draft')) with check(exists(select 1 from public.ops_estimates e where e.id=estimate_id and e.status='draft'));
create policy read_field on public.ops_field_items for select to authenticated using(ops_private.project_role(project_id) is not null);
create policy write_field on public.ops_field_items for all to authenticated using(ops_private.project_role(project_id) in ('owner','manager','estimator','field')) with check(ops_private.project_role(project_id) in ('owner','manager','estimator','field'));
create policy read_audit on public.ops_audit for select to authenticated using(ops_private.project_role(project_id)='owner');

-- RLS protects rows. This trigger protects workflow, identity, and approval columns inside those rows.
create or replace function ops_private.guard_record() returns trigger language plpgsql security invoker set search_path='' as $$
declare before jsonb; after jsonb; k text;begin
 if current_user not in ('authenticated','anon') then return new;end if;
 after=to_jsonb(new);
 if tg_op='UPDATE' then
  before=to_jsonb(old);
  foreach k in array array['id','owner_id','project_id','estimate_id','client_id','created_by','uploaded_by','author_id','storage_path','version'] loop
   if before?k and before->k is distinct from after->k then raise exception 'Record identity cannot be changed';end if;
  end loop;
 else
  foreach k in array array['created_by','uploaded_by','author_id','owner_id'] loop
   if after?k and after->>k is distinct from auth.uid()::text then raise exception 'Actor must match current user';end if;
  end loop;
 end if;
 if tg_table_name='ops_photos' then
  if new.website_public and (tg_op='INSERT' or new.website_public is distinct from old.website_public) then raise exception 'Use the owner approval action';end if;
  if tg_op='UPDATE' and new.website_public is distinct from old.website_public then raise exception 'Use the owner approval action';end if;
 end if;
 if tg_table_name='ops_estimates' then
  if tg_op='INSERT' and new.status<>'draft' then raise exception 'Estimates start as drafts';end if;
  if tg_op='UPDATE' and (old.status<>'draft' or new.status<>old.status) then raise exception 'Use the review workflow or create a revision';end if;
 end if;
 return new;
end$$;
do $$declare t text;begin
 foreach t in array array['ops_clients','ops_projects','ops_walkthroughs','ops_photos','ops_estimates','ops_estimate_items','ops_field_items'] loop
 execute format('create trigger ops_record_guard before insert or update on public.%I for each row execute function ops_private.guard_record()',t);
 end loop;
end$$;

create or replace function ops_private.contact(project uuid) returns table(name text,phone text,email text)
language sql stable security definer set search_path='' as $$select c.name,c.phone,c.email from public.ops_projects p join public.ops_clients c on c.id=p.client_id where p.id=project and ops_private.project_role(p.id) is not null$$;
create or replace function public.ops_project_contact(project uuid) returns table(name text,phone text,email text)
language sql stable security invoker set search_path='' as $$select * from ops_private.contact(project)$$;

create or replace function ops_private.assign_member(project uuid,email text,member_role text) returns void language plpgsql security definer set search_path='' as $$
declare member uuid;begin
 if ops_private.project_role(project) is distinct from 'owner' then raise exception 'Only the project owner can assign staff';end if;
 if member_role not in ('manager','estimator','field','viewer') then raise exception 'Invalid role';end if;
 select u.id into member from auth.users u where lower(u.email)=lower(assign_member.email);
 if member is null then raise exception 'Employee must have a registered account first';end if;
 insert into public.ops_project_members(project_id,user_id,role) values(project,member,member_role) on conflict(project_id,user_id) do update set role=excluded.role;
 insert into public.ops_audit(project_id,actor_id,action,entity_id) values(project,auth.uid(),'staff_assigned',member);
end$$;
create or replace function public.ops_assign_member(project uuid,email text,member_role text) returns void language sql security invoker set search_path='' as $$select ops_private.assign_member(project,email,member_role)$$;

create or replace function ops_private.photo_approval(photo uuid,approved boolean) returns void language plpgsql security definer set search_path='' as $$
declare p uuid;begin
 select project_id into p from public.ops_photos where id=photo for update;
 if ops_private.project_role(p) is distinct from 'owner' then raise exception 'Only the project owner can approve public photos';end if;
 update public.ops_photos set website_public=approved where id=photo;
 insert into public.ops_audit(project_id,actor_id,action,entity_id) values(p,auth.uid(),case when approved then 'website_approved' else 'website_revoked' end,photo);
end$$;
create or replace function public.ops_set_photo_approval(photo uuid,approved boolean) returns void language sql security invoker set search_path='' as $$select ops_private.photo_approval(photo,approved)$$;

create or replace function ops_private.review_estimate(estimate uuid,action text) returns uuid language plpgsql security definer set search_path='' as $$
declare e public.ops_estimates; p public.ops_projects; next_status text; revision uuid;begin
 select * into e from public.ops_estimates where id=estimate for update;
 if ops_private.project_role(e.project_id) is distinct from 'owner' then raise exception 'Only the project owner can record review clearance';end if;
 if action='revise' then
  if e.status='draft' then raise exception 'Already a draft';end if;
  -- Lock the project so concurrent revisions cannot allocate the same version.
  perform 1 from public.ops_projects where id=e.project_id for update;
  insert into public.ops_estimates(project_id,version,notes,created_by) values(e.project_id,(select max(version)+1 from public.ops_estimates where project_id=e.project_id),e.notes,auth.uid()) returning id into revision;
  insert into public.ops_estimate_items(estimate_id,category,description,quantity,unit,unit_price,sort_order) select revision,category,description,quantity,unit,unit_price,sort_order from public.ops_estimate_items where estimate_id=e.id;
 else
  next_status=case when action='submit' and e.status='draft' then 'internal_review' when action='inspector' and e.status='internal_review' then 'final_review' when action='reviewer' and e.status='final_review' then 'client_ready' end;
  if next_status is null then raise exception 'Invalid review transition';end if;
  select * into p from public.ops_projects where id=e.project_id;
  if not e.scope_confirmed or nullif(trim(p.address),'') is null or not exists(select 1 from public.ops_clients c where c.id=p.client_id and nullif(trim(c.name),'') is not null) then raise exception 'Confirm scope, client name, and property address first';end if;
  if not exists(select 1 from public.ops_estimate_items where estimate_id=e.id) or exists(select 1 from public.ops_estimate_items where estimate_id=e.id and (quantity is null or unit_price is null)) then raise exception 'Resolve estimate items, quantities, and prices first';end if;
  update public.ops_estimates set status=next_status,subtotal=(select sum(round(quantity*unit_price,2)) from public.ops_estimate_items where estimate_id=e.id) where id=e.id;
  revision=e.id;
 end if;
 insert into public.ops_audit(project_id,actor_id,action,entity_id) values(e.project_id,auth.uid(),'estimate_'||action,revision);
 return revision;
end$$;
create or replace function public.ops_review_estimate(estimate uuid,action text) returns uuid language sql security invoker set search_path='' as $$select ops_private.review_estimate(estimate,action)$$;
revoke all on all functions in schema ops_private from public;
grant execute on all functions in schema ops_private to authenticated;
revoke all on function public.ops_project_contact(uuid),public.ops_assign_member(uuid,text,text),public.ops_set_photo_approval(uuid,boolean),public.ops_review_estimate(uuid,text) from public;
grant execute on function public.ops_project_contact(uuid),public.ops_assign_member(uuid,text,text),public.ops_set_photo_approval(uuid,boolean),public.ops_review_estimate(uuid,text) to authenticated;

-- Storage path authorization uses safe text comparison; malformed paths never cast to UUID.
create or replace function ops_private.photo_path_role(path text) returns text language sql stable security definer set search_path='' as $$select ops_private.project_role(p.id) from public.ops_projects p where p.id::text=split_part(path,'/',1) and auth.uid() is not null$$;
revoke all on function ops_private.photo_path_role(text) from public;
grant execute on function ops_private.photo_path_role(text) to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('project-photos','project-photos',false,20971520,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy ops_photo_read on storage.objects for select to authenticated using(bucket_id='project-photos' and ops_private.photo_path_role(name) is not null);
create policy ops_photo_upload on storage.objects for insert to authenticated with check(bucket_id='project-photos' and ops_private.photo_path_role(name) in ('owner','manager','estimator','field'));
create policy ops_photo_cleanup on storage.objects for delete to authenticated using(bucket_id='project-photos' and ops_private.photo_path_role(name) is not null and (owner_id=auth.uid()::text or ops_private.photo_path_role(name)='owner') and not exists(select 1 from public.ops_photos p where p.storage_path=name));
create index if not exists ops_members_user_idx on public.ops_project_members(user_id);
create index if not exists ops_projects_owner_idx on public.ops_projects(owner_id);
create index if not exists ops_notes_project_idx on public.ops_walkthroughs(project_id);
create index if not exists ops_estimate_items_estimate_idx on public.ops_estimate_items(estimate_id);
