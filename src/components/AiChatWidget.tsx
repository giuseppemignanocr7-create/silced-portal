import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, X, User, RotateCcw, Sparkles, FileText, Calendar, Calculator, Phone, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── Types ─── */
interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  actions?: ActionButton[];
  isTyping?: boolean;
}

interface ActionButton {
  label: string;
  icon: 'pratica' | 'prenota' | 'isee' | 'pratiche' | 'contatti';
  path: string;
}

/* ─── Action config ─── */
const actionConfig: Record<string, { label: string; icon: React.ElementType; path: string }> = {
  'NUOVA_PRATICA': { label: 'Apri pratica', icon: FileText, path: '/area-cliente/nuova-pratica' },
  'PRENOTA':       { label: 'Prenota appuntamento', icon: Calendar, path: '/area-cliente/appuntamento' },
  'CALCOLA_ISEE':  { label: 'Calcola ISEE', icon: Calculator, path: '/strumenti/calcolatore-isee' },
  'PRATICHE':      { label: 'Le mie pratiche', icon: FileText, path: '/area-cliente/pratiche' },
  'CONTATTI':      { label: 'Contatti', icon: Phone, path: '/contatti' },
};

/* ─── Parse actions from AI response ─── */
function parseActions(text: string): { cleanText: string; actions: ActionButton[] } {
  const actions: ActionButton[] = [];
  let cleanText = text;
  const regex = /\[AZIONE:(\w+)\]/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const key = match[1];
    const cfg = actionConfig[key];
    if (cfg) {
      actions.push({ label: cfg.label, icon: key.toLowerCase() as ActionButton['icon'], path: cfg.path });
    }
    cleanText = cleanText.replace(match[0], '');
  }
  cleanText = cleanText.replace(/\n{3,}/g, '\n\n').trim();
  return { cleanText, actions };
}

/* ─── Simple markdown renderer ─── */
function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        // Bold
        let html = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Emoji bullets
        html = html.replace(/^[-•]\s/, '· ');
        // Numbered list
        const isNumbered = /^\d+\.\s/.test(html);
        return (
          <p key={i} className={`${isNumbered ? 'pl-1' : ''}`} dangerouslySetInnerHTML={{ __html: html }} />
        );
      })}
    </div>
  );
}

/* ─── Fallback knowledge base (offline / when API is down) ─── */
const fallbackKB: Record<string, string> = {
  'isee': '📋 **ISEE** serve per accedere a bonus e agevolazioni.\n\n**Documenti necessari:**\n- Documento identità e CF\n- CU (Certificazione Unica)\n- Saldo e giacenza media conti al 31/12\n- Visure catastali\n- Certificazione disabilità (se presente)\n\n**Costi:** Gratuito per associati SILCED, da €30 per non associati.\n\n[AZIONE:CALCOLA_ISEE]\n[AZIONE:PRENOTA]',
  'pensione': '🏦 **Pensioni disponibili:**\n- Vecchiaia: 67 anni + 20 anni contributi\n- Anticipata: 42a 10m (uomo) / 41a 10m (donna)\n- Quota 103: 62 anni + 41 anni contributi\n- Opzione Donna: requisiti specifici\n\nPossiamo simulare la tua pensione!\n\n[AZIONE:NUOVA_PRATICA]\n[AZIONE:PRENOTA]',
  'bonus': '💡 **Bonus attivi 2025-2026:**\n1. **Bonus Bollette** — ISEE ≤ 9.530€\n2. **Assegno Unico Figli** — da €57 a €199/mese\n3. **Bonus Asilo Nido** — fino a €3.600/anno\n4. **ADI** — ISEE ≤ 9.360€\n5. **Bonus Affitto Giovani** — under 31\n6. **Carta Dedicata a Te** — €500\n\n[AZIONE:NUOVA_PRATICA]\n[AZIONE:CALCOLA_ISEE]',
  'contatti': '📞 **Contatti SILCED:**\n- Numero verde: 800.123.456\n- Email: info@silced.it\n- WhatsApp: Lun-Ven 9-18\n- Sedi: Roma, Milano, Napoli, Torino, Bari\n\n[AZIONE:CONTATTI]\n[AZIONE:PRENOTA]',
  'default': 'Ciao! Sono l\'assistente AI di **SILCED** 🤖\n\nPosso aiutarti con:\n- 📋 **ISEE e dichiarazioni**\n- 💰 **Bonus e bandi attivi**\n- 🏦 **Pensioni e previdenza**\n- 📄 **Pratiche e documenti**\n- 📅 **Prenotazioni**\n\nChiedimi qualsiasi cosa!',
};

function getFallback(input: string): string {
  const l = input.toLowerCase();
  if (l.includes('isee') || l.includes('document')) return fallbackKB['isee'];
  if (l.includes('pension') || l.includes('pensione')) return fallbackKB['pensione'];
  if (l.includes('bonus') || l.includes('bando') || l.includes('bandi') || l.includes('agevolaz')) return fallbackKB['bonus'];
  if (l.includes('contatt') || l.includes('telefon') || l.includes('email') || l.includes('sede')) return fallbackKB['contatti'];
  return 'Non ho trovato informazioni specifiche. Prova a riformulare la domanda, oppure prenota un appuntamento per assistenza personalizzata.\n\n[AZIONE:PRENOTA]\n[AZIONE:CONTATTI]';
}

/* ─── Quick suggestion chips ─── */
const quickSuggestions = [
  { label: '💰 Bonus disponibili', text: 'Quali bonus posso richiedere?' },
  { label: '📋 Info ISEE', text: 'Come fare l\'ISEE?' },
  { label: '🏦 Pensione', text: 'Quando posso andare in pensione?' },
  { label: '📄 Apri pratica', text: 'Voglio aprire una nuova pratica' },
  { label: '📅 Prenota', text: 'Voglio prenotare un appuntamento' },
  { label: '💼 NASpI', text: 'Come richiedere la NASpI?' },
  { label: '🏠 Bonus casa', text: 'Bonus ristrutturazione e casa' },
  { label: '👨‍👩‍👧 Assegno Unico', text: 'Info sull\'Assegno Unico Figli' },
];

/* ─── MAIN COMPONENT ─── */
export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Init welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const { cleanText, actions } = parseActions(fallbackKB['default']);
      setMessages([{ id: 0, text: cleanText, sender: 'bot', actions }]);
    }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendToAI = useCallback(async (userText: string, history: Message[]) => {
    // Build message history for API
    const apiMessages = history
      .filter(m => !m.isTyping)
      .slice(-8)
      .map(m => ({ role: m.sender === 'user' ? 'user' as const : 'assistant' as const, content: m.text }));
    apiMessages.push({ role: 'user', content: userText });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.reply as string;
    } catch {
      // Fallback to local KB
      return getFallback(userText);
    }
  }, []);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now(), text: text.trim(), sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    // Add typing indicator
    const typingId = Date.now() + 1;
    setMessages(prev => [...prev, { id: typingId, text: '', sender: 'bot', isTyping: true }]);

    const reply = await sendToAI(text.trim(), [...messages, userMsg]);
    const { cleanText, actions } = parseActions(reply);

    // Replace typing indicator with actual response
    setMessages(prev => prev.filter(m => m.id !== typingId).concat({
      id: Date.now() + 2, text: cleanText, sender: 'bot', actions: actions.length > 0 ? actions : undefined,
    }));
    setIsLoading(false);
  }, [isLoading, messages, sendToAI]);

  const handleReset = () => {
    const { cleanText, actions } = parseActions(fallbackKB['default']);
    setMessages([{ id: Date.now(), text: cleanText, sender: 'bot', actions }]);
    setShowSuggestions(true);
    setIsLoading(false);
  };

  const handleAction = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const ActionIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'pratica': case 'pratiche': return <FileText className="w-3 h-3" />;
      case 'prenota': return <Calendar className="w-3 h-3" />;
      case 'isee': return <Calculator className="w-3 h-3" />;
      case 'contatti': return <Phone className="w-3 h-3" />;
      default: return <ArrowRight className="w-3 h-3" />;
    }
  };

  return (
    <div className={`fixed z-50 ${open ? 'inset-0 sm:inset-auto sm:bottom-6 sm:right-6' : 'bottom-6 right-6'}`}>
      {open && (
        <div className="w-full h-full sm:mb-3 sm:w-[380px] sm:rounded-2xl sm:shadow-2xl bg-white sm:border border-gray-200 overflow-hidden flex flex-col sm:h-[540px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-violet-700 px-4 py-3 text-white shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-sm block leading-tight">Assistente SILCED</span>
                  <span className="text-[10px] text-blue-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Alimentato da AI
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handleReset} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Nuova chat">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.isTyping ? (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div className="bg-white rounded-xl rounded-bl-md px-3 py-2.5 shadow-sm border border-gray-100">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.sender === 'bot' && (
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                      )}
                      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                      }`}>
                        {msg.sender === 'bot' ? <RenderMarkdown text={msg.text} /> : msg.text}
                      </div>
                      {msg.sender === 'user' && (
                        <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-3.5 h-3.5 text-gray-600" />
                        </div>
                      )}
                    </div>
                    {/* Action buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                        {msg.actions.map((action, idx) => (
                          <button key={idx} onClick={() => handleAction(action.path)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                            <ActionIcon type={action.icon} />
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Quick Suggestions */}
          {showSuggestions && messages.length <= 1 && (
            <div className="px-3 py-2 bg-white border-t border-gray-100 shrink-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Suggerimenti rapidi</p>
              <div className="flex flex-wrap gap-1.5">
                {quickSuggestions.slice(0, 6).map((s, i) => (
                  <button key={i} onClick={() => handleSend(s.text)}
                    className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-[11px] hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors">
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLoading ? 'L\'AI sta pensando...' : 'Chiedimi qualsiasi cosa...'}
                disabled={isLoading}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-400 placeholder:text-gray-400"
              />
              <button type="submit" disabled={!input.trim() || isLoading}
                className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[9px] text-gray-400 text-center mt-1.5">Powered by AI · Le risposte possono contenere errori</p>
          </div>
        </div>
      )}

      {!open && (
        <button onClick={() => setOpen(true)}
          className="group w-14 h-14 bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center relative"
          title="Assistente AI SILCED"
        >
          <Sparkles className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </span>
        </button>
      )}
    </div>
  );
}
