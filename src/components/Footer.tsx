import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Main Footer */}
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo-silced.svg" alt="SILCED" className="h-10 w-auto brightness-0 invert" />
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Sindacato Italiano Lavoratori Centri Elaborazione Dati. Tutela legale, assistenza fiscale e previdenziale.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Servizi Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Servizi</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/servizi#caf" className="hover:text-white transition-colors">CAF e Patronato</Link></li>
              <li><Link to="/servizi#lavoro" className="hover:text-white transition-colors">Lavoro e Pensioni</Link></li>
              <li><Link to="/servizi#famiglie" className="hover:text-white transition-colors">Famiglie</Link></li>
              <li><Link to="/servizi#stranieri" className="hover:text-white transition-colors">Stranieri</Link></li>
              <li><Link to="/servizi#casa" className="hover:text-white transition-colors">Casa</Link></li>
              <li><Link to="/servizi#certificati" className="hover:text-white transition-colors">Certificati</Link></li>
            </ul>
          </div>

          {/* Link Utili Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Link Utili</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/strumenti" className="hover:text-white transition-colors">Strumenti Online</Link></li>
              <li><Link to="/formazione" className="hover:text-white transition-colors">Formazione</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/partner" className="hover:text-white transition-colors">Diventa Partner</Link></li>
              <li><Link to="/news" className="hover:text-white transition-colors">News</Link></li>
              <li><a href="https://www.zerocartacaf.it" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">ZEROCARTA CAF</a></li>
            </ul>
          </div>

          {/* Contatti Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contatti</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-blue-500" />
                <span>Via Roma 123<br/>00100 Roma RM</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-500" />
                <a href="tel:800123456" className="hover:text-white transition-colors">800.123.456</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-500" />
                <a href="mailto:info@silced.it" className="hover:text-white transition-colors">info@silced.it</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <p>&copy; {currentYear} SILCED. Tutti i diritti riservati.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/cookie" className="hover:text-white transition-colors">Cookie Policy</Link>
              <Link to="/termini" className="hover:text-white transition-colors">Termini e Condizioni</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
