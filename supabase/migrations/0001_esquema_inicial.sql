-- Minha Agenda: esquema inicial
-- Rode este arquivo inteiro no Supabase em SQL Editor → New query → Run.
-- Todas as tabelas têm user_id e Row Level Security: cada pessoa só vê e altera os próprios dados.

set client_min_messages = warning;

-- ---------- função que cria as regras de acesso de uma tabela ----------
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

-- ---------- agenda ----------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 200),
  detalhe text not null default '',
  area text not null default 'aula' check (area in ('aula', 'estudo', 'estagio', 'trabalho', 'outro')),
  -- evento avulso: data preenchida; evento que se repete: dias_semana preenchido (0 = domingo … 6 = sábado)
  data date,
  dias_semana smallint[],
  inicio time not null,
  fim time,
  criado_em timestamptz not null default now(),
  check ((data is not null) <> (dias_semana is not null and cardinality(dias_semana) > 0)),
  check (fim is null or fim > inicio)
);

-- ---------- tarefas e lembretes ----------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 300),
  area text not null default 'geral',
  data date,
  concluida boolean not null default false,
  criado_em timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 300),
  quando date not null,
  area text not null default 'geral',
  feito boolean not null default false,
  criado_em timestamptz not null default now()
);

-- ---------- estudos ----------
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 200),
  semestre text,
  criado_em timestamptz not null default now()
);

-- provas e entregas (aparecem em "Próximos dias")
create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 300),
  tipo text not null default 'prova' check (tipo in ('prova', 'entrega')),
  data date not null,
  subject_id uuid references public.subjects (id) on delete set null,
  conteudo text not null default '',
  nota text,
  criado_em timestamptz not null default now()
);

create table if not exists public.review_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject_id uuid references public.subjects (id) on delete cascade,
  exam_id uuid references public.exams (id) on delete cascade,
  titulo text not null,
  feito boolean not null default false,
  criado_em timestamptz not null default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject_id uuid references public.subjects (id) on delete cascade,
  titulo text not null,
  url text not null check (url ~* '^https?://'),
  tipo text not null default 'link' check (tipo in ('pdf', 'slides', 'pasta', 'link')),
  criado_em timestamptz not null default now()
);

-- ---------- trabalho ----------
create table if not exists public.payment_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  plataforma text not null check (plataforma in ('ifood', 'amazon', 'shopee', 'outra')),
  data date not null default current_date,
  valor numeric(12, 2),
  status text not null default 'pendente' check (status in ('pendente', 'conferido')),
  obs text not null default '',
  criado_em timestamptz not null default now()
);

-- ---------- notas e ideias ----------
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 5000),
  tipo text not null default 'ideia' check (tipo in ('ideia', 'nota', 'reuniao')),
  area text not null default 'geral',
  criado_em timestamptz not null default now()
);

-- ---------- financeiro ----------
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  descricao text not null,
  valor numeric(12, 2) not null check (valor >= 0),
  categoria text not null default 'outros',
  vencimento date,
  pago boolean not null default false,
  pago_em date,
  criado_em timestamptz not null default now()
);

create table if not exists public.fixed_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  descricao text not null,
  valor numeric(12, 2) not null check (valor >= 0),
  categoria text not null default 'contas',
  dia_vencimento smallint not null check (dia_vencimento between 1 and 31),
  ativa boolean not null default true,
  criado_em timestamptz not null default now()
);

create table if not exists public.extra_income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  descricao text not null,
  valor numeric(12, 2) not null check (valor >= 0),
  data date not null default current_date,
  criado_em timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null,
  alvo numeric(12, 2) not null check (alvo > 0),
  guardado numeric(12, 2) not null default 0 check (guardado >= 0),
  criado_em timestamptz not null default now()
);

-- ---------- estágio ----------
create table if not exists public.internship_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  data date not null default current_date,
  texto text not null,
  criado_em timestamptz not null default now()
);

-- ---------- arquivos ----------
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 200),
  url text not null check (url ~* '^https?://'),
  area text not null default 'faculdade',
  subject_id uuid references public.subjects (id) on delete set null,
  criado_em timestamptz not null default now()
);

-- ---------- hábitos ----------
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table if not exists public.habit_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  habit_id uuid not null references public.habits (id) on delete cascade,
  data date not null default current_date,
  unique (habit_id, data)
);

-- ---------- regras de acesso em todas as tabelas ----------
select public.ligar_rls(t) from unnest(array[
  'events', 'tasks', 'reminders', 'subjects', 'exams', 'review_items', 'materials',
  'payment_checks', 'notes', 'expenses', 'fixed_bills', 'extra_income', 'goals',
  'internship_logs', 'links', 'habits', 'habit_checks'
]) as t;

-- A função só é necessária durante a instalação
drop function public.ligar_rls(text);
