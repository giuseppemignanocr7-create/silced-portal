-- ============================================================================
-- FIX: Aggiungere policy INSERT per utenti autenticati sulle pratiche
-- e policy INSERT per notifiche (trigger le inserisce per conto del sistema)
-- ============================================================================

-- Utenti autenticati possono creare pratiche (con utente_id = auth.uid())
CREATE POLICY "Utenti creano proprie pratiche" ON public.pratiche 
  FOR INSERT WITH CHECK (utente_id = auth.uid());

-- Utenti possono aggiornare le proprie pratiche (es. aggiungere descrizione)
CREATE POLICY "Utenti aggiornano proprie pratiche" ON public.pratiche 
  FOR UPDATE USING (utente_id = auth.uid());

-- Notifiche: il sistema (trigger SECURITY DEFINER) inserisce notifiche,
-- ma serve anche una policy per INSERT tramite funzioni RPC
CREATE POLICY "Sistema inserisce notifiche" ON public.notifiche 
  FOR INSERT WITH CHECK (TRUE);

-- Timeline: admin/operatori vedono tutte le timeline
CREATE POLICY "Admin vedono tutte le timeline" ON public.pratiche_timeline 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo IN ('admin', 'operatore'))
  );

-- Appuntamenti: utenti possono aggiornare i propri (annullare)
CREATE POLICY "Utenti aggiornano propri appuntamenti" ON public.appuntamenti 
  FOR UPDATE USING (utente_id = auth.uid());

-- Fix: assicuriamo che le tabelle seed (categorie, servizi, faq, corsi, sportelli)
-- siano leggibili anche da utenti anonimi (anon role)
GRANT SELECT ON public.categorie_servizi TO anon;
GRANT SELECT ON public.servizi TO anon;
GRANT SELECT ON public.corsi TO anon;
GRANT SELECT ON public.articoli TO anon;
GRANT SELECT ON public.faq TO anon;
GRANT SELECT ON public.sportelli TO anon;

-- Grant per utenti autenticati su tabelle principali
GRANT SELECT, INSERT, UPDATE ON public.pratiche TO authenticated;
GRANT SELECT ON public.pratiche_timeline TO authenticated;
GRANT SELECT, INSERT ON public.appuntamenti TO authenticated;
GRANT SELECT, UPDATE ON public.appuntamenti TO authenticated;
GRANT SELECT, INSERT ON public.contatti TO authenticated;
GRANT SELECT ON public.contatti TO anon;
GRANT INSERT ON public.contatti TO anon;
GRANT SELECT, UPDATE ON public.notifiche TO authenticated;
GRANT SELECT, INSERT ON public.documenti TO authenticated;
GRANT INSERT ON public.chat_log TO authenticated;
GRANT INSERT ON public.chat_log TO anon;
GRANT SELECT ON public.chat_log TO authenticated;
GRANT INSERT ON public.partner_richieste TO anon;
GRANT INSERT ON public.partner_richieste TO authenticated;
GRANT INSERT ON public.newsletter TO anon;
GRANT INSERT ON public.newsletter TO authenticated;
GRANT SELECT, INSERT ON public.iscrizioni_corsi TO authenticated;
