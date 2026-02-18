import { Router } from 'express';
import postsController from '../controllers/postsController.js';

const router = Router();

router.get('/', postsController.listPosts);
router.post('/', postsController.createPost);
router.get('/:id', postsController.getPost);
router.patch('/:id', postsController.updatePost);
router.delete('/:id', postsController.deletePost);

export default router;
