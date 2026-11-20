import express from 'express';
import { body } from 'express-validator';
import {
    getPlatformStats,
    listUsers,
    setUserActive,
    setUserRole,
    listAllRestaurants,
    setRestaurantActive,
    listAllOrders,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/stats', getPlatformStats);

router.get('/users', listUsers);
router.patch(
    '/users/:id/active',
    [body('isActive').isBoolean().withMessage('isActive must be true or false')],
    validateRequest,
    setUserActive
);
router.patch(
    '/users/:id/role',
    [body('role').notEmpty().withMessage('role is required')],
    validateRequest,
    setUserRole
);

router.get('/restaurants', listAllRestaurants);
router.patch(
    '/restaurants/:id/active',
    [body('isActive').isBoolean().withMessage('isActive must be true or false')],
    validateRequest,
    setRestaurantActive
);

router.get('/orders', listAllOrders);

export default router;
