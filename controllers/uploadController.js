// controllers/uploadController.js
const Media = require('../models/Media');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage with dynamic destinations
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const contentType = req.params.contentType; // product, podcast, or article
    const uploadDir = path.join(__dirname, `../uploads/${contentType}`);
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.contentType}-${uniqueSuffix}${ext}`);
  }
});

// Supported file types
const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|gif|webp|mp3|mp4|mpeg|pdf/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error(`Unsupported file type. Only ${filetypes} are allowed`));
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter
}).single('media');

exports.uploadMedia = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    try {
      const { contentType, contentId } = req.params;
      const isPrimary = req.body.isPrimary === 'true';
      const fileType = path.extname(req.file.originalname).substring(1); // "jpg", "mp3", etc
      
      const filePath = `/uploads/${contentType}/${req.file.filename}`;
      
      const mediaId = await Media.create({
        contentType,
        contentId,
        filePath,
        fileType,
        isPrimary
      });
      
      res.json({
        success: true,
        mediaId,
        filePath,
        fileType,
        isPrimary
      });
    } catch (error) {
      // Clean up uploaded file if error occurs
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
};

exports.setPrimaryMedia = async (req, res) => {
  try {
    const { contentType, contentId, mediaId } = req.params;
    await Media.setPrimary(contentType, contentId, mediaId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const filePath = await Media.delete(mediaId);
    
    if (!filePath) {
      return res.status(404).json({
        success: false,
        error: 'Media not found'
      });
    }
    
    // Delete the file
    const fullPath = path.join(__dirname, '../uploads', filePath.substring('/uploads/'.length));
    fs.unlink(fullPath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getContentMedia = async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    const media = await Media.findByContent(contentType, contentId);
    res.json({ success: true, media });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};