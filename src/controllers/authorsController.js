import authorsService from '../services/authorsService.js';
import postsService from '../services/postsService.js';

async function listAuthors(_req, res, next) {
  try {
    const authors = await authorsService.listAuthors();
    res.json(authors);
  } catch (error) {
    next(error);
  }
}

async function getAuthor(req, res, next) {
  try {
    const author = await authorsService.getAuthorById(req.params.id);
    res.json(author);
  } catch (error) {
    next(error);
  }
}

async function createAuthor(req, res, next) {
  try {
    const author = await authorsService.createAuthor(req.body ?? {});
    res.status(201).json(author);
  } catch (error) {
    next(error);
  }
}

async function getAuthorPosts(req, res, next) {
  try {
    await authorsService.getAuthorById(req.params.id);
    const posts = await postsService.getPostsByAuthorId(req.params.id);
    res.json(posts);
  } catch (error) {
    next(error);
  }
}

export default { listAuthors, getAuthor, createAuthor, getAuthorPosts };
