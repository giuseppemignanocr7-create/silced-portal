-- ============================================================================
-- FIX: Profiles RLS recursion causing 500 error
-- The "Admin vedono tutti i profili" policy queries profiles table itself,
-- causing infinite recursion. Replace with auth.jwt() based check.
-- Also fix similar recursion in pratiche, contatti, partner, appuntamenti policies.
-- ============================================================================

-- Drop the recursive admin policy on profiles
DROP POLICY IF EXISTS "Admin vedono tutti i profili" ON public.profiles;

-- Recreate without recursion using auth.jwt() metadata
-- Users can always see their own profile
-- Admin can see all profiles (checked via a SECURITY DEFINER function)

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_or_operatore()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo IN ('admin', 'operatore')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_operatore() TO authenticated;

-- Fix profiles policies
CREATE POLICY "Admin vedono tutti i profili" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- Fix pratiche policies (drop and recreate the ones with subquery on profiles)
DROP POLICY IF EXISTS "Admin vedono tutte le pratiche" ON public.pratiche;
CREATE POLICY "Admin vedono tutte le pratiche" ON public.pratiche
  FOR ALL USING (public.is_admin_or_operatore());

DROP POLICY IF EXISTS "Operatori vedono pratiche assegnate" ON public.pratiche;
CREATE POLICY "Operatori vedono pratiche assegnate" ON public.pratiche
  FOR SELECT USING (operatore_id = auth.uid());

-- Fix contatti policies
DROP POLICY IF EXISTS "Admin gestiscono contatti" ON public.contatti;
CREATE POLICY "Admin gestiscono contatti" ON public.contatti
  FOR ALL USING (public.is_admin_or_operatore());

-- Fix partner policies
DROP POLICY IF EXISTS "Admin gestiscono partner" ON public.partner_richieste;
CREATE POLICY "Admin gestiscono partner" ON public.partner_richieste
  FOR ALL USING (public.is_admin());

-- Fix appuntamenti policies
DROP POLICY IF EXISTS "Admin gestiscono appuntamenti" ON public.appuntamenti;
CREATE POLICY "Admin gestiscono appuntamenti" ON public.appuntamenti
  FOR ALL USING (public.is_admin_or_operatore());

-- Fix timeline: admin/operatore can see all timelines
DROP POLICY IF EXISTS "Admin vedono tutte le timeline" ON public.pratiche_timeline;
CREATE POLICY "Admin vedono tutte le timeline" ON public.pratiche_timeline
  FOR SELECT USING (public.is_admin_or_operatore());

-- Fix notifiche: allow system inserts (for triggers)
DROP POLICY IF EXISTS "Sistema inserisce notifiche" ON public.notifiche;
CREATE POLICY "Sistema inserisce notifiche" ON public.notifiche
  FOR INSERT WITH CHECK (TRUE);

-- Fix documenti: admin can see all
DROP POLICY IF EXISTS "Admin vedono tutti i documenti" ON public.documenti;
CREATE POLICY "Admin vedono tutti i documenti" ON public.documenti
  FOR SELECT USING (public.is_admin_or_operatore());

-- Ensure newsletter can be inserted by anon
ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Chiunque può iscriversi newsletter" ON public.newsletter;
CREATE POLICY "Chiunque può iscriversi newsletter" ON public.newsletter
  FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Admin gestiscono newsletter" ON public.newsletter;
CREATE POLICY "Admin gestiscono newsletter" ON public.newsletter
  FOR SELECT USING (public.is_admin_or_operatore());

-- Grant anon INSERT on contatti and partner_richieste and newsletter
GRANT INSERT ON public.contatti TO anon;
GRANT INSERT ON public.partner_richieste TO anon;
GRANT INSERT ON public.newsletter TO anon;
