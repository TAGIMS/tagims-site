-- All users and records are synthetic and rolled back. No production financial records are touched.
begin;
create temp table ops_test_ids as select gen_random_uuid() as owner,gen_random_uuid() as staff,gen_random_uuid() as viewer,gen_random_uuid() as stranger,gen_random_uuid() as client,gen_random_uuid() as project,gen_random_uuid() as estimate;
grant select on ops_test_ids to authenticated;
insert into auth.users(id,email) select owner,owner::text||'@example.invalid' from ops_test_ids union all select staff,staff::text||'@example.invalid' from ops_test_ids union all select viewer,viewer::text||'@example.invalid' from ops_test_ids union all select stranger,stranger::text||'@example.invalid' from ops_test_ids;
set local role authenticated;
select set_config('request.jwt.claim.sub',(select owner::text from ops_test_ids),true);
insert into public.ops_clients(id,name,notes) select client,'TEST OWNER CLIENT','PRIVATE OWNER NOTE' from ops_test_ids;
insert into public.ops_projects(id,client_id,name,address) select project,client,'TEST PROJECT','123 Test Street' from ops_test_ids;
select public.ops_assign_member(project,staff::text||'@example.invalid','field') from ops_test_ids;
select public.ops_assign_member(project,viewer::text||'@example.invalid','viewer') from ops_test_ids;
insert into public.ops_estimates(id,project_id,scope_confirmed) select estimate,project,true from ops_test_ids;
insert into public.ops_estimate_items(estimate_id,description,quantity,unit_price) select estimate,'TEST LINE',2,125.50 from ops_test_ids;
select public.ops_review_estimate(estimate,'submit') from ops_test_ids;
select public.ops_review_estimate(estimate,'inspector') from ops_test_ids;
select public.ops_review_estimate(estimate,'reviewer') from ops_test_ids;
do $$begin
 if not exists(select 1 from public.ops_estimates e join ops_test_ids t on e.id=t.estimate where e.status='client_ready' and e.subtotal=251.00) then raise exception 'Review total failed';end if;
 begin
  update public.ops_estimates set notes='ILLEGAL EDIT' where id=(select estimate from ops_test_ids);
  raise exception 'Reviewed estimate was editable';
 exception when others then if sqlerrm='Reviewed estimate was editable' then raise;end if;end;
end$$;
select public.ops_review_estimate(estimate,'revise') from ops_test_ids;
select set_config('request.jwt.claim.sub',(select staff::text from ops_test_ids),true);
do $$begin
 if (select count(*) from public.ops_projects where id=(select project from ops_test_ids))<>1 then raise exception 'Staff lost project';end if;
 if exists(select 1 from public.ops_clients where id=(select client from ops_test_ids)) then raise exception 'Staff leaked private client notes';end if;
 if exists(select 1 from public.ops_estimates where project_id=(select project from ops_test_ids)) then raise exception 'Staff leaked estimates';end if;
 if (select count(*) from public.ops_project_contact((select project from ops_test_ids)))<>1 then raise exception 'Staff lost contact';end if;
 if ops_private.photo_path_role('malformed') is not null then raise exception 'Invalid path authorized';end if;
end$$;
insert into public.ops_walkthroughs(project_id,notes) select project,'FIELD NOTE' from ops_test_ids;
insert into public.ops_photos(project_id,storage_path) select project,project::text||'/test/original' from ops_test_ids;
do $$begin
 begin
  perform public.ops_set_photo_approval((select id from public.ops_photos where project_id=(select project from ops_test_ids) limit 1),true);
  raise exception 'Staff approved public photo';
 exception when others then if sqlerrm='Staff approved public photo' then raise;end if;end;
 begin
  update public.ops_photos set website_public=true where project_id=(select project from ops_test_ids);
  raise exception 'Direct approval bypass';
 exception when others then if sqlerrm='Direct approval bypass' then raise;end if;end;
end$$;
select set_config('request.jwt.claim.sub',(select viewer::text from ops_test_ids),true);
do $$declare n integer;begin
 update public.ops_walkthroughs set notes='VIEWER EDIT' where project_id=(select project from ops_test_ids);get diagnostics n=row_count;
 if n<>0 then raise exception 'Viewer wrote notes';end if;
end$$;
select set_config('request.jwt.claim.sub',(select stranger::text from ops_test_ids),true);
do $$begin
 if exists(select 1 from public.ops_projects where id=(select project from ops_test_ids)) then raise exception 'Stranger leaked project';end if;
 if exists(select 1 from public.ops_photos where project_id=(select project from ops_test_ids)) then raise exception 'Stranger leaked photos';end if;
 if exists(select 1 from public.ops_project_contact((select project from ops_test_ids))) then raise exception 'Stranger leaked contact';end if;
end$$;
select set_config('request.jwt.claim.sub',(select owner::text from ops_test_ids),true);
select public.ops_set_photo_approval(p.id,true) from public.ops_photos p join ops_test_ids t on p.project_id=t.project;
select public.ops_set_photo_approval(p.id,false) from public.ops_photos p join ops_test_ids t on p.project_id=t.project;
select 'PASS: owner, field, viewer, outsider isolation; private client notes; immutable reviewed estimate; exact total; approval and revocation; safe storage path' as result;
rollback;
