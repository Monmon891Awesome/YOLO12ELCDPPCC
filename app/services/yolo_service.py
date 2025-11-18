"""
YOLO Service for PneumAI
YOLOv12 model inference for lung cancer detection
"""

import numpy as np
from typing import List, Dict, Optional
import logging
import os
from ultralytics import YOLO

from app.config import settings
from app.utils.helpers import calculate_risk_level

logger = logging.getLogger(__name__)


class YOLOService:
    """YOLO model service for lung cancer detection"""

    def __init__(self):
        """Initialize YOLO service"""
        self.model: Optional[YOLO] = None
        self.model_loaded = False
        self.model_path = settings.MODEL_PATH
        self.confidence_threshold = settings.YOLO_CONFIDENCE_THRESHOLD

    def load_model(self) -> bool:
        """
        Load the YOLOv12 model from file

        Returns:
            True if model loaded successfully, False otherwise
        """
        try:
            if not os.path.exists(self.model_path):
                logger.error(f"❌ Model file not found: {self.model_path}")
                logger.error(f"Current directory: {os.getcwd()}")
                return False

            logger.info(f"Loading YOLO model from {self.model_path}...")
            self.model = YOLO(str(self.model_path))
            self.model_loaded = True
            logger.info("✅ YOLO model loaded successfully!")
            return True

        except Exception as e:
            logger.error(f"❌ Error loading YOLO model: {e}")
            import traceback
            traceback.print_exc()
            self.model_loaded = False
            return False

    def is_loaded(self) -> bool:
        """
        Check if model is loaded

        Returns:
            True if model is loaded, False otherwise
        """
        return self.model_loaded and self.model is not None

    def analyze(self, image: np.ndarray) -> Dict:
        """
        Process CT scan image with YOLOv12 model

        Args:
            image: Input image as numpy array (BGR format from OpenCV)

        Returns:
            Dictionary with detection results
        """
        if not self.is_loaded():
            raise Exception("YOLO model not loaded. Call load_model() first.")

        try:
            # Run YOLO inference
            results = self.model(image, conf=self.confidence_threshold)

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
                        class_name = self.model.names[cls_id]

                        # Get bounding box coordinates
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()

                        # Update max confidence and top class
                        if confidence > max_confidence:
                            max_confidence = confidence
                            top_class = class_name

                        # Calculate approximate size in mm
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

            # Calculate risk level using helper function
            risk_level = calculate_risk_level(max_confidence, detected)

            return {
                "detected": detected,
                "confidence": float(max_confidence),
                "topClass": top_class,
                "riskLevel": risk_level,
                "detections": detections,
                "imageSize": {"width": int(width), "height": int(height)}
            }

        except Exception as e:
            logger.error(f"❌ Error during YOLO inference: {e}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Model inference error: {str(e)}")

    def get_model_info(self) -> Dict:
        """
        Get information about the loaded model

        Returns:
            Dictionary with model information
        """
        if not self.is_loaded():
            return {
                "loaded": False,
                "model_path": str(self.model_path),
                "confidence_threshold": self.confidence_threshold
            }

        return {
            "loaded": True,
            "model_path": str(self.model_path),
            "confidence_threshold": self.confidence_threshold,
            "classes": self.model.names if self.model else {},
            "num_classes": len(self.model.names) if self.model else 0
        }


# Global YOLO service instance
yolo_service = YOLOService()
