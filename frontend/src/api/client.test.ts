import { afterEach, describe, expect, test, vi } from 'vitest';

import { ApiRequestError, getPosts } from './client';

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

describe('api error handling', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('uses payload status in fallback error messages', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ status: 418 }, 500));
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

    let thrown: unknown;

    try {
      await getPosts({});
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(ApiRequestError);
    expect(thrown).toMatchObject({
      message: 'Request failed with status 418.',
      status: 418,
    });
  });
});
