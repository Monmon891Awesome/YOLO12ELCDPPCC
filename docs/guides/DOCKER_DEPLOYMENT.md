# Docker Deployment Guide - M1 MacBook to Railway

## Quick Fix for Railway Deployment Issues

Railway was trying to build as Node.js project. Now we're using **Docker** which explicitly defines the Python backend.

---

## Option 1: Let Railway Build from Dockerfile (EASIEST)

Railway automatically detects and uses Dockerfile when present in your repo.

### Steps:

1. **Go to Railway**: https://railway.app
2. **Create New Project** → **Deploy from GitHub**
3. **Select your repository**: `YOLO12ELCDPPCC-1`
4. **Railway automatically detects Dockerfile** ✅
5. **Click Deploy** and wait 3-5 minutes
6. **Get your URL** from Railway dashboard

That's it! Railway will:
- Build the Docker image from your Dockerfile
- Install all Python dependencies
- Load the YOLO model
- Start the FastAPI server
- Provide you with a public URL

---

## Option 2: Build Locally on M1 MacBook (OPTIONAL)

If you want to test the Docker image locally before deploying:

### Prerequisites:
- Docker Desktop installed and running on M1 MacBook

### Steps:

#### 1. Start Docker Desktop
```bash
# Open Docker Desktop app on your Mac
# Wait for it to start (Docker icon in menu bar should be solid)
```

#### 2. Build the Docker Image
```bash
cd /Users/monskiemonmon427/YOLO12ELCDPPCC-1

# Build for M1 (ARM64) architecture
docker build --platform linux/arm64 -t yolo-backend:latest .
```

**Expected output:**
```
[+] Building 45.2s (12/12) FINISHED
=> [1/6] FROM docker.io/library/python:3.11-slim
=> [2/6] RUN apt-get update && apt-get install -y libgl1...
=> [3/6] COPY requirements.txt .
=> [4/6] RUN pip install --no-cache-dir -r requirements.txt
=> [5/6] COPY backend_server.py start_backend.py best.pt .
=> exporting to image
```

#### 3. Test Locally
```bash
# Run the container locally
docker run -p 8000:8000 yolo-backend:latest
```

**Expected output:**
```
INFO:     Started server process [1]
INFO:     Waiting for application startup.
Model loaded successfully: best.pt
Supported classes: ['adenocarcinoma', 'normal', 'squamous_cell_carcinoma']
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

#### 4. Test the API
Open another terminal:
```bash
# Test health endpoint
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","model_loaded":true,"model_name":"best.pt"}
```

#### 5. Stop the Container
```bash
# Press Ctrl+C in the terminal running Docker
# Or:
docker ps  # Get container ID
docker stop <container-id>
```

---

## Option 3: Build for Railway (Multi-Platform)

If you want to build an image compatible with Railway's platform:

```bash
# Build for both ARM64 (M1) and AMD64 (Railway)
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 -t yolo-backend:latest .
```

---

## Railway Deployment with Dockerfile

### How Railway Uses Your Dockerfile:

1. **Detects Dockerfile** in repo root
2. **Builds image** using Docker BuildKit
3. **Runs container** with:
   - Automatic PORT environment variable
   - Health checks on `/health` endpoint
   - Auto-restart on failure
4. **Exposes public URL** (HTTPS by default)

### Railway-Specific Features:

**Environment Variables** (auto-set by Railway):
- `PORT` - Railway assigns this dynamically
- Your `start_backend.py` already handles this:
  ```python
  port = int(os.environ.get("PORT", 8000))
  ```

**Health Checks**:
- Dockerfile includes `HEALTHCHECK` directive
- Railway uses `/health` endpoint (from railway.toml)
- Restarts container if unhealthy

**Automatic HTTPS**:
- Railway provides SSL certificates
- Your backend URL: `https://[app-name].railway.app`

---

## Troubleshooting

### Issue 1: Docker Build Fails on M1

**Error**: "platform mismatch" or "exec format error"

**Fix**: Use `--platform` flag:
```bash
docker build --platform linux/arm64 -t yolo-backend:latest .
```

### Issue 2: Docker Desktop Not Running

**Error**: "Cannot connect to Docker daemon"

**Fix**:
1. Open Docker Desktop app
2. Wait for it to fully start
3. Check Docker icon in menu bar is solid (not animated)

### Issue 3: Railway Still Trying npm ci

**Error**: Railway runs npm instead of Docker

**Fix**: Railway might be caching old build config
1. Go to Railway dashboard
2. Click your service → Settings
3. Scroll to "Danger Zone"
4. Click "Redeploy" or "Delete Service"
5. Create new service from GitHub (will detect Dockerfile)

### Issue 4: Model Loading Timeout

**Error**: Health check fails, container restarts

**Fix**: The YOLO model (5.5MB) needs time to load
- `railway.toml` already sets `healthcheckTimeout = 300` (5 minutes)
- Dockerfile sets `--start-period=40s` for health check
- Should be enough for model loading

---

## What's in the Docker Image?

### Files Included:
- `backend_server.py` - FastAPI application
- `start_backend.py` - Entry point
- `requirements.txt` - Python dependencies
- `best.pt` - YOLOv12 model (5.5MB)

### Files Excluded (via .dockerignore):
- React frontend (`src/`, `public/`, `node_modules/`)
- Documentation (`*.md`, `docs/`)
- Test files (`*.png`, `*.jpg`)
- Git files (`.git/`)

### System Dependencies:
- Python 3.11
- OpenCV libraries (`libgl1-mesa-glx`)
- GLIB, X11 libraries
- OpenMP (`libgomp1`)

### Python Packages (from requirements.txt):
- FastAPI
- Uvicorn
- OpenCV (cv2)
- Ultralytics (YOLO)
- NumPy
- Pillow
- And all other backend dependencies

### Image Size:
- Base image: ~150MB
- With dependencies: ~800MB-1GB
- Optimized with `--no-cache-dir` for pip

---

## Deployment Checklist

### Before Deploying:

- [x] Dockerfile created
- [x] .dockerignore created
- [x] Files committed to GitHub
- [ ] Docker Desktop running (for local testing)
- [ ] Railway account created

### Railway Deployment:

- [ ] Create new Railway project
- [ ] Connect GitHub repository
- [ ] Verify Dockerfile is detected
- [ ] Deploy and wait for build
- [ ] Check build logs for errors
- [ ] Test health endpoint
- [ ] Copy deployment URL

### After Deployment:

- [ ] Update Vercel environment variable:
  - `REACT_APP_YOLO_API_URL=https://[railway-url].railway.app`
- [ ] Redeploy Vercel frontend
- [ ] Test CT scan upload end-to-end
- [ ] Verify PDF download works
- [ ] Verify share with doctor works

---

## Quick Commands Reference

```bash
# Start Docker Desktop (GUI)
open -a Docker

# Build Docker image
docker build -t yolo-backend:latest .

# Run locally
docker run -p 8000:8000 yolo-backend:latest

# Test health endpoint
curl http://localhost:8000/health

# View running containers
docker ps

# Stop container
docker stop <container-id>

# View logs
docker logs <container-id>

# Remove old images
docker image prune -a
```

---

## Expected Build Time

- **Local Build (M1 MacBook)**: 2-4 minutes
- **Railway Build**: 3-5 minutes

### Build Stages:
1. Pull Python 3.11-slim base image (30s)
2. Install system dependencies (45s)
3. Install Python packages (2-3 minutes)
4. Copy application files (5s)
5. Final image export (15s)

---

## Success Indicators

### Local Build Success:
```
Successfully built abc123def456
Successfully tagged yolo-backend:latest
```

### Local Run Success:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
Model loaded successfully: best.pt
Supported classes: ['adenocarcinoma', 'normal', 'squamous_cell_carcinoma']
```

### Railway Deployment Success:
- Build logs show: "Successfully built"
- Deployment status: "Active"
- Health checks: Passing
- Public URL accessible
- `/health` endpoint returns 200 OK

---

## Cost Estimate (Railway)

### With Docker Deployment:

**Free Tier**:
- $5 free credits/month
- ~500 hours execution time
- Perfect for testing

**Hobby Plan** ($5/month):
- Pay-as-you-go after free credits
- Docker container runs only when needed
- Can pause when not in use

**Estimated Usage**:
- Container startup: ~30 seconds
- Per CT scan: 2-3 seconds processing
- 100 scans/day = ~5 minutes runtime/day
- Monthly: ~2.5 hours runtime
- **Cost**: $0-2/month (within free tier)

---

## Next Steps

### Immediate:

1. **Start Docker Desktop** on your M1 MacBook
2. **(Optional) Test build locally**: `docker build -t yolo-backend:latest .`
3. **Deploy to Railway**: Railway auto-detects Dockerfile
4. **Get Railway URL** from dashboard
5. **Update Vercel** with Railway URL

### After Deployment:

1. Test end-to-end CT scan upload
2. Verify all features work
3. Move to Doctor Dashboard implementation

---

## Support

If you encounter issues:

1. **Check Docker is running**: `docker ps` should work
2. **Check Railway build logs**: Railway dashboard → Service → Deployments → Logs
3. **Check Railway runtime logs**: Look for Python errors or model loading issues
4. **Verify Dockerfile syntax**: Should match the provided template exactly

---

**Status**: ✅ Dockerfile ready for M1 MacBook and Railway deployment

**Next**: Start Docker Desktop and deploy to Railway!

🚀 This will work on Railway because Dockerfile explicitly defines the Python environment, bypassing the Node.js detection issue.
