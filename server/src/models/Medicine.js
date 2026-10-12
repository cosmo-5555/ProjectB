import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    genericName: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Antibiotic', 'Analgesic', 'Antihypertensive', 'Antidiabetic', 'Antacid', 'Antihistamine', 'Vitamin/Supplement', 'Cardiac', 'Topical', 'Other'],
      default: 'Other',
    },
    dosageForm: {
      type: String,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Inhaler'],
      default: 'Tablet',
    },
    strength: {
      type: String,
      default: '500mg',
    },
    manufacturer: {
      type: String,
      default: '',
    },
    batchNumber: {
      type: String,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reorderLevel: {
      type: Number,
      default: 20,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    locationRack: {
      type: String,
      default: 'A-1',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

medicineSchema.index({ name: 'text', genericName: 'text', code: 'text' });
medicineSchema.index({ expiryDate: 1 });
medicineSchema.index({ stockQuantity: 1 });

export default mongoose.model('Medicine', medicineSchema);
