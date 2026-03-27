import { useState } from 'react';
import { Calculator, Info, CheckCircle, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface IseeResult {
  value: number;
  fascia: string;
  color: string;
  bonusEligible: string[];
}

function calculateIsee(data: Record<string, number>): IseeResult {
  const ise = data.redditoFamiliare + (data.patrimonioMobiliare * 0.2) + (data.patrimonioImmobiliare * 0.2) - (data.mutuo * 0.1) - (data.affitto > 0 ? Math.min(data.affitto, 7000) : 0);
  const scalaEquivalenza = 1 + (data.componenti > 1 ? (data.componenti - 1) * 0.47 : 0) + (data.minori * 0.2) + (data.disabili * 0.5);
  const isee = Math.max(0, Math.round(ise / scalaEquivalenza));

  let fascia = '';
  let color = '';
  const bonusEligible: string[] = [];

  if (isee <= 6000) {
    fascia = 'Fascia molto bassa';
    color = 'text-green-600';
    bonusEligible.push('Assegno di Inclusione', 'Bonus Energia', 'Bonus Idrico', 'Bonus Gas', 'Assegno Unico massimo', 'Carta Acquisti', 'Esenzione ticket sanitario');
  } else if (isee <= 9530) {
    fascia = 'Fascia bassa';
    color = 'text-green-500';
    bonusEligible.push('Bonus Energia', 'Bonus Gas', 'Assegno Unico maggiorato', 'Bonus Asilo Nido');
  } else if (isee <= 15000) {
    fascia = 'Fascia medio-bassa';
    color = 'text-yellow-600';
    bonusEligible.push('Assegno Unico', 'Bonus Asilo Nido parziale', 'Agevolazioni mensa scolastica');
  } else if (isee <= 25000) {
    fascia = 'Fascia media';
    color = 'text-orange-500';
    bonusEligible.push('Assegno Unico base', 'Detrazioni fiscali standard');
  } else if (isee <= 40000) {
    fascia = 'Fascia medio-alta';
    color = 'text-orange-600';
    bonusEligible.push('Assegno Unico minimo', 'Detrazioni per figli a carico');
  } else {
    fascia = 'Fascia alta';
    color = 'text-red-500';
    bonusEligible.push('Detrazioni per figli a carico (se applicabile)');
  }

  return { value: isee, fascia, color, bonusEligible };
}

export default function CalcolatoreIseePage() {
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<IseeResult | null>(null);
  const [data, setData] = useState({
    componenti: 2,
    minori: 0,
    disabili: 0,
    redditoFamiliare: 0,
    patrimonioMobiliare: 0,
    patrimonioImmobiliare: 0,
    mutuo: 0,
    affitto: 0,
  });

  const updateField = (field: string, value: number) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    const res = calculateIsee(data);
    setResult(res);
    setStep(3);
  };

  const reset = () => {
    setStep(1);
    setResult(null);
    setData({ componenti: 2, minori: 0, disabili: 0, redditoFamiliare: 0, patrimonioMobiliare: 0, patrimonioImmobiliare: 0, mutuo: 0, affitto: 0 });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-12 lg:py-16">
        <div className="container">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-700/50 rounded-full text-sm mb-4">
              <Calculator className="w-4 h-4" />
              Strumento esclusivo
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Calcolatore ISEE Interattivo</h1>
            <p className="text-blue-100">Simula il tuo ISEE in 2 minuti e scopri subito a quali bonus e agevolazioni hai diritto.</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-3xl">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                <span className={`text-sm hidden sm:block ${step >= s ? 'text-blue-900 font-medium' : 'text-gray-400'}`}>
                  {s === 1 ? 'Nucleo familiare' : s === 2 ? 'Redditi e patrimonio' : 'Risultato'}
                </span>
                {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Composizione nucleo familiare</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Numero componenti nucleo</label>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <button key={n} onClick={() => updateField('componenti', n)}
                        className={`w-12 h-12 rounded-xl font-bold transition-all ${data.componenti === n ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Figli minorenni</label>
                  <div className="flex items-center gap-3">
                    {[0, 1, 2, 3, 4].map((n) => (
                      <button key={n} onClick={() => updateField('minori', n)}
                        className={`w-12 h-12 rounded-xl font-bold transition-all ${data.minori === n ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Componenti con disabilità</label>
                  <div className="flex items-center gap-3">
                    {[0, 1, 2, 3].map((n) => (
                      <button key={n} onClick={() => updateField('disabili', n)}
                        className={`w-12 h-12 rounded-xl font-bold transition-all ${data.disabili === n ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button onClick={() => setStep(2)} className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors">
                  Avanti <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Redditi e patrimonio</h2>
              <div className="space-y-5">
                {[
                  { key: 'redditoFamiliare', label: 'Reddito familiare annuo lordo', hint: 'Somma di tutti i redditi del nucleo (da CU o 730)' },
                  { key: 'patrimonioMobiliare', label: 'Patrimonio mobiliare', hint: 'Conti correnti, titoli, investimenti al 31/12' },
                  { key: 'patrimonioImmobiliare', label: 'Patrimonio immobiliare', hint: 'Valore catastale immobili di proprietà' },
                  { key: 'mutuo', label: 'Mutuo residuo prima casa', hint: 'Debito residuo mutuo ipotecario' },
                  { key: 'affitto', label: 'Canone affitto annuo', hint: 'Se in affitto, canone annuo pagato' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    <p className="text-xs text-gray-500 mb-2">{field.hint}</p>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
                      <input
                        type="number"
                        value={data[field.key as keyof typeof data] || ''}
                        onChange={(e) => updateField(field.key, Number(e.target.value) || 0)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(1)} className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Indietro
                </button>
                <button onClick={handleCalculate} className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors">
                  <Calculator className="w-4 h-4" /> Calcola ISEE
                </button>
              </div>
            </div>
          )}

          {/* Step 3 - Result */}
          {step === 3 && result && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100 text-center">
                <h2 className="text-lg font-medium text-gray-600 mb-2">Il tuo ISEE stimato</h2>
                <div className={`text-5xl lg:text-6xl font-black mb-3 ${result.color}`}>
                  € {result.value.toLocaleString('it-IT')}
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${result.color} bg-gray-50`}>
                  {result.fascia}
                </div>
                <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 max-w-md mx-auto">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Questo è un calcolo indicativo. Per l'ISEE ufficiale è necessaria la DSU completa.</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Bonus e agevolazioni a cui potresti avere diritto
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.bonusEligible.map((bonus, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-sm font-medium text-gray-800">{bonus}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Vuoi l'ISEE ufficiale?</h4>
                    <p className="text-sm text-gray-700 mb-3">Per ottenere l'ISEE valido ai fini delle agevolazioni, contattaci per la compilazione della DSU completa.</p>
                    <Link to="/contatti" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors">
                      Richiedi ISEE ufficiale <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button onClick={reset} className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800">
                  <RotateCcw className="w-4 h-4" /> Ricalcola
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
