const express = require('express');
const router = express.Router();
const usageController = require('../controllers/usageController');
const {authenticate}= require('../middlewares/auth');

router.get('/:account_id', authenticate, usageController.getUserMetrics);
router.post('/:account_id/activity', authenticate, usageController.recordActivity);
router.post('/:account_id/time', authenticate, usageController.updateTimeSpent);

module.exports = router;