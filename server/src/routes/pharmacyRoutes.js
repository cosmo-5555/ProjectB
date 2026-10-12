import express from 'express';
import {
  getMedicines,
  createMedicine,
  updateMedicine,
  dispenseMedicine,
} from '../controllers/pharmacyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMedicines)
  .post(authorize('admin', 'pharmacist'), createMedicine);

router.route('/:id')
  .put(authorize('admin', 'pharmacist'), updateMedicine);

router.post('/:id/dispense', authorize('admin', 'pharmacist'), dispenseMedicine);

export default router;
