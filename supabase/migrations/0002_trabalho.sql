-- Minha Agenda: tela Trabalho
-- Rode este arquivo inteiro no Supabase em SQL Editor → New query → Run (depois do 0001).
-- Pode rodar de novo sem problema: nada é apagado.

set client_min_messages = warning;

-- mesma função de regras de acesso do 0001 (é apagada no fim)
create or replace function public.ligar_rls(tabela text) returns void
language plpgsql as $$
begin
  execute format('alter table public.%I enable row level security', tabela);
  execute format('drop policy if exists "dono le" on public.%I', tabela);
  execute format('drop policy if exists "dono cria" on public.%I', tabela);
  execute format('drop policy if exists "dono altera" on public.%I', tabela);
  execute format('drop policy if exists "dono apaga" on public.%I', tabela);
  execute format('create policy "dono le" on public.%I for select to authenticated using ((select auth.uid()) = user_id)', tabela);
  execute format('create policy "dono cria" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', tabela);
  execute format('create policy "dono altera" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', tabela);
  execute format('create policy "dono apaga" on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', tabela);
  execute format('create index if not exists %I on public.%I (user_id)', tabela || '_user_id_idx', tabela);
end $$;

-- ---------- projetos ----------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 200),
  status text not null default 'aberto' check (status in ('aberto', 'andamento', 'esperando', 'concluido')),
  obs text not null default '',
  criado_em timestamptz not null default now()
);

-- tarefas podem pertencer a um projeto e guardam quando foram concluídas (para o resumo da semana)
alter table public.tasks add column if not exists project_id uuid references public.projects (id) on delete set null;
alter table public.tasks add column if not exists concluida_em timestamptz;
create index if not exists tasks_project_id_idx on public.tasks (project_id);

create or replace function public.marcar_concluida_em() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.concluida and (tg_op = 'INSERT' or not old.concluida) then
    new.concluida_em := now();
  elsif not new.concluida then
    new.concluida_em := null;
  end if;
  return new;
end $$;

drop trigger if exists tasks_concluida_em on public.tasks;
create trigger tasks_concluida_em before insert or update of concluida on public.tasks
  for each row execute function public.marcar_concluida_em();

-- ---------- rotina do dia a dia ----------
create table if not exists public.routine_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 200),
  horario time,
  ordem integer not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

-- um registro por item e por dia em que foi feito
create table if not exists public.routine_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  item_id uuid not null references public.routine_items (id) on delete cascade,
  data date not null default current_date,
  unique (item_id, data)
);

-- ---------- conferência de pagamentos: um registro por plataforma e dia ----------
create unique index if not exists payment_checks_dia_idx on public.payment_checks (user_id, plataforma, data);

select public.ligar_rls(t) from unnest(array['projects', 'routine_items', 'routine_checks']) as t;

drop function public.ligar_rls(text);
