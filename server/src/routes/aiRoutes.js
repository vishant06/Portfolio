import express from 'express'; import rateLimit from 'express-rate-limit'; import { protect } from '../middleware/authMiddleware.js'; import { chat } from '../controllers/aiController.js';
const router = express.Router(); router.post('/chat', protect, rateLimit({ windowMs: 60_000, limit: 15, message: { message: 'Too many AI requests. Please try again shortly.' } }), chat); export default router;
