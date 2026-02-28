import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { TopNav } from '@/components/layout/top-nav';

const fetchProtected = async (
  path: '/api/rbac-demo/hr' | '/api/rbac-demo/manager' | '/api/rbac-demo/employee',
) => {
  const response = await apiFetch(path);
  if (!response.ok) {
    throw new Error(`Request failed for ${path}`);
  }
  return response.json() as Promise<{ ok: boolean; path: string; role: string }>;
};

export const RbacDemoPage = () => {
  const hrQuery = useQuery({
    queryKey: ['rbac', 'hr'],
    queryFn: () => fetchProtected('/api/rbac-demo/hr'),
  });
  const managerQuery = useQuery({
    queryKey: ['rbac', 'manager'],
    queryFn: () => fetchProtected('/api/rbac-demo/manager'),
  });
  const employeeQuery = useQuery({
    queryKey: ['rbac', 'employee'],
    queryFn: () => fetchProtected('/api/rbac-demo/employee'),
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-6">
      <TopNav />
      <h1 className="text-2xl font-semibold">RBAC Demo</h1>
      <p className="text-sm text-slate-600">Each call succeeds only for the matching role.</p>
      <pre className="rounded-md border bg-slate-50 p-3 text-sm">
        HR: {hrQuery.isError ? 'forbidden' : JSON.stringify(hrQuery.data)}
      </pre>
      <pre className="rounded-md border bg-slate-50 p-3 text-sm">
        Manager: {managerQuery.isError ? 'forbidden' : JSON.stringify(managerQuery.data)}
      </pre>
      <pre className="rounded-md border bg-slate-50 p-3 text-sm">
        Employee: {employeeQuery.isError ? 'forbidden' : JSON.stringify(employeeQuery.data)}
      </pre>
    </main>
  );
};
