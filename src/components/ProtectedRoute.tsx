import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'utente' | 'operatore' | 'admin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole === 'admin' && profile?.ruolo !== 'admin') {
    return <Navigate to="/area-cliente" replace />;
  }

  if (requiredRole === 'operatore' && !['operatore', 'admin'].includes(profile?.ruolo || '')) {
    return <Navigate to="/area-cliente" replace />;
  }

  return <>{children}</>;
}
