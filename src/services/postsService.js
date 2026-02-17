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
  return postsRepository.getByAuthorId(Number(authorId));
}

async function createPost(payload) {
  const { author_id, title, summary, body } = payload;

  if (!title || typeof title !== 'string') {
    throw new AppError(422, '"title" is required.');
  }
  if (!body || typeof body !== 'string') {
    throw new AppError(422, '"body" is required.');
  }
  if (!author_id) {
    throw new AppError(422, '"author_id" is required.');
  }

  const author = await authorsRepository.getById(Number(author_id));
  if (!author) {
    throw new AppError(422, 'Author does not exist.');
  }

  return postsRepository.create({
    author_id: Number(author_id),
    title: title.trim(),
    summary: typeof summary === 'string' ? summary.trim() : null,
    body: body.trim(),
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

  return postsRepository.update(parsed, fields);
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
  createPost,
  updatePost,
  deletePost,
};
