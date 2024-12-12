// This class `ApiResponse` is used to create a standardized structure for API responses.
// It helps in returning consistent responses from the API.

class ApiResponse {
    constructor(
        // Constructor parameters:
        statusCode, // HTTP status code for the response (e.g., 200 for success, 404 for not found).
        data, // The main data or payload of the response.
        message = "Success" // A default success message if none is provided.
    ) {
        // Properties of the API response:
        this.statusCode = statusCode; // Store the HTTP status code.
        this.data = data; // Store the response payload or result data.
        this.message = message; // Store the response message.
        this.success = statusCode < 400; // Determine success based on the status code (< 400 means success).
    }
}

// Export the `ApiResponse` class to make it available for use in other modules.
export { ApiResponse };
