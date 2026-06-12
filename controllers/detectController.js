const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Confidence threshold (adjustable)
const CONFIDENCE_THRESHOLD = 0.1;

// Temporary directory for uploaded images
const getTempDir = () => {
  const tempDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
};

/**
 * Run Python detection script
 * @param {string} imagePath - Path to image file
 * @param {number} confidence - Confidence threshold
 * @returns {Promise<Object>} Detection results
 */
function runPythonDetection(imagePath, confidence = CONFIDENCE_THRESHOLD) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../detect.py');
    const pythonExecutable =
      process.env.PYTHON_BIN ||
      (os.platform() === 'win32' ? 'python' : 'python3');
    const pythonProcess = spawn(pythonExecutable, [pythonScript, imagePath, confidence.toString()]);
    
    let output = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error('Python stderr:', data.toString());
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python process exited with code:', code);
        console.error('Error output:', errorOutput);
        reject(new Error(`Python process exited with code ${code}: ${errorOutput}`));
        return;
      }
      
      try {
        const result = JSON.parse(output);
        resolve(result);
      } catch (parseError) {
        console.error('Failed to parse Python output:', output);
        reject(new Error(`Failed to parse Python output: ${parseError.message}`));
      }
    });
    
    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      reject(new Error(`Failed to start Python process with "${pythonExecutable}": ${err.message}`));
    });
    
    // Set timeout (30 seconds)
    setTimeout(() => {
      pythonProcess.kill();
      reject(new Error('Python detection process timeout'));
    }, 30000);
  });
}

/**
 * Object Detection endpoint
 * POST /api/detect
 * Body: multipart/form-data with "image" field
 */
exports.detectObjects = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Please upload an image file with field name "image"'
      });
    }
    
    const imagePath = req.file.path;
    
    console.log(`Processing image: ${imagePath}`);
    
    // Run Python detection
    const detectionResult = await runPythonDetection(imagePath, CONFIDENCE_THRESHOLD);
    
    // Clean up temp file
    try {
      fs.unlinkSync(imagePath);
    } catch (cleanupError) {
      console.error('Failed to delete temp file:', cleanupError);
    }
    
    if (detectionResult.success) {
      return res.status(200).json(detectionResult);
    } else {
      return res.status(400).json(detectionResult);
    }
    
  } catch (error) {
    console.error('Detection error:', error);
    
    // Clean up temp file if exists
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to delete temp file:', cleanupError);
      }
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error during object detection',
      error: error.message
    });
  }
};

/**
 * Health check endpoint
 * GET /api/detect/health
 */
exports.detectHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Object Detection',
    model: 'YOLOv8',
    confidence_threshold: CONFIDENCE_THRESHOLD
  });
};
