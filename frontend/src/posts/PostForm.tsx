import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import {
  ApiRequestError,
  createPost,
  getPost,
  updatePost,
} from '../api/client';
import type { Post } from '../api/types';

type Props = {
  postId?: number;
  onBack: () => void;
  onSaved: (post: Post) => void;
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

export default function PostForm({ postId, onBack, onSaved }: Props) {
  const isEditing = postId !== undefined;

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [authorIds, setAuthorIds] = useState('');

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing) return;

    let ignore = false;
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const post = await getPost(postId!, controller.signal);
        if (!ignore) {
          setTitle(post.title);
          setSummary(post.summary ?? '');
          setBody(post.body);
        }
      } catch (err) {
        if (
          !ignore &&
          !(err instanceof DOMException && err.name === 'AbortError')
        ) {
          setLoadError(toUserMessage(err));
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
  }, [isEditing, postId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      let saved: Post;

      if (isEditing) {
        saved = await updatePost(postId!, {
          title: title.trim(),
          summary: summary.trim() || undefined,
          body: body.trim(),
        });
      } else {
        const ids = authorIds
          .split(',')
          .map((s) => Number(s.trim()))
          .filter((n) => Number.isInteger(n) && n > 0);

        saved = await createPost({
          title: title.trim(),
          summary: summary.trim() || undefined,
          body: body.trim(),
          author_ids: ids,
        });
      }

      onSaved(saved);
    } catch (err) {
      setError(toUserMessage(err));
      setIsSaving(false);
    }
  }

  const inputClass =
    'mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
        >
          &larr; Back
        </button>
      </div>

      <section className="reveal rounded-3xl border border-slate-900/10 bg-white/85 p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold text-slate-900">
          {isEditing ? 'Edit Post' : 'New Post'}
        </h2>

        {loadError ? (
          <div className="mt-4 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {loadError}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-6 animate-pulse space-y-4">
            <div className="h-10 w-full rounded bg-slate-200" />
            <div className="h-10 w-full rounded bg-slate-200" />
            <div className="h-32 w-full rounded bg-slate-200" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
            <label className="text-sm font-medium text-slate-700">
              Title *
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Post title"
                className={inputClass}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Summary
              <input
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="A brief summary (optional)"
                className={inputClass}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Body *
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={8}
                placeholder="Full article text"
                className={inputClass + ' resize-y'}
              />
            </label>

            {!isEditing ? (
              <label className="text-sm font-medium text-slate-700">
                Author IDs *
                <input
                  value={authorIds}
                  onChange={(e) => setAuthorIds(e.target.value)}
                  required
                  placeholder="1, 2"
                  className={inputClass}
                />
                <span className="mt-1 block text-xs text-slate-500">
                  Comma-separated list of author IDs
                </span>
              </label>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {isSaving
                  ? 'Saving...'
                  : isEditing
                    ? 'Update Post'
                    : 'Create Post'}
              </button>
              <button
                type="button"
                onClick={onBack}
                disabled={isSaving}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
