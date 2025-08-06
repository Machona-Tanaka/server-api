// const express = require('express');
// const router = express.Router();
// const podcastController = require('../controllers/podcastController');

// // Get all podcasts
// router.get('/', podcastController.getAllPodcasts);

// // Get podcast by search
// router.get('/search', podcastController.getPodcastsBySearch);

// // Get podcast by ID
// router.get('/:id', podcastController.getPodcastById);

// // Create podcast
// router.post('/', podcastController.createPodcast);

// // Update podcast
// router.put('/:id', podcastController.updatePodcast);

// // Delete podcast
// router.delete('/:id', podcastController.deletePodcast);

// // Get podcast categories
// router.get('/categories', podcastController.getPodcastCategories);

// // Increment podcast views and toggle featured status
// router.post('/:id/view', podcastController.incrementViews);

// // Toggle featured status for a podcast
// router.post('/:id/toggle-featured', podcastController.toggleFeatured);

// module.exports = router;



const express = require('express');
const router = express.Router();
const controller = require('../controllers/podcastController');

// GET /api/podcasts
router.get('/', controller.getPodcasts);

// GET /api/podcasts/stats
router.get('/stats', controller.getPodcastStats);

// DELETE /api/podcasts/:id
router.delete('/:id', controller.deletePodcast);

// PATCH /api/podcasts/:id
router.patch('/:id', controller.updatePodcast);

// GET /api/podcasts/:id/stream
router.get('/:id/stream', controller.getVideoStream);

module.exports = router;