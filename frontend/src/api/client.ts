import type {
  Author,
  HealthResponse,
  Post,
  PostCreate,
  PostsQuery,
  PostsResponse,
  PostUpdate,
  Tag,
} from './types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

type ErrorPayload = {
  message?: string;
  status?: number;
};

export class ApiRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

async function readError(response: Response): Promise<ApiRequestError> {
  let payload: ErrorPayload | null = null;

  try {
    payload = (await response.json()) as ErrorPayload;
  } catch {
    payload = null;
  }

  const status = payload?.status ?? response.status;
  const message =
    typeof payload?.message === 'string' && payload.message.trim() !== ''
      ? payload.message
      : `Request failed with status ${status}.`;

  return new ApiRequestError(status, message);
}

async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, { signal });

  if (!response.ok) {
    throw await readError(response);
  }

  return (await response.json()) as T;
}

async function apiPost<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    throw await readError(response);
  }

  return (await response.json()) as T;
}

async function apiPatch<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    throw await readError(response);
  }

  return (await response.json()) as T;
}

async function apiDelete(path: string, signal?: AbortSignal): Promise<void> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    signal,
  });

  if (!response.ok) {
    throw await readError(response);
  }
}

function createQueryString(params: PostsQuery): string {
  const searchParams = new URLSearchParams();

  const entries = Object.entries(params) as Array<
    [keyof PostsQuery, PostsQuery[keyof PostsQuery]]
  >;

  for (const [key, value] of entries) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query === '' ? '' : `?${query}`;
}

export function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return apiGet<HealthResponse>('/health', signal);
}

export function getAuthors(signal?: AbortSignal): Promise<Author[]> {
  return apiGet<Author[]>('/api/authors', signal);
}

export function getTags(signal?: AbortSignal): Promise<Tag[]> {
  return apiGet<Tag[]>('/api/tags', signal);
}

export function getPosts(
  params: PostsQuery,
  signal?: AbortSignal,
): Promise<PostsResponse> {
  return apiGet<PostsResponse>(
    `/api/posts${createQueryString(params)}`,
    signal,
  );
}

export function getPost(id: number, signal?: AbortSignal): Promise<Post> {
  return apiGet<Post>(`/api/posts/${id}`, signal);
}

export function createPost(
  data: PostCreate,
  signal?: AbortSignal,
): Promise<Post> {
  return apiPost<Post>('/api/posts', data, signal);
}

export function updatePost(
  id: number,
  data: PostUpdate,
  signal?: AbortSignal,
): Promise<Post> {
  return apiPatch<Post>(`/api/posts/${id}`, data, signal);
}

export function deletePost(id: number, signal?: AbortSignal): Promise<void> {
  return apiDelete(`/api/posts/${id}`, signal);
}
