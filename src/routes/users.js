
import { Router } from 'express';

import usersController from '../controllers/usersController.js';


const router = Router();


router.get('/', usersController.listUsers);
router.post('/', usersController.createUser);

export default router;

