import asyncHandler from '../utils/asyncHandler.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';

const recalculateRestaurantRating = async (restaurantId) => {
    const stats = await Review.aggregate([
        { $match: { restaurant: restaurantId } },
        { $group: { _id: '$restaurant', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } },
    ]);

    await Restaurant.findByIdAndUpdate(restaurantId, {
        avgRating: stats[0]?.avgRating || 0,
        numReviews: stats[0]?.numReviews || 0,
    });
};

export const addReview = asyncHandler(async (req, res) => {
    const { orderId, rating, comment } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.customer.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('You can only review your own orders');
    }

    if (order.status !== 'delivered') {
        res.status(400);
        throw new Error('You can only review orders that have been delivered');
    }

    const review = await Review.create({
        customer: req.user._id,
        restaurant: order.restaurant,
        order: order._id,
        rating,
        comment,
    });

    await recalculateRestaurantRating(order.restaurant);

    res.status(201).json({ success: true, data: review });
});

export const getRestaurantReviews = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
        Review.find({ restaurant: restaurantId })
            .populate('customer', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Review.countDocuments({ restaurant: restaurantId }),
    ]);

    res.json({
        success: true,
        data: reviews,
        pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
});
