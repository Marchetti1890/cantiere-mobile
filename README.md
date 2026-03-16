# 🏗️ CantiereMobile — Guida al Deploy

App web per la gestione trasporti di cantiere.
Si usa dal browser dello smartphone (Android/iPhone), senza installazione.

---

## ✅ PASSO 1 — Crea il database su Supabase (gratis)

1. Vai su **https://supabase.com** e clicca **"Start your project"**
2. Accedi con Google
3. Crea un nuovo progetto:
   - Nome: `cantiere-mobile`
   - Password database: scrivila da qualche parte (non ti servirà spesso)
   - Regione: **West EU (Ireland)** (più vicina all'Italia)
4. Aspetta ~2 minuti che il progetto si avvii
5. Vai su **SQL Editor** (menu a sinistra, icona database)
6. Clicca **"New query"**
7. Copia e incolla tutto il contenuto del file `supabase-schema.sql`
8. Clicca **"Run"** — vedrai le tabelle create

---

## ✅ PASSO 2 — Crea gli utenti

In Supabase, vai su **Authentication > Users > "Invite user"** e crea un utente per ognuno:

| Email | Ruolo da assegnare dopo |
|-------|------------------------|
| marco@cantiere.it | MAGAZZINO |
| antonio@cantiere.it | AUTISTA |
| luca@cantiere.it | CARPENTIERE |
| (ecc.) | (ecc.) |

Poi vai su **Table Editor > utenti** e per ogni utente appena creato aggiungi una riga:
- `id` → copia l'UUID dall'elenco Authentication
- `nome` → nome della persona
- `ruolo` → MAGAZZINO / CARPENTIERE / AUTISTA / ADMIN
- `cantiere_id` → (solo per carpentieri) l'UUID del loro cantiere

---

## ✅ PASSO 3 — Prendi le chiavi API

In Supabase: **Settings > API**

Copia:
- **Project URL** → es. `https://abcdefgh.supabase.co`
- **anon / public key** → stringa lunga che inizia con `eyJ...`

---

## ✅ PASSO 4 — Deploy su Vercel (gratis)

1. Vai su **https://vercel.com** e accedi con Google
2. Clicca **"Add New Project"**
3. Scegli **"Import Git Repository"**
   - Se non hai GitHub: clicca **"Deploy from template"** → poi segui alternativa sotto
4. Nella schermata di configurazione, aggiungi le **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` = il tuo Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = la tua anon key
5. Clicca **Deploy** → in 2 minuti hai un link tipo `cantiere-mobile.vercel.app`

### Alternativa senza GitHub (upload diretto):
1. Installa Node.js da https://nodejs.org
2. Apri il terminale nella cartella del progetto
3. Esegui: `npm install -g vercel` poi `vercel --prod`
4. Segui le istruzioni, inserisci le env variables quando richiesto

---

## ✅ PASSO 5 — Installa come app sugli smartphone Android

1. Apri Chrome su Android
2. Vai al link del tuo sito (es. `cantiere-mobile.vercel.app`)
3. Accedi con email/password
4. Tocca i **3 puntini** in alto a destra
5. **"Aggiungi a schermata Home"**
6. L'app apparirà come un'icona sul telefono!

Ripeti per ogni operaio.

---

## 📱 Come usarla

### Primo accesso degli utenti
Gli utenti riceveranno un'email di invito da Supabase.
Devono cliccare il link, impostare la password, e poi usare email+password per accedere.

### Admin — aggiungere cantieri e mezzi
Vai su Supabase > **Table Editor > cantieri** (o mezzi) e aggiungi righe direttamente.
In futuro si può aggiungere una schermata admin nell'app.

---

## 💰 Costi

| Servizio | Piano gratuito |
|----------|---------------|
| Supabase | 500MB database, 50.000 utenti auth, illimitato |
| Vercel | Hosting illimitato per progetti personali |

Per 6-15 persone con uso normale: **GRATIS per sempre** (o quasi).

---

## 🆘 Problemi comuni

**"Profilo non trovato nel sistema"**
→ L'utente esiste in Authentication ma manca la riga nella tabella `utenti`. Aggiungila.

**"Invalid API key"**
→ Le env variables non sono state inserite correttamente su Vercel. Controlla Settings > Environment Variables.

**Pagina bianca dopo login**
→ Controlla che le RLS policy siano state create (esegui di nuovo la parte finale dello schema SQL).
