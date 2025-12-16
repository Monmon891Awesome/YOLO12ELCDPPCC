# PneumAI Deployment Architecture

Complete overview of local development and production deployment setup.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     LOCAL DEVELOPMENT                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (localhost:3000)                                   │
│       │                                                       │
│       │ API Requests                                         │
│       ▼                                                       │
│  Backend API (localhost:8000)                               │
│       │                                                       │
│       │ DB Queries                                           │
│       ▼                                                       │
│  PostgreSQL (localhost:5432) ◄─── pgAdmin (localhost:5050)  │
│       │                                                       │
│  Redis (localhost:6379)                                      │
│                                                               │
│  All services run in Docker via docker-compose               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   PRODUCTION DEPLOYMENT                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐                                            │
│  │    VERCEL    │  Frontend (React)                         │
│  │ pneumai.com  │  https://your-app.vercel.app              │
│  └───────┬──────┘                                            │
│          │                                                    │
│          │ HTTPS API Calls                                   │
│          │                                                    │
│          ▼                                                    │
│  ┌──────────────────────────────────────┐                   │
│  │           RAILWAY                     │                   │
│  │                                       │                   │
│  │  ┌─────────────────┐                 │                   │
│  │  │ Backend API     │                 │                   │
│  │  │ FastAPI + YOLO  │                 │                   │
│  │  │ Port 8000       │                 │                   │
│  │  └────────┬────────┘                 │                   │
│  │           │                           │                   │
│  │           │ Internal Network          │                   │
│  │           │                           │                   │
│  │           ▼                           │                   │
│  │  ┌─────────────────┐                 │                   │
│  │  │ PostgreSQL 15   │                 │                   │
│  │  │ (Managed)       │                 │                   │
│  │  └─────────────────┘                 │                   │
│  │                                       │                   │
│  │  ┌─────────────────┐                 │                   │
│  │  │ Redis 7         │ (Future)        │                   │
│  │  │ (Managed)       │                 │                   │
│  │  └─────────────────┘                 │                   │
│  │                                       │                   │
│  └──────────────────────────────────────┘                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Environment Comparison

| Component | Local Development | Production (Railway/Vercel) |
|-----------|-------------------|----------------------------|
| **Frontend** | localhost:3000 | Vercel (Global CDN) |
| **Backend API** | Docker (localhost:8000) | Railway Container |
| **PostgreSQL** | Docker (localhost:5432) | Railway Managed DB |
| **Redis** | Docker (localhost:6379) | Railway Managed Redis |
| **pgAdmin** | Docker (localhost:5050) | Connect remotely |
| **File Storage** | Local uploads/ directory | Ephemeral (or AWS S3) |
| **YOLO Model** | Local best.pt | Included in Docker image |

---

## Configuration Files by Environment

### Local Development

**Docker Compose:** `docker-compose.yml`
```yaml
services:
  - db (PostgreSQL 15)
  - pgadmin
  - redis
  - backend (FastAPI)
```

**Environment:** `.env.local`
```bash
DATABASE_URL=postgresql://pneumai_admin:password@localhost:5432/pneumai_db
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
DEBUG=true
```

### Production (Railway)

**Backend Environment Variables:**
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Auto-injected by Railway
FRONTEND_URL=https://your-app.vercel.app
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=<secure-random-string>
ALLOWED_ORIGINS=https://your-app.vercel.app
```

**Frontend (Vercel) Environment Variables:**
```bash
REACT_APP_API_URL=https://pneumai-backend.up.railway.app
```

---

## Deployment Workflow

### Initial Setup (One-time)

```mermaid
graph TD
    A[Push Code to GitHub] --> B[Create Railway Project]
    B --> C[Add PostgreSQL Database]
    C --> D[Deploy Backend from GitHub]
    D --> E[Initialize Database Schema]
    E --> F[Configure Environment Variables]
    F --> G[Deploy Frontend to Vercel]
    G --> H[Update CORS Settings]
    H --> I[Test Production Deployment]
```

### Continuous Deployment (Ongoing)

```bash
# Local development
git checkout -b feature/new-feature
# ... make changes ...
git commit -m "Add new feature"
git push origin feature/new-feature

# Create pull request on GitHub
# ... review and merge to main ...

# Automatic deployments:
# ✅ Railway: Backend redeploys automatically
# ✅ Vercel: Frontend redeploys automatically
```

---

## Database Migration Strategy

### Schema Updates

**Local Development:**
```bash
# 1. Create migration SQL file
echo "ALTER TABLE users ADD COLUMN phone VARCHAR(20);" > database/migrations/003_add_phone.sql

# 2. Apply to local database
docker exec -i pneumai-db psql -U pneumai_admin -d pneumai_db < database/migrations/003_add_phone.sql

# 3. Test locally
npm run test
```

**Production (Railway):**
```bash
# Option A: Using Railway CLI
railway connect postgres
\i database/migrations/003_add_phone.sql

# Option B: Using pgAdmin
# Connect to Railway PostgreSQL
# Run migration SQL in Query Tool
```

---

## Environment Variables Reference

### Backend (FastAPI)

| Variable | Local | Production | Description |
|----------|-------|------------|-------------|
| `DATABASE_URL` | localhost:5432 | Railway PostgreSQL | Database connection string |
| `SECRET_KEY` | dev-key | Secure random | JWT secret |
| `ENVIRONMENT` | development | production | Environment mode |
| `DEBUG` | true | false | Debug mode |
| `FRONTEND_URL` | http://localhost:3000 | https://app.vercel.app | Frontend URL for CORS |
| `ALLOWED_ORIGINS` | localhost:3000,3001 | app.vercel.app | CORS allowed origins |
| `UPLOAD_DIR` | ./uploads | /tmp/uploads | File upload directory |
| `MODEL_PATH` | ./best.pt | ./best.pt | YOLO model path |

### Frontend (React)

| Variable | Local | Production | Description |
|----------|-------|------------|-------------|
| `REACT_APP_API_URL` | http://localhost:8000 | https://backend.railway.app | Backend API URL |

---

## Port Reference

### Local Development Ports

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| Frontend | 3000 | http://localhost:3000 | React dev server |
| Backend API | 8000 | http://localhost:8000 | FastAPI |
| PostgreSQL | 5432 | localhost:5432 | Database |
| pgAdmin | 5050 | http://localhost:5050 | DB management |
| Redis | 6379 | localhost:6379 | Cache |

### Production URLs

| Service | URL | Provider |
|---------|-----|----------|
| Frontend | https://your-app.vercel.app | Vercel |
| Backend API | https://pneumai-backend.up.railway.app | Railway |
| PostgreSQL | Internal (Railway network) | Railway |

---

## Security Best Practices

### ✅ Implemented

- [x] Environment-based configuration
- [x] Separate development and production databases
- [x] CORS restrictions
- [x] Password hashing (bcrypt)
- [x] HTTPS in production (automatic)
- [x] Secret key for JWT
- [x] Database connection pooling

### 📋 TODO for Production

- [ ] Generate secure SECRET_KEY (32+ chars)
- [ ] Set up SSL certificate monitoring
- [ ] Enable Railway private networking for database
- [ ] Configure rate limiting on API
- [ ] Set up Sentry for error tracking
- [ ] Enable database backups
- [ ] Configure CloudFlare or CDN
- [ ] Add API authentication middleware
- [ ] Set up monitoring and alerts

---

## Cost Breakdown (Estimated)

### Development (Free)
- Docker Desktop: Free
- PostgreSQL (local): Free
- All local services: Free

### Production

**Vercel (Frontend):**
- Free Tier: $0/month
  - 100 GB bandwidth
  - Unlimited deployments
  - Global CDN

**Railway (Backend + Database):**
- Hobby Plan: ~$5/month free credit
- PostgreSQL: $5-10/month
- Backend Container: $10-15/month
- **Total: ~$20-25/month**

**Optional Add-ons:**
- Custom domain: ~$12/year
- AWS S3 (file storage): ~$5-10/month
- Sentry (error tracking): Free tier available
- **Total with add-ons: ~$30-40/month**

---

## Backup Strategy

### Database Backups

**Local Development:**
```bash
# Backup
docker exec pneumai-db pg_dump -U pneumai_admin pneumai_db > backup.sql

# Restore
docker exec -i pneumai-db psql -U pneumai_admin pneumai_db < backup.sql
```

**Production (Railway):**
```bash
# Backup (using Railway CLI)
railway run pg_dump > production_backup.sql

# Restore
railway run psql < production_backup.sql
```

**Automated Backups:**
- Railway Pro: Daily automated backups
- Consider weekly manual backups to S3

---

## Monitoring & Alerts

### Railway Monitoring
- CPU usage
- Memory usage
- Network traffic
- Deployment logs
- Error tracking

### Vercel Analytics
- Page views
- Performance metrics
- Geographic distribution
- Browser analytics

### Recommended Add-ons
- **Sentry**: Error tracking and performance monitoring
- **LogDNA/LogRocket**: Advanced log management
- **UptimeRobot**: Uptime monitoring (free)

---

## Scaling Strategy

### Current Setup (Phase 5)
- Single backend instance
- Single PostgreSQL instance
- Suitable for: 100-1000 users

### Future Scaling (Phase 7+)

**Horizontal Scaling:**
- Multiple backend instances (Railway auto-scaling)
- Load balancer (Railway provides)
- Redis for session management
- CDN for static assets (Vercel provides)

**Database Scaling:**
- Read replicas
- Connection pooling (already implemented)
- Query optimization
- Indexing (already implemented)

**Caching:**
- Redis for API responses
- CloudFlare for CDN
- Browser caching

---

## Quick Reference Commands

### Local Development

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend

# Connect to database
docker exec -it pneumai-db psql -U pneumai_admin -d pneumai_db

# Restart service
docker-compose restart backend
```

### Railway Deployment

```bash
# Login
railway login

# Deploy
railway up

# View logs
railway logs

# Connect to database
railway connect postgres

# Run commands
railway run python manage.py migrate
```

### Vercel Deployment

```bash
# Deploy
vercel

# Production deploy
vercel --prod

# View logs
vercel logs

# Environment variables
vercel env ls
```

---

## Support & Resources

**Documentation:**
- [Local Setup Guide](README.md)
- [Railway Deployment](RAILWAY_DEPLOYMENT.md)
- [Vercel Deployment](VERCEL_DEPLOYMENT.md)
- [Database Schema](database/init/01_schema.sql)

**External Resources:**
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**Deployment architecture complete!** 🚀

Your PneumAI application is now ready for both local development and production deployment.
