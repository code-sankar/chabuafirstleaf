import express from 'express';
import { getAllProducts, getProductBySlug, updateProduct } from '../controllers/product.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getAllProducts);
router.patch('/:id', requireAdmin, updateProduct); // admin inventory edits
router.get('/:slug', getProductBySlug);            // keep last (param route)

export default router;