import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Save, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function ProfiloPage() {
  const { profile, signOut } = useAuth();
  const [form, setForm] = useState({
    nome: profile?.nome || '',
    cognome: profile?.cognome || '',
    telefono: profile?.telefono || '',
    codice_fiscale: profile?.codice_fiscale || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const h = (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    const { error: err } = await supabase
      .from('profiles')
      .update({
        nome: form.nome,
        cognome: form.cognome,
        telefono: form.telefono || null,
        codice_fiscale: form.codice_fiscale || null,
      })
      .eq('id', profile?.id);
    setLoading(false);
    if (err) { setError('Errore nel salvataggio. Riprova.'); } else { setSuccess(true); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Link to="/area-cliente" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <span className="font-semibold text-gray-900">Il mio profilo</span>
          </div>
        </div>
      </div>

      <div className="container py-6 max-w-2xl">
        {/* Avatar + Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{profile?.nome} {profile?.cognome}</div>
              <div className="text-sm text-gray-500">{profile?.email}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${profile?.associato ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {profile?.associato ? 'Associato' : 'Non associato'}
                </span>
                {profile?.numero_tessera && (
                  <span className="text-xs text-gray-400">Tessera: {profile.numero_tessera}</span>
                )}
              </div>
            </div>
          </div>

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Profilo aggiornato con successo!
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input type="text" name="nome" value={form.nome} onChange={h} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
                <input type="text" name="cognome" value={form.cognome} onChange={h} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={profile?.email || ''} disabled className="w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400" />
              <p className="text-xs text-gray-400 mt-1">L'email non può essere modificata da qui</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input type="tel" name="telefono" value={form.telefono} onChange={h} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+39 123 456 7890" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Codice Fiscale</label>
                <input type="text" name="codice_fiscale" value={form.codice_fiscale} onChange={h} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase" placeholder="RSSMRA80A01H501X" maxLength={16} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {loading ? 'Salvataggio...' : 'Salva modifiche'}
              </button>
            </div>
          </form>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <h3 className="font-semibold text-red-700 mb-2">Disconnetti account</h3>
          <p className="text-sm text-gray-600 mb-4">Effettua il logout dal tuo account SILCED.</p>
          <button onClick={signOut} className="px-4 py-2 border border-red-300 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
            Esci dall'account
          </button>
        </div>
      </div>
    </div>
  );
}
