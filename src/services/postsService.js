import AppError from '../errors/AppError.js';
import postsRepository from '../repositories/postsRepository.js';
import authorsRepository from '../repositories/authorsRepository.js';

async function listPosts() {
  return postsRepository.getAll();
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
