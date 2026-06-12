const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const readline = require('readline');

const CONFIDENCE_THRESHOLD = 0.1;
const DETECTION_TIMEOUT_MS = Number(process.env.DETECTION_TIMEOUT_MS || 30000);
const DETECTION_STARTUP_TIMEOUT_MS = Number(process.env.DETECTION_STARTUP_TIMEOUT_MS || 120000);

const pythonExecutable =
  process.env.PYTHON_BIN ||
  (os.platform() === 'win32' ? 'python' : 'python3');
const pythonScript = path.join(__dirname, '../detect_worker.py');

let workerProcess = null;
let workerReady = false;
let workerStarting = null;
let requestCounter = 0;
const pendingRequests = new Map();

function cleanupTempFile(filePath) {
  if (!filePath) {
    return;
  }

  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error('Failed to delete temp file:', error);
  }
}

function rejectPendingRequests(error) {
  for (const { reject, timeoutId } of pendingRequests.values()) {
    clearTimeout(timeoutId);
    reject(error);
  }
  pendingRequests.clear();
}

function handleWorkerMessage(line) {
  let message;

  try {
    message = JSON.parse(line);
  } catch (error) {
    console.warn('Ignoring non-JSON worker output:', line);
    return;
  }

  if (message.type === 'ready') {
    workerReady = true;
    console.log('Detection worker ready');
    return;
  }

  if (message.type === 'error' && !message.id) {
    console.error('Detection worker startup error:', message.message);
    return;
  }

  if (message.type !== 'result' || !message.id) {
    return;
  }

  const pending = pendingRequests.get(message.id);
  if (!pending) {
    return;
  }

  clearTimeout(pending.timeoutId);
  pendingRequests.delete(message.id);

  if (message.success) {
    pending.resolve(message.payload);
  } else {
    pending.reject(new Error(message.error || 'Detection worker failed'));
  }
}

function startWorker() {
  if (workerStarting) {
    return workerStarting;
  }

  workerStarting = new Promise((resolve, reject) => {
    workerReady = false;
    const child = spawn(pythonExecutable, [pythonScript], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    workerProcess = child;

    const readyTimeoutId = setTimeout(() => {
      if (workerReady) {
        return;
      }

      reject(new Error(`Detection worker startup timeout after ${DETECTION_STARTUP_TIMEOUT_MS}ms`));
      child.kill();
    }, DETECTION_STARTUP_TIMEOUT_MS);

    const stdoutReader = readline.createInterface({ input: child.stdout });
    stdoutReader.on('line', (line) => {
      handleWorkerMessage(line);

      if (workerReady) {
        clearTimeout(readyTimeoutId);
        resolve();
      }
    });

    child.stderr.on('data', (data) => {
      console.error('Python stderr:', data.toString());
    });

    child.on('error', (error) => {
      clearTimeout(readyTimeoutId);
      workerProcess = null;
      workerReady = false;
      workerStarting = null;
      reject(new Error(`Failed to start Python process with "${pythonExecutable}": ${error.message}`));
      rejectPendingRequests(error);
    });

    child.on('close', (code, signal) => {
      clearTimeout(readyTimeoutId);
      workerProcess = null;
      workerReady = false;
      workerStarting = null;

      const reason = `Detection worker exited with code ${code}${signal ? `, signal ${signal}` : ''}`;
      console.error(reason);
      rejectPendingRequests(new Error(reason));
    });
  });

  return workerStarting;
}

async function ensureWorkerReady() {
  if (workerProcess && workerReady) {
    return;
  }

  await startWorker();
}

function runPythonDetection(imagePath, confidence = CONFIDENCE_THRESHOLD) {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureWorkerReady();
    } catch (error) {
      reject(error);
      return;
    }

    const requestId = `req_${Date.now()}_${requestCounter++}`;
    const timeoutId = setTimeout(() => {
      pendingRequests.delete(requestId);
      reject(new Error(`Python detection process timeout after ${DETECTION_TIMEOUT_MS}ms`));
    }, DETECTION_TIMEOUT_MS);

    pendingRequests.set(requestId, { resolve, reject, timeoutId });

    const payload = JSON.stringify({
      id: requestId,
      image_path: imagePath,
      confidence
    });

    workerProcess.stdin.write(`${payload}\n`, (error) => {
      if (!error) {
        return;
      }

      clearTimeout(timeoutId);
      pendingRequests.delete(requestId);
      reject(new Error(`Failed to send job to detection worker: ${error.message}`));
    });
  });
}

exports.detectObjects = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Please upload an image file with field name "image"'
      });
    }

    const imagePath = req.file.path;
    console.log(`Processing image: ${imagePath}`);

    const detectionResult = await runPythonDetection(imagePath, CONFIDENCE_THRESHOLD);
    cleanupTempFile(imagePath);

    if (detectionResult.success) {
      return res.status(200).json(detectionResult);
    }

    return res.status(400).json(detectionResult);
  } catch (error) {
    console.error('Detection error:', error);
    if (req.file) {
      cleanupTempFile(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: 'Error during object detection',
      error: error.message
    });
  }
};

exports.detectHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Object Detection',
    model: 'YOLOv8',
    confidence_threshold: CONFIDENCE_THRESHOLD,
    detection_timeout_ms: DETECTION_TIMEOUT_MS,
    detection_startup_timeout_ms: DETECTION_STARTUP_TIMEOUT_MS,
    worker_starting: Boolean(workerStarting) && !workerReady,
    worker_ready: workerReady
  });
};
