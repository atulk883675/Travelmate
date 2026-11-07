import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // Step 1: Read JWT from the HTTP-only cookie
    const token = req.cookies?.travelmate_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please log in.",
      });
    }

    // Step 2: Verify JWT signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 3: Validate the token payload
    if (!decoded.id || !Number.isInteger(decoded.tokenVersion)) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    // Step 4: Find the user in MongoDB
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    // Step 5: Check whether the token has been invalidated
    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    // Step 6: Attach authenticated user to request
    req.user = user;

    // Step 7: Continue to the protected route
    next();

  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token.",
      });
    }

    next(error);
  }
};
