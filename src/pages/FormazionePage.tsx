import { Link } from 'react-router-dom';
import { Award, Users, Clock, BookOpen, GraduationCap, CheckCircle, ArrowRight } from 'lucide-react';
import { courses } from '../data/services';

export default function FormazionePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-16 lg:py-24">
        <div className="container">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800/50 rounded-full text-sm mb-6">
              <GraduationCap className="w-4 h-4" />
              <span>Silced Academy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Formazione professionale per operatori CAF e Patronato
            </h1>
            <p className="text-lg text-blue-100 mb-8">
              Corsi certificati per lavorare nel settore fiscale e previdenziale. 
              Docenti esperti e casi pratici per una formazione di eccellenza.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#corsi"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
              >
                Scopri i corsi
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="tel:800123456"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                Richiedi informazioni
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-blue-50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-900 mb-1">500+</div>
              <div className="text-sm text-gray-600">Allievi formanti</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-900 mb-1">25+</div>
              <div className="text-sm text-gray-600">Corsi attivi</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-900 mb-1">98%</div>
              <div className="text-sm text-gray-600">Soddisfazione</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-900 mb-1">15+</div>
              <div className="text-sm text-gray-600">Docenti esperti</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Perché scegliere Silced Academy
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Formazione di qualità per entrare nel mondo del lavoro come operatore CAF e Patronato
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Attestato di qualifica</h3>
              <p className="text-gray-600 text-sm">Attestato riconosciuto per operare come CAF e Patronato</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Docenti esperti</h3>
              <p className="text-gray-600 text-sm">Formatori con anni di esperienza nel settore</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Casi pratici</h3>
              <p className="text-gray-600 text-sm">Esercitazioni su casi reali e situazioni concrete</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Orari flessibili</h3>
              <p className="text-gray-600 text-sm">Corsi in aula e online con orari compatibili</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Esame finale</h3>
              <p className="text-gray-600 text-sm">Verifica delle competenze acquisite con attestato</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Aggiornamenti</h3>
              <p className="text-gray-600 text-sm">Corsi di aggiornamento sulle novità normative</p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="corsi" className="py-16 lg:py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              I nostri corsi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Scegli il corso più adatto alle tue esigenze e inizia il tuo percorso formativo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-40 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-white/50" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {course.level}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {course.duration}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-lg font-bold text-blue-900">{course.price}</span>
                    <Link
                      to="/contatti"
                      className="px-4 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
                    >
                      Iscriviti
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 lg:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Vuoi diventare operatore CAF?
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-8">
              Contattaci per ricevere tutte le informazioni sui nostri corsi di formazione. 
              Ti aiuteremo a scegliere il percorso più adatto a te.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contatti"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Richiedi informazioni
                <ArrowRight className="w-4 h-4" />
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
