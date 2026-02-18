import { Router } from 'express';
import postsController from '../controllers/postsController.js';
import tagsController from '../controllers/tagsController.js';

const router = Router();

router.get('/', postsController.listPosts);
router.post('/', postsController.createPost);
router.get('/:id', postsController.getPost);
router.patch('/:id', postsController.updatePost);
router.delete('/:id', postsController.deletePost);
router.get('/:id/tags', tagsController.getPostTags);
router.get('/:id/authors', postsController.getPostAuthors);

export default router;
