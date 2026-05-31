-- Velmère production persistence preparation for Supabase/Postgres.
-- Run this in Supabase SQL editor when you are ready to replace mock fallback data.

create table if not exists public.velmere_square_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  locale text not null default 'en',
  title text not null,
  body text not null,
  author_name text not null,
  author_handle text not null,
  author_type text not null default 'community',
  image_url text,
  tags text[] not null default '{}',
  views integer not null default 0,
  likes integer not null default 0,
  comments_count integer not null default 0,
  moderation_status text not null default 'pending',
  created_at timestamptz not null default now(),
  created_at_label text
);

create table if not exists public.velmere_square_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.velmere_square_posts(id) on delete cascade,
  author_name text not null,
  body text not null,
  moderation_status text not null default 'pending',
  created_at timestamptz not null default now(),
  created_at_label text
);

-- Profile rows must be keyed by the authenticated session/user id; do not mutate a shared default profile in production.
create table if not exists public.velmere_profiles (
  id text primary key,
  display_name text not null default 'Velmère Member',
  handle text not null default 'velmere.member',
  bio text not null default '',
  last_name_change timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.velmere_square_posts enable row level security;
alter table public.velmere_square_comments enable row level security;
alter table public.velmere_profiles enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'velmere_square_posts' and policyname = 'Public can read approved Velmere Square posts') then
    create policy "Public can read approved Velmere Square posts"
      on public.velmere_square_posts for select
      using (moderation_status in ('approved', 'pending'));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'velmere_square_comments' and policyname = 'Public can read visible Velmere Square comments') then
    create policy "Public can read visible Velmere Square comments"
      on public.velmere_square_comments for select
      using (moderation_status in ('approved', 'pending'));
  end if;
end $$;

-- Production commerce order persistence.
create table if not exists public.velmere_orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  status text not null default 'checkout_completed',
  locale text not null default 'en',
  wallet_address text,
  currency text,
  amount_total integer not null default 0,
  amount_subtotal integer,
  amount_tax integer,
  customer_email text,
  customer_name text,
  customer_phone text,
  customer_details jsonb,
  shipping_details jsonb,
  billing_details jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.velmere_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.velmere_orders(id) on delete cascade,
  line_index integer not null default 0,
  product_id text not null,
  variant_id text,
  selected_size text,
  quantity integer not null default 1,
  title text,
  unit_amount integer,
  currency text,
  provider text,
  provider_variant_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(order_id, line_index)
);

alter table public.velmere_orders enable row level security;
alter table public.velmere_order_items enable row level security;

create index if not exists velmere_orders_stripe_session_id_idx on public.velmere_orders(stripe_session_id);
create index if not exists velmere_orders_customer_email_idx on public.velmere_orders(customer_email);
create index if not exists velmere_order_items_order_id_idx on public.velmere_order_items(order_id);
