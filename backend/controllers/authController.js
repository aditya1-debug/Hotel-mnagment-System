import asyncHandler from '../utils/asyncHandler.js';
import createToken from '../utils/tokenUtils.js';
import User from '../models/User.js';

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phone, address, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists');
    }

    const allowedRoles = ['customer', 'owner', 'delivery'];
    const assignedRole = allowedRoles.includes(role) ? role : 'customer';

    const user = await User.create({ name, email, password, phone, address, role: assignedRole });

    res.status(201).json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: createToken(user._id, user.role),
        },
    });
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
        res.status(403);
        throw new Error('This account has been deactivated');
    }

    res.json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: createToken(user._id, user.role),
        },
    });
});

export const getMe = asyncHandler(async (req, res) => {
    res.json({ success: true, data: req.user });
});

export const getDeliveryPartners = asyncHandler(async (req, res) => {
    const partners = await User.find({ role: 'delivery', isActive: true }).select('name email phone');
    res.json({ success: true, data: partners });
});
