import express from 'express';
import { getAdminOverview } from '../controllers/admin.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/overview', requireAdmin, getAdminOverview);

export default router;