-- My MBG — production migration starter schema
-- PostgreSQL schema for My MBG backend deployment.

create extension if not exists "pgcrypto";

create type public.app_role as enum ('student','teacher','vendor','government','admin');
create type public.distribution_status as enum ('SCHEDULED','PREPARING','IN_TRANSIT','DELIVERED','VALIDATION_PENDING','VALIDATED','COMPLETED','CANCELLED');
create type public.validation_status as enum ('PENDING','AI_ANALYZED','HUMAN_REVIEW','VERIFIED','REVIEW_REQUIRED','REJECTED');
create type public.anomaly_status as enum ('OPEN','IN_REVIEW','AWAITING_VENDOR','CORRECTIVE_ACTION','RESOLVED','CLOSED');
create type public.clearance_status as enum ('NOT_READY','PENDING','ELIGIBLE','ON_HOLD','VERIFIED');

create table public.regions (
  id uuid primary key default gen_random_uuid(),
  province text not null,
  city_regency text not null,
  district text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz not null default now()
);

create table public.sppgs (
  id uuid primary key default gen_random_uuid(),
  sppg_code text unique not null,
  name text not null,
  region_id uuid references public.regions(id),
  address text,
  latitude numeric,
  longitude numeric,
  pic_name text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  school_code text unique not null,
  name text not null,
  region_id uuid references public.regions(id),
  sppg_id uuid references public.sppgs(id),
  address text,
  latitude numeric,
  longitude numeric,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  role public.app_role not null,
  avatar_url text,
  school_id uuid references public.schools(id),
  sppg_id uuid references public.sppgs(id),
  region_id uuid references public.regions(id),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.menus (
  id uuid primary key default gen_random_uuid(),
  menu_date date not null,
  name text not null,
  description text,
  image_url text,
  calories numeric,
  protein numeric,
  carbohydrate numeric,
  fat numeric,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.menus(id) on delete cascade,
  item_name text not null,
  expected_grams numeric,
  category text
);

create table public.menu_votes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id),
  voting_period text not null,
  menu_id uuid not null references public.menus(id),
  created_at timestamptz not null default now(),
  unique(student_id, voting_period)
);


create table public.meal_feedback (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  menu_id uuid not null references public.menus(id),
  menu_date date not null,
  consumption_level text not null check (consumption_level in ('finished','partial','leftover')),
  rating integer not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  unique(student_id, menu_date)
);

create table public.distributions (
  id uuid primary key default gen_random_uuid(),
  sppg_id uuid not null references public.sppgs(id),
  school_id uuid not null references public.schools(id),
  menu_id uuid references public.menus(id),
  distribution_date date not null,
  target_portions integer not null check (target_portions >= 0),
  delivered_portions integer check (delivered_portions >= 0),
  planned_time time,
  delivered_at timestamptz,
  status public.distribution_status not null default 'SCHEDULED',
  created_at timestamptz not null default now()
);

create table public.validations (
  id uuid primary key default gen_random_uuid(),
  distribution_id uuid not null references public.distributions(id),
  teacher_id uuid not null references public.profiles(id),
  ai_score numeric,
  ai_result_json jsonb,
  human_status text,
  final_status public.validation_status not null default 'PENDING',
  note text,
  latitude numeric,
  longitude numeric,
  location_accuracy numeric,
  captured_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.validation_images (
  id uuid primary key default gen_random_uuid(),
  validation_id uuid not null references public.validations(id) on delete cascade,
  storage_path text not null,
  capture_source text,
  file_hash text,
  watermark_text text,
  created_at timestamptz not null default now()
);

create table public.anomaly_reports (
  id uuid primary key default gen_random_uuid(),
  distribution_id uuid references public.distributions(id),
  validation_id uuid references public.validations(id),
  reporter_id uuid not null references public.profiles(id),
  category text not null,
  severity text not null check (severity in ('Low','Medium','High','Critical')),
  title text not null,
  description text not null,
  status public.anomaly_status not null default 'OPEN',
  created_at timestamptz not null default now()
);

create table public.anomaly_evidence (
  id uuid primary key default gen_random_uuid(),
  anomaly_id uuid not null references public.anomaly_reports(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id),
  storage_path text,
  description text,
  created_at timestamptz not null default now()
);

create table public.corrective_actions (
  id uuid primary key default gen_random_uuid(),
  anomaly_id uuid not null references public.anomaly_reports(id),
  assigned_to uuid references public.sppgs(id),
  description text not null,
  deadline date,
  status text not null default 'OPEN',
  resolution_note text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.clearances (
  id uuid primary key default gen_random_uuid(),
  sppg_id uuid not null references public.sppgs(id),
  period_start date not null,
  period_end date not null,
  simulated_amount numeric,
  evidence_score numeric,
  status public.clearance_status not null default 'NOT_READY',
  created_at timestamptz not null default now()
);

create table public.claims (
  id uuid primary key default gen_random_uuid(),
  sppg_id uuid not null references public.sppgs(id),
  clearance_id uuid references public.clearances(id),
  period text,
  simulated_amount numeric,
  status text not null default 'DRAFT',
  created_at timestamptz not null default now()
);

create table public.nutrition_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  excerpt text,
  content text,
  thumbnail_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

-- RLS is mandatory before production use.
alter table public.profiles enable row level security;
alter table public.regions enable row level security;
alter table public.sppgs enable row level security;
alter table public.schools enable row level security;
alter table public.menus enable row level security;
alter table public.menu_items enable row level security;
alter table public.menu_votes enable row level security;
alter table public.meal_feedback enable row level security;
alter table public.distributions enable row level security;
alter table public.validations enable row level security;
alter table public.validation_images enable row level security;
alter table public.anomaly_reports enable row level security;
alter table public.anomaly_evidence enable row level security;
alter table public.corrective_actions enable row level security;
alter table public.clearances enable row level security;
alter table public.claims enable row level security;
alter table public.nutrition_articles enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- IMPORTANT:
-- Define policies per role/organization before connecting the production app.
-- Do not allow clients to insert/update/delete audit_logs directly.
