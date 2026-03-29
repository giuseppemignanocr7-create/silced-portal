import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Users, Calendar, Bell, MessageSquare, TrendingUp,
  AlertTriangle, ArrowRight, LogOut, Handshake, BarChart3, Eye,
  Search, RefreshCw, ChevronRight, Clock, CheckCircle2, XCircle,
  Mail, Phone, MapPin, Filter, X, Home, Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

/* ─── Types ─── */
interface Stats {
  pratiche_attive: number;
  pratiche_oggi: number;
  contatti_nuovi: number;
  appuntamenti_prossimi: number;
  partner_pendenti: number;
  totale_associati: number;
}

const statoColors: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  ricevuta:            { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500',   label: 'Ricevuta' },
  verifica_documenti:  { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500', label: 'Verifica documenti' },
  in_lavorazione:      { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500', label: 'In lavorazione' },
  attesa_ente:         { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Attesa ente' },
  attesa_documenti:    { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500',  label: 'Attesa documenti' },
  completata:          { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500',  label: 'Completata' },
  rifiutata:           { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500',    label: 'Rifiutata' },
  annullata:           { bg: 'bg-gray-50',   text: 'text-gray-500',   dot: 'bg-gray-400',   label: 'Annullata' },
};

const prioritaConfig: Record<string, { color: string; label: string }> = {
  urgente:  { color: 'bg-red-500',    label: 'Urgente' },
  alta:     { color: 'bg-orange-500', label: 'Alta' },
  normale:  { color: 'bg-blue-500',   label: 'Normale' },
  bassa:    { color: 'bg-gray-400',   label: 'Bassa' },
};

const appStatoConfig: Record<string, { bg: string; text: string; label: string }> = {
  prenotato:   { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Prenotato' },
  confermato:  { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Confermato' },
  completato:  { bg: 'bg-gray-100',  text: 'text-gray-600',   label: 'Completato' },
  annullato:   { bg: 'bg-red-50',    text: 'text-red-600',    label: 'Annullato' },
  no_show:     { bg: 'bg-red-50',    text: 'text-red-600',    label: 'No Show' },
};

type TabKey = 'overview' | 'pratiche' | 'appuntamenti' | 'contatti' | 'partner';

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'overview',     label: 'Dashboard',    icon: BarChart3 },
  { key: 'pratiche',     label: 'Pratiche',      icon: FileText },
  { key: 'appuntamenti', label: 'Appuntamenti',  icon: Calendar },
  { key: 'contatti',     label: 'Contatti',      icon: MessageSquare },
  { key: 'partner',      label: 'Partner',       icon: Handshake },
];

/* ─── Utilities ─── */
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Ora';
  if (min < 60) return `${min}m fa`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h fa`;
  const days = Math.floor(hours / 24);
  return `${days}g fa`;
}

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}>{children}</span>;
}

function StatCard({ label, value, icon: Icon, color, bg, onClick }: { label: string; value: number; icon: React.ElementType; color: string; bg: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="bg-white rounded-2xl border border-gray-100 p-5 text-left hover:shadow-md hover:border-gray-200 transition-all group w-full">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {onClick && <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-0.5">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </button>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 text-center max-w-sm">{description}</p>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600" />
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function DashboardAdmin() {
  const { profile, signOut, unreadCount } = useAuth();
  const [stats, setStats] = useState<Stats>({ pratiche_attive: 0, pratiche_oggi: 0, contatti_nuovi: 0, appuntamenti_prossimi: 0, partner_pendenti: 0, totale_associati: 0 });
  const [praticheRecenti, setPraticheRecenti] = useState<any[]>([]);
  const [contattiRecenti, setContattiRecenti] = useState<any[]>([]);
  const [appuntamentiRecenti, setAppuntamentiRecenti] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadDashboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    const [praticheRes, contattiRes, appRes, praticheCountRes, contattiCountRes, appCountRes, partnerCountRes, associatiCountRes] = await Promise.all([
      supabase.from('pratiche').select('id, codice, titolo, stato, priorita, created_at, descrizione').order('created_at', { ascending: false }).limit(10),
      supabase.from('contatti').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('appuntamenti').select('*').order('data_ora', { ascending: true }).limit(10),
      supabase.from('pratiche').select('id', { count: 'exact', head: true }).not('stato', 'in', '("completata","annullata","rifiutata")'),
      supabase.from('contatti').select('id', { count: 'exact', head: true }).eq('stato', 'nuovo'),
      supabase.from('appuntamenti').select('id', { count: 'exact', head: true }).gte('data_ora', new Date().toISOString()).in('stato', ['prenotato', 'confermato']),
      supabase.from('partner_richieste').select('id', { count: 'exact', head: true }).eq('stato', 'richiesta'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('associato', true),
    ]);

    if (praticheRes.data) setPraticheRecenti(praticheRes.data);
    if (contattiRes.data) setContattiRecenti(contattiRes.data);
    if (appRes.data) setAppuntamentiRecenti(appRes.data);

    const newStats: Stats = {
      pratiche_attive: praticheCountRes.count || 0,
      pratiche_oggi: praticheRes.data?.filter(p => new Date(p.created_at).toDateString() === new Date().toDateString()).length || 0,
      contatti_nuovi: contattiCountRes.count || 0,
      appuntamenti_prossimi: appCountRes.count || 0,
      partner_pendenti: partnerCountRes.count || 0,
      totale_associati: associatiCountRes.count || 0,
    };
    setStats(newStats);

    const a: string[] = [];
    const urgenti = praticheRes.data?.filter(p => p.priorita === 'urgente' && !['completata', 'annullata', 'rifiutata'].includes(p.stato)) || [];
    if (urgenti.length > 0) a.push(`${urgenti.length} pratica/e URGENTE da gestire`);
    if (newStats.contatti_nuovi > 3) a.push(`${newStats.contatti_nuovi} contatti in attesa di risposta`);
    if (newStats.partner_pendenti > 0) a.push(`${newStats.partner_pendenti} richiesta/e partner da valutare`);
    setAlerts(a);

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(() => loadDashboard(true), 30000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 animate-pulse">S</div>
          <p className="text-gray-500 text-sm">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ─── Sidebar Desktop ─── */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-30">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-100">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">S</div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">SILCED</div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Area Patronato</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-[18px] h-[18px]" />
              <span>{tab.label}</span>
              {tab.key === 'contatti' && stats.contatti_nuovi > 0 && (
                <span className={`ml-auto w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
                }`}>{stats.contatti_nuovi}</span>
              )}
              {tab.key === 'partner' && stats.partner_pendenti > 0 && (
                <span className={`ml-auto w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-600'
                }`}>{stats.partner_pendenti}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-3 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all">
            <Home className="w-[18px] h-[18px]" />
            <span>Vai al sito</span>
          </Link>
          <Link to="/area-cliente/profilo" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all">
            <Settings className="w-[18px] h-[18px]" />
            <span>Impostazioni</span>
          </Link>
        </div>

        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0">
              {profile?.nome?.[0]}{profile?.cognome?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">{profile?.nome} {profile?.cognome}</div>
              <div className="text-xs text-gray-400 truncate">{profile?.ruolo === 'admin' ? 'Amministratore' : 'Operatore'}</div>
            </div>
            <button onClick={signOut} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Esci">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Sidebar Overlay ─── */}
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
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
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
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{tabs.find(t => t.key === activeTab)?.label}</h1>
                <p className="text-xs text-gray-400 hidden sm:block">{new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadDashboard(true)}
                disabled={refreshing}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                title="Aggiorna"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                <Bell className="w-4 h-4" />
                {(unreadCount > 0 || alerts.length > 0) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8 max-w-7xl">
          {/* Alerts */}
          {alerts.length > 0 && activeTab === 'overview' && (
            <div className="mb-6 space-y-2">
              {alerts.map((alert, i) => (
                <div key={i} className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="text-sm text-red-700 font-medium flex-1">{alert}</span>
                  <ArrowRight className="w-4 h-4 text-red-300" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'overview' && (
            <OverviewTab
              stats={stats}
              pratiche={praticheRecenti}
              contatti={contattiRecenti}
              appuntamenti={appuntamentiRecenti}
              onTabChange={setActiveTab}
            />
          )}
          {activeTab === 'pratiche' && <PraticheTab />}
          {activeTab === 'appuntamenti' && <AppuntamentiTab />}
          {activeTab === 'contatti' && <ContattiTab />}
          {activeTab === 'partner' && <PartnerTab />}
        </main>
      </div>
    </div>
  );
}

/* ─── OVERVIEW TAB ─── */
function OverviewTab({ stats, pratiche, contatti, appuntamenti, onTabChange }: {
  stats: Stats; pratiche: any[]; contatti: any[]; appuntamenti: any[];
  onTabChange: (t: TabKey) => void;
}) {
  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Pratiche attive" value={stats.pratiche_attive} icon={FileText} color="text-blue-600" bg="bg-blue-50" onClick={() => onTabChange('pratiche')} />
        <StatCard label="Nuove oggi" value={stats.pratiche_oggi} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Contatti nuovi" value={stats.contatti_nuovi} icon={MessageSquare} color="text-orange-600" bg="bg-orange-50" onClick={() => onTabChange('contatti')} />
        <StatCard label="Appuntamenti" value={stats.appuntamenti_prossimi} icon={Calendar} color="text-indigo-600" bg="bg-indigo-50" onClick={() => onTabChange('appuntamenti')} />
        <StatCard label="Partner pendenti" value={stats.partner_pendenti} icon={Handshake} color="text-purple-600" bg="bg-purple-50" onClick={() => onTabChange('partner')} />
        <StatCard label="Associati" value={stats.totale_associati} icon={Users} color="text-teal-600" bg="bg-teal-50" />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Pratiche recenti — 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Ultime pratiche
            </h2>
            <button onClick={() => onTabChange('pratiche')} className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
              Vedi tutte <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {pratiche.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {pratiche.slice(0, 6).map(p => {
                const s = statoColors[p.stato] || statoColors.ricevuta;
                const pr = prioritaConfig[p.priorita] || prioritaConfig.normale;
                return (
                  <div key={p.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/50 transition-colors">
                    <div className={`w-1.5 h-10 rounded-full ${pr.color} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">{p.titolo}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{p.codice} · {timeAgo(p.created_at)}</div>
                    </div>
                    <Badge className={`${s.bg} ${s.text} shrink-0`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={FileText} title="Nessuna pratica" description="Le pratiche appariranno qui quando verranno create dai clienti." />
          )}
        </div>

        {/* Sidebar — 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appuntamenti */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" /> Prossimi appuntamenti
              </h3>
              <button onClick={() => onTabChange('appuntamenti')} className="text-xs text-blue-600 font-semibold">Tutti</button>
            </div>
            {appuntamenti.filter(a => ['prenotato', 'confermato'].includes(a.stato)).length > 0 ? (
              <div className="divide-y divide-gray-50">
                {appuntamenti.filter(a => ['prenotato', 'confermato'].includes(a.stato)).slice(0, 4).map(a => (
                  <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-11 h-11 bg-indigo-50 rounded-xl flex flex-col items-center justify-center shrink-0">
                      <div className="text-sm font-bold text-indigo-700 leading-none">{new Date(a.data_ora).getDate()}</div>
                      <div className="text-[9px] text-indigo-500 uppercase font-semibold">{new Date(a.data_ora).toLocaleDateString('it-IT', { month: 'short' })}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{a.nome} {a.cognome}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(a.data_ora).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${a.stato === 'confermato' ? 'bg-green-500' : 'bg-yellow-400'}`} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-xs">Nessun appuntamento in programma</div>
            )}
          </div>

          {/* Contatti recenti */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-orange-500" /> Contatti recenti
                {contatti.filter(c => c.stato === 'nuovo').length > 0 && (
                  <span className="w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {contatti.filter(c => c.stato === 'nuovo').length}
                  </span>
                )}
              </h3>
              <button onClick={() => onTabChange('contatti')} className="text-xs text-blue-600 font-semibold">Tutti</button>
            </div>
            {contatti.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {contatti.slice(0, 4).map(c => (
                  <div key={c.id} className={`px-5 py-3 ${c.stato === 'nuovo' ? 'bg-orange-50/30' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900">{c.nome} {c.cognome}</span>
                      <span className="text-[10px] text-gray-400">{timeAgo(c.created_at)}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">{c.messaggio}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-xs">Nessun contatto</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── PRATICHE TAB ─── */
function PraticheTab() {
  const [pratiche, setPratiche] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStato, setFiltroStato] = useState('');
  const [search, setSearch] = useState('');
  const [selectedPratica, setSelectedPratica] = useState<any>(null);
  const [nuovoStato, setNuovoStato] = useState('');
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    await supabase.from('pratiche').update({ stato }).eq('id', id);
    await loadPratiche();
    setSelectedPratica(null);
    setSaving(false);
  };

  const filtered = search
    ? pratiche.filter(p => p.codice?.toLowerCase().includes(search.toLowerCase()) || p.titolo?.toLowerCase().includes(search.toLowerCase()))
    : pratiche;

  const allStati = ['', 'ricevuta', 'verifica_documenti', 'in_lavorazione', 'attesa_ente', 'attesa_documenti', 'completata', 'rifiutata', 'annullata'];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca per codice o titolo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          {allStati.map(s => (
            <button
              key={s}
              onClick={() => setFiltroStato(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filtroStato === s
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s ? (statoColors[s]?.label || s) : 'Tutte'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? <Spinner /> : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Codice</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pratica</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stato</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priorità</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Azione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const s = statoColors[p.stato] || statoColors.ricevuta;
                  const pr = prioritaConfig[p.priorita] || prioritaConfig.normale;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-blue-600 font-semibold">{p.codice}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 text-sm">{p.titolo}</div>
                        {p.descrizione && <div className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{p.descrizione}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`${s.bg} ${s.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${pr.color}`} />
                          <span className="text-xs text-gray-600 font-medium">{pr.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString('it-IT')}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setSelectedPratica(p); setNuovoStato(p.stato); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                          <Eye className="w-3.5 h-3.5" /> Gestisci
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={FileText} title="Nessuna pratica trovata" description="Prova a cambiare i filtri di ricerca." />
        )}
      </div>

      {/* Modal */}
      {selectedPratica && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedPratica(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedPratica.titolo}</h3>
                  <p className="text-sm text-gray-400 font-mono mt-0.5">{selectedPratica.codice}</p>
                </div>
                <button onClick={() => setSelectedPratica(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-1">Stato attuale</div>
                  <Badge className={`${statoColors[selectedPratica.stato]?.bg} ${statoColors[selectedPratica.stato]?.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statoColors[selectedPratica.stato]?.dot}`} />
                    {statoColors[selectedPratica.stato]?.label}
                  </Badge>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-1">Priorità</div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${prioritaConfig[selectedPratica.priorita]?.color}`} />
                    <span className="text-sm font-semibold text-gray-900 capitalize">{selectedPratica.priorita}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-1">Data creazione</div>
                <div className="text-sm font-semibold text-gray-900">{new Date(selectedPratica.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </div>

              {selectedPratica.descrizione && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-1">Descrizione</div>
                  <p className="text-sm text-gray-700">{selectedPratica.descrizione}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-5 bg-gray-50 border-t border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Aggiorna stato</label>
              <select
                value={nuovoStato}
                onChange={e => setNuovoStato(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              >
                {Object.entries(statoColors).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  onClick={() => updateStato(selectedPratica.id, nuovoStato)}
                  disabled={nuovoStato === selectedPratica.stato || saving}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Salva modifiche
                </button>
                <button onClick={() => setSelectedPratica(null)} className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors">
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

/* ─── APPUNTAMENTI TAB ─── */
function AppuntamentiTab() {
  const [appuntamenti, setAppuntamenti] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'futuri' | 'tutti' | 'passati'>('futuri');

  useEffect(() => { loadAppuntamenti(); }, [filtro]);

  const loadAppuntamenti = async () => {
    setLoading(true);
    let query = supabase.from('appuntamenti').select('*').order('data_ora', { ascending: filtro !== 'passati' }).limit(50);
    if (filtro === 'futuri') query = query.gte('data_ora', new Date().toISOString());
    if (filtro === 'passati') query = query.lt('data_ora', new Date().toISOString());
    const { data } = await query;
    if (data) setAppuntamenti(data);
    setLoading(false);
  };

  const updateStato = async (id: string, stato: string) => {
    await supabase.from('appuntamenti').update({ stato }).eq('id', id);
    loadAppuntamenti();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {(['futuri', 'tutti', 'passati'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filtro === f ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f === 'futuri' ? 'Prossimi' : f === 'tutti' ? 'Tutti' : 'Passati'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? <Spinner /> : appuntamenti.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {appuntamenti.map(a => {
              const sc = appStatoConfig[a.stato] || appStatoConfig.prenotato;
              const dt = new Date(a.data_ora);
              return (
                <div key={a.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="w-14 h-14 bg-indigo-50 rounded-xl flex flex-col items-center justify-center shrink-0">
                    <div className="text-lg font-bold text-indigo-700 leading-none">{dt.getDate()}</div>
                    <div className="text-[10px] text-indigo-500 uppercase font-bold">{dt.toLocaleDateString('it-IT', { month: 'short' })}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">{a.nome} {a.cognome}</div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{dt.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{a.email}</span>
                      {a.telefono && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{a.telefono}</span>}
                    </div>
                    {a.note && <p className="text-xs text-gray-400 mt-1 truncate max-w-md">{a.note}</p>}
                  </div>
                  <Badge className={`${sc.bg} ${sc.text} shrink-0`}>{sc.label}</Badge>
                  <div className="flex items-center gap-1 shrink-0">
                    {a.stato === 'prenotato' && (
                      <button onClick={() => updateStato(a.id, 'confermato')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Conferma">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {['prenotato', 'confermato'].includes(a.stato) && (
                      <button onClick={() => updateStato(a.id, 'annullato')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Annulla">
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={Calendar} title="Nessun appuntamento" description={filtro === 'futuri' ? 'Non ci sono appuntamenti futuri in programma.' : 'Nessun appuntamento trovato.'} />
        )}
      </div>
    </div>
  );
}

/* ─── CONTATTI TAB ─── */
function ContattiTab() {
  const [contatti, setContatti] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [risposta, setRisposta] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'tutti' | 'nuovo' | 'risolto'>('tutti');

  useEffect(() => { loadContatti(); }, [filtro]);

  const loadContatti = async () => {
    setLoading(true);
    let query = supabase.from('contatti').select('*').order('created_at', { ascending: false }).limit(50);
    if (filtro !== 'tutti') query = query.eq('stato', filtro);
    const { data } = await query;
    if (data) setContatti(data);
    setLoading(false);
  };

  const rispondi = async (id: string) => {
    await supabase.from('contatti').update({ stato: 'risolto', risposta }).eq('id', id);
    setSelectedId(null);
    setRisposta('');
    loadContatti();
  };

  const archivia = async (id: string) => {
    await supabase.from('contatti').update({ stato: 'archiviato' }).eq('id', id);
    loadContatti();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {(['tutti', 'nuovo', 'risolto'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filtro === f ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f === 'tutti' ? 'Tutti' : f === 'nuovo' ? 'Da gestire' : 'Risolti'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? <Spinner /> : contatti.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {contatti.map(c => (
              <div key={c.id} className={`px-6 py-5 ${c.stato === 'nuovo' ? 'border-l-4 border-l-orange-400' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-gray-900">{c.nome} {c.cognome}</h4>
                      <Badge className={`${c.stato === 'nuovo' ? 'bg-orange-50 text-orange-700' : c.stato === 'risolto' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.stato === 'nuovo' ? 'Da gestire' : c.stato === 'risolto' ? 'Risolto' : c.stato}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                      {c.telefono && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.telefono}</span>}
                      {c.servizio && <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{c.servizio}</span>}
                      <span>{new Date(c.created_at).toLocaleDateString('it-IT')}</span>
                    </div>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{c.messaggio}</p>
                    {c.risposta && (
                      <div className="mt-3 bg-green-50 rounded-xl p-3 text-sm text-green-800 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{c.risposta}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.stato === 'nuovo' && (
                      <>
                        <button
                          onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Rispondi
                        </button>
                        <button onClick={() => archivia(c.id)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Archivia">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {selectedId === c.id && (
                  <div className="mt-4 flex gap-2">
                    <textarea
                      value={risposta}
                      onChange={e => setRisposta(e.target.value)}
                      placeholder="Scrivi la risposta..."
                      rows={2}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <button onClick={() => rispondi(c.id)} disabled={!risposta.trim()} className="px-5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 self-end h-[44px]">
                      Invia
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={MessageSquare} title="Nessun contatto" description={filtro === 'nuovo' ? 'Non ci sono contatti da gestire.' : 'Nessun contatto trovato.'} />
        )}
      </div>
    </div>
  );
}

/* ─── PARTNER TAB ─── */
function PartnerTab() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { loadPartners(); }, []);

  const loadPartners = async () => {
    setLoading(true);
    const { data } = await supabase.from('partner_richieste').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setPartners(data);
    setLoading(false);
  };

  const updateStato = async (id: string, stato: string) => {
    await supabase.from('partner_richieste').update({ stato }).eq('id', id);
    loadPartners();
  };

  const partnerStatoConfig: Record<string, { bg: string; text: string; label: string }> = {
    richiesta:    { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'In attesa' },
    valutazione:  { bg: 'bg-blue-50',   text: 'text-blue-700',   label: 'In valutazione' },
    approvato:    { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Approvato' },
    attivo:       { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Attivo' },
    sospeso:      { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Sospeso' },
    rifiutato:    { bg: 'bg-red-50',    text: 'text-red-700',    label: 'Rifiutato' },
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? <Spinner /> : partners.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {partners.map(p => {
              const sc = partnerStatoConfig[p.stato] || partnerStatoConfig.richiesta;
              return (
                <div key={p.id} className={`px-6 py-5 hover:bg-gray-50/50 transition-colors ${p.stato === 'richiesta' ? 'border-l-4 border-l-yellow-400' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-gray-900 text-base">{p.nome} {p.cognome}</h4>
                        <Badge className={`${sc.bg} ${sc.text}`}>{sc.label}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.citta}{p.provincia ? ` (${p.provincia})` : ''}</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{p.email}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.telefono}</span>
                        <span>{new Date(p.created_at).toLocaleDateString('it-IT')}</span>
                      </div>
                      {p.messaggio && <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 mt-2">{p.messaggio}</p>}
                      {p.esperienza && <p className="text-xs text-gray-500 mt-2"><span className="font-semibold">Esperienza:</span> {p.esperienza}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {p.stato === 'richiesta' && (
                        <>
                          <button onClick={() => updateStato(p.id, 'approvato')} className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approva
                          </button>
                          <button onClick={() => updateStato(p.id, 'rifiutato')} className="px-3 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" /> Rifiuta
                          </button>
                        </>
                      )}
                      {p.stato === 'approvato' && (
                        <button onClick={() => updateStato(p.id, 'attivo')} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
                          Attiva
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={Handshake} title="Nessuna richiesta partner" description="Le richieste di partnership appariranno qui quando verranno inviate." />
        )}
      </div>
    </div>
  );
}
