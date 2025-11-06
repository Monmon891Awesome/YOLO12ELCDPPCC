# Vercel Deployment Guide & Architecture

## 🎯 Current Status

### ✅ What's Working:
- **Frontend**: React app builds successfully
- **Bundle Size**: 201.3 KB (optimized)
- **Patient Dashboard**: Fully functional with localStorage
- **PDF Generation**: Works client-side with jsPDF
- **Email Sharing**: Works via mailto protocol

### ⚠️ Architecture Issue:

**Problem**: Your Python FastAPI backend (`backend_server.py`) cannot run on Vercel's serverless platform.

**Why**: Vercel is optimized for:
- Static sites
- Serverless functions (Node.js, Python, Go, Ruby)
- Edge functions

It does **NOT** support:
- Long-running servers (FastAPI, Express, etc.)
- Large ML models (5.5MB best.pt file)
- Heavy processing (YOLO inference)

---

## 🏗️ Recommended Architecture

### **Option 1: Split Deployment (RECOMMENDED)**

**Frontend (Vercel):**
- React app
- Static assets
- Client-side PDF generation
- localStorage for data persistence

**Backend (Separate Service):**
- FastAPI + YOLOv12
- YOLO inference
- Image processing
- Hosted on:
  - **Railway** (easiest, has GPU support)
  - **Render** (free tier available)
  - **Fly.io** (good for ML workloads)
  - **AWS EC2** (most control)
  - **Heroku** (if you have credits)

### **Option 2: Vercel Serverless Functions (Limited)**

Convert backend to Vercel serverless functions:
- ⚠️ **Limitations**:
  - 50MB size limit (your model is 5.5MB - OK)
  - 10-second timeout (YOLO inference ~120ms - OK)
  - No persistent storage
  - Cold starts (~1-2 seconds)

---

## 🚀 Quick Fix: Deploy Frontend Now

Your frontend works perfectly on Vercel! Let's deploy it:

### Step 1: Update Environment Variable

```bash
# .env.production (create this file)
REACT_APP_YOLO_API_URL=https://your-backend-url.railway.app
```

### Step 2: Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "devCommand": "npm start",
  "framework": "create-react-app",
  "regions": ["sfo1"],
  "env": {
    "REACT_APP_YOLO_API_URL": "@yolo_backend_url"
  }
}
```

### Step 3: Deploy

```bash
# Already done automatically via GitHub push!
# Vercel auto-deploys on push to main
```

---

## 🐳 Backend Deployment Options

### **Option A: Railway (EASIEST)**

1. Create Railway account
2. Create new project → Deploy from GitHub
3. Select backend files
4. Add environment variables
5. Deploy!

**Railway Configuration:**
```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "python3 start_backend.py"
healthcheckPath = "/health"
healthcheckTimeout = 300

[[services]]
name = "yolo-backend"
runtime = "python3.11"
```

### **Option B: Render**

1. Create Render account
2. New Web Service
3. Connect GitHub repo
4. Build command: `pip install -r requirements.txt`
5. Start command: `python3 start_backend.py`

### **Option C: Docker + Fly.io**

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend_server.py start_backend.py best.pt ./

EXPOSE 8000

CMD ["python3", "start_backend.py"]
```

```bash
# Deploy to Fly.io
fly launch
fly deploy
```

---

## 🔧 Code Cleanup (Fix Warnings)

### Fix 1: Remove Unused Variables (PatientDashboard.jsx)

```javascript
// Remove these unused state variables:
// const [isDragging, setIsDragging] = useState(false);
// const [uploadProgress, setUploadProgress] = useState(null);
// const [quickUploadSuccess, setQuickUploadSuccess] = useState(false);

// Remove unused handlers:
// handleDragEnter, handleDragLeave, handleDragOver, handleDrop
// handleFileInputChange

// Remove unused import:
// import PatientPlatform from './PatientPlatform';

// Keep setters even if unused (for future use):
const [patientProfile] = useState(getPatientProfile());
const [appointments] = useState(getAppointments());
const [doctors] = useState(getDoctors());
```

### Fix 2: ScanUpload Hook Warning

```javascript
// Add handleFileSelect to dependency array
const handleDrop = useCallback((e) => {
  e.preventDefault();
  setIsDragging(false);
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    handleFileSelect(e.dataTransfer.files[0]);
  }
}, [handleFileSelect]); // Add this
```

### Fix 3: Accessibility Warnings

```jsx
// Replace <a href="#"> with <button>
// Before:
<a href="#">Click me</a>

// After:
<button type="button" onClick={handleClick}>Click me</button>
```

---

## 🎯 Performance Optimizations

### 1. Code Splitting

```javascript
// PatientDashboard.jsx - Lazy load heavy components
import { lazy, Suspense } from 'react';

const ScanResults = lazy(() => import('./components/ScanResults'));
const SimplifiedPatientPlatform = lazy(() => import('./SimplifiedPatientPlatform'));

// In render:
<Suspense fallback={<div>Loading...</div>}>
  <ScanResults scanData={currentScanResult} />
</Suspense>
```

### 2. Optimize Bundle Size

```bash
# Analyze bundle
npm install -g source-map-explorer
npm run build
source-map-explorer 'build/static/js/*.js'
```

### 3. Add Service Worker (PWA)

```javascript
// src/index.js
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Change to register
serviceWorkerRegistration.register();
```

### 4. Optimize Images

```bash
# Install image optimization
npm install sharp
```

---

## 📱 Mobile Optimization

### Add Responsive Meta Tags

```html
<!-- public/index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<meta name="theme-color" content="#4f46e5">
<meta name="apple-mobile-web-app-capable" content="yes">
```

### Update Manifest

```json
// public/manifest.json
{
  "short_name": "LungEvity",
  "name": "LungEvity AI Lung Cancer Detection",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#4f46e5",
  "background_color": "#ffffff"
}
```

---

## 🔐 Security Headers (Vercel)

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

## 🎬 Deployment Checklist

### Frontend (Vercel):
- [x] Build passes
- [ ] Environment variables set
- [ ] vercel.json configured
- [ ] Domain configured (optional)
- [ ] Analytics setup (optional)

### Backend (Railway/Render/etc):
- [ ] Account created
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Health check configured
- [ ] Domain/URL noted
- [ ] Update REACT_APP_YOLO_API_URL

### Post-Deployment:
- [ ] Test scan upload
- [ ] Test PDF download
- [ ] Test email sharing
- [ ] Test on mobile
- [ ] Check console for errors
- [ ] Monitor performance

---

## 💡 Quick Wins

### 1. Add Loading States

```javascript
// Show loading during scan upload
{isLoading && (
  <div className="loading-overlay">
    <Loader className="spin" size={48} />
    <p>Analyzing scan...</p>
  </div>
)}
```

### 2. Add Error Boundaries

```javascript
// ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong. Please refresh.</h2>;
    }
    return this.props.children;
  }
}
```

### 3. Add Toast Notifications

```bash
npm install react-hot-toast
```

```javascript
import toast from 'react-hot-toast';

// Replace alert() with:
toast.success('Scan uploaded successfully!');
toast.error('Upload failed. Please try again.');
```

---

## 🎯 Current Recommendation

**For NOW (Quick Deploy):**

1. ✅ **Frontend is already deployed on Vercel** (auto-deploys from GitHub)
2. ⚠️ **Backend needs separate hosting**
   - Easiest: Railway (sign up → connect repo → deploy)
   - Alternative: Render (free tier)
3. 🔧 **Update REACT_APP_YOLO_API_URL** once backend is deployed

**Your app will work in "demo mode" on Vercel:**
- ✅ UI works perfectly
- ✅ Patient dashboard functional
- ✅ localStorage persistence
- ✅ PDF generation
- ⚠️ CT scan upload will fail (no backend URL)

**To make CT scan upload work:**
- Deploy backend to Railway/Render
- Update environment variable
- Redeploy frontend

---

## 📞 Next Steps

1. **Clean up warnings** (optional, non-breaking)
2. **Deploy backend to Railway** (15 minutes)
3. **Update REACT_APP_YOLO_API_URL**
4. **Test end-to-end**

**Status**: Frontend is production-ready! Backend needs separate hosting.
