import asyncHandler from '../utils/asyncHandler.js';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';

export const placeOrder = asyncHandler(async (req, res) => {
    const { restaurantId, items, deliveryAddress, paymentMethod = 'cod' } = req.body;

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('Order must contain at least one item');
    }

    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

    if (menuItems.length !== items.length) {
        res.status(400);
        throw new Error('One or more menu items are invalid or unavailable');
    }

    const orderItems = items.map((cartItem) => {
        const menuItem = menuItems.find((m) => m._id.toString() === cartItem.menuItemId);
        return {
            menuItem: menuItem._id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: cartItem.quantity,
        };
    });

    const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const paymentStatus = paymentMethod === 'mock_online' ? 'paid' : 'pending';

    const order = await Order.create({
        customer: req.user._id,
        restaurant: restaurantId,
        items: orderItems,
        totalAmount,
        deliveryAddress,
        paymentMethod,
        paymentStatus,
    });

    res.status(201).json({ success: true, data: order });
});

export const getMyOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
        Order.find({ customer: req.user._id })
            .populate('restaurant', 'name address')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Order.countDocuments({ customer: req.user._id }),
    ]);

    res.json({
        success: true,
        data: orders,
        pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
});

export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('restaurant', 'name address')
        .populate('deliveryPartner', 'name phone');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    const isOwnerOfOrder = order.customer.toString() === req.user._id.toString();
    const isAssignedDelivery = order.deliveryPartner && order.deliveryPartner._id.toString() === req.user._id.toString();

    if (!isOwnerOfOrder && !isAssignedDelivery && req.user.role !== 'admin' && req.user.role !== 'owner') {
        res.status(403);
        throw new Error('Not authorized to view this order');
    }

    res.json({ success: true, data: order });
});

export const getRestaurantOrders = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { restaurant: restaurantId };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .populate('customer', 'name phone')
            .populate('deliveryPartner', 'name phone')
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

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, deliveryPartnerId } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (status) order.status = status;
    if (deliveryPartnerId) order.deliveryPartner = deliveryPartnerId;

    const updated = await order.save();
    res.json({ success: true, data: updated });
});

export const getAssignedOrders = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { deliveryPartner: req.user._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .populate('restaurant', 'name address')
            .populate('customer', 'name phone')
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

export const updateDeliveryStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const allowedTransitions = ['out_for_delivery', 'delivered'];

    if (!allowedTransitions.includes(status)) {
        res.status(400);
        throw new Error(`Delivery partners can only set status to: ${allowedTransitions.join(', ')}`);
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (!order.deliveryPartner || order.deliveryPartner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('This order is not assigned to you');
    }

    order.status = status;
    const updated = await order.save();

    res.json({ success: true, data: updated });
});
