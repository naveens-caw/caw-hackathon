import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth } from './components/auth/require-auth';
import { RequireRole } from './components/auth/require-role';
import { HomePage } from './routes/home-page';
import { RbacDemoPage } from './routes/rbac-demo-page';
import { SignInPage } from './routes/sign-in';
import { SignUpPage } from './routes/sign-up';

export const router = createBrowserRouter([
  {
    path: '/sign-in',
    element: <SignInPage />,
  },
  {
    path: '/sign-up',
    element: <SignUpPage />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <HomePage />
      </RequireAuth>
    ),
  },
  {
    path: '/rbac-demo',
    element: (
      <RequireAuth>
        <RequireRole allowed={['hr', 'manager', 'employee']}>
          <RbacDemoPage />
        </RequireRole>
      </RequireAuth>
    ),
  },
]);
