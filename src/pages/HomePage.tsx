import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Calculator, Briefcase, Users, Building2, Car, FileCheck, Shield, Award, Phone, Globe, Home, TrendingUp, Bot, BarChart3, Sparkles, Handshake } from 'lucide-react';
import { serviceCategories, allServices, courses, newsItems } from '../data/services';

const iconMap: Record<string, React.ElementType> = {
  Calculator, Briefcase, Users, Building2, Car, FileCheck, Globe, Home
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const popularServices = allServices.filter(s => s.popular).slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16 lg:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Servizi CAF e Patronato Online
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-8">
              Risolviamo le tue pratiche senza bisogno di andare allo sportello. 
              Domande, richieste e consulenze direttamente da casa in pochi secondi.
            </p>

            {/* Search Box */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cerca un servizio (es. ISEE, pensione, SPID...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-10">
                  {allServices
                    .filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .slice(0, 5)
                    .map(service => (
                      <Link
                        key={service.id}
                        to={`/servizi/${service.slug}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-gray-900 font-medium">{service.title}</div>
                      </Link>
                    ))}
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-blue-100">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4" /> Soddisfatti o rimborsati
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4" /> 25+ anni di esperienza
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" /> Assistenza telefonica
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              I nostri servizi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Soluzioni complete per la gestione delle tue pratiche fiscali, previdenziali e amministrative
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCategories.map((category) => {
              const Icon = iconMap[category.icon] || Calculator;
              return (
                <Link
                  key={category.id}
                  to={`/servizi#${category.id}`}
                  className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>
                  <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                    <span>Vedi tutti i servizi</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Servizi più richiesti
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Le pratiche più popolari gestite dai nostri esperti
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularServices.map((service) => {
              const Icon = iconMap[service.icon] || FileCheck;
              return (
                <Link
                  key={service.id}
                  to={`/servizi/${service.slug}`}
                  className="group bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{service.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/servizi"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
            >
              Vedi tutti i servizi
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Formazione Preview */}
      <section className="py-16 lg:py-20 bg-slate-900 text-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Silced Academy
              </h2>
              <p className="text-slate-300 mb-6 text-lg">
                Formazione professionale per operatori CAF e Patronato. Corsi certificati per lavorare nel settore fiscale e previdenziale.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-blue-400" />
                  <span>Attestato di qualifica professionale</span>
                </li>
                <li className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span>Docenti esperti del settore</span>
                </li>
                <li className="flex items-center gap-3">
                  <Calculator className="w-5 h-5 text-blue-400" />
                  <span>Casi pratici ed esercitazioni</span>
                </li>
              </ul>
              <Link
                to="/formazione"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
              >
                Scopri i corsi
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid gap-4">
              {courses.slice(0, 3).map((course) => (
                <div key={course.id} className="bg-slate-800 rounded-xl p-5">
                  <h3 className="font-semibold mb-1">{course.title}</h3>
                  <p className="text-slate-400 text-sm mb-3">{course.description.slice(0, 80)}...</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-400">{course.duration}</span>
                    <span className="text-slate-400">{course.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Strumenti Esclusivi */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-violet-50 to-blue-50">
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Solo su SILCED
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              5 Strumenti che nessun altro ha
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tecnologia avanzata al servizio dei cittadini. Calcola, simula, traccia e confronta.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: Calculator, title: 'Calcolatore ISEE', href: '/strumenti/calcolatore-isee', color: 'bg-blue-600' },
              { icon: TrendingUp, title: 'Simulatore Pensione', href: '/strumenti/simulatore-pensione', color: 'bg-emerald-600' },
              { icon: Search, title: 'Tracking Pratica', href: '/strumenti/tracking', color: 'bg-violet-600' },
              { icon: Bot, title: 'Assistente AI', href: '/strumenti/assistente', color: 'bg-amber-600' },
              { icon: BarChart3, title: 'Comparatore', href: '/strumenti/comparatore', color: 'bg-rose-600' },
            ].map((tool) => (
              <Link key={tool.title} to={tool.href} className="group bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all border border-gray-100 text-center">
                <div className={`w-12 h-12 ${tool.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <tool.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{tool.title}</h3>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/strumenti" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800">
              Scopri tutti gli strumenti <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Diventa Partner */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 lg:p-12 text-white">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm mb-4">
                  <Handshake className="w-4 h-4" />
                  Programma Partner
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">Diventa Partner SILCED</h2>
                <p className="text-blue-100 mb-6">Apri un punto SILCED nella tua città. Formazione, software, assistenza e brand consolidato.</p>
                <Link to="/partner" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-900 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  Scopri come <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">200+</div>
                  <div className="text-sm text-blue-200">Partner attivi</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">+30%</div>
                  <div className="text-sm text-blue-200">Crescita annua</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">25+</div>
                  <div className="text-sm text-blue-200">Anni esperienza</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm text-blue-200">Supporto tecnico</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Ultime News
              </h2>
              <p className="text-gray-600">Approfondimenti fiscali e previdenziali</p>
            </div>
            <Link
              to="/news"
              className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800"
            >
              Vedi tutte le news
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newsItems.slice(0, 4).map((news) => (
              <Link
                key={news.id}
                to={`/news/${news.slug}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <div className="h-40 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                  <span className="text-white/30 text-4xl font-bold">{news.category[0]}</span>
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 lg:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Hai bisogno di assistenza?
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-8 text-lg">
              I nostri esperti sono a tua disposizione per aiutarti con qualsiasi pratica fiscale, previdenziale o amministrativa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contatti"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Contattaci ora
              </Link>
              <a
                href="tel:800123456"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                800.123.456
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
