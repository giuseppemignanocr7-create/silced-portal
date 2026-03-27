import { useState } from 'react';
import { TrendingUp, Info, ArrowRight, RotateCcw, Calendar, Banknote, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PensioneResult {
  etaPensione: number;
  annoPensione: number;
  importoMensile: number;
  importoNetto: number;
  anniMancanti: number;
  tipologia: string;
}

function simulaPensione(data: {
  eta: number;
  anniContributi: number;
  redditoAnnuo: number;
  tipologia: string;
}): PensioneResult {
  let etaPensione = 67;
  let tipologia = 'Pensione di vecchiaia';

  if (data.tipologia === 'anticipata' && data.anniContributi >= 42) {
    etaPensione = Math.max(data.eta, 62);
    tipologia = 'Pensione anticipata';
  } else if (data.tipologia === 'quota103') {
    if (data.eta >= 62 && data.anniContributi >= 41) {
      etaPensione = Math.max(data.eta, 62);
      tipologia = 'Quota 103';
    }
  } else if (data.tipologia === 'opzioneDonna') {
    if (data.anniContributi >= 35) {
      etaPensione = Math.max(data.eta, 61);
      tipologia = 'Opzione Donna';
    }
  }

  const anniMancanti = Math.max(0, etaPensione - data.eta);
  const anniTotaliContributi = data.anniContributi + anniMancanti;
  const coefficiente = Math.min(0.02 * anniTotaliContributi, 0.80);
  const importoMensile = Math.round((data.redditoAnnuo * coefficiente) / 13);
  const importoNetto = Math.round(importoMensile * 0.78);

  return {
    etaPensione,
    annoPensione: new Date().getFullYear() + anniMancanti,
    importoMensile,
    importoNetto,
    anniMancanti,
    tipologia,
  };
}

export default function SimulatorePensionePage() {
  const [data, setData] = useState({ eta: 45, anniContributi: 20, redditoAnnuo: 28000, tipologia: 'vecchiaia' });
  const [result, setResult] = useState<PensioneResult | null>(null);

  const handleCalculate = () => {
    setResult(simulaPensione(data));
  };

  const reset = () => {
    setResult(null);
    setData({ eta: 45, anniContributi: 20, redditoAnnuo: 28000, tipologia: 'vecchiaia' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white py-12 lg:py-16">
        <div className="container">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-700/50 rounded-full text-sm mb-4">
              <TrendingUp className="w-4 h-4" />
              Strumento esclusivo
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Simulatore Pensione</h1>
            <p className="text-emerald-100">Scopri quando andrai in pensione e con quale importo stimato. Confronta diverse opzioni.</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-3xl">
          {!result ? (
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">I tuoi dati</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Eta attuale: <span className="text-blue-600 font-bold">{data.eta} anni</span></label>
                  <input type="range" min="18" max="70" value={data.eta} onChange={(e) => setData(d => ({ ...d, eta: +e.target.value }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1"><span>18</span><span>70</span></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Anni di contributi: <span className="text-blue-600 font-bold">{data.anniContributi} anni</span></label>
                  <input type="range" min="0" max="45" value={data.anniContributi} onChange={(e) => setData(d => ({ ...d, anniContributi: +e.target.value }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0</span><span>45</span></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reddito annuo lordo</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
                    <input type="number" value={data.redditoAnnuo} onChange={(e) => setData(d => ({ ...d, redditoAnnuo: +e.target.value || 0 }))}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Tipologia pensione</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'vecchiaia', label: 'Vecchiaia', desc: '67 anni' },
                      { id: 'anticipata', label: 'Anticipata', desc: '42+ contributi' },
                      { id: 'quota103', label: 'Quota 103', desc: '62 anni + 41 contr.' },
                      { id: 'opzioneDonna', label: 'Opzione Donna', desc: '61 anni + 35 contr.' },
                    ].map((opt) => (
                      <button key={opt.id} onClick={() => setData(d => ({ ...d, tipologia: opt.id }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${data.tipologia === opt.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="font-medium text-gray-900">{opt.label}</div>
                        <div className="text-xs text-gray-500">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button onClick={handleCalculate} className="flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors">
                  <TrendingUp className="w-4 h-4" /> Simula pensione
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
                <h2 className="text-lg font-medium text-gray-600 mb-6 text-center">Risultato simulazione</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-4 bg-emerald-50 rounded-xl">
                    <Calendar className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                    <div className="text-3xl font-black text-emerald-700">{result.annoPensione}</div>
                    <div className="text-sm text-gray-600">Anno pensionamento</div>
                    <div className="text-xs text-gray-500 mt-1">A {result.etaPensione} anni ({result.anniMancanti} anni mancanti)</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <Banknote className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-3xl font-black text-blue-700">€ {result.importoMensile.toLocaleString('it-IT')}</div>
                    <div className="text-sm text-gray-600">Pensione lorda/mese</div>
                    <div className="text-xs text-gray-500 mt-1">Netta: € {result.importoNetto.toLocaleString('it-IT')}/mese</div>
                  </div>
                  <div className="text-center p-4 bg-violet-50 rounded-xl">
                    <Clock className="w-6 h-6 text-violet-600 mx-auto mb-2" />
                    <div className="text-xl font-black text-violet-700">{result.tipologia}</div>
                    <div className="text-sm text-gray-600">Tipo pensione</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Simulazione indicativa basata sulla normativa vigente. Per un calcolo preciso, contattaci per una consulenza personalizzata.</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Vuoi una consulenza personalizzata?</h3>
                <p className="text-sm text-gray-700 mb-4">I nostri esperti possono effettuare un calcolo preciso basato sul tuo estratto conto contributivo INPS.</p>
                <Link to="/contatti" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors">
                  Prenota consulenza <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="text-center">
                <button onClick={reset} className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-800">
                  <RotateCcw className="w-4 h-4" /> Nuova simulazione
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
