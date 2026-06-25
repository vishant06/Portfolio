import express from 'express';
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadProjectImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', protect, uploadProjectImage.single('image'), createProject);
router.put('/:id', protect, uploadProjectImage.single('image'), updateProject);
router.delete('/:id', protect, deleteProject);

export default router;
