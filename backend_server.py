"""
YOLOv12 Lung Cancer Detection Backend Server
FastAPI implementation with actual YOLO model integration using best.pt

Installation:
pip install fastapi uvicorn python-multipart ultralytics opencv-python pillow numpy pydicom

Run:
uvicorn backend_server:app --host 0.0.0.0 --port 8000 --reload

Or use the startup script:
python start_backend.py
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
import cv2
import numpy as np
from PIL import Image
import io
import uuid
from datetime import datetime
from typing import Optional, List
import os
import tempfile
import traceback

# Import YOLO from ultralytics
from ultralytics import YOLO

# Try to import pydicom for DICOM support
try:
    import pydicom
    DICOM_SUPPORT = True
except ImportError:
    DICOM_SUPPORT = False
    print("Warning: pydicom not installed. DICOM file support disabled.")

app = FastAPI(
    title="LungEvity YOLOv12 API",
    version="1.0.0",
    description="Lung cancer detection API using YOLOv12 model"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
        "*",  # For development - restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
MODEL_PATH = "best.pt"
model = None
MODEL_LOADED = False

# Storage for scans (in production, use a database like PostgreSQL or MongoDB)
scans_db = {}
scan_images = {}  # Store processed images

# Class names from the training
CANCER_CLASSES = ["adenocarcinoma", "normal", "squamous_cell_carcinoma"]


def load_model():
    """Load the YOLOv12 model from best.pt"""
    global model, MODEL_LOADED
    try:
        if not os.path.exists(MODEL_PATH):
            print(f"Error: Model file '{MODEL_PATH}' not found in current directory")
            print(f"Current directory: {os.getcwd()}")
            print("Please ensure best.pt is in the same directory as backend_server.py")
            return False

        print(f"Loading YOLO model from {MODEL_PATH}...")
        model = YOLO(MODEL_PATH)
        MODEL_LOADED = True
        print(f"Model loaded successfully!")
        print(f"Model classes: {model.names}")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        traceback.print_exc()
        MODEL_LOADED = False
        return False


def read_dicom_image(file_bytes: bytes) -> np.ndarray:
    """
    Read a DICOM image and convert to RGB format

    Args:
        file_bytes: DICOM file bytes

    Returns:
        Image in RGB format as numpy array
    """
    if not DICOM_SUPPORT:
        raise HTTPException(
            status_code=400,
            detail="DICOM support not available. Please install pydicom."
        )

    try:
        # Read DICOM file from bytes
        with tempfile.NamedTemporaryFile(delete=False, suffix='.dcm') as tmp_file:
            tmp_file.write(file_bytes)
            tmp_path = tmp_file.name

        ds = pydicom.dcmread(tmp_path)
        img = ds.pixel_array

        # Clean up temp file
        os.unlink(tmp_path)

        # Normalize to 8-bit range (0-255)
        img = ((img - img.min()) / (img.max() - img.min()) * 255).astype(np.uint8)

        # Convert to RGB (DICOM images are often grayscale)
        if len(img.shape) == 2:
            img_rgb = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
        else:
            img_rgb = img

        return img_rgb
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading DICOM file: {str(e)}")


def read_image(file_bytes: bytes, filename: str) -> np.ndarray:
    """
    Read image file (DICOM, JPEG, PNG) and convert to RGB

    Args:
        file_bytes: Image file bytes
        filename: Original filename to determine format

    Returns:
        Image in RGB format as numpy array
    """
    file_ext = os.path.splitext(filename)[1].lower()

    try:
        # Handle DICOM files
        if file_ext in ['.dcm', '.dicom']:
            return read_dicom_image(file_bytes)

        # Handle standard image formats
        nparr = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError(f"Could not decode image from {filename}")

        # Convert BGR to RGB
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        return img_rgb
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading image: {str(e)}")


def get_risk_level(confidence: float, class_name: str) -> str:
    """
    Determine risk level based on confidence score and class

    Args:
        confidence: Model confidence score (0-1)
        class_name: Predicted class name

    Returns:
        Risk level: 'high', 'medium', 'low', or 'none'
    """
    # If normal, return none
    if class_name == "normal":
        return "none"

    # For cancer classes, use confidence thresholds
    if confidence >= 0.8:
        return "high"
    elif confidence >= 0.5:
        return "medium"
    elif confidence >= 0.3:
        return "low"
    else:
        return "none"


def generate_scan_id() -> str:
    """Generate unique scan ID"""
    return f"scan_{uuid.uuid4().hex[:12]}"


def process_image_with_yolo(image: np.ndarray) -> dict:
    """
    Process CT scan image with YOLOv12 model

    Args:
        image: Input image as numpy array (RGB)

    Returns:
        Dictionary with detection results
    """
    global model, MODEL_LOADED

    if not MODEL_LOADED or model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please check server logs."
        )

    try:
        # Run YOLO inference
        results = model(image, conf=0.25)  # 25% confidence threshold

        # Get image dimensions
        height, width = image.shape[:2]

        detections = []
        max_confidence = 0.0
        top_class = "normal"

        # Process results
        for r in results:
            boxes = r.boxes

            if boxes is not None and len(boxes) > 0:
                for box in boxes:
                    cls_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    class_name = model.names[cls_id]

                    # Get bounding box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()

                    # Update max confidence and top class
                    if confidence > max_confidence:
                        max_confidence = confidence
                        top_class = class_name

                    # Calculate approximate size in mm (assuming standard CT scan)
                    # This is a rough estimate - in production, use actual pixel spacing from DICOM
                    pixel_width = float(x2 - x1)
                    pixel_height = float(y2 - y1)
                    avg_size_px = (pixel_width + pixel_height) / 2
                    size_mm = float(avg_size_px * 0.5)  # Rough conversion factor

                    # Determine shape based on aspect ratio
                    aspect_ratio = float(pixel_width / pixel_height if pixel_height > 0 else 1.0)
                    if 0.8 <= aspect_ratio <= 1.2:
                        shape = "round"
                    elif aspect_ratio > 1.2:
                        shape = "oval"
                    else:
                        shape = "irregular"

                    detections.append({
                        "class": class_name,
                        "confidence": round(confidence, 3),
                        "boundingBox": {
                            "x": int(x1),
                            "y": int(y1),
                            "width": int(x2 - x1),
                            "height": int(y2 - y1)
                        },
                        "characteristics": {
                            "size_mm": round(size_mm, 1),
                            "shape": shape,
                            "density": "solid"  # Default - would need additional analysis
                        }
                    })

        # If no detections, classify as normal with lower confidence
        if len(detections) == 0:
            top_class = "normal"
            max_confidence = 0.5  # Lower confidence for normal classification

        detected = top_class != "normal"

        return {
            "detected": detected,
            "confidence": float(max_confidence),
            "topClass": top_class,
            "detections": detections,
            "imageSize": {"width": int(width), "height": int(height)}
        }

    except Exception as e:
        print(f"Error during YOLO inference: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Model inference error: {str(e)}")


def create_annotated_image(image: np.ndarray, detections: List[dict]) -> bytes:
    """
    Create annotated image with bounding boxes, edge detection, and contour analysis

    Args:
        image: Original image
        detections: List of detection dictionaries

    Returns:
        Annotated image as JPEG bytes with enhanced visualizations
    """
    annotated = image.copy()

    # Convert to grayscale for edge detection and contour analysis
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

    # === EDGE DETECTION ===
    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Canny edge detection with automatic threshold
    median_val = np.median(blurred)
    lower = int(max(0, 0.66 * median_val))
    upper = int(min(255, 1.33 * median_val))
    edges = cv2.Canny(blurred, lower, upper)

    # Overlay edges in cyan (semi-transparent)
    edge_overlay = annotated.copy()
    edge_overlay[edges > 0] = [0, 255, 255]  # Cyan for edges
    annotated = cv2.addWeighted(annotated, 0.85, edge_overlay, 0.15, 0)

    # === CONTOUR ANALYSIS ===
    # Find contours
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Draw significant contours
    for contour in contours:
        area = cv2.contourArea(contour)
        # Only draw contours above minimum area (to reduce noise)
        if area > 100:
            perimeter = cv2.arcLength(contour, True)
            circularity = 4 * np.pi * area / (perimeter * perimeter) if perimeter > 0 else 0

            # Color code by circularity (more circular = more suspicious)
            if circularity > 0.7:
                contour_color = (255, 100, 255)  # Purple for circular (potential nodules)
            else:
                contour_color = (100, 200, 255)  # Light blue for irregular shapes

            # Draw contour with semi-transparency
            cv2.drawContours(annotated, [contour], -1, contour_color, 1)

    # === YOLO DETECTION BOUNDING BOXES ===
    # Color map for different classes
    color_map = {
        "adenocarcinoma": (255, 0, 0),      # Red
        "squamous_cell_carcinoma": (255, 0, 255),  # Magenta
        "normal": (0, 255, 0)               # Green
    }

    for det in detections:
        bbox = det["boundingBox"]
        x, y, w, h = bbox["x"], bbox["y"], bbox["width"], bbox["height"]
        class_name = det["class"]
        confidence = det["confidence"]

        color = color_map.get(class_name, (0, 255, 255))

        # Draw bounding box (thicker for detections)
        cv2.rectangle(annotated, (x, y), (x + w, y + h), color, 3)

        # Draw corner markers for emphasis
        corner_length = 15
        # Top-left
        cv2.line(annotated, (x, y), (x + corner_length, y), color, 4)
        cv2.line(annotated, (x, y), (x, y + corner_length), color, 4)
        # Top-right
        cv2.line(annotated, (x + w, y), (x + w - corner_length, y), color, 4)
        cv2.line(annotated, (x + w, y), (x + w, y + corner_length), color, 4)
        # Bottom-left
        cv2.line(annotated, (x, y + h), (x + corner_length, y + h), color, 4)
        cv2.line(annotated, (x, y + h), (x, y + h - corner_length), color, 4)
        # Bottom-right
        cv2.line(annotated, (x + w, y + h), (x + w - corner_length, y + h), color, 4)
        cv2.line(annotated, (x + w, y + h), (x + w, y + h - corner_length), color, 4)

        # Draw label background
        label = f"{class_name}: {confidence:.2f}"
        (label_w, label_h), baseline = cv2.getTextSize(
            label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2
        )
        cv2.rectangle(
            annotated,
            (x, y - label_h - 15),
            (x + label_w + 10, y),
            color,
            -1
        )

        # Draw label text
        cv2.putText(
            annotated,
            label,
            (x + 5, y - 8),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (255, 255, 255),
            2
        )

    # === ADD LEGEND ===
    legend_height = 100
    legend = np.zeros((legend_height, annotated.shape[1], 3), dtype=np.uint8)
    legend.fill(30)  # Dark background

    # Legend text
    legend_items = [
        ("Edges: Cyan", (0, 255, 255)),
        ("Contours: Purple (circular) / Blue (irregular)", (255, 100, 255)),
        ("Detections: Colored boxes with corners", (255, 255, 255))
    ]

    y_offset = 25
    for i, (text, color) in enumerate(legend_items):
        cv2.putText(legend, text, (10, y_offset + i * 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)

    # Combine image with legend
    annotated = np.vstack([annotated, legend])

    # Convert to JPEG bytes
    annotated_bgr = cv2.cvtColor(annotated, cv2.COLOR_RGB2BGR)
    _, buffer = cv2.imencode('.jpg', annotated_bgr, [cv2.IMWRITE_JPEG_QUALITY, 95])
    return buffer.tobytes()


@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    print("Starting LungEvity YOLOv12 Backend Server...")
    load_model()


@app.get("/health")
async def health_check():
    """Check API health status"""
    return {
        "status": "healthy" if MODEL_LOADED else "unhealthy",
        "model": "YOLOv12",
        "modelPath": MODEL_PATH,
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "model_loaded": MODEL_LOADED,
        "classes": CANCER_CLASSES if MODEL_LOADED else []
    }


@app.post("/api/v1/scan/analyze")
async def analyze_scan(scan: UploadFile = File(...)):
    """
    Analyze CT scan image for lung cancer detection
    """
    if not MODEL_LOADED:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please check server configuration."
        )

    # Validate file format
    allowed_formats = ['.dcm', '.dicom', '.nii', '.jpg', '.jpeg', '.png']
    file_ext = os.path.splitext(scan.filename)[1].lower()

    if file_ext not in allowed_formats:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Supported formats: {', '.join(allowed_formats)}"
        )

    # Check file size (100MB limit)
    MAX_SIZE = 100 * 1024 * 1024
    contents = await scan.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds 100MB limit"
        )

    try:
        # Read and process image
        start_time = datetime.utcnow()
        image = read_image(contents, scan.filename)

        # Run YOLO inference
        results = process_image_with_yolo(image)
        processing_time = (datetime.utcnow() - start_time).total_seconds()

        # Generate scan ID
        scan_id = generate_scan_id()

        # Determine risk level
        risk_level = get_risk_level(results["confidence"], results["topClass"])

        # Store images for later retrieval
        scan_images[scan_id] = {
            "original": image,
            "detections": results["detections"]
        }

        # Create response with full URLs for CORS
        base_url = "http://localhost:8000"  # Use the backend URL
        response_data = {
            "scanId": scan_id,
            "status": "completed",
            "uploadTime": datetime.utcnow().isoformat(),
            "processingTime": round(processing_time, 2),
            "results": {
                "detected": results["detected"],
                "confidence": round(results["confidence"], 3),
                "riskLevel": risk_level,
                "topClass": results["topClass"],
                "detections": results["detections"],
                "imageUrl": f"{base_url}/api/v1/scan/{scan_id}/image",
                "annotatedImageUrl": f"{base_url}/api/v1/scan/{scan_id}/annotated"
            },
            "metadata": {
                "imageSize": results["imageSize"],
                "fileSize": len(contents),
                "format": file_ext.upper().replace('.', '')
            }
        }

        # Store in database
        scans_db[scan_id] = response_data

        return JSONResponse(content=response_data)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error processing scan: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")


@app.get("/api/v1/scan/{scan_id}")
async def get_scan_result(scan_id: str):
    """Get scan result by ID"""
    if scan_id not in scans_db:
        raise HTTPException(status_code=404, detail="Scan not found")

    return JSONResponse(content=scans_db[scan_id])


@app.get("/api/v1/scan/{scan_id}/image")
async def get_scan_image(scan_id: str):
    """Get original scan image"""
    if scan_id not in scan_images:
        raise HTTPException(status_code=404, detail="Scan image not found")

    image = scan_images[scan_id]["original"]
    image_bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    _, buffer = cv2.imencode('.jpg', image_bgr)

    return Response(content=buffer.tobytes(), media_type="image/jpeg")


@app.get("/api/v1/scan/{scan_id}/annotated")
async def get_annotated_image(scan_id: str):
    """Get annotated scan image with bounding boxes"""
    if scan_id not in scan_images:
        raise HTTPException(status_code=404, detail="Scan image not found")

    image = scan_images[scan_id]["original"]
    detections = scan_images[scan_id]["detections"]

    annotated_bytes = create_annotated_image(image, detections)

    return Response(content=annotated_bytes, media_type="image/jpeg")


@app.get("/api/v1/patient/{patient_id}/scans")
async def get_patient_scans(patient_id: str):
    """Get all scans for a patient"""
    # In production, query database by patient_id
    # This is a mock implementation
    patient_scans = list(scans_db.values())

    return {
        "patientId": patient_id,
        "totalScans": len(patient_scans),
        "scans": [
            {
                "scanId": scan["scanId"],
                "uploadTime": scan["uploadTime"],
                "status": scan["status"],
                "riskLevel": scan["results"]["riskLevel"],
                "confidence": scan["results"]["confidence"],
                "detected": scan["results"]["detected"]
            }
            for scan in patient_scans
        ]
    }


@app.get("/api/v1/config/thresholds")
async def get_thresholds():
    """Get detection confidence thresholds"""
    return {
        "highRisk": 0.8,
        "mediumRisk": 0.5,
        "lowRisk": 0.3
    }


@app.post("/api/v1/scan/batch-analyze")
async def batch_analyze(scans: List[UploadFile] = File(...)):
    """Analyze multiple CT scan slices"""
    if not MODEL_LOADED:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please check server configuration."
        )

    batch_id = f"batch_{uuid.uuid4().hex[:12]}"
    results = []

    for idx, scan in enumerate(scans):
        contents = await scan.read()
        try:
            image = read_image(contents, scan.filename)
            result = process_image_with_yolo(image)

            results.append({
                "scanId": generate_scan_id(),
                "sliceNumber": idx + 1,
                "detected": result["detected"],
                "confidence": result["confidence"],
                "riskLevel": get_risk_level(result["confidence"], result["topClass"])
            })
        except Exception as e:
            results.append({
                "scanId": None,
                "sliceNumber": idx + 1,
                "error": str(e)
            })

    # Calculate overall assessment
    detected_slices = sum(1 for r in results if r.get("detected", False))
    max_confidence = max([r.get("confidence", 0) for r in results], default=0)

    return {
        "batchId": batch_id,
        "totalScans": len(scans),
        "completedScans": len(results),
        "status": "completed",
        "results": results,
        "overallAssessment": {
            "maxConfidence": max_confidence,
            "riskLevel": get_risk_level(max_confidence, "unknown"),
            "detectedSlices": detected_slices,
            "totalSlices": len(scans)
        }
    }


if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
