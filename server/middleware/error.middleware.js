const errorMiddleware = (err, req, res, next) => {
    console.error("API Error:", err.message);

    if (res.headersSent) {
        return next(err);
    }

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
};

export default errorMiddleware;
