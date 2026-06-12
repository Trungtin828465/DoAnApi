import json
import os
import sys
import cv2

YOLO_CONFIG_DIR = os.environ.get("YOLO_CONFIG_DIR", "/tmp/Ultralytics")
os.environ["YOLO_CONFIG_DIR"] = YOLO_CONFIG_DIR
os.makedirs(YOLO_CONFIG_DIR, exist_ok=True)

from ultralytics import YOLO

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "best.pt")
MAX_IMAGE_DIMENSION = int(os.environ.get("DETECTION_MAX_IMAGE_DIMENSION", "1280"))

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


def emit(payload):
    print(json.dumps(payload), flush=True)


def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

    return YOLO(MODEL_PATH)


def load_image_for_inference(image_path):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Unable to read image: {image_path}")

    height, width = image.shape[:2]
    longest_side = max(height, width)

    if longest_side <= MAX_IMAGE_DIMENSION:
        return image

    scale = MAX_IMAGE_DIMENSION / float(longest_side)
    resized_width = max(1, int(width * scale))
    resized_height = max(1, int(height * scale))
    return cv2.resize(image, (resized_width, resized_height), interpolation=cv2.INTER_AREA)


def detect_objects(model, image_path, confidence_threshold=0.1):
    if not os.path.exists(image_path):
        return {
            "success": False,
            "message": f"Image file not found: {image_path}"
        }

    image = load_image_for_inference(image_path)
    results = model(image, conf=confidence_threshold, verbose=False)
    detections = []

    for result in results:
        if not result.boxes:
            continue

        for box in result.boxes:
            class_id = int(box.cls[0])
            class_name = CLASS_NAMES.get(class_id, f"unknown_{class_id}")
            confidence = float(box.conf[0])

            x1, y1, x2, y2 = box.xyxy[0]
            x1, y1, x2, y2 = float(x1), float(y1), float(x2), float(y2)

            detections.append({
                "class_id": class_id,
                "class_name": class_name,
                "confidence": confidence,
                "x": x1,
                "y": y1,
                "width": x2 - x1,
                "height": y2 - y1
            })

    detections.sort(key=lambda item: item["confidence"], reverse=True)

    return {
        "success": True,
        "detections": detections,
        "count": len(detections)
    }


def main():
    try:
        model = load_model()
        emit({"type": "ready"})
    except Exception as error:
        emit({"type": "error", "message": f"Worker startup error: {error}"})
        sys.exit(1)

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            job = json.loads(line)
            request_id = job["id"]
            image_path = job["image_path"]
            confidence = float(job.get("confidence", 0.1))

            payload = detect_objects(model, image_path, confidence)
            emit({
                "type": "result",
                "id": request_id,
                "success": True,
                "payload": payload
            })
        except Exception as error:
            emit({
                "type": "result",
                "id": job.get("id") if isinstance(job, dict) else None,
                "success": False,
                "error": f"Detection error: {error}"
            })


if __name__ == "__main__":
    main()
