"""
YOLOv12 Lung Cancer Detection Backend Server
FastAPI implementation with YOLO model integration

Installation:
pip install fastapi uvicorn python-multipart ultralytics opencv-python pillow numpy

Run:
uvicorn backend_server:app --host 0.0.0.0 --port 8000 --reload

Or use the startup script:
python start_backend.py
"""

import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
import cv2
import numpy as np
from PIL import Image
import io
import os
import traceback
from datetime import datetime
from typing import Dict, List, Set
from ultralytics import YOLO
import pydicom
import json
import asyncio

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
model = None
MODEL_LOADED = False


# WebSocket Connection Manager for real-time updates
class ConnectionManager:
    """Manage WebSocket connections for real-time updates"""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        """Accept and store new WebSocket connection"""
        await websocket.accept()
        self.active_connections.add(websocket)
        print(f"✓ WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """Remove WebSocket connection"""
        self.active_connections.discard(websocket)
        print(f"✓ WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """Send message to all connected clients"""
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending to client: {e}")
                disconnected.add(connection)

        # Remove disconnected clients
        for conn in disconnected:
            self.disconnect(conn)

# Initialize connection manager
manager = ConnectionManager()





def load_model():
    """Load the YOLOv12 model from best.pt"""
    global model, MODEL_LOADED
    try:
        if not os.path.exists("best.pt"):
            print("Error: best.pt not found in current directory")
            print(f"Current directory: {os.getcwd()}")
            return False

        print("Loading YOLO model from best.pt...")
        model = YOLO("best.pt")
        MODEL_LOADED = True
        print("Model loaded successfully!")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        traceback.print_exc()
        MODEL_LOADED = False
        return False


def read_image(file_bytes: bytes, filename: str) -> np.ndarray:
    """Read uploaded image file into numpy array (supports DICOM, JPEG, PNG, etc.)"""
    try:
        print(f"Reading image: {filename}, size: {len(file_bytes)} bytes")
        
        # Check if it's a DICOM file
        if filename.lower().endswith('.dcm') or filename.lower().endswith('.dicom'):
            try:
                print("Detected DICOM file, parsing...")
                dicom_data = pydicom.dcmread(io.BytesIO(file_bytes))
                
                # Get pixel data
                pixel_array = dicom_data.pixel_array.astype(np.float32)
                print(f"DICOM pixel array shape: {pixel_array.shape}, dtype: {pixel_array.dtype}")
                
                # Normalize to 8-bit
                # Apply windowing if available (handle MultiValue)
                try:
                    if hasattr(dicom_data, 'WindowCenter') and hasattr(dicom_data, 'WindowWidth'):
                        window_center = dicom_data.WindowCenter
                        window_width = dicom_data.WindowWidth
                        
                        # Handle MultiValue - take first element if it's a list
                        if isinstance(window_center, (list, tuple)):
                            window_center = window_center[0]
                        if isinstance(window_width, (list, tuple)):
                            window_width = window_width[0]
                        
                        center = float(window_center)
                        width = float(window_width)
                        lower = center - width / 2
                        upper = center + width / 2
                        pixel_array = np.clip(pixel_array, lower, upper)
                        print(f"Applied windowing: center={center}, width={width}")
                except Exception as window_error:
                    print(f"Window level not applied: {window_error}")
                
                # Normalize to 0-255
                pixel_min = pixel_array.min()
                pixel_max = pixel_array.max()
                print(f"Pixel range before normalization: {pixel_min}-{pixel_max}")
                
                if pixel_max > pixel_min:
                    pixel_array = ((pixel_array - pixel_min) / (pixel_max - pixel_min) * 255).astype(np.uint8)
                else:
                    pixel_array = np.zeros_like(pixel_array).astype(np.uint8)
                
                print(f"Normalized to 8-bit: {pixel_array.min()}-{pixel_array.max()}")
                
                # Convert grayscale to BGR for consistency
                if len(pixel_array.shape) == 2:
                    image = cv2.cvtColor(pixel_array, cv2.COLOR_GRAY2BGR)
                else:
                    image = pixel_array
                
                print(f"Final image shape: {image.shape}")
                return image
                
            except Exception as dicom_error:
                print(f"DICOM parsing failed: {dicom_error}, trying standard formats...")
                import traceback
                traceback.print_exc()
        
        # Try PIL for standard image formats
        try:
            pil_image = Image.open(io.BytesIO(file_bytes))
            print(f"PIL opened image, mode: {pil_image.mode}, size: {pil_image.size}")
            
            # Convert to RGB if needed
            if pil_image.mode not in ('RGB', 'L'):
                pil_image = pil_image.convert('RGB')
            
            # Convert to numpy array
            image = np.array(pil_image)
            print(f"Image shape after PIL: {image.shape}")
            
            # Convert RGB to BGR for OpenCV compatibility
            if len(image.shape) == 3 and image.shape[2] == 3:
                image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            elif len(image.shape) == 2:
                # Grayscale to BGR
                image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
            
            return image
        except Exception as pil_error:
            print(f"PIL failed: {pil_error}, trying OpenCV...")
            
            # Fallback to OpenCV
            nparr = np.frombuffer(file_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                raise ValueError("All decoders failed - unsupported file format")
            
            return image
            
    except Exception as e:
        print(f"Error reading image: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")


def generate_scan_id() -> str:
    """Generate unique scan ID"""
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    return f"scan_{timestamp}"


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

        # Calculate risk level based on confidence and detection
        if not detected:
            risk_level = "none"
        elif max_confidence >= 0.75:
            risk_level = "high"
        elif max_confidence >= 0.50:
            risk_level = "medium"
        else:
            risk_level = "low"

        return {
            "detected": detected,
            "confidence": float(max_confidence),
            "topClass": top_class,
            "riskLevel": risk_level,
            "detections": detections,
            "imageSize": {"width": int(width), "height": int(height)}
        }

    except Exception as e:
        print(f"Error during YOLO inference: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Model inference error: {str(e)}")


def create_annotated_image(image: np.ndarray, detections: List[dict]) -> bytes:
    """Create annotated image with YOLO boxes, edge detection, contour analysis, and legend"""
    annotated = image.copy()
    height, width = annotated.shape[:2]

    # Define colors (BGR format)
    yolo_color = (0, 0, 255)      # Red for YOLO detections
    edge_color = (255, 255, 0)    # Cyan for edge detection
    contour_color = (128, 0, 128) # Purple for contour analysis

    # Step 1: Edge Detection (Canny algorithm)
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, threshold1=50, threshold2=150)

    # Create edge overlay (cyan pixels where edges detected)
    edge_overlay = np.zeros_like(annotated)
    edge_overlay[edges > 0] = edge_color
    annotated = cv2.addWeighted(annotated, 0.85, edge_overlay, 0.15, 0)

    # Step 2: Contour Analysis
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for contour in contours:
        area = cv2.contourArea(contour)
        if area > 100:  # Filter small noise contours
            # Draw purple contours
            cv2.drawContours(annotated, [contour], -1, contour_color, 1)

    # Step 3: YOLO Bounding Boxes
    for det in detections:
        bbox = det.get("boundingBox", {})
        x = int(bbox.get("x", 0))
        y = int(bbox.get("y", 0))
        w = int(bbox.get("width", 0))
        h = int(bbox.get("height", 0))
        class_name = det.get("class", "unknown")
        confidence = det.get("confidence", 0.0)

        # Draw red YOLO box
        cv2.rectangle(annotated, (x, y), (x + w, y + h), yolo_color, 2)

        # Add label with confidence
        label = f"{class_name.replace('_', ' ').title()}: {confidence*100:.1f}%"
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.5
        font_thickness = 1
        (label_width, label_height), baseline = cv2.getTextSize(label, font, font_scale, font_thickness)

        label_y = y - 10 if y > 30 else y + h + 20
        padding = 4
        cv2.rectangle(annotated,
                     (x, label_y - label_height - padding),
                     (x + label_width + padding * 2, label_y + padding),
                     (0, 0, 0), -1)
        cv2.putText(annotated, label, (x + padding, label_y),
                   font, font_scale, (255, 255, 255), font_thickness)

    # Step 4: Add Legend at Bottom
    legend_height = 50
    legend = np.ones((legend_height, width, 3), dtype=np.uint8) * 240  # Light gray background

    # Legend text
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.45
    font_thickness = 1
    y_offset = 30

    # Red box indicator
    cv2.rectangle(legend, (20, 15), (40, 35), yolo_color, -1)
    cv2.putText(legend, "Detection", (50, y_offset), font, font_scale, (0, 0, 0), font_thickness)

    # Cyan edge indicator
    cv2.rectangle(legend, (int(width * 0.33), 15), (int(width * 0.33) + 20, 35), edge_color, -1)
    cv2.putText(legend, "Edges", (int(width * 0.33) + 30, y_offset), font, font_scale, (0, 0, 0), font_thickness)

    # Purple contour indicator
    cv2.rectangle(legend, (int(width * 0.66), 15), (int(width * 0.66) + 20, 35), contour_color, -1)
    cv2.putText(legend, "Contours", (int(width * 0.66) + 30, y_offset), font, font_scale, (0, 0, 0), font_thickness)

    # Combine image and legend
    annotated_with_legend = np.vstack([annotated, legend])

    # Encode as JPEG
    success, encoded_image = cv2.imencode('.jpg', annotated_with_legend, [cv2.IMWRITE_JPEG_QUALITY, 95])
    if not success:
        raise HTTPException(status_code=500, detail="Failed to encode annotated image")

    return encoded_image.tobytes()


# Store uploaded images and results
scan_images: Dict[str, dict] = {}

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    global model, MODEL_LOADED
    try:
        model = YOLO("best.pt")
        MODEL_LOADED = True
        print("✅ Model loaded successfully")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        MODEL_LOADED = False

@app.get("/health")
async def health_check():
    """Check API health status"""
    return {
        "status": "healthy",
        "model_loaded": MODEL_LOADED
    }

@app.post("/api/v1/scan/analyze")
async def analyze_scan(scan: UploadFile = File(...)):
    """Analyze CT scan image"""
    try:
        contents = await scan.read()
        
        # Record start time
        start_time = datetime.utcnow()
        
        # Read and process image
        image = read_image(contents, scan.filename)
        results = process_image_with_yolo(image)
        
        # Calculate processing time
        processing_time = (datetime.utcnow() - start_time).total_seconds()

        # Generate scan ID and store results
        scan_id = generate_scan_id()
        scan_images[scan_id] = {
            "original": image,
            "detections": results["detections"]
        }

        # Create response
        base_url = "http://localhost:8000"
        response_data = {
            "scanId": scan_id,
            "status": "completed",
            "uploadTime": datetime.utcnow().isoformat(),
            "processingTime": round(processing_time, 3),
            "results": {
                "detected": results["detected"],
                "confidence": results["confidence"],
                "topClass": results["topClass"],
                "riskLevel": results["riskLevel"],
                "detections": results["detections"],
                "imageSize": results["imageSize"],
                "imageUrl": f"{base_url}/api/v1/scan/{scan_id}/image",
                "annotatedImageUrl": f"{base_url}/api/v1/scan/{scan_id}/annotated"
            }
        }

        # Broadcast scan completion to all connected clients
        await manager.broadcast({
            "type": "scan_completed",
            "data": response_data
        })

        return JSONResponse(content=response_data)
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error processing scan: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/scan/{scan_id}/image")
async def get_scan_image(scan_id: str):
    """Get original scan image"""
    if scan_id not in scan_images:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    image = scan_images[scan_id]["original"]
    success, encoded_image = cv2.imencode('.jpg', image)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to encode image")
        
    return Response(content=encoded_image.tobytes(), media_type="image/jpeg")

@app.get("/api/v1/scan/{scan_id}/annotated")
async def get_annotated_image(scan_id: str):
    """Get annotated scan image"""
    if scan_id not in scan_images:
        raise HTTPException(status_code=404, detail="Scan not found")

    image = scan_images[scan_id]["original"]
    detections = scan_images[scan_id]["detections"]

    annotated_image = create_annotated_image(image, detections)
    return Response(content=annotated_image, media_type="image/jpeg")


@app.websocket("/ws/scans")
async def websocket_scans(websocket: WebSocket):
    """WebSocket endpoint for real-time scan updates"""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and listen for client messages
            _ = await websocket.receive_text()
            # Echo back for ping/pong
            await websocket.send_json({"type": "pong", "timestamp": datetime.now().isoformat()})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)


# Run the API with uvicorn
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend_server:app", host="0.0.0.0", port=port, reload=True)

