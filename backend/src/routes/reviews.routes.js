import express from 'express';
import {
  getMyReviewForProduct,
  updateMyReview,
  deleteReview,
  listReviewsForAdmin,
  setReviewStatus,
} from '../controllers/reviews.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

/* ─── Admin moderation sub-router ───────────────────────────────
   Mounted before '/:id' so /admin/list is not swallowed by the
   param routes below. */
const adminRouter = express.Router();
adminRouter.use(requireAdmin);

adminRouter.get('/list', listReviewsForAdmin);
adminRouter.patch('/:id/status', setReviewStatus);

router.use('/admin', adminRouter);

/* ─── Patron's own review ───────────────────────────────────────
   Reading and writing a review always requires a signed-in patron;
   public listing lives on /api/products/:slug/reviews. */
router.get('/mine', requireAuth, getMyReviewForProduct);
router.patch('/:id', requireAuth, updateMyReview);
router.delete('/:id', requireAuth, deleteReview);

export default router;
