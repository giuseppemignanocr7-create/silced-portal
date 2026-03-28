import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Bot, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { allServices } from '../../data/services';

const orariDisponibili = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

export default function PrenotaAppuntamento() {
  const { profile } = useAuth();
  const [selectedService, setSelectedService] = useState('');
  const [data, setData] = useState('');
  const [orario, setOrario] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !orario || !profile) return;
    setLoading(true);

    const dataOra = new Date(`${data}T${orario}:00`).toISOString();
    await supabase.from('appuntamenti').insert({
      utente_id: profile.id,
      data_ora: dataOra,
      nome: profile.nome,
      cognome: profile.cognome,
      email: profile.email,
      note: `${selectedService ? allServices.find(s => s.slug === selectedService)?.title + ' — ' : ''}${note}`,
      stato: 'prenotato',
    });

    setSuccess(true);
    setLoading(false);
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
            {new Date(`${data}T${orario}`).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })} alle ore {orario}
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

      <div className="container py-6 max-w-xl">
        <div className="bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <Bot className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">
            Prenota un appuntamento presso il nostro sportello. Seleziona il servizio di interesse per permetterci di preparare i documenti necessari.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-5">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" /> Data *
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                min={today}
                max={maxDate}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" /> Orario *
              </label>
              <select
                value={orario}
                onChange={(e) => setOrario(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Seleziona</option>
                {orariDisponibili.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

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

          <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600">
              <div className="font-medium text-gray-900">Sportello SILCED</div>
              <div>Via Roma 123, 00100 Roma</div>
              <div>Lun-Ven 9:00-18:00 | Sabato 9:00-12:00</div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !data || !orario}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <>
                <Calendar className="w-4 h-4" /> Conferma prenotazione
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
