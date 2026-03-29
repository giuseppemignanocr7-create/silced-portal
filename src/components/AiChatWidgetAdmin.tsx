import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, X, RotateCcw, FileText, Calendar, Users, Handshake, ArrowRight, ClipboardList, Mail, Shield, BarChart3, Zap, Copy, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
  icon: string;
  action: string;
}

interface AdminChatProps {
  stats?: {
    pratiche_attive: number;
    pratiche_oggi: number;
    contatti_nuovi: number;
    appuntamenti_prossimi: number;
    partner_pendenti: number;
    totale_associati: number;
  };
  onTabChange?: (tab: string) => void;
}

/* ─── Action config ─── */
const actionConfig: Record<string, { label: string; icon: React.ElementType; tab?: string }> = {
  'PRATICHE_TAB':     { label: 'Vai a Pratiche', icon: FileText, tab: 'pratiche' },
  'APPUNTAMENTI_TAB': { label: 'Vai ad Appuntamenti', icon: Calendar, tab: 'appuntamenti' },
  'CONTATTI_TAB':     { label: 'Vai a Contatti', icon: Users, tab: 'contatti' },
  'PARTNER_TAB':      { label: 'Vai a Partner', icon: Handshake, tab: 'partner' },
  'TEMPLATE_EMAIL':   { label: 'Copia template', icon: Mail },
  'CHECKLIST_DOC':    { label: 'Checklist documenti', icon: ClipboardList },
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
      actions.push({ label: cfg.label, icon: key, action: cfg.tab || key });
    }
    cleanText = cleanText.replace(match[0], '');
  }
  cleanText = cleanText.replace(/\n{3,}/g, '\n\n').trim();
  return { cleanText, actions };
}

/* ─── Markdown renderer ─── */
function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        let html = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/`(.+?)`/g, '<code class="bg-slate-100 text-slate-800 px-1 rounded text-[11px]">$1</code>');
        html = html.replace(/^[-•]\s/, '&bull; ');
        const isNumbered = /^\d+\.\s/.test(html);
        return (
          <p key={i} className={`${isNumbered ? 'pl-1' : ''}`} dangerouslySetInnerHTML={{ __html: html }} />
        );
      })}
    </div>
  );
}

/* ─── Copy button ─── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1 hover:bg-slate-100 rounded transition-colors" title="Copia">
      {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
    </button>
  );
}

/* ─── Fallback KB ─── */
const fallbackKB: Record<string, string> = {
  'pratiche': '📋 **Gestione Pratiche**\n\nStati disponibili:\n1. **Ricevuta** → Verifica documenti\n2. **Verifica documenti** → In lavorazione\n3. **In lavorazione** → Attesa ente / Completata\n4. **Attesa ente** → Completata / Rifiutata\n\nUsa il tab Pratiche per aggiornare gli stati.\n\n[AZIONE:PRATICHE_TAB]',
  'documenti': '📄 **Checklist Documenti ISEE:**\n- CU tutti i componenti\n- Saldi e giacenze medie 31/12\n- Visure catastali\n- Contratto affitto\n- Certificazione disabilità\n- Targhe veicoli > 500cc\n\n**Per il 730:**\n- CU lavoro/pensione\n- Spese mediche e farmacia\n- Interessi mutuo\n- Spese istruzione\n\n[AZIONE:CHECKLIST_DOC]',
  'scadenze': '📅 **Scadenze principali:**\n- **730**: disponibile 30/04, scadenza 30/09\n- **ISEE**: rinnovo annuale 01/01-31/12\n- **NASpI**: 68 giorni dal licenziamento\n- **IMU**: acconto 16/06, saldo 16/12\n- **RED**: scadenza 28/02\n- **Successione**: 12 mesi dall\'apertura',
  'default': '🛡️ **Assistente Operativo SILCED**\n\nSono il tuo assistente AI per la gestione del patronato.\n\nPosso aiutarti con:\n- 📋 **Gestione pratiche** e stati\n- 📄 **Checklist documenti** per tipo\n- 📧 **Template comunicazioni** clienti\n- 📅 **Scadenze** e normativa\n- 📊 **Analisi** e statistiche\n- 🔄 **Procedure operative**\n\nChiedimi qualsiasi cosa!',
};

function getFallback(input: string): string {
  const l = input.toLowerCase();
  if (l.includes('pratic') || l.includes('stato') || l.includes('lavoraz')) return fallbackKB['pratiche'];
  if (l.includes('document') || l.includes('checklist') || l.includes('isee') || l.includes('730')) return fallbackKB['documenti'];
  if (l.includes('scaden') || l.includes('deadline') || l.includes('quando')) return fallbackKB['scadenze'];
  return 'Non ho trovato info specifiche. Prova a riformulare oppure consulta le procedure operative.\n\n[AZIONE:PRATICHE_TAB]';
}

/* ─── Quick suggestions for admin ─── */
const adminSuggestions = [
  { label: '📋 Pratiche in ritardo', text: 'Quali pratiche sono in ritardo e come gestirle?' },
  { label: '📄 Checklist ISEE', text: 'Dammi la checklist completa documenti ISEE' },
  { label: '📧 Template richiesta docs', text: 'Genera un template email per richiedere documenti mancanti al cliente' },
  { label: '📅 Scadenze del mese', text: 'Quali sono le scadenze principali di questo mese?' },
  { label: '📊 Analisi KPI', text: 'Analizza i KPI della dashboard e suggerisci miglioramenti' },
  { label: '🔄 Procedura NASpI', text: 'Qual è la procedura completa per una pratica NASpI?' },
  { label: '📧 Template pratica completata', text: 'Genera template email per comunicare al cliente che la pratica è completata' },
  { label: '⚖️ Normativa pensioni', text: 'Riepilogo normativa pensioni 2026 aggiornata' },
];

/* ─── MAIN COMPONENT ─── */
export default function AiChatWidgetAdmin({ stats, onTabChange }: AdminChatProps) {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    const apiMessages = history
      .filter(m => !m.isTyping)
      .slice(-10)
      .map(m => ({ role: m.sender === 'user' ? 'user' as const : 'assistant' as const, content: m.text }));
    apiMessages.push({ role: 'user', content: userText });

    try {
      const res = await fetch('/api/chat-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          context: {
            stats,
            operatorName: profile ? `${profile.nome || ''} ${profile.cognome || ''}`.trim() : 'Operatore',
          },
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.reply as string;
    } catch {
      return getFallback(userText);
    }
  }, [stats, profile]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now(), text: text.trim(), sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    const typingId = Date.now() + 1;
    setMessages(prev => [...prev, { id: typingId, text: '', sender: 'bot', isTyping: true }]);

    const reply = await sendToAI(text.trim(), [...messages, userMsg]);
    const { cleanText, actions } = parseActions(reply);

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

  const handleAction = (action: string) => {
    const cfg = actionConfig[action];
    if (cfg?.tab && onTabChange) {
      onTabChange(cfg.tab);
      setOpen(false);
    }
  };

  const ActionIcon = ({ type }: { type: string }) => {
    const cfg = actionConfig[type];
    if (cfg) {
      const Icon = cfg.icon;
      return <Icon className="w-3 h-3" />;
    }
    return <ArrowRight className="w-3 h-3" />;
  };

  return (
    <div className={`fixed z-50 ${open ? 'inset-0 sm:inset-auto sm:bottom-24 sm:right-6' : 'bottom-6 right-6'}`}>
      {open && (
        <div className="w-full h-full sm:w-[400px] sm:max-h-[min(520px,calc(100vh-120px))] sm:rounded-2xl sm:shadow-2xl bg-white sm:border border-slate-200 overflow-hidden flex flex-col">
          {/* Header — dark theme for admin */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 text-white shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="font-bold text-sm block leading-tight">AI Patronato</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" /> Modalità Operatore
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handleReset} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Nuova chat">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Stats bar */}
            {stats && (
              <div className="flex gap-3 mt-2 pt-2 border-t border-slate-700">
                <div className="text-center flex-1">
                  <div className="text-xs font-bold text-white">{stats.pratiche_attive}</div>
                  <div className="text-[9px] text-slate-400">Attive</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-xs font-bold text-amber-400">{stats.pratiche_oggi}</div>
                  <div className="text-[9px] text-slate-400">Oggi</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-xs font-bold text-blue-400">{stats.appuntamenti_prossimi}</div>
                  <div className="text-[9px] text-slate-400">Appunt.</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-xs font-bold text-green-400">{stats.contatti_nuovi}</div>
                  <div className="text-[9px] text-slate-400">Contatti</div>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.isTyping ? (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 bg-slate-200 rounded-lg flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                    <div className="bg-white rounded-xl rounded-bl-md px-3 py-2.5 shadow-sm border border-slate-100">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.sender === 'bot' && (
                        <div className="w-7 h-7 bg-slate-200 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                      )}
                      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-relaxed relative group ${
                        msg.sender === 'user'
                          ? 'bg-slate-800 text-white rounded-br-md'
                          : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-md'
                      }`}>
                        {msg.sender === 'bot' ? (
                          <>
                            <RenderMarkdown text={msg.text} />
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <CopyButton text={msg.text} />
                            </div>
                          </>
                        ) : msg.text}
                      </div>
                      {msg.sender === 'user' && (
                        <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                          <BarChart3 className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                      )}
                    </div>
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                        {msg.actions.map((action, idx) => (
                          <button key={idx} onClick={() => handleAction(action.action)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors">
                            <ActionIcon type={action.action} />
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
            <div className="px-3 py-2 bg-white border-t border-slate-100 shrink-0">
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Azioni rapide</p>
              <div className="flex flex-wrap gap-1">
                {adminSuggestions.slice(0, 6).map((s, i) => (
                  <button key={i} onClick={() => handleSend(s.text)}
                    className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-md text-[10px] hover:bg-amber-50 hover:border-amber-200 hover:text-amber-800 transition-colors">
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-slate-200 bg-white shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLoading ? 'Elaborazione...' : 'Chiedi procedure, template, analisi...'}
                disabled={isLoading}
                className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 disabled:bg-slate-50 disabled:text-slate-400 placeholder:text-slate-400"
              />
              <button type="submit" disabled={!input.trim() || isLoading}
                className="p-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[9px] text-slate-400 text-center mt-1.5">AI Patronato · Uso interno SILCED</p>
          </div>
        </div>
      )}

      {!open && (
        <button onClick={() => setOpen(true)}
          className="group w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center relative"
          title="AI Patronato SILCED"
        >
          <Shield className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </span>
        </button>
      )}
    </div>
  );
}
