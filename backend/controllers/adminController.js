import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Order from '../models/Order.js';

export const getPlatformStats = asyncHandler(async (req, res) => {
    const [userCounts, restaurantCount, orderCount, revenueResult] = await Promise.all([
        User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
        Restaurant.countDocuments(),
        Order.countDocuments(),
        Order.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
    ]);

    const usersByRole = userCounts.reduce((acc, row) => {
        acc[row._id] = row.count;
        return acc;
    }, {});

    res.json({
        success: true,
        data: {
            usersByRole,
            totalRestaurants: restaurantCount,
            totalOrders: orderCount,
            deliveredRevenue: revenueResult[0]?.total || 0,
        },
    });
});

export const listUsers = asyncHandler(async (req, res) => {
    const { role, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (role) filter.role = role;

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
        User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        User.countDocuments(filter),
    ]);

    res.json({
        success: true,
        data: users,
        pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
});

export const setUserActive = asyncHandler(async (req, res) => {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('You cannot change your own account status');
    }

    user.isActive = isActive;
    const updated = await user.save();

    res.json({
        success: true,
        data: { _id: updated._id, name: updated.name, email: updated.email, role: updated.role, isActive: updated.isActive },
    });
});

export const setUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const validRoles = ['customer', 'owner', 'delivery', 'admin'];

    if (!validRoles.includes(role)) {
        res.status(400);
        throw new Error(`Role must be one of: ${validRoles.join(', ')}`);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('You cannot change your own role');
    }

    user.role = role;
    const updated = await user.save();

    res.json({
        success: true,
        data: { _id: updated._id, name: updated.name, email: updated.email, role: updated.role, isActive: updated.isActive },
    });
});

export const listAllRestaurants = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [restaurants, total] = await Promise.all([
        Restaurant.find()
            .populate('owner', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Restaurant.countDocuments(),
    ]);

    res.json({
        success: true,
        data: restaurants,
        pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
});

export const setRestaurantActive = asyncHandler(async (req, res) => {
    const { isActive } = req.body;

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
        res.status(404);
        throw new Error('Restaurant not found');
    }

    restaurant.isActive = isActive;
    const updated = await restaurant.save();

    res.json({ success: true, data: updated });
});

export const listAllOrders = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .populate('customer', 'name email')
            .populate('restaurant', 'name')
            .populate('deliveryPartner', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Order.countDocuments(filter),
    ]);

    res.json({
        success: true,
        data: orders,
        pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
});
