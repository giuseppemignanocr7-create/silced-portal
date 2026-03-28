import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Users, Calendar, Bell, MessageSquare, TrendingUp, 
  AlertTriangle, ArrowRight, Bot, LogOut, 
  Handshake, BarChart3, Eye, Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Stats {
  pratiche_attive: number;
  pratiche_oggi: number;
  contatti_nuovi: number;
  appuntamenti_prossimi: number;
  partner_pendenti: number;
  totale_associati: number;
}

interface PraticaRecente {
  id: string;
  codice: string;
  titolo: string;
  stato: string;
  priorita: string;
  created_at: string;
  utente_nome?: string;
  utente_cognome?: string;
}

interface ContattoRecente {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  messaggio: string;
  stato: string;
  created_at: string;
}

interface AppuntamentoRecente {
  id: string;
  nome: string;
  cognome: string;
  data_ora: string;
  stato: string;
  note?: string;
}

const statoColors: Record<string, { bg: string; text: string; label: string }> = {
  ricevuta: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Ricevuta' },
  verifica_documenti: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Verifica doc.' },
  in_lavorazione: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'In lavorazione' },
  attesa_ente: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Attesa ente' },
  attesa_documenti: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Attesa doc.' },
  completata: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completata' },
  rifiutata: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rifiutata' },
  annullata: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Annullata' },
};

const prioritaColors: Record<string, string> = {
  urgente: 'bg-red-500',
  alta: 'bg-orange-500',
  normale: 'bg-blue-500',
  bassa: 'bg-gray-400',
};

export default function DashboardAdmin() {
  const { profile, signOut } = useAuth();
  const [stats, setStats] = useState<Stats>({ pratiche_attive: 0, pratiche_oggi: 0, contatti_nuovi: 0, appuntamenti_prossimi: 0, partner_pendenti: 0, totale_associati: 0 });
  const [praticheRecenti, setPraticheRecenti] = useState<PraticaRecente[]>([]);
  const [contattiRecenti, setContattiRecenti] = useState<ContattoRecente[]>([]);
  const [appuntamentiOggi, setAppuntamentiOggi] = useState<AppuntamentoRecente[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'pratiche' | 'appuntamenti' | 'contatti' | 'partner'>('overview');

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    const [praticheRes, contattiRes, appRes, praticheCountRes, contattiCountRes, appCountRes, partnerCountRes] = await Promise.all([
      supabase.from('pratiche').select('id, codice, titolo, stato, priorita, created_at').order('created_at', { ascending: false }).limit(8),
      supabase.from('contatti').select('*').eq('stato', 'nuovo').order('created_at', { ascending: false }).limit(5),
      supabase.from('appuntamenti').select('*').gte('data_ora', new Date().toISOString()).order('data_ora').limit(5),
      supabase.from('pratiche').select('id', { count: 'exact', head: true }).not('stato', 'in', '("completata","annullata","rifiutata")'),
      supabase.from('contatti').select('id', { count: 'exact', head: true }).eq('stato', 'nuovo'),
      supabase.from('appuntamenti').select('id', { count: 'exact', head: true }).gte('data_ora', new Date().toISOString()).in('stato', ['prenotato', 'confermato']),
      supabase.from('partner_richieste').select('id', { count: 'exact', head: true }).eq('stato', 'richiesta'),
    ]);

    if (praticheRes.data) setPraticheRecenti(praticheRes.data);
    if (contattiRes.data) setContattiRecenti(contattiRes.data);
    if (appRes.data) setAppuntamentiOggi(appRes.data);

    const newStats: Stats = {
      pratiche_attive: praticheCountRes.count || 0,
      pratiche_oggi: praticheRes.data?.filter(p => new Date(p.created_at).toDateString() === new Date().toDateString()).length || 0,
      contatti_nuovi: contattiCountRes.count || 0,
      appuntamenti_prossimi: appCountRes.count || 0,
      partner_pendenti: partnerCountRes.count || 0,
      totale_associati: 0,
    };
    setStats(newStats);

    const newAlerts: string[] = [];
    const urgenti = praticheRes.data?.filter(p => p.priorita === 'urgente' && p.stato !== 'completata') || [];
    if (urgenti.length > 0) newAlerts.push(`${urgenti.length} pratica/e URGENTE/I da gestire`);
    if (newStats.contatti_nuovi > 3) newAlerts.push(`${newStats.contatti_nuovi} contatti in attesa di risposta`);
    if (newStats.partner_pendenti > 0) newAlerts.push(`${newStats.partner_pendenti} richiesta/e partner da valutare`);
    setAlerts(newAlerts);
    setLoading(false);
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 60) return `${min}min fa`;
    const hours = Math.floor(min / 60);
    if (hours < 24) return `${hours}h fa`;
    return `${Math.floor(hours / 24)}g fa`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Top Bar */}
      <div className="bg-slate-900 text-white sticky top-0 z-30">
        <div className="container flex items-center justify-between py-2.5">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xs">S</div>
              <span className="font-bold text-sm hidden sm:block">SILCED</span>
            </Link>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Area Patronato</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadDashboard} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white" title="Aggiorna">
              <TrendingUp className="w-4 h-4" />
            </button>
            <Link to="/admin/notifiche" className="relative p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
              <Bell className="w-4 h-4" />
              {alerts.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-[9px] font-bold rounded-full flex items-center justify-center">{alerts.length}</span>
              )}
            </Link>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                {profile?.nome?.[0]}{profile?.cognome?.[0]}
              </div>
              <span className="text-sm text-slate-300 hidden sm:block">{profile?.nome}</span>
              <button onClick={signOut} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-500" title="Esci">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[44px] z-20">
        <div className="container flex gap-1 overflow-x-auto py-1">
          {[
            { key: 'overview', label: 'Dashboard', icon: BarChart3 },
            { key: 'pratiche', label: 'Pratiche', icon: FileText },
            { key: 'appuntamenti', label: 'Appuntamenti', icon: Calendar },
            { key: 'contatti', label: 'Contatti', icon: MessageSquare },
            { key: 'partner', label: 'Partner', icon: Handshake },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container py-6">
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map((alert, i) => (
              <div key={i} className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-sm text-red-800 font-medium">{alert}</span>
              </div>
            ))}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {[
                { label: 'Pratiche attive', value: stats.pratiche_attive, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Nuove oggi', value: stats.pratiche_oggi, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Contatti nuovi', value: stats.contatti_nuovi, icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'Appuntamenti', value: stats.appuntamenti_prossimi, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Partner pendenti', value: stats.partner_pendenti, icon: Handshake, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Associati', value: stats.totale_associati, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              ].map(kpi => (
                <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className={`w-8 h-8 ${kpi.bg} rounded-lg flex items-center justify-center mb-2`}>
                    <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                  <div className="text-xs text-gray-500">{kpi.label}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Pratiche recenti */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" /> Ultime pratiche
                  </h2>
                  <button onClick={() => setActiveTab('pratiche')} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                    Vedi tutte <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="divide-y divide-gray-50">
                  {praticheRecenti.slice(0, 6).map(p => {
                    const s = statoColors[p.stato] || statoColors.ricevuta;
                    return (
                      <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className={`w-1.5 h-8 rounded-full ${prioritaColors[p.priorita] || prioritaColors.normale}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate">{p.titolo}</div>
                          <div className="text-xs text-gray-500">{p.codice} · {timeAgo(p.created_at)}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${s.bg} ${s.text} shrink-0`}>{s.label}</span>
                      </div>
                    );
                  })}
                  {praticheRecenti.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-sm">Nessuna pratica</div>
                  )}
                </div>
              </div>

              {/* Sidebar destra */}
              <div className="space-y-6">
                {/* Appuntamenti prossimi */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" /> Prossimi appuntamenti
                    </h2>
                  </div>
                  {appuntamentiOggi.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                      {appuntamentiOggi.map(a => (
                        <div key={a.id} className="p-3 flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex flex-col items-center justify-center shrink-0">
                            <div className="text-xs font-bold text-blue-700">{new Date(a.data_ora).getDate()}</div>
                            <div className="text-[9px] text-blue-500 uppercase">{new Date(a.data_ora).toLocaleDateString('it-IT', { month: 'short' })}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{a.nome} {a.cognome}</div>
                            <div className="text-xs text-gray-500">{new Date(a.data_ora).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                          <span className={`w-2 h-2 rounded-full ${a.stato === 'confermato' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-400 text-xs">Nessun appuntamento</div>
                  )}
                </div>

                {/* Contatti nuovi */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-orange-500" /> Contatti da gestire
                      {stats.contatti_nuovi > 0 && (
                        <span className="w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{stats.contatti_nuovi}</span>
                      )}
                    </h2>
                  </div>
                  {contattiRecenti.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                      {contattiRecenti.slice(0, 3).map(c => (
                        <div key={c.id} className="p-3">
                          <div className="text-sm font-medium text-gray-900">{c.nome} {c.cognome}</div>
                          <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{c.messaggio}</div>
                          <div className="text-[10px] text-gray-400 mt-1">{timeAgo(c.created_at)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-400 text-xs">Nessun contatto nuovo</div>
                  )}
                </div>

                {/* AI Assistant */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-sm">AI Operatore</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">Chiedi all'assistente di analizzare pratiche, generare report o suggerire azioni.</p>
                  <button
                    onClick={() => { const btn = document.querySelector('[title="Assistente AI SILCED"]') as HTMLButtonElement; btn?.click(); }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Bot className="w-3.5 h-3.5" /> Apri assistente
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* PRATICHE TAB */}
        {activeTab === 'pratiche' && (
          <PraticheTab />
        )}

        {/* APPUNTAMENTI TAB */}
        {activeTab === 'appuntamenti' && (
          <AppuntamentiTab />
        )}

        {/* CONTATTI TAB */}
        {activeTab === 'contatti' && (
          <ContattiTab />
        )}

        {/* PARTNER TAB */}
        {activeTab === 'partner' && (
          <PartnerTab />
        )}
      </div>
    </div>
  );
}

/* ============================================ */
/* SUB-COMPONENTS: TABS                         */
/* ============================================ */

function PraticheTab() {
  const [pratiche, setPratiche] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStato, setFiltroStato] = useState('');
  const [search, setSearch] = useState('');
  const [selectedPratica, setSelectedPratica] = useState<any>(null);
  const [nuovoStato, setNuovoStato] = useState('');

  useEffect(() => { loadPratiche(); }, [filtroStato]);

  const loadPratiche = async () => {
    setLoading(true);
    let query = supabase.from('pratiche').select('*').order('created_at', { ascending: false }).limit(50);
    if (filtroStato) query = query.eq('stato', filtroStato);
    const { data } = await query;
    if (data) setPratiche(data);
    setLoading(false);
  };

  const updateStato = async (id: string, stato: string) => {
    await supabase.from('pratiche').update({ stato }).eq('id', id);
    loadPratiche();
    setSelectedPratica(null);
  };

  const filtered = search
    ? pratiche.filter(p => p.codice?.toLowerCase().includes(search.toLowerCase()) || p.titolo?.toLowerCase().includes(search.toLowerCase()))
    : pratiche;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca per codice o titolo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {['', 'ricevuta', 'in_lavorazione', 'attesa_documenti', 'completata'].map(s => (
            <button
              key={s}
              onClick={() => setFiltroStato(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filtroStato === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {s ? (statoColors[s]?.label || s) : 'Tutte'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" /></div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Codice</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Pratica</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Stato</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Priorità</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Data</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const s = statoColors[p.stato] || statoColors.ricevuta;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-blue-600">{p.codice}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{p.titolo}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${s.bg} ${s.text}`}>{s.label}</span></td>
                      <td className="px-4 py-3"><span className={`w-2.5 h-2.5 rounded-full inline-block ${prioritaColors[p.priorita] || prioritaColors.normale}`} /></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString('it-IT')}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => { setSelectedPratica(p); setNuovoStato(p.stato); }} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm">Nessuna pratica trovata</div>
        )}
      </div>

      {/* Modal dettaglio pratica */}
      {selectedPratica && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPratica(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{selectedPratica.titolo}</h3>
            <p className="text-sm text-gray-500 font-mono mb-4">{selectedPratica.codice}</p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Stato attuale</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statoColors[selectedPratica.stato]?.bg} ${statoColors[selectedPratica.stato]?.text}`}>
                  {statoColors[selectedPratica.stato]?.label}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Priorità</span>
                <span className="capitalize">{selectedPratica.priorita}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Creata il</span>
                <span>{new Date(selectedPratica.created_at).toLocaleDateString('it-IT')}</span>
              </div>
              {selectedPratica.descrizione && (
                <div>
                  <span className="text-gray-500 text-sm">Descrizione</span>
                  <p className="text-sm text-gray-700 mt-1">{selectedPratica.descrizione}</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Aggiorna stato</label>
              <select
                value={nuovoStato}
                onChange={e => setNuovoStato(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {Object.entries(statoColors).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => updateStato(selectedPratica.id, nuovoStato)}
                  disabled={nuovoStato === selectedPratica.stato}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Salva modifiche
                </button>
                <button
                  onClick={() => setSelectedPratica(null)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AppuntamentiTab() {
  const [appuntamenti, setAppuntamenti] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAppuntamenti(); }, []);

  const loadAppuntamenti = async () => {
    const { data } = await supabase.from('appuntamenti').select('*').order('data_ora', { ascending: true }).limit(30);
    if (data) setAppuntamenti(data);
    setLoading(false);
  };

  const updateStato = async (id: string, stato: string) => {
    await supabase.from('appuntamenti').update({ stato }).eq('id', id);
    loadAppuntamenti();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900 text-sm">Gestione Appuntamenti</h2>
      </div>
      {loading ? (
        <div className="p-8 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" /></div>
      ) : appuntamenti.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Data/Ora</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Note</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Stato</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {appuntamenti.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{new Date(a.data_ora).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-3">{a.nome} {a.cognome}</td>
                  <td className="px-4 py-3 text-gray-500">{a.email}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">{a.note || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${a.stato === 'confermato' ? 'bg-green-100 text-green-700' : a.stato === 'completato' ? 'bg-gray-100 text-gray-600' : a.stato === 'annullato' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                      {a.stato}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {a.stato === 'prenotato' && (
                        <button onClick={() => updateStato(a.id, 'confermato')} className="px-2 py-1 bg-green-50 text-green-700 rounded text-[10px] font-medium hover:bg-green-100">Conferma</button>
                      )}
                      {['prenotato', 'confermato'].includes(a.stato) && (
                        <button onClick={() => updateStato(a.id, 'completato')} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-medium hover:bg-blue-100">Completato</button>
                      )}
                      {['prenotato', 'confermato'].includes(a.stato) && (
                        <button onClick={() => updateStato(a.id, 'annullato')} className="px-2 py-1 bg-red-50 text-red-700 rounded text-[10px] font-medium hover:bg-red-100">Annulla</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-400 text-sm">Nessun appuntamento</div>
      )}
    </div>
  );
}

function ContattiTab() {
  const [contatti, setContatti] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [risposta, setRisposta] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => { loadContatti(); }, []);

  const loadContatti = async () => {
    const { data } = await supabase.from('contatti').select('*').order('created_at', { ascending: false }).limit(30);
    if (data) setContatti(data);
    setLoading(false);
  };

  const rispondi = async (id: string) => {
    await supabase.from('contatti').update({ stato: 'risolto', risposta }).eq('id', id);
    setSelectedId(null);
    setRisposta('');
    loadContatti();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900 text-sm">Gestione Contatti e Richieste</h2>
      </div>
      {loading ? (
        <div className="p-8 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" /></div>
      ) : (
        <div className="divide-y divide-gray-100">
          {contatti.map(c => (
            <div key={c.id} className={`p-4 ${c.stato === 'nuovo' ? 'bg-orange-50/30' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">{c.nome} {c.cognome}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${c.stato === 'nuovo' ? 'bg-orange-100 text-orange-700' : c.stato === 'risolto' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {c.stato}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{c.email} · {new Date(c.created_at).toLocaleDateString('it-IT')}</div>
                  <p className="text-sm text-gray-700 mt-2">{c.messaggio}</p>
                  {c.risposta && <p className="text-sm text-green-700 mt-2 bg-green-50 p-2 rounded-lg">Risposta: {c.risposta}</p>}
                </div>
                {c.stato === 'nuovo' && (
                  <button onClick={() => setSelectedId(selectedId === c.id ? null : c.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors shrink-0">
                    Rispondi
                  </button>
                )}
              </div>
              {selectedId === c.id && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={risposta}
                    onChange={e => setRisposta(e.target.value)}
                    placeholder="Scrivi risposta..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={() => rispondi(c.id)} disabled={!risposta.trim()} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                    Invia
                  </button>
                </div>
              )}
            </div>
          ))}
          {contatti.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">Nessun contatto</div>
          )}
        </div>
      )}
    </div>
  );
}

function PartnerTab() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPartners(); }, []);

  const loadPartners = async () => {
    const { data } = await supabase.from('partner_richieste').select('*').order('created_at', { ascending: false }).limit(30);
    if (data) setPartners(data);
    setLoading(false);
  };

  const updateStato = async (id: string, stato: string) => {
    await supabase.from('partner_richieste').update({ stato }).eq('id', id);
    loadPartners();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900 text-sm">Gestione Richieste Partner</h2>
      </div>
      {loading ? (
        <div className="p-8 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" /></div>
      ) : partners.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Città</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Stato</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Data</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {partners.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.nome} {p.cognome}</td>
                  <td className="px-4 py-3 text-gray-600">{p.citta}</td>
                  <td className="px-4 py-3 text-gray-500">{p.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      p.stato === 'richiesta' ? 'bg-yellow-100 text-yellow-700' :
                      p.stato === 'approvato' || p.stato === 'attivo' ? 'bg-green-100 text-green-700' :
                      p.stato === 'rifiutato' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>{p.stato}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString('it-IT')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {p.stato === 'richiesta' && (
                        <>
                          <button onClick={() => updateStato(p.id, 'approvato')} className="px-2 py-1 bg-green-50 text-green-700 rounded text-[10px] font-medium hover:bg-green-100">Approva</button>
                          <button onClick={() => updateStato(p.id, 'rifiutato')} className="px-2 py-1 bg-red-50 text-red-700 rounded text-[10px] font-medium hover:bg-red-100">Rifiuta</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-400 text-sm">Nessuna richiesta partner</div>
      )}
    </div>
  );
}
