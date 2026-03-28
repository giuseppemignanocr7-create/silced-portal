import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ContattiPage() {
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    servizio: '',
    messaggio: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.from('contatti').insert({
      nome: formData.nome,
      cognome: formData.cognome,
      email: formData.email,
      telefono: formData.telefono || null,
      servizio: formData.servizio || null,
      messaggio: formData.messaggio,
      stato: 'nuovo',
    });
    setLoading(false);
    if (err) {
      setError('Errore nell\'invio. Riprova tra qualche istante.');
    } else {
      setSubmitted(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Contattaci
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Siamo a tua disposizione per qualsiasi informazione sui nostri servizi
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-blue-50 rounded-2xl p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Telefono</h3>
              <p className="text-sm text-gray-600 mb-3">
                Chiamaci dal lunedì al venerdì, dalle 9:00 alle 18:00
              </p>
              <a href="tel:800123456" className="text-lg font-semibold text-blue-600 hover:text-blue-800">
                800.123.456
              </a>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-sm text-gray-600 mb-3">
                Ti risponderemo entro 24 ore lavorative
              </p>
              <a href="mailto:info@silced.it" className="text-lg font-semibold text-blue-600 hover:text-blue-800">
                info@silced.it
              </a>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Sede</h3>
              <p className="text-gray-600">
                Via Roma 123<br />
                00100 Roma RM
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Orari</h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>Lunedì - Venerdì: 9:00 - 18:00</li>
                <li>Sabato: 9:00 - 12:00</li>
                <li>Domenica: Chiuso</li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Richiesta inviata!
                  </h2>
                  <p className="text-gray-600">
                    Ti risponderemo al più presto. Grazie per averci contattato.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Richiedi informazioni
                  </h2>
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                          Nome *
                        </label>
                        <input
                          type="text"
                          id="nome"
                          name="nome"
                          required
                          value={formData.nome}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Mario"
                        />
                      </div>
                      <div>
                        <label htmlFor="cognome" className="block text-sm font-medium text-gray-700 mb-1">
                          Cognome *
                        </label>
                        <input
                          type="text"
                          id="cognome"
                          name="cognome"
                          required
                          value={formData.cognome}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Rossi"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="mario.rossi@email.it"
                        />
                      </div>
                      <div>
                        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                          Telefono
                        </label>
                        <input
                          type="tel"
                          id="telefono"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+39 123 456 7890"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="servizio" className="block text-sm font-medium text-gray-700 mb-1">
                        Servizio di interesse
                      </label>
                      <select
                        id="servizio"
                        name="servizio"
                        value={formData.servizio}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleziona un servizio</option>
                        <option value="isee">ISEE</option>
                        <option value="730">Modello 730</option>
                        <option value="pensione">Pensioni</option>
                        <option value="naspi">NASPI</option>
                        <option value="assegno">Assegno Unico</option>
                        <option value="spid">SPID</option>
                        <option value="corso">Corsi di formazione</option>
                        <option value="altro">Altro</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="messaggio" className="block text-sm font-medium text-gray-700 mb-1">
                        Messaggio *
                      </label>
                      <textarea
                        id="messaggio"
                        name="messaggio"
                        required
                        rows={5}
                        value={formData.messaggio}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Descrivi la tua richiesta..."
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="privacy"
                        required
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="privacy" className="text-sm text-gray-600">
                        Dichiaro di aver letto e accettato la 
                        <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a> 
                        e di acconsentire al trattamento dei dati personali.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {loading ? 'Invio in corso...' : 'Invia richiesta'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
