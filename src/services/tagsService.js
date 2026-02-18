import AppError from '../errors/AppError.js';
import tagsRepository from '../repositories/tagsRepository.js';
import postsRepository from '../repositories/postsRepository.js';

async function listTags() {
  return tagsRepository.getAll();
}

async function getTagsByPostId(postId) {
  const parsed = Number(postId);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new AppError(400, 'Invalid post id.');
  }

  const post = await postsRepository.getById(parsed);
  if (!post) {
    throw new AppError(404, 'Post not found.');
  }

  return tagsRepository.getByPostId(parsed);
}

async function getPostsByTagId(tagId) {
  const parsed = Number(tagId);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new AppError(400, 'Invalid tag id.');
  }

  const tag = await tagsRepository.getById(parsed);
  if (!tag) {
    throw new AppError(404, 'Tag not found.');
  }

  return tagsRepository.getPostsByTagId(parsed);
}

export default { listTags, getTagsByPostId, getPostsByTagId };
