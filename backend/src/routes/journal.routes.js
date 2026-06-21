import express from 'express';
import { getAllPosts, getPostBySlug } from '../controllers/journal.controller.js';

const router = express.Router();

router.get('/', getAllPosts);
router.get('/:slug', getPostBySlug);

export default router;