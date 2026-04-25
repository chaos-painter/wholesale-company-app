import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthState {
  token: string | null;
  role: string | null;
  userId: number | null;
  email: string | null;
}

interface AuthContextType extends AuthState {
  login: (token: string) => void;
  logout: () => void;
  isAdmin: boolean;
  isManager: boolean;
}

function parseJwt(token: string): { sub: number; email: string; role: string; exp: number } | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function fromToken(token: string): AuthState {
  const p = parseJwt(token);
  if (p && p.exp * 1000 > Date.now()) {
    return { token, role: p.role, userId: p.sub, email: p.email };
  }
  return { token: null, role: null, userId: null, email: null };
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
      const s = fromToken(stored);
      if (s.token) return s;
      localStorage.removeItem('token');
    }
    return { token: null, role: null, userId: null, email: null };
  });

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setState(fromToken(token));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setState({ token: null, role: null, userId: null, email: null });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      isAdmin: state.role === 'admin',
      isManager: state.role === 'admin' || state.role === 'manager',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
