import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import App from './App';

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

describe('App', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.startsWith('/health')) {
        return Promise.resolve(jsonResponse({ ok: true }));
      }

      if (url.startsWith('/api/authors')) {
        return Promise.resolve(
          jsonResponse([
            {
              id: 1,
              name: 'Ada Lovelace',
              email: 'ada@example.com',
              bio: 'Writer',
              joined_at: '2025-01-01T00:00:00.000Z',
            },
          ]),
        );
      }

      if (url.startsWith('/api/tags')) {
        return Promise.resolve(
          jsonResponse([
            { id: 1, name: 'Technology' },
            { id: 2, name: 'Science' },
          ]),
        );
      }

      if (url.startsWith('/api/posts')) {
        return Promise.resolve(
          jsonResponse({
            data: [
              {
                id: 55,
                title: 'Sample Story',
                summary: 'A concise summary',
                body: 'Body text for the sample story',
                published_at: '2026-02-19T00:00:00.000Z',
              },
            ],
            pagination: {
              page: 1,
              per_page: 6,
              total: 1,
              total_pages: 1,
            },
          }),
        );
      }

      return Promise.resolve(
        jsonResponse({ status: 404, message: 'Not found' }, 404),
      );
    });

    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  test('renders connected status and post data from API', async () => {
    render(<App />);

    expect(screen.getByText('Guardian 2')).toBeInTheDocument();

    await screen.findByText('Connected');
    await screen.findByText('Sample Story');

    expect(screen.getByText('A concise summary')).toBeInTheDocument();
  });

  test('applies filters and calls posts endpoint with query parameters', async () => {
    render(<App />);

    await screen.findByText('Sample Story');

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Search/), 'climate');
    await user.click(screen.getByRole('button', { name: 'Apply Filters' }));

    await waitFor(() => {
      const postRequests = fetchMock.mock.calls
        .map(([url]) => String(url))
        .filter((url) => url.startsWith('/api/posts'));

      expect(postRequests.length).toBeGreaterThan(1);
      expect(postRequests[postRequests.length - 1]).toContain('q=climate');
    });
  });

  test('shows checking state with neutral styling while health is pending', () => {
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.startsWith('/health')) {
        return new Promise<Response>(() => {});
      }

      if (url.startsWith('/api/posts')) {
        return Promise.resolve(
          jsonResponse({
            data: [],
            pagination: {
              page: 1,
              per_page: 6,
              total: 0,
              total_pages: 0,
            },
          }),
        );
      }

      return Promise.resolve(jsonResponse([]));
    });

    render(<App />);

    const status = screen.getByText('Checking');
    expect(status).toHaveClass('text-slate-500');
  });
});
