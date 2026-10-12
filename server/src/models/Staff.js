import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    department: {
      type: String,
      required: true,
      enum: ['Administration', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Pharmacy', 'Laboratory', 'Billing', 'General Medicine', 'Emergency'],
    },
    designation: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
      default: '',
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    salary: {
      type: Number,
      default: 0,
    },
    shift: {
      type: String,
      enum: ['Morning', 'Evening', 'Night', 'Rotational'],
      default: 'Morning',
    },
    emergencyContact: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Staff', staffSchema);
