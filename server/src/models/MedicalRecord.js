import mongoose from 'mongoose';

const prescriptionItemSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  dosage: { type: String, required: true }, // e.g. "500mg"
  frequency: { type: String, required: true }, // e.g. "Twice daily after food"
  duration: { type: String, required: true }, // e.g. "5 days"
  instructions: { type: String, default: '' },
});

const medicalRecordSchema = new mongoose.Schema(
  {
    recordNumber: {
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
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    vitals: {
      bloodPressure: { type: String, default: '' }, // e.g. "120/80 mmHg"
      heartRate: { type: Number, default: null }, // bpm
      temperature: { type: Number, default: null }, // Fahrenheit or Celsius
      respiratoryRate: { type: Number, default: null },
      oxygenSaturation: { type: Number, default: null }, // % SpO2
      weightKg: { type: Number, default: null },
      heightCm: { type: Number, default: null },
      bmi: { type: Number, default: null },
    },
    chiefComplaints: {
      type: [String],
      required: true,
    },
    diagnosis: {
      type: [String],
      required: true,
    },
    clinicalNotes: {
      type: String,
      default: '',
    },
    treatmentPlan: {
      type: String,
      default: '',
    },
    prescriptions: [prescriptionItemSchema],
    followUpDate: {
      type: Date,
      default: null,
    },
    attachments: [
      {
        title: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

medicalRecordSchema.index({ patient: 1, createdAt: -1 });

export default mongoose.model('MedicalRecord', medicalRecordSchema);
