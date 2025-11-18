# Phase 5: PostgreSQL Setup & Connection Guide

Complete guide for setting up PostgreSQL with Docker, connecting via pgAdmin, and deploying to Railway.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [pgAdmin Connection](#pgadmin-connection)
4. [Testing the Connection](#testing-the-connection)
5. [Railway Production Deployment](#railway-production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Software
- **Docker Desktop** (for Mac M1/M2): [Download](https://www.docker.com/products/docker-desktop)
- **pgAdmin 4** (already installed on your Mac)
- **Python 3.11+** with pip
- **Node.js 18+** with npm

### Python Dependencies
```bash
pip install psycopg2-binary python-dotenv fastapi uvicorn
```

---

## 🐳 Local Development Setup

### Step 1: Start PostgreSQL with Docker Compose

```bash
# Navigate to project root
cd /path/to/YOLO12ELCDPPCC-1

# Start PostgreSQL, pgAdmin, and Redis
docker-compose up -d

# Verify containers are running
docker ps
```

Expected output:
```
CONTAINER ID   IMAGE                  STATUS         PORTS
xxxxx          postgres:15-alpine     Up 10 seconds  0.0.0.0:5432->5432/tcp
xxxxx          dpage/pgadmin4:latest  Up 10 seconds  0.0.0.0:5050->80/tcp
xxxxx          redis:7-alpine         Up 10 seconds  0.0.0.0:6379->6379/tcp
```

### Step 2: Verify Database Initialization

```bash
# Check PostgreSQL logs
docker logs pneumai-db

# You should see:
# ✅ Database pool initialized: 5-20 connections
# ✅ PneumAI Database Schema Created Successfully!
# ✅ PneumAI Seed Data Loaded Successfully!
```

### Step 3: Verify Database Connection

```bash
# Connect to PostgreSQL container
docker exec -it pneumai-db psql -U pneumai_admin -d pneumai_db

# Run test query
SELECT COUNT(*) FROM users;

# Expected output: 7 (1 admin + 3 doctors + 3 patients)

# Exit
\q
```

---

## 🖥️ pgAdmin Connection

### Method 1: pgAdmin in Docker (Recommended for quick access)

Access the containerized pgAdmin web interface:

1. **Open Browser**: Navigate to [http://localhost:5050](http://localhost:5050)

2. **Login Credentials**:
   - Email: `admin@pneumai.local`
   - Password: `admin123`

3. **Add New Server Connection**:
   - Right-click "Servers" → "Register" → "Server..."

4. **General Tab**:
   - Name: `PneumAI Local DB`

5. **Connection Tab**:
   - Host name/address: `db` (Docker service name)
   - Port: `5432`
   - Maintenance database: `pneumai_db`
   - Username: `pneumai_admin`
   - Password: `pneumai_dev_password_2025`
   - Save password: ✅ Yes

6. **Click "Save"**

### Method 2: pgAdmin Desktop App (Mac M1)

Use your locally installed pgAdmin 4 application:

1. **Open pgAdmin 4** from Applications

2. **Add New Server**:
   - Right-click "Servers" → "Register" → "Server..."

3. **General Tab**:
   - Name: `PneumAI Docker`

4. **Connection Tab**:
   - Host name/address: `localhost` (or `127.0.0.1`)
   - Port: `5432`
   - Maintenance database: `pneumai_db`
   - Username: `pneumai_admin`
   - Password: `pneumai_dev_password_2025`
   - Save password: ✅ Yes

5. **SSL Tab** (optional):
   - SSL mode: `Prefer`

6. **Click "Save"**

### Verifying Connection in pgAdmin

Once connected, you should see:

```
PneumAI Local DB
├── Databases
│   └── pneumai_db
│       ├── Schemas
│       │   └── public
│       │       ├── Tables (12)
│       │       │   ├── users
│       │       │   ├── patients
│       │       │   ├── doctors
│       │       │   ├── ct_scans
│       │       │   ├── appointments
│       │       │   ├── messages
│       │       │   ├── scan_comments
│       │       │   ├── notifications
│       │       │   ├── sessions
│       │       │   ├── audit_log
│       │       │   └── system_settings
│       │       └── Views (2)
│       │           ├── active_patients_with_scans
│       │           └── upcoming_appointments
```

---

## ✅ Testing the Connection

### Test 1: Query Sample Data

Run these queries in pgAdmin Query Tool:

```sql
-- Check users
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;

-- Expected output:
-- admin | 1
-- doctor | 3
-- patient | 3

-- Check doctors
SELECT first_name, last_name, specialty
FROM doctors
ORDER BY last_name;

-- Expected output:
-- Emily | Chen | Radiology
-- Sarah | Miller | Pulmonology
-- James | Rodriguez | Oncology

-- Check patients
SELECT first_name, last_name, status
FROM patients
ORDER BY last_name;

-- Check appointments
SELECT * FROM upcoming_appointments;
```

### Test 2: Python Connection Test

Create a test script:

```bash
# Create test file
cat > test_db_connection.py << 'PYTHON'
#!/usr/bin/env python3
"""
Test PostgreSQL connection from Python
"""
import psycopg2
from psycopg2.extras import RealDictCursor

# Connection parameters (from .env.local)
conn_params = {
    'host': 'localhost',
    'port': 5432,
    'database': 'pneumai_db',
    'user': 'pneumai_admin',
    'password': 'pneumai_dev_password_2025'
}

try:
    # Connect
    print("🔄 Connecting to PostgreSQL...")
    conn = psycopg2.connect(**conn_params)
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    # Test query
    cursor.execute("SELECT COUNT(*) as count FROM users")
    result = cursor.fetchone()
    print(f"✅ Connection successful! Users count: {result['count']}")

    # List all tables
    cursor.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)
    tables = cursor.fetchall()
    print(f"\n📊 Tables found: {len(tables)}")
    for table in tables:
        print(f"   - {table['table_name']}")

    # Close connection
    cursor.close()
    conn.close()
    print("\n✅ Database connection test passed!")

except Exception as e:
    print(f"❌ Connection failed: {e}")
PYTHON

# Run test
python3 test_db_connection.py
```

### Test 3: FastAPI Backend Connection

```bash
# Start the FastAPI backend
python3 -m uvicorn backend_server:app --reload

# In another terminal, test the health endpoint
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","database":"connected"}
```

---

## 🚀 Railway Production Deployment

### Step 1: Create Railway Project

1. Go to [Railway.app](https://railway.app/)
2. Sign in with GitHub
3. Click "New Project" → "Provision PostgreSQL"
4. Wait for PostgreSQL to be provisioned

### Step 2: Get Database Credentials

Railway automatically creates a `DATABASE_URL`. Access it via:

1. Click on your PostgreSQL service
2. Go to "Variables" tab
3. Copy the `DATABASE_URL`

Format:
```
postgresql://postgres:PASSWORD@HOSTNAME:PORT/railway
```

### Step 3: Deploy Backend to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Set environment variables
railway variables set DATABASE_URL="postgresql://..." 
railway variables set SECRET_KEY="your-production-secret-key-min-32-chars"
railway variables set ENVIRONMENT="production"
railway variables set DEBUG="false"

# Deploy
railway up
```

### Step 4: Initialize Production Database

**Option A: Run migrations via Railway CLI**
```bash
# Connect to Railway PostgreSQL
railway connect postgres

# Once connected, run initialization scripts
\i database/init/01_schema.sql
\i database/init/02_seed_data.sql
```

**Option B: Use pgAdmin to connect to Railway**

1. Get connection details from Railway dashboard
2. Add new server in pgAdmin:
   - Host: `[from Railway dashboard]`
   - Port: `5432`
   - Database: `railway`
   - Username: `postgres`
   - Password: `[from Railway dashboard]`
3. Run schema and seed SQL scripts via Query Tool

### Step 5: Update Frontend Environment

Update Vercel environment variables:

```bash
# In Vercel dashboard → Settings → Environment Variables
REACT_APP_API_URL=https://your-backend.up.railway.app
```

---

## 🔍 Troubleshooting

### Issue: "Connection refused" when connecting to localhost:5432

**Solution**:
```bash
# Check if PostgreSQL container is running
docker ps | grep pneumai-db

# If not running, start it
docker-compose up -d db

# Check logs
docker logs pneumai-db
```

### Issue: "password authentication failed for user pneumai_admin"

**Solution**:
```bash
# Verify credentials in .env.local
cat .env.local | grep POSTGRES

# Recreate containers with fresh credentials
docker-compose down -v
docker-compose up -d
```

### Issue: "relation 'users' does not exist"

**Solution**:
```bash
# Database wasn't initialized. Recreate:
docker-compose down -v
docker-compose up -d

# Check logs to ensure schema was created
docker logs pneumai-db | grep "Schema Created"
```

### Issue: pgAdmin can't connect (using Docker service name 'db')

**Solution**:
- If using pgAdmin desktop app, use `localhost` instead of `db`
- If using pgAdmin in Docker, use `db` (Docker service name)

### Issue: Port 5432 already in use

**Solution**:
```bash
# Check what's using port 5432
lsof -i :5432

# If Mac's default PostgreSQL is running, stop it:
brew services stop postgresql@15

# Or change port in docker-compose.yml:
# ports:
#   - "5433:5432"  # Map container 5432 to host 5433
```

### Issue: DATABASE_URL not being read from .env.local

**Solution**:
```bash
# Ensure .env.local exists
ls -la .env.local

# Test loading env vars
python3 -c "from dotenv import load_dotenv; import os; load_dotenv('.env.local'); print(os.getenv('DATABASE_URL'))"

# Should output: postgresql://pneumai_admin:pneumai_dev_password_2025@localhost:5432/pneumai_db
```

---

## 📊 Database Schema Overview

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | Authentication | email, password_hash, role |
| `patients` | Patient profiles | first_name, last_name, medical_history |
| `doctors` | Doctor profiles | specialty, license_number |
| `ct_scans` | Medical imaging | scan_id, ai_analysis_result, risk_level |
| `appointments` | Scheduling | appointment_date, status |
| `messages` | Communications | sender_id, receiver_id, message_text |
| `scan_comments` | Professional feedback | scan_id, user_id, comment_text |
| `notifications` | Real-time alerts | user_id, type, is_read |
| `sessions` | JWT tracking | token_hash, expires_at |
| `audit_log` | Activity tracking | event_type, user_id, changes |
| `system_settings` | Configuration | setting_key, setting_value |

---

## 🎯 Next Steps

After confirming PostgreSQL connection:

1. ✅ **Phase 5A**: Migrate frontend from localStorage to API calls
2. ✅ **Phase 5B**: Implement real-time notifications
3. ✅ **Phase 5C**: Enhanced messaging with WebSocket
4. ✅ **Phase 6**: Redis caching layer
5. ✅ **Phase 7**: Production deployment

---

## 📞 Quick Reference

### Local Development Credentials

```
PostgreSQL:
  Host: localhost
  Port: 5432
  Database: pneumai_db
  Username: pneumai_admin
  Password: pneumai_dev_password_2025

pgAdmin (Web):
  URL: http://localhost:5050
  Email: admin@pneumai.local
  Password: admin123

Redis:
  Host: localhost
  Port: 6379
  Password: redis_dev_password

Demo Login Credentials:
  Admin: admin@pneumai.com / admin123
  Doctor: sarah.miller@pneumai.com / doctor123
  Patient: robert.johnson@email.com / patient123
```

### Useful Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart database only
docker-compose restart db

# Clean slate (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d

# Backup database
docker exec pneumai-db pg_dump -U pneumai_admin pneumai_db > backup.sql

# Restore database
docker exec -i pneumai-db psql -U pneumai_admin pneumai_db < backup.sql
```

---

**Setup Complete!** 🎉

Your PostgreSQL database is now ready for local development and can be easily deployed to Railway for production.
