import express from 'express';
import { handleRazorpayWebhook } from '../controllers/webhooks.controller.js';

const router = express.Router();

/* POST /api/webhooks/razorpay
   The raw-body parser is mounted in server.js BEFORE express.json(), so
   req.body here is a Buffer (required for HMAC signature verification). */
router.post('/razorpay', handleRazorpayWebhook);

export default router;