// Import the ApiError utility to handle custom error responses.
import { ApiError } from "../utils/ApiError.js";

// Import the asyncHandler utility to wrap asynchronous code for handling errors.
import { asyncHandler } from "../utils/asyncHandler.js";

// Import the 'jsonwebtoken' package to verify JWT tokens.
import jwt from "jsonwebtoken";

// Import the User model to interact with the users' data in the database.
import { User } from "../models/user.model.js";

// Define a middleware function 'verifyJWT' that will be used to protect routes requiring authentication.
export const verifyJWT = asyncHandler(async(req, _, next) => {
    // The function 'verifyJWT' verifies the JWT token provided in the request.
    
    try {
        // Access the JWT token from the cookies or headers.
        // First, it checks if the token is present in the cookies, if not, checks the Authorization header.
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // If no token is found, an error is thrown with a 401 status (Unauthorized).
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        // If a token is found, it is verified using the 'jwt.verify()' method with the secret key from environment variables.
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // 'decodedToken' contains the decoded data from the JWT, including user information.
        // Here, the user is found by their ID, which was stored in the token, excluding the password and refresh token fields.
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        
        // If no user is found with the decoded token's ID, throw an error indicating that the access token is invalid.
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // If the user is found, it is attached to the request object as 'req.user'.
        // This makes the user object available in subsequent middleware or route handlers.
        req.user = user;
        
        // Call 'next()' to pass control to the next middleware function or route handler.
        next();
    } catch (error) {
        // If any error occurs during token verification, an error is thrown.
        // The error message is either the one from the caught error or a default message.
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
