import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Bot, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { allServices } from '../../data/services';

interface Slot {
  id: string;
  data: string;
  ora: string;
  sede: string;
  stato: string;
}

export default function PrenotaAppuntamento() {
  const { profile } = useAuth();
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    setLoadingSlots(true);
    const { data } = await supabase
      .from('slot_disponibili')
      .select('id, data, ora, sede, stato')
      .eq('stato', 'libero')
      .gte('data', today)
      .lte('data', maxDate)
      .order('data', { ascending: true })
      .order('ora', { ascending: true });
    if (data) setSlots(data);
    setLoadingSlots(false);
  };

  const availableDates = [...new Set(slots.map(s => s.data))].sort();
  const slotsForDate = selectedDate ? slots.filter(s => s.data === selectedDate) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !profile) return;
    setLoading(true);

    const dataOra = new Date(`${selectedSlot.data}T${selectedSlot.ora}`).toISOString();
    
    const { data: appointment } = await supabase
      .from('appuntamenti')
      .insert({
        utente_id: profile.id,
        data_ora: dataOra,
        nome: profile.nome,
        cognome: profile.cognome,
        email: profile.email,
        telefono: profile.telefono,
        note: `${selectedService ? allServices.find(s => s.slug === selectedService)?.title + ' — ' : ''}${note}`,
        stato: 'prenotato',
        slot_id: selectedSlot.id,
      })
      .select()
      .single();

    if (appointment) {
      await supabase
        .from('slot_disponibili')
        .update({ stato: 'prenotato', appuntamento_id: appointment.id })
        .eq('id', selectedSlot.id);
    }

    setSuccess(true);
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Appuntamento prenotato!</h1>
          <p className="text-gray-600 mb-2">
            {formatDate(selectedSlot!.data)} alle ore {selectedSlot!.ora.slice(0, 5)}
          </p>
          <p className="text-sm text-gray-500 mb-6">Riceverai una conferma via email. Un operatore potrebbe contattarti per eventuali dettagli.</p>
          <Link to="/area-cliente" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors inline-block">
            Torna alla dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <Link to="/area-cliente" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Prenota Appuntamento</h1>
              <p className="text-sm text-gray-500">Scegli data, orario e servizio</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 max-w-2xl">
        <div className="bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <Bot className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">
            Scegli tra gli slot disponibili. Gli orari mostrati sono quelli liberi presso il nostro sportello.
          </p>
        </div>

        {loadingSlots ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : slots.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessuno slot disponibile</h3>
            <p className="text-gray-500 mb-4">Al momento non ci sono appuntamenti disponibili. Riprova più tardi o contattaci telefonicamente.</p>
            <Link to="/contatti" className="text-blue-600 font-medium hover:underline">Vai ai contatti</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Servizio (opzionale)</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Consulenza generica</option>
                {allServices.map(s => (
                  <option key={s.slug} value={s.slug}>{s.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Calendar className="w-4 h-4 inline mr-1" /> Seleziona data *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableDates.map(date => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedDate === date
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-xs text-gray-500 uppercase">
                      {new Date(date).toLocaleDateString('it-IT', { weekday: 'short' })}
                    </div>
                    <div className="font-semibold">
                      {new Date(date).getDate()} {new Date(date).toLocaleDateString('it-IT', { month: 'short' })}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Clock className="w-4 h-4 inline mr-1" /> Seleziona orario *
                </label>
                {slotsForDate.length === 0 ? (
                  <p className="text-sm text-gray-500">Nessun orario disponibile per questa data.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slotsForDate.map(slot => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          selectedSlot?.id === slot.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-semibold">{slot.ora.slice(0, 5)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedSlot && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Informazioni aggiuntive per l'operatore..."
                />
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div className="text-sm text-gray-600">
                <div className="font-medium text-gray-900">Sportello SILCED</div>
                <div>Via Roma 123, 00100 Roma</div>
                <div className="text-xs text-gray-400 mt-1">Lun-Ven 9:00-18:00</div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedSlot}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <>
                  <Calendar className="w-4 h-4" /> 
                  {selectedSlot 
                    ? `Prenota per ${formatDate(selectedSlot.data)} ${selectedSlot.ora.slice(0, 5)}`
                    : 'Seleziona data e orario'
                  }
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
