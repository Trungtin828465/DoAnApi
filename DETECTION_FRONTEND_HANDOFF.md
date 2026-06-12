# Frontend Detection Handoff

## Scope

Object detection has been removed from the backend.

The backend no longer exposes:
- `POST /api/detect`
- `GET /api/detect/health`

The Flutter app should now run detection on-device.

## Recommended frontend approach

For a demo, the cleanest path is:

1. Export the YOLO model from `.pt` to `tflite`
2. Bundle the `.tflite` model inside the Flutter app
3. Run inference on-device
4. Draw bounding boxes directly in Flutter

This avoids:
- Render cold start
- API timeout
- image upload delay
- Python runtime issues on hosting

## Current class mapping

Use this exact class list in Flutter:

```yaml
names:
  0: bed
  1: sofa
  2: chair
  3: table
  4: wardrobe
  5: refrigerator
  6: tv
  7: door
  8: window
  9: fan
  10: laptop
  11: washing_machine
```

Equivalent Dart list:

```dart
const List<String> detectionClasses = [
  'bed',
  'sofa',
  'chair',
  'table',
  'wardrobe',
  'refrigerator',
  'tv',
  'door',
  'window',
  'fan',
  'laptop',
  'washing_machine',
];
```

## Expected detection output shape

The Flutter layer should normalize model output to this structure:

```json
{
  "success": true,
  "detections": [
    {
      "class_id": 0,
      "class_name": "bed",
      "confidence": 0.95,
      "x": 100.5,
      "y": 150.2,
      "width": 300.0,
      "height": 250.0
    }
  ],
  "count": 1
}
```

Field meanings:
- `class_id`: model class index
- `class_name`: mapped label from the class list above
- `confidence`: score from `0.0` to `1.0`
- `x`, `y`: top-left corner
- `width`, `height`: bounding box size

## Suggested Flutter flow

1. User picks image from gallery or camera
2. Resize image before inference if it is too large
3. Run model on-device
4. Convert raw model output into the normalized detection object
5. Render boxes and labels on top of the image

## Practical demo settings

Recommended defaults for a demo build:
- confidence threshold: `0.1`
- input image max dimension: `1024` or `1280`
- run on a still image first, not live camera stream

## UI behavior

Recommended user flow:
- show preview image immediately
- show loading state while inference runs
- overlay boxes after inference
- show object count
- allow user to retake or pick another image

## Notes for model conversion

The current backend used a YOLO `.pt` model. Flutter should not use the `.pt` file directly.

Frontend needs a mobile-friendly export such as:
- `tflite`
- or another format supported by the chosen Flutter inference package

Typical conversion direction:

```bash
yolo export model=model/best.pt format=tflite
```

The exact export result depends on the Ultralytics version and model compatibility.

## Backend status

Detection is intentionally removed from backend runtime.

Remaining backend APIs are unrelated to object detection:
- auth
- room
- tts

## Recommended next step for frontend team

1. Convert `best.pt` to `best.tflite`
2. Add the model to Flutter assets
3. Implement on-device inference service
4. Map prediction indices with the class list in this document
5. Render boxes on the selected image
