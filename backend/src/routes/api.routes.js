import express from 'express';
import productRouter from './products.routes.js';
import orderRouter from './orders.routes.js';
import subscriberRouter from './subscribers.routes.js';
import journalRouter from './journal.routes.js';
import adminRouter from './admin.routes.js';
import addressRouter from './addresses.routes.js'; // ← new (Phase 3)

const router = express.Router();

// Mount individual collection systems
router.use('/products', productRouter);
router.use('/orders', orderRouter);
router.use('/subscribers', subscriberRouter);
router.use('/journal', journalRouter);
router.use('/admin', adminRouter);
router.use('/addresses', addressRouter); // ← new (Phase 3)

// Base system diagnostics response for verification
router.get('/health', (req, res) => {
  res.status(200).json({ status: "operational", timestamp: new Date() });
});

export default router;