-- ============================================================================
-- Funzione per promuovere un utente a admin/operatore (solo admin può usarla)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.promote_user(
  p_user_id UUID,
  p_ruolo TEXT DEFAULT 'operatore'
)
RETURNS VOID AS $$
BEGIN
  IF p_ruolo NOT IN ('utente', 'operatore', 'admin', 'partner') THEN
    RAISE EXCEPTION 'Ruolo non valido: %', p_ruolo;
  END IF;
  
  -- Verifica che chi chiama sia admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'admin') THEN
    RAISE EXCEPTION 'Solo gli admin possono promuovere utenti';
  END IF;
  
  UPDATE public.profiles SET ruolo = p_ruolo WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.promote_user(UUID, TEXT) TO authenticated;

-- Funzione per creare il primo admin (usa service_role, quindi va eseguita da SQL Editor)
-- Uso: SELECT make_first_admin('email@example.com');
CREATE OR REPLACE FUNCTION public.make_first_admin(p_email TEXT)
RETURNS TEXT AS $$
DECLARE
  v_id UUID;
BEGIN
  SELECT id INTO v_id FROM public.profiles WHERE email = p_email;
  IF v_id IS NULL THEN
    RETURN 'Utente non trovato con email: ' || p_email;
  END IF;
  UPDATE public.profiles SET ruolo = 'admin' WHERE id = v_id;
  RETURN 'Utente ' || p_email || ' promosso ad admin!';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Abilita realtime per notifiche
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifiche;
