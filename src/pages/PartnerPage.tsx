import { useState } from 'react';
import { Handshake, CheckCircle, TrendingUp, Users, Award, Phone, Send } from 'lucide-react';

export default function PartnerPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16 lg:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700/50 rounded-full text-sm mb-6">
                <Handshake className="w-4 h-4" />
                Programma Partner
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">Diventa Partner SILCED</h1>
              <p className="text-lg text-blue-100 mb-8">
                Apri un punto SILCED nella tua città. Offriamo formazione completa, software, assistenza e un brand consolidato da 25 anni.
              </p>
              <div className="space-y-3">
                {['Formazione completa inclusa', 'Software gestionale dedicato', 'Assistenza tecnica continua', 'Brand riconosciuto a livello nazionale'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                <TrendingUp className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                <div className="text-2xl font-bold">+30%</div>
                <div className="text-sm text-blue-200">Crescita annua</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                <Users className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                <div className="text-2xl font-bold">200+</div>
                <div className="text-sm text-blue-200">Partner attivi</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                <Award className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                <div className="text-2xl font-bold">25+</div>
                <div className="text-sm text-blue-200">Anni esperienza</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                <Phone className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-blue-200">Supporto tecnico</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Cosa offriamo ai Partner</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Formazione Certificata', desc: 'Corso completo per operatori CAF/Patronato con attestato. Aggiornamenti annuali inclusi.' },
              { title: 'Software Gestionale', desc: 'Piattaforma completa per gestione pratiche, clienti, scadenze e contabilità.' },
              { title: 'Supporto Continuo', desc: 'Help desk dedicato, assistenza fiscale e consulenza tecnica per ogni pratica.' },
              { title: 'Marketing e Brand', desc: 'Materiale promozionale, visibilità sul sito e supporto marketing locale.' },
              { title: 'Convenzioni', desc: 'Accesso a convenzioni nazionali con enti, assicurazioni e fornitori.' },
              { title: 'Rete Nazionale', desc: 'Fai parte di una rete di 200+ sportelli con scambio di best practice.' },
            ].map((item) => (
              <div key={item.title} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Richiedi informazioni</h2>
            <p className="text-gray-600">Compila il form e ti contatteremo entro 48 ore.</p>
          </div>

          {submitted ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Richiesta inviata!</h3>
              <p className="text-gray-600">Ti contatteremo entro 48 ore con tutte le informazioni.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefono *</label>
                  <input type="tel" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Città / Provincia *</label>
                <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="es. Roma (RM)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Messaggio</label>
                <textarea rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Descrivi brevemente la tua esperienza e motivazione..." />
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors">
                <Send className="w-4 h-4" /> Invia richiesta partnership
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
