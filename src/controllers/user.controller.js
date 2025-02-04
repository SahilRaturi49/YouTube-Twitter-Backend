import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

/*
ApiError: This is a custom class to handle errors in a structured way.
asyncHandler: A utility to wrap asynchronous functions to automatically catch errors and pass them to the error-handling middleware.
User: This imports the user model, which is used to interact with the MongoDB database's user collection.
uploadOnCloudinary: A utility function that uploads files to Cloudinary (a cloud storage service).
ApiResponse: A class for formatting successful API responses.
jwt: JSON Web Token library used for creating and verifying tokens.
mongoose: The Mongoose library for interacting with MongoDB.
*/


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}
/**
 generateAccessAndRefereshTokens: A helper function that generates two types of tokens for user authentication—an access token (short-lived) and a refresh token (long-lived).
userId is the identifier of the user for whom the tokens will be generated.
user.generateAccessToken(): This generates the access token using the method defined in the User model.
user.generateRefreshToken(): This generates the refresh token, which will be used for re-authentication when the access token expires.
user.refreshToken = refreshToken: It assigns the generated refresh token to the user document to store in the database.
await user.save(): Saves the updated user document to the database without validating it to save time.
return { accessToken, refreshToken }: Returns both the access and refresh tokens.
If anything goes wrong, it throws a 500 error with a custom message.
 */

const registerUser = asyncHandler(async(req, res) => {
    // get user details from fronted
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload the to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return response


    // user details are collected by using request
    const {fullName, email, username, password} = req.body
    // console.log("email: ", email);

    if(
        [fullName, email, username, password].some( (field) => 
            field?.trim() ==="")
    ){
        throw new ApiError(400, "All fields are required")
    }

   const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exist")
    }

    // console.log(req.files); 
    

    const avatarLocalPath = req.files?.avatar[0]?.path;
    
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }
    

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})
/**
 * registerUser: A function to handle user registration.
It extracts user details (fullName, email, username, password) from the req.body.
Then it validates if any of the fields are empty and throws an error if any are missing.
User.findOne checks if a user with the same username or email already exists. If yes, it throws a 409 conflict error.
For file uploads (avatar and cover image), it checks if the files are provided and uploads them to Cloudinary using uploadOnCloudinary().
After ensuring that the avatar is uploaded, it proceeds to create the user in the database and returns the user data without sensitive fields like password and refreshToken.
If successful, it returns a 201 status code and the user's information in the response body.
 */


const loginUser = asyncHandler(async(req,res) =>{

    // req body --> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookie


    //user details are collected using req body
    const {email, username, password} = req.body
    console.log(email);
    

    // we check whether the user is providing username an email
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
    // }

    if(!username || !email){
        if(!username && !email){
            throw new ApiError(400, "username or email is required")
        }
    }

    const user = await User.findOne({
         $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)


    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // sending cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshtoken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
               user: loggedInUser, accessToken, refreshToken  
            },
            "User Logged in successfully"
        )
    )



})
/**
 * loginUser: A function to handle user login.
It validates that either email or username is provided.
It looks for the user in the database by matching the email or username.
If the user is found, it verifies the password using user.isPasswordCorrect(password).
Then it generates the access and refresh tokens using generateAccessAndRefereshTokens().
res.cookie: The tokens are set as cookies in the response with security options (httpOnly, secure).
If successful, it sends the logged-in user's details along with a success message.
 */

// to logout a user we will clear the cookies and 
// we have to reset refresh token
// Logout user and clear cookies
const logoutUser = asyncHandler(async (req, res) => {
    // Update the user's document by removing the refresh token
    // This ensures that the user’s refresh token is unset in the database when they log out
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 } // This operation removes the refreshToken from the user's document
        },
        { new: true }
    );

    // Define options for cookie configuration
    const options = {
        httpOnly: true, // The cookie will only be accessible by the server and not by JavaScript
        secure: true    // The cookie will only be sent over secure (HTTPS) connections
    };

    // Clear the cookies for both access token and refresh token
    // The .clearCookie method removes the specified cookie from the client's browser
    return res
        .status(200) // Send back an HTTP response with status code 200 (OK)
        .clearCookie("accessToken", options)  // Clear the accessToken cookie
        .clearCookie("refreshToken", options) // Clear the refreshToken cookie
        .json(new ApiResponse(200, {}, "User logged out")); // Send a success message in JSON format
});

// Refresh the access token using the refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
    // Extract the refresh token from cookies or request body
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    // If no refresh token is provided, return an error response
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request"); // No refresh token present
    }

    try {
        // Verify the refresh token using the JWT secret key
        // The jwt.verify function checks if the token is valid
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET // Secret key to decode the token
        );

        // Find the user based on the decoded token's user ID
        const user = await User.findById(decodedToken?._id);

        // If the user is not found, return an error
        if (!user) {
            throw new ApiError(401, "Invalid refresh token"); // Invalid token, user not found
        }

        // Check if the refresh token stored in the database matches the one sent in the request
        // This ensures that the refresh token is still valid
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used"); // The token does not match
        }

        // Options for setting cookies securely
        const options = {
            httpOnly: true, // The cookie is accessible only by the server, not by JavaScript
            secure: true    // The cookie is only sent over secure HTTPS connections
        };

        // Generate new access and refresh tokens for the user
        // This function creates fresh tokens using the user's ID
        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id);

        // Send a successful response with the new tokens set in cookies
        return res
            .status(200) // Success response status
            .cookie("accessToken", accessToken, options) // Set the new accessToken cookie
            .cookie("refreshToken", newRefreshToken, options) // Set the new refreshToken cookie
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed")); // Return the new tokens in the response body
    } catch (error) {
        // If any error occurs during the verification process, return an error message
        throw new ApiError(401, error?.message || "Invalid refresh token"); // Invalid or expired token
    }
});

// Change the current user's password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    // Find the user by ID to verify their password
    const user = await User.findById(req.user?._id);

    // Verify if the old password matches the stored password
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword); // This method compares the stored password with the old one provided

    // If the old password is incorrect, return an error response
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid password"); // Incorrect password provided
    }

    // Set the user's password to the new password provided
    user.password = newPassword; 

    // Save the updated user data, but bypass any validation for password (as we already ensured the password is correct)
    await user.save({ validateBeforeSave: false });

    // Return a success message with status 200 (OK)
    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Get the current user's data
const getCurrentUser = asyncHandler(async (req, res) => {
    // Return the current logged-in user's data from the request
    // req.user holds the information of the authenticated user
    return res
        .status(200) // Send a successful response status code
        .json(new ApiResponse(200, req.user, "Current user fetched successfully")); // Return the current user data
});

// Update account details like full name and email
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    // Validate that both fullName and email are provided
    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required"); // If any field is missing, return an error
    }

    // Update the user's document with the new full name and email
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { fullName, email } // Update the fullName and email fields in the database
        },
        { new: true } // Ensure that the updated document is returned
    ).select("-password"); // Exclude the password field from the response for security reasons

    // Return a success message with the updated user data
    return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"));
});

// Update user's avatar image
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    // If no avatar file is provided, throw an error
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing"); // Missing avatar file
    }

    // Upload the avatar image to a cloud storage service (e.g., Cloudinary)
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    // If the avatar upload fails, throw an error
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    // Update the user's avatar URL in the database
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { avatar: avatar.url } // Set the URL of the uploaded avatar in the user document
        },
        { new: true } // Ensure the updated user document is returned
    ).select("-password"); // Exclude the password from the response

    // Return a success message with the updated user data
    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
});

// Update user's cover image
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    // If no cover image file is provided, throw an error
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing"); // Missing cover image file
    }

    // Upload the cover image to a cloud storage service
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // If the cover image upload fails, throw an error
    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading cover image");
    }

    // Update the user's cover image URL in the database
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { coverImage: coverImage.url } // Set the URL of the uploaded cover image in the user document
        },
        { new: true } // Ensure the updated user document is returned
    ).select("-password"); // Exclude the password from the response

    // Return a success message with the updated user data
    return res.status(200).json(new ApiResponse(200, user, "Cover image updated successfully"));
});

// Get user channel profile (including subscribers count, subscriptions, etc.)
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    // If no username is provided in the request, throw an error
    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing");
    }

    // Perform an aggregation query to gather the channel's profile details
    const channel = await User.aggregate([
        {
            $match: { username: username?.toLowerCase() } // Match user by lowercase username
        },
        {
            $lookup: {
                from: "subscriptions", // Join with the subscriptions collection
                localField: "_id", // Use user ID to match the channel
                foreignField: "channel", // Match with the channel field in the subscriptions collection
                as: "subscribers" // Output the list of subscribers for the channel
            }
        },
        {
            $lookup: {
                from: "subscriptions", // Join with subscriptions collection again to get subscriptions of the user
                localField: "_id", // Use user ID
                foreignField: "subscriber", // Match with the subscriber field in subscriptions
                as: "subscribedTo" // Output the list of subscriptions for the user
            }
        },
        {
            $addFields: {
                subscribersCount: { $size: "$subscribers" }, // Count the number of subscribers
                channelSubscribedTo: { $size: "$subscribedTo" }, // Count the number of subscriptions
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] }, // Check if the current user is in the subscriber list
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1, // Include full name in the result
                username: 1, // Include username in the result
                subscribersCount: 1, // Include subscribers count
                channelSubscribedTo: 1, // Include the count of subscriptions
                isSubscribed: 1, // Include whether the user is subscribed to the channel
                avatar: 1, // Include the user's avatar
                coverImage: 1, // Include the user's cover image
                email: 1 // Include the email of the user
            }
        }
    ]);

    // If no channel is found with the provided username, throw an error
    if (!channel?.length) {
        throw new ApiError(404, "Channel doesn't exist");
    }

    // Return the channel data with status 200 (OK)
    return res.status(200).json(new ApiResponse(200, channel[0], "User channel fetched successfully"));
});

// Get the user's watch history (including video details)
const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(req.user._id) } // Match user by their ObjectId
        },
        {
            $lookup: {
                from: "videos", // Join with the videos collection to get watch history details
                localField: "watchHistory", // Use the watchHistory field to match video IDs
                foreignField: "_id", // Match with the _id of videos
                as: "watchHistory", // Store the matching videos in the watchHistory field
                pipeline: [
                    {
                        $lookup: {
                            from: "users", // Join with the users collection to get video owner details
                            localField: "owner", // Use the owner field in the video document
                            foreignField: "_id", // Match with the user _id
                            as: "owner", // Store owner details
                            pipeline: [
                                {
                                    $project: { fullName: 1, username: 1, avatar: 1 } // Only include full name, username, and avatar of the owner
                                }
                            ]
                        }
                    },
                    {
                        $addFields: { owner: { $first: "$owner" } } // Extract the first (and only) owner document from the array
                    },
                    {
                        $project: { "owner.password": 0 } // Exclude the owner's password field from the result
                    }
                ]
            }
        }
    ]);

    // If no user is found, throw an error
    if (!user?.length) {
        throw new ApiError(404, "User not found");
    }

    // Return the user's watch history with status 200 (OK)
    return res.status(200).json(new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully"));
});




export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
} 