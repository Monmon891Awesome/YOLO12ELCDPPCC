# LungEvity - Lung Cancer Detection System
## Full Project Context & Progress Documentation

**Date**: November 6, 2025
**Project**: YOLOv12 CT Scan Analysis with Patient & Doctor Dashboard
**Status**: Patient Dashboard Complete, Backend Deployment In Progress

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Features Implemented](#features-implemented)
5. [File Structure](#file-structure)
6. [Backend API](#backend-api)
7. [Frontend Components](#frontend-components)
8. [Deployment Strategy](#deployment-strategy)
9. [Issues Encountered & Solutions](#issues-encountered--solutions)
10. [Current Status](#current-status)
11. [Next Steps](#next-steps)
12. [Quick Reference](#quick-reference)

---

## 1. Project Overview

### Mission
LungEvity is an AI-powered medical diagnostic platform that uses YOLOv12 object detection to analyze CT scans for lung cancer detection.

### Target Users
- **Patients**: Upload CT scans, view AI analysis, download reports, share with doctors
- **Doctors**: Review patient scans, add clinical notes, manage appointments (coming soon)

### Key Capabilities
- Real-time CT scan analysis using YOLOv12
- Detection of 3 cancer types: Adenocarcinoma, Squamous Cell Carcinoma, Normal tissue
- Risk level classification (High, Medium, Low, None)
- Advanced visualizations: Edge detection, Contour analysis
- PDF medical reports generation
- Email sharing with doctors
- Scan history management (localStorage, up to 50 scans)

---

## 2. Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
│                    (Web Browser)                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  FRONTEND (React)                            │
│                 Hosted on Vercel                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Patient Dashboard                                    │   │
│  │  - Home (Upload)                                      │   │
│  │  - Results (Analysis)                                 │   │
│  │  - History (Past Scans)                               │   │
│  │  - Appointments                                       │   │
│  │  - Messages                                           │   │
│  │  - Profile                                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Client-Side Storage: localStorage (max 50 scans)           │
│  PDF Generation: jsPDF (client-side)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ REST API
                     │ POST /api/v1/yolo/detect
                     │
┌────────────────────▼────────────────────────────────────────┐
│              BACKEND (Python FastAPI)                        │
│            Hosted on Railway (Docker)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  FastAPI Server (backend_server.py)                  │   │
│  │  - Image Upload & Processing                         │   │
│  │  - YOLO Model Inference                              │   │
│  │  - Edge Detection (Canny)                            │   │
│  │  - Contour Analysis                                  │   │
│  │  - Risk Level Classification                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ML Model: YOLOv12 (best.pt, 5.5MB)                         │
│  Image Processing: OpenCV, PIL                               │
└───────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. User uploads CT scan image (JPG/PNG/DICOM)
   ↓
2. Frontend sends image to Backend API
   ↓
3. Backend processes image:
   - Resize to 640x640
   - Run YOLO inference
   - Apply edge detection
   - Perform contour analysis
   - Calculate risk level
   ↓
4. Backend returns JSON response:
   - Detections (class, confidence, bbox)
   - Risk level
   - Annotated images (base64)
   - Analysis data
   ↓
5. Frontend displays results:
   - Visual analysis
   - Risk assessment
   - Download PDF option
   - Share with doctor option
   ↓
6. Save to localStorage for history
```

---

## 3. Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI framework |
| React Router | 6.16.0 | Client-side routing |
| Lucide React | 0.263.1 | Icon library |
| jsPDF | 3.0.3 | PDF generation |
| Crypto-JS | 4.1.1 | Encryption utilities |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11 | Programming language |
| FastAPI | Latest | Web framework |
| Uvicorn | Latest | ASGI server |
| Ultralytics | Latest | YOLO implementation |
| OpenCV | Latest | Image processing |
| Pillow | Latest | Image handling |
| NumPy | Latest | Numerical operations |
| PyDICOM | Latest | DICOM support |

### Deployment
| Service | Purpose | Status |
|---------|---------|--------|
| Vercel | Frontend hosting | ✅ Deployed |
| Railway | Backend hosting | 🔄 In Progress |
| Docker | Container runtime | ✅ Configured |

### Development Tools
- Git/GitHub for version control
- ESLint for code quality
- Docker Desktop (M1 compatible)

---

## 4. Features Implemented

### ✅ Patient Dashboard - Complete

#### 4.1 Home Tab (Upload)
- Drag-and-drop file upload
- File type validation (JPG, PNG, DICOM)
- File size validation (max 10MB)
- Upload progress indicator
- Success/error notifications
- Real-time preview

#### 4.2 Results Tab (Analysis)
- Risk level display with color coding:
  - **High Risk**: ≥80% confidence (Red)
  - **Medium Risk**: 50-80% confidence (Orange)
  - **Low Risk**: 30-50% confidence (Yellow)
  - **No Detection**: <30% confidence (Green)
- Detection list with confidence scores
- Original image display
- Annotated image with bounding boxes
- Edge detection visualization
- Contour analysis visualization
- PDF report download
- JSON data export
- Share with doctor functionality

#### 4.3 History Tab (Recent Uploads)
- Table view of all scans (up to 50)
- Columns: Date, Risk Level, Detection, Confidence
- Actions: View, Delete
- Real-time scan count
- Persistent storage (localStorage)

#### 4.4 Appointments Tab
- Mock appointment list
- Date, time, doctor information
- Status indicators
- Schedule new appointment (UI only)

#### 4.5 Messages Tab
- Mock messaging interface
- Doctor communication (UI only)
- Unread message count

#### 4.6 Profile Tab
- Patient information display
- Personal details
- Contact information
- Medical history (mock data)
- Emergency contacts

### ✅ Backend API - Complete

#### Endpoints

**1. Health Check**
```
GET /health
Response: {
  "status": "healthy",
  "model_loaded": true,
  "model_name": "best.pt"
}
```

**2. CT Scan Analysis**
```
POST /api/v1/yolo/detect
Content-Type: multipart/form-data
Body: { "file": <image_file> }

Response: {
  "detected": true/false,
  "confidence": 0.95,
  "riskLevel": "high",
  "detections": [
    {
      "class": "adenocarcinoma",
      "confidence": 0.95,
      "bbox": [x1, y1, x2, y2]
    }
  ],
  "images": {
    "original": "data:image/jpeg;base64,...",
    "annotated": "data:image/jpeg;base64,...",
    "edges": "data:image/jpeg;base64,...",
    "contours": "data:image/jpeg;base64,..."
  },
  "analysis": {
    "edgeCount": 1234,
    "circularityScore": 0.87,
    "avgConfidence": 0.92
  }
}
```

**3. Supported Classes**
```
GET /api/v1/yolo/supported-classes
Response: {
  "classes": [
    "adenocarcinoma",
    "squamous_cell_carcinoma",
    "normal"
  ]
}
```

#### Image Processing Pipeline

1. **Input Validation**
   - File type check
   - File size check
   - Image format validation

2. **Preprocessing**
   - Resize to 640x640
   - Normalize pixel values
   - Convert color space if needed

3. **YOLO Inference**
   - Load YOLOv12 model (best.pt)
   - Run detection
   - Apply confidence threshold (30%)
   - Non-max suppression

4. **Post-processing**
   - Draw bounding boxes
   - Add labels with confidence
   - Color-code by cancer type

5. **Enhanced Analysis**
   - **Edge Detection**: Canny algorithm
   - **Contour Analysis**: Circularity calculation (4πA/P²)
   - **Risk Classification**: Based on confidence scores

6. **Response Generation**
   - Convert images to base64
   - Calculate statistics
   - Format JSON response

### ✅ Utility Functions

#### patientDataManager.js
- `getScanHistory()` - Retrieve all scans
- `saveScan(scanData)` - Save new scan (max 50)
- `deleteScan(scanId)` - Remove scan
- `getPatientProfile()` - Get patient info
- `getDoctors()` - Get care team list
- `getAppointments()` - Get appointments
- `getDashboardStats()` - Calculate statistics
- `formatDate(timestamp)` - Format dates

#### pdfReportGenerator.js
- `generatePDFReport(scanData, patientInfo)` - Create PDF
- `generateJSONReport(scanData, patientInfo)` - Create JSON
- Professional medical report template
- Includes disclaimers and branding

#### emailService.js
- `shareWithDoctor(scanData, patientInfo, doctorEmail, doctorName)` - Email sharing
- `copyShareableLink(scanData)` - Copy link to clipboard
- Pre-filled email templates

---

## 5. File Structure

```
YOLO12ELCDPPCC-1/
├── documentation/
│   ├── PROJECT_PROGRESS_FULL_CONTEXT.md (this file)
│   └── ...
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── ...
├── src/
│   ├── components/
│   │   ├── ScanUpload.jsx          # Upload component
│   │   ├── ScanResults.jsx         # Results display
│   │   └── PatientPlatform.jsx     # Main platform wrapper
│   ├── utils/
│   │   ├── patientDataManager.js   # Data persistence
│   │   ├── pdfReportGenerator.js   # PDF generation
│   │   └── emailService.js         # Email sharing
│   ├── PatientDashboard.jsx        # Main dashboard
│   ├── Dashboard.css               # Styling
│   ├── App.js                      # Root component
│   └── index.js                    # Entry point
├── backend_server.py               # FastAPI server
├── start_backend.py                # Server startup script
├── best.pt                         # YOLOv12 model (5.5MB)
├── requirements.txt                # Python dependencies
├── Dockerfile                      # Docker configuration
├── .dockerignore                   # Docker exclusions
├── railway.toml                    # Railway config
├── nixpacks.toml                   # Nixpacks config
├── .railwayignore                  # Railway exclusions
├── package.json                    # Node dependencies
├── package-lock.json               # Locked versions
├── .env                            # Environment variables (local)
├── .gitignore                      # Git exclusions
└── README.md                       # Project documentation
```

### Key Files Explained

#### Frontend Files

**PatientDashboard.jsx** (750+ lines)
- Main dashboard container
- Tab navigation (Home, Results, History, etc.)
- State management for scans
- Integration with localStorage
- Handles scan upload completion
- Manages view/delete actions

**ScanUpload.jsx** (300+ lines)
- File upload component
- Drag-and-drop interface
- API integration
- Upload progress tracking
- Error handling

**ScanResults.jsx** (400+ lines)
- Results display component
- Image visualization tabs
- PDF/JSON download buttons
- Share with doctor modal
- Risk level display

**patientDataManager.js** (376 lines)
- localStorage wrapper
- CRUD operations for scans
- Patient profile management
- Data validation
- Storage limit enforcement (50 scans)

**pdfReportGenerator.js** (232 lines)
- jsPDF integration
- Professional report layout
- Patient info section
- Scan results section
- Medical disclaimers

**emailService.js** (176 lines)
- mailto protocol handler
- Email template generation
- Doctor selection logic
- Shareable link generation

**Dashboard.css** (1000+ lines)
- Responsive design
- Risk level styling
- Modal styling
- Table styling
- Mobile optimizations

#### Backend Files

**backend_server.py** (800+ lines)
- FastAPI application
- YOLO model loading
- Image processing functions
- Edge detection (Canny)
- Contour analysis
- Risk classification
- CORS configuration
- API endpoints

**start_backend.py** (139 lines)
- Startup validation
- Model file check
- Dependency check
- Uvicorn server start
- Error handling

**requirements.txt**
```
fastapi
uvicorn[standard]
python-multipart
ultralytics
opencv-python
pillow
numpy
pydicom
```

#### Deployment Files

**Dockerfile**
- Python 3.11-slim base
- System dependencies (libGL, etc.)
- Python package installation
- Healthcheck configuration
- Port exposure (8000)
- Start command

**.dockerignore**
- Excludes frontend files
- Excludes Python cache
- Keeps only backend files
- Optimizes build context

**railway.toml**
- Builder: NIXPACKS
- Start command: `python3 start_backend.py`
- Health check: `/health`
- Timeout: 300 seconds
- Restart policy: ON_FAILURE

---

## 6. Backend API

### Base URL
- **Local**: `http://localhost:8000`
- **Railway**: `https://[app-name].railway.app`

### Authentication
Currently: None (public API)
Future: JWT-based authentication

### CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # All origins allowed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Request/Response Examples

#### Health Check
```bash
curl https://[backend-url]/health
```

Response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_name": "best.pt"
}
```

#### CT Scan Analysis
```bash
curl -X POST https://[backend-url]/api/v1/yolo/detect \
  -F "file=@/path/to/ct_scan.jpg"
```

Response (abbreviated):
```json
{
  "detected": true,
  "confidence": 0.95,
  "riskLevel": "high",
  "detections": [
    {
      "class": "adenocarcinoma",
      "confidence": 0.95,
      "bbox": [100, 150, 300, 350]
    }
  ],
  "images": {
    "original": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "annotated": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "edges": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "contours": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  },
  "analysis": {
    "edgeCount": 1234,
    "circularityScore": 0.87,
    "avgConfidence": 0.92,
    "detectionCount": 1
  },
  "uploadTime": "2025-11-06T01:30:45.123Z",
  "scanId": "scan_1730857845123_abc123"
}
```

### Error Responses

**400 Bad Request**
```json
{
  "detail": "No file provided"
}
```

**415 Unsupported Media Type**
```json
{
  "detail": "File type not supported. Please upload JPG, PNG, or DICOM"
}
```

**500 Internal Server Error**
```json
{
  "detail": "Error processing image: [error message]"
}
```

---

## 7. Frontend Components

### Component Hierarchy

```
App
└── PatientDashboard
    ├── ScanUpload (Home tab)
    ├── ScanResults (Results tab)
    ├── History (table)
    ├── Appointments (list)
    ├── Messages (list)
    └── Profile (info display)
```

### State Management

**PatientDashboard State**:
```javascript
const [activeTab, setActiveTab] = useState('home');
const [uploadedImage, setUploadedImage] = useState(null);
const [currentScanResult, setCurrentScanResult] = useState(null);
const [uploadSuccess, setUploadSuccess] = useState(false);
const [patientProfile, setPatientProfile] = useState(getPatientProfile());
const [scanHistory, setScanHistory] = useState(getScanHistory());
const [appointments, setAppointments] = useState(getAppointments());
const [doctors, setDoctors] = useState(getDoctors());
const [dashboardStats, setDashboardStats] = useState(getDashboardStats());
```

**ScanResults State**:
```javascript
const [activeImageTab, setActiveImageTab] = useState('original');
const [showShareModal, setShowShareModal] = useState(false);
const [selectedDoctor, setSelectedDoctor] = useState('');
const [shareLoading, setShareLoading] = useState(false);
const [shareSuccess, setShareSuccess] = useState(false);
```

### Environment Variables

**.env** (local development):
```bash
REACT_APP_YOLO_API_URL=http://localhost:8000
```

**Vercel** (production):
```bash
REACT_APP_YOLO_API_URL=https://[railway-url].railway.app
```

### API Integration

```javascript
const uploadScan = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${process.env.REACT_APP_YOLO_API_URL}/api/v1/yolo/detect`,
    {
      method: 'POST',
      body: formData,
    }
  );

  return await response.json();
};
```

---

## 8. Deployment Strategy

### Why Split Deployment?

**Vercel Limitations**:
- Serverless platform (no long-running processes)
- 10-second function timeout
- No Python runtime support
- Best for static sites and Node.js

**Railway Advantages**:
- Full Docker support
- Python runtime
- Long-running processes
- ML model hosting
- Persistent containers

### Deployment Architecture

```
┌─────────────────────────────────────────┐
│           User's Browser                 │
└──────────────┬──────────────────────────┘
               │
               │ HTTPS
               │
┌──────────────▼──────────────────────────┐
│      Vercel (Frontend CDN)               │
│  - Serves React static files             │
│  - Environment: REACT_APP_YOLO_API_URL  │
└──────────────┬──────────────────────────┘
               │
               │ REST API Calls
               │
┌──────────────▼──────────────────────────┐
│    Railway (Backend Container)           │
│  - Runs Docker container                 │
│  - Python 3.11 + FastAPI                 │
│  - YOLO model loaded in memory          │
│  - Responds to /api/v1/yolo/detect      │
└──────────────────────────────────────────┘
```

### Deployment Steps

#### Vercel (Frontend) - ✅ Complete

1. Connected GitHub repository to Vercel
2. Vercel auto-detects React app
3. Auto-deploys on every push to main branch
4. Environment variable set: `REACT_APP_YOLO_API_URL`
5. Custom domain available (optional)

**Vercel URL**: `https://[your-app].vercel.app`

#### Railway (Backend) - 🔄 In Progress

**Attempt 1: Nixpacks Auto-detection** ❌
- Railway detected Node.js (package.json)
- Tried to run `npm ci`
- Failed: Missing yaml@2.8.1

**Attempt 2: Explicit Nixpacks Config** ❌
- Created `nixpacks.toml` to force Python
- Created `.railwayignore` to exclude frontend
- Still detected Node.js first

**Attempt 3: Docker (Current)** 🔄
- Created `Dockerfile` for Python 3.11
- Created `.dockerignore` to exclude frontend
- Issue 1: Package name error (libgl1-mesa-glx → libgl1) ✅ Fixed
- Issue 2: Healthcheck timeout ⚠️ Current

### Docker Configuration

**Dockerfile**:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgthread-2.0-0 \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt
COPY backend_server.py start_backend.py best.pt .
EXPOSE 8000
CMD ["python3", "start_backend.py"]
```

---

## 9. Issues Encountered & Solutions

### Issue 1: patientInfo Undefined (Vercel Build)
**Error**: `'patientInfo' is not defined (no-undef)`

**Cause**: Refactored code to use `patientProfile` from localStorage, but forgot to update references in JSX

**Solution**:
- Replaced `patientInfo` → `patientProfile`
- Updated `patientInfo.scanDate` → `dashboardStats.lastScanDate`

**Commit**: 20895cb

### Issue 2: large_cell_carcinoma Removal
**Request**: User wanted to remove large_cell_carcinoma class

**Solution**:
- Removed from `CANCER_CLASSES` array (line 70)
- Removed from color mapping (line 357)
- Now detects only 3 classes: adenocarcinoma, squamous_cell_carcinoma, normal

**Commit**: 70ea787 (part of main commit)

### Issue 3: Railway Detected Node.js Instead of Python
**Error**: Railway ran `npm ci` and failed

**Cause**: `package.json` in repo root triggered Node.js detection

**Solution Attempts**:
1. Created `nixpacks.toml` to force Python ❌
2. Created `.railwayignore` to exclude frontend ❌
3. Created `Dockerfile` to explicitly define Python environment ✅

**Current Status**: Using Docker approach

**Commits**:
- 55e1b25 (Nixpacks attempt)
- 3bf464a (Docker configuration)

### Issue 4: libgl1-mesa-glx Package Not Found
**Error**: `Package 'libgl1-mesa-glx' has no installation candidate`

**Cause**: Debian Trixie (latest) renamed the package

**Solution**:
- Changed `libgl1-mesa-glx` → `libgl1`
- Added `libgthread-2.0-0` for better compatibility

**Commit**: 10e53d8

### Issue 5: Railway Healthcheck Timeout (Current)
**Error**: "Healthcheck failed!"

**Cause**:
- `start_backend.py` hardcoded to port 8000
- Railway needs dynamic PORT environment variable
- Server might not be binding correctly

**Solution** (to be implemented):
- Update `start_backend.py` to use `os.environ.get("PORT", 8000)`
- Ensure uvicorn binds to `0.0.0.0:$PORT`
- Increase startup timeout for model loading

**Status**: 🔄 In Progress

---

## 10. Current Status

### ✅ Completed
- [x] Patient Dashboard UI (all 6 tabs)
- [x] CT scan upload functionality
- [x] YOLO model integration
- [x] Edge detection and contour analysis
- [x] Risk level classification
- [x] PDF report generation
- [x] Email sharing with doctors
- [x] Scan history with localStorage
- [x] Frontend deployed to Vercel
- [x] Docker configuration created
- [x] Dockerfile package name fixed

### 🔄 In Progress
- [ ] Railway backend deployment
- [ ] Healthcheck timeout issue resolution
- [ ] Environment variable configuration

### 📋 Pending
- [ ] Doctor Dashboard implementation
- [ ] User authentication (JWT)
- [ ] Database integration (PostgreSQL)
- [ ] Real email service (SendGrid)
- [ ] File storage (AWS S3)
- [ ] Real-time notifications
- [ ] Mobile app (React Native)

---

## 11. Next Steps

### Immediate: Fix Railway Deployment

**Step 1: Fix start_backend.py for Railway**
```python
# Update start_backend.py line 104
port = int(os.environ.get("PORT", 8000))

subprocess.run([
    sys.executable, "-m", "uvicorn",
    "backend_server:app",
    "--host", "0.0.0.0",
    "--port", str(port),  # Use dynamic port
    # Remove --reload for production
])
```

**Step 2: Alternative - Run uvicorn directly**
Update Dockerfile CMD:
```dockerfile
CMD ["uvicorn", "backend_server:app", "--host", "0.0.0.0", "--port", "8000"]
```

Then update railway.toml:
```toml
[deploy]
startCommand = "uvicorn backend_server:app --host 0.0.0.0 --port $PORT"
```

**Step 3: Increase healthcheck timeout**
Already configured to 300 seconds, but YOLO model loading might take longer on first startup.

### Short-term: Complete Patient Dashboard Integration

1. **Test end-to-end workflow**:
   - Upload CT scan
   - View results
   - Download PDF
   - Share with doctor
   - View history
   - Delete scan

2. **Clean up ESLint warnings**:
   - Remove unused variables
   - Fix accessibility issues
   - Remove unused imports

3. **Mobile optimization**:
   - Test on various screen sizes
   - Fix any responsive issues
   - Optimize touch interactions

### Medium-term: Doctor Dashboard

**Features to Implement**:

1. **Doctor Login/Authentication**:
   - Separate login for doctors
   - JWT token-based auth
   - Role-based access control

2. **Patient Management**:
   - View all patients
   - Search/filter patients
   - Patient detail view
   - Medical history

3. **Scan Review**:
   - View all pending scans
   - Review AI analysis
   - Add clinical notes
   - Approve/reject findings
   - Request additional imaging

4. **Appointment Management**:
   - View schedule
   - Book appointments
   - Send reminders
   - Video consultation integration

5. **Communication**:
   - Message patients
   - Send reports
   - Request additional information

6. **Analytics Dashboard**:
   - Total patients
   - Scans per day/week/month
   - Detection statistics
   - Risk level distribution

### Long-term: Production Enhancements

1. **Database Migration**:
   - Move from localStorage to PostgreSQL
   - Store user accounts
   - Store scan metadata
   - Store clinical notes

2. **File Storage**:
   - Move from base64 to AWS S3
   - Store original DICOM files
   - Store processed images
   - CDN for fast delivery

3. **Email Service**:
   - Replace mailto with SendGrid
   - Automated email reports
   - Appointment reminders
   - Results notifications

4. **Authentication & Security**:
   - JWT-based authentication
   - Password hashing (bcrypt)
   - Role-based access control
   - HIPAA compliance measures
   - Audit logging

5. **Performance Optimization**:
   - Redis caching for scans
   - WebSocket for real-time updates
   - Image compression
   - Lazy loading

6. **Mobile App**:
   - React Native app
   - Push notifications
   - Offline mode
   - Camera integration

---

## 12. Quick Reference

### Commands

**Frontend Development**:
```bash
# Install dependencies
npm install

# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test
```

**Backend Development**:
```bash
# Install dependencies
pip install -r requirements.txt

# Start backend server
python3 start_backend.py

# Or with uvicorn directly
uvicorn backend_server:app --reload --host 0.0.0.0 --port 8000
```

**Docker**:
```bash
# Build image
docker build -t yolo-backend:latest .

# Run container
docker run -p 8000:8000 yolo-backend:latest

# Run with environment variable
docker run -p 8000:8000 -e PORT=8000 yolo-backend:latest

# View logs
docker logs <container-id>

# Stop container
docker stop <container-id>
```

**Git**:
```bash
# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "Message"

# Push to GitHub
git push

# Pull latest
git pull
```

### Important URLs

**Development**:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

**Production**:
- Frontend: https://[your-vercel-app].vercel.app
- Backend: https://[your-railway-app].railway.app
- GitHub: https://github.com/[username]/YOLO12ELCDPPCC

**Dashboards**:
- Vercel: https://vercel.com/dashboard
- Railway: https://railway.app/dashboard
- GitHub: https://github.com/[username]/YOLO12ELCDPPCC

### Environment Variables

**Local Development (.env)**:
```bash
REACT_APP_YOLO_API_URL=http://localhost:8000
```

**Vercel (Production)**:
```bash
REACT_APP_YOLO_API_URL=https://[railway-url].railway.app
```

**Railway (Auto-set)**:
```bash
PORT=<dynamic>  # Automatically set by Railway
```

### File Locations

**Backend**:
- Server: `backend_server.py`
- Startup: `start_backend.py`
- Model: `best.pt` (5.5MB)
- Dependencies: `requirements.txt`

**Frontend**:
- Main Dashboard: `src/PatientDashboard.jsx`
- Upload: `src/components/ScanUpload.jsx`
- Results: `src/components/ScanResults.jsx`
- Data Manager: `src/utils/patientDataManager.js`
- PDF Generator: `src/utils/pdfReportGenerator.js`
- Email Service: `src/utils/emailService.js`

**Deployment**:
- Docker: `Dockerfile`, `.dockerignore`
- Railway: `railway.toml`, `.railwayignore`
- Nixpacks: `nixpacks.toml`

### API Endpoints

```
GET  /health                        - Health check
GET  /docs                          - API documentation
POST /api/v1/yolo/detect           - CT scan analysis
GET  /api/v1/yolo/supported-classes - List classes
```

### Cancer Types Detected

1. **Adenocarcinoma** (Red boxes)
   - Most common lung cancer type
   - Grows in outer lung regions

2. **Squamous Cell Carcinoma** (Purple boxes)
   - Starts in airway lining
   - Usually in central lung areas

3. **Normal** (Green boxes)
   - Healthy lung tissue
   - No abnormalities detected

**Removed**: Large Cell Carcinoma (per user request)

### Risk Levels

| Level | Confidence | Color | Action |
|-------|-----------|-------|--------|
| High | ≥80% | Red | Urgent consultation |
| Medium | 50-80% | Orange | Schedule appointment |
| Low | 30-50% | Yellow | Monitor closely |
| None | <30% | Green | No immediate action |

### Storage Limits

- **localStorage**: Max 50 scans
- **Base64 Images**: ~2-3 MB per scan
- **Total Storage**: ~100-150 MB max

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Support

- iOS Safari 14+
- Chrome Mobile 90+
- Responsive down to 320px width

---

## Troubleshooting

### Frontend Issues

**Issue**: "API call failed"
- Check `REACT_APP_YOLO_API_URL` is set correctly
- Verify backend is running
- Check browser console for CORS errors

**Issue**: "Scan not saving to history"
- Check localStorage is enabled
- Check storage quota (50 scan limit)
- Clear old scans if needed

**Issue**: "PDF download not working"
- Check jsPDF is installed: `npm list jspdf`
- Check browser allows downloads
- Try in different browser

### Backend Issues

**Issue**: "Model not loading"
- Verify `best.pt` exists in backend directory
- Check file size is ~5.5 MB
- Check Python has read permissions

**Issue**: "OpenCV import error"
- Install system dependencies:
  ```bash
  # Ubuntu/Debian
  sudo apt-get install libgl1 libglib2.0-0

  # macOS
  brew install opencv
  ```

**Issue**: "Port already in use"
- Check for existing process: `lsof -i :8000`
- Kill process: `kill -9 <PID>`
- Use different port: `uvicorn backend_server:app --port 8001`

### Deployment Issues

**Issue**: "Railway build timeout"
- Increase timeout in railway.toml
- Optimize Dockerfile layers
- Use smaller base image

**Issue**: "Railway healthcheck failed"
- Check server is binding to 0.0.0.0
- Check PORT environment variable usage
- Check /health endpoint returns 200

**Issue**: "Vercel build failed"
- Check package-lock.json is in sync
- Run `npm install` locally
- Check for ESLint errors
- Review build logs

---

## Resources

### Documentation
- FastAPI: https://fastapi.tiangolo.com
- React: https://react.dev
- Ultralytics YOLO: https://docs.ultralytics.com
- OpenCV: https://docs.opencv.org
- jsPDF: https://raw.githack.com/MrRio/jsPDF/master/docs/

### Deployment
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Docker Docs: https://docs.docker.com

### Medical Standards
- DICOM Standard: https://www.dicomstandard.org
- HIPAA Guidelines: https://www.hhs.gov/hipaa
- FDA Medical AI: https://www.fda.gov/medical-devices/software-medical-device-samd

---

## Contributors

- **Primary Developer**: Claude (AI Assistant)
- **Project Owner**: Monmon891Awesome
- **Institution**: Academic/Research Project

---

## License

[To be determined]

---

## Acknowledgments

- YOLOv12 by Ultralytics
- Medical imaging dataset providers
- Open-source community

---

**Last Updated**: November 6, 2025
**Version**: 1.0
**Status**: Backend Deployment In Progress

---

## Contact & Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/[username]/YOLO12ELCDPPCC/issues
- Email: [contact email]

---

**End of Document**

Total Word Count: ~7,500 words
Total Pages (estimated): ~35-40 pages when printed
