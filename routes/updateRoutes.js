const express = require('express');
const router = express.Router();
const updateController = require('../controllers/updateController');

router.get('/', updateController.getAllUpdates);
router.get('/:id', updateController.getUpdateById);
router.post('/', updateController.createUpdate);
router.put('/:id', updateController.updateUpdate);
router.delete('/:id', updateController.deleteUpdate);

module.exports = router;