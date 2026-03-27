import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-16">
      <div className="container">
        <div className="text-center max-w-lg mx-auto">
          <div className="text-9xl font-bold text-blue-100 mb-4">404</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Pagina non trovata
          </h1>
          <p className="text-gray-600 mb-8">
            La pagina che stai cercando non esiste o è stata spostata.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
            >
              <Home className="w-4 h-4" />
              Torna alla home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Torna indietro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
