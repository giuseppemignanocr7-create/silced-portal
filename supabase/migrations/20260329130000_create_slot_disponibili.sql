-- Migration: Create slot_disponibili table for appointment scheduling
-- This table stores available time slots that can be booked by clients

CREATE TABLE IF NOT EXISTS public.slot_disponibili (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data DATE NOT NULL,
    ora TIME NOT NULL,
    sede TEXT NOT NULL DEFAULT 'Roma - Via Roma 123',
    servizio TEXT,
    stato TEXT NOT NULL DEFAULT 'libero' CHECK (stato IN ('libero', 'prenotato', 'bloccato')),
    appuntamento_id UUID REFERENCES public.appuntamenti(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(data, ora, sede)
);

-- Enable RLS
ALTER TABLE public.slot_disponibili ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can view available slots
CREATE POLICY "Tutti vedono slot liberi" 
ON public.slot_disponibili FOR SELECT 
USING (stato = 'libero' OR auth.uid() IS NOT NULL);

-- Admin/operatore can manage all slots
CREATE POLICY "Admin/operatore gestiscono slot" 
ON public.slot_disponibili FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND ruolo IN ('admin', 'operatore')
    )
);

-- Clients cannot modify slots
CREATE POLICY "Clienti non modificano slot" 
ON public.slot_disponibili FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND ruolo = 'cliente'
    )
) WITH CHECK (false);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_slot_disponibili_data ON public.slot_disponibili(data);
CREATE INDEX IF NOT EXISTS idx_slot_disponibili_stato ON public.slot_disponibili(stato);
CREATE INDEX IF NOT EXISTS idx_slot_disponibili_data_ora ON public.slot_disponibili(data, ora);

-- Function to auto-create slots for a date range
CREATE OR REPLACE FUNCTION public.crea_slot_giorno(
    p_data DATE,
    p_sede TEXT DEFAULT 'Roma - Via Roma 123',
    p_orari_inizio TIME[] DEFAULT ARRAY['09:00'::TIME, '09:30'::TIME, '10:00'::TIME, '10:30'::TIME, 
                                        '11:00'::TIME, '11:30'::TIME, '14:00'::TIME, '14:30'::TIME,
                                        '15:00'::TIME, '15:30'::TIME, '16:00'::TIME, '16:30'::TIME]
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER := 0;
    v_orario TIME;
BEGIN
    FOREACH v_orario IN ARRAY p_orari_inizio
    LOOP
        INSERT INTO public.slot_disponibili (data, ora, sede, stato)
        VALUES (p_data, v_orario, p_sede, 'libero')
        ON CONFLICT (data, ora, sede) DO NOTHING;
        
        IF FOUND THEN
            v_count := v_count + 1;
        END IF;
    END LOOP;
    
    RETURN v_count;
END;
$$;

-- Function to generate slots for a week
CREATE OR REPLACE FUNCTION public.crea_slot_settimana(
    p_data_inizio DATE,
    p_sede TEXT DEFAULT 'Roma - Via Roma 123'
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER := 0;
    v_giorno INTEGER;
    v_data DATE;
    v_orari TIME[];
BEGIN
    -- Skip weekends (Saturday=6, Sunday=0)
    FOR v_giorno IN 0..6
    LOOP
        v_data := p_data_inizio + v_giorno;
        
        -- Skip weekends
        IF EXTRACT(DOW FROM v_data) IN (0, 6) THEN
            CONTINUE;
        END IF;
        
        v_count := v_count + public.crea_slot_giorno(v_data, p_sede);
    END LOOP;
    
    RETURN v_count;
END;
$$;

COMMENT ON TABLE public.slot_disponibili IS 'Tabella degli slot appuntamento disponibili per la prenotazione clienti';
