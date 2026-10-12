import express from 'express';
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.route('/')
  .get(getPatients)
  .post(authorize('admin', 'receptionist', 'doctor'), createPatient);

router.route('/:id')
  .get(getPatientById)
  .put(authorize('admin', 'receptionist', 'doctor'), updatePatient)
  .delete(authorize('admin'), deletePatient);

export default router;
