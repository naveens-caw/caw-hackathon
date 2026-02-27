import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomePage } from './home-page';

describe('HomePage', () => {
  it('renders title', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <HomePage />
      </QueryClientProvider>,
    );

    expect(screen.getByText('CAW Hackathon Bootstrap')).toBeInTheDocument();
  });
});