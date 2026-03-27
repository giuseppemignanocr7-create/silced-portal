import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, User, RotateCcw } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  options?: string[];
}

const knowledgeBase: Record<string, { answer: string; options?: string[] }> = {
  'default': { answer: 'Ciao! Sono l\'assistente virtuale SILCED. Come posso aiutarti?', options: ['Informazioni ISEE', 'Pensioni', 'Servizi CAF', 'NASpI', 'Modello 730', 'Contatti'] },
  'isee': { answer: 'L\'ISEE serve per accedere a bonus e agevolazioni. Per il calcolo servono: documenti d\'identità, CF, CU, saldi conti correnti, giacenza media, patrimonio immobiliare.', options: ['Calcola ISEE online', 'Documenti necessari', 'Costi del servizio', 'Torna al menu'] },
  'pensioni': { answer: 'Consulenza pensioni: vecchiaia (67 anni), anticipata (42a 10m uomo / 41a 10m donna), Quota 103, Opzione Donna. Possiamo simulare la tua pensione!', options: ['Simula pensione', 'Requisiti', 'Torna al menu'] },
  'caf': { answer: 'Servizi CAF: ISEE, 730, IMU/TASI, RED, Successioni, SPID. Per associati SILCED molti servizi sono gratuiti.', options: ['Elenco servizi', 'Diventa associato', 'Torna al menu'] },
  'naspi': { answer: 'NASpI: indennità disoccupazione per chi perde il lavoro. Requisiti: 13 settimane contributi ultimi 4 anni. Domanda entro 68 giorni.', options: ['Presenta domanda', 'Torna al menu'] },
  '730': { answer: 'Modello 730: dichiarazione redditi dipendenti/pensionati. Scadenza 2026: 30 settembre. Con SILCED anche completamente online.', options: ['Documenti necessari', 'Prenota 730', 'Torna al menu'] },
  'contatti': { answer: '📞 800.123.456 (gratuito)\n📧 info@silced.it\n💬 WhatsApp: Lun-Ven 9-18\n🏢 Via Roma 123, Roma', options: ['Prenota appuntamento', 'Torna al menu'] },
  'documenti necessari': { answer: 'Servono: documento identità, CF, stato di famiglia, CU, saldo e giacenza media conti al 31/12, visure catastali, certificazione disabilità (se presente).', options: ['Prenota appuntamento', 'Torna al menu'] },
  'costi del servizio': { answer: 'ISEE gratuito per associati SILCED. Non associati: da €30. Associazione annuale: €25 con molti servizi inclusi.', options: ['Diventa associato', 'Torna al menu'] },
  'prenota appuntamento': { answer: 'Prenota chiamando 800.123.456, compilando il form Contatti, o su WhatsApp. Ti ricontattiamo entro 24h.', options: ['Vai ai contatti', 'Torna al menu'] },
};

function findAnswer(input: string): { answer: string; options?: string[] } {
  const lower = input.toLowerCase();
  if (lower.includes('isee') && !lower.includes('calcola')) return knowledgeBase['isee'];
  if (lower.includes('calcola isee') || lower.includes('calcolatore')) return knowledgeBase['isee'];
  if (lower.includes('pension') || lower.includes('simula')) return knowledgeBase['pensioni'];
  if (lower.includes('caf') || lower.includes('servizi')) return knowledgeBase['caf'];
  if (lower.includes('naspi') || lower.includes('disoccup')) return knowledgeBase['naspi'];
  if (lower.includes('730') || lower.includes('dichiaraz') || lower.includes('redditi')) return knowledgeBase['730'];
  if (lower.includes('contatt') || lower.includes('telefon') || lower.includes('email')) return knowledgeBase['contatti'];
  if (lower.includes('document')) return knowledgeBase['documenti necessari'];
  if (lower.includes('cost') || lower.includes('prezz') || lower.includes('quanto')) return knowledgeBase['costi del servizio'];
  if (lower.includes('prenota') || lower.includes('appuntament')) return knowledgeBase['prenota appuntamento'];
  if (lower.includes('menu') || lower.includes('inizio') || lower.includes('torna')) return knowledgeBase['default'];
  return { answer: 'Non ho capito. Puoi riformulare o scegliere un\'opzione?', options: ['ISEE', 'Pensioni', 'Servizi CAF', 'Contatti'] };
}

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: knowledgeBase['default'].answer, sender: 'bot', options: knowledgeBase['default'].options }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text: string) => {
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

  const handleReset = () => {
    setMessages([{ id: 0, text: knowledgeBase['default'].answer, sender: 'bot', options: knowledgeBase['default'].options }]);
  };

  return (
    <div className="fixed bottom-20 right-6 z-40">
      {open && (
        <div className="mb-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col" style={{ height: '340px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-violet-700 px-3 py-2.5 text-white shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                <span className="font-semibold text-xs">Assistente AI SILCED</span>
              </div>
              <div className="flex items-center gap-0.5">
                <button onClick={handleReset} className="p-1 hover:bg-white/20 rounded transition-colors" title="Nuova chat">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && (
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3 h-3 text-blue-600" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-xl px-2.5 py-1.5 text-xs leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                  }`}>
                    {msg.text}
                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3 h-3 text-gray-600" />
                    </div>
                  )}
                </div>
                {msg.options && msg.sender === 'bot' && (
                  <div className="flex flex-wrap gap-1 mt-1.5 ml-8">
                    {msg.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleSend(opt)}
                        className="px-2 py-0.5 bg-white border border-blue-200 text-blue-700 rounded-full text-[10px] hover:bg-blue-50 transition-colors"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-2 border-t border-gray-200 bg-white shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex gap-1.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Scrivi..."
                className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
        title="Assistente AI SILCED"
      >
        {open ? <X className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </button>
    </div>
  );
}
