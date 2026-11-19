import asyncHandler from '../utils/asyncHandler.js';
import MenuItem from '../models/MenuItem.js';
import Restaurant from '../models/Restaurant.js';

const ensureOwnsRestaurant = async (restaurantId, user) => {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        const err = new Error('Restaurant not found');
        err.statusCode = 404;
        throw err;
    }
    if (user.role !== 'admin' && restaurant.owner.toString() !== user._id.toString()) {
        const err = new Error('Not authorized to manage this restaurant\'s menu');
        err.statusCode = 403;
        throw err;
    }
    return restaurant;
};

export const addMenuItem = asyncHandler(async (req, res) => {
    const { restaurantId, name, description, price, category, image } = req.body;

    const restaurant = await ensureOwnsRestaurant(restaurantId, req.user).catch((err) => {
        res.status(err.statusCode || 500);
        throw err;
    });

    const menuItem = await MenuItem.create({
        restaurant: restaurant._id,
        name,
        description,
        price,
        category,
        image,
    });

    res.status(201).json({ success: true, data: menuItem });
});

export const getMenuItems = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const { keyword, category, page = 1, limit = 10 } = req.query;

    const filter = { restaurant: restaurantId, isAvailable: true };
    if (keyword) filter.$text = { $search: keyword };
    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
        MenuItem.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
        MenuItem.countDocuments(filter),
    ]);

    res.json({
        success: true,
        data: items,
        pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
});

export const updateMenuItem = asyncHandler(async (req, res) => {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
        res.status(404);
        throw new Error('Menu item not found');
    }

    await ensureOwnsRestaurant(menuItem.restaurant, req.user).catch((err) => {
        res.status(err.statusCode || 500);
        throw err;
    });

    Object.assign(menuItem, req.body);
    const updated = await menuItem.save();

    res.json({ success: true, data: updated });
});

export const deleteMenuItem = asyncHandler(async (req, res) => {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
        res.status(404);
        throw new Error('Menu item not found');
    }

    await ensureOwnsRestaurant(menuItem.restaurant, req.user).catch((err) => {
        res.status(err.statusCode || 500);
        throw err;
    });

    await menuItem.deleteOne();
    res.json({ success: true, message: 'Menu item removed' });
});
