# Vercel Frontend Deployment Guide - PneumAI

Quick guide for deploying the PneumAI React frontend to Vercel.

---

## Prerequisites

- Railway backend deployed and running
- Railway backend public URL (e.g., `https://pneumai-backend.up.railway.app`)
- GitHub account connected to Vercel

---

## Step 1: Prepare Frontend for Production

### Update API Configuration

Make sure your frontend uses environment variables for the API URL:

**Create `.env.production` in frontend root:**
```bash
REACT_APP_API_URL=https://your-backend.up.railway.app
```

### Verify Build Configuration

**Check `package.json` has these scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## Step 2: Deploy to Vercel

### Option A: Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Click **"Add New Project"**

2. **Import Git Repository**
   - Click **"Import Git Repository"**
   - Select your GitHub repository
   - Click **"Import"**

3. **Configure Project**
   - **Framework Preset:** Vite (or React, depending on your setup)
   - **Root Directory:** `.` (if frontend is in root) or `frontend` (if in subdirectory)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist` (for Vite) or `build` (for CRA)

4. **Add Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend.up.railway.app
   ```

5. **Deploy**
   - Click **"Deploy"**
   - Wait ~2-3 minutes for build
   - Vercel will give you a URL: `https://your-app.vercel.app`

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? pneumai
# - Directory? ./
# - Override settings? N

# Deploy to production
vercel --prod
```

---

## Step 3: Configure Environment Variables

### In Vercel Dashboard

1. Go to your project → **Settings** → **Environment Variables**
2. Add:

```bash
# Backend API URL
REACT_APP_API_URL=https://your-backend.up.railway.app

# Optional: Analytics, etc.
REACT_APP_SENTRY_DSN=your-sentry-dsn
```

3. Click **"Save"**
4. Redeploy: **Deployments** → Select latest → **"Redeploy"**

---

## Step 4: Update Railway CORS

Your Railway backend needs to allow your Vercel domain:

1. **In Railway Dashboard** → Backend Service → **Variables**
2. Update `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-git-main.vercel.app
   ```
3. Backend will auto-redeploy with new CORS settings

---

## Step 5: Test Deployment

1. **Visit your Vercel URL:** `https://your-app.vercel.app`
2. **Test API connection:**
   - Try logging in
   - Check browser console for errors
   - Verify API calls go to Railway backend

### Common Issues

**CORS Errors:**
```
Access to fetch at 'https://backend.railway.app' from origin 'https://app.vercel.app'
has been blocked by CORS policy
```
**Fix:** Update `ALLOWED_ORIGINS` in Railway backend

**API Connection Timeout:**
- Check Railway backend is running
- Verify `REACT_APP_API_URL` is correct
- Check Railway logs for errors

---

## Step 6: Custom Domain (Optional)

### Add Custom Domain to Vercel

1. **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain: `pneumai.com`
4. Follow DNS configuration instructions

### Update CORS After Adding Domain

In Railway → Backend → Variables:
```bash
ALLOWED_ORIGINS=https://pneumai.com,https://www.pneumai.com,https://your-app.vercel.app
```

---

## Deployment Summary

### Your Live URLs

- **Frontend (Vercel):** `https://your-app.vercel.app`
- **Backend API (Railway):** `https://your-backend.up.railway.app`
- **Database (Railway):** Internal connection string

### Environment Variables

**Vercel (Frontend):**
- `REACT_APP_API_URL` → Railway backend URL

**Railway (Backend):**
- `DATABASE_URL` → Railway PostgreSQL
- `ALLOWED_ORIGINS` → Vercel frontend URL
- `SECRET_KEY` → Secure random string

---

## CI/CD

Both Vercel and Railway auto-deploy on git push:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Automatic deployments:
# ✅ Vercel: Frontend redeploys
# ✅ Railway: Backend redeploys
```

---

## Monitoring

### Vercel Analytics (Built-in)
- Dashboard → Your Project → **Analytics**
- View page views, performance, etc.

### Railway Logs
- Monitor backend errors
- View API request logs

---

## Cost Summary

**Vercel Free Tier:**
- ✅ Unlimited sites
- ✅ 100 GB bandwidth/month
- ✅ Automatic SSL
- ✅ Global CDN
- Perfect for production!

**When to upgrade:**
- Need more bandwidth (>100 GB/month)
- Want team collaboration features
- Need advanced analytics

---

## Useful Commands

```bash
# Vercel CLI
vercel                    # Deploy to preview
vercel --prod            # Deploy to production
vercel logs              # View deployment logs
vercel env ls            # List environment variables
vercel domains           # Manage domains

# Development
npm run dev              # Local development
npm run build            # Test production build
npm run preview          # Preview production build locally
```

---

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Railway CORS Guide](https://docs.railway.app/guides/cors)

---

**Frontend deployed successfully!** 🎉

Access your app at: `https://your-app.vercel.app`
