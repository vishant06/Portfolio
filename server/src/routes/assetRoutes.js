import express from 'express';
import { getHomeImage, uploadHomeImage as uploadHomeImageController } from '../controllers/assetController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadHomeImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/home-image', getHomeImage);
router.post('/home-image', protect, uploadHomeImage.single('homeImage'), uploadHomeImageController);

export default router;
