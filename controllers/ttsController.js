const gTTS = require('gtts');

function streamSpeech(res, text, lang) {
  const speech = new gTTS(text, lang);

  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Content-Disposition', 'inline');

  speech
    .stream()
    .on('error', (streamError) => {
      console.error('TTS Stream Error:', streamError);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Lỗi stream text-to-speech',
          message: streamError.message,
        });
      } else {
        res.destroy(streamError);
      }
    })
    .pipe(res);
}

// Text to Speech - Chuyển đổi văn bản thành giọng nói
// Hỗ trợ GET /api/tts?text=...&lang=vi và POST /api/tts với JSON body
exports.textToSpeech = (req, res) => {
  try {
    const isGetRequest = req.method === 'GET';
    const source = isGetRequest ? req.query : req.body;
    const text = source?.text || '';
    const lang = source?.lang || 'vi';

    // Kiểm tra input
    if (!text || text.trim() === '') {
      if (isGetRequest) {
        return res.status(200).json({ status: 'ok' });
      }

      return res.status(400).json({ error: 'Text không được để trống' });
    }

    if (text.length > 500) {
      return res.status(400).json({
        error: 'Text không được vượt quá 500 ký tự',
      });
    }

    streamSpeech(res, text, lang);

  } catch (error) {
    console.error('TTS Error:', error);
    return res.status(500).json({
      error: 'Lỗi xử lý text-to-speech',
      message: error.message,
    });
  }
};

// Health check cho TTS service
exports.ttsHealth = (req, res) => {
  res.status(200).json({ status: 'ok' });
};
