import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/addresses.controller.js';

const router = express.Router();

// Every address route requires a signed-in customer
router.use(requireAuth);

router.get('/', listAddresses);
router.post('/', createAddress);
router.patch('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.post('/:id/default', setDefaultAddress);

export default router;