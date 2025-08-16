const express = require('express');
const router = express.Router();
const controller = require('../controllers/podcastController');
const upload = require('../config/multerConfig');

// GET Routes
router.get('/stats', controller.getPodcastStats);
router.get('/count', controller.getCount);
router.get('/', controller.getPodcasts);
router.get('/:id', controller.getPodcastById);
// router.get('/:id/stream', controller.getVideoStream);

// POST Route - Create new podcast with file upload
router.post('/new', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'audioFile', maxCount: 1 }
]), controller.createPodcast);

// PUT Route - Update podcast (optional file upload)
router.put('/:id', controller.updatePodcast);

// DELETE Route
router.delete('/:id', controller.deletePodcast);

// PUT Route - Update podcast image
router.put('/:id/image', upload.single('thumbnail'), controller.updateImage);



module.exports = router;