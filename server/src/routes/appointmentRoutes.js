import express from 'express';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  rescheduleAppointment,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAppointments)
  .post(authorize('admin', 'receptionist', 'doctor', 'patient'), createAppointment);

router.route('/:id')
  .get(getAppointmentById);

router.patch('/:id/status', authorize('admin', 'receptionist', 'doctor', 'patient'), updateAppointmentStatus);
router.put('/:id/reschedule', authorize('admin', 'receptionist', 'doctor'), rescheduleAppointment);

export default router;
