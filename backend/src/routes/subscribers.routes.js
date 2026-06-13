import express from 'express';
import { handleNewWaitlistSubscription } from '../controllers/subscriber.controller.js';

const router = express.Router();

// POST: /api/subscribers/subscribe
router.post('/subscribe', handleNewWaitlistSubscription);

export default router;