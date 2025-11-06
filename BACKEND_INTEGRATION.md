# Backend Integration Guide
## YOLOv12 Lung Cancer Detection with Frontend

This guide explains how to integrate the `best.pt` YOLOv12 model with your LungEvity web application.

---

## Overview

The integration consists of:
- **Backend**: FastAPI server that loads `best.pt` and processes CT scans
- **Frontend**: React application that uploads scans and displays results
- **API Communication**: RESTful API endpoints for scan analysis

---

## Quick Start

### Prerequisites

1. **Python 3.8+** installed
2. **Node.js 14+** installed (for frontend)
3. **best.pt** model file in the project root directory

### Step 1: Install Backend Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt
```

**Required packages:**
- fastapi - Web framework
- uvicorn - ASGI server
- ultralytics - YOLOv12 model library
- opencv-python - Image processing
- pillow - Image handling
- numpy - Numerical operations
- pydicom - DICOM file support (optional)

### Step 2: Start the Backend Server

**Option A: Using the startup script (recommended)**
```bash
python start_backend.py
```

**Option B: Using uvicorn directly**
```bash
uvicorn backend_server:app --host 0.0.0.0 --port 8000 --reload
```

The server will start at `http://localhost:8000`

### Step 3: Verify Backend is Running

Open your browser and navigate to:
- **Health Check**: http://localhost:8000/health
- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

You should see a response like:
```json
{
  "status": "healthy",
  "model": "YOLOv12",
  "modelPath": "best.pt",
  "version": "1.0.0",
  "model_loaded": true,
  "classes": ["adenocarcinoma", "large_cell_carcinoma", "normal", "squamous_cell_carcinoma"]
}
```

### Step 4: Start the Frontend

In a new terminal:

```bash
# Install frontend dependencies (if not already installed)
npm install

# Start the React development server
npm start
```

The frontend will open at `http://localhost:3000`

---

## Model Information

### Cancer Types Detected

The `best.pt` model is trained to detect 4 classes:

1. **Adenocarcinoma** - Most common type of lung cancer
2. **Large Cell Carcinoma** - Fast-growing cancer with large cells
3. **Squamous Cell Carcinoma** - Cancer in flat cells lining airways
4. **Normal** - Healthy lung tissue (no cancer detected)

### Risk Level Classification

Based on confidence scores:
- **High Risk**: confidence ≥ 0.8 (80%)
- **Medium Risk**: 0.5 ≤ confidence < 0.8 (50-80%)
- **Low Risk**: 0.3 ≤ confidence < 0.5 (30-50%)
- **None**: confidence < 0.3 or "normal" class

---

## API Endpoints

### 1. Health Check
**GET** `/health`

Check if the API and model are running properly.

**Response:**
```json
{
  "status": "healthy",
  "model": "YOLOv12",
  "model_loaded": true
}
```

### 2. Analyze Single Scan
**POST** `/api/v1/scan/analyze`

Upload and analyze a CT scan image.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `scan` (file) - CT scan image

**Supported formats:**
- DICOM (.dcm)
- NIFTI (.nii, .nii.gz)
- JPEG (.jpg, .jpeg)
- PNG (.png)

**Max file size:** 100MB

**Response:**
```json
{
  "scanId": "scan_abc123",
  "status": "completed",
  "uploadTime": "2025-11-05T20:00:00Z",
  "processingTime": 2.5,
  "results": {
    "detected": true,
    "confidence": 0.87,
    "riskLevel": "high",
    "topClass": "adenocarcinoma",
    "detections": [
      {
        "class": "adenocarcinoma",
        "confidence": 0.87,
        "boundingBox": {
          "x": 150,
          "y": 200,
          "width": 50,
          "height": 45
        },
        "characteristics": {
          "size_mm": 8.5,
          "shape": "irregular",
          "density": "solid"
        }
      }
    ],
    "imageUrl": "/api/v1/scan/scan_abc123/image",
    "annotatedImageUrl": "/api/v1/scan/scan_abc123/annotated"
  },
  "metadata": {
    "imageSize": {
      "width": 512,
      "height": 512
    },
    "fileSize": 2048576,
    "format": "JPEG"
  }
}
```

### 3. Get Scan Images
**GET** `/api/v1/scan/{scanId}/image` - Original image
**GET** `/api/v1/scan/{scanId}/annotated` - Image with bounding boxes

### 4. Batch Analysis
**POST** `/api/v1/scan/batch-analyze`

Analyze multiple CT scan slices at once.

### 5. Get Thresholds
**GET** `/api/v1/config/thresholds`

Get confidence threshold configuration.

---

## Frontend Integration

The frontend already has the API service configured in `src/services/yoloApi.js`.

### Using the ScanUpload Component

```jsx
import ScanUpload from './components/ScanUpload';

function MyComponent() {
  const handleScanComplete = (result) => {
    console.log('Scan result:', result);
    // Handle the scan result
    // result.results.detected - boolean
    // result.results.confidence - number (0-1)
    // result.results.riskLevel - string
    // result.results.topClass - string
  };

  const handleError = (error) => {
    console.error('Scan error:', error);
  };

  return (
    <ScanUpload
      onScanComplete={handleScanComplete}
      onError={handleError}
    />
  );
}
```

### API Service Usage

```javascript
import { uploadScanWithProgress, checkApiHealth } from './services/yoloApi';

// Check if backend is running
const health = await checkApiHealth();
console.log(health); // { status: 'healthy', model_loaded: true }

// Upload a scan
const result = await uploadScanWithProgress(file, (progress) => {
  console.log(`Upload progress: ${progress}%`);
});
```

---

## Testing the Integration

### Test with Sample CT Scan

1. **Start the backend** (see Step 2 above)
2. **Start the frontend** (see Step 4 above)
3. **Navigate to Patient Dashboard** or wherever ScanUpload is used
4. **Upload a CT scan image** (DICOM, JPEG, or PNG)
5. **View results** - Should show:
   - Detection status (detected/not detected)
   - Cancer type (if detected)
   - Confidence score
   - Risk level
   - Annotated image with bounding boxes

### Using the API Directly

You can test the API using curl:

```bash
# Health check
curl http://localhost:8000/health

# Upload a scan
curl -X POST http://localhost:8000/api/v1/scan/analyze \
  -F "scan=@path/to/your/ct_scan.jpg"
```

Or use the interactive API documentation at http://localhost:8000/docs

---

## Troubleshooting

### Backend won't start

**Error: "Model file not found"**
- Solution: Ensure `best.pt` is in the same directory as `backend_server.py`
- Check: Run `ls -la best.pt` to verify the file exists

**Error: "Module not found"**
- Solution: Install dependencies with `pip install -r requirements.txt`
- Check: Run `pip list` to see installed packages

**Error: "Port 8000 already in use"**
- Solution: Either:
  - Stop the existing process using port 8000
  - Change the port in `backend_server.py` and `.env`

### Frontend can't connect to backend

**Error: "Network error" or "CORS error"**
- Solution:
  - Verify backend is running: `curl http://localhost:8000/health`
  - Check `.env` has correct `REACT_APP_YOLO_API_URL=http://localhost:8000`
  - Restart the frontend after changing `.env`

**Error: "Failed to analyze scan"**
- Check backend logs for detailed error messages
- Verify the image file format is supported
- Ensure file size is under 100MB

### Model inference errors

**Error: "Model inference error"**
- Check that `best.pt` is a valid YOLOv12 model file
- Verify the model was trained with the correct classes
- Check backend logs for detailed stack trace

---

## Production Deployment

### Backend Deployment

For production, you'll need to:

1. **Use a production ASGI server**:
   ```bash
   gunicorn backend_server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

2. **Set up a database** for storing scan results (PostgreSQL, MongoDB)

3. **Configure CORS** to allow only your production domain

4. **Add authentication** to secure the API

5. **Deploy to a cloud platform**:
   - AWS EC2 with Docker
   - Google Cloud Run
   - Azure App Service
   - Heroku
   - Railway

6. **Update frontend `.env`**:
   ```
   REACT_APP_YOLO_API_URL=https://your-backend-domain.com
   ```

### Recommended Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│                 │         │                  │         │             │
│  React Frontend │────────▶│  FastAPI Backend │────────▶│  best.pt    │
│  (Vercel)       │  HTTPS  │  (AWS EC2)       │         │  Model      │
│                 │         │                  │         │             │
└─────────────────┘         └──────────────────┘         └─────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │   PostgreSQL     │
                            │   Database       │
                            └──────────────────┘
```

---

## Performance Optimization

### Backend Optimizations

1. **Model caching**: Model is loaded once at startup
2. **Batch processing**: Use batch endpoint for multiple scans
3. **Image preprocessing**: Resize images for faster inference
4. **GPU acceleration**: If available, YOLO will automatically use CUDA

### Frontend Optimizations

1. **Progress tracking**: Shows upload progress to user
2. **File validation**: Client-side validation before upload
3. **Error handling**: Graceful error messages
4. **Result caching**: Store recent results in state

---

## Security Considerations

1. **File Upload Validation**:
   - File type checking
   - File size limits (100MB)
   - Malware scanning (in production)

2. **API Authentication**:
   - Add JWT token authentication
   - Rate limiting
   - API key management

3. **Data Privacy**:
   - HIPAA compliance for medical data
   - Encrypted storage for scans
   - Audit logging

4. **CORS Configuration**:
   - Restrict to specific domains in production
   - Remove wildcard `*` origin

---

## Additional Resources

- **YOLOv12 Documentation**: https://docs.ultralytics.com/
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **DICOM Standard**: https://www.dicomstandard.org/
- **Medical Image Processing**: https://pydicom.github.io/

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review backend logs in the terminal
3. Check browser console for frontend errors
4. Verify API responses using `/docs` endpoint

---

## License & Disclaimer

This is a research and educational tool. It should **NOT** be used for clinical diagnosis without proper medical supervision and regulatory approval.

Always consult with qualified healthcare professionals for medical advice.
