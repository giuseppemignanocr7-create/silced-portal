import { useState } from 'react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import { faqItems } from '../data/services';
import { Link } from 'react-router-dom';

export default function FaqPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [...new Set(faqItems.map(f => f.category))];

  const filtered = faqItems.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory ? faq.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="container max-w-3xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Domande Frequenti</h1>
          <p className="text-lg text-gray-600">Trova risposte alle domande più comuni sui nostri servizi</p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca una domanda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!activeCategory ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Tutte
          </button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((faq) => (
            <div key={faq.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${openId === faq.id ? 'rotate-180' : ''}`} />
              </button>
              {openId === faq.id && (
                <div className="px-5 pb-5 text-gray-600 text-sm border-t border-gray-100 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nessun risultato trovato.</p>
          </div>
        )}

        <div className="mt-12 bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-3">Non trovi la risposta?</h3>
          <p className="text-blue-100 mb-6">Contattaci e ti risponderemo entro 24 ore.</p>
          <Link to="/contatti" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-900 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Contattaci
          </Link>
        </div>
      </div>
    </div>
  );
}
