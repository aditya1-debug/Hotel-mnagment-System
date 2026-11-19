import express from 'express';
import { body } from 'express-validator';
import {
    placeOrder,
    getMyOrders,
    getOrderById,
    getRestaurantOrders,
    updateOrderStatus,
    getAssignedOrders,
    updateDeliveryStatus,
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

router.post(
    '/',
    authenticate,
    authorize('customer'),
    [
        body('restaurantId').notEmpty().withMessage('restaurantId is required'),
        body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
        body('deliveryAddress').trim().notEmpty().withMessage('Delivery address is required'),
    ],
    validateRequest,
    placeOrder
);
router.get('/mine', authenticate, authorize('customer'), getMyOrders);

router.get('/assigned', authenticate, authorize('delivery'), getAssignedOrders);
router.patch('/:id/delivery-status', authenticate, authorize('delivery'), updateDeliveryStatus);

router.get('/restaurant/:restaurantId', authenticate, authorize('owner', 'admin'), getRestaurantOrders);
router.patch('/:id/status', authenticate, authorize('owner', 'admin'), updateOrderStatus);

router.get('/:id', authenticate, getOrderById);

export default router;
