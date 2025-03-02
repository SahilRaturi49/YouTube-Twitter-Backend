import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        console.log('Authorization Header:', req.header("Authorization"));
        console.log('Token from Cookies:', req.cookies?.accessToken);

        // Extract token from Authorization header only (if not using cookies)
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request: No token provided");
        }

        // Verify the token with the secret key
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!decodedToken) {
            throw new ApiError(401, "Unauthorized request: Token verification failed");
        }

        // Find user associated with the token
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Unauthorized request: User not found for this token");
        }

        // Attach the user to the request object for subsequent use
        req.user = user;

        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        console.error("Error during JWT verification:", error.message);
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
