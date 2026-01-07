// middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
    console.error("❌ Error Caught:", err.stack);

    // If the error has a specific status code (like 400), use it.
    // Otherwise, default to 500 (Server Error).
    const statusCode = err.statusCode || 500;
    
    res.status(statusCode).json({
        error: "Something went wrong",
        details: err.message // We show the message so we can debug easily
    });
};

module.exports = errorHandler;