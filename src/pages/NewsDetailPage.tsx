import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, ArrowRight, Tag, Share2 } from 'lucide-react';
import { newsItems } from '../data/services';

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const article = newsItems.find(n => n.slug === slug);
  const otherNews = newsItems.filter(n => n.slug !== slug).slice(0, 3);

  if (!article) {
    return (
      <div className="min-h-screen py-16">
        <div className="container text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Articolo non trovato</h1>
          <Link to="/news" className="text-blue-600 hover:underline">Torna alle news</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="container max-w-4xl">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to="/news" className="hover:text-blue-600">News</Link>
          <span>/</span>
          <span className="text-gray-900 truncate">{article.title}</span>
        </nav>

        <Link to="/news" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Torna alle news
        </Link>

        <article>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full flex items-center gap-1">
                <Tag className="w-3 h-3" /> {article.category}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" /> {article.date}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
            <p className="text-lg text-gray-600">{article.excerpt}</p>
          </div>

          <div className="h-64 sm:h-80 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl mb-8 flex items-center justify-center">
            <span className="text-white/20 text-6xl font-black">{article.category[0]}</span>
          </div>

          <div className="prose max-w-none text-gray-700 space-y-4 mb-8">
            <p>
              L'argomento trattato in questo articolo riguarda le ultime novità nel settore {article.category.toLowerCase()}.
              Le modifiche normative introdotte nel 2026 hanno un impatto significativo sulla vita dei cittadini e delle famiglie italiane.
            </p>
            <h2 className="text-xl font-bold text-gray-900">Cosa cambia nel dettaglio</h2>
            <p>
              Le principali novità riguardano l'aggiornamento dei parametri di calcolo, le nuove soglie di accesso alle agevolazioni
              e le tempistiche di presentazione delle domande. È fondamentale essere informati per non perdere opportunità importanti.
            </p>
            <h2 className="text-xl font-bold text-gray-900">Come prepararsi</h2>
            <p>
              Il nostro consiglio è di rivolgersi quanto prima ai nostri sportelli SILCED per una consulenza personalizzata.
              I nostri operatori sono aggiornati sulle ultime normative e possono guidarti nella scelta delle migliori opzioni disponibili.
            </p>
            <h2 className="text-xl font-bold text-gray-900">SILCED ti aiuta</h2>
            <p>
              Presso i nostri sportelli puoi ottenere assistenza completa per tutte le pratiche relative a questo argomento.
              Puoi anche utilizzare i nostri strumenti online esclusivi per simulazioni e calcoli preliminari.
            </p>
          </div>

          <div className="flex items-center justify-between py-6 border-t border-b border-gray-200 mb-8">
            <div className="text-sm text-gray-500">
              Pubblicato il {article.date} in <span className="font-medium text-gray-700">{article.category}</span>
            </div>
            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600">
              <Share2 className="w-4 h-4" /> Condividi
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
            <h3 className="font-semibold text-gray-900 mb-2">Hai bisogno di assistenza su questo argomento?</h3>
            <p className="text-sm text-gray-700 mb-4">I nostri esperti sono pronti ad aiutarti. Contattaci per una consulenza gratuita.</p>
            <Link to="/contatti" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors">
              Richiedi consulenza <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </article>

        {otherNews.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Articoli correlati</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherNews.map((news) => (
                <Link key={news.id} to={`/news/${news.slug}`} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                  <div className="h-32 bg-gradient-to-br from-blue-500 to-blue-700" />
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-2">{news.date}</div>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">{news.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
