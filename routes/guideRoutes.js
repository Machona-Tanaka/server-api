const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guideController');

router.get('/', guideController.getAllGuides);
router.get('/:id', guideController.getGuideById);
router.post('/', guideController.createGuide);
router.put('/:id', guideController.updateGuide);
router.delete('/:id', guideController.deleteGuide);
router.get('/categories/all', guideController.getGuideCategories);
router.post('/:id/download', guideController.incrementDownloads);

module.exports = router;