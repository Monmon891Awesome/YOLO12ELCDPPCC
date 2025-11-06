# Quick Start Guide
## Get Your YOLOv12 Lung Cancer Detection System Running in 5 Minutes

---

## Prerequisites Check

Before starting, ensure you have:
- [x] Python 3.8+ installed (`python --version`)
- [x] Node.js 14+ installed (`node --version`)
- [x] `best.pt` model file in this directory

---

## Step 1: Install Backend Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- FastAPI (web framework)
- Ultralytics (YOLOv12)
- OpenCV (image processing)
- And other required packages

---

## Step 2: Start the Backend Server

```bash
python start_backend.py
```

**Expected output:**
```
✓ Found best.pt model (5.26 MB)
✓ All required dependencies are installed
✓ All checks passed!

Starting LungEvity YOLOv12 Backend Server
Server will be available at:
  - Local:   http://localhost:8000
  - Network: http://0.0.0.0:8000
```

**Leave this terminal running!**

---

## Step 3: Verify Backend is Working

Open your browser and visit:
http://localhost:8000/health

You should see:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "classes": ["adenocarcinoma", "large_cell_carcinoma", "normal", "squamous_cell_carcinoma"]
}
```

---

## Step 4: Start the Frontend

Open a **NEW terminal** and run:

```bash
npm start
```

The React app will open at http://localhost:3000

---

## Step 5: Test the Integration

1. Navigate to the **Patient Dashboard** in your web app
2. Look for the **"Upload CT Scan"** section
3. Upload a CT scan image (DICOM, JPEG, or PNG)
4. Click **"Upload & Analyze Scan"**
5. View the results:
   - Detection status
   - Cancer type (if detected)
   - Confidence score
   - Risk level
   - Annotated image with bounding boxes

---

## Troubleshooting

### Backend Issues

**Error: "best.pt not found"**
```bash
# Check if best.pt exists
ls -la best.pt
# If missing, place best.pt in the project root directory
```

**Error: "Module not found"**
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

**Error: "Port 8000 already in use"**
```bash
# Find and kill the process using port 8000
lsof -ti:8000 | xargs kill -9
# Or change the port in backend_server.py
```

### Frontend Issues

**Error: "Cannot connect to backend"**
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check `.env` has: `REACT_APP_YOLO_API_URL=http://localhost:8000`
3. Restart frontend: Stop with Ctrl+C, then `npm start` again

**Error: "CORS error"**
- The backend already has CORS configured for localhost:3000
- Clear browser cache and reload

---

## What's Next?

### View API Documentation
Visit http://localhost:8000/docs for interactive API documentation

### Test Different Scans
Try uploading different types of CT scans to see how the model performs

### Read Full Documentation
See `BACKEND_INTEGRATION.md` for detailed information about:
- API endpoints
- Model information
- Production deployment
- Security considerations

---

## Need Help?

1. Check `BACKEND_INTEGRATION.md` for detailed troubleshooting
2. Review backend logs in your terminal
3. Check browser console (F12) for frontend errors
4. Test API directly at http://localhost:8000/docs

---

## System Architecture

```
┌─────────────────────┐
│   React Frontend    │
│  (localhost:3000)   │
└──────────┬──────────┘
           │ HTTP
           ▼
┌─────────────────────┐         ┌──────────────┐
│   FastAPI Backend   │────────▶│   best.pt    │
│  (localhost:8000)   │  YOLO   │   Model      │
└─────────────────────┘         └──────────────┘
```

**That's it! Your lung cancer detection system is now running!**
