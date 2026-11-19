import asyncHandler from '../utils/asyncHandler.js';
import Restaurant from '../models/Restaurant.js';

export const createRestaurant = asyncHandler(async (req, res) => {
    const { name, description, cuisine, address, image } = req.body;

    const restaurant = await Restaurant.create({
        owner: req.user._id,
        name,
        description,
        cuisine,
        address,
        image,
    });

    res.status(201).json({ success: true, data: restaurant });
});

export const getRestaurants = asyncHandler(async (req, res) => {
    const { keyword, cuisine, page = 1, limit = 10 } = req.query;

    const filter = { isActive: true };
    if (keyword) filter.$text = { $search: keyword };
    if (cuisine) filter.cuisine = cuisine;

    const skip = (Number(page) - 1) * Number(limit);

    const [restaurants, total] = await Promise.all([
        Restaurant.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
        Restaurant.countDocuments(filter),
    ]);

    res.json({
        success: true,
        data: restaurants,
        pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
});

export const getRestaurantById = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
        res.status(404);
        throw new Error('Restaurant not found');
    }
    res.json({ success: true, data: restaurant });
});

export const updateRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
        res.status(404);
        throw new Error('Restaurant not found');
    }

    if (req.user.role !== 'admin' && restaurant.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this restaurant');
    }

    Object.assign(restaurant, req.body);
    const updated = await restaurant.save();

    res.json({ success: true, data: updated });
});

export const deleteRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
        res.status(404);
        throw new Error('Restaurant not found');
    }

    if (req.user.role !== 'admin' && restaurant.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this restaurant');
    }

    await restaurant.deleteOne();
    res.json({ success: true, message: 'Restaurant removed' });
});

export const getMyRestaurants = asyncHandler(async (req, res) => {
    const restaurants = await Restaurant.find({ owner: req.user._id });
    res.json({ success: true, data: restaurants });
});
