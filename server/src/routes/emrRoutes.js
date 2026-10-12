import express from 'express';
import {
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
} from '../controllers/emrController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMedicalRecords)
  .post(authorize('admin', 'doctor'), createMedicalRecord);

router.route('/:id')
  .get(getMedicalRecordById)
  .put(authorize('admin', 'doctor'), updateMedicalRecord);

export default router;
