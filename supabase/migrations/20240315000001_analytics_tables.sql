-- Analytics tables for tracking store performance

-- Store visits table
create table public.store_visits (
    id uuid default uuid_generate_v4() primary key,
    store_id uuid references public.profiles(id) on delete cascade not null,
    visitor_id text not null,
    page_path text not null,
    referrer text,
    user_agent text,
    duration integer,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product views table
create table public.product_views (
    id uuid default uuid_generate_v4() primary key,
    product_id uuid references public.products(id) on delete cascade not null,
    visitor_id text not null,
    duration integer,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cart events table
create table public.cart_events (
    id uuid default uuid_generate_v4() primary key,
    store_id uuid references public.profiles(id) on delete cascade not null,
    visitor_id text not null,
    product_id uuid references public.products(id) on delete cascade not null,
    event_type text not null check (event_type in ('add', 'remove', 'update', 'checkout', 'abandon')),
    quantity integer,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index store_visits_store_id_idx on public.store_visits(store_id);
create index store_visits_created_at_idx on public.store_visits(created_at);
create index product_views_product_id_idx on public.product_views(product_id);
create index product_views_created_at_idx on public.product_views(created_at);
create index cart_events_store_id_idx on public.cart_events(store_id);
create index cart_events_created_at_idx on public.cart_events(created_at);

-- Enable RLS
alter table public.store_visits enable row level security;
alter table public.product_views enable row level security;
alter table public.cart_events enable row level security;

-- RLS policies
create policy "Store owners can view their store visits"
    on public.store_visits for select
    using (auth.uid() = store_id);

create policy "Store owners can view their product views"
    on public.product_views for select
    using (
        auth.uid() in (
            select user_id from public.products where id = product_id
        )
    );

create policy "Store owners can view their cart events"
    on public.cart_events for select
    using (auth.uid() = store_id);

-- Create analytics views for easier querying
create view public.store_analytics as
select
    p.id as store_id,
    p.store_name,
    count(distinct sv.visitor_id) as unique_visitors,
    count(sv.id) as total_visits,
    avg(sv.duration) as avg_visit_duration,
    count(distinct ce.visitor_id) filter (where ce.event_type = 'checkout') as conversions,
    count(distinct ce.visitor_id) filter (where ce.event_type = 'abandon') as cart_abandons
from public.profiles p
left join public.store_visits sv on sv.store_id = p.id
left join public.cart_events ce on ce.store_id = p.id
group by p.id, p.store_name;

create view public.product_analytics as
select
    p.id as product_id,
    p.name as product_name,
    p.user_id as store_id,
    count(distinct pv.visitor_id) as unique_views,
    count(pv.id) as total_views,
    avg(pv.duration) as avg_view_duration,
    count(distinct ce.visitor_id) filter (where ce.event_type = 'add') as cart_adds,
    count(distinct ce.visitor_id) filter (where ce.event_type = 'checkout') as purchases
from public.products p
left join public.product_views pv on pv.product_id = p.id
left join public.cart_events ce on ce.product_id = p.id
group by p.id, p.name, p.user_id;