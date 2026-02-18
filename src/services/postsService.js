import AppError from '../errors/AppError.js';
import postsRepository from '../repositories/postsRepository.js';
import authorsRepository from '../repositories/authorsRepository.js';

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 20;
const MAX_PER_PAGE = 100;

async function listPosts(query = {}) {
  const filters = {};

  if (query.author_id !== undefined) {
    const id = Number(query.author_id);
    if (!Number.isInteger(id) || id < 1) {
      throw new AppError(400, 'Invalid author_id parameter.');
    }
    filters.author_id = id;
  }

  if (query.from !== undefined) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(query.from)) {
      throw new AppError(400, 'Invalid "from" date parameter. Use YYYY-MM-DD.');
    }
    const d = new Date(query.from);
    if (isNaN(d.getTime())) {
      throw new AppError(400, 'Invalid "from" date parameter. Use YYYY-MM-DD.');
    }
    filters.from = d.toISOString();
  }

  if (query.to !== undefined) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(query.to)) {
      throw new AppError(400, 'Invalid "to" date parameter. Use YYYY-MM-DD.');
    }
    const d = new Date(query.to);
    if (isNaN(d.getTime())) {
      throw new AppError(400, 'Invalid "to" date parameter. Use YYYY-MM-DD.');
    }
    // Use end-of-day so the "to" date is fully inclusive
    d.setUTCHours(23, 59, 59, 999);
    filters.to = d.toISOString();
  }

  if (query.q !== undefined) {
    if (typeof query.q !== 'string' || query.q.trim() === '') {
      throw new AppError(400, 'Search query "q" must be a non-empty string.');
    }
    filters.q = query.q.trim();
  }

  const allowedSorts = ['published_at', 'title'];
  if (query.sort !== undefined && !allowedSorts.includes(query.sort)) {
    throw new AppError(
      400,
      `Invalid sort parameter. Allowed: ${allowedSorts.join(', ')}`,
    );
  }
  filters.sort = query.sort || 'published_at';

  const allowedOrders = ['asc', 'desc'];
  if (query.order !== undefined && !allowedOrders.includes(query.order)) {
    throw new AppError(400, 'Invalid order parameter. Allowed: asc, desc');
  }
  filters.order = query.order || 'desc';

  const page = query.page !== undefined ? Number(query.page) : DEFAULT_PAGE;
  if (!Number.isInteger(page) || page < 1) {
    throw new AppError(400, 'page must be a positive integer.');
  }
  filters.page = page;

  const perPage =
    query.per_page !== undefined ? Number(query.per_page) : DEFAULT_PER_PAGE;
  if (!Number.isInteger(perPage) || perPage < 1 || perPage > MAX_PER_PAGE) {
    throw new AppError(
      400,
      `per_page must be an integer between 1 and ${MAX_PER_PAGE}.`,
    );
  }
  filters.per_page = perPage;

  const { rows, total } = await postsRepository.getAll(filters);

  const totalPages = total === 0 ? 0 : Math.ceil(total / perPage);

  return {
    data: rows,
    pagination: {
      page,
      per_page: perPage,
      total,
      total_pages: totalPages,
    },
  };
}

async function getPostById(id) {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new AppError(400, 'Invalid post id.');
  }

  const post = await postsRepository.getById(parsed);
  if (!post) {
    throw new AppError(404, 'Post not found.');
  }

  return post;
}

async function getPostsByAuthorId(authorId) {
  const parsed = Number(authorId);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new AppError(400, 'Invalid author id.');
  }
  return postsRepository.getByAuthorId(parsed);
}

async function createPost(payload) {
  const { author_ids, title, summary, body } = payload;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new AppError(422, '"title" is required.');
  }
  if (!body || typeof body !== 'string' || body.trim() === '') {
    throw new AppError(422, '"body" is required.');
  }
  if (!Array.isArray(author_ids) || author_ids.length === 0) {
    throw new AppError(422, '"author_ids" must be a non-empty array.');
  }

  const parsed = author_ids.map(Number);
  for (const id of parsed) {
    if (!Number.isInteger(id) || id < 1) {
      throw new AppError(422, 'Each author_id must be a valid integer.');
    }
  }

  for (const id of parsed) {
    const author = await authorsRepository.getById(id);
    if (!author) {
      throw new AppError(422, `Author with id ${id} does not exist.`);
    }
  }

  return postsRepository.create({
    title: title.trim(),
    summary: typeof summary === 'string' ? summary.trim() : null,
    body: body.trim(),
    author_ids: parsed,
  });
}

const ALLOWED_FIELDS = ['title', 'summary', 'body'];

async function updatePost(id, payload) {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new AppError(400, 'Invalid post id.');
  }

  const existing = await postsRepository.getById(parsed);
  if (!existing) {
    throw new AppError(404, 'Post not found.');
  }

  const fields = {};
  for (const key of ALLOWED_FIELDS) {
    if (payload[key] !== undefined) {
      fields[key] =
        typeof payload[key] === 'string' ? payload[key].trim() : payload[key];
    }
  }

  if (Object.keys(fields).length === 0) {
    throw new AppError(422, 'No valid fields to update.');
  }

  if ('title' in fields && fields.title === '') {
    throw new AppError(422, '"title" cannot be empty.');
  }
  if ('body' in fields && fields.body === '') {
    throw new AppError(422, '"body" cannot be empty.');
  }

  return postsRepository.update(parsed, fields);
}

async function getAuthorsByPostId(postId) {
  const parsed = Number(postId);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new AppError(400, 'Invalid post id.');
  }

  const post = await postsRepository.getById(parsed);
  if (!post) {
    throw new AppError(404, 'Post not found.');
  }

  return postsRepository.getAuthorsByPostId(parsed);
}

async function deletePost(id) {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new AppError(400, 'Invalid post id.');
  }

  const deleted = await postsRepository.remove(parsed);
  if (!deleted) {
    throw new AppError(404, 'Post not found.');
  }
}

export default {
  listPosts,
  getPostById,
  getPostsByAuthorId,
  getAuthorsByPostId,
  createPost,
  updatePost,
  deletePost,
};
