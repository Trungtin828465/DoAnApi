const express = require("express");
const multer = require("multer");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

router.post(
  "/stt",
  upload.single("audio"),
  sttController.speechToText
);

module.exports = router;