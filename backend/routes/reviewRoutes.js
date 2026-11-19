import express from 'express';
import { body } from 'express-validator';
import { addReview, getRestaurantReviews } from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

router.get('/restaurant/:restaurantId', getRestaurantReviews);

router.post(
    '/',
    authenticate,
    authorize('customer'),
    [
        body('orderId').notEmpty().withMessage('orderId is required'),
        body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    ],
    validateRequest,
    addReview
);

export default router;
