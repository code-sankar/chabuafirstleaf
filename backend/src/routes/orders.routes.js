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
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js';
import { checkoutLimiter, trackLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

/* ─── Storefront checkout (rate-limited, guest-friendly) ───────── */
router.post('/checkout/initiate', checkoutLimiter, optionalAuth, initiateCheckoutHandshake);
router.post('/checkout/verify', optionalAuth, verifySecurePaymentSettlement);

/* ─── Guest order tracking (rate-limited) ──────────────────────── */
router.post('/track', trackLimiter, trackOrder);

/* ─── Admin — registered before '/:id' to avoid path collision ─── */
router.get('/admin/list', getAdminOrdersList);
router.get('/admin/analytics', fetchAdminAnalyticsMatrix);
router.get('/admin/customers', getAdminCustomersList);
router.patch('/admin/orders/:orderId/status', modifyOrderStatusByAdmin);
router.post('/admin/orders/:orderId/refund', adminRefundOrder);

/* ─── Authenticated customer order history ──────────────────────── */
router.get('/me', requireAuth, getMyOrders);
router.get('/:id', requireAuth, getOrderById);

export default router;