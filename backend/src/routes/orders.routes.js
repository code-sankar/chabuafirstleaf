import express from 'express';
import {
  initiateCheckoutHandshake,
  verifySecurePaymentSettlement,
  getMyOrders,
  getOrderById,
  trackOrder,
  getAdminOrdersList,
  fetchAdminAnalyticsMatrix,
  modifyOrderStatusByAdmin,
  adminRefundOrder,
  getAdminCustomersList,
} from '../controllers/orders.controllers.js';
import { requireAuth, optionalAuth, requireAdmin } from '../middleware/auth.middleware.js';
import { checkoutLimiter, trackLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

/* ─── Storefront checkout (rate-limited, guest-friendly) ───────── */
router.post('/checkout/initiate', checkoutLimiter, optionalAuth, initiateCheckoutHandshake);
router.post('/checkout/verify', optionalAuth, verifySecurePaymentSettlement);

/* ─── Guest order tracking (rate-limited) ──────────────────────── */
router.post('/track', trackLimiter, trackOrder);

/* ─── Admin sub-router — every route here requires an admin ────
   Mounted before '/:id' to avoid path collision (/admin/list etc.
   would otherwise be caught by the param route). */
const adminRouter = express.Router();
adminRouter.use(requireAdmin);

adminRouter.get('/list', getAdminOrdersList);
adminRouter.get('/analytics', fetchAdminAnalyticsMatrix);
adminRouter.get('/customers', getAdminCustomersList);
adminRouter.patch('/orders/:orderId/status', modifyOrderStatusByAdmin);
adminRouter.post('/orders/:orderId/refund', adminRefundOrder);

router.use('/admin', adminRouter);

/* ─── Authenticated customer order history ──────────────────────── */
router.get('/me', requireAuth, getMyOrders);
router.get('/:id', requireAuth, getOrderById);

export default router;