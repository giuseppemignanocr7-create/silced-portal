import { useState } from 'react';
import { Search, CheckCircle, Clock, FileText, AlertCircle, Package, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TrackingStep {
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'current' | 'pending';
}

interface TrackingResult {
  code: string;
  service: string;
  status: string;
  statusColor: string;
  steps: TrackingStep[];
}

const demoResults: Record<string, TrackingResult> = {
  'SILCED-2026-001': {
    code: 'SILCED-2026-001',
    service: 'ISEE 2026',
    status: 'In lavorazione',
    statusColor: 'text-amber-600 bg-amber-50',
    steps: [
      { title: 'Pratica ricevuta', description: 'Documenti acquisiti e protocollati', date: '20 Mar 2026', status: 'completed' },
      { title: 'Verifica documenti', description: 'Controllo completezza documentazione', date: '21 Mar 2026', status: 'completed' },
      { title: 'Elaborazione DSU', description: 'Compilazione e invio DSU telematica', date: '23 Mar 2026', status: 'current' },
      { title: 'Attestazione INPS', description: 'In attesa di rilascio attestazione', date: '', status: 'pending' },
      { title: 'Consegna', description: 'ISEE pronto per il ritiro/download', date: '', status: 'pending' },
    ]
  },
  'SILCED-2026-042': {
    code: 'SILCED-2026-042',
    service: 'NASpI - Disoccupazione',
    status: 'Completata',
    statusColor: 'text-green-600 bg-green-50',
    steps: [
      { title: 'Pratica ricevuta', description: 'Documentazione acquisita', date: '10 Mar 2026', status: 'completed' },
      { title: 'Verifica requisiti', description: 'Controllo requisiti contributivi', date: '11 Mar 2026', status: 'completed' },
      { title: 'Invio domanda INPS', description: 'Domanda telematica inviata', date: '12 Mar 2026', status: 'completed' },
      { title: 'Accettazione INPS', description: 'Domanda accolta - primo pagamento previsto', date: '25 Mar 2026', status: 'completed' },
    ]
  },
  'SILCED-2026-105': {
    code: 'SILCED-2026-105',
    service: 'Modello 730',
    status: 'In attesa documenti',
    statusColor: 'text-red-600 bg-red-50',
    steps: [
      { title: 'Pratica ricevuta', description: 'Richiesta registrata nel sistema', date: '24 Mar 2026', status: 'completed' },
      { title: 'Documenti mancanti', description: 'In attesa CU 2026 e spese mediche', date: '25 Mar 2026', status: 'current' },
      { title: 'Elaborazione', description: 'Compilazione dichiarazione', date: '', status: 'pending' },
      { title: 'Invio telematico', description: 'Trasmissione AdE', date: '', status: 'pending' },
    ]
  },
};

export default function TrackingPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = () => {
    if (!code.trim()) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);

    setTimeout(() => {
      const found = demoResults[code.trim().toUpperCase()];
      if (found) {
        setResult(found);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-violet-900 to-violet-800 text-white py-12 lg:py-16">
        <div className="container">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-700/50 rounded-full text-sm mb-4">
              <Package className="w-4 h-4" />
              Tracking in tempo reale
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Tracking Pratica</h1>
            <p className="text-violet-100">Inserisci il codice della tua pratica per monitorarne lo stato in tempo reale.</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-2xl">
          {/* Search */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Codice pratica</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent uppercase"
                placeholder="es. SILCED-2026-001"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-violet-700 text-white rounded-lg font-medium hover:bg-violet-600 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Cerca
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Demo: prova con <button onClick={() => setCode('SILCED-2026-001')} className="text-violet-600 font-medium underline">SILCED-2026-001</button>,{' '}
              <button onClick={() => setCode('SILCED-2026-042')} className="text-violet-600 font-medium underline">SILCED-2026-042</button> o{' '}
              <button onClick={() => setCode('SILCED-2026-105')} className="text-violet-600 font-medium underline">SILCED-2026-105</button>
            </div>
          </div>

          {/* Not Found */}
          {notFound && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Pratica non trovata</h3>
              <p className="text-sm text-gray-600 mb-4">Il codice inserito non corrisponde a nessuna pratica. Verifica il codice e riprova.</p>
              <Link to="/contatti" className="text-violet-600 text-sm font-medium hover:underline">
                Contattaci per assistenza
              </Link>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Pratica {result.code}</div>
                    <h3 className="text-xl font-bold text-gray-900">{result.service}</h3>
                  </div>
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${result.statusColor}`}>
                    <span className="w-2 h-2 rounded-full bg-current" />
                    {result.status}
                  </span>
                </div>

                {/* Timeline */}
                <div className="space-y-0">
                  {result.steps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          step.status === 'completed' ? 'bg-green-100' :
                          step.status === 'current' ? 'bg-violet-100 ring-4 ring-violet-50' :
                          'bg-gray-100'
                        }`}>
                          {step.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : step.status === 'current' ? (
                            <Clock className="w-4 h-4 text-violet-600" />
                          ) : (
                            <FileText className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        {i < result.steps.length - 1 && (
                          <div className={`w-0.5 h-12 ${step.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'}`} />
                        )}
                      </div>
                      <div className="pb-6">
                        <div className={`font-medium ${step.status === 'pending' ? 'text-gray-400' : 'text-gray-900'}`}>
                          {step.title}
                        </div>
                        <div className="text-sm text-gray-500">{step.description}</div>
                        {step.date && <div className="text-xs text-gray-400 mt-1">{step.date}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
                <p className="text-sm text-gray-700">
                  Hai domande sulla tua pratica?{' '}
                  <Link to="/contatti" className="text-violet-700 font-medium underline">Contattaci</Link> o scrivici su{' '}
                  <a href="https://wa.me/39800123456" className="text-green-600 font-medium underline">WhatsApp</a>.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
