import { Link } from 'react-router-dom';
import { Calculator, TrendingUp, Search, Bot, BarChart3, ArrowRight, Sparkles } from 'lucide-react';

const tools = [
  {
    id: 'isee-calc',
    title: 'Calcolatore ISEE',
    description: 'Simula il tuo ISEE in tempo reale inserendo redditi e patrimonio. Scopri a quali bonus hai diritto.',
    icon: Calculator,
    href: '/strumenti/calcolatore-isee',
    color: 'bg-blue-600',
    badge: 'Esclusivo',
  },
  {
    id: 'pensione-sim',
    title: 'Simulatore Pensione',
    description: 'Calcola quando andrai in pensione e con quale importo. Confronta scenari e opzioni disponibili.',
    icon: TrendingUp,
    href: '/strumenti/simulatore-pensione',
    color: 'bg-emerald-600',
    badge: 'Nuovo',
  },
  {
    id: 'tracking',
    title: 'Tracking Pratica',
    description: 'Monitora in tempo reale lo stato della tua pratica. Notifiche push ad ogni aggiornamento.',
    icon: Search,
    href: '/strumenti/tracking',
    color: 'bg-violet-600',
    badge: 'Live',
  },
  {
    id: 'chatbot',
    title: 'Assistente AI SILCED',
    description: 'Il nostro assistente virtuale risponde alle tue domande 24/7. Guida interattiva ai servizi.',
    icon: Bot,
    href: '/strumenti/assistente',
    color: 'bg-amber-600',
    badge: 'AI',
  },
  {
    id: 'comparatore',
    title: 'Comparatore Servizi',
    description: 'Confronta servizi, costi e tempi. Trova la soluzione migliore per la tua situazione.',
    icon: BarChart3,
    href: '/strumenti/comparatore',
    color: 'bg-rose-600',
    badge: 'Smart',
  },
];

export default function StrumentiPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 text-white py-16 lg:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Strumenti esclusivi SILCED</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              5 Strumenti che nessun altro ha
            </h1>
            <p className="text-lg text-blue-100">
              Tecnologia avanzata al servizio dei cittadini. Calcola, simula, traccia e confronta 
              — tutto gratis, tutto online.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 -mt-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                to={tool.href}
                className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden"
              >
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 ${tool.color} text-white text-xs font-bold rounded-full`}>
                    {tool.badge}
                  </span>
                </div>
                <div className="p-6 pt-8">
                  <div className={`w-14 h-14 ${tool.color} rounded-2xl flex items-center justify-center mb-5`}>
                    <tool.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-gray-600 mb-5">{tool.description}</p>
                  <div className="flex items-center gap-2 text-blue-600 font-medium">
                    <span>Usa ora</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
