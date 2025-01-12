// Import the 'multer' package for handling multipart/form-data, used for uploading files.
import multer from "multer";

// Configure the storage settings for file uploads using 'multer.diskStorage()'.
// This allows you to control how files are stored on the server.
const storage = multer.diskStorage({
    // The 'destination' function specifies the folder where uploaded files will be stored.
    destination: function (req, file, cb) {
        // The callback function 'cb' is called with two arguments: error (null here) and the folder path.
        cb(null, "./public/temp"); // Files will be saved in the './public/temp' directory.
    },
    // The 'filename' function defines the name of the uploaded file.
    filename: function (req, file, cb) {
        // Here, we are using the original name of the file that was uploaded.
        cb(null, file.originalname); // The file will retain its original name.
    }
});

// 'upload' is a middleware that uses the above 'storage' settings.
// It allows you to configure how files are handled in specific routes.
export const upload = multer({ 
    storage, // Pass the storage configuration to multer.
});
