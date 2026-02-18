import tagsService from '../services/tagsService.js';

async function listTags(_req, res, next) {
  try {
    const tags = await tagsService.listTags();
    res.json(tags);
  } catch (error) {
    next(error);
  }
}

async function getPostTags(req, res, next) {
  try {
    const tags = await tagsService.getTagsByPostId(req.params.id);
    res.json(tags);
  } catch (error) {
    next(error);
  }
}

async function getTagPosts(req, res, next) {
  try {
    const posts = await tagsService.getPostsByTagId(req.params.id);
    res.json(posts);
  } catch (error) {
    next(error);
  }
}

export default { listTags, getPostTags, getTagPosts };
