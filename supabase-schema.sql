-- Create the predictions table
create table public.predictions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  match_date date not null,
  team_a text not null,
  team_b text not null,
  tournament text not null,
  prediction_text text not null,
  odds numeric not null,
  stake numeric not null,
  result text not null check (result in ('Won', 'Lost', 'Refunded')),
  profit_loss numeric not null,
  notes text
);

-- Enable Row Level Security (RLS)
alter table public.predictions enable row level security;

-- Create a policy that allows all operations for now (since we don't have auth set up yet)
-- In a real production app, you'd want to restrict this to authenticated users
create policy "Enable read access for all users" on public.predictions for select using (true);
create policy "Enable insert access for all users" on public.predictions for insert with check (true);
create policy "Enable update access for all users" on public.predictions for update using (true);
create policy "Enable delete access for all users" on public.predictions for delete using (true);
