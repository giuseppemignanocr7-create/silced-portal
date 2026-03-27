import { useState, useEffect } from 'react';
import { Shield, X } from 'lucide-react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('silced_cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('silced_cookie_consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('silced_cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-2xl">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">
                Questo sito utilizza cookie tecnici e, previo tuo consenso, cookie di profilazione per migliorare la tua esperienza.
                Consulta la nostra <a href="/privacy" className="text-blue-600 underline">Privacy Policy</a> e la <a href="/cookie" className="text-blue-600 underline">Cookie Policy</a>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={decline}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Rifiuta
            </button>
            <button
              onClick={accept}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Accetta tutti
            </button>
            <button onClick={decline} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
