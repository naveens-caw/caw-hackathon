import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { setTokenGetter } from './lib/auth';
import { router } from './router';
import './index.css';

const queryClient = new QueryClient();
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is required.');
}

if (import.meta.env.PROD && clerkPublishableKey.startsWith('pk_test_')) {
  throw new Error(
    'Production build cannot use Clerk test keys. Set VITE_CLERK_PUBLISHABLE_KEY to pk_live_...',
  );
}

// eslint-disable-next-line react-refresh/only-export-components
const AuthTokenSync = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenGetter(() => getToken());
    return () => setTokenGetter(null);
  }, [getToken]);

  return null;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <AuthTokenSync />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>,
);
