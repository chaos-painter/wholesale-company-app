import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  requireManager?: boolean;
}

export default function ProtectedRoute({ children, requireManager }: Props) {
  const { token, isManager } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (requireManager && !isManager) return <Navigate to="/catalog" replace />;
  return <>{children}</>;
}
