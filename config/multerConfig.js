const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure storage for podcast files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/podcasts/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
    req.body.image = `uploads/podcasts/` + uniqueSuffix + path.extname(file.originalname);
  }
});

// Allow both audio and image files
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('audio/') || 
    file.mimetype.startsWith('image/')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only audio and image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB for audio files
    files: 1
  },
  fileFilter: fileFilter
});

module.exports = upload;