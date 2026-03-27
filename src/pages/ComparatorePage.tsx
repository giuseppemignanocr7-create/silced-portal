import { useState } from 'react';
import { BarChart3, Check, X, ArrowRight, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ServiceOption {
  id: string;
  name: string;
  category: string;
  costoSilced: string;
  costoMercato: string;
  tempoSilced: string;
  tempoMercato: string;
  online: boolean;
  garanzia: boolean;
  tracking: boolean;
  features: string[];
}

const comparableServices: ServiceOption[] = [
  { id: 'isee', name: 'ISEE 2026', category: 'CAF', costoSilced: 'Gratuito*', costoMercato: '€50-80', tempoSilced: '3-5 giorni', tempoMercato: '7-15 giorni', online: true, garanzia: true, tracking: true, features: ['Calcolo ISEE simulato incluso', 'DSU precompilata', 'Tracking pratica live'] },
  { id: '730', name: 'Modello 730', category: 'CAF', costoSilced: '€35', costoMercato: '€60-120', tempoSilced: '5-7 giorni', tempoMercato: '10-20 giorni', online: true, garanzia: true, tracking: true, features: ['Precompilata inclusa', 'Verifica detrazioni AI', 'Invio telematico incluso'] },
  { id: 'naspi', name: 'NASpI', category: 'Patronato', costoSilced: 'Gratuito', costoMercato: '€30-50', tempoSilced: '2-3 giorni', tempoMercato: '5-10 giorni', online: true, garanzia: true, tracking: true, features: ['Verifica requisiti immediata', 'Calcolo importo stimato', 'Assistenza post-domanda'] },
  { id: 'pensione', name: 'Consulenza Pensione', category: 'Patronato', costoSilced: '€25', costoMercato: '€80-150', tempoSilced: '1-2 giorni', tempoMercato: '5-7 giorni', online: true, garanzia: true, tracking: true, features: ['Simulatore pensione incluso', 'Analisi estratto conto', 'Piano pensionistico'] },
  { id: 'spid', name: 'SPID', category: 'Digitale', costoSilced: '€15', costoMercato: '€20-35', tempoSilced: '15 minuti', tempoMercato: '1-3 giorni', online: true, garanzia: true, tracking: false, features: ['Video riconoscimento', 'Attivazione immediata', 'Assistenza dedicata'] },
  { id: 'successione', name: 'Successione', category: 'CAF', costoSilced: '€200', costoMercato: '€400-800', tempoSilced: '15-20 giorni', tempoMercato: '30-60 giorni', online: true, garanzia: true, tracking: true, features: ['Voltura catastale inclusa', 'Calcolo imposte', 'Assistenza notarile'] },
];

export default function ComparatorePage() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleService = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const selectedServices = comparableServices.filter(s => selected.includes(s.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-rose-900 to-rose-800 text-white py-12 lg:py-16">
        <div className="container">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-700/50 rounded-full text-sm mb-4">
              <BarChart3 className="w-4 h-4" />
              Confronto intelligente
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Comparatore Servizi</h1>
            <p className="text-rose-100">Confronta costi, tempi e caratteristiche dei nostri servizi rispetto al mercato. Seleziona fino a 3 servizi.</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {/* Service selector */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Seleziona servizi da confrontare (max 3)</h2>
            <div className="flex flex-wrap gap-3">
              {comparableServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selected.includes(service.id)
                      ? 'bg-rose-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-rose-300'
                  }`}
                >
                  {service.name}
                  <span className="ml-2 text-xs opacity-70">({service.category})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Comparison table */}
          {selectedServices.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-w-[640px]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="p-4 text-left text-sm font-medium text-gray-500 w-48">Caratteristica</th>
                      {selectedServices.map((s) => (
                        <th key={s.id} className="p-4 text-center">
                          <div className="font-bold text-gray-900">{s.name}</div>
                          <div className="text-xs text-gray-500">{s.category}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-50 bg-blue-50/50">
                      <td className="p-4 text-sm font-medium text-gray-700">Costo SILCED</td>
                      {selectedServices.map((s) => (
                        <td key={s.id} className="p-4 text-center">
                          <span className="text-lg font-bold text-blue-700">{s.costoSilced}</span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="p-4 text-sm font-medium text-gray-700">Costo medio mercato</td>
                      {selectedServices.map((s) => (
                        <td key={s.id} className="p-4 text-center text-gray-500 line-through">{s.costoMercato}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-50 bg-green-50/50">
                      <td className="p-4 text-sm font-medium text-gray-700">Tempi SILCED</td>
                      {selectedServices.map((s) => (
                        <td key={s.id} className="p-4 text-center font-semibold text-green-700">{s.tempoSilced}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="p-4 text-sm font-medium text-gray-700">Tempi mercato</td>
                      {selectedServices.map((s) => (
                        <td key={s.id} className="p-4 text-center text-gray-500">{s.tempoMercato}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="p-4 text-sm font-medium text-gray-700">Gestione online</td>
                      {selectedServices.map((s) => (
                        <td key={s.id} className="p-4 text-center">
                          {s.online ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="p-4 text-sm font-medium text-gray-700">Soddisfatti o rimborsati</td>
                      {selectedServices.map((s) => (
                        <td key={s.id} className="p-4 text-center">
                          {s.garanzia ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="p-4 text-sm font-medium text-gray-700">Tracking live pratica</td>
                      {selectedServices.map((s) => (
                        <td key={s.id} className="p-4 text-center">
                          {s.tracking ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 text-sm font-medium text-gray-700">Vantaggi esclusivi</td>
                      {selectedServices.map((s) => (
                        <td key={s.id} className="p-4">
                          <ul className="space-y-1">
                            {s.features.map((f, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-xs text-gray-700">
                                <Check className="w-3 h-3 text-blue-600 shrink-0" /> {f}
                              </li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 mb-4">* Gratuito per associati SILCED. Costi mercato basati su media nazionale.</p>
                <Link to="/contatti" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors">
                  Richiedi preventivo personalizzato <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
              <BarChart3 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Seleziona almeno un servizio</h3>
              <p className="text-gray-500 text-sm">Clicca sui servizi sopra per iniziare il confronto.</p>
            </div>
          )}

          {selected.length > 0 && (
            <div className="mt-4 text-center">
              <button onClick={() => setSelected([])} className="inline-flex items-center gap-2 text-rose-600 font-medium hover:text-rose-800 text-sm">
                <RotateCcw className="w-4 h-4" /> Reset confronto
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
