import { useEffect, useState } from 'react';

import { ApiRequestError, deletePost, getPost } from '../api/client';
import type { Post } from '../api/types';

type Props = {
  postId: number;
  onBack: () => void;
  onEdit: (postId: number) => void;
  onDeleted: () => void;
};

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

export default function PostDetail({
  postId,
  onBack,
  onEdit,
  onDeleted,
}: Props) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getPost(postId, controller.signal);
        if (!ignore) {
          setPost(data);
        }
      } catch (err) {
        if (
          !ignore &&
          !(err instanceof DOMException && err.name === 'AbortError')
        ) {
          setError(toUserMessage(err));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [postId]);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deletePost(postId);
      onDeleted();
    } catch (err) {
      setError(toUserMessage(err));
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
        >
          &larr; Back to Posts
        </button>
      </div>

      {isLoading ? (
        <article className="animate-pulse rounded-3xl border border-slate-900/10 bg-white/85 p-6 shadow-sm sm:p-8">
          <div className="h-8 w-2/3 rounded bg-slate-200" />
          <div className="mt-4 h-4 w-1/4 rounded bg-slate-200" />
          <div className="mt-6 space-y-3">
            <div className="h-3 w-full rounded bg-slate-200" />
            <div className="h-3 w-5/6 rounded bg-slate-200" />
            <div className="h-3 w-4/6 rounded bg-slate-200" />
          </div>
        </article>
      ) : error ? (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : post ? (
        <article className="reveal rounded-3xl border border-slate-900/10 bg-white/85 p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600">
              Post #{post.id}
            </span>
            <time
              dateTime={post.published_at}
              className="text-sm font-medium text-slate-500"
            >
              {formatDate(post.published_at)}
            </time>
          </div>

          <h2 className="mt-4 text-3xl font-semibold text-slate-900">
            {post.title}
          </h2>

          {post.summary ? (
            <p className="mt-3 text-base italic text-slate-600">
              {post.summary}
            </p>
          ) : null}

          <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {post.body}
          </div>

          <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={() => onEdit(post.id)}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Edit Post
            </button>

            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Are you sure?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-400 hover:bg-rose-50"
              >
                Delete Post
              </button>
            )}
          </div>
        </article>
      ) : null}
    </div>
  );
}
