export const routeNotFound = (req, res, next) => {
    res.status(404);
    next(new Error(`Route not found: ${req.originalUrl}`));
};

export const handleError = (err, req, res, next) => {
    const hasStatusCode = res.statusCode && res.statusCode !== 200;
    let statusCode = hasStatusCode ? res.statusCode : 500;
    let message = err.message;

    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'Resource not found';
    }

    if (err.code === 11000) {
        statusCode = 400;
        message = `Duplicate value for field: ${Object.keys(err.keyValue).join(', ')}`;
    }

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map((val) => val.message).join(', ');
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
};
