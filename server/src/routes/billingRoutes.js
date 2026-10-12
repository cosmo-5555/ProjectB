import express from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  recordPayment,
} from '../controllers/billingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getInvoices)
  .post(authorize('admin', 'billing_staff'), createInvoice);

router.route('/:id')
  .get(getInvoiceById);

router.post('/:id/payment', authorize('admin', 'billing_staff'), recordPayment);

export default router;
