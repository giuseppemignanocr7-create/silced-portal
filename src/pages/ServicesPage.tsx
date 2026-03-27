import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Briefcase, Users, Building2, Car, FileCheck, Search, ArrowRight, Globe, Home } from 'lucide-react';
import { serviceCategories, allServices } from '../data/services';

const iconMap: Record<string, React.ElementType> = {
  Calculator, Briefcase, Users, Building2, Car, FileCheck, Globe, Home
};

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = allServices.filter(service => {
    const matchesCategory = activeCategory ? service.category === activeCategory : true;
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Tutti i servizi
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Scegli il servizio di cui hai bisogno e richiedilo online. Assistenza completa per pratiche fiscali, previdenziali e amministrative.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca un servizio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === null
                ? 'bg-blue-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tutti
          </button>
          {serviceCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-blue-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {serviceCategories
            .filter(cat => activeCategory === null || cat.id === activeCategory)
            .map((category) => {
              const Icon = iconMap[category.icon] || Calculator;
              const categoryServices = filteredServices.filter(s => s.category === category.id);
              
              if (categoryServices.length === 0) return null;

              return (
                <div
                  key={category.id}
                  id={category.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                >
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-3">
                      {categoryServices.map((service) => (
                        <Link
                          key={service.id}
                          to={`/servizi/${service.slug}`}
                          className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                            {(() => {
                              const ServiceIcon = iconMap[service.icon] || FileCheck;
                              return <ServiceIcon className="w-5 h-5 text-blue-600" />;
                            })()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {service.title}
                              </h3>
                              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{service.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Nessun servizio trovato per i criteri selezionati.</p>
            <button
              onClick={() => {setSearchQuery(''); setActiveCategory(null);}}
              className="mt-4 text-blue-600 hover:underline"
            >
              Resetta filtri
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
