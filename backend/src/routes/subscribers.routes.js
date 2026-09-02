import express from 'express';
import { handleNewWaitlistSubscription, listSubscribers, removeSubscriber } from '../controllers/subscriber.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/subscribe', handleNewWaitlistSubscription);
router.get('/', requireAdmin, listSubscribers);       // GET /api/subscribers (admin-only)
router.delete('/:id', requireAdmin, removeSubscriber); // admin removal

export default router;