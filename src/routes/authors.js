import { Router } from 'express';
import authorsController from '../controllers/authorsController.js';

const router = Router();

router.get('/', authorsController.listAuthors);
router.post('/', authorsController.createAuthor);
router.get('/:id', authorsController.getAuthor);
router.get('/:id/posts', authorsController.getAuthorPosts);

export default router;
