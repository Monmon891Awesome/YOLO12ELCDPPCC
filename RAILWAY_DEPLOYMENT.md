# Railway Deployment Guide - PneumAI Backend + PostgreSQL

This guide covers deploying the PneumAI backend API and PostgreSQL database to Railway.

## Overview

**Railway Services:**
1. **PostgreSQL Database** - Managed PostgreSQL 15 instance
2. **FastAPI Backend** - Python backend with YOLO model

**Architecture:**
```
Vercel (Frontend) → Railway Backend API → Railway PostgreSQL
```

---

## Part 1: Railway Setup

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (recommended for easier deployment)
3. Verify your email

### Step 2: Install Railway CLI (Optional but Recommended)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login
```

---

## Part 2: Deploy PostgreSQL Database

### Method A: Using Railway Dashboard (Recommended)

1. **Create New Project**
   - Go to Railway Dashboard
   - Click **"New Project"**
   - Name it: `pneumai-production`

2. **Add PostgreSQL Database**
   - Click **"New"** → **"Database"** → **"Add PostgreSQL"**
   - Railway will provision a PostgreSQL 15 instance
   - Wait for deployment (takes ~1-2 minutes)

3. **Get Database Connection String**
   - Click on the PostgreSQL service
   - Go to **"Connect"** tab
   - Copy the **`DATABASE_URL`** (it looks like this):
     ```
     postgresql://postgres:PASSWORD@HOST:PORT/railway
     ```
   - **Save this URL** - you'll need it for the backend!

4. **Initialize Database Schema**

   You have two options:

   **Option A: Using Railway CLI**
   ```bash
   # Connect to Railway PostgreSQL
   railway connect postgres

   # Run schema initialization
   \i database/init/01_schema.sql
   \i database/init/02_seed_data.sql
   \q
   ```

   **Option B: Using pgAdmin (from your local machine)**
   - In pgAdmin, create a new server connection
   - Use the Railway `DATABASE_URL` credentials:
     - Host: Extract from DATABASE_URL
     - Port: Usually 5432
     - Database: `railway` (default)
     - Username: `postgres`
     - Password: Extract from DATABASE_URL
   - Open Query Tool
   - Copy/paste contents of `database/init/01_schema.sql` and run
   - Copy/paste contents of `database/init/02_seed_data.sql` and run

---

## Part 3: Deploy FastAPI Backend

### Step 1: Prepare Backend for Railway

Railway will automatically detect your `Dockerfile` and build your backend.

**Verify these files exist:**
- ✅ `Dockerfile` (already exists)
- ✅ `requirements.txt` (already exists)
- ✅ `backend_server.py` (already exists)

### Step 2: Create Railway Service for Backend

1. **In Railway Dashboard**
   - In your `pneumai-production` project
   - Click **"New"** → **"GitHub Repo"**
   - Connect your GitHub repository
   - Select the repository containing your backend code

2. **Railway will automatically:**
   - Detect the `Dockerfile`
   - Build the Docker image
   - Deploy the backend

### Step 3: Configure Environment Variables

1. Click on your **backend service**
2. Go to **"Variables"** tab
3. Add these environment variables:

```bash
# Database Configuration (from Railway PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Security (CRITICAL: Generate a secure key for production!)
SECRET_KEY=your-super-secure-secret-key-min-32-chars-change-this

# Application Settings
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=info

# CORS - Add your Vercel frontend URL
FRONTEND_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-app.vercel.app,https://www.your-app.com

# Server Configuration
HOST=0.0.0.0
PORT=8000
WORKERS=4

# File Upload (Railway Ephemeral Storage - files will be lost on restart)
UPLOAD_DIR=/tmp/uploads
MAX_UPLOAD_SIZE_MB=50

# YOLO Model
MODEL_PATH=./best.pt
YOLO_CONFIDENCE_THRESHOLD=0.25

# Database Pool
DB_POOL_MIN=5
DB_POOL_MAX=20
```

**Important Notes:**
- `${{Postgres.DATABASE_URL}}` is Railway's way of referencing the PostgreSQL service
- Railway will automatically inject the correct PostgreSQL connection string
- Generate a secure `SECRET_KEY` using: `openssl rand -base64 32`

### Step 4: Upload YOLO Model to Railway

Since Railway uses ephemeral storage, you need to include `best.pt` in your repo or use external storage.

**Option A: Include in GitHub Repo (if < 100MB)**
```bash
# Make sure best.pt is in your repo root
git add best.pt
git commit -m "Add YOLO model for Railway deployment"
git push
```

**Option B: Use Railway Volumes (Recommended for large files)**
1. In Railway Dashboard → Backend Service
2. Go to **"Settings"** → **"Volumes"**
3. Add volume: `/app/models`
4. Update `MODEL_PATH` env var to `/app/models/best.pt`
5. Upload `best.pt` via Railway CLI or SFTP

**Option C: Use External Storage (AWS S3, etc.)**
- Upload model to S3
- Download on startup in your backend code

### Step 5: Configure Public Domain

1. In Railway Dashboard → Backend Service
2. Go to **"Settings"** → **"Networking"**
3. Click **"Generate Domain"**
4. Railway will give you a public URL like:
   ```
   https://pneumai-backend-production.up.railway.app
   ```
5. **Save this URL** - your Vercel frontend will use it!

### Step 6: Health Check

Once deployed, test your backend:

```bash
# Check health endpoint
curl https://your-backend.up.railway.app/health

# Check API docs
open https://your-backend.up.railway.app/docs
```

---

## Part 4: Connect Vercel Frontend to Railway Backend

### Step 1: Update Frontend Environment Variables

In your Vercel project settings:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add:

```bash
REACT_APP_API_URL=https://your-backend.up.railway.app
```

### Step 2: Update CORS on Backend

Make sure your Railway backend allows your Vercel domain:

1. In Railway → Backend Service → Variables
2. Update `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-preview.vercel.app
   ```

### Step 3: Redeploy Frontend

```bash
# Trigger Vercel redeployment
git push
```

---

## Part 5: Database Migrations (Future Updates)

When you need to update the database schema:

### Option A: Direct SQL Execution

```bash
# Connect to Railway PostgreSQL
railway connect postgres

# Run your migration SQL
\i database/migrations/001_add_new_column.sql
```

### Option B: Using pgAdmin

1. Connect to Railway PostgreSQL via pgAdmin
2. Open Query Tool
3. Run your migration SQL

---

## Railway Service Configuration Summary

### PostgreSQL Service
- **Name:** `pneumai-postgres`
- **Type:** PostgreSQL 15
- **Region:** Choose closest to your users (US West, US East, EU, etc.)
- **Plan:** Free tier (500 MB) or Pro ($5/month for 8 GB)

### Backend Service
- **Name:** `pneumai-backend`
- **Build:** Dockerfile
- **Start Command:** Auto-detected from Dockerfile
- **Port:** 8000
- **Public Domain:** Generated by Railway

---

## Cost Estimates (as of 2025)

**Railway Free Tier:**
- $5 free credit per month
- ~500 hours of usage
- Perfect for development/testing

**Railway Pro Plan:**
- ~$20-40/month for production
- PostgreSQL: $5-10/month
- Backend: $10-20/month (depending on traffic)

**Vercel:**
- Free tier for frontend (perfect for most use cases)
- Pro if you need more bandwidth

---

## Troubleshooting

### Backend won't start
1. Check Railway logs: Backend Service → Logs
2. Common issues:
   - Missing environment variables
   - `best.pt` model file not found
   - Database connection failed

### Database connection errors
```bash
# Test connection
railway run python3 -c "import psycopg2; print('Connected!')"
```

### CORS errors from Vercel
1. Verify `ALLOWED_ORIGINS` includes your Vercel URL
2. Check Railway backend logs for CORS errors
3. Make sure you redeployed after changing env vars

### File upload issues
- Railway uses ephemeral storage
- Uploaded files are lost on restart
- Consider using AWS S3 or Cloudinary for production

---

## Security Checklist

Before going to production:

- [ ] Change `SECRET_KEY` to a secure random value
- [ ] Set `DEBUG=false`
- [ ] Update `ALLOWED_ORIGINS` to only your Vercel domain
- [ ] Use strong database password (Railway generates this)
- [ ] Enable Railway's **"Private Networking"** for PostgreSQL
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy for PostgreSQL
- [ ] Review Railway's security best practices

---

## Monitoring & Maintenance

### Railway Monitoring
- Railway Dashboard → Service → **"Metrics"**
- View CPU, Memory, Network usage
- Set up alerts for downtime

### Database Backups
1. Railway PostgreSQL auto-backups (Pro plan)
2. Manual backup:
   ```bash
   railway run pg_dump > backup.sql
   ```

### Logs
- Railway Dashboard → Service → **"Logs"**
- Filter by severity
- Download logs for debugging

---

## Next Steps

After successful deployment:

1. **Set up custom domain** (optional)
   - Railway: Settings → Networking → Custom Domain
   - Vercel: Settings → Domains

2. **Enable monitoring**
   - Railway built-in metrics
   - Consider Sentry for error tracking

3. **Configure CI/CD**
   - Railway auto-deploys on git push
   - Add GitHub Actions for tests before deployment

4. **Plan for scaling**
   - Monitor Railway usage
   - Consider horizontal scaling for high traffic

---

## Useful Commands

```bash
# Railway CLI commands
railway login                    # Login to Railway
railway link                     # Link local project to Railway
railway run python manage.py     # Run commands in Railway environment
railway logs                     # View service logs
railway status                   # Check deployment status
railway vars                     # List environment variables

# Database management
railway connect postgres         # Connect to PostgreSQL
railway run psql $DATABASE_URL  # Connect via psql
```

---

## Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway PostgreSQL Guide](https://docs.railway.app/databases/postgresql)
- [Vercel Documentation](https://vercel.com/docs)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)

---

**Deployment completed!** Your PneumAI application is now live:
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://pneumai-backend.up.railway.app`
- Database: Managed by Railway PostgreSQL
