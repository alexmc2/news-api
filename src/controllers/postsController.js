import postsService from '../services/postsService.js';

async function listPosts(_req, res, next) {
  try {
    const posts = await postsService.listPosts();
    res.json(posts);
  } catch (error) {
    next(error);
  }
}

async function getPost(req, res, next) {
  try {
    const post = await postsService.getPostById(req.params.id);
    res.json(post);
  } catch (error) {
    next(error);
  }
}

async function createPost(req, res, next) {
  try {
    const post = await postsService.createPost(req.body ?? {});
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
}

async function updatePost(req, res, next) {
  try {
    const post = await postsService.updatePost(req.params.id, req.body ?? {});
    res.json(post);
  } catch (error) {
    next(error);
  }
}

async function deletePost(req, res, next) {
  try {
    await postsService.deletePost(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function getPostAuthors(req, res, next) {
  try {
    const authors = await postsService.getAuthorsByPostId(req.params.id);
    res.json(authors);
  } catch (error) {
    next(error);
  }
}

export default {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getPostAuthors,
};
