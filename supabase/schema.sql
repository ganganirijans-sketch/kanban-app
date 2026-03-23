-- ============================================
-- FlowBoard — run this in Supabase SQL Editor
-- ============================================

create extension if not exists "uuid-ossp";

-- Profiles (auto-created from auth.users via trigger)
create table if not exists public.profiles (
  id         uuid references auth.users(id) on delete cascade primary key,
  name       text,
  created_at timestamptz default now()
);

-- Projects
create table if not exists public.projects (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text default '',
  color       text default '#6366f1',
  owner_id    uuid references public.profiles(id) on delete cascade not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Tasks
create table if not exists public.tasks (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text default '',
  status      text default 'pending' check (status in ('pending','in_progress','completed')),
  priority    text default 'medium'  check (priority in ('low','medium','high')),
  project_id  uuid references public.projects(id) on delete cascade not null,
  due_date    date,
  position    integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Indexes
create index if not exists idx_projects_owner on public.projects(owner_id);
create index if not exists idx_tasks_project  on public.tasks(project_id);

-- ============================================
-- Row Level Security
-- ============================================
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.tasks    enable row level security;

create policy "profiles: own" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "projects: own" on public.projects for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "tasks: via project" on public.tasks for all
  using (exists (select 1 from public.projects where projects.id = tasks.project_id and projects.owner_id = auth.uid()))
  with check (exists (select 1 from public.projects where projects.id = tasks.project_id and projects.owner_id = auth.uid()));

-- ============================================
-- Auto-create profile on sign up
-- ============================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_projects_updated before update on public.projects for each row execute procedure public.set_updated_at();
create trigger trg_tasks_updated    before update on public.tasks    for each row execute procedure public.set_updated_at();
