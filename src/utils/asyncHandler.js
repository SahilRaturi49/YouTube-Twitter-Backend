// This function is a utility for handling asynchronous operations in Express route handlers.
// It wraps asynchronous route handlers to handle errors automatically by passing them to the Express error handler.
const asynHandler = (requestHandler) => {
    // Return a new middleware function that takes req (request), res (response), and next (next middleware).
    (req, res, next) => {
        // Use Promise.resolve to ensure the requestHandler executes as a promise.
        // If the requestHandler resolves successfully, nothing further is done.
        // If it rejects (throws an error), the error is caught in the next step.
        Promise.resolve(requestHandler(req, res, next)).
        // Attach a then-catch chain to handle any errors from the promise.
        catch((err) => next(err))
        // Pass any errors encountered to the next middleware.
        // In Express, the next(err) function is used to handle errors centrally.
    }
}



// Export the asynHandler function so it can be imported and used in other modules.
// This is part of ES6 module syntax.
export { asynHandler };



// const asynHandler = (fn) => async(req, res, next) => {
//     try {
//         await fn(req, res, next)
        
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }