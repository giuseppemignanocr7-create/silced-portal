import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, User, Eye, EyeOff, Bot, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isRegister) {
      if (!nome.trim() || !cognome.trim()) {
        setError('Nome e cognome sono obbligatori');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, { nome, cognome });
      if (error) {
        setError(error.message === 'User already registered' ? 'Email già registrata' : error.message);
      } else {
        setSuccess('Registrazione completata! Controlla la tua email per confermare l\'account.');
      }
    } else {
      const { error, profile: prof } = await signIn(email, password);
      if (error) {
        setError(error.message === 'Invalid login credentials' ? 'Email o password non corretti' : error.message);
      } else {
        const ruolo = prof?.ruolo;
        if (ruolo === 'admin' || ruolo === 'operatore') {
          navigate('/admin');
        } else {
          navigate('/area-cliente');
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <img src="/logo-silced.svg" alt="SILCED" className="h-12 w-auto mx-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            {isRegister ? 'Crea il tuo account' : 'Accedi al tuo account'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isRegister ? 'Registrati per gestire le tue pratiche online' : 'Entra nella tua area personale'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mario"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={cognome}
                      onChange={(e) => setCognome(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Rossi"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="mario.rossi@email.it"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Minimo 6 caratteri"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : isRegister ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  Registrati
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Accedi
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium block mx-auto"
            >
              {isRegister ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
            </button>
            {!isRegister && (
              <Link to="/reset-password" className="text-sm text-gray-500 hover:text-gray-700 block">
                Password dimenticata?
              </Link>
            )}
          </div>
        </div>

        {/* AI Hint */}
        <div className="mt-6 bg-gradient-to-r from-blue-600/5 to-violet-600/5 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
          <Bot className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-800">Assistente AI disponibile</span> — Dopo il login, il nostro assistente ti guiderà nella compilazione delle pratiche e nella prenotazione degli appuntamenti.
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
            <ArrowRight className="w-3 h-3 rotate-180" /> Torna al sito
          </Link>
        </div>
      </div>
    </div>
  );
}
