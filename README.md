# CarePulse — Enterprise Hospital Management System (HMS)

CarePulse is an enterprise-grade, responsive Hospital Management System built on the **MERN** stack (MongoDB, Express.js, React, Node.js). It integrates clinical operations, electronic medical records (EMR), real-time patient scheduling, pharmacy inventory tracking, laboratory diagnostic workflows, billing with itemized receipts, and HIPAA-aligned security audit logs.

---

## 🏗️ Architecture & Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Axios, React Router v6
- **Backend:** Node.js (ES Modules), Express.js, Helmet, CORS, Cookie-Parser, Morgan
- **Database:** MongoDB with Mongoose (with seamless automatic in-memory fallback for local zero-config evaluation)
- **Security & Authentication:** JWT with secure HTTP-only cookies, role-based access control (RBAC), and centralized audit logging
- **Testing:** Jest, Supertest

```
ProjectB/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── api/                # Axios instance with interceptors
│   │   ├── components/         # Reusable UI (Navbar, Sidebar, Modal, Badge, StatsCard)
│   │   ├── context/            # AuthContext (sessions, login/logout, RBAC helpers)
│   │   ├── pages/              # 10 Module views (Dashboard, Patients, Doctors, Appointments, EMR, etc.)
│   │   ├── App.jsx             # React Router with ProtectedRoute & AdminRoute
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Node.js + Express backend
│   ├── src/
│   │   ├── config/             # MongoDB connection (supports local URI & Memory DB fallback)
│   │   ├── controllers/        # Modular API controllers
│   │   ├── middleware/         # JWT auth, RBAC authorization, Audit logger, Error handler
│   │   ├── models/             # 11 Mongoose Schemas (User, Patient, Doctor, EMR, Invoice, etc.)
│   │   ├── routes/             # REST API endpoint definitions
│   │   └── seed/               # High-fidelity realistic clinical dataset
│   ├── tests/                  # Automated integration test suite
│   ├── server.js
│   └── package.json
├── package.json                # Root package with unified developer scripts
└── README.md
```

---

## 👥 Role-Based Access Control (RBAC) & Default Demo Accounts

The system includes pre-seeded accounts and a **1-Click Demo Login Switcher** on the login screen:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Chief Admin** | `admin@hospital.com` | `Admin@123` | Full system access, staff onboarding, hospital analytics, audit trail |
| **Physician (Doctor)** | `doctor.sarah@hospital.com` | `Doctor@123` | Assigned patients, consultation notes, EMR, prescriptions, lab orders |
| **Receptionist** | `reception@hospital.com` | `Staff@123` | Patient registration, scheduling appointments, doctor rosters |
| **Pharmacist** | `pharmacist@hospital.com` | `Staff@123` | Drug catalog, reorder points, expiry tracking, prescription dispensation |
| **Lab Technologist**| `lab@hospital.com` | `Staff@123` | Diagnostic test queue, specimen intake, diagnostic report entry |
| **Billing Officer** | `billing@hospital.com` | `Staff@123` | Patient billing, itemized invoices, payment collection, receipts |

---

## ⚡ Local Development Setup

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v22.13.1)
- **npm** v9+

### 2. Environment Configuration
The backend is pre-configured with a `.env` in `server/.env`.
```env
PORT=5000
NODE_ENV=development
# Set to 'false' if running a local mongod daemon or Mongo Atlas URI
USE_MEMORY_DB=true
MONGODB_URI=mongodb://localhost:27017/hospital_management
JWT_SECRET=super_secret_jwt_key_hospital_management_system_2026_xyz
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```
> **Zero-Config Note:** When `USE_MEMORY_DB=true` (or when local MongoDB is not detected), the backend automatically initializes an in-memory MongoDB server so you can test the application instantly without installing or configuring external database services.

---

### 3. Running the Backend Server
In a terminal:
```bash
cd server
npm install
npm run dev
```
The server will start on `http://localhost:5000` and automatically populate the database with clinical demo data.

---

### 4. Running the Frontend Client
In a second terminal:
```bash
cd client
npm install
npm run dev
```
The Vite development server will open at:
👉 **`http://localhost:5173`**

---

### 5. Unified Root Commands (Optional)
From the project root (`ProjectB/`):
- Run backend: `npm run dev:server`
- Run frontend: `npm run dev:client`
- Run backend tests: `npm run test:server`
- Build frontend: `npm run build:client`

---

## 🧪 Automated Testing

The backend includes a comprehensive Jest and Supertest integration test suite verifying health status, authentication, RBAC authorization boundaries, patient registration, appointments, inventory, and billing:

```bash
cd server
npm test
```

Test Results:
```
PASS tests/api.test.js
  Hospital Management System - API Integration Tests
    √ GET /api/health should return 200 and healthy status
    √ POST /api/auth/login with valid admin credentials should return token and user
    √ POST /api/auth/login with doctor credentials should succeed
    √ POST /api/auth/login with invalid password should fail with 401
    √ GET /api/auth/me should return current user info when authenticated
    √ GET /api/dashboard/stats should return dynamic real-time hospital metrics
    √ GET /api/patients should return seeded patients with pagination
    √ POST /api/patients should register a new patient
    √ GET /api/appointments should list appointments
    √ GET /api/pharmacy should return medicine inventory with low stock indicators
    √ GET /api/billing should return invoices and financial metrics
    √ GET /api/audit should block doctor from accessing admin-only audit logs with 403

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
```

---

## 🏥 Core Modules Overview

1. **Admin Dashboard:** Real-time dynamic KPIs (patients count, doctor rosters, today's consultations, revenue and unpaid balances, stock alerts, diagnostic backlog) computed directly from MongoDB aggregations.
2. **Patient Management:** Patient demographic tracking, blood group tagging, known allergies, chronic conditions, and full clinical timeline modals.
3. **Doctor Roster:** Physician specialties, license numbers, room assignments, consultation fees, and working hours.
4. **Appointment Management:** Live consultation booking, scheduling conflict prevention, and appointment workflows (`Scheduled`, `Confirmed`, `Completed`, `Cancelled`).
5. **Electronic Medical Records (EMR):** Comprehensive clinical documentation featuring vitals telemetry (blood pressure, heart rate, temperature, SpO2, BMI), diagnostic notes, treatment plans, and structured multi-item prescription orders.
6. **Billing & Invoices:** Itemized hospital invoices (consultations, medications, lab tests, procedures), tax/discount calculations, partial payment receipts, and printable official receipts.
7. **Pharmacy & Inventory:** Batch tracking, unit costs, reorder-level alerts, expiry warnings (within 60 days), and prescription dispensation.
8. **Laboratory & Diagnostics:** Test catalog, doctor test ordering with priority levels (`STAT`, `Urgent`, `Normal`), specimen intake timestamps, and laboratory result entry.
9. **Staff Administration:** Hospital employee onboarding, department assignments, shift allocations, and salary records.
10. **Security & HIPAA Audit Trail:** Forensic activity logging for sensitive clinical entity interactions with IP address, user agent, and timestamp tracking.

---

## 🚀 Production Deployment Guidelines (Future AWS / Cloud Setup)

When ready for cloud production deployment:
1. **Database:** Deploy a managed MongoDB Atlas cluster with VPC peering and automated backups. Update `MONGODB_URI` in `.env`.
2. **Backend API:** Containerize with Node Alpine Docker image or deploy via AWS Elastic Beanstalk / ECS Fargate / EC2 behind an Application Load Balancer with SSL termination (AWS ACM).
3. **Frontend Client:** Build production assets (`npm run build:client`) and host on AWS S3 with CloudFront CDN for global caching and HTTPS delivery.
4. **Environment Variables:** Secure secrets using AWS Secrets Manager or Systems Manager Parameter Store.
