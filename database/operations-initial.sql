-- HISTORICAL: already applied as operations_mvp earlier in this task.
-- Its initial policies were superseded by operations-access-and-workflow.sql.
-- Do not execute this file independently as a production setup.
-- TAGIMS Field Ops MVP. Additive only: existing financial tables are untouched.
create table if not exists public.ops_clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  name text not null, phone text, email text, address text, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.ops_projects (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid() references auth.users(id),
  client_id uuid not null references public.ops_clients(id) on delete restrict,
  fin_project_id uuid references public.fin_projects(id) on delete set null,
  name text not null, address text, status text not null default 'lead' check (status in ('lead','walkthrough','estimating','review','active','complete','archived')),
  start_date date, target_date date, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.ops_project_members (
  project_id uuid not null references public.ops_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'field' check (role in ('manager','estimator','field','viewer')),
  primary key(project_id,user_id)
);
create table if not exists public.ops_walkthroughs (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.ops_projects(id) on delete cascade,
  author_id uuid not null default auth.uid() references auth.users(id), occurred_at timestamptz not null default now(), notes text not null default '', measurements jsonb not null default '[]'::jsonb, decisions jsonb not null default '[]'::jsonb
);
create table if not exists public.ops_photos (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.ops_projects(id) on delete cascade,
  uploaded_by uuid not null default auth.uid() references auth.users(id), storage_path text not null unique, caption text, room text, phase text,
  website_public boolean not null default false, website_published_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.ops_estimates (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.ops_projects(id) on delete cascade,
  version integer not null default 1, status text not null default 'draft' check (status in ('draft','internal_review','client_ready','accepted','revised','void')),
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0), tax numeric(12,2) not null default 0 check (tax >= 0), notes text, created_by uuid not null default auth.uid() references auth.users(id), created_at timestamptz not null default now(), unique(project_id,version)
);
create table if not exists public.ops_estimate_items (
  id uuid primary key default gen_random_uuid(), estimate_id uuid not null references public.ops_estimates(id) on delete cascade, category text not null default 'general', description text not null,
  quantity numeric(12,2) not null default 1 check(quantity >= 0), unit text, unit_price numeric(12,2) not null default 0 check(unit_price >= 0), sort_order integer not null default 0
);
create table if not exists public.ops_field_items (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.ops_projects(id) on delete cascade,
  kind text not null check(kind in ('material','punch','tool','supply','timeline','document')), title text not null, details text, status text not null default 'open', due_date date, assigned_to uuid references auth.users(id), created_at timestamptz not null default now()
);
alter table public.ops_clients enable row level security; alter table public.ops_projects enable row level security; alter table public.ops_project_members enable row level security; alter table public.ops_walkthroughs enable row level security; alter table public.ops_photos enable row level security; alter table public.ops_estimates enable row level security; alter table public.ops_estimate_items enable row level security; alter table public.ops_field_items enable row level security;
-- This narrowly scoped helper prevents recursive RLS evaluation. It always checks the caller's auth.uid(),
-- is not publicly executable, and returns only a boolean project-membership decision.
create or replace function public.ops_can_access_project(p uuid) returns boolean language sql stable security definer set search_path = public as $$ select auth.uid() is not null and (exists(select 1 from ops_projects x where x.id=p and x.owner_id=auth.uid()) or exists(select 1 from ops_project_members m where m.project_id=p and m.user_id=auth.uid())) $$;
revoke all on function public.ops_can_access_project(uuid) from public;
grant execute on function public.ops_can_access_project(uuid) to authenticated;
create policy "owners manage clients" on public.ops_clients to authenticated using (owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "project members read linked clients" on public.ops_clients for select to authenticated using(exists(select 1 from public.ops_projects p where p.client_id=id and public.ops_can_access_project(p.id)));
create policy "project members read projects" on public.ops_projects for select to authenticated using (public.ops_can_access_project(id));
create policy "owners manage projects" on public.ops_projects for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "project access members" on public.ops_project_members for select to authenticated using(public.ops_can_access_project(project_id));
create policy "owners manage members" on public.ops_project_members for all to authenticated using(exists(select 1 from public.ops_projects p where p.id=project_id and p.owner_id=auth.uid())) with check(exists(select 1 from public.ops_projects p where p.id=project_id and p.owner_id=auth.uid()));
create policy "project access walkthroughs" on public.ops_walkthroughs for all to authenticated using(public.ops_can_access_project(project_id)) with check(public.ops_can_access_project(project_id));
create policy "project access photos" on public.ops_photos for all to authenticated using(public.ops_can_access_project(project_id)) with check(public.ops_can_access_project(project_id));
create policy "project access estimates" on public.ops_estimates for all to authenticated using(public.ops_can_access_project(project_id)) with check(public.ops_can_access_project(project_id));
create policy "project access estimate items" on public.ops_estimate_items for all to authenticated using(exists(select 1 from public.ops_estimates e where e.id=estimate_id and public.ops_can_access_project(e.project_id))) with check(exists(select 1 from public.ops_estimates e where e.id=estimate_id and public.ops_can_access_project(e.project_id)));
create policy "project access field items" on public.ops_field_items for all to authenticated using(public.ops_can_access_project(project_id)) with check(public.ops_can_access_project(project_id));
create index if not exists ops_projects_client_idx on public.ops_projects(client_id); create index if not exists ops_photos_project_idx on public.ops_photos(project_id,website_public); create index if not exists ops_field_items_project_idx on public.ops_field_items(project_id,kind);
-- Create a private `project-photos` Storage bucket in the dashboard. Store files as <project-id>/<uuid>.
-- Website publisher runs server-side and uses only ops_photos.website_public = true; never expose a service key to this app.
