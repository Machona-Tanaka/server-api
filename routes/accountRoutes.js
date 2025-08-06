const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { authenticate, authorize } = require('../middlewares/auth');
const { route } = require('./podcastRoutes');

// Public routes
router.post('/register', accountController.register);
router.post('/login', accountController.login);
router.post('/change/password',authenticate, authorize(['admin', 'user']), accountController.changePassword);
router.put('/admin/udate/:userId', accountController.adminUpdateAccount);
router.post('/admin/user/', authenticate, authorize('admin'), accountController.adminRegister);
router.delete('/admin/users/:id', authenticate, authorize('admin'), accountController.deleteUser);


// User Routes
router.get('/all', accountController.getAllUsers);
router.get('/count', accountController.countUsers);


// Protected routes
router.get('/:id', accountController.getAccount);
router.put('/:id', accountController.updateAccount);

module.exports = router;