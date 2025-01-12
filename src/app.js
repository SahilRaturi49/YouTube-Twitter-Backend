// Importing the 'express' module to create an Express application
// Express is a minimal and flexible Node.js framework for building web applications and APIs
import express from "express";

// Importing 'cookie-parser' middleware to parse cookies in incoming requests
// This allows server-side access to cookies sent by the client
import cookieParser from "cookie-parser";

// Importing 'cors' (Cross-Origin Resource Sharing) middleware to enable or restrict resource sharing between different origins
// This is crucial for allowing frontend and backend hosted on different domains or ports to communicate
import cors from "cors";

// Creating an instance of the Express application
const app = express();

// Configuring CORS middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN, // Allowing requests only from the domain specified in the CORS_ORIGIN environment variable
    credentials: true // Enabling sending of credentials (cookies, authorization headers) with cross-origin requests
}));

// Middleware to parse incoming JSON payloads
// The 'limit' option restricts the maximum size of the request body to 16KB for enhanced security and performance
app.use(express.json({ limit: "16kb" }));

// Middleware to parse URL-encoded payloads
// The 'extended: true' option enables parsing of nested objects in URL-encoded data
// The 'limit' option again restricts the maximum size of the request body to 16KB
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serving static files from the 'public' directory
// Any file in the 'public' folder (e.g., images, CSS, or JavaScript) can be accessed directly by the client
app.use(express.static("public"));

// Adding cookie parsing middleware to the application
// This middleware reads cookies from incoming HTTP requests and populates 'req.cookies' with the cookie data
app.use(cookieParser());

// Importing routes for user-related operations
// The 'userRouter' is expected to define various routes related to user functionalities (e.g., login, registration, profile)
import userRouter from './routes/user.routes.js';

// Declaring routes for the application
// All user-related API endpoints will be prefixed with '/api/v1/users'
// For example, if the router defines a 'GET /profile' route, it will be accessible as '/api/v1/users/profile'
app.use("/api/v1/users", userRouter);

// Exporting the 'app' instance
// This allows the Express application to be imported and used in other files (e.g., in 'index.js' to start the server)
export { app };
