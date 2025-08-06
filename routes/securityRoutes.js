const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');
const {authenticate}= require('../middlewares/auth');

router.get('/:account_id', authenticate, securityController.getSecuritySettings);
router.put('/:account_id', authenticate, securityController.updateSecuritySettings);
router.post('/:account_id/security-questions', authenticate, securityController.setSecurityQuestions);

module.exports = router;