import mongoose from 'mongoose';

const labTestSchema = new mongoose.Schema(
  {
    testCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    testName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Hematology', 'Biochemistry', 'Microbiology', 'Pathology', 'Radiology', 'Immunology', 'Urine Analysis'],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    sampleType: {
      type: String,
      default: 'Blood', // Blood, Urine, Saliva, Tissue, Swab
    },
    turnaroundHours: {
      type: Number,
      default: 24,
    },
    referenceRange: {
      type: String,
      default: '',
    },
    unit: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('LabTest', labTestSchema);
