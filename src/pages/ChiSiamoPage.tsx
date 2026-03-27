import { Shield, Users, Gavel, Heart, Award, Calendar, ArrowRight, Phone, MapPin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ChiSiamoPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16 lg:py-24">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Chi siamo
            </h1>
            <p className="text-lg text-blue-100">
              Il Sindacato Italiano Lavoratori Centri Elaborazione Dati opera dal 2000 
              per la tutela dei lavoratori e la promozione dei diritti fiscali e previdenziali.
            </p>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                La nostra storia
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Il Sindacato Italiano Lavoratori Centri Elaborazione Dati nasce prima del 2000 
                  con lo scopo di promuovere il raggiungimento delle finalità attraverso la 
                  contrattazione collettiva e decentrata e la tutela legale e stragiudiziaria 
                  degli associati e dei lavoratori/pensionati.
                </p>
                <p>
                  Inoltre il Sindacato SILCED è in grado di fornire assistenza fiscale e 
                  previdenziale diretta, in quanto socio unico del SILCED ZEROCARTA CAF srl, 
                  centro di assistenza fiscale autorizzato.
                </p>
                <p>
                  Oggi SILCED conta migliaia di associati in tutta Italia e offre servizi 
                  completi attraverso una rete di sportelli presenti sul territorio nazionale.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-2xl p-6 text-center">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-900">25+</div>
                <div className="text-sm text-gray-600">Anni di attività</div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-6 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-900">10K+</div>
                <div className="text-sm text-gray-600">Associati</div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-6 text-center">
                <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-900">50+</div>
                <div className="text-sm text-gray-600">Sportelli</div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-6 text-center">
                <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-900">100K+</div>
                <div className="text-sm text-gray-600">Pratiche/anno</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              La nostra missione
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Promuoviamo i diritti dei lavoratori attraverso servizi di qualità e formazione continua
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Tutela sindacale</h3>
              <p className="text-gray-600 text-sm">
                Rappresentanza dei lavoratori nella contrattazione collettiva e tutela dei diritti individuali e collettivi.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Gavel className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Assistenza legale</h3>
              <p className="text-gray-600 text-sm">
                Tutela legale e stragiudiziaria degli associati per controversie lavorative e previdenziali.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Assistenza fiscale</h3>
              <p className="text-gray-600 text-sm">
                Servizi CAF per dichiarazioni redditi, ISEE, IMU e tutte le pratiche fiscali.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Patronato</h3>
              <p className="text-gray-600 text-sm">
                Assistenza previdenziale per pensioni, NASPI, maternità e tutte le pratiche INPS.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Formazione</h3>
              <p className="text-gray-600 text-sm">
                Corsi professionali per operatori CAF e Patronato attraverso Silced Academy.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Conciliazioni</h3>
              <p className="text-gray-600 text-sm">
                Servizi di conciliazione vita-lavoro e gestione conflitti in ambito lavorativo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Zerocarta */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 lg:p-12 text-white">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  SILCED ZEROCARTA CAF
                </h2>
                <p className="text-blue-100 mb-6">
                  SILCED è socio unico di ZEROCARTA CAF srl, centro di assistenza fiscale 
                  autorizzato che permette al sindacato di offrire assistenza fiscale e 
                  previdenziale diretta ai propri associati.
                </p>
                <a
                  href="https://www.zerocartacaf.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Visita ZEROCARTA CAF
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              <div className="flex justify-center">
                <div className="w-40 h-40 bg-white/10 rounded-2xl flex items-center justify-center">
                  <span className="text-4xl font-bold text-white/80">ZC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Vuoi saperne di più?
            </h2>
            <p className="text-gray-600 mb-8">
              Contattaci per maggiori informazioni sui nostri servizi e sulle opportunità di associazione.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contatti"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Scrivici
              </Link>
              <a
                href="tel:800123456"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-900 text-blue-900 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                <Phone className="w-4 h-4" />
                800.123.456
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
