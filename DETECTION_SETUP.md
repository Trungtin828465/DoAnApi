# Object Detection Endpoint - Setup Guide

## 📋 Requirements

### Backend Dependencies
- Node.js + Express (already installed)
- Python 3.8+
- YOLOv8 Model: `model/best.pt`

### Python Dependencies
```bash
pip install ultralytics
pip install opencv-python
```

## 🚀 Installation Steps

### 1. Install Backend Dependencies
```bash
npm install
```
This installs `multer` for file upload handling.

### 2. Install Python Dependencies
```bash
pip install ultralytics opencv-python
```

### 3. Setup Model File
- Place your YOLOv8 model file at: `model/best.pt`
- Create the `model` folder if it doesn't exist:
```bash
mkdir model
# Copy your best.pt file to this folder
```

### 4. Start Backend
```bash
npm start
# or for development:
npm run dev
```

## 🔌 Endpoint Details

### POST /api/detect
**Description**: Run object detection on uploaded image

**Request**:
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - Field name: `image`
  - Value: Image file (JPEG, PNG, GIF, WebP)
  - Max size: 50MB

**Response (Success - 200)**:
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
    },
    {
      "class_id": 2,
      "class_name": "chair",
      "confidence": 0.87,
      "x": 450.0,
      "y": 200.0,
      "width": 150.0,
      "height": 180.0
    }
  ],
  "count": 2
}
```

**Response (Error - 400/500)**:
```json
{
  "success": false,
  "message": "error description"
}
```

### GET /api/detect/health
**Description**: Health check for detection service

**Response**:
```json
{
  "status": "ok",
  "service": "Object Detection",
  "model": "YOLOv8",
  "confidence_threshold": 0.5
}
```

## 📝 Supported Classes (12 types)

| ID | Class Name |
|----|-----------|
| 0 | bed |
| 1 | sofa |
| 2 | chair |
| 3 | table |
| 4 | lamp |
| 5 | tv |
| 6 | laptop |
| 7 | wardrobe |
| 8 | window |
| 9 | door |
| 10 | potted plant |
| 11 | photo frame |

## 🧪 Testing

### Using curl:
```bash
curl -X POST -F "image=@test.jpg" http://localhost:3000/api/detect
```

### Using JavaScript/Fetch:
```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('http://localhost:3000/api/detect', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data);
```

### Using Python:
```python
import requests

with open('test.jpg', 'rb') as f:
    files = {'image': f}
    response = requests.post('http://localhost:3000/api/detect', files=files)
    
print(response.json())
```

## ⚙️ Configuration

### Confidence Threshold
- **Current**: 0.5 (50%)
- **Location**: `controllers/detectController.js` - `CONFIDENCE_THRESHOLD` constant
- **Range**: 0.0 - 1.0 (higher = more confident detections only)

To modify:
```javascript
const CONFIDENCE_THRESHOLD = 0.6; // Change from 0.5 to 0.6
```

## 📁 Project Structure
```
backend/
├── model/
│   └── best.pt          # YOLOv8 model (your file)
├── uploads/             # Temporary image storage
│   └── image_*.jpg      # Auto-cleaned after processing
├── controllers/
│   └── detectController.js
├── routes/
│   └── detect.js
├── detect.py           # Python detection script
├── server.js           # Updated with /api/detect route
├── package.json        # Updated with multer dependency
└── DETECTION_SETUP.md  # This file
```

## 🔧 Troubleshooting

### Python not found
- Ensure Python is installed and in PATH
- Try: `python --version` or `python3 --version`

### Model file not found
- Check that `model/best.pt` exists
- Verify the file path is correct

### Detection timeout
- Increase timeout in `detectController.js` (currently 30 seconds)
- Check image size - larger images take longer to process

### File upload errors
- Max file size is 50MB (set in `routes/detect.js`)
- Only JPEG, PNG, GIF, WebP accepted

### Python module not found (ultralytics)
```bash
pip install ultralytics --upgrade
```

## 📊 Performance Notes

- **Processing time**: Typically 1-5 seconds per image (depends on image size)
- **Memory**: ~2-3GB required for YOLOv8 inference
- **Concurrent requests**: Handled sequentially (Python spawning is serial)

## 🔐 Security Considerations

- Files are temporarily stored in `/uploads` and auto-deleted after processing
- File type validation (MIME type checking)
- File size limits (50MB max)
- Timeout protection (30 seconds max)

## ✅ Verification Checklist

- [ ] Python 3.8+ installed
- [ ] `pip install ultralytics opencv-python`
- [ ] `model/best.pt` file exists
- [ ] `npm install` completed
- [ ] Backend started with `npm start`
- [ ] Health check works: `curl http://localhost:3000/api/detect/health`
- [ ] Test detection: `curl -X POST -F "image=@test.jpg" http://localhost:3000/api/detect`
