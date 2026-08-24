import express from 'express'; import { authorize, protect } from '../middleware/authMiddleware.js'; import { stats, users } from '../controllers/adminController.js';
const router = express.Router(); router.use(protect, authorize('admin')); router.get('/stats', stats); router.get('/users', users); export default router;
