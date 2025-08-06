const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const {authenticate}= require('../middlewares/auth');
router.get('/', commentController.getComments);
router.post('/', authenticate, commentController.createComment);
router.put('/:id', authenticate, commentController.updateComment);
router.delete('/:id', authenticate, commentController.deleteComment);
router.post('/:id/like', authenticate, commentController.likeComment);

module.exports = router;