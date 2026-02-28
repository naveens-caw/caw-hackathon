import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from './home-page';
import { vi } from 'vitest';

vi.mock('@clerk/clerk-react', () => ({
  SignedIn: ({ children }: { children: unknown }) => <>{children}</>,
  SignedOut: ({ children }: { children: unknown }) => <>{children}</>,
  UserButton: () => <div>UserButton</div>,
}));

vi.mock('@/lib/api', () => ({
  apiFetch: async (path: string) => {
    if (path === '/api/version') {
      return new Response(JSON.stringify({ version: '0.1.0', env: 'development' }), {
        status: 200,
      });
    }
    return new Response(
      JSON.stringify({
        id: 'user_123',
        email: 'user@example.com',
        fullName: 'Demo User',
        role: 'employee',
        status: 'active',
      }),
      { status: 200 },
    );
  },
}));

describe('HomePage', () => {
  it('renders title', () => {
    render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient()}>
          <HomePage />
        </QueryClientProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /Internal Job Board/i })).toBeInTheDocument();
  });
});
