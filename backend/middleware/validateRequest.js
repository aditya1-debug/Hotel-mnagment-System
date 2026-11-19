import { validationResult } from 'express-validator';

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400);
        return res.json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
        });
    }
    next();
};

export default validateRequest;
