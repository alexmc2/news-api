import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import {
  ApiRequestError,
  getAuthors,
  getHealth,
  getPosts,
  getTags,
} from './api';
import type {
  PostsPagination,
  PostsQuery,
  PostsResponse,
  SortField,
  SortOrder,
} from './types';

type FilterDraft = {
  authorId: string;
  from: string;
  order: SortOrder;
  perPage: string;
  q: string;
  sort: SortField;
  to: string;
};

const DEFAULT_FILTERS: FilterDraft = {
  authorId: '',
  from: '',
  order: 'desc',
  perPage: '6',
  q: '',
  sort: 'published_at',
  to: '',
};

const EMPTY_PAGINATION: PostsPagination = {
  page: 1,
  per_page: Number(DEFAULT_FILTERS.perPage),
  total: 0,
  total_pages: 0,
};

const SORT_OPTIONS: Array<{ label: string; value: SortField }> = [
  { label: 'Newest publish date', value: 'published_at' },
  { label: 'Title', value: 'title' },
];

const ORDER_OPTIONS: Array<{ label: string; value: SortOrder }> = [
  { label: 'Descending', value: 'desc' },
  { label: 'Ascending', value: 'asc' },
];

const PER_PAGE_OPTIONS = [6, 10, 20, 40];

function toUserMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return `${error.status}: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected request error.';
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function clipBody(body: string, maxLength = 170): string {
  if (body.length <= maxLength) {
    return body;
  }

  return `${body.slice(0, maxLength).trimEnd()}...`;
}

function buildPostsQuery(filters: FilterDraft, page: number): PostsQuery {
  const authorId = Number(filters.authorId);
  const perPage = Number(filters.perPage);

  return {
    author_id:
      Number.isInteger(authorId) && authorId > 0 ? authorId : undefined,
    from: filters.from || undefined,
    order: filters.order,
    page,
    per_page:
      Number.isInteger(perPage) && perPage > 0
        ? perPage
        : Number(DEFAULT_FILTERS.perPage),
    q: filters.q.trim() || undefined,
    sort: filters.sort,
    to: filters.to || undefined,
  };
}

function statusLabel(value: boolean | null): string {
  if (value === null) {
    return 'Checking';
  }

  return value ? 'Connected' : 'Unavailable';
}

export default function App() {
  const [draftFilters, setDraftFilters] =
    useState<FilterDraft>(DEFAULT_FILTERS);
  const [activeFilters, setActiveFilters] =
    useState<FilterDraft>(DEFAULT_FILTERS);
  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState(1);

  const [healthStatus, setHealthStatus] = useState<boolean | null>(null);
  const [authorsCount, setAuthorsCount] = useState<number | null>(null);
  const [tagsCount, setTagsCount] = useState<number | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [postsResponse, setPostsResponse] = useState<PostsResponse | null>(
    null,
  );
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    async function loadMeta() {
      setMetaError(null);

      try {
        const health = await getHealth(controller.signal);

        if (!ignore) {
          setHealthStatus(health.ok === true);
        }
      } catch {
        if (!ignore) {
          setHealthStatus(false);
        }
      }

      try {
        const [authors, tags] = await Promise.all([
          getAuthors(controller.signal),
          getTags(controller.signal),
        ]);

        if (!ignore) {
          setAuthorsCount(authors.length);
          setTagsCount(tags.length);
        }
      } catch (error) {
        if (!ignore) {
          setMetaError(toUserMessage(error));
          setAuthorsCount(null);
          setTagsCount(null);
        }
      }
    }

    void loadMeta();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [refreshKey]);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    async function loadPosts() {
      setIsLoadingPosts(true);
      setPostsError(null);

      try {
        const response = await getPosts(
          buildPostsQuery(activeFilters, page),
          controller.signal,
        );

        if (!ignore) {
          setPostsResponse(response);
        }
      } catch (error) {
        if (ignore) {
          return;
        }

        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setPostsResponse(null);
        setPostsError(toUserMessage(error));
      } finally {
        if (!ignore) {
          setIsLoadingPosts(false);
        }
      }
    }

    void loadPosts();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [activeFilters, page, refreshKey]);

  const pagination = postsResponse?.pagination ?? EMPTY_PAGINATION;
  const posts = postsResponse?.data ?? [];
  const hasPrevious = pagination.page > 1;
  const hasNext =
    pagination.total_pages > 0 && pagination.page < pagination.total_pages;

  const resultsStart =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) * pagination.per_page + 1;
  const resultsEnd =
    pagination.total === 0
      ? 0
      : Math.min(pagination.page * pagination.per_page, pagination.total);

  const loadingCardCount = Math.min(Number(activeFilters.perPage) || 6, 8);

  function setDraftField<Key extends keyof FilterDraft>(
    key: Key,
    value: FilterDraft[Key],
  ) {
    setDraftFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setActiveFilters(draftFilters);
  }

  function resetFilters() {
    setPage(1);
    setDraftFilters(DEFAULT_FILTERS);
    setActiveFilters(DEFAULT_FILTERS);
  }

  function refreshData() {
    setRefreshKey((current) => current + 1);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        {/* <div className="soft-glow absolute -left-20 top-10 h-80 w-80 rounded-full bg-teal-300/40 blur-3xl" />
        <div className="soft-glow absolute right-0 top-0 h-80 w-80 rounded-full bg-amber-300/35 blur-3xl [animation-delay:1.8s]" />
        <div className="soft-glow absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-sky-300/35 blur-3xl [animation-delay:0.9s]" /> */}
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:py-12">
        <header className="reveal rounded-3xl border border-slate-900/10 bg-white/85 p-6 shadow-sm backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Guardian 2 API
          </p>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
                Guardian 2
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                Explore posts
              </p>
            </div>

            <button
              type="button"
              onClick={refreshData}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-teal-500 hover:text-teal-700"
            >
              Refresh Data
            </button>
          </div>
        </header>

        <section className="reveal reveal-delay-1 grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-900/10 bg-white/85 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Backend
            </p>
            <p
              className={`mt-2 text-2xl font-semibold ${
                healthStatus ? 'text-teal-700' : 'text-rose-700'
              }`}
            >
              {statusLabel(healthStatus)}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-900/10 bg-white/85 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Authors
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {authorsCount ?? '--'}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-900/10 bg-white/85 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Tags
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {tagsCount ?? '--'}
            </p>
          </article>
        </section>

        {metaError ? (
          <div className="reveal reveal-delay-1 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Metadata request failed: {metaError}
          </div>
        ) : null}

        <section className="reveal reveal-delay-1 rounded-3xl border border-slate-900/10 bg-white/85 p-5 shadow-sm sm:p-6">
          <h2 className="text-2xl font-semibold text-slate-900">
            Browse Posts
          </h2>

          <form
            onSubmit={applyFilters}
            className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <label className="text-sm font-medium text-slate-700 lg:col-span-2">
              Search (`q`)
              <input
                value={draftFilters.q}
                onChange={(event) => setDraftField('q', event.target.value)}
                placeholder="climate, mission, policy"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Author ID
              <input
                value={draftFilters.authorId}
                onChange={(event) =>
                  setDraftField('authorId', event.target.value)
                }
                inputMode="numeric"
                placeholder="1"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Results / page
              <select
                value={draftFilters.perPage}
                onChange={(event) =>
                  setDraftField('perPage', event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              >
                {PER_PAGE_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              From
              <input
                type="date"
                value={draftFilters.from}
                onChange={(event) => setDraftField('from', event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              To
              <input
                type="date"
                value={draftFilters.to}
                onChange={(event) => setDraftField('to', event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Sort
              <select
                value={draftFilters.sort}
                onChange={(event) =>
                  setDraftField('sort', event.target.value as SortField)
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Order
              <select
                value={draftFilters.order}
                onChange={(event) =>
                  setDraftField('order', event.target.value as SortOrder)
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              >
                {ORDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        <section className="reveal reveal-delay-2 rounded-3xl border border-slate-900/10 bg-white/85 p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-2xl font-semibold text-slate-900">
              Latest Posts
            </h2>
            <p className="text-sm text-slate-600">
              Showing {resultsStart}-{resultsEnd} of {pagination.total}
            </p>
          </div>

          {postsError ? (
            <div className="mt-4 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Post request failed: {postsError}
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {isLoadingPosts
              ? Array.from({ length: loadingCardCount }, (_, index) => (
                  <article
                    key={`skeleton-${index}`}
                    className="animate-pulse rounded-2xl border border-slate-200 bg-slate-100/70 p-5"
                  >
                    <div className="h-6 w-2/3 rounded bg-slate-200" />
                    <div className="mt-3 h-3 w-5/6 rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-4/6 rounded bg-slate-200" />
                    <div className="mt-5 h-3 w-1/3 rounded bg-slate-200" />
                  </article>
                ))
              : null}

            {!isLoadingPosts && posts.length === 0 ? (
              <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 sm:col-span-2">
                No posts match the current filter combination.
              </article>
            ) : null}

            {!isLoadingPosts
              ? posts.map((post) => (
                  <article
                    key={post.id}
                    className="group flex h-full flex-col rounded-2xl border border-slate-900/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-semibold tracking-wide text-slate-600">
                        Post #{post.id}
                      </span>
                      <time
                        dateTime={post.published_at}
                        className="text-xs font-medium text-slate-500"
                      >
                        {formatDate(post.published_at)}
                      </time>
                    </div>

                    <h3 className="mt-3 text-xl font-semibold text-slate-900 transition group-hover:text-teal-700">
                      {post.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-slate-700">
                      {post.summary || clipBody(post.body)}
                    </p>
                  </article>
                ))
              : null}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-600">
              Page {pagination.page} of {Math.max(pagination.total_pages, 1)}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={!hasPrevious || isLoadingPosts}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={!hasNext || isLoadingPosts}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
