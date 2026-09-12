create table if not exists public.vedoy_ai_agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  description text not null default '' check (char_length(description) <= 300),
  system_prompt text not null check (char_length(system_prompt) between 1 and 12000),
  category text not null default 'general' check (category in ('general','writing','business','technology','creative')),
  color text not null default 'sage' check (color in ('sage','lavender','peach','sky','yellow')),
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  constraint vedoy_ai_system_owner check ((is_system and user_id is null) or (not is_system and user_id is not null))
);

create table if not exists public.vedoy_ai_agent_preferences (
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_id uuid not null references public.vedoy_ai_agents(id) on delete cascade,
  hidden boolean not null default false,
  favorite boolean not null default false,
  primary key (user_id, agent_id)
);

create table if not exists public.vedoy_ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_id uuid references public.vedoy_ai_agents(id) on delete set null,
  title text not null check (char_length(title) between 1 and 80),
  messages jsonb not null default '[]'::jsonb check (jsonb_typeof(messages) = 'array' and octet_length(messages::text) <= 60000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vedoy_ai_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  locale text not null default 'nb' check (locale in ('nb','en')),
  workspace_name text not null default 'Mitt arbeidsrom' check (char_length(workspace_name) between 1 and 80),
  compact boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.vedoy_ai_daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default current_date,
  message_count integer not null default 0 check (message_count between 0 and 50),
  primary key (user_id, usage_date)
);

alter table public.vedoy_ai_agents enable row level security;
alter table public.vedoy_ai_agent_preferences enable row level security;
alter table public.vedoy_ai_conversations enable row level security;
alter table public.vedoy_ai_settings enable row level security;
alter table public.vedoy_ai_daily_usage enable row level security;

create policy "ai agents are visible to owner" on public.vedoy_ai_agents for select to authenticated
  using (is_system or (select auth.uid()) = user_id);
create policy "ai agents can be created by owner" on public.vedoy_ai_agents for insert to authenticated
  with check ((select auth.uid()) = user_id and not is_system);
create policy "ai agents can be updated by owner" on public.vedoy_ai_agents for update to authenticated
  using ((select auth.uid()) = user_id and not is_system)
  with check ((select auth.uid()) = user_id and not is_system);
create policy "ai agents can be deleted by owner" on public.vedoy_ai_agents for delete to authenticated
  using ((select auth.uid()) = user_id and not is_system);

create policy "ai preferences belong to owner" on public.vedoy_ai_agent_preferences for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "ai conversations belong to owner" on public.vedoy_ai_conversations for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "ai settings belong to owner" on public.vedoy_ai_settings for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create or replace function public.vedoy_ai_reserve_message()
returns boolean language plpgsql security definer set search_path = '' as $$
declare current_count integer;
begin
  if (select auth.uid()) is null then raise exception 'authentication required'; end if;
  insert into public.vedoy_ai_daily_usage (user_id, usage_date, message_count)
  values ((select auth.uid()), current_date, 1)
  on conflict (user_id, usage_date) do update
    set message_count = public.vedoy_ai_daily_usage.message_count + 1
    where public.vedoy_ai_daily_usage.message_count < 50
  returning message_count into current_count;
  return current_count is not null;
end;
$$;
revoke all on function public.vedoy_ai_reserve_message() from public, anon;
grant execute on function public.vedoy_ai_reserve_message() to authenticated;
grant select, insert, update, delete on public.vedoy_ai_agents, public.vedoy_ai_agent_preferences,
  public.vedoy_ai_conversations, public.vedoy_ai_settings to authenticated;
grant select on public.vedoy_ai_daily_usage to authenticated;

create policy "ai usage belongs to owner" on public.vedoy_ai_daily_usage for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "ai usage can be inserted by owner" on public.vedoy_ai_daily_usage for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "ai usage can be updated by owner" on public.vedoy_ai_daily_usage for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

insert into public.vedoy_ai_agents (name, description, system_prompt, category, color, is_system) values
  ('Vedi', 'Din rolige Vedøy-assistent for digitale valg.', 'Du er Vedi. Gi rolige, praktiske og ærlige råd. Prioriter ett tydelig neste steg.', 'general', 'yellow', true),
  ('Tekstverksted', 'Skriver og forbedrer tydelig tekst.', 'Du er en presis tekstredaktør. Bevar brukerens mening og tone. Lever tekst som er klar til bruk.', 'writing', 'lavender', true),
  ('Forretningsrådgiver', 'Gjør ideer konkrete, lønnsomme og målbare.', 'Du er en nøktern forretningsrådgiver. Vurder inntekt mot tidsbruk og foreslå det minste målbare neste steget.', 'business', 'sage', true),
  ('Teknisk hjelper', 'Forklarer og løser digitale problemer.', 'Du er en erfaren teknisk hjelper. Forklar enkelt, vær presis og ikke påstå at noe er testet uten bevis.', 'technology', 'sky', true)
on conflict do nothing;
