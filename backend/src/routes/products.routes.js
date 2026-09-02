import express from 'express';
import { getAllProducts, getProductBySlug, updateProduct } from '../controllers/product.controller.js';
import { listProductReviews, createProductReview } from '../controllers/reviews.controller.js';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware.js';
import { reviewLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.get('/', getAllProducts);
router.patch('/:id', requireAdmin, updateProduct); // admin inventory edits

/* Ratings & reviews — reading is public, writing needs a signed-in patron */
router.get('/:slug/reviews', listProductReviews);
router.post('/:slug/reviews', reviewLimiter, requireAuth, createProductReview);

router.get('/:slug', getProductBySlug);            // keep last (param route)

export default router;