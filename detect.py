import sys
import json
import os
import tempfile

YOLO_CONFIG_DIR = os.environ.get("YOLO_CONFIG_DIR", os.path.join(tempfile.gettempdir(), "Ultralytics"))
os.environ["YOLO_CONFIG_DIR"] = YOLO_CONFIG_DIR
os.makedirs(YOLO_CONFIG_DIR, exist_ok=True)

from ultralytics import YOLO

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Class mapping (12 furniture types)
CLASS_NAMES = {
    0: "bed",
    1: "sofa",
    2: "chair",
    3: "table",
    4: "wardrobe",
    5: "refrigerator",
    6: "tv",
    7: "door",
    8: "window",
    9: "fan",
    10: "laptop",
    11: "washing_machine"
}

def detect_objects(image_path, confidence_threshold=0.1):
    """
    Run YOLOv8 detection on image
    Args:
        image_path: Path to image file
        confidence_threshold: Confidence threshold (default 0.5)
    Returns:
        JSON string with detections
    """
    try:
        # Check if image exists
        if not os.path.exists(image_path):
            return json.dumps({
                "success": False,
                "message": f"Image file not found: {image_path}"
            })
        
        # Load model
        model_path = os.path.join(BASE_DIR, "model", "best.pt")
        if not os.path.exists(model_path):
            return json.dumps({
                "success": False,
                "message": f"Model file not found: {model_path}"
            })
        
        model = YOLO(model_path)
        
        # Run inference
        results = model(image_path, conf=confidence_threshold, verbose=False)
        
        detections = []
        
        # Parse results
        for result in results:
            if result.boxes:
                for box in result.boxes:
                    class_id = int(box.cls[0])
                    class_name = CLASS_NAMES.get(class_id, f"unknown_{class_id}")
                    confidence = float(box.conf[0])
                    
                    # Get bounding box coordinates (xyxy format: x1, y1, x2, y2)
                    x1, y1, x2, y2 = box.xyxy[0]
                    x1, y1, x2, y2 = float(x1), float(y1), float(x2), float(y2)
                    
                    # Convert to x, y, width, height format
                    x = x1
                    y = y1
                    width = x2 - x1
                    height = y2 - y1
                    
                    det = {
                        "class_id": class_id,
                        "class_name": class_name,
                        "confidence": confidence,
                        "x": x,
                        "y": y,
                        "width": width,
                        "height": height
                    }
                    detections.append(det)
        
        # Sort by confidence (descending)
        detections.sort(key=lambda x: x["confidence"], reverse=True)
        
        return json.dumps({
            "success": True,
            "detections": detections,
            "count": len(detections)
        })
        
    except Exception as e:
        return json.dumps({
            "success": False,
            "message": f"Detection error: {str(e)}"
        })

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "message": "Usage: python detect.py <image_path> [confidence_threshold]"
        }))
        sys.exit(1)
    
    image_path = sys.argv[1]
    confidence = float(sys.argv[2]) if len(sys.argv) > 2 else 0.1
    
    result = detect_objects(image_path, confidence)
    print(result)
