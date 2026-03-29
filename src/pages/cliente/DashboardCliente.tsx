import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Plus, Calendar, Bell, ArrowRight, Bot, User, Settings, LogOut,
  TrendingUp, Home, X, Clock, Megaphone, ClipboardList, ChevronRight,
  Sparkles, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

/* ─── Config ─── */
const statoColors: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  ricevuta:           { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500',   label: 'Ricevuta' },
  verifica_documenti: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500', label: 'Verifica doc.' },
  in_lavorazione:     { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500', label: 'In lavorazione' },
  attesa_ente:        { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Attesa ente' },
  attesa_documenti:   { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500',  label: 'Attesa doc.' },
  completata:         { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500',  label: 'Completata' },
  rifiutata:          { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500',    label: 'Rifiutata' },
  annullata:          { bg: 'bg-gray-50',   text: 'text-gray-500',   dot: 'bg-gray-400',   label: 'Annullata' },
};

const sidebarItems = [
  { key: 'home',     label: 'Home',            icon: Home,          path: '/area-cliente' },
  { key: 'pratiche', label: 'Le mie pratiche',  icon: ClipboardList, path: '/area-cliente/pratiche' },
  { key: 'appunt',   label: 'Appuntamenti',     icon: Calendar,      path: '/area-cliente/appuntamento' },
  { key: 'notif',    label: 'Notifiche',        icon: Bell,          path: '/area-cliente/notifiche' },
  { key: 'profilo',  label: 'Il mio profilo',   icon: User,          path: '/area-cliente/profilo' },
];

const bandiList = [
  { titolo: 'Bonus Bollette 2026', desc: 'Sconto su luce, gas e acqua per ISEE fino a 9.530€. Verifica se hai diritto.', tag: 'Bonus', tagColor: 'bg-emerald-50 text-emerald-700', icon: '💡' },
  { titolo: 'Assegno Unico Figli', desc: 'Contributo mensile per ogni figlio a carico fino a 21 anni.', tag: 'Famiglia', tagColor: 'bg-violet-50 text-violet-700', icon: '👨‍👩‍👧' },
  { titolo: 'Reddito di Inclusione', desc: 'Nuovo supporto per famiglie in difficoltà. Verifica i requisiti.', tag: 'Sostegno', tagColor: 'bg-blue-50 text-blue-700', icon: '🤝' },
  { titolo: 'Bonus Affitto Giovani', desc: 'Contributo per under 31 con reddito fino a 15.493€.', tag: 'Casa', tagColor: 'bg-orange-50 text-orange-700', icon: '🏠' },
];

/* ─── Helpers ─── */
function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}>{children}</span>;
}

function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours();
  if (h < 13) return { text: 'Buongiorno', emoji: '☀️' };
  if (h < 18) return { text: 'Buon pomeriggio', emoji: '🌤️' };
  return { text: 'Buonasera', emoji: '🌙' };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── MAIN ─── */
export default function DashboardCliente() {
  const { profile, signOut, isAdmin, isOperatore } = useAuth();
  const navigate = useNavigate();
  const [pratiche, setPratiche] = useState<any[]>([]);
  const [notifiche, setNotifiche] = useState<any[]>([]);
  const [appuntamenti, setAppuntamenti] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAdmin || isOperatore) { navigate('/admin', { replace: true }); return; }
    loadData();
  }, [isAdmin, isOperatore]);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    const [pRes, nRes, aRes] = await Promise.all([
      supabase.from('pratiche').select('id, codice, titolo, stato, created_at, priorita').order('created_at', { ascending: false }).limit(5),
      supabase.from('notifiche').select('*').order('created_at', { ascending: false }).limit(8),
      supabase.from('appuntamenti').select('id, data_ora, stato, note').gte('data_ora', new Date().toISOString()).order('data_ora').limit(4),
    ]);
    if (pRes.data) setPratiche(pRes.data);
    if (nRes.data) setNotifiche(nRes.data);
    if (aRes.data) setAppuntamenti(aRes.data);
    setLoadingData(false);
  }, []);

  const unreadCount = notifiche.filter(n => !n.letta).length;
  const markAsRead = async (id: string) => {
    await supabase.from('notifiche').update({ letta: true }).eq('id', id);
    setNotifiche(prev => prev.map(n => n.id === id ? { ...n, letta: true } : n));
  };

  const greeting = getGreeting();

  if (loadingData && pratiche.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 animate-pulse">S</div>
          <p className="text-gray-500 text-sm">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ─── Sidebar Desktop ─── */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-30">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-50">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">S</div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">SILCED</div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Area Cliente</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {sidebarItems.map(item => (
            <Link key={item.key} to={item.path}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                item.key === 'home' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}>
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
              {item.key === 'notif' && unreadCount > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center bg-red-100 text-red-600">{unreadCount}</span>
              )}
            </Link>
          ))}
          <div className="pt-4 mt-4 border-t border-gray-100">
            <Link to="/area-cliente/nuova-pratica" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all">
              <Plus className="w-[18px] h-[18px]" /> Nuova Pratica
            </Link>
          </div>
        </nav>

        <div className="px-3 pb-3">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all">
            <Home className="w-[18px] h-[18px]" /> Vai al sito
          </Link>
        </div>

        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0">
              {profile?.nome?.[0]}{profile?.cognome?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">{profile?.nome} {profile?.cognome}</div>
              <div className="text-xs text-gray-400 truncate">{profile?.email}</div>
            </div>
            <button onClick={signOut} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Esci">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Sidebar ─── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">S</div>
                <span className="font-bold text-gray-900 text-sm">SILCED</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {sidebarItems.map(item => (
                <Link key={item.key} to={item.path} onClick={() => setSidebarOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all">
                  <item.icon className="w-5 h-5" /> <span>{item.label}</span>
                </Link>
              ))}
              <Link to="/area-cliente/nuova-pratica" onClick={() => setSidebarOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 mt-3">
                <Plus className="w-5 h-5" /> Nuova Pratica
              </Link>
            </nav>
            <div className="px-4 py-4 border-t border-gray-100">
              <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium">
                <LogOut className="w-5 h-5" /> Esci
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ─── Main Content ─── */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
          <div className="flex items-center justify-between h-14 px-4 lg:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <span className="text-sm font-medium text-gray-400 hidden sm:block">
                {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/area-cliente/notifiche" className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-4 h-4 text-gray-500" />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
              </Link>
              <Link to="/area-cliente/profilo" className="p-2 hover:bg-gray-100 rounded-lg"><Settings className="w-4 h-4 text-gray-500" /></Link>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8 max-w-6xl">
          {/* Greeting */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {greeting.text}, {profile?.nome || 'Utente'}! <span className="text-2xl">{greeting.emoji}</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Cosa vuoi fare oggi? Scegli un'azione rapida qui sotto.</p>
          </div>

          {/* ─── Quick Actions ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <Link to="/area-cliente/nuova-pratica" className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 text-white p-5 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-200/50">
              <div className="absolute -right-3 -bottom-3 opacity-10"><Plus className="w-20 h-20" /></div>
              <Plus className="w-7 h-7 mb-3" />
              <div className="font-bold text-sm">Nuova Pratica</div>
              <div className="text-xs text-blue-200 mt-0.5">Apri una richiesta</div>
            </Link>
            <Link to="/area-cliente/appuntamento" className="bg-white border border-gray-200 p-5 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all">
              <Calendar className="w-7 h-7 mb-3 text-indigo-600" />
              <div className="font-bold text-sm text-gray-900">Appuntamento</div>
              <div className="text-xs text-gray-500 mt-0.5">Prenota una visita</div>
            </Link>
            <Link to="/area-cliente/pratiche" className="bg-white border border-gray-200 p-5 rounded-2xl hover:border-violet-300 hover:shadow-md transition-all">
              <ClipboardList className="w-7 h-7 mb-3 text-violet-600" />
              <div className="font-bold text-sm text-gray-900">Le mie pratiche</div>
              <div className="text-xs text-gray-500 mt-0.5">Controlla lo stato</div>
            </Link>
            <Link to="/strumenti/calcolatore-isee" className="bg-white border border-gray-200 p-5 rounded-2xl hover:border-emerald-300 hover:shadow-md transition-all">
              <TrendingUp className="w-7 h-7 mb-3 text-emerald-600" />
              <div className="font-bold text-sm text-gray-900">Calcola ISEE</div>
              <div className="text-xs text-gray-500 mt-0.5">Simulazione rapida</div>
            </Link>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* ─── Left Column (3/5) ─── */}
            <div className="lg:col-span-3 space-y-6">
              {/* Pratiche recenti */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" /> Le tue pratiche
                  </h2>
                  <Link to="/area-cliente/pratiche" className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                    Vedi tutte <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                {pratiche.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {pratiche.map(p => {
                      const s = statoColors[p.stato] || statoColors.ricevuta;
                      return (
                        <Link key={p.id} to={`/area-cliente/pratiche/${p.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors group">
                          <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-sm truncate">{p.titolo}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{p.codice} · {formatDate(p.created_at)}</div>
                          </div>
                          <Badge className={`${s.bg} ${s.text} shrink-0`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {s.label}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
                      <FileText className="w-7 h-7 text-blue-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Nessuna pratica ancora</h3>
                    <p className="text-xs text-gray-500 text-center max-w-xs mb-3">Apri la tua prima pratica in pochi semplici passaggi!</p>
                    <Link to="/area-cliente/nuova-pratica" className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Apri pratica
                    </Link>
                  </div>
                )}
              </div>

              {/* Bandi & Novità */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-orange-500" /> Bandi e Novità
                  </h2>
                  <Badge className="bg-orange-50 text-orange-600"><Sparkles className="w-3 h-3" /> Aggiornato</Badge>
                </div>
                <div className="divide-y divide-gray-50">
                  {bandiList.map((b, i) => (
                    <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors cursor-pointer">
                      <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center text-xl shrink-0">{b.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-gray-900 text-sm">{b.titolo}</span>
                          <Badge className={b.tagColor}>{b.tag}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
                      </div>
                      <Link to="/area-cliente/nuova-pratica" className="shrink-0 p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Richiedi">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-50">
                  <p className="text-[11px] text-gray-400 text-center">Hai dubbi su un bando? <button onClick={() => { const btn = document.querySelector('[title="Assistente AI SILCED"]') as HTMLButtonElement; btn?.click(); }} className="text-blue-600 font-semibold hover:underline">Chiedi all'assistente AI</button></p>
                </div>
              </div>
            </div>

            {/* ─── Right Column (2/5) ─── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Appuntamenti */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" /> Prossimi appuntamenti
                  </h3>
                  <Link to="/area-cliente/appuntamento" className="text-xs text-blue-600 font-semibold">Prenota</Link>
                </div>
                {appuntamenti.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {appuntamenti.slice(0, 3).map(a => {
                      const dt = new Date(a.data_ora);
                      return (
                        <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex flex-col items-center justify-center shrink-0">
                            <div className="text-sm font-bold text-indigo-700 leading-none">{dt.getDate()}</div>
                            <div className="text-[9px] text-indigo-500 uppercase font-semibold">{dt.toLocaleDateString('it-IT', { month: 'short' })}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">{a.note || 'Appuntamento'}</div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />{dt.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${a.stato === 'confermato' ? 'bg-green-500' : 'bg-yellow-400'}`} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-10 px-4 text-center">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-6 h-6 text-indigo-400" />
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Nessun appuntamento in programma</p>
                    <Link to="/area-cliente/appuntamento" className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Prenota ora
                    </Link>
                  </div>
                )}
              </div>

              {/* Notifiche */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-500" /> Notifiche
                    {unreadCount > 0 && (
                      <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>
                    )}
                  </h3>
                  <Link to="/area-cliente/notifiche" className="text-xs text-blue-600 font-semibold">Tutte</Link>
                </div>
                {notifiche.length > 0 ? (
                  <div className="divide-y divide-gray-50 max-h-56 overflow-y-auto">
                    {notifiche.slice(0, 5).map(n => (
                      <div key={n.id} className={`px-5 py-3 cursor-pointer hover:bg-gray-50/50 transition-colors ${!n.letta ? 'bg-blue-50/30' : ''}`} onClick={() => !n.letta && markAsRead(n.id)}>
                        <div className="flex items-start gap-2.5">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.letta ? 'bg-blue-500' : 'bg-gray-300'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">{n.titolo}</div>
                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.messaggio}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Nessuna notifica</p>
                  </div>
                )}
              </div>

              {/* AI Assistant */}
              <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-5 h-5" />
                  <span className="font-bold text-sm">Assistente AI</span>
                </div>
                <p className="text-xs text-blue-100 mb-4 leading-relaxed">
                  Non sai quale pratica aprire? Chiedi al nostro assistente: ti guiderà passo dopo passo!
                </p>
                <button
                  onClick={() => { const btn = document.querySelector('[title="Assistente AI SILCED"]') as HTMLButtonElement; btn?.click(); }}
                  className="w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Bot className="w-4 h-4" /> Chatta ora
                </button>
              </div>

              {/* Profilo Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" /> Il tuo profilo
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Tessera</span>
                    <span className="font-semibold text-gray-900">{profile?.numero_tessera || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Stato</span>
                    <Badge className={profile?.associato ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}>
                      {profile?.associato ? '✓ Associato' : 'Non associato'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Codice Fiscale</span>
                    <span className="font-mono text-xs text-gray-700">{profile?.codice_fiscale || '—'}</span>
                  </div>
                </div>
                <Link to="/area-cliente/profilo" className="mt-4 w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 font-semibold">
                  <Settings className="w-3.5 h-3.5" /> Modifica profilo
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
