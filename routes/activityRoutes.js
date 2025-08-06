const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const {authenticate}= require('../middlewares/auth');

router.get('/:account_id', authenticate, activityController.getPreferences);
router.put('/:account_id', authenticate, activityController.updatePreferences);

module.exports = router;