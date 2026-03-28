import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, FileText, TrendingUp, Users, Bell, CheckCircle, Loader2 } from 'lucide-react';
import { newsItems } from '../data/services';
import { supabase } from '../lib/supabase';

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const categories = [...new Set(newsItems.map(n => n.category))];
  const [nlEmail, setNlEmail] = useState('');
  const [nlSent, setNlSent] = useState(false);
  const [nlLoading, setNlLoading] = useState(false);
  const filteredNews = activeCategory ? newsItems.filter(n => n.category === activeCategory) : newsItems;
  const featuredNews = filteredNews[0];
  const gridNews = filteredNews.slice(1);

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ultime News
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Approfondimenti, guide e novità su fisco, previdenza e lavoro
          </p>
        </div>

        {/* Featured News */}
        {featuredNews && (
          <div className="mb-12">
            <Link to={`/news/${featuredNews.slug}`} className="group block">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                <div className="grid lg:grid-cols-2">
                  <div className="h-64 lg:h-auto bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                    <FileText className="w-20 h-20 text-white/30" />
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                        {featuredNews.category}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {featuredNews.date}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {featuredNews.title}
                    </h2>
                    <p className="text-gray-600 mb-6">
                      {featuredNews.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-blue-600 font-medium">
                      <span>Leggi l'articolo</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setActiveCategory(null)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!activeCategory ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Tutte
          </button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridNews.map((news) => (
            <Link
              key={news.id}
              to={`/news/${news.slug}`}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100"
            >
              <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <FileText className="w-12 h-12 text-white/30" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{news.category}</span>
                  <span>{news.date}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {news.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">{news.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Topics Section */}
        <section className="mt-16 pt-16 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Argomenti popolari
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/news" className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">ISEE</span>
            </Link>
            <Link to="/news" className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">Pensioni</span>
            </Link>
            <Link to="/news" className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">Assegno Unico</span>
            </Link>
            <Link to="/news" className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">Novità 2026</span>
            </Link>
          </div>
        </section>

        {/* Newsletter */}
        <section className="mt-16">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 lg:p-12 text-center text-white">
            {nlSent ? (
              <>
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                <h2 className="text-2xl font-bold mb-3">Iscrizione confermata!</h2>
                <p className="text-blue-100">Riceverai le prossime news nella tua casella email.</p>
              </>
            ) : (
              <>
                <Bell className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                <h2 className="text-2xl font-bold mb-3">Resta aggiornato</h2>
                <p className="text-blue-100 max-w-xl mx-auto mb-6">
                  Iscriviti alla newsletter per ricevere le ultime novità fiscali e previdenziali direttamente nella tua email.
                </p>
                <form onSubmit={async (e) => { e.preventDefault(); setNlLoading(true); await supabase.from('newsletter').insert({ email: nlEmail, stato: 'attiva' }); setNlLoading(false); setNlSent(true); }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    required
                    value={nlEmail}
                    onChange={(e) => setNlEmail(e.target.value)}
                    placeholder="La tua email"
                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    type="submit"
                    disabled={nlLoading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    {nlLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Iscriviti'}
                  </button>
                </form>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
