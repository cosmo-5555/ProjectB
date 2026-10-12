import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, closeDB } from '../src/config/db.js';
import { seedDatabaseIfEmpty } from '../src/seed/seed.js';

jest.setTimeout(60000);

let adminToken = '';
let doctorToken = '';

beforeAll(async () => {
  process.env.USE_MEMORY_DB = 'true';
  process.env.JWT_SECRET = 'test_jwt_secret_xyz123';
  await connectDB();
  await seedDatabaseIfEmpty();
}, 60000);

afterAll(async () => {
  await closeDB();
});

describe('Hospital Management System - API Integration Tests', () => {
  // 1. Health check
  it('GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  // 2. Authentication Login
  it('POST /api/auth/login with valid admin credentials should return token and user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@hospital.com',
      password: 'Admin@123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('admin');
    expect(res.body.token).toBeDefined();
    adminToken = res.body.token;
  });

  it('POST /api/auth/login with doctor credentials should succeed', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'doctor.sarah@hospital.com',
      password: 'Doctor@123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.user.role).toBe('doctor');
    doctorToken = res.body.token;
  });

  it('POST /api/auth/login with invalid password should fail with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@hospital.com',
      password: 'WrongPassword!',
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 3. Current user me
  it('GET /api/auth/me should return current user info when authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe('admin@hospital.com');
  });

  // 4. Dashboard Stats
  it('GET /api/dashboard/stats should return dynamic real-time hospital metrics', async () => {
    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.stats).toBeDefined();
    expect(res.body.stats.totalPatients).toBeGreaterThan(0);
    expect(res.body.stats.activeDoctors).toBeGreaterThan(0);
  });

  // 5. Patients Management
  it('GET /api/patients should return seeded patients with pagination', async () => {
    const res = await request(app)
      .get('/api/patients')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.patients.length).toBeGreaterThan(0);
    expect(res.body.total).toBeGreaterThan(0);
  });

  it('POST /api/patients should register a new patient', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Grace',
        lastName: 'Hopper',
        dob: '1995-12-09',
        gender: 'Female',
        bloodGroup: 'B+',
        phone: '+1 555-9988',
        email: 'grace.hopper@example.com',
        allergies: ['Dust'],
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.patient.firstName).toBe('Grace');
    expect(res.body.patient.patientId).toBeDefined();
  });

  // 6. Appointments Management
  it('GET /api/appointments should list appointments', async () => {
    const res = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.appointments.length).toBeGreaterThan(0);
  });

  // 7. Pharmacy Inventory
  it('GET /api/pharmacy should return medicine inventory with low stock indicators', async () => {
    const res = await request(app)
      .get('/api/pharmacy')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.medicines.length).toBeGreaterThan(0);
    expect(res.body.inventorySummary).toBeDefined();
  });

  // 8. Billing
  it('GET /api/billing should return invoices and financial metrics', async () => {
    const res = await request(app)
      .get('/api/billing')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.invoices.length).toBeGreaterThan(0);
    expect(res.body.financialSummary).toBeDefined();
  });

  // 9. Role-based Access check: unauthorized access to audit logs by non-admin
  it('GET /api/audit should block doctor from accessing admin-only audit logs with 403', async () => {
    const res = await request(app)
      .get('/api/audit')
      .set('Authorization', `Bearer ${doctorToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
