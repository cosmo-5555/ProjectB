import mongoose from 'mongoose';

const labRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabTest',
      required: true,
    },
    priority: {
      type: String,
      enum: ['Normal', 'Urgent', 'STAT (Emergency)'],
      default: 'Normal',
    },
    status: {
      type: String,
      enum: ['Requested', 'Sample Collected', 'In Testing', 'Completed', 'Cancelled'],
      default: 'Requested',
    },
    sampleCollectionDate: {
      type: Date,
      default: null,
    },
    resultValue: {
      type: String,
      default: '',
    },
    remarks: {
      type: String,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    completedDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

labRequestSchema.index({ patient: 1, status: 1 });

export default mongoose.model('LabRequest', labRequestSchema);
