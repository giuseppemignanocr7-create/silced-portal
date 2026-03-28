-- ============================================================================
-- SILCED PORTAL — Arricchimento Schema
-- RPC functions, storage, seed data, policies extra, indici aggiuntivi
-- ============================================================================

-- ============================================================================
-- 1. FUNZIONI RPC AVANZATE
-- ============================================================================

-- Dashboard stats per admin (singola chiamata)
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'pratiche_attive', (SELECT COUNT(*) FROM public.pratiche WHERE stato NOT IN ('completata', 'annullata', 'rifiutata')),
    'pratiche_oggi', (SELECT COUNT(*) FROM public.pratiche WHERE created_at::date = CURRENT_DATE),
    'pratiche_completate_mese', (SELECT COUNT(*) FROM public.pratiche WHERE stato = 'completata' AND completata_at >= date_trunc('month', CURRENT_DATE)),
    'contatti_nuovi', (SELECT COUNT(*) FROM public.contatti WHERE stato = 'nuovo'),
    'appuntamenti_prossimi', (SELECT COUNT(*) FROM public.appuntamenti WHERE data_ora >= NOW() AND stato IN ('prenotato', 'confermato')),
    'appuntamenti_oggi', (SELECT COUNT(*) FROM public.appuntamenti WHERE data_ora::date = CURRENT_DATE AND stato IN ('prenotato', 'confermato')),
    'partner_pendenti', (SELECT COUNT(*) FROM public.partner_richieste WHERE stato = 'richiesta'),
    'totale_associati', (SELECT COUNT(*) FROM public.profiles WHERE associato = TRUE),
    'totale_utenti', (SELECT COUNT(*) FROM public.profiles),
    'newsletter_attive', (SELECT COUNT(*) FROM public.newsletter WHERE stato = 'attiva'),
    'pratiche_urgenti', (SELECT COUNT(*) FROM public.pratiche WHERE priorita = 'urgente' AND stato NOT IN ('completata', 'annullata', 'rifiutata'))
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conteggio pratiche per stato (per grafici)
CREATE OR REPLACE FUNCTION public.get_pratiche_per_stato()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT stato, COUNT(*) as conteggio
    FROM public.pratiche
    GROUP BY stato
    ORDER BY conteggio DESC
  ) t;
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ricerca full-text su pratiche
CREATE OR REPLACE FUNCTION public.search_pratiche(search_query TEXT)
RETURNS SETOF public.pratiche AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.pratiche
  WHERE 
    codice ILIKE '%' || search_query || '%'
    OR titolo ILIKE '%' || search_query || '%'
    OR descrizione ILIKE '%' || search_query || '%'
  ORDER BY created_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Assegna pratica a operatore + notifica
CREATE OR REPLACE FUNCTION public.assegna_pratica(
  p_pratica_id UUID,
  p_operatore_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_utente_id UUID;
  v_codice TEXT;
BEGIN
  UPDATE public.pratiche 
  SET operatore_id = p_operatore_id, stato = 'in_lavorazione'
  WHERE id = p_pratica_id
  RETURNING utente_id, codice INTO v_utente_id, v_codice;

  IF v_utente_id IS NOT NULL THEN
    INSERT INTO public.notifiche (utente_id, titolo, messaggio, tipo, link)
    VALUES (
      v_utente_id,
      'Pratica presa in carico',
      'La pratica ' || v_codice || ' è stata presa in carico da un operatore.',
      'pratica',
      '/area-cliente/pratiche/' || p_pratica_id
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Completa pratica + notifica cliente
CREATE OR REPLACE FUNCTION public.completa_pratica(
  p_pratica_id UUID,
  p_esito TEXT DEFAULT 'Pratica completata con successo'
)
RETURNS VOID AS $$
DECLARE
  v_utente_id UUID;
  v_codice TEXT;
BEGIN
  UPDATE public.pratiche 
  SET stato = 'completata', esito = p_esito, completata_at = NOW()
  WHERE id = p_pratica_id
  RETURNING utente_id, codice INTO v_utente_id, v_codice;

  IF v_utente_id IS NOT NULL THEN
    INSERT INTO public.notifiche (utente_id, titolo, messaggio, tipo, link)
    VALUES (
      v_utente_id,
      'Pratica completata!',
      'La pratica ' || v_codice || ' è stata completata. Esito: ' || p_esito,
      'success',
      '/area-cliente/pratiche/' || p_pratica_id
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Richiedi documenti al cliente + notifica
CREATE OR REPLACE FUNCTION public.richiedi_documenti(
  p_pratica_id UUID,
  p_messaggio TEXT
)
RETURNS VOID AS $$
DECLARE
  v_utente_id UUID;
  v_codice TEXT;
BEGIN
  UPDATE public.pratiche 
  SET stato = 'attesa_documenti', note_interne = COALESCE(note_interne, '') || E'\n[' || NOW()::text || '] Richiesta documenti: ' || p_messaggio
  WHERE id = p_pratica_id
  RETURNING utente_id, codice INTO v_utente_id, v_codice;

  IF v_utente_id IS NOT NULL THEN
    INSERT INTO public.notifiche (utente_id, titolo, messaggio, tipo, link)
    VALUES (
      v_utente_id,
      'Documenti richiesti',
      'Per la pratica ' || v_codice || ' servono documenti aggiuntivi: ' || p_messaggio,
      'warning',
      '/area-cliente/pratiche/' || p_pratica_id
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Statistiche mensili automatiche
CREATE OR REPLACE FUNCTION public.aggiorna_statistiche_giornaliere()
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.statistiche_giornaliere (data, pratiche_nuove, pratiche_chiuse, contatti_nuovi, appuntamenti, iscrizioni_corsi, partner_richieste)
  VALUES (
    CURRENT_DATE,
    (SELECT COUNT(*) FROM public.pratiche WHERE created_at::date = CURRENT_DATE),
    (SELECT COUNT(*) FROM public.pratiche WHERE completata_at::date = CURRENT_DATE),
    (SELECT COUNT(*) FROM public.contatti WHERE created_at::date = CURRENT_DATE),
    (SELECT COUNT(*) FROM public.appuntamenti WHERE created_at::date = CURRENT_DATE),
    (SELECT COUNT(*) FROM public.iscrizioni_corsi WHERE created_at::date = CURRENT_DATE),
    (SELECT COUNT(*) FROM public.partner_richieste WHERE created_at::date = CURRENT_DATE)
  )
  ON CONFLICT (data) DO UPDATE SET
    pratiche_nuove = EXCLUDED.pratiche_nuove,
    pratiche_chiuse = EXCLUDED.pratiche_chiuse,
    contatti_nuovi = EXCLUDED.contatti_nuovi,
    appuntamenti = EXCLUDED.appuntamenti,
    iscrizioni_corsi = EXCLUDED.iscrizioni_corsi,
    partner_richieste = EXCLUDED.partner_richieste;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conta notifiche non lette per utente
CREATE OR REPLACE FUNCTION public.count_unread_notifications(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  cnt INTEGER;
BEGIN
  SELECT COUNT(*) INTO cnt FROM public.notifiche WHERE utente_id = p_user_id AND letta = FALSE;
  RETURN cnt;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Segna tutte le notifiche come lette
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifiche SET letta = TRUE WHERE utente_id = p_user_id AND letta = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. TRIGGER: NOTIFICA AUTOMATICA SU NUOVA PRATICA (per admin)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.notify_new_pratica()
RETURNS TRIGGER AS $$
DECLARE
  admin_rec RECORD;
BEGIN
  FOR admin_rec IN SELECT id FROM public.profiles WHERE ruolo IN ('admin', 'operatore')
  LOOP
    INSERT INTO public.notifiche (utente_id, titolo, messaggio, tipo, link)
    VALUES (
      admin_rec.id,
      'Nuova pratica ricevuta',
      'Nuova pratica: ' || NEW.titolo || ' (cod. ' || COALESCE(NEW.codice, 'in generazione') || ')',
      'pratica',
      '/admin'
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_pratica
  AFTER INSERT ON public.pratiche
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_pratica();

-- Notifica su nuovo contatto
CREATE OR REPLACE FUNCTION public.notify_new_contatto()
RETURNS TRIGGER AS $$
DECLARE
  admin_rec RECORD;
BEGIN
  FOR admin_rec IN SELECT id FROM public.profiles WHERE ruolo IN ('admin', 'operatore')
  LOOP
    INSERT INTO public.notifiche (utente_id, titolo, messaggio, tipo, link)
    VALUES (
      admin_rec.id,
      'Nuovo contatto ricevuto',
      NEW.nome || ' ' || NEW.cognome || ': ' || LEFT(NEW.messaggio, 100),
      'info',
      '/admin'
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_contatto
  AFTER INSERT ON public.contatti
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_contatto();

-- Notifica su nuovo appuntamento
CREATE OR REPLACE FUNCTION public.notify_new_appuntamento()
RETURNS TRIGGER AS $$
DECLARE
  admin_rec RECORD;
BEGIN
  FOR admin_rec IN SELECT id FROM public.profiles WHERE ruolo IN ('admin', 'operatore')
  LOOP
    INSERT INTO public.notifiche (utente_id, titolo, messaggio, tipo, link)
    VALUES (
      admin_rec.id,
      'Nuovo appuntamento prenotato',
      NEW.nome || ' ' || NEW.cognome || ' — ' || to_char(NEW.data_ora, 'DD/MM/YYYY HH24:MI'),
      'info',
      '/admin'
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_appuntamento
  AFTER INSERT ON public.appuntamenti
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_appuntamento();

-- ============================================================================
-- 3. STORAGE BUCKETS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documenti-pratiche', 'documenti-pratiche', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('avatar-utenti', 'avatar-utenti', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Utenti caricano propri documenti" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documenti-pratiche' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Utenti vedono propri documenti" ON storage.objects
  FOR SELECT USING (bucket_id = 'documenti-pratiche' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admin vedono tutti i documenti" ON storage.objects
  FOR SELECT USING (bucket_id = 'documenti-pratiche' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo IN ('admin', 'operatore')));

CREATE POLICY "Avatar pubblici in lettura" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatar-utenti');

CREATE POLICY "Utenti caricano proprio avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatar-utenti' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- 4. INDICI AGGIUNTIVI PER PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_pratiche_utente_stato ON public.pratiche(utente_id, stato);
CREATE INDEX IF NOT EXISTS idx_pratiche_created_date ON public.pratiche(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifiche_non_lette ON public.notifiche(utente_id) WHERE letta = FALSE;
CREATE INDEX IF NOT EXISTS idx_appuntamenti_prossimi ON public.appuntamenti(data_ora) WHERE stato IN ('prenotato', 'confermato');
CREATE INDEX IF NOT EXISTS idx_contatti_nuovi ON public.contatti(created_at DESC) WHERE stato = 'nuovo';

-- ============================================================================
-- 5. SEED DATA: Categorie, Servizi, FAQ, Corsi, Sportelli
-- ============================================================================

-- Categorie servizi
INSERT INTO public.categorie_servizi (slug, titolo, descrizione, icona, ordine) VALUES
  ('caf-patronato', 'CAF e Patronato', 'Servizi fiscali e previdenziali per cittadini e famiglie', 'FileCheck', 1),
  ('lavoro-pensioni', 'Lavoro e Pensioni', 'Consulenza lavorativa, pensioni, NASpI e disoccupazione', 'Briefcase', 2),
  ('famiglie', 'Famiglie', 'Assegni familiari, bonus, maternità e tutela minori', 'Users', 3),
  ('stranieri', 'Stranieri', 'Permessi di soggiorno, cittadinanza, ricongiungimento familiare', 'Globe', 4),
  ('casa', 'Casa', 'IMU, TASI, successioni, contratti locazione', 'Home', 5),
  ('certificati', 'Certificati', 'SPID, CIE, certificati anagrafici e previdenziali', 'FileCheck', 6)
ON CONFLICT (slug) DO NOTHING;

-- Servizi
INSERT INTO public.servizi (categoria_id, slug, titolo, descrizione, prezzo, prezzo_associati, tempo_medio_giorni, documenti_richiesti, popolare, ordine) VALUES
  ((SELECT id FROM categorie_servizi WHERE slug='caf-patronato'), 'isee', 'Calcolo ISEE', 'Indicatore situazione economica equivalente per accesso a bonus e agevolazioni', 30.00, 0.00, 5, ARRAY['Documento identità', 'Codice fiscale', 'CU', 'Saldi conti', 'Giacenza media', 'Visure catastali'], true, 1),
  ((SELECT id FROM categorie_servizi WHERE slug='caf-patronato'), 'modello-730', 'Modello 730', 'Dichiarazione dei redditi per lavoratori dipendenti e pensionati', 50.00, 25.00, 10, ARRAY['CU', 'Spese mediche', 'Interessi mutuo', 'Ricevute affitto'], true, 2),
  ((SELECT id FROM categorie_servizi WHERE slug='caf-patronato'), 'red', 'Modello RED', 'Dichiarazione reddituale per pensionati INPS', 20.00, 0.00, 7, ARRAY['Documento identità', 'Codice fiscale', 'Certificato pensione'], false, 3),
  ((SELECT id FROM categorie_servizi WHERE slug='lavoro-pensioni'), 'naspi', 'NASpI', 'Indennità di disoccupazione per chi perde il lavoro involontariamente', 40.00, 15.00, 15, ARRAY['Documento identità', 'Lettera licenziamento', 'Ultime buste paga', 'IBAN'], true, 1),
  ((SELECT id FROM categorie_servizi WHERE slug='lavoro-pensioni'), 'pensione-vecchiaia', 'Pensione di Vecchiaia', 'Domanda pensione al raggiungimento requisiti anagrafici e contributivi', 60.00, 30.00, 30, ARRAY['Estratto conto INPS', 'Documento identità', 'Ultima busta paga'], true, 2),
  ((SELECT id FROM categorie_servizi WHERE slug='lavoro-pensioni'), 'pensione-anticipata', 'Pensione Anticipata', 'Domanda pensione anticipata con requisiti contributivi', 60.00, 30.00, 30, ARRAY['Estratto conto INPS', 'Documento identità'], false, 3),
  ((SELECT id FROM categorie_servizi WHERE slug='famiglie'), 'assegno-unico', 'Assegno Unico', 'Assegno universale per figli a carico under 21', 25.00, 0.00, 10, ARRAY['ISEE', 'Documento identità', 'CF figli', 'IBAN'], true, 1),
  ((SELECT id FROM categorie_servizi WHERE slug='famiglie'), 'bonus-nido', 'Bonus Nido', 'Contributo per rette asili nido pubblici e privati', 25.00, 0.00, 15, ARRAY['ISEE', 'Ricevute rette nido', 'CF minore'], false, 2),
  ((SELECT id FROM categorie_servizi WHERE slug='stranieri'), 'permesso-soggiorno', 'Permesso di Soggiorno', 'Rinnovo e primo rilascio permesso di soggiorno', 80.00, 50.00, 45, ARRAY['Passaporto', 'Contratto lavoro/studio', 'Codice fiscale', 'Foto tessera'], true, 1),
  ((SELECT id FROM categorie_servizi WHERE slug='casa'), 'imu', 'Calcolo IMU', 'Calcolo e pagamento imposta municipale propria', 25.00, 10.00, 3, ARRAY['Visura catastale', 'Atto di proprietà'], false, 1),
  ((SELECT id FROM categorie_servizi WHERE slug='casa'), 'successione', 'Dichiarazione di Successione', 'Pratica successoria completa per trasferimento beni', 200.00, 150.00, 60, ARRAY['Certificato morte', 'Atti proprietà', 'Stato famiglia', 'Testamento se presente'], false, 2),
  ((SELECT id FROM categorie_servizi WHERE slug='certificati'), 'spid', 'Attivazione SPID', 'Identità digitale per accesso ai servizi della pubblica amministrazione', 15.00, 0.00, 1, ARRAY['Documento identità', 'Tessera sanitaria', 'Email', 'Cellulare'], true, 1)
ON CONFLICT (slug) DO NOTHING;

-- FAQ
INSERT INTO public.faq (domanda, risposta, categoria, ordine) VALUES
  ('Quanto costa il calcolo ISEE?', 'Per gli associati SILCED il calcolo ISEE è gratuito. Per i non associati il costo parte da €30. L''associazione annuale costa solo €25 e include molti servizi gratuiti.', 'ISEE', 1),
  ('Quali documenti servono per l''ISEE?', 'Documento d''identità, codice fiscale di tutti i componenti, CU, saldi e giacenza media dei conti correnti al 31/12, visure catastali, certificazione disabilità (se presente).', 'ISEE', 2),
  ('Quanto tempo ci vuole per avere l''ISEE?', 'Normalmente 5-7 giorni lavorativi dalla consegna di tutti i documenti. In periodi di picco (gennaio-marzo) può richiedere fino a 15 giorni.', 'ISEE', 3),
  ('Posso fare il 730 online?', 'Sì, con SILCED puoi fare il 730 completamente online. Invii i documenti tramite il portale e un operatore si occupa della compilazione e dell''invio.', '730', 4),
  ('Cos''è la NASpI e chi può richiederla?', 'La NASpI è l''indennità di disoccupazione per chi perde involontariamente il lavoro. Serve avere almeno 13 settimane di contributi negli ultimi 4 anni. La domanda va presentata entro 68 giorni.', 'Lavoro', 5),
  ('Come prenoto un appuntamento?', 'Puoi prenotare online dal tuo account nella sezione Appuntamenti, oppure chiamando il numero verde 800.123.456, oppure tramite l''assistente AI del nostro sito.', 'Generale', 6),
  ('SILCED ha sportelli nella mia città?', 'SILCED ha oltre 200 sportelli in tutta Italia. Puoi trovare quello più vicino nella sezione Contatti del nostro sito o chiamando il numero verde.', 'Generale', 7),
  ('Come divento associato SILCED?', 'L''associazione costa €25/anno e ti dà diritto a molti servizi gratuiti o scontati. Puoi associarti online o presso qualsiasi sportello SILCED.', 'Generale', 8)
ON CONFLICT DO NOTHING;

-- Corsi formazione
INSERT INTO public.corsi (titolo, slug, descrizione, durata_ore, livello, prezzo, prezzo_associati, max_partecipanti, modalita, docente, attestato) VALUES
  ('Operatore CAF Base', 'operatore-caf-base', 'Corso completo per diventare operatore CAF: normativa fiscale, compilazione modelli, gestione clienti', 120, 'base', 890.00, 690.00, 25, 'misto', 'Dott. Marco Bianchi', true),
  ('Operatore Patronato', 'operatore-patronato', 'Formazione per operatore patronato: previdenza, assistenza sociale, pratiche INPS/INAIL', 100, 'base', 790.00, 590.00, 25, 'misto', 'Dott.ssa Laura Verdi', true),
  ('Aggiornamento Fiscale 2026', 'aggiornamento-fiscale-2026', 'Novità normative 2026: nuove aliquote, bonus, detrazioni e scadenze', 16, 'aggiornamento', 190.00, 90.00, 40, 'online', 'Dott. Paolo Neri', true),
  ('ISEE Avanzato', 'isee-avanzato', 'Approfondimento ISEE: casi complessi, DSU precompilata, ISEE corrente, contenzioso', 24, 'avanzato', 290.00, 190.00, 30, 'online', 'Dott.ssa Anna Rossi', true),
  ('Gestione Pratiche Pensionistiche', 'pratiche-pensionistiche', 'Corso specialistico su pensioni: vecchiaia, anticipata, superstiti, invalidità, ricongiunzione', 40, 'intermedio', 490.00, 350.00, 30, 'misto', 'Dott. Giuseppe Ferrara', true)
ON CONFLICT (slug) DO NOTHING;

-- Sportelli
INSERT INTO public.sportelli (nome, indirizzo, citta, cap, provincia, regione, telefono, email, latitudine, longitudine) VALUES
  ('SILCED Roma Centro', 'Via del Corso 120', 'Roma', '00186', 'RM', 'Lazio', '06.1234567', 'roma.centro@silced.it', 41.9027835, 12.4963655),
  ('SILCED Milano Centrale', 'Via Torino 45', 'Milano', '20123', 'MI', 'Lombardia', '02.9876543', 'milano@silced.it', 45.4642035, 9.1899750),
  ('SILCED Napoli', 'Via Toledo 200', 'Napoli', '80132', 'NA', 'Campania', '081.7654321', 'napoli@silced.it', 40.8396200, 14.2507700),
  ('SILCED Torino', 'Via Po 30', 'Torino', '10124', 'TO', 'Piemonte', '011.3456789', 'torino@silced.it', 45.0703393, 7.6868565),
  ('SILCED Bologna', 'Via Indipendenza 15', 'Bologna', '40121', 'BO', 'Emilia-Romagna', '051.2345678', 'bologna@silced.it', 44.4949016, 11.3426163)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. POLICIES AGGIUNTIVE per le nuove funzioni RPC
-- ============================================================================

-- Permettere INSERT anonimi per newsletter (form pubblico)
ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chiunque può iscriversi alla newsletter" ON public.newsletter FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin gestiscono newsletter" ON public.newsletter FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'admin')
);

-- Audit log: solo admin possono leggere
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin leggono audit log" ON public.audit_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'admin')
);

-- Statistiche: solo admin
ALTER TABLE public.statistiche_giornaliere ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin leggono statistiche" ON public.statistiche_giornaliere FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'admin')
);

-- ============================================================================
-- 7. GRANT EXECUTE sulle funzioni RPC
-- ============================================================================
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pratiche_per_stato() TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_pratiche(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assegna_pratica(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.completa_pratica(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.richiedi_documenti(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.aggiorna_statistiche_giornaliere() TO authenticated;
GRANT EXECUTE ON FUNCTION public.count_unread_notifications(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read(UUID) TO authenticated;
