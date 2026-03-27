import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, RotateCcw } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  options?: string[];
}

const knowledgeBase: Record<string, { answer: string; options?: string[] }> = {
  'default': { answer: 'Ciao! Sono l\'assistente virtuale SILCED. Come posso aiutarti?', options: ['Informazioni ISEE', 'Pensioni', 'Servizi CAF', 'NASpI', 'Modello 730', 'Contatti'] },
  'isee': { answer: 'L\'ISEE (Indicatore della Situazione Economica Equivalente) serve per accedere a bonus e agevolazioni. Per il calcolo servono: documenti di identita, codice fiscale, CU, saldi conti correnti al 31/12, giacenza media, patrimonio immobiliare. Vuoi sapere altro?', options: ['Calcola ISEE online', 'Documenti necessari', 'Costi del servizio', 'Torna al menu'] },
  'pensioni': { answer: 'SILCED offre consulenza completa sulle pensioni: vecchiaia (67 anni), anticipata (42 anni e 10 mesi di contributi uomo, 41 anni e 10 mesi donna), Quota 103, Opzione Donna. Possiamo simulare la tua pensione con il nostro strumento esclusivo.', options: ['Simula pensione', 'Requisiti vecchiaia', 'Pensione anticipata', 'Torna al menu'] },
  'caf': { answer: 'I nostri servizi CAF includono: ISEE, Modello 730, IMU/TASI, RED, Successioni, SPID. Tutti gestibili anche online. Per gli associati SILCED molti servizi sono gratuiti.', options: ['Elenco servizi', 'Diventa associato', 'Prenota appuntamento', 'Torna al menu'] },
  'naspi': { answer: 'La NASpI e l\'indennita di disoccupazione per chi perde involontariamente il lavoro. Requisiti: almeno 13 settimane di contributi negli ultimi 4 anni. La domanda va presentata entro 68 giorni dal licenziamento. Durata: meta delle settimane lavorate negli ultimi 4 anni.', options: ['Requisiti dettagliati', 'Importo NASpI', 'Presenta domanda', 'Torna al menu'] },
  '730': { answer: 'Il Modello 730 e la dichiarazione dei redditi per lavoratori dipendenti e pensionati. Scadenza 2026: 30 settembre. Documenti: CU, spese detraibili (sanitarie, mutuo, affitto, assicurazioni), visure catastali. Con SILCED puoi farlo anche completamente online.', options: ['Documenti necessari', 'Scadenze 2026', 'Prenota 730', 'Torna al menu'] },
  'contatti': { answer: 'Puoi contattarci in diversi modi:\n\n📞 Telefono: 800.123.456 (gratuito)\n📧 Email: info@silced.it\n💬 WhatsApp: attivo dal Lun-Ven 9-18\n🏢 Sede: Via Roma 123, Roma\n\nOppure compila il form nella pagina Contatti del sito.', options: ['Orari sportelli', 'Prenota appuntamento', 'Torna al menu'] },
  'calcola isee online': { answer: 'Puoi usare il nostro Calcolatore ISEE esclusivo per una stima immediata. Per l\'ISEE ufficiale invece serve la compilazione della DSU completa presso i nostri sportelli. Vai alla pagina Strumenti > Calcolatore ISEE.', options: ['Vai al calcolatore', 'Documenti necessari', 'Torna al menu'] },
  'documenti necessari': { answer: 'Per l\'ISEE servono:\n• Documento identita e CF di tutti i componenti\n• Stato di famiglia\n• CU o ultima dichiarazione redditi\n• Saldo e giacenza media conti correnti al 31/12\n• Visure catastali immobili\n• Certificazione disabilita (se presente)\n• Targa veicoli di proprieta', options: ['Prenota appuntamento', 'Costi del servizio', 'Torna al menu'] },
  'costi del servizio': { answer: 'Per gli associati SILCED il calcolo ISEE e GRATUITO. Per i non associati il costo parte da 30 euro. L\'associazione annuale SILCED costa 25 euro e include molti servizi gratuiti.', options: ['Diventa associato', 'Prenota appuntamento', 'Torna al menu'] },
  'simula pensione': { answer: 'Il nostro Simulatore Pensione ti permette di scoprire quando andrai in pensione e con quale importo. Vai alla pagina Strumenti > Simulatore Pensione per provarlo subito.', options: ['Vai al simulatore', 'Consulenza personalizzata', 'Torna al menu'] },
  'prenota appuntamento': { answer: 'Per prenotare un appuntamento puoi:\n• Chiamare il numero verde 800.123.456\n• Compilare il form nella pagina Contatti\n• Scriverci su WhatsApp\n\nI nostri operatori ti ricontatteranno entro 24 ore per fissare data e ora.', options: ['Vai ai contatti', 'Orari sportelli', 'Torna al menu'] },
  'orari sportelli': { answer: 'I nostri sportelli sono aperti:\n• Lunedi - Venerdi: 9:00 - 18:00\n• Sabato: 9:00 - 12:00\n• Domenica: Chiuso\n\nSu appuntamento anche in orari diversi.', options: ['Prenota appuntamento', 'Torna al menu'] },
};

function findAnswer(input: string): { answer: string; options?: string[] } {
  const lower = input.toLowerCase();
  if (lower.includes('isee') && !lower.includes('calcola')) return knowledgeBase['isee'];
  if (lower.includes('calcola isee') || lower.includes('calcolatore')) return knowledgeBase['calcola isee online'];
  if (lower.includes('pension') || lower.includes('simula pension')) return knowledgeBase['pensioni'];
  if (lower.includes('simula')) return knowledgeBase['simula pensione'];
  if (lower.includes('caf') || lower.includes('servizi caf')) return knowledgeBase['caf'];
  if (lower.includes('naspi') || lower.includes('disoccup')) return knowledgeBase['naspi'];
  if (lower.includes('730') || lower.includes('dichiaraz') || lower.includes('redditi')) return knowledgeBase['730'];
  if (lower.includes('contatt') || lower.includes('telefon') || lower.includes('email')) return knowledgeBase['contatti'];
  if (lower.includes('document')) return knowledgeBase['documenti necessari'];
  if (lower.includes('cost') || lower.includes('prezz') || lower.includes('quanto')) return knowledgeBase['costi del servizio'];
  if (lower.includes('prenotare') || lower.includes('appuntament') || lower.includes('prenota')) return knowledgeBase['prenota appuntamento'];
  if (lower.includes('orari') || lower.includes('sportell') || lower.includes('aperti')) return knowledgeBase['orari sportelli'];
  if (lower.includes('menu') || lower.includes('inizio') || lower.includes('torna')) return knowledgeBase['default'];
  return { answer: 'Non ho capito bene la tua domanda. Puoi riformulare o scegliere una delle opzioni qui sotto?', options: ['Informazioni ISEE', 'Pensioni', 'Servizi CAF', 'NASpI', 'Contatti'] };
}

export default function AssistentePage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: knowledgeBase['default'].answer, sender: 'bot', options: knowledgeBase['default'].options }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const response = findAnswer(text);
      const botMsg: Message = { id: Date.now() + 1, text: response.answer, sender: 'bot', options: response.options };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  const reset = () => {
    setMessages([{ id: 0, text: knowledgeBase['default'].answer, sender: 'bot', options: knowledgeBase['default'].options }]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-amber-800 to-amber-700 text-white py-8">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Assistente AI SILCED</h1>
                <div className="flex items-center gap-2 text-sm text-amber-100">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  Online 24/7
                </div>
              </div>
            </div>
            <button onClick={reset} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors" title="Ricomincia">
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="container max-w-2xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Messages */}
            <div className="h-[500px] overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${msg.sender === 'user' ? 'order-1' : ''}`}>
                    <div className="flex items-start gap-2">
                      {msg.sender === 'bot' && (
                        <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                      )}
                      <div className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }`}>
                        {msg.text}
                      </div>
                      {msg.sender === 'user' && (
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                      )}
                    </div>
                    {msg.options && msg.sender === 'bot' && (
                      <div className="flex flex-wrap gap-2 mt-3 ml-9">
                        {msg.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => sendMessage(opt)}
                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 p-4">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  placeholder="Scrivi una domanda..."
                />
                <button type="submit" className="px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-500 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
