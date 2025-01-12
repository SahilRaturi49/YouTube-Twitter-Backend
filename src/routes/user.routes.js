// Import the Router class from Express to create modular, mountable route handlers.
import { Router } from "express";

// Import controller functions that contain the logic for handling requests to various routes.
import { 
    loginUser,           // Handles user login logic.
    logoutUser,          // Handles user logout logic.
    registerUser,        // Handles new user registration logic.
    refreshAccessToken,  // Provides a new access token when the old one expires.
    changeCurrentPassword, // Allows users to change their current password.
    getCurrentUser,      // Fetches details of the currently authenticated user.
    updateAccountDetails, // Updates user profile information.
    updateUserAvatar,    // Handles updating the user's avatar.
    updateUserCoverImage, // Handles updating the user's cover image.
    getUserChannelProfile, // Retrieves the public profile of a user's channel.
    getWatchHistory      // Fetches the user's watch history.
} from "../controllers/user.controller.js";

// Import middleware functions for processing file uploads and securing routes.
import { upload } from "../middlewares/multer.middleware.js"; // Middleware for handling file uploads using Multer.
import { verifyJWT } from "../middlewares/auth.middleware.js"; // Middleware for verifying JSON Web Tokens (JWT) for secured routes.

// Create a new Router instance to handle user-related routes.
const router = Router();

// Route for user registration.
// HTTP Method: POST
// URL: /api/v1/users/register
router.route("/register").post(
    upload.fields([ // Middleware to handle file uploads for two specific fields: avatar and coverImage.
        {
            name: "avatar", // Field name in the form for the user's avatar image.
            maxCount: 1     // Limit to only one file upload for the avatar.
        },
        {
            name: "coverImage", // Field name in the form for the user's cover image.
            maxCount: 1         // Limit to only one file upload for the cover image.
        }
    ]),
    registerUser // Controller function that handles the logic for registering a new user.
);

// Route for user login.
// HTTP Method: POST
// URL: /api/v1/users/login
router.route("/login").post(
    loginUser // Controller function that authenticates a user and issues a token.
);

// Secured route for logging out a user.
// HTTP Method: POST
// URL: /api/v1/users/logout
router.route("/logout").post(
    verifyJWT, // Middleware to ensure the user is authenticated via JWT.
    logoutUser // Controller function that handles the logout logic.
);

// Route to refresh an access token when it has expired.
// HTTP Method: POST
// URL: /api/v1/users/refresh-token
router.route("/refresh-token").post(
    refreshAccessToken // Controller function to generate and return a new access token.
);

// Secured route for changing the user's current password.
// HTTP Method: POST
// URL: /api/v1/users/change-password
router.route("/change-password").post(
    verifyJWT, // Middleware to ensure the user is authenticated via JWT.
    changeCurrentPassword // Controller function to handle password updates.
);

// Secured route to get the currently authenticated user's details.
// HTTP Method: GET
// URL: /api/v1/users/current-user
router.route("/current-user").get(
    verifyJWT, // Middleware to ensure the user is authenticated via JWT.
    getCurrentUser // Controller function to fetch and return user details.
);

// Secured route to update the user's account details.
// HTTP Method: PATCH
// URL: /api/v1/users/update-account
router.route("/update-account").patch(
    verifyJWT, // Middleware to ensure the user is authenticated via JWT.
    updateAccountDetails // Controller function to handle updates to user information.
);

// Secured route to update the user's avatar.
// HTTP Method: PATCH
// URL: /api/v1/users/avatar
router.route("/avatar").patch(
    verifyJWT, // Middleware to ensure the user is authenticated via JWT.
    upload.single("avatar"), // Middleware to handle single file upload for the avatar field.
    updateUserAvatar // Controller function to update the user's avatar image.
);

// Secured route to update the user's cover image.
// HTTP Method: PATCH
// URL: /api/v1/users/cover-image
router.route("/cover-image").patch(
    verifyJWT, // Middleware to ensure the user is authenticated via JWT.
    upload.single("coverImage"), // Middleware to handle single file upload for the coverImage field.
    updateUserCoverImage // Controller function to update the user's cover image.
);

// Secured route to get a user's channel profile by their username.
// HTTP Method: GET
// URL: /api/v1/users/c/:username
router.route("/c/:username").get(
    verifyJWT, // Middleware to ensure the user is authenticated via JWT.
    getUserChannelProfile // Controller function to fetch and return the user's channel profile.
);

// Secured route to fetch the user's watch history.
// HTTP Method: GET
// URL: /api/v1/users/history
router.route("/history").get(
    verifyJWT, // Middleware to ensure the user is authenticated via JWT.
    getWatchHistory // Controller function to retrieve and return the user's watch history.
);

// Export the router object so it can be used in the main app file.
export default router;
