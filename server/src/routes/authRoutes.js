import express from 'express';
import { login, me, oauthCallback, signup, startOAuth } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.get('/me', protect, me);
router.get('/:provider', startOAuth);
router.get('/:provider/callback', oauthCallback);

export default router;
