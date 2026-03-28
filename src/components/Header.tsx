import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, ChevronDown, Calculator, TrendingUp, Search, Bot, BarChart3, LogIn, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const serviceCategories = [
  'CAF e Patronato', 'Lavoro e Pensioni', 'Famiglie', 'Stranieri', 'Casa', 'Comune', 'PRA', 'Certificati'
];

const strumentiLinks = [
  { name: 'Calcolatore ISEE', href: '/strumenti/calcolatore-isee', icon: Calculator },
  { name: 'Simulatore Pensione', href: '/strumenti/simulatore-pensione', icon: TrendingUp },
  { name: 'Tracking Pratica', href: '/strumenti/tracking', icon: Search },
  { name: 'Assistente AI', href: '/strumenti/assistente', icon: Bot },
  { name: 'Comparatore Servizi', href: '/strumenti/comparatore', icon: BarChart3 },
];

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Servizi', href: '/servizi', hasDropdown: 'servizi' },
  { name: 'Strumenti', href: '/strumenti', hasDropdown: 'strumenti' },
  { name: 'Formazione', href: '/formazione' },
  { name: 'Chi Siamo', href: '/chi-siamo' },
  { name: 'News', href: '/news' },
  { name: 'Contatti', href: '/contatti' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const { user, isAdmin, isOperatore } = useAuth();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-blue-900">SILCED</span>
              <span className="block text-xs text-gray-600 -mt-1">Sindacato Italiano</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <div key={link.name} className="relative">
                {link.hasDropdown ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(link.hasDropdown ?? null)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <Link
                      to={link.href}
                      className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? 'text-blue-900 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-900 hover:bg-gray-50'
                      }`}
                    >
                      {link.name}
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Link>

                    {openDropdown === 'servizi' && link.hasDropdown === 'servizi' && (
                      <div className="absolute top-full left-0 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 mt-1">
                        {serviceCategories.map((cat) => (
                          <Link
                            key={cat}
                            to={`/servizi#${cat.toLowerCase().replace(/\s+/g, '-')}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                          >
                            {cat}
                          </Link>
                        ))}
                      </div>
                    )}

                    {openDropdown === 'strumenti' && link.hasDropdown === 'strumenti' && (
                      <div className="absolute top-full left-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 mt-1">
                        {strumentiLinks.map((tool) => (
                          <Link
                            key={tool.name}
                            to={tool.href}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                          >
                            <tool.icon className="w-4 h-4 text-blue-600" />
                            {tool.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? 'text-blue-900 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-900 hover:bg-gray-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:800123456"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-900"
            >
              <Phone className="w-4 h-4" />
              800.123.456
            </a>
            {user ? (
              <Link
                to={isAdmin || isOperatore ? '/admin' : '/area-cliente'}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
              >
                <User className="w-4 h-4" />
                {isAdmin || isOperatore ? 'Area Patronato' : 'Area Cliente'}
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Accedi
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-4 py-3 rounded-md text-sm font-medium ${
                    isActive(link.href)
                      ? 'text-blue-900 bg-blue-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link to="/faq" className="px-4 py-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
              <Link to="/partner" className="px-4 py-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Diventa Partner</Link>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <a
                  href="tel:800123456"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700"
                >
                  <Phone className="w-4 h-4" />
                  800.123.456
                </a>
                {user ? (
                  <Link
                    to={isAdmin || isOperatore ? '/admin' : '/area-cliente'}
                    className="mx-4 mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-blue-900 text-white text-sm font-medium rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    {isAdmin || isOperatore ? 'Area Patronato' : 'Area Cliente'}
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="mx-4 mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-blue-900 text-white text-sm font-medium rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4" />
                    Accedi / Registrati
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
