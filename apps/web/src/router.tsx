import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth } from './components/auth/require-auth';
import { RequireRole } from './components/auth/require-role';
import { HomePage } from './routes/home-page';
import { HrDashboardPage } from './routes/hr-dashboard-page';
import { JobDetailsPage } from './routes/job-details-page';
import { JobFormPage } from './routes/job-form-page';
import { JobsPage } from './routes/jobs-page';
import { RbacDemoPage } from './routes/rbac-demo-page';
import { SignInPage } from './routes/sign-in';
import { SignUpPage } from './routes/sign-up';

export const router = createBrowserRouter([
  {
    path: '/sign-in/*',
    element: <SignInPage />,
  },
  {
    path: '/sign-up/*',
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
    path: '/jobs',
    element: (
      <RequireAuth>
        <RequireRole allowed={['hr', 'manager', 'employee']}>
          <JobsPage />
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/jobs/:id',
    element: (
      <RequireAuth>
        <RequireRole allowed={['hr', 'manager', 'employee']}>
          <JobDetailsPage />
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/hr/dashboard',
    element: (
      <RequireAuth>
        <RequireRole allowed={['hr']}>
          <HrDashboardPage />
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/hr/jobs/new',
    element: (
      <RequireAuth>
        <RequireRole allowed={['hr']}>
          <JobFormPage />
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/hr/jobs/:id/edit',
    element: (
      <RequireAuth>
        <RequireRole allowed={['hr']}>
          <JobFormPage />
        </RequireRole>
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
