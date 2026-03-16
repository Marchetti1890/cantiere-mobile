-- ============================================================
-- CANTIERE MOBILE - Schema database Supabase
-- Esegui questo script nell'SQL Editor di Supabase
-- ============================================================

-- CANTIERI
create table cantieri (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  indirizzo text,
  cliente text,
  attivo boolean default true,
  created_at timestamptz default now()
);

-- MEZZI
create table mezzi (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  targa text,
  tipo text,
  attivo boolean default true
);

-- UTENTI (profili collegati a auth.users)
create table utenti (
  id uuid references auth.users primary key,
  nome text not null,
  cognome text,
  ruolo text not null check (ruolo in ('ADMIN','MAGAZZINO','CARPENTIERE','AUTISTA')),
  telefono text,
  cantiere_id uuid references cantieri(id),
  attivo boolean default true
);

-- TRASPORTI
create table trasporti (
  id uuid default gen_random_uuid() primary key,
  cantiere_id uuid references cantieri(id) not null,
  richiesta_da uuid references utenti(id) not null,
  mezzo_id uuid references mezzi(id),
  autista_id uuid references utenti(id),
  data date not null,
  ora_inizio_prevista time,
  ora_fine_prevista time,
  ore_previste numeric(4,1),
  ore_effettive numeric(4,1),
  ora_partenza_reale time,
  ora_arrivo_reale time,
  ora_rientro_reale time,
  materiale text,
  quantita text,
  note_carpentiere text,
  note_autista text,
  stato text not null default 'RICHIESTO'
    check (stato in ('RICHIESTO','PIANIFICATO','CONFERMATO','IN_CORSO','COMPLETATO','ANNULLATO')),
  created_at timestamptz default now()
);

-- ============================================================
-- DATI DI ESEMPIO (opzionale, per testare subito)
-- ============================================================

insert into cantieri (nome, indirizzo, cliente) values
  ('Cantiere Via Roma', 'Via Roma 45, Milano', 'Costruzioni SpA'),
  ('Cantiere Piazza Duomo', 'Piazza Duomo 1, Bergamo', 'Edilbuild Srl'),
  ('Cantiere Nord Est', 'Via Industria 12, Brescia', 'Gruppo Edile');

insert into mezzi (nome, targa, tipo) values
  ('Camion 3 Assi', 'MI 123 AB', 'camion'),
  ('Furgone Grande', 'MI 456 CD', 'furgone'),
  ('Autogrù', 'MI 789 EF', 'autogrù');

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - sicurezza base
-- ============================================================

alter table cantieri enable row level security;
alter table mezzi enable row level security;
alter table utenti enable row level security;
alter table trasporti enable row level security;

-- Policy: utenti autenticati vedono tutto (puoi affinare per ruolo)
create policy "Autenticati leggono cantieri" on cantieri for select using (auth.role() = 'authenticated');
create policy "Autenticati leggono mezzi" on mezzi for select using (auth.role() = 'authenticated');
create policy "Autenticati leggono utenti" on utenti for select using (auth.role() = 'authenticated');
create policy "Autenticati leggono trasporti" on trasporti for select using (auth.role() = 'authenticated');
create policy "Autenticati inseriscono trasporti" on trasporti for insert with check (auth.role() = 'authenticated');
create policy "Autenticati aggiornano trasporti" on trasporti for update using (auth.role() = 'authenticated');
