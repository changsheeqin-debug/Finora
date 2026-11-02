const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    try {
        // 1. Get token from request headers
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access denied. No token provided."
            });
        }

        // 2. Extract token
        const token = authHeader.split(" ")[1];

        // 3. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Attach user information to request
        req.user = {
            userId: decoded.userId,
            email: decoded.email
        };

        // 5. Continue to the next middleware or route
        next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Session expired. Please log in again."
            });
        }

        return res.status(401).json({
            message: "Invalid authentication token."
        });
    }
};

module.exports = verifyToken;