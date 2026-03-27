import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import CookieBanner from './components/CookieBanner';
import WhatsAppWidget from './components/WhatsAppWidget';
import AiChatWidget from './components/AiChatWidget';
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
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
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
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <AiChatWidget />
        <WhatsAppWidget />
        <CookieBanner />
      </div>
    </BrowserRouter>
  );
}

export default App;
