import express from 'express';
import { body } from 'express-validator';
import {
    addMenuItem,
    getMenuItems,
    updateMenuItem,
    deleteMenuItem,
} from '../controllers/menuController.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

router.get('/restaurant/:restaurantId', getMenuItems);

router.post(
    '/',
    authenticate,
    authorize('owner', 'admin'),
    [
        body('restaurantId').notEmpty().withMessage('restaurantId is required'),
        body('name').trim().notEmpty().withMessage('Item name is required'),
        body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    ],
    validateRequest,
    addMenuItem
);

router.put('/:id', authenticate, authorize('owner', 'admin'), updateMenuItem);
router.delete('/:id', authenticate, authorize('owner', 'admin'), deleteMenuItem);

export default router;
