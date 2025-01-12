// Importing the dotenv module to load environment variables from a file named '.env' into process.env
import dotenv from "dotenv";

// Importing the 'app' object from the 'app.js' file, which likely contains the Express application setup
import { app } from "./app.js";

// Importing the 'connectDB' function from the database connection module located in './db/index.js'
// This function is probably used to establish a connection to the MongoDB database
import connectDB from "./db/index.js";

// Configuring dotenv to load environment variables from the specified file
// The `path` option points to './env', meaning the file storing environment variables is named 'env' in the root folder
dotenv.config({
    path: './env'
});

// Calling the 'connectDB' function, which is expected to return a promise
// If the connection is successful, the server will start listening on the specified port
connectDB()
    .then(() => {
        // Starting the Express application server
        // `process.env.PORT` retrieves the port number from environment variables
        // If not specified, it defaults to 8000
        app.listen(process.env.PORT || 8000, () => {
            // Logging a success message to the console indicating the server is running
            console.log(`Server is running at port: ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        // Handling errors that may occur during the database connection process
        // If the database connection fails, an error message is logged
        console.log("MONGO db connection failed !!!", err);
    });























/*
import express from "express"
const app = express()

;(async () => {
    try{
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error", (error) => {
        console.log("ERRR: ", error);
        throw error;
       } )

       app.listen(process.env.PORT, () => {
        console.log(`App is listening on port ${process.env.PORT}`);
        
       })

    }catch(error){
        console.error("Error: ", error);
        throw err
    }
})()
    */
