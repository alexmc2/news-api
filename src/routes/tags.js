import { Router } from 'express';
import tagsController from '../controllers/tagsController.js';

const router = Router();

router.get('/', tagsController.listTags);
router.get('/:id/posts', tagsController.getTagPosts);

export default router;
