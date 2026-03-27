import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const phoneNumber = '39800123456';

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="mb-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in">
          <div className="bg-green-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">SILCED Assistenza</div>
                  <div className="text-xs text-green-100">Online ora</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-4 bg-gray-50 min-h-[120px]">
            <div className="bg-white rounded-xl p-3 shadow-sm text-sm text-gray-700 max-w-[85%]">
              Ciao! Come possiamo aiutarti? Scrivici su WhatsApp e ti risponderemo subito.
            </div>
          </div>
          <div className="p-3 border-t border-gray-100">
            <a
              href={`https://wa.me/${phoneNumber}?text=Ciao%2C%20vorrei%20informazioni%20sui%20vostri%20servizi`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors text-sm"
            >
              <Send className="w-4 h-4" />
              Avvia chat WhatsApp
            </a>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all hover:scale-110 flex items-center justify-center"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
