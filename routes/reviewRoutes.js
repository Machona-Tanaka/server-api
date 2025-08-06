const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const {authenticate}= require('../middlewares/auth');

router.get('/product/:product_id', reviewController.getProductReviews);
router.post('/', authenticate, reviewController.createReview);
router.put('/:id', authenticate, reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;