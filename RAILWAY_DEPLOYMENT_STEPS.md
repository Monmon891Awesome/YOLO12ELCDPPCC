# Railway Backend Deployment - Step-by-Step Guide

## Quick Start: Deploy Your Python Backend in 5 Minutes

Your Patient Dashboard frontend is already live on Vercel! Now let's deploy the backend to Railway so CT scan uploads work.

---

## Prerequisites

- GitHub account (already have this)
- Railway account (free tier available)
- Backend code pushed to GitHub (already done)

---

## Step 1: Create Railway Account

1. Go to https://railway.app
2. Click "Login" or "Start a New Project"
3. Sign up with GitHub (recommended for easy integration)
4. Authorize Railway to access your GitHub repositories

---

## Step 2: Create New Project

1. Click "New Project" button
2. Select "Deploy from GitHub repo"
3. Find and select your repository: `YOLO12ELCDPPCC-1`
4. Railway will automatically detect it's a Python project

---

## Step 3: Configure Deployment

Railway will automatically:
- Detect `railway.toml` configuration
- Install Python 3.11
- Install dependencies from `requirements.txt`
- Run health checks on `/health` endpoint

### Files Railway Uses:

1. **`railway.toml`** (already created)
   - Builder: NIXPACKS
   - Start command: `python3 start_backend.py`
   - Health check: `/health` endpoint
   - Auto-restart on failure

2. **`requirements.txt`** (already exists)
   - All Python dependencies
   - FastAPI, Uvicorn, OpenCV, YOLO, etc.

3. **`start_backend.py`** (already exists)
   - Entry point for backend server

4. **`best.pt`** (5.5MB YOLO model)
   - Lung cancer detection model
   - Automatically included in deployment

---

## Step 4: Environment Variables (Optional)

Railway automatically sets:
- `PORT` - Server port (Railway manages this)
- `HOST` - Server host (Railway manages this)

Your backend code already uses these via `start_backend.py`:
```python
port = int(os.environ.get("PORT", 8000))
```

No additional environment variables needed!

---

## Step 5: Deploy

1. Click "Deploy" button
2. Wait for deployment to complete (2-3 minutes)
   - Installing dependencies
   - Loading YOLO model
   - Starting FastAPI server
3. Look for "Deployment successful" message

---

## Step 6: Get Your Backend URL

1. In Railway dashboard, click on your service
2. Click "Settings" tab
3. Scroll to "Domains" section
4. Copy the generated URL (looks like: `https://yolo-backend-production-xxxx.up.railway.app`)

**Example URL**:
```
https://yolo-backend-production-a3f2.up.railway.app
```

---

## Step 7: Update Frontend Environment Variable

Now connect your Vercel frontend to Railway backend:

### Option A: Vercel Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Settings" → "Environment Variables"
4. Add new variable:
   - **Name**: `REACT_APP_YOLO_API_URL`
   - **Value**: `https://[your-railway-url].railway.app` (paste URL from Step 6)
   - **Environment**: Production, Preview, Development (select all)
5. Click "Save"
6. Go to "Deployments" → Click "..." → "Redeploy"

### Option B: Local `.env.production` File

```bash
# Create .env.production file
echo "REACT_APP_YOLO_API_URL=https://[your-railway-url].railway.app" > .env.production

# Commit and push
git add .env.production
git commit -m "Add production backend URL"
git push
```

Vercel will automatically redeploy with new environment variable.

---

## Step 8: Verify Deployment

### Check Backend Health:

Visit: `https://[your-railway-url].railway.app/health`

**Expected Response**:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_name": "best.pt"
}
```

### Check API Endpoints:

Visit: `https://[your-railway-url].railway.app/docs`

You should see FastAPI Swagger documentation with endpoints:
- `POST /api/v1/yolo/detect` - CT scan analysis
- `GET /health` - Health check
- `GET /api/v1/yolo/supported-classes` - Available classes

---

## Step 9: Test End-to-End

1. **Go to your Vercel frontend**: `https://[your-vercel-url].vercel.app`
2. **Navigate to "Home" tab**
3. **Upload a CT scan image**
4. **Wait for results** (should take 2-3 seconds)
5. **Verify you see**:
   - Detection results
   - Risk level
   - Annotated image
   - Edge detection overlay
   - Contour analysis

6. **Test PDF Download**:
   - Click "Download PDF" in results
   - Verify PDF contains all scan data

7. **Test Share with Doctor**:
   - Click "Share with Doctor"
   - Select a doctor
   - Verify email client opens with pre-filled message

---

## Troubleshooting

### Issue 1: Railway deployment fails

**Check Logs**:
1. Railway dashboard → Your service → "Deployments"
2. Click on failed deployment → View logs
3. Look for errors in:
   - Dependency installation
   - Model loading (best.pt)
   - Port binding

**Common Fix**:
- Ensure `requirements.txt` includes all dependencies
- Ensure `best.pt` file is committed to repo
- Check `start_backend.py` uses `PORT` env variable

### Issue 2: Frontend can't connect to backend

**Check CORS**:
Backend already configured to allow all origins:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Check Environment Variable**:
1. Vercel dashboard → Settings → Environment Variables
2. Verify `REACT_APP_YOLO_API_URL` is set correctly
3. Ensure no trailing slash: `https://[url].railway.app` (not `https://[url].railway.app/`)

### Issue 3: Scan upload returns 404 or 500 error

**Check Backend URL**:
- Frontend expects: `POST /api/v1/yolo/detect`
- Full URL: `https://[railway-url].railway.app/api/v1/yolo/detect`

**Verify Backend is Running**:
```bash
curl https://[your-railway-url].railway.app/health
```

Should return:
```json
{"status": "healthy", "model_loaded": true}
```

### Issue 4: Railway timeout errors

**Increase Health Check Timeout**:
Already configured in `railway.toml`:
```toml
healthcheckTimeout = 300  # 5 minutes
```

**Check Model Loading Time**:
- YOLO model (5.5MB) takes ~10-15 seconds to load
- Railway waits for `/health` endpoint to return success
- If timeout persists, check Railway logs for errors

---

## Railway Configuration Explained

### `railway.toml`

```toml
[build]
builder = "NIXPACKS"  # Automatic Python detection

[deploy]
startCommand = "python3 start_backend.py"  # Entry point
healthcheckPath = "/health"                 # Health check endpoint
healthcheckTimeout = 300                    # Wait up to 5 minutes
restartPolicyType = "ON_FAILURE"            # Auto-restart on crash
restartPolicyMaxRetries = 3                 # Max 3 restart attempts

[[services]]
name = "yolo-backend"  # Service name in Railway dashboard
```

---

## Cost Estimate

### Railway Pricing:

**Free Tier**:
- $5 free credits per month
- ~500 hours of execution time
- Perfect for testing and low traffic

**Hobby Plan** ($5/month):
- $5 credits per month
- Pay for what you use
- Suitable for medium traffic

**Estimated Usage**:
- Each CT scan analysis: ~2-3 seconds
- 100 scans/day = 300 seconds = 5 minutes/day
- Monthly: ~2.5 hours of compute time
- **Cost**: Well within free tier

### Vercel Pricing:

**Hobby Plan** (Free):
- 100GB bandwidth per month
- Unlimited deployments
- Your frontend is static (very lightweight)
- **Cost**: Free

**Total Monthly Cost**: $0 (free tier) or $5 (Railway Hobby)

---

## Production Considerations

### Security:

1. **HTTPS**: Railway provides automatic HTTPS
2. **Environment Variables**: Store sensitive data in Railway secrets
3. **CORS**: Currently allows all origins (`*`)
   - For production, restrict to your Vercel domain:
   ```python
   allow_origins=[
       "https://[your-vercel-url].vercel.app",
       "http://localhost:3000"  # for local development
   ]
   ```

### Performance:

1. **Caching**: Add Redis for scan result caching
2. **Database**: Move from localStorage to PostgreSQL
3. **CDN**: Use Railway's CDN for faster image delivery
4. **Monitoring**: Enable Railway metrics and alerts

### Scaling:

1. **Horizontal Scaling**: Railway auto-scales based on traffic
2. **Database**: Add PostgreSQL service in Railway
3. **File Storage**: Move to AWS S3 for scan images
4. **Authentication**: Add JWT-based auth

---

## Next Steps After Deployment

### Immediate (Required):

1. ✅ Deploy backend to Railway
2. ✅ Get backend URL
3. ✅ Update Vercel environment variable
4. ✅ Test end-to-end scan upload
5. ✅ Verify PDF download works
6. ✅ Verify email sharing works

### Soon (Before Doctor Dashboard):

1. Clean up ESLint warnings (non-breaking)
2. Add error boundaries for better error handling
3. Add loading states for scan upload
4. Test on mobile devices

### Later (Production Enhancements):

1. Implement backend database (PostgreSQL)
2. Add user authentication (JWT)
3. Move to AWS S3 for image storage
4. Implement real email service (SendGrid)
5. Add real-time notifications
6. Build Doctor Dashboard

---

## Quick Reference

### Important URLs:

- **Railway Dashboard**: https://railway.app/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Backend Health Check**: `https://[railway-url].railway.app/health`
- **Backend API Docs**: `https://[railway-url].railway.app/docs`
- **Frontend**: `https://[vercel-url].vercel.app`

### Important Files:

- `railway.toml` - Railway configuration
- `start_backend.py` - Backend entry point
- `backend_server.py` - FastAPI server code
- `best.pt` - YOLO model (5.5MB)
- `.env.production` - Frontend environment variables

### Environment Variables:

**Vercel (Frontend)**:
- `REACT_APP_YOLO_API_URL` - Backend URL from Railway

**Railway (Backend)**:
- `PORT` - Auto-set by Railway
- `HOST` - Auto-set by Railway

---

## Success Checklist

Before moving to Doctor Dashboard:

- [ ] Railway account created
- [ ] Backend deployed successfully
- [ ] Backend health check returns success
- [ ] Vercel environment variable updated
- [ ] Frontend redeployed
- [ ] CT scan upload works
- [ ] Results display correctly
- [ ] PDF download works
- [ ] Email sharing works
- [ ] Scan history persists
- [ ] Delete scan works
- [ ] Mobile responsive works

---

## Support

If you encounter issues:

1. **Check Railway Logs**: Railway dashboard → Your service → Logs
2. **Check Vercel Logs**: Vercel dashboard → Your project → Deployments → View logs
3. **Check Browser Console**: F12 → Console tab
4. **Check Network Tab**: F12 → Network tab (look for failed API calls)

---

**Status**: Ready to deploy! Follow the steps above and your full-stack application will be live in 5-10 minutes.

**Timeline**:
- Railway deployment: 3-5 minutes
- Vercel environment update: 1 minute
- Vercel redeploy: 2-3 minutes
- Testing: 2-3 minutes

**Total Time**: ~10 minutes to full deployment

---

Good luck! You're almost there! 🚀
