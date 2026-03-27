import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calculator, Briefcase, Users, Building2, Car, FileCheck, ArrowRight, Globe, Home } from 'lucide-react';
import { serviceCategories, allServices } from '../data/services';

const iconMap: Record<string, React.ElementType> = {
  Calculator, Briefcase, Users, Building2, Car, FileCheck, Globe, Home
};

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const service = allServices.find(s => s.slug === slug);
  
  if (!service) {
    return (
      <div className="min-h-screen py-16">
        <div className="container text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Servizio non trovato</h1>
          <p className="text-gray-600 mb-6">Il servizio richiesto non esiste o è stato rimosso.</p>
          <Link to="/servizi" className="text-blue-600 hover:underline">
            Torna ai servizi
          </Link>
        </div>
      </div>
    );
  }

  const category = serviceCategories.find(c => c.id === service.category);
  const Icon = iconMap[service.icon] || FileCheck;

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to="/servizi" className="hover:text-blue-600">Servizi</Link>
          <span>/</span>
          <span className="text-gray-900">{service.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Link
              to="/servizi"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Torna ai servizi
            </Link>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                <Icon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <span className="text-sm text-blue-600 font-medium">{category?.title}</span>
                <h1 className="text-3xl font-bold text-gray-900">{service.title}</h1>
              </div>
            </div>

            <div className="prose max-w-none text-gray-600 space-y-4">
              <p className="text-lg">{service.description}</p>
              
              <h2 className="text-xl font-semibold text-gray-900 mt-8">Cosa include il servizio</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>Consulenza preliminare gratuita</li>
                <li>Verifica documenti e requisiti</li>
                <li>Compilazione e presentazione pratica</li>
                <li>Assistenza fino all'esito</li>
                <li>Gestione eventuali integrazioni</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mt-8">Documenti necessari</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>Documento d'identità valido</li>
                <li>Codice fiscale</li>
                <li>Eventuali documenti specifici in base al tipo di pratica</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mt-8">Tempistiche</h2>
              <p>Le tempistiche di elaborazione variano in base alla complessità della pratica e all'ente destinatario. Generalmente:
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>Pratiche semplici: 3-5 giorni lavorativi</li>
                <li>Pratiche complesse: 10-15 giorni lavorativi</li>
                <li>Pratiche con enti esterni: 15-30 giorni lavorativi</li>
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Richiedi il servizio</h3>
              <p className="text-sm text-gray-600 mb-6">
                Compila il form per richiedere questo servizio. Ti contatteremo entro 24 ore.
              </p>
              <Link
                to="/contatti"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors mb-4"
              >
                Richiedi ora
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="tel:800123456"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-blue-900 text-blue-900 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Chiama 800.123.456
              </a>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Servizi correlati</h4>
                <ul className="space-y-2">
                  {allServices
                    .filter(s => s.category === service.category && s.id !== service.id)
                    .slice(0, 3)
                    .map(s => (
                      <li key={s.id}>
                        <Link
                          to={`/servizi/${s.slug}`}
                          className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          {s.title}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
