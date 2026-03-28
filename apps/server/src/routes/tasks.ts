import { Router } from 'express';
import { createTask, getTasks, updateTaskStatus } from '../controllers/tasksController';

const router = Router();

router.post('/', createTask);
router.get('/', getTasks);
router.patch('/:id', updateTaskStatus);

export default router;
