const express = require('express');
const ttsController = require('../controllers/ttsController');

const router = express.Router();

// GET /api/tts?text=...&lang=vi -> audio, GET /api/tts -> health JSON
router.get('/', ttsController.textToSpeech);

// Health check TTS
router.get('/health', ttsController.ttsHealth);

// Text to Speech endpoint
router.post('/', ttsController.textToSpeech);

module.exports = router;
