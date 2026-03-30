-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table profiles enable row level security;

-- Create policies so everyone can read profiles
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

-- Allow users to insert/update their own profile
create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup and insert into profiles automatically
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- Reviews Table
-- ==========================================
create table reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  reviewer_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table reviews enable row level security;

-- Everyone can read reviews
create policy "Reviews are viewable by everyone." on reviews
  for select using (true);

-- Authenticated users can insert their own review
create policy "Users can insert their own review." on reviews
  for insert with check (auth.uid() = user_id);

-- ==========================================
-- Orders Table
-- ==========================================
create table orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  total_amount numeric not null,
  currency text default 'USD' not null,
  status text default 'pending' check (status in ('pending', 'paid', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table orders enable row level security;

-- Users can only read their own orders
create policy "Users can view own orders." on orders
  for select using (auth.uid() = user_id);

-- Wait, creating an order will be done via server role (using service_role key) 
-- OR if we do it from frontend before calling Razorpay, users would insert.
-- We'll allow users to insert their pending orders.
create policy "Users can insert own orders." on orders
  for insert with check (auth.uid() = user_id);

-- Users can update own orders (e.g. status)
create policy "Users can update own orders." on orders
  for update using (auth.uid() = user_id);
