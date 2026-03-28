import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Search, Filter, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Pratica {
  id: string;
  codice: string;
  titolo: string;
  stato: string;
  priorita: string;
  created_at: string;
  descrizione?: string;
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

export default function PratichePage() {
  useAuth();
  const [pratiche, setPratiche] = useState<Pratica[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStato, setFilterStato] = useState('');

  useEffect(() => { loadPratiche(); }, []);

  const loadPratiche = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('pratiche')
      .select('id, codice, titolo, stato, priorita, created_at, descrizione')
      .order('created_at', { ascending: false });
    if (data) setPratiche(data);
    setLoading(false);
  };

  const filtered = pratiche.filter(p => {
    const matchSearch = !search || p.titolo.toLowerCase().includes(search.toLowerCase()) || p.codice.toLowerCase().includes(search.toLowerCase());
    const matchStato = !filterStato || p.stato === filterStato;
    return matchSearch && matchStato;
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Link to="/area-cliente" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <span className="font-semibold text-gray-900">Le mie pratiche</span>
          </div>
          <Link to="/area-cliente/nuova-pratica" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Nuova
          </Link>
        </div>
      </div>

      <div className="container py-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca per titolo o codice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterStato}
              onChange={(e) => setFilterStato(e.target.value)}
              className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
            >
              <option value="">Tutti gli stati</option>
              {Object.entries(statoColors).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">{pratiche.length}</div>
            <div className="text-xs text-gray-500">Totale</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{pratiche.filter(p => !['completata', 'annullata', 'rifiutata'].includes(p.stato)).length}</div>
            <div className="text-xs text-gray-500">Attive</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{pratiche.filter(p => p.stato === 'completata').length}</div>
            <div className="text-xs text-gray-500">Completate</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-2xl font-bold text-amber-600">{pratiche.filter(p => p.stato === 'attesa_documenti').length}</div>
            <div className="text-xs text-gray-500">Attesa doc.</div>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            {filtered.map(p => {
              const s = statoColors[p.stato] || statoColors.ricevuta;
              return (
                <Link key={p.id} to={`/area-cliente/pratiche/${p.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 text-sm truncate">{p.titolo}</span>
                      {p.priorita === 'urgente' && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded">URGENTE</span>}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{p.codice} · {formatDate(p.created_at)}</div>
                    {p.descrizione && <div className="text-xs text-gray-400 mt-0.5 truncate max-w-md">{p.descrizione}</div>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>{s.label}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{search || filterStato ? 'Nessun risultato trovato' : 'Nessuna pratica ancora'}</p>
            {!search && !filterStato && (
              <Link to="/area-cliente/nuova-pratica" className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium mt-3 hover:text-blue-800">
                <Plus className="w-3 h-3" /> Apri la tua prima pratica
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
