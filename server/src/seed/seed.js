import mongoose from 'mongoose';
import User from '../models/User.js';
import Staff from '../models/Staff.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Invoice from '../models/Invoice.js';
import Medicine from '../models/Medicine.js';
import LabTest from '../models/LabTest.js';
import LabRequest from '../models/LabRequest.js';
import AuditLog from '../models/AuditLog.js';

export const seedDatabaseIfEmpty = async () => {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log(`ℹ️ Database already populated with ${userCount} users. Skipping seeding.`);
    return;
  }

  console.log('🌱 Seeding initial Hospital Management System data...');

  try {
    // 1. Create Users
    const adminUser = await User.create({
      name: 'Dr. Arthur Vance (Chief Admin)',
      email: 'admin@hospital.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+1 555-0100',
    });

    const doc1User = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'doctor.sarah@hospital.com',
      password: 'Doctor@123',
      role: 'doctor',
      phone: '+1 555-0101',
    });

    const doc2User = await User.create({
      name: 'Dr. James Chen',
      email: 'doctor.james@hospital.com',
      password: 'Doctor@123',
      role: 'doctor',
      phone: '+1 555-0102',
    });

    const doc3User = await User.create({
      name: 'Dr. Elena Rostova',
      email: 'doctor.elena@hospital.com',
      password: 'Doctor@123',
      role: 'doctor',
      phone: '+1 555-0103',
    });

    const receptionistUser = await User.create({
      name: 'Clara Oswald',
      email: 'reception@hospital.com',
      password: 'Staff@123',
      role: 'receptionist',
      phone: '+1 555-0104',
    });

    const pharmacistUser = await User.create({
      name: 'Marcus Brody',
      email: 'pharmacist@hospital.com',
      password: 'Staff@123',
      role: 'pharmacist',
      phone: '+1 555-0105',
    });

    const labUser = await User.create({
      name: 'Diana Prince',
      email: 'lab@hospital.com',
      password: 'Staff@123',
      role: 'lab_staff',
      phone: '+1 555-0106',
    });

    const billingUser = await User.create({
      name: 'Harvey Dent',
      email: 'billing@hospital.com',
      password: 'Staff@123',
      role: 'billing_staff',
      phone: '+1 555-0107',
    });

    // 2. Create Staff profiles
    await Staff.create([
      {
        user: receptionistUser._id,
        employeeId: 'EMP-0001',
        department: 'Administration',
        designation: 'Senior Front Desk Officer',
        salary: 45000,
        shift: 'Morning',
      },
      {
        user: pharmacistUser._id,
        employeeId: 'EMP-0002',
        department: 'Pharmacy',
        designation: 'Chief Pharmacist',
        salary: 62000,
        shift: 'Morning',
      },
      {
        user: labUser._id,
        employeeId: 'EMP-0003',
        department: 'Laboratory',
        designation: 'Lead Laboratory Technologist',
        salary: 58000,
        shift: 'Morning',
      },
      {
        user: billingUser._id,
        employeeId: 'EMP-0004',
        department: 'Billing',
        designation: 'Financial Officer',
        salary: 55000,
        shift: 'Morning',
      },
    ]);

    // 3. Create Doctor profiles
    const doc1 = await Doctor.create({
      user: doc1User._id,
      doctorCode: 'DOC-001',
      specialization: 'Cardiology',
      licenseNumber: 'MD-CARD-8832',
      experienceYears: 12,
      consultationFee: 150,
      roomNumber: 'OPD-102',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: { start: '09:00', end: '16:00' },
      bio: 'Board-certified cardiologist specializing in preventative care, echocardiography, and hypertension management.',
    });

    const doc2 = await Doctor.create({
      user: doc2User._id,
      doctorCode: 'DOC-002',
      specialization: 'Neurology',
      licenseNumber: 'MD-NEUR-4491',
      experienceYears: 15,
      consultationFee: 180,
      roomNumber: 'OPD-205',
      availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: { start: '10:00', end: '17:00' },
      bio: 'Expert in clinical neurology, migraine management, EEG analysis, and neurodegenerative disorders.',
    });

    const doc3 = await Doctor.create({
      user: doc3User._id,
      doctorCode: 'DOC-003',
      specialization: 'Pediatrics',
      licenseNumber: 'MD-PED-6712',
      experienceYears: 9,
      consultationFee: 120,
      roomNumber: 'OPD-108',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'],
      workingHours: { start: '08:30', end: '15:30' },
      bio: 'Compassionate pediatrician focusing on developmental milestones, adolescent health, and immunizations.',
    });

    // 4. Create Patients
    const patient1 = await Patient.create({
      patientId: 'PAT-2026-0001',
      firstName: 'Robert',
      lastName: 'Taylor',
      dob: new Date('1984-06-15'),
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+1 555-0211',
      email: 'robert.taylor@example.com',
      address: { street: '742 Evergreen Terrace', city: 'Metroville', state: 'CA', zipCode: '90210' },
      emergencyContact: { name: 'Mary Taylor', relation: 'Spouse', phone: '+1 555-0212' },
      allergies: ['Penicillin'],
      chronicConditions: ['Hypertension'],
      registeredBy: receptionistUser._id,
    });

    const patient2 = await Patient.create({
      patientId: 'PAT-2026-0002',
      firstName: 'Emily',
      lastName: 'Watson',
      dob: new Date('1992-11-20'),
      gender: 'Female',
      bloodGroup: 'A+',
      phone: '+1 555-0213',
      email: 'emily.watson@example.com',
      address: { street: '124 Conch Street', city: 'Pacific City', state: 'CA', zipCode: '90401' },
      emergencyContact: { name: 'David Watson', relation: 'Father', phone: '+1 555-0214' },
      allergies: ['Sulfa drugs'],
      chronicConditions: ['Asthma'],
      registeredBy: receptionistUser._id,
    });

    const patient3 = await Patient.create({
      patientId: 'PAT-2026-0003',
      firstName: 'Sophia',
      lastName: 'Martinez',
      dob: new Date('2018-04-10'),
      gender: 'Female',
      bloodGroup: 'B+',
      phone: '+1 555-0215',
      email: 'luis.martinez@example.com',
      address: { street: '89 Maple Road', city: 'Sun Valley', state: 'CA', zipCode: '91352' },
      emergencyContact: { name: 'Luis Martinez', relation: 'Parent', phone: '+1 555-0215' },
      allergies: ['Peanuts'],
      chronicConditions: [],
      registeredBy: receptionistUser._id,
    });

    const patient4 = await Patient.create({
      patientId: 'PAT-2026-0004',
      firstName: 'Michael',
      lastName: 'Chang',
      dob: new Date('1968-08-03'),
      gender: 'Male',
      bloodGroup: 'AB-',
      phone: '+1 555-0216',
      email: 'michael.chang@example.com',
      address: { street: '302 Birch Lane', city: 'Fremont', state: 'CA', zipCode: '94536' },
      emergencyContact: { name: 'Linda Chang', relation: 'Spouse', phone: '+1 555-0217' },
      allergies: [],
      chronicConditions: ['Type 2 Diabetes'],
      registeredBy: receptionistUser._id,
    });

    // 5. Create Appointments
    const today = new Date();
    const apt1 = await Appointment.create({
      appointmentNumber: 'APT-2026-0001',
      patient: patient1._id,
      doctor: doc1._id,
      appointmentDate: today,
      timeSlot: '09:30 AM',
      type: 'General Consultation',
      status: 'Completed',
      reasonForVisit: 'Routine cardiac health review and blood pressure evaluation',
      notes: 'Patient reported occasional lightheadedness.',
      bookedBy: receptionistUser._id,
    });

    const apt2 = await Appointment.create({
      appointmentNumber: 'APT-2026-0002',
      patient: patient2._id,
      doctor: doc2._id,
      appointmentDate: today,
      timeSlot: '11:00 AM',
      type: 'Follow-up',
      status: 'Confirmed',
      reasonForVisit: 'Persistent migraine headaches for past 2 weeks',
      notes: 'Refers to prior brain MRI from outside facility.',
      bookedBy: receptionistUser._id,
    });

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const apt3 = await Appointment.create({
      appointmentNumber: 'APT-2026-0003',
      patient: patient3._id,
      doctor: doc3._id,
      appointmentDate: tomorrow,
      timeSlot: '10:00 AM',
      type: 'Routine Checkup',
      status: 'Scheduled',
      reasonForVisit: 'Annual pediatric developmental wellness check',
      notes: 'Due for booster immunizations.',
      bookedBy: receptionistUser._id,
    });

    const apt4 = await Appointment.create({
      appointmentNumber: 'APT-2026-0004',
      patient: patient4._id,
      doctor: doc1._id,
      appointmentDate: tomorrow,
      timeSlot: '02:00 PM',
      type: 'Follow-up',
      status: 'Scheduled',
      reasonForVisit: 'Post-diabetic medication adjustment consultation',
      bookedBy: receptionistUser._id,
    });

    // 6. Create Medical Record (EMR)
    await MedicalRecord.create({
      recordNumber: 'EMR-2026-0001',
      patient: patient1._id,
      doctor: doc1._id,
      appointment: apt1._id,
      vitals: {
        bloodPressure: '138/88 mmHg',
        heartRate: 74,
        temperature: 98.6,
        oxygenSaturation: 99,
        weightKg: 82,
        heightCm: 178,
        bmi: 25.9,
      },
      chiefComplaints: ['Occasional morning dizziness', 'Elevated home BP readings'],
      diagnosis: ['Primary Essential Hypertension (Stage 1)'],
      clinicalNotes: 'Cardiac exam shows normal S1/S2 rhythm, no murmurs. Mildly elevated systolic blood pressure. ECG normal sinus rhythm.',
      treatmentPlan: 'Initiate low-dose ACE inhibitor, recommend sodium reduction and moderate aerobic exercise 30m daily. Repeat lab panel in 4 weeks.',
      prescriptions: [
        {
          medicineName: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily in the morning',
          duration: '30 days',
          instructions: 'Take with plenty of water. Monitor BP weekly.',
        },
        {
          medicineName: 'Amlodipine',
          dosage: '5mg',
          frequency: 'Once daily at bedtime',
          duration: '30 days',
          instructions: 'Take consistently at night.',
        },
      ],
      followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // 7. Create Pharmacy Medicines Catalog
    const futureDate1 = new Date('2027-08-30');
    const futureDate2 = new Date('2027-12-15');
    const futureDate3 = new Date('2026-11-20'); // Expiring relatively soon

    await Medicine.create([
      {
        code: 'MED-0001',
        name: 'Amoxicillin Trihydrate',
        genericName: 'Amoxicillin',
        category: 'Antibiotic',
        dosageForm: 'Capsule',
        strength: '500mg',
        manufacturer: 'Pfizer Inc.',
        batchNumber: 'AMX-2024-99',
        unitPrice: 12.5,
        stockQuantity: 450,
        reorderLevel: 50,
        expiryDate: futureDate1,
        locationRack: 'A-01',
      },
      {
        code: 'MED-0002',
        name: 'Lisinopril Potassium',
        genericName: 'Lisinopril',
        category: 'Antihypertensive',
        dosageForm: 'Tablet',
        strength: '10mg',
        manufacturer: 'Novartis',
        batchNumber: 'LSN-2025-01',
        unitPrice: 8.0,
        stockQuantity: 18, // LOW STOCK ALERT!
        reorderLevel: 25,
        expiryDate: futureDate2,
        locationRack: 'B-04',
      },
      {
        code: 'MED-0003',
        name: 'Metformin Hydrochloride',
        genericName: 'Metformin',
        category: 'Antidiabetic',
        dosageForm: 'Tablet',
        strength: '500mg',
        manufacturer: 'Merck & Co.',
        batchNumber: 'MET-2024-12',
        unitPrice: 6.25,
        stockQuantity: 320,
        reorderLevel: 40,
        expiryDate: futureDate1,
        locationRack: 'C-02',
      },
      {
        code: 'MED-0004',
        name: 'Paracetamol Extra',
        genericName: 'Acetaminophen',
        category: 'Analgesic',
        dosageForm: 'Tablet',
        strength: '650mg',
        manufacturer: 'GSK Pharma',
        batchNumber: 'PCM-2024-88',
        unitPrice: 3.5,
        stockQuantity: 600,
        reorderLevel: 100,
        expiryDate: futureDate1,
        locationRack: 'A-05',
      },
      {
        code: 'MED-0005',
        name: 'Azithromycin Dihydrate',
        genericName: 'Azithromycin',
        category: 'Antibiotic',
        dosageForm: 'Tablet',
        strength: '250mg',
        manufacturer: 'Sun Pharma',
        batchNumber: 'AZT-2024-41',
        unitPrice: 18.0,
        stockQuantity: 12, // LOW STOCK & EXPIRING SOON
        reorderLevel: 30,
        expiryDate: futureDate3,
        locationRack: 'D-01',
      },
    ]);

    // 8. Create Lab Tests Catalog
    const cbcTest = await LabTest.create({
      testCode: 'TST-001',
      testName: 'Complete Blood Count (CBC)',
      category: 'Hematology',
      price: 45,
      sampleType: 'Blood',
      turnaroundHours: 12,
      referenceRange: 'WBC: 4.5-11.0, RBC: 4.3-5.9',
      unit: 'cells/mcL',
      description: 'Comprehensive evaluation of cellular blood elements including hemoglobin, leukocytes, and platelets.',
    });

    const lipidTest = await LabTest.create({
      testCode: 'TST-002',
      testName: 'Lipid Panel Profile',
      category: 'Biochemistry',
      price: 65,
      sampleType: 'Blood',
      turnaroundHours: 24,
      referenceRange: 'Cholesterol: <200 mg/dL, HDL: >40 mg/dL, LDL: <100 mg/dL',
      unit: 'mg/dL',
      description: 'Measures total cholesterol, LDL, HDL, and triglycerides.',
    });

    const glucoseTest = await LabTest.create({
      testCode: 'TST-003',
      testName: 'Fasting Blood Glucose',
      category: 'Biochemistry',
      price: 25,
      sampleType: 'Blood',
      turnaroundHours: 6,
      referenceRange: '70-99 mg/dL',
      unit: 'mg/dL',
      description: 'Diagnostic screen for diabetes and insulin resistance.',
    });

    await LabTest.create({
      testCode: 'TST-004',
      testName: 'Chest X-Ray (PA View)',
      category: 'Radiology',
      price: 110,
      sampleType: 'Imaging',
      turnaroundHours: 4,
      referenceRange: 'Clear lung fields, normal cardiothoracic ratio',
      unit: 'visual',
      description: 'Diagnostic projection radiograph of the chest.',
    });

    // 9. Create Lab Requests
    await LabRequest.create({
      requestNumber: 'LAB-2026-0001',
      patient: patient1._id,
      doctor: doc1._id,
      test: lipidTest._id,
      priority: 'Normal',
      status: 'Completed',
      sampleCollectionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      resultValue: 'Total Cholesterol: 215 mg/dL, HDL: 44 mg/dL, LDL: 138 mg/dL (Borderline High)',
      remarks: 'Recommend dietary management and repeat panel in 3 months.',
      performedBy: labUser._id,
      completedDate: new Date(),
    });

    await LabRequest.create({
      requestNumber: 'LAB-2026-0002',
      patient: patient4._id,
      doctor: doc1._id,
      test: glucoseTest._id,
      priority: 'Urgent',
      status: 'Sample Collected',
      sampleCollectionDate: new Date(),
      remarks: 'Fasting 10 hours confirmed.',
    });

    // 10. Create Invoices (Billing)
    const inv1 = await Invoice.create({
      invoiceNumber: 'INV-2026-0001',
      patient: patient1._id,
      appointment: apt1._id,
      items: [
        {
          description: 'Specialist Consultation - Cardiology (Dr. Sarah Jenkins)',
          category: 'Consultation',
          quantity: 1,
          unitPrice: 150,
          total: 150,
        },
        {
          description: 'Lipid Panel Profile Lab Diagnostic',
          category: 'Lab Test',
          quantity: 1,
          unitPrice: 65,
          total: 65,
        },
      ],
      subtotal: 215,
      taxAmount: 15,
      discountAmount: 0,
      totalAmount: 230,
      paidAmount: 230,
      balanceDue: 0,
      status: 'Paid',
      transactions: [
        {
          amount: 230,
          paymentMethod: 'Credit Card',
          transactionReference: 'TXN-VISA-992144',
          paidAt: new Date(),
          receivedBy: billingUser._id,
        },
      ],
      createdBy: billingUser._id,
      notes: 'Paid in full at checkout.',
    });

    await Invoice.create({
      invoiceNumber: 'INV-2026-0002',
      patient: patient4._id,
      appointment: null,
      items: [
        {
          description: 'Fasting Blood Glucose Lab Diagnostic',
          category: 'Lab Test',
          quantity: 1,
          unitPrice: 25,
          total: 25,
        },
        {
          description: 'Metformin Hydrochloride 500mg (60 Tablets)',
          category: 'Medication',
          quantity: 2,
          unitPrice: 6.25,
          total: 12.5,
        },
      ],
      subtotal: 37.5,
      taxAmount: 2.5,
      discountAmount: 0,
      totalAmount: 40.0,
      paidAmount: 20.0,
      balanceDue: 20.0,
      status: 'Partially Paid',
      transactions: [
        {
          amount: 20.0,
          paymentMethod: 'Cash',
          transactionReference: 'CASH-REC-001',
          paidAt: new Date(),
          receivedBy: billingUser._id,
        },
      ],
      createdBy: billingUser._id,
      notes: 'Initial copay received; balance pending insurance adjudication.',
    });

    // 11. Create Audit Logs
    await AuditLog.create([
      {
        action: 'CREATE',
        entity: 'System',
        entityId: 'INIT',
        userName: 'System Setup',
        userRole: 'admin',
        details: { message: 'Hospital database initialized with operational schema & demo credentials' },
      },
      {
        action: 'LOGIN',
        entity: 'Auth',
        entityId: String(adminUser._id),
        userName: adminUser.name,
        userRole: adminUser.role,
        details: { email: adminUser.email },
      },
      {
        action: 'PAYMENT',
        entity: 'Invoice',
        entityId: String(inv1._id),
        userName: billingUser.name,
        userRole: billingUser.role,
        details: { invoiceNumber: inv1.invoiceNumber, amount: 230, method: 'Credit Card' },
      },
    ]);

    console.log('✅ Hospital Management System data seeded successfully!');
    console.log('----------------------------------------------------');
    console.log('Default Accounts:');
    console.log('Admin:        admin@hospital.com         / Admin@123');
    console.log('Doctor:       doctor.sarah@hospital.com  / Doctor@123');
    console.log('Receptionist: reception@hospital.com     / Staff@123');
    console.log('Pharmacist:   pharmacist@hospital.com    / Staff@123');
    console.log('Lab Staff:    lab@hospital.com           / Staff@123');
    console.log('Billing:      billing@hospital.com       / Staff@123');
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('❌ Error seeding data:', err);
  }
};
