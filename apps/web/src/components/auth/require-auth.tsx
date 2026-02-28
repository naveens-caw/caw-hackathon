import type { ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div className="p-6 text-sm text-slate-600">Checking authentication...</div>;
  }

  if (!isSignedIn) {
    return <Navigate replace to="/sign-in" />;
  }

  return children;
};
