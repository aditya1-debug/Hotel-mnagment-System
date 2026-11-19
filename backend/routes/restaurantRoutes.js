import express from 'express';
import { body } from 'express-validator';
import {
    createRestaurant,
    getRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
    getMyRestaurants,
} from '../controllers/restaurantController.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

router.get('/', getRestaurants);
router.get('/mine', authenticate, authorize('owner', 'admin'), getMyRestaurants);
router.get('/:id', getRestaurantById);

router.post(
    '/',
    authenticate,
    authorize('owner', 'admin'),
    [
        body('name').trim().notEmpty().withMessage('Restaurant name is required'),
        body('address').trim().notEmpty().withMessage('Address is required'),
    ],
    validateRequest,
    createRestaurant
);

router.put('/:id', authenticate, authorize('owner', 'admin'), updateRestaurant);
router.delete('/:id', authenticate, authorize('owner', 'admin'), deleteRestaurant);

export default router;
