// This class `ApiError` extends the built-in `Error` class to create a custom error object for APIs.
// It is used to represent and handle API errors in a standardized way.

class ApiError extends Error {
    constructor(
        // Constructor parameters:
        statusCode, // HTTP status code for the error (e.g., 404, 500).
        message = "Something went wrong", // A default error message if none is provided.
        errors = [], // Additional details or array of error messages.
        statck = "" // Optional stack trace for debugging purposes.
    ) {
        super(message); // Call the parent `Error` class constructor with the message.
        
        // Properties of the custom error object:
        this.statusCode = statusCode; // Store the HTTP status code.
        this.data = null; // Placeholder for additional error data, set to `null` by default.
        this.message = message; // Store the error message.
        this.success = false; // Indicate that the operation was unsuccessful.
        this.errors = errors; // Store additional error details.

        // Stack trace handling:
        if (statck) { 
            // If a custom stack trace is provided, use it.
            this.statck = statck; 
        } else {
            // Otherwise, capture the stack trace for this error instance.
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// Export the `ApiError` class to make it available for use in other modules.
export { ApiError };
