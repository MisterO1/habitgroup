import { auth } from '@/utils/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuth: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const value = useMemo(() => ({ user, isLoading, isAuth: !!user }), [user, isLoading]);
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}


