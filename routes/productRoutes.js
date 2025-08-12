
const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');
const multer = require('multer');
const path = require('path');

// Configure storage
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir); // Save files to "uploads" folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|gif|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only images (jpeg, png, gif, webp) are allowed'));
  return message = 'Only images (jpeg, png, gif, webp) are allowed';
};

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// Routes
router.get('/', controller.getProducts);
router.get('/count', controller.countProducts);
router.get('/single/:id', controller.getProductById);
router.get('/stats', controller.getProductStats);
router.get('/frontend', controller.getProductsFrontEnd);


router.post('/new', upload.array('image_file', 10), controller.createProduct); // Moved upload middleware here
router.post('/:productId/images', upload.array('images', 10), controller.uploadImages);

router.delete('/:productId/images/:imageId', controller.deleteImage);
router.delete('/:id', controller.deleteProduct);


router.patch('/:id', controller.updateProduct);

module.exports = router;