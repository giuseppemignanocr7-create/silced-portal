import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bot, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { allServices, serviceCategories } from '../../data/services';

const aiSuggestions: Record<string, string> = {
  'isee': 'Per la pratica ISEE ti serviranno: documento d\'identità, codice fiscale, CU, saldi e giacenza media conti al 31/12, visure catastali.',
  'pensione': 'Per le pratiche pensionistiche servono: estratto conto contributivo INPS, documento d\'identità, codice fiscale, ultima busta paga.',
  '730': 'Per il modello 730 prepara: CU, spese mediche, interessi mutuo, spese scolastiche, ricevute affitto, scontrini farmacia.',
  'naspi': 'Per la NASpI servono: documento d\'identità, codice fiscale, lettera di licenziamento, ultime buste paga, IBAN.',
  'default': 'Seleziona il tipo di servizio e ti indicherò i documenti necessari e i tempi stimati.',
};

function getAiHint(serviceSlug: string): string {
  const lower = serviceSlug.toLowerCase();
  if (lower.includes('isee')) return aiSuggestions['isee'];
  if (lower.includes('pension')) return aiSuggestions['pensione'];
  if (lower.includes('730') || lower.includes('dichiaraz')) return aiSuggestions['730'];
  if (lower.includes('naspi') || lower.includes('disoccup')) return aiSuggestions['naspi'];
  return aiSuggestions['default'];
}

export default function NuovaPratica() {
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdCode, setCreatedCode] = useState('');

  const filteredServices = selectedCategory
    ? allServices.filter(s => s.category === selectedCategory)
    : allServices;

  const selectedServiceData = allServices.find(s => s.slug === selectedService);
  const aiHint = selectedServiceData ? getAiHint(selectedServiceData.slug) : aiSuggestions['default'];

  const handleSubmit = async () => {
    if (!selectedService || !profile) return;
    setLoading(true);

    const serviceData = allServices.find(s => s.slug === selectedService);
    const { data, error } = await supabase.from('pratiche').insert({
      utente_id: profile.id,
      titolo: serviceData?.title || 'Nuova pratica',
      descrizione,
      stato: 'ricevuta',
    }).select('codice').single();

    if (!error && data) {
      setCreatedCode(data.codice);
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pratica inviata!</h1>
          <p className="text-gray-600 mb-2">La tua richiesta è stata registrata con successo.</p>
          {createdCode && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 my-4">
              <div className="text-sm text-blue-600">Codice pratica</div>
              <div className="text-2xl font-bold text-blue-900 font-mono">{createdCode}</div>
            </div>
          )}
          <p className="text-sm text-gray-500 mb-6">Riceverai una notifica ad ogni aggiornamento di stato.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/area-cliente" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
              Torna alla dashboard
            </Link>
            <Link to="/area-cliente/pratiche" className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              Le mie pratiche
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <Link to="/area-cliente" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Nuova Pratica</h1>
              <p className="text-sm text-gray-500">Step {step} di 3</p>
            </div>
          </div>
          {/* Progress */}
          <div className="flex gap-1.5 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="container py-6 max-w-2xl">
        {/* AI Assistant Bar */}
        <div className="bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Assistente AI</div>
            <p className="text-sm text-gray-600 mt-0.5">{aiHint}</p>
          </div>
        </div>

        {/* Step 1: Scegli categoria e servizio */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Che tipo di pratica ti serve?</h2>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Tutti
              </button>
              {serviceCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            {/* Services grid */}
            <div className="grid sm:grid-cols-2 gap-3">
              {filteredServices.map(service => (
                <button
                  key={service.slug}
                  onClick={() => setSelectedService(service.slug)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${selectedService === service.slug ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                >
                  <div className="font-medium text-gray-900 text-sm">{service.title}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description}</div>
                </button>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => selectedService && setStep(2)}
                disabled={!selectedService}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Avanti <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Dettagli */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Descrivi la tua richiesta</h2>

            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <div className="text-sm text-gray-500">Servizio selezionato</div>
              <div className="font-medium text-gray-900">{selectedServiceData?.title}</div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione della richiesta</label>
              <textarea
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Descrivi brevemente cosa ti serve... L'assistente AI ti guiderà nei passaggi successivi."
              />
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)} className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Indietro
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                Avanti <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Riepilogo e invio */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Conferma e invia</h2>

            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              <div className="p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Servizio</div>
                <div className="font-medium text-gray-900 mt-1">{selectedServiceData?.title}</div>
              </div>
              <div className="p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Descrizione</div>
                <div className="text-sm text-gray-700 mt-1">{descrizione || 'Nessuna descrizione aggiuntiva'}</div>
              </div>
              <div className="p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Richiedente</div>
                <div className="text-sm text-gray-700 mt-1">{profile?.nome} {profile?.cognome} — {profile?.email}</div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4 flex items-start gap-3">
              <Bot className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                Dopo l'invio riceverai un codice pratica. Un operatore prenderà in carico la richiesta e potresti ricevere notifiche per documenti aggiuntivi.
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(2)} className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Indietro
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Invia pratica
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
