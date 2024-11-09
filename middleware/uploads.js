// middleware/uploads.js
const multer = require("multer");

// Storage configuration for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/practice/"); // Define where the file should be stored
  },
  filename: (req, file, cb) => {
    const extension = file.mimetype === "audio/mpeg" || file.mimetype === "audio/mp3" ? "mp3" : "wav";
    const filename = file.originalname.split(".")[0] + Date.now() + "." + extension;
    cb(null, filename); // Pass the filename to the callback
  },
});

// File type validation for audio files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["audio/mpeg", "audio/wav", "audio/mp3"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Invalid file type. Only MP3, WAV, and MPEG files are allowed!"), false); // Reject the file
  }
};

// Multer setup with storage and validation
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Set file size limit (10 MB in this case)
});

module.exports = upload;
