import express from 'express';
import {
  getLabTests,
  createLabTest,
  getLabRequests,
  createLabRequest,
  updateLabRequest,
} from '../controllers/labController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/tests')
  .get(getLabTests)
  .post(authorize('admin', 'lab_staff'), createLabTest);

router.route('/requests')
  .get(getLabRequests)
  .post(authorize('admin', 'doctor'), createLabRequest);

router.route('/requests/:id')
  .patch(authorize('admin', 'lab_staff'), updateLabRequest);

export default router;
