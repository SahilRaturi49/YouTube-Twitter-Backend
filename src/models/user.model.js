import mongoose, { Schema } from "mongoose";
// Importing `mongoose` for MongoDB interaction, with `Schema` used to define the structure of documents.

import jwt from "jsonwebtoken";
// Importing `jsonwebtoken` to create and verify JSON Web Tokens for authentication.

import bcrypt from "bcrypt";
// Importing `bcrypt` to hash and compare passwords for security.

const userSchema = new Schema(
    {
        username: {
            type: String, // String field for the username.
            required: true, // Mandatory field.
            unique: true, // Ensures that usernames are unique across all users.
            lowercase: true, // Converts the value to lowercase before storing.
            trim: true, // Removes whitespace from the beginning and end.
            index: true // Adds an index for faster searches.
        },
        email: {
            type: String, // String field for the email.
            required: true, // Mandatory field.
            unique: true, // Ensures that emails are unique across all users.
            lowercase: true, // Converts the value to lowercase before storing.
            trim: true // Removes whitespace from the beginning and end.
        },
        fullName: {
            type: String, // Full name of the user.
            required: true, // Mandatory field.
            trim: true, // Removes whitespace from the beginning and end.
            index: true // Adds an index for faster searches.
        },
        avatar: {
            type: String, // Stores the URL of the user's profile picture (e.g., a Cloudinary link).
            required: true // Mandatory field.
        },
        coverImage: {
            public_id: String,
            url: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId, // Array of ObjectId references to the `Video` model.
                ref: "Video" // Establishes a relationship with the `Video` collection.
            }
        ],
        password: {
            type: String, // Password field.
            required: [true, "Password is required"] // Mandatory with a custom error message.
        },
        refreshToken: {
            type: String, // Stores the refresh token for the user.
        }
    },
    {
        timestamps: true // Automatically adds `createdAt` and `updatedAt` fields.
    }
);

// Middleware to hash the password before saving the user document.
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // If the password is not modified, skip hashing.
    this.password = await bcrypt.hash(this.password, 10); // Hash the password with a salt round of 10.
    next(); // Proceed to the next middleware or save operation.
});

// Method to compare the provided password with the stored hashed password.
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password); // Compares and returns true if they match.
};

// Method to generate an access token for the user.
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id, // Embeds the user's ID in the token payload.
            email: this.email, // Embeds the user's email in the token payload.
            username: this.username, // Embeds the username.
            fullname: this.fullname // Embeds the full name.
        },
        process.env.ACCESS_TOKEN_SECRET, // Uses the secret key for signing.
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY // Sets the token expiry time.
        }
    );
};

// Method to generate a refresh token for the user.
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id, // Embeds the user's ID in the token payload.
        },
        process.env.REFRESH_TOKEN_SECRET, // Uses the secret key for signing the refresh token.
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY // Sets the refresh token expiry time.
        }
    );
};

export const User = mongoose.model("User", userSchema);
// Creates and exports the `User` model, enabling interaction with the `users` collection in MongoDB.

/* 
Explanation:
1. **Purpose**:
   - The `userSchema` defines the structure for the `users` collection in MongoDB.
   - Includes fields for user details, authentication, and token management.

2. **Field Details**:
   - `username`: Stores a unique identifier for the user, standardized to lowercase.
   - `email`: Stores the user's unique email address.
   - `fullname`: Stores the full name of the user.
   - `avatar`: Holds a URL for the user's profile picture.
   - `coverImage`: Optionally stores a URL for a cover image.
   - `watchHistory`: Maintains an array of references to the `Video` collection.
   - `password`: Stores the user's hashed password.
   - `refreshToken`: Stores a token for session management.

3. **Features**:
   - **Password Hashing**: Ensures security by hashing passwords before storage.
   - **Password Validation**: Compares user-entered passwords with the stored hash.
   - **Token Generation**: Creates access and refresh tokens for secure authentication.
   - **Timestamps**: Automatically tracks when the user was created or updated.

4. **Why Use This**:
   - Provides a robust and secure schema for user authentication and profile management.
   - Supports token-based authentication for scalable, stateless applications.
   - Simplifies handling of related data like watch history and media uploads.
   - Enhances data integrity through field validation and middleware.
*/
 