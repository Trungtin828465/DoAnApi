const fs = require("fs");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.speechToText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Không tìm thấy file audio",
      });
    }

    const transcription =
      await client.audio.transcriptions.create({
        file: fs.createReadStream(req.file.path),
        model: "whisper-1",
        language: "vi",
      });

    fs.unlinkSync(req.file.path);

    return res.json({
      success: true,
      text: transcription.text,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
};