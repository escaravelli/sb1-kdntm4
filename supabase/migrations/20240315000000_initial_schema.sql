-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    name text not null,
    store_name text not null,
    store_slug text not null unique,
    subscription_status text check (subscription_status in ('inactive', 'active')) default 'inactive',
    stripe_customer_id text unique,
    subscription_id text unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products table
create table public.products (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    description text not null,
    price decimal(10,2),
    images text[] default array[]::text[],
    videos text[] default array[]::text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PIX keys table
create table public.pix_keys (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null unique,
    type text not null check (type in ('email', 'phone', 'cpf', 'cnpj', 'random')),
    key text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Payments table
create table public.payments (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    amount decimal(10,2) not null,
    description text,
    customer_name text not null,
    customer_email text not null,
    customer_cpf text,
    payment_method text not null check (payment_method in ('pix', 'credit_card')),
    status text not null check (status in ('pending', 'completed', 'failed')),
    pix_payload jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index products_user_id_idx on public.products(user_id);
create index payments_user_id_idx on public.payments(user_id);
create index profiles_store_slug_idx on public.profiles(store_slug);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.pix_keys enable row level security;
alter table public.payments enable row level security;

-- Create RLS policies
-- Profiles: Users can only read/update their own profile
create policy "Users can view own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- Products: Public read, authenticated user CRUD for own products
create policy "Anyone can view products"
    on public.products for select
    using (true);

create policy "Users can create own products"
    on public.products for insert
    with check (auth.uid() = user_id);

create policy "Users can update own products"
    on public.products for update
    using (auth.uid() = user_id);

create policy "Users can delete own products"
    on public.products for delete
    using (auth.uid() = user_id);

-- PIX keys: Authenticated user CRUD for own keys
create policy "Users can view own PIX keys"
    on public.pix_keys for select
    using (auth.uid() = user_id);

create policy "Users can manage own PIX keys"
    on public.pix_keys for all
    using (auth.uid() = user_id);

-- Payments: Authenticated user CRUD for own payments
create policy "Users can view own payments"
    on public.payments for select
    using (auth.uid() = user_id);

create policy "Users can create payments"
    on public.payments for insert
    with check (auth.uid() = user_id);

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, name, store_name, store_slug)
    values (
        new.id,
        new.raw_user_meta_data->>'name',
        new.raw_user_meta_data->>'store_name',
        new.raw_user_meta_data->>'store_slug'
    );
    return new;
end;
$$;

-- Create trigger for new user creation
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();