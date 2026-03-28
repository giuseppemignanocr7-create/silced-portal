import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, Upload, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Pratica {
  id: string;
  codice: string;
  titolo: string;
  stato: string;
  priorita: string;
  descrizione?: string;
  esito?: string;
  note_interne?: string;
  created_at: string;
  updated_at: string;
  completata_at?: string;
}

interface TimelineItem {
  id: string;
  stato: string;
  titolo: string;
  descrizione?: string;
  created_at: string;
}

const statoColors: Record<string, { bg: string; text: string; label: string; icon: typeof CheckCircle }> = {
  ricevuta: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Ricevuta', icon: FileText },
  verifica_documenti: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Verifica documenti', icon: FileText },
  in_lavorazione: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'In lavorazione', icon: Clock },
  attesa_ente: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Attesa ente', icon: Clock },
  attesa_documenti: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Attesa documenti', icon: AlertTriangle },
  completata: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completata', icon: CheckCircle },
  rifiutata: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rifiutata', icon: AlertTriangle },
  annullata: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Annullata', icon: FileText },
};

export default function DettaglioPratica() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [pratica, setPratica] = useState<Pratica | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  useEffect(() => { if (id) loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    const [pRes, tRes] = await Promise.all([
      supabase.from('pratiche').select('*').eq('id', id).single(),
      supabase.from('pratiche_timeline').select('*').eq('pratica_id', id).order('created_at', { ascending: true }),
    ]);
    if (pRes.data) setPratica(pRes.data);
    if (tRes.data) setTimeline(tRes.data);
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile || !id) return;
    setUploading(true);
    setUploadSuccess('');
    const path = `${profile.id}/${id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('documenti-pratiche').upload(path, file);
    if (!error) {
      await supabase.from('documenti').insert({
        pratica_id: id,
        utente_id: profile.id,
        nome_file: file.name,
        tipo: file.type,
        dimensione: file.size,
        storage_path: path,
      });
      setUploadSuccess(file.name);
    }
    setUploading(false);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!pratica) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Pratica non trovata</p>
          <Link to="/area-cliente/pratiche" className="text-blue-600 text-sm mt-2 inline-block">Torna alle pratiche</Link>
        </div>
      </div>
    );
  }

  const s = statoColors[pratica.stato] || statoColors.ricevuta;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Link to="/area-cliente/pratiche" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <div className="font-semibold text-gray-900 text-sm">{pratica.codice}</div>
              <div className="text-xs text-gray-500">{pratica.titolo}</div>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>{s.label}</span>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{pratica.titolo}</h2>
              <p className="text-sm text-gray-500 mb-4">Codice: {pratica.codice} · Aperta il {formatDate(pratica.created_at)}</p>
              {pratica.descrizione && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="text-xs font-medium text-gray-500 mb-1">Descrizione</div>
                  <p className="text-sm text-gray-700">{pratica.descrizione}</p>
                </div>
              )}
              {pratica.esito && (
                <div className="bg-green-50 rounded-xl p-4 mb-4">
                  <div className="text-xs font-medium text-green-600 mb-1">Esito</div>
                  <p className="text-sm text-green-800">{pratica.esito}</p>
                </div>
              )}
              {pratica.stato === 'attesa_documenti' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-amber-700 font-medium text-sm mb-2">
                    <AlertTriangle className="w-4 h-4" /> Documenti richiesti
                  </div>
                  <p className="text-sm text-amber-600">L'operatore ha richiesto documenti aggiuntivi. Caricali qui sotto per procedere.</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" /> Cronologia
              </h3>
              {timeline.length > 0 ? (
                <div className="space-y-0">
                  {timeline.map((t, i) => {
                    const ts = statoColors[t.stato] || statoColors.ricevuta;
                    const Icon = ts.icon;
                    return (
                      <div key={t.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ts.bg}`}>
                            <Icon className={`w-4 h-4 ${ts.text}`} />
                          </div>
                          {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
                        </div>
                        <div className="pb-4">
                          <div className="font-medium text-sm text-gray-900">{t.titolo}</div>
                          {t.descrizione && <div className="text-xs text-gray-500">{t.descrizione}</div>}
                          <div className="text-xs text-gray-400 mt-0.5">{formatDate(t.created_at)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Nessun aggiornamento ancora</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upload */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" /> Carica documenti
              </h3>
              <p className="text-xs text-gray-500 mb-3">PDF, immagini o documenti Word (max 10 MB)</p>
              <label className={`flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <Upload className="w-4 h-4 text-gray-400" />}
                <span className="text-sm text-gray-600">{uploading ? 'Caricamento...' : 'Scegli file'}</span>
                <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
              </label>
              {uploadSuccess && (
                <div className="mt-2 flex items-center gap-2 text-green-600 text-xs">
                  <CheckCircle className="w-3 h-3" /> {uploadSuccess} caricato
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Dettagli</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Stato</span><span className={`font-medium ${s.text}`}>{s.label}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Priorità</span><span className="font-medium text-gray-900 capitalize">{pratica.priorita}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Aperta il</span><span className="text-gray-700">{new Date(pratica.created_at).toLocaleDateString('it-IT')}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Ultimo agg.</span><span className="text-gray-700">{new Date(pratica.updated_at).toLocaleDateString('it-IT')}</span></div>
                {pratica.completata_at && <div className="flex justify-between"><span className="text-gray-500">Completata</span><span className="text-green-600">{new Date(pratica.completata_at).toLocaleDateString('it-IT')}</span></div>}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Link to="/area-cliente/pratiche" className="block w-full text-center py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Torna alle pratiche
              </Link>
              <Link to="/area-cliente/nuova-pratica" className="block w-full text-center py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                Apri nuova pratica
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
