import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Calendar, Bell, ArrowRight, Bot, User, Settings, LogOut, TrendingUp, FileCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Pratica {
  id: string;
  codice: string;
  titolo: string;
  stato: string;
  created_at: string;
  servizio_nome?: string;
}

interface Notifica {
  id: string;
  titolo: string;
  messaggio: string;
  tipo: string;
  letta: boolean;
  created_at: string;
  link?: string;
}

interface Appuntamento {
  id: string;
  data_ora: string;
  stato: string;
  note?: string;
  servizio_nome?: string;
}

const statoColors: Record<string, { bg: string; text: string; label: string }> = {
  ricevuta: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Ricevuta' },
  verifica_documenti: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Verifica documenti' },
  in_lavorazione: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'In lavorazione' },
  attesa_ente: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Attesa ente' },
  attesa_documenti: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Attesa documenti' },
  completata: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completata' },
  rifiutata: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rifiutata' },
  annullata: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Annullata' },
};

export default function DashboardCliente() {
  const { profile, signOut } = useAuth();
  const [pratiche, setPratiche] = useState<Pratica[]>([]);
  const [notifiche, setNotifiche] = useState<Notifica[]>([]);
  const [appuntamenti, setAppuntamenti] = useState<Appuntamento[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingData(true);
    const [praticheRes, notificheRes, appuntamentiRes] = await Promise.all([
      supabase.from('pratiche').select('id, codice, titolo, stato, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('notifiche').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('appuntamenti').select('id, data_ora, stato, note').gte('data_ora', new Date().toISOString()).order('data_ora').limit(3),
    ]);
    if (praticheRes.data) setPratiche(praticheRes.data);
    if (notificheRes.data) setNotifiche(notificheRes.data);
    if (appuntamentiRes.data) setAppuntamenti(appuntamentiRes.data);
    setLoadingData(false);
  };

  const unreadCount = notifiche.filter(n => !n.letta).length;

  const markAsRead = async (id: string) => {
    await supabase.from('notifiche').update({ letta: true }).eq('id', id);
    setNotifiche(prev => prev.map(n => n.id === id ? { ...n, letta: true } : n));
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatDateTime = (d: string) => new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
              <span className="font-bold text-gray-900 hidden sm:block">SILCED</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-medium text-gray-600">Area Cliente</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/area-cliente/notifiche" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-gray-900">{profile?.nome} {profile?.cognome}</div>
                <div className="text-xs text-gray-500">{profile?.email}</div>
              </div>
              <button onClick={signOut} className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-1" title="Esci">
                <LogOut className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 sm:py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Ciao, {profile?.nome || 'Utente'}!
          </h1>
          <p className="text-gray-600 mt-1">Gestisci le tue pratiche, appuntamenti e documenti.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <Link to="/area-cliente/nuova-pratica" className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-colors group">
            <Plus className="w-6 h-6 mb-2" />
            <div className="font-semibold text-sm">Nuova Pratica</div>
            <div className="text-xs text-blue-200 mt-0.5">Apri una richiesta</div>
          </Link>
          <Link to="/area-cliente/appuntamento" className="bg-white border border-gray-200 p-4 rounded-2xl hover:border-blue-300 hover:shadow-sm transition-all group">
            <Calendar className="w-6 h-6 mb-2 text-blue-600" />
            <div className="font-semibold text-sm text-gray-900">Appuntamento</div>
            <div className="text-xs text-gray-500 mt-0.5">Prenota visita</div>
          </Link>
          <Link to="/area-cliente/pratiche" className="bg-white border border-gray-200 p-4 rounded-2xl hover:border-blue-300 hover:shadow-sm transition-all group">
            <FileText className="w-6 h-6 mb-2 text-indigo-600" />
            <div className="font-semibold text-sm text-gray-900">Le mie pratiche</div>
            <div className="text-xs text-gray-500 mt-0.5">Vedi lo stato</div>
          </Link>
          <Link to="/strumenti/calcolatore-isee" className="bg-white border border-gray-200 p-4 rounded-2xl hover:border-blue-300 hover:shadow-sm transition-all group">
            <TrendingUp className="w-6 h-6 mb-2 text-green-600" />
            <div className="font-semibold text-sm text-gray-900">Calcola ISEE</div>
            <div className="text-xs text-gray-500 mt-0.5">Simulazione online</div>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pratiche recenti */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-blue-600" />
                  Pratiche recenti
                </h2>
                <Link to="/area-cliente/pratiche" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                  Vedi tutte <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {loadingData ? (
                <div className="p-8 text-center text-gray-400">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
                </div>
              ) : pratiche.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {pratiche.map(p => {
                    const s = statoColors[p.stato] || statoColors.ricevuta;
                    return (
                      <Link key={p.id} to={`/area-cliente/pratiche/${p.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate">{p.titolo}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{p.codice} · {formatDate(p.created_at)}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text} shrink-0 ml-3`}>
                          {s.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Nessuna pratica ancora</p>
                  <Link to="/area-cliente/nuova-pratica" className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium mt-2 hover:text-blue-800">
                    <Plus className="w-3 h-3" /> Apri la tua prima pratica
                  </Link>
                </div>
              )}
            </div>

            {/* Prossimi appuntamenti */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mt-6">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Prossimi appuntamenti
                </h2>
                <Link to="/area-cliente/appuntamento" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                  Prenota <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {appuntamenti.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {appuntamenti.map(a => (
                    <div key={a.id} className="flex items-center gap-4 p-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex flex-col items-center justify-center shrink-0">
                        <div className="text-xs font-bold text-blue-700">{new Date(a.data_ora).toLocaleDateString('it-IT', { day: '2-digit' })}</div>
                        <div className="text-[10px] text-blue-500 uppercase">{new Date(a.data_ora).toLocaleDateString('it-IT', { month: 'short' })}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm">{a.note || 'Appuntamento'}</div>
                        <div className="text-xs text-gray-500">{formatDateTime(a.data_ora)}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${a.stato === 'confermato' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {a.stato === 'confermato' ? 'Confermato' : 'In attesa'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Nessun appuntamento programmato</p>
                  <Link to="/area-cliente/appuntamento" className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium mt-2 hover:text-blue-800">
                    <Plus className="w-3 h-3" /> Prenota ora
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifiche */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  Notifiche
                  {unreadCount > 0 && (
                    <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>
                  )}
                </h2>
              </div>
              {notifiche.length > 0 ? (
                <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                  {notifiche.slice(0, 5).map(n => (
                    <div key={n.id} className={`p-3 ${!n.letta ? 'bg-blue-50/50' : ''}`} onClick={() => !n.letta && markAsRead(n.id)}>
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.letta ? 'bg-blue-500' : 'bg-gray-300'}`} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{n.titolo}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{n.messaggio}</div>
                          <div className="text-[10px] text-gray-400 mt-1">{formatDateTime(n.created_at)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs">Nessuna notifica</p>
                </div>
              )}
            </div>

            {/* AI Assistant CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-5 h-5" />
                <span className="font-semibold text-sm">Assistente AI</span>
              </div>
              <p className="text-sm text-blue-100 mb-4">
                Hai bisogno di aiuto? Il nostro assistente può guidarti nella compilazione delle pratiche.
              </p>
              <button
                onClick={() => { const btn = document.querySelector('[title="Assistente AI SILCED"]') as HTMLButtonElement; btn?.click(); }}
                className="w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4" /> Chatta con l'assistente
              </button>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Il tuo profilo</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tessera</span>
                  <span className="font-medium text-gray-900">{profile?.numero_tessera || 'Non associato'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Stato</span>
                  <span className={`font-medium ${profile?.associato ? 'text-green-600' : 'text-gray-500'}`}>
                    {profile?.associato ? 'Associato' : 'Non associato'}
                  </span>
                </div>
              </div>
              <Link to="/area-cliente/profilo" className="mt-3 w-full py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
                <Settings className="w-3 h-3" /> Modifica profilo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
