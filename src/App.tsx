import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import CookieBanner from './components/CookieBanner';
import AiChatWidget from './components/AiChatWidget';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import FormazionePage from './pages/FormazionePage';
import ChiSiamoPage from './pages/ChiSiamoPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import ContattiPage from './pages/ContattiPage';
import NotFoundPage from './pages/NotFoundPage';
import StrumentiPage from './pages/StrumentiPage';
import CalcolatoreIseePage from './pages/CalcolatoreIseePage';
import SimulatorePensionePage from './pages/SimulatorePensionePage';
import TrackingPage from './pages/TrackingPage';
import AssistentePage from './pages/AssistentePage';
import ComparatorePage from './pages/ComparatorePage';
import FaqPage from './pages/FaqPage';
import PartnerPage from './pages/PartnerPage';
import LoginPage from './pages/LoginPage';
import DashboardCliente from './pages/cliente/DashboardCliente';
import NuovaPratica from './pages/cliente/NuovaPratica';
import PrenotaAppuntamento from './pages/cliente/PrenotaAppuntamento';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import './index.css';

function AppLayout() {
  const location = useLocation();
  const hideLayout = location.pathname.startsWith('/area-cliente') || location.pathname.startsWith('/admin') || location.pathname === '/login';

  return (
    <>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        {!hideLayout && <Header />}
        <main className={hideLayout ? '' : 'flex-grow'}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/servizi" element={<ServicesPage />} />
            <Route path="/servizi/:slug" element={<ServiceDetailPage />} />
            <Route path="/strumenti" element={<StrumentiPage />} />
            <Route path="/strumenti/calcolatore-isee" element={<CalcolatoreIseePage />} />
            <Route path="/strumenti/simulatore-pensione" element={<SimulatorePensionePage />} />
            <Route path="/strumenti/tracking" element={<TrackingPage />} />
            <Route path="/strumenti/assistente" element={<AssistentePage />} />
            <Route path="/strumenti/comparatore" element={<ComparatorePage />} />
            <Route path="/formazione" element={<FormazionePage />} />
            <Route path="/chi-siamo" element={<ChiSiamoPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:slug" element={<NewsDetailPage />} />
            <Route path="/contatti" element={<ContattiPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/partner" element={<PartnerPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Area Cliente (protetta) */}
            <Route path="/area-cliente" element={<ProtectedRoute><DashboardCliente /></ProtectedRoute>} />
            <Route path="/area-cliente/nuova-pratica" element={<ProtectedRoute><NuovaPratica /></ProtectedRoute>} />
            <Route path="/area-cliente/appuntamento" element={<ProtectedRoute><PrenotaAppuntamento /></ProtectedRoute>} />

            {/* Area Patronato (protetta — admin/operatore) */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="operatore"><DashboardAdmin /></ProtectedRoute>} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        {!hideLayout && <Footer />}
        <AiChatWidget />
        <CookieBanner />
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
