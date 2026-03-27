-- ============================================================================
-- SILCED PORTAL — Schema Database Completo
-- Ingegneria SQL: RLS, trigger, indici, enum, audit trail
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. ENUM TYPES
-- ============================================================================
CREATE TYPE pratica_stato AS ENUM (
  'ricevuta', 'verifica_documenti', 'in_lavorazione', 
  'attesa_ente', 'attesa_documenti', 'completata', 'rifiutata', 'annullata'
);

CREATE TYPE pratica_priorita AS ENUM ('bassa', 'normale', 'alta', 'urgente');

CREATE TYPE contatto_stato AS ENUM ('nuovo', 'in_gestione', 'risolto', 'archiviato');

CREATE TYPE partner_stato AS ENUM ('richiesta', 'valutazione', 'approvato', 'attivo', 'sospeso', 'rifiutato');

CREATE TYPE corso_livello AS ENUM ('base', 'intermedio', 'avanzato', 'aggiornamento');

CREATE TYPE iscrizione_stato AS ENUM ('in_attesa', 'confermata', 'completata', 'annullata');

CREATE TYPE appuntamento_stato AS ENUM ('prenotato', 'confermato', 'completato', 'annullato', 'no_show');

CREATE TYPE newsletter_stato AS ENUM ('attiva', 'disiscritto', 'bounced');

-- ============================================================================
-- 3. PROFILI UTENTE (estende auth.users di Supabase)
-- ============================================================================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  nome          TEXT,
  cognome       TEXT,
  telefono      TEXT,
  codice_fiscale TEXT UNIQUE,
  data_nascita  DATE,
  indirizzo     TEXT,
  citta         TEXT,
  cap           TEXT CHECK (cap ~ '^\d{5}$'),
  provincia     TEXT CHECK (LENGTH(provincia) = 2),
  ruolo         TEXT NOT NULL DEFAULT 'utente' CHECK (ruolo IN ('utente', 'operatore', 'admin', 'partner')),
  avatar_url    TEXT,
  associato     BOOLEAN DEFAULT FALSE,
  numero_tessera TEXT UNIQUE,
  data_associazione DATE,
  note          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_ruolo ON public.profiles(ruolo);
CREATE INDEX idx_profiles_cf ON public.profiles(codice_fiscale);

-- ============================================================================
-- 4. CATEGORIE SERVIZI
-- ============================================================================
CREATE TABLE public.categorie_servizi (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  titolo      TEXT NOT NULL,
  descrizione TEXT,
  icona       TEXT DEFAULT 'FileCheck',
  ordine      INTEGER DEFAULT 0,
  attivo      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categorie_slug ON public.categorie_servizi(slug);

-- ============================================================================
-- 5. SERVIZI
-- ============================================================================
CREATE TABLE public.servizi (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id  UUID REFERENCES public.categorie_servizi(id) ON DELETE SET NULL,
  slug          TEXT UNIQUE NOT NULL,
  titolo        TEXT NOT NULL,
  descrizione   TEXT,
  descrizione_lunga TEXT,
  icona         TEXT DEFAULT 'FileCheck',
  prezzo        DECIMAL(10,2),
  prezzo_associati DECIMAL(10,2),
  tempo_medio_giorni INTEGER,
  documenti_richiesti TEXT[],
  popolare      BOOLEAN DEFAULT FALSE,
  attivo        BOOLEAN DEFAULT TRUE,
  ordine        INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_servizi_slug ON public.servizi(slug);
CREATE INDEX idx_servizi_categoria ON public.servizi(categoria_id);
CREATE INDEX idx_servizi_popolare ON public.servizi(popolare) WHERE popolare = TRUE;

-- ============================================================================
-- 6. PRATICHE (core business — tracking sistema)
-- ============================================================================
CREATE TABLE public.pratiche (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codice          TEXT UNIQUE NOT NULL,
  utente_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  operatore_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  servizio_id     UUID REFERENCES public.servizi(id) ON DELETE SET NULL,
  sportello_id    UUID,
  stato           pratica_stato DEFAULT 'ricevuta',
  priorita        pratica_priorita DEFAULT 'normale',
  titolo          TEXT NOT NULL,
  descrizione     TEXT,
  note_interne    TEXT,
  documenti_urls  TEXT[],
  data_scadenza   DATE,
  importo         DECIMAL(10,2),
  esito           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  completata_at   TIMESTAMPTZ
);

CREATE INDEX idx_pratiche_codice ON public.pratiche(codice);
CREATE INDEX idx_pratiche_utente ON public.pratiche(utente_id);
CREATE INDEX idx_pratiche_operatore ON public.pratiche(operatore_id);
CREATE INDEX idx_pratiche_stato ON public.pratiche(stato);
CREATE INDEX idx_pratiche_servizio ON public.pratiche(servizio_id);
CREATE INDEX idx_pratiche_scadenza ON public.pratiche(data_scadenza) WHERE completata_at IS NULL;

-- ============================================================================
-- 7. TIMELINE PRATICHE (storico step — per tracking UI)
-- ============================================================================
CREATE TABLE public.pratiche_timeline (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pratica_id  UUID NOT NULL REFERENCES public.pratiche(id) ON DELETE CASCADE,
  stato       pratica_stato NOT NULL,
  titolo      TEXT NOT NULL,
  descrizione TEXT,
  operatore_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  automatico  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeline_pratica ON public.pratiche_timeline(pratica_id);
CREATE INDEX idx_timeline_data ON public.pratiche_timeline(created_at DESC);

-- ============================================================================
-- 8. CONTATTI / RICHIESTE (form contatti + richieste servizi)
-- ============================================================================
CREATE TABLE public.contatti (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utente_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  nome        TEXT NOT NULL,
  cognome     TEXT NOT NULL,
  email       TEXT NOT NULL,
  telefono    TEXT,
  servizio    TEXT,
  messaggio   TEXT NOT NULL,
  stato       contatto_stato DEFAULT 'nuovo',
  operatore_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  risposta    TEXT,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  risolto_at  TIMESTAMPTZ
);

CREATE INDEX idx_contatti_stato ON public.contatti(stato);
CREATE INDEX idx_contatti_email ON public.contatti(email);
CREATE INDEX idx_contatti_data ON public.contatti(created_at DESC);

-- ============================================================================
-- 9. RICHIESTE PARTNERSHIP
-- ============================================================================
CREATE TABLE public.partner_richieste (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT NOT NULL,
  cognome       TEXT NOT NULL,
  email         TEXT NOT NULL,
  telefono      TEXT NOT NULL,
  citta         TEXT NOT NULL,
  provincia     TEXT,
  messaggio     TEXT,
  esperienza    TEXT,
  stato         partner_stato DEFAULT 'richiesta',
  note_interne  TEXT,
  operatore_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  data_colloquio TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partner_stato ON public.partner_richieste(stato);
CREATE INDEX idx_partner_data ON public.partner_richieste(created_at DESC);

-- ============================================================================
-- 10. SPORTELLI / SEDI
-- ============================================================================
CREATE TABLE public.sportelli (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  indirizzo   TEXT NOT NULL,
  citta       TEXT NOT NULL,
  cap         TEXT CHECK (cap ~ '^\d{5}$'),
  provincia   TEXT CHECK (LENGTH(provincia) = 2),
  regione     TEXT,
  telefono    TEXT,
  email       TEXT,
  latitudine  DECIMAL(10,7),
  longitudine DECIMAL(10,7),
  orari       JSONB DEFAULT '{"lun_ven": "9:00-18:00", "sabato": "9:00-12:00", "domenica": "chiuso"}'::jsonb,
  partner_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  attivo      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sportelli_citta ON public.sportelli(citta);
CREATE INDEX idx_sportelli_provincia ON public.sportelli(provincia);
CREATE INDEX idx_sportelli_geo ON public.sportelli(latitudine, longitudine);

-- ============================================================================
-- 11. APPUNTAMENTI
-- ============================================================================
CREATE TABLE public.appuntamenti (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utente_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sportello_id  UUID REFERENCES public.sportelli(id) ON DELETE SET NULL,
  operatore_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  servizio_id   UUID REFERENCES public.servizi(id) ON DELETE SET NULL,
  data_ora      TIMESTAMPTZ NOT NULL,
  durata_minuti INTEGER DEFAULT 30,
  stato         appuntamento_stato DEFAULT 'prenotato',
  note          TEXT,
  nome          TEXT NOT NULL,
  cognome       TEXT NOT NULL,
  email         TEXT NOT NULL,
  telefono      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appuntamenti_data ON public.appuntamenti(data_ora);
CREATE INDEX idx_appuntamenti_sportello ON public.appuntamenti(sportello_id, data_ora);
CREATE INDEX idx_appuntamenti_utente ON public.appuntamenti(utente_id);
CREATE INDEX idx_appuntamenti_stato ON public.appuntamenti(stato);

-- ============================================================================
-- 12. CORSI FORMAZIONE
-- ============================================================================
CREATE TABLE public.corsi (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titolo          TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  descrizione     TEXT,
  descrizione_lunga TEXT,
  durata_ore      INTEGER NOT NULL,
  livello         corso_livello DEFAULT 'base',
  prezzo          DECIMAL(10,2) NOT NULL,
  prezzo_associati DECIMAL(10,2),
  max_partecipanti INTEGER DEFAULT 30,
  data_inizio     DATE,
  data_fine       DATE,
  modalita        TEXT DEFAULT 'aula' CHECK (modalita IN ('aula', 'online', 'misto')),
  docente         TEXT,
  programma       TEXT[],
  requisiti       TEXT,
  attestato       BOOLEAN DEFAULT TRUE,
  immagine_url    TEXT,
  attivo          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_corsi_slug ON public.corsi(slug);
CREATE INDEX idx_corsi_livello ON public.corsi(livello);
CREATE INDEX idx_corsi_data ON public.corsi(data_inizio);

-- ============================================================================
-- 13. ISCRIZIONI CORSI
-- ============================================================================
CREATE TABLE public.iscrizioni_corsi (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corso_id    UUID NOT NULL REFERENCES public.corsi(id) ON DELETE CASCADE,
  utente_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  nome        TEXT NOT NULL,
  cognome     TEXT NOT NULL,
  email       TEXT NOT NULL,
  telefono    TEXT,
  stato       iscrizione_stato DEFAULT 'in_attesa',
  pagamento   BOOLEAN DEFAULT FALSE,
  importo     DECIMAL(10,2),
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_iscrizioni_corso ON public.iscrizioni_corsi(corso_id);
CREATE INDEX idx_iscrizioni_utente ON public.iscrizioni_corsi(utente_id);

-- ============================================================================
-- 14. NEWS / ARTICOLI
-- ============================================================================
CREATE TABLE public.articoli (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  titolo          TEXT NOT NULL,
  excerpt         TEXT,
  contenuto       TEXT,
  categoria       TEXT NOT NULL,
  immagine_url    TEXT,
  autore_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  pubblicato      BOOLEAN DEFAULT FALSE,
  in_evidenza     BOOLEAN DEFAULT FALSE,
  visualizzazioni INTEGER DEFAULT 0,
  tags            TEXT[],
  meta_title      TEXT,
  meta_description TEXT,
  pubblicato_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_articoli_slug ON public.articoli(slug);
CREATE INDEX idx_articoli_categoria ON public.articoli(categoria);
CREATE INDEX idx_articoli_pubblicato ON public.articoli(pubblicato, pubblicato_at DESC);
CREATE INDEX idx_articoli_evidenza ON public.articoli(in_evidenza) WHERE in_evidenza = TRUE;
CREATE INDEX idx_articoli_tags ON public.articoli USING GIN(tags);

-- ============================================================================
-- 15. FAQ
-- ============================================================================
CREATE TABLE public.faq (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domanda     TEXT NOT NULL,
  risposta    TEXT NOT NULL,
  categoria   TEXT NOT NULL,
  ordine      INTEGER DEFAULT 0,
  attivo      BOOLEAN DEFAULT TRUE,
  visualizzazioni INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_faq_categoria ON public.faq(categoria);
CREATE INDEX idx_faq_attivo ON public.faq(attivo, ordine);

-- ============================================================================
-- 16. NEWSLETTER
-- ============================================================================
CREATE TABLE public.newsletter (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  nome        TEXT,
  stato       newsletter_stato DEFAULT 'attiva',
  fonte       TEXT DEFAULT 'sito',
  ip_address  INET,
  token_unsubscribe TEXT UNIQUE DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  disiscritto_at TIMESTAMPTZ
);

CREATE INDEX idx_newsletter_email ON public.newsletter(email);
CREATE INDEX idx_newsletter_stato ON public.newsletter(stato);

-- ============================================================================
-- 17. DOCUMENTI CARICATI
-- ============================================================================
CREATE TABLE public.documenti (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pratica_id  UUID REFERENCES public.pratiche(id) ON DELETE CASCADE,
  utente_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  nome_file   TEXT NOT NULL,
  tipo_file   TEXT,
  dimensione  BIGINT,
  storage_path TEXT NOT NULL,
  categoria   TEXT,
  verificato  BOOLEAN DEFAULT FALSE,
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documenti_pratica ON public.documenti(pratica_id);
CREATE INDEX idx_documenti_utente ON public.documenti(utente_id);

-- ============================================================================
-- 18. NOTIFICHE
-- ============================================================================
CREATE TABLE public.notifiche (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utente_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titolo      TEXT NOT NULL,
  messaggio   TEXT NOT NULL,
  tipo        TEXT DEFAULT 'info' CHECK (tipo IN ('info', 'success', 'warning', 'error', 'pratica')),
  link        TEXT,
  letta       BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifiche_utente ON public.notifiche(utente_id, letta, created_at DESC);

-- ============================================================================
-- 19. LOG CHAT AI (storico conversazioni assistente)
-- ============================================================================
CREATE TABLE public.chat_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  TEXT NOT NULL,
  utente_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  messaggio   TEXT NOT NULL,
  risposta    TEXT NOT NULL,
  intent      TEXT,
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_session ON public.chat_log(session_id);
CREATE INDEX idx_chat_utente ON public.chat_log(utente_id);
CREATE INDEX idx_chat_data ON public.chat_log(created_at DESC);

-- ============================================================================
-- 20. AUDIT LOG (tracciamento modifiche)
-- ============================================================================
CREATE TABLE public.audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabella     TEXT NOT NULL,
  record_id   UUID NOT NULL,
  azione      TEXT NOT NULL CHECK (azione IN ('INSERT', 'UPDATE', 'DELETE')),
  dati_vecchi JSONB,
  dati_nuovi  JSONB,
  utente_id   UUID,
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_tabella ON public.audit_log(tabella, record_id);
CREATE INDEX idx_audit_data ON public.audit_log(created_at DESC);
CREATE INDEX idx_audit_utente ON public.audit_log(utente_id);

-- ============================================================================
-- 21. STATISTICHE DASHBOARD (materializzata per performance)
-- ============================================================================
CREATE TABLE public.statistiche_giornaliere (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data            DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  pratiche_nuove  INTEGER DEFAULT 0,
  pratiche_chiuse INTEGER DEFAULT 0,
  contatti_nuovi  INTEGER DEFAULT 0,
  appuntamenti    INTEGER DEFAULT 0,
  iscrizioni_corsi INTEGER DEFAULT 0,
  partner_richieste INTEGER DEFAULT 0,
  visite_sito     INTEGER DEFAULT 0,
  chat_sessioni   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_stats_data ON public.statistiche_giornaliere(data);

-- ============================================================================
-- 22. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate codice pratica
CREATE OR REPLACE FUNCTION public.generate_codice_pratica()
RETURNS TRIGGER AS $$
DECLARE
  anno TEXT;
  seq INTEGER;
BEGIN
  anno := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SPLIT_PART(codice, '-', 3) AS INTEGER)), 0) + 1
  INTO seq
  FROM public.pratiche
  WHERE codice LIKE 'SILCED-' || anno || '-%';
  
  NEW.codice := 'SILCED-' || anno || '-' || LPAD(seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-insert timeline on pratica stato change
CREATE OR REPLACE FUNCTION public.handle_pratica_stato_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stato IS DISTINCT FROM NEW.stato THEN
    INSERT INTO public.pratiche_timeline (pratica_id, stato, titolo, descrizione, automatico)
    VALUES (
      NEW.id,
      NEW.stato,
      CASE NEW.stato
        WHEN 'ricevuta' THEN 'Pratica ricevuta'
        WHEN 'verifica_documenti' THEN 'Verifica documenti'
        WHEN 'in_lavorazione' THEN 'In lavorazione'
        WHEN 'attesa_ente' THEN 'In attesa dell''ente'
        WHEN 'attesa_documenti' THEN 'In attesa documenti'
        WHEN 'completata' THEN 'Pratica completata'
        WHEN 'rifiutata' THEN 'Pratica rifiutata'
        WHEN 'annullata' THEN 'Pratica annullata'
      END,
      'Stato aggiornato automaticamente',
      TRUE
    );
    
    IF NEW.stato = 'completata' THEN
      NEW.completata_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, cognome)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    COALESCE(NEW.raw_user_meta_data->>'cognome', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 23. APPLY TRIGGERS
-- ============================================================================

-- updated_at triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.servizi FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pratiche FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.contatti FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.partner_richieste FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.corsi FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.iscrizioni_corsi FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.appuntamenti FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.articoli FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.faq FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Codice pratica auto-generation
CREATE TRIGGER generate_pratica_codice BEFORE INSERT ON public.pratiche FOR EACH ROW WHEN (NEW.codice IS NULL) EXECUTE FUNCTION generate_codice_pratica();

-- Pratica stato change → timeline auto
CREATE TRIGGER pratica_stato_timeline BEFORE UPDATE ON public.pratiche FOR EACH ROW EXECUTE FUNCTION handle_pratica_stato_change();

-- New user → profile auto
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- 24. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pratiche ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pratiche_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contatti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_richieste ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appuntamenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifiche ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iscrizioni_corsi ENABLE ROW LEVEL SECURITY;

-- Tabelle pubbliche (lettura)
ALTER TABLE public.categorie_servizi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servizi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corsi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articoli ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sportelli ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ policies
CREATE POLICY "Servizi visibili a tutti" ON public.categorie_servizi FOR SELECT USING (attivo = TRUE);
CREATE POLICY "Servizi dettaglio visibili a tutti" ON public.servizi FOR SELECT USING (attivo = TRUE);
CREATE POLICY "Corsi visibili a tutti" ON public.corsi FOR SELECT USING (attivo = TRUE);
CREATE POLICY "Articoli pubblicati visibili a tutti" ON public.articoli FOR SELECT USING (pubblicato = TRUE);
CREATE POLICY "FAQ attive visibili a tutti" ON public.faq FOR SELECT USING (attivo = TRUE);
CREATE POLICY "Sportelli attivi visibili a tutti" ON public.sportelli FOR SELECT USING (attivo = TRUE);

-- PROFILE policies
CREATE POLICY "Utenti vedono il proprio profilo" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Utenti aggiornano il proprio profilo" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin vedono tutti i profili" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'admin')
);

-- PRATICHE policies
CREATE POLICY "Utenti vedono le proprie pratiche" ON public.pratiche FOR SELECT USING (utente_id = auth.uid());
CREATE POLICY "Operatori vedono pratiche assegnate" ON public.pratiche FOR SELECT USING (operatore_id = auth.uid());
CREATE POLICY "Admin vedono tutte le pratiche" ON public.pratiche FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo IN ('admin', 'operatore'))
);

-- TIMELINE policies
CREATE POLICY "Utenti vedono timeline proprie pratiche" ON public.pratiche_timeline FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.pratiche WHERE id = pratica_id AND utente_id = auth.uid())
);

-- CONTATTI policies
CREATE POLICY "Chiunque può inviare un contatto" ON public.contatti FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin gestiscono contatti" ON public.contatti FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo IN ('admin', 'operatore'))
);

-- PARTNER policies
CREATE POLICY "Chiunque può inviare richiesta partner" ON public.partner_richieste FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin gestiscono partner" ON public.partner_richieste FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'admin')
);

-- APPUNTAMENTI policies
CREATE POLICY "Utenti vedono propri appuntamenti" ON public.appuntamenti FOR SELECT USING (utente_id = auth.uid());
CREATE POLICY "Chiunque può prenotare" ON public.appuntamenti FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin gestiscono appuntamenti" ON public.appuntamenti FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo IN ('admin', 'operatore'))
);

-- NOTIFICHE policies
CREATE POLICY "Utenti vedono proprie notifiche" ON public.notifiche FOR SELECT USING (utente_id = auth.uid());
CREATE POLICY "Utenti aggiornano proprie notifiche" ON public.notifiche FOR UPDATE USING (utente_id = auth.uid());

-- DOCUMENTI policies
CREATE POLICY "Utenti vedono propri documenti" ON public.documenti FOR SELECT USING (utente_id = auth.uid());
CREATE POLICY "Utenti caricano documenti" ON public.documenti FOR INSERT WITH CHECK (utente_id = auth.uid());

-- CHAT LOG policies
CREATE POLICY "Chiunque può loggare chat" ON public.chat_log FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Utenti vedono proprie chat" ON public.chat_log FOR SELECT USING (utente_id = auth.uid());

-- ISCRIZIONI policies
CREATE POLICY "Chiunque può iscriversi" ON public.iscrizioni_corsi FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Utenti vedono proprie iscrizioni" ON public.iscrizioni_corsi FOR SELECT USING (utente_id = auth.uid());

-- ============================================================================
-- 25. VIEWS UTILI
-- ============================================================================

-- Vista pratiche con info complete
CREATE VIEW public.v_pratiche_dettaglio AS
SELECT 
  p.*,
  s.titolo AS servizio_nome,
  s.icona AS servizio_icona,
  cs.titolo AS categoria_nome,
  u.nome AS utente_nome,
  u.cognome AS utente_cognome,
  u.email AS utente_email,
  op.nome AS operatore_nome,
  op.cognome AS operatore_cognome
FROM public.pratiche p
LEFT JOIN public.servizi s ON p.servizio_id = s.id
LEFT JOIN public.categorie_servizi cs ON s.categoria_id = cs.id
LEFT JOIN public.profiles u ON p.utente_id = u.id
LEFT JOIN public.profiles op ON p.operatore_id = op.id;

-- Vista dashboard statistiche
CREATE VIEW public.v_dashboard AS
SELECT
  (SELECT COUNT(*) FROM public.pratiche WHERE stato NOT IN ('completata', 'annullata', 'rifiutata')) AS pratiche_attive,
  (SELECT COUNT(*) FROM public.pratiche WHERE created_at >= CURRENT_DATE) AS pratiche_oggi,
  (SELECT COUNT(*) FROM public.contatti WHERE stato = 'nuovo') AS contatti_nuovi,
  (SELECT COUNT(*) FROM public.appuntamenti WHERE data_ora >= NOW() AND stato IN ('prenotato', 'confermato')) AS appuntamenti_prossimi,
  (SELECT COUNT(*) FROM public.partner_richieste WHERE stato = 'richiesta') AS partner_pendenti,
  (SELECT COUNT(*) FROM public.profiles WHERE associato = TRUE) AS totale_associati,
  (SELECT COUNT(*) FROM public.newsletter WHERE stato = 'attiva') AS newsletter_attive;
