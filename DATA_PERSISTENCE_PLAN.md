# PneumAI Data Persistence & Encryption Plan

## Executive Summary
This document outlines a comprehensive plan to migrate PneumAI from localStorage-based data storage to a persistent, secure backend database solution with encryption. This will ensure user accounts, login sessions, and medical data persist across deployments and repository clones.

---

## Current State Analysis

### What We Have Now
- **Client-side storage**: All data stored in browser localStorage
- **User accounts**: `pneumAIUsers` array in localStorage
- **Sessions**: `pneumAISession` object in localStorage
- **Data loss scenarios**:
  - Clearing browser cache/cookies
  - Different browsers/devices
  - Cloning GitHub repository to new environment
  - No data backup or recovery

### Current Data Structure
```javascript
// User data in localStorage
{
  username: 'John Doe',
  email: 'john@example.com',
  password: 'plaintext', // ⚠️ NOT ENCRYPTED
  userType: 'patient|doctor|admin',
  registeredAt: '2025-11-06T...'
}

// Session data in localStorage
{
  userType: 'patient',
  username: 'John Doe'
}
```

### Problems to Solve
1. **No persistence**: Data lost when repo is cloned/redeployed
2. **No security**: Passwords stored in plaintext
3. **No centralization**: Each user's browser has different data
4. **No scalability**: Can't share data across devices
5. **No backup**: No way to recover lost data

---

## Proposed Solution Architecture

### Option 1: PostgreSQL + Node.js/Express (RECOMMENDED)
**Best for**: Production-ready, scalable healthcare applications

```
Frontend (React)
    ↓
REST API (Express.js)
    ↓
Database (PostgreSQL)
```

**Pros**:
- ✅ Industry standard for healthcare applications
- ✅ Strong ACID compliance (data integrity)
- ✅ Excellent for relational data (patients, scans, doctors)
- ✅ Robust security and encryption support
- ✅ Great for complex queries
- ✅ HIPAA-compliant hosting options available

**Cons**:
- Requires separate backend server
- More complex initial setup
- Needs database hosting (Railway, Heroku, AWS RDS)

**Estimated Setup Time**: 4-6 hours

---

### Option 2: MongoDB + Node.js/Express
**Best for**: Flexible data structures, rapid development

```
Frontend (React)
    ↓
REST API (Express.js)
    ↓
Database (MongoDB Atlas)
```

**Pros**:
- ✅ Flexible schema (good for evolving features)
- ✅ MongoDB Atlas has free tier
- ✅ Easy to set up
- ✅ JSON-like documents (similar to current structure)
- ✅ Good for storing CT scan metadata

**Cons**:
- Less rigid data validation
- More complex for relational queries
- May need careful schema design for medical data

**Estimated Setup Time**: 3-4 hours

---

### Option 3: Firebase (Google)
**Best for**: Quick deployment, minimal backend code

```
Frontend (React)
    ↓
Firebase SDK
    ↓
Firebase Services (Auth, Firestore, Storage)
```

**Pros**:
- ✅ Fastest to implement
- ✅ Built-in authentication
- ✅ Built-in file storage for CT scans
- ✅ Real-time database updates
- ✅ Free tier available
- ✅ Automatic scaling

**Cons**:
- Vendor lock-in (Google)
- Less control over backend logic
- May be expensive at scale
- More difficult to migrate away later

**Estimated Setup Time**: 2-3 hours

---

### Option 4: Supabase (Open Source Firebase Alternative)
**Best for**: Balance of ease-of-use and control

```
Frontend (React)
    ↓
Supabase SDK
    ↓
PostgreSQL (Supabase-managed)
```

**Pros**:
- ✅ PostgreSQL under the hood
- ✅ Built-in authentication
- ✅ Built-in storage for files
- ✅ Free tier generous
- ✅ Open source (can self-host)
- ✅ Row-level security

**Cons**:
- Newer platform (less community resources)
- Some features still in beta

**Estimated Setup Time**: 2-3 hours

---

## Recommended Solution: PostgreSQL + Express

### Why PostgreSQL?
1. **Healthcare Standard**: Widely used in medical applications
2. **Data Integrity**: ACID compliance ensures medical data accuracy
3. **Scalability**: Can handle millions of records
4. **Security**: Battle-tested encryption and security features
5. **Future-Proof**: Can grow with application needs

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend                          │
│  (PneumAIUI, Login, Dashboards, Patient Registration)       │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTPS/REST API
                  │ JWT Token in Headers
                  ↓
┌─────────────────────────────────────────────────────────────┐
│                   Express.js Backend                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Authentication Middleware (JWT Verification)        │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Routes:                                         │   │
│  │  • POST /api/auth/register                           │   │
│  │  • POST /api/auth/login                              │   │
│  │  • GET  /api/auth/me                                 │   │
│  │  • POST /api/auth/logout                             │   │
│  │  • GET  /api/patients                                │   │
│  │  • POST /api/scans                                   │   │
│  │  • GET  /api/doctors                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Encryption Layer (bcrypt, crypto)                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────────┘
                  │ Encrypted Connection
                  │ SQL Queries
                  ↓
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tables:                                             │   │
│  │  • users (id, email, password_hash, role, etc)       │   │
│  │  • patients (id, user_id, medical_info, etc)         │   │
│  │  • doctors (id, user_id, specialty, etc)             │   │
│  │  • scans (id, patient_id, file_url, results, etc)    │   │
│  │  • sessions (id, user_id, token, expires_at)         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema Design

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- bcrypt hashed
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Patients Table
```sql
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(20),
    phone VARCHAR(20),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    medical_history TEXT,  -- Encrypted
    allergies TEXT,
    current_medications TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_user_id ON patients(user_id);
```

### Doctors Table
```sql
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    specialty VARCHAR(100),
    license_number VARCHAR(50),
    phone VARCHAR(20),
    hospital_affiliation VARCHAR(200),
    years_of_experience INTEGER,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_doctors_user_id ON doctors(user_id);
```

### CT Scans Table
```sql
CREATE TABLE ct_scans (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id),
    scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_url TEXT NOT NULL,  -- S3/Storage URL
    file_size_mb DECIMAL(10, 2),
    ai_analysis_result JSONB,  -- Store detection results
    ai_confidence_score DECIMAL(5, 2),
    risk_level VARCHAR(20),
    doctor_notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'requires_attention')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scans_patient_id ON ct_scans(patient_id);
CREATE INDEX idx_scans_doctor_id ON ct_scans(doctor_id);
CREATE INDEX idx_scans_status ON ct_scans(status);
```

### Sessions Table (for JWT management)
```sql
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,  -- Hashed JWT token
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

---

## Security & Encryption Strategy

### 1. Password Encryption (bcrypt)
```javascript
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

// Registration - Hash password
async function hashPassword(plainPassword) {
    const hash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hash;
}

// Login - Verify password
async function verifyPassword(plainPassword, hash) {
    const isValid = await bcrypt.compare(plainPassword, hash);
    return isValid;
}
```

**Why bcrypt?**
- Slow by design (prevents brute force attacks)
- Includes salt automatically
- Industry standard for password hashing
- Adaptive (can increase cost factor over time)

---

### 2. Session Management (JWT Tokens)
```javascript
const jwt = require('jsonwebtoken');

// Generate JWT on login
function generateToken(user) {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '24h',
            issuer: 'pneumai',
            audience: 'pneumai-frontend'
        }
    );
}

// Verify JWT on each request
function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}
```

**JWT Benefits**:
- Stateless authentication
- Contains user info (no DB lookup needed)
- Can be stored in httpOnly cookies (XSS protection)
- Expires automatically

---

### 3. Sensitive Data Encryption (AES-256)
For medical history, clinical notes, etc:

```javascript
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes

function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
    };
}

function decrypt(encryptedData) {
    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        ENCRYPTION_KEY,
        Buffer.from(encryptedData.iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
```

**What to Encrypt**:
- ✅ Medical history
- ✅ Clinical notes
- ✅ Patient addresses
- ✅ Phone numbers
- ✅ Emergency contacts
- ❌ Email (needed for queries)
- ❌ Username (needed for display)
- ❌ Role (needed for authorization)

---

### 4. Database Connection Security
```javascript
// PostgreSQL connection with SSL
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: true,
        ca: process.env.DB_SSL_CERT  // SSL certificate
    },
    max: 20,  // Connection pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
```

---

### 5. Environment Variables (.env)
```bash
# Never commit this file! Add to .gitignore

# Database
DB_HOST=your-postgres-host.railway.app
DB_PORT=5432
DB_NAME=pneumai
DB_USER=postgres
DB_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-jwt-secret-minimum-32-characters-long

# Encryption
ENCRYPTION_KEY=your-32-byte-encryption-key-hex-encoded

# AWS S3 (for CT scan storage)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=pneumai-ct-scans
AWS_REGION=us-east-1

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# App
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-app.vercel.app
```

**Important**: Use different values for development and production!

---

## API Endpoints Design

### Authentication Routes

#### POST /api/auth/register
```javascript
// Request
{
    "username": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "patient",
    "dateOfBirth": "1980-05-15"  // If patient
}

// Response (201 Created)
{
    "success": true,
    "message": "Registration successful",
    "user": {
        "id": 1,
        "username": "John Doe",
        "email": "john@example.com",
        "role": "patient"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /api/auth/login
```javascript
// Request
{
    "email": "john@example.com",
    "password": "SecurePass123!"
}

// Response (200 OK)
{
    "success": true,
    "user": {
        "id": 1,
        "username": "John Doe",
        "email": "john@example.com",
        "role": "patient"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### GET /api/auth/me
```javascript
// Request Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

// Response (200 OK)
{
    "success": true,
    "user": {
        "id": 1,
        "username": "John Doe",
        "email": "john@example.com",
        "role": "patient",
        "lastLogin": "2025-11-06T10:30:00Z"
    }
}
```

#### POST /api/auth/logout
```javascript
// Request Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

// Response (200 OK)
{
    "success": true,
    "message": "Logged out successfully"
}
```

---

### Patient Routes

#### GET /api/patients/:id
```javascript
// Request Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

// Response (200 OK)
{
    "success": true,
    "patient": {
        "id": 1,
        "userId": 1,
        "username": "John Doe",
        "dateOfBirth": "1980-05-15",
        "gender": "male",
        "phone": "555-0123",
        "medicalHistory": "...",
        "scans": [
            {
                "id": 1,
                "scanDate": "2025-05-03T10:00:00Z",
                "status": "reviewed",
                "riskLevel": "medium"
            }
        ]
    }
}
```

---

### Scan Routes

#### POST /api/scans
```javascript
// Request (multipart/form-data)
{
    "patientId": 1,
    "scanFile": <binary data>,
    "scanDate": "2025-11-06"
}

// Response (201 Created)
{
    "success": true,
    "scan": {
        "id": 1,
        "patientId": 1,
        "fileUrl": "https://s3.../scan-123.dcm",
        "status": "pending",
        "createdAt": "2025-11-06T10:00:00Z"
    }
}
```

---

## Frontend Migration Plan

### Step 1: Create API Service Layer
```javascript
// src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('pneumAI_token');
}

// Generic API call function
async function apiCall(endpoint, options = {}) {
    const token = getAuthToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API call failed');
    }

    return response.json();
}

// Authentication API
export const authAPI = {
    register: (userData) => apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),

    login: (credentials) => apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),

    getMe: () => apiCall('/auth/me'),

    logout: () => apiCall('/auth/logout', { method: 'POST' })
};

// Patient API
export const patientAPI = {
    getProfile: (id) => apiCall(`/patients/${id}`),
    updateProfile: (id, data) => apiCall(`/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    })
};

// Scan API
export const scanAPI = {
    uploadScan: (formData) => apiCall('/scans', {
        method: 'POST',
        body: formData,
        headers: {}  // Let browser set Content-Type for multipart
    }),

    getScans: (patientId) => apiCall(`/scans?patientId=${patientId}`),

    getScanDetails: (scanId) => apiCall(`/scans/${scanId}`)
};
```

---

### Step 2: Update Login Component
```javascript
// src/Login.jsx
import React, { useState } from 'react';
import { authAPI } from './services/api';

const Login = ({ onClose, onLogin, onRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login({ email, password });

            // Store token in localStorage
            localStorage.setItem('pneumAI_token', response.token);

            // Call parent handler
            onLogin(response.user.role, response.user.username);
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    // ... rest of component
};
```

---

### Step 3: Update Patient Registration
```javascript
// src/PatientRegistration.jsx
import React, { useState } from 'react';
import { authAPI } from './services/api';

const PatientRegistration = ({ onClose, onBackToLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        dateOfBirth: '',
        gender: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.register({
                ...formData,
                role: 'patient'
            });

            // Store token
            localStorage.setItem('pneumAI_token', response.token);

            // Redirect to login or dashboard
            alert('Registration successful! Please log in.');
            onBackToLogin();
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ... rest of component
};
```

---

### Step 4: Protected Route Component
```javascript
// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const ProtectedRoute = ({ children, requiredRole }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await authAPI.getMe();

                if (requiredRole && response.user.role !== requiredRole) {
                    throw new Error('Unauthorized access');
                }

                setUser(response.user);
            } catch (err) {
                setError(err.message);
                // Redirect to login
                localStorage.removeItem('pneumAI_token');
                window.location.href = '/';
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, [requiredRole]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return children;
};

export default ProtectedRoute;
```

---

## Deployment Strategy

### Backend Deployment (Railway.app)

**Why Railway?**
- ✅ Free tier with 500 hours/month
- ✅ Automatic deployments from GitHub
- ✅ Built-in PostgreSQL database
- ✅ Environment variable management
- ✅ Easy domain setup

**Steps**:
1. Create Railway account
2. Connect GitHub repository
3. Add PostgreSQL database service
4. Set environment variables
5. Deploy backend

**Railway Configuration**:
```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

---

### Frontend Deployment (Vercel)

**Why Vercel?**
- ✅ Free tier for hobby projects
- ✅ Optimized for React
- ✅ Automatic deployments from GitHub
- ✅ CDN and edge caching
- ✅ Custom domain support

**Steps**:
1. Create Vercel account
2. Import GitHub repository
3. Set environment variables (REACT_APP_API_URL)
4. Deploy

---

### Database Hosting Options

| Option | Free Tier | Pros | Cons |
|--------|-----------|------|------|
| **Railway PostgreSQL** | 500 hours/month | Easy integration, automatic backups | Limited free tier |
| **Supabase** | 500MB + unlimited API | Generous free tier, built-in auth | Newer platform |
| **Neon** | 3GB storage | Serverless, modern | Limited compute |
| **ElephantSQL** | 20MB | Simple setup | Very small storage |
| **AWS RDS Free Tier** | 12 months free | Industry standard | Complex setup |

**Recommendation**: Start with Railway PostgreSQL or Supabase

---

## Migration Checklist

### Phase 1: Backend Setup (Week 1)
- [ ] Initialize Node.js/Express project
- [ ] Set up PostgreSQL database
- [ ] Create database schema (run SQL scripts)
- [ ] Implement authentication routes
- [ ] Implement JWT token generation/verification
- [ ] Implement password hashing with bcrypt
- [ ] Set up encryption for sensitive data
- [ ] Test all API endpoints with Postman
- [ ] Deploy backend to Railway

### Phase 2: Frontend Integration (Week 2)
- [ ] Create API service layer
- [ ] Update Login component to use API
- [ ] Update PatientRegistration to use API
- [ ] Update AdminDashboard to use API
- [ ] Update PatientDashboard to use API
- [ ] Update DoctorDashboard to use API
- [ ] Implement ProtectedRoute component
- [ ] Replace all localStorage calls with API calls
- [ ] Test authentication flow end-to-end

### Phase 3: Data Migration (Week 2)
- [ ] Export existing localStorage data (if any)
- [ ] Create migration script to import data
- [ ] Run migration script
- [ ] Verify data integrity
- [ ] Remove localStorage backup

### Phase 4: Testing & Security (Week 3)
- [ ] Test registration flow
- [ ] Test login/logout flow
- [ ] Test protected routes
- [ ] Test password reset flow (if implemented)
- [ ] Test session expiration
- [ ] Security audit (SQL injection, XSS, CSRF)
- [ ] Load testing
- [ ] Mobile responsiveness testing

### Phase 5: Production Deployment (Week 3)
- [ ] Deploy frontend to Vercel
- [ ] Configure environment variables
- [ ] Set up custom domain (optional)
- [ ] Configure CORS properly
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Create backup strategy
- [ ] Document deployment process

---

## Security Best Practices

### 1. Input Validation
```javascript
const { body, validationResult } = require('express-validator');

// Registration validation
const registerValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/[A-Z]/).matches(/[0-9]/),
    body('username').trim().isLength({ min: 2, max: 100 })
];

app.post('/api/auth/register', registerValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // ... registration logic
});
```

---

### 2. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many login attempts, please try again later'
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
    // ... login logic
});
```

---

### 3. CORS Configuration
```javascript
const cors = require('cors');

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

---

### 4. Helmet (Security Headers)
```javascript
const helmet = require('helmet');

app.use(helmet());
```

---

### 5. SQL Injection Prevention
```javascript
// ✅ GOOD - Parameterized queries
const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
);

// ❌ BAD - String concatenation
const result = await pool.query(
    `SELECT * FROM users WHERE email = '${email}'`  // VULNERABLE!
);
```

---

## Cost Estimation

### Development (First Month)
- Development time: 3 weeks
- Railway (Backend + DB): **FREE** (500 hours)
- Vercel (Frontend): **FREE**
- AWS S3 (CT scan storage): ~$1-5/month
- **Total: ~$1-5/month**

### Production (After Launch)
| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| Railway | 500 hrs/month | $5/month (Hobby), $20/month (Pro) |
| Vercel | Unlimited | $20/month (Pro) |
| PostgreSQL | Included in Railway | $5-20/month (larger DB) |
| AWS S3 | 5GB free | ~$0.023/GB after |
| Domain | N/A | ~$12/year |

**Estimated**: $0-10/month for small scale, $30-50/month at production scale

---

## Rollback Plan

If migration fails or issues arise:

1. **Keep localStorage code** in parallel during migration
2. **Feature flag** to switch between localStorage and API:
```javascript
const USE_API = process.env.REACT_APP_USE_API === 'true';

async function login(email, password) {
    if (USE_API) {
        return await authAPI.login({ email, password });
    } else {
        // Old localStorage logic
        return localStorage.getItem('pneumAIUsers');
    }
}
```

3. **Gradual rollout**: Test with small user group first
4. **Database backups**: Daily automated backups
5. **Monitoring**: Set up alerts for errors

---

## Success Metrics

After migration, measure:
- ✅ Authentication success rate > 99%
- ✅ API response time < 500ms
- ✅ Zero data loss incidents
- ✅ Session persistence across devices
- ✅ Zero security vulnerabilities (from penetration testing)

---

## Next Steps (Immediate Actions)

1. **Choose your stack**: PostgreSQL + Express (recommended) or Firebase (faster)
2. **Set up development environment**:
   ```bash
   mkdir pneumai-backend
   cd pneumai-backend
   npm init -y
   npm install express pg bcrypt jsonwebtoken dotenv cors helmet
   ```
3. **Create database schema**: Run SQL scripts provided above
4. **Build authentication endpoints**: Start with /register and /login
5. **Test with Postman**: Verify API works before frontend integration

---

## Questions to Consider

Before proceeding, decide on:
1. **Hosting budget**: Stick with free tier or invest in paid hosting?
2. **File storage**: AWS S3 for CT scans or database BLOB storage?
3. **Email service**: Do you need email verification? (SendGrid, Mailgun, AWS SES)
4. **Analytics**: Track user behavior? (Google Analytics, Mixpanel)
5. **Monitoring**: Error tracking? (Sentry, LogRocket)

---

## Conclusion

This plan provides a comprehensive roadmap to migrate PneumAI from localStorage to a secure, persistent, encrypted backend database. The recommended approach using PostgreSQL + Express offers:

- ✅ **Persistence**: Data survives deployments and repo clones
- ✅ **Security**: Passwords hashed, sensitive data encrypted, JWT auth
- ✅ **Scalability**: Can handle thousands of users
- ✅ **Professional**: Healthcare-grade data management
- ✅ **Cost-effective**: Free tier available, low cost at scale

**Estimated timeline**: 3 weeks for full migration
**Estimated cost**: $0-10/month to start

Ready to start? Begin with Phase 1 (Backend Setup) and we'll build it step by step!
