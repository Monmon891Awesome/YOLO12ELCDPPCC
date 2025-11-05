# YOLOv12 Backend API Requirements

This document specifies the backend API endpoints required for the LungEvity web application to integrate with the YOLOv12 lung cancer detection model.

## Base URL

```
http://localhost:8000/api/v1
```

Set this in your `.env` file:
```
REACT_APP_YOLO_API_URL=http://localhost:8000
```

---

## API Endpoints

### 1. Health Check

**Endpoint:** `GET /health`

**Description:** Check if the API is running and healthy

**Response:**
```json
{
  "status": "healthy",
  "model": "YOLOv12",
  "version": "1.0.0",
  "timestamp": "2025-05-10T10:30:00Z"
}
```

---

### 2. Analyze Single CT Scan

**Endpoint:** `POST /api/v1/scan/analyze`

**Description:** Upload and analyze a single CT scan image

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `scan` (file): CT scan image (DICOM, NIFTI, JPEG, or PNG)
  - `timestamp` (string): ISO timestamp of upload

**Response:**
```json
{
  "scanId": "scan_12345",
  "status": "completed",
  "uploadTime": "2025-05-10T10:30:00Z",
  "processingTime": 2.5,
  "results": {
    "detected": true,
    "confidence": 0.87,
    "riskLevel": "high",
    "detections": [
      {
        "class": "nodule",
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
    "imageUrl": "/api/v1/scan/scan_12345/image",
    "annotatedImageUrl": "/api/v1/scan/scan_12345/annotated"
  },
  "metadata": {
    "imageSize": {
      "width": 512,
      "height": 512
    },
    "fileSize": 2048576,
    "format": "DICOM"
  }
}
```

**Error Response:**
```json
{
  "error": true,
  "message": "Invalid file format. Supported formats: DICOM, NIFTI, JPEG, PNG",
  "code": "INVALID_FORMAT"
}
```

---

### 3. Get Scan Result

**Endpoint:** `GET /api/v1/scan/:scanId`

**Description:** Retrieve results for a specific scan

**Parameters:**
- `scanId` (path): The scan ID

**Response:** Same as analyze endpoint response

---

### 4. Get Patient Scans

**Endpoint:** `GET /api/v1/patient/:patientId/scans`

**Description:** Get all scans for a specific patient

**Parameters:**
- `patientId` (path): The patient ID

**Response:**
```json
{
  "patientId": "PAT-2023-001",
  "totalScans": 5,
  "scans": [
    {
      "scanId": "scan_12345",
      "uploadTime": "2025-05-10T10:30:00Z",
      "status": "completed",
      "riskLevel": "high",
      "confidence": 0.87,
      "detected": true
    }
  ]
}
```

---

### 5. Batch Scan Analysis

**Endpoint:** `POST /api/v1/scan/batch-analyze`

**Description:** Upload multiple CT scan slices for analysis

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `scans` (files): Array of CT scan images
  - `timestamp` (string): ISO timestamp
  - `batch` (boolean): Set to "true"

**Response:**
```json
{
  "batchId": "batch_67890",
  "totalScans": 10,
  "completedScans": 10,
  "status": "completed",
  "results": [
    {
      "scanId": "scan_12345",
      "sliceNumber": 1,
      "detected": true,
      "confidence": 0.87,
      "riskLevel": "high"
    }
  ],
  "overallAssessment": {
    "maxConfidence": 0.87,
    "riskLevel": "high",
    "detectedSlices": 3,
    "totalSlices": 10
  }
}
```

---

### 6. Get Detection Thresholds

**Endpoint:** `GET /api/v1/config/thresholds`

**Description:** Get confidence threshold configuration

**Response:**
```json
{
  "highRisk": 0.8,
  "mediumRisk": 0.5,
  "lowRisk": 0.3
}
```

---

### 7. Get Scan Image

**Endpoint:** `GET /api/v1/scan/:scanId/image`

**Description:** Get the original CT scan image

**Response:** Binary image data (JPEG/PNG)

---

### 8. Get Annotated Scan Image

**Endpoint:** `GET /api/v1/scan/:scanId/annotated`

**Description:** Get the CT scan image with detection annotations (bounding boxes)

**Response:** Binary image data (JPEG/PNG) with bounding boxes drawn

---

## Risk Level Classification

The API should classify detections into risk levels based on confidence scores:

- **High Risk**: confidence >= 0.8
- **Medium Risk**: 0.5 <= confidence < 0.8
- **Low Risk**: 0.3 <= confidence < 0.5
- **No Detection**: confidence < 0.3

---

## File Format Support

The backend must support the following medical imaging formats:

1. **DICOM** (.dcm) - Primary medical imaging format
2. **NIFTI** (.nii, .nii.gz) - Neuroimaging format
3. **JPEG** (.jpg, .jpeg) - Standard image format
4. **PNG** (.png) - Standard image format

Maximum file size: **100MB per file**

---

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_FORMAT` | Unsupported file format |
| `FILE_TOO_LARGE` | File exceeds size limit |
| `PROCESSING_ERROR` | Error during model inference |
| `SCAN_NOT_FOUND` | Scan ID not found |
| `INVALID_REQUEST` | Missing or invalid parameters |

---

## Implementation Notes

### Python Flask/FastAPI Example Structure

```python
from fastapi import FastAPI, File, UploadFile
from ultralytics import YOLO
import cv2
import numpy as np

app = FastAPI()

# Load YOLOv12 model
model = YOLO('yolov12_lung_cancer.pt')

@app.post("/api/v1/scan/analyze")
async def analyze_scan(scan: UploadFile = File(...)):
    # Read image
    contents = await scan.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Run YOLO inference
    results = model(img)

    # Process results
    detections = []
    for r in results:
        boxes = r.boxes
        for box in boxes:
            detections.append({
                "class": model.names[int(box.cls[0])],
                "confidence": float(box.conf[0]),
                "boundingBox": {
                    "x": float(box.xyxy[0][0]),
                    "y": float(box.xyxy[0][1]),
                    "width": float(box.xyxy[0][2] - box.xyxy[0][0]),
                    "height": float(box.xyxy[0][3] - box.xyxy[0][1])
                }
            })

    # Determine risk level
    max_confidence = max([d["confidence"] for d in detections]) if detections else 0
    risk_level = get_risk_level(max_confidence)

    return {
        "scanId": generate_scan_id(),
        "status": "completed",
        "results": {
            "detected": len(detections) > 0,
            "confidence": max_confidence,
            "riskLevel": risk_level,
            "detections": detections
        }
    }

def get_risk_level(confidence):
    if confidence >= 0.8:
        return "high"
    elif confidence >= 0.5:
        return "medium"
    elif confidence >= 0.3:
        return "low"
    else:
        return "none"
```

---

## CORS Configuration

The backend must enable CORS to allow the React frontend to make requests:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Next Steps

1. **Set up Python backend** with Flask or FastAPI
2. **Load YOLOv12 model** trained on lung cancer detection
3. **Implement the API endpoints** as specified above
4. **Test with sample CT scans** to verify responses
5. **Update `.env` file** with the backend URL
6. **Deploy backend** (AWS, Google Cloud, or other platform)
