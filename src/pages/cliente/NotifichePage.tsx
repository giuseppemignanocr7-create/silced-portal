import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Notifica {
  id: string;
  titolo: string;
  messaggio: string;
  tipo: string;
  letta: boolean;
  created_at: string;
  link?: string;
}

const tipoIcon: Record<string, string> = {
  pratica: 'bg-blue-100 text-blue-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-amber-100 text-amber-600',
  info: 'bg-indigo-100 text-indigo-600',
};

export default function NotifichePage() {
  const { profile } = useAuth();
  const [notifiche, setNotifiche] = useState<Notifica[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifiche(); }, []);

  const loadNotifiche = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('notifiche')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setNotifiche(data);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifiche').update({ letta: true }).eq('id', id);
    setNotifiche(prev => prev.map(n => n.id === id ? { ...n, letta: true } : n));
  };

  const markAllRead = async () => {
    if (!profile) return;
    await supabase.rpc('mark_all_notifications_read', { p_user_id: profile.id });
    setNotifiche(prev => prev.map(n => ({ ...n, letta: true })));
  };

  const unreadCount = notifiche.filter(n => !n.letta).length;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Link to="/area-cliente" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <span className="font-semibold text-gray-900">Notifiche</span>
            {unreadCount > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
              <CheckCheck className="w-4 h-4" /> Segna tutte lette
            </button>
          )}
        </div>
      </div>

      <div className="container py-6 max-w-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : notifiche.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            {notifiche.map(n => {
              const cls = tipoIcon[n.tipo] || tipoIcon.info;
              return (
                <div
                  key={n.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${!n.letta ? 'bg-blue-50/40' : ''}`}
                  onClick={() => { if (!n.letta) markAsRead(n.id); }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${cls}`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900">{n.titolo}</span>
                        {!n.letta && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{n.messaggio}</p>
                      <div className="text-xs text-gray-400 mt-1">{formatDate(n.created_at)}</div>
                      {n.link && (
                        <Link to={n.link} className="text-xs text-blue-600 font-medium hover:text-blue-800 mt-1 inline-block">
                          Vedi dettagli →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nessuna notifica</p>
            <p className="text-gray-400 text-sm mt-1">Qui appariranno gli aggiornamenti sulle tue pratiche e appuntamenti</p>
          </div>
        )}
      </div>
    </div>
  );
}
