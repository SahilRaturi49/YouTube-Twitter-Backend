import mongoose, {Schema} from "mongoose";
// Importing `mongoose` for connecting and interacting with MongoDB. 
// `Schema` is destructured for defining the structure of the documents stored in MongoDB.

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
// Importing a plugin that enables pagination functionality for Mongoose aggregation queries.

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // Indicates that `videoFile` should store a string (likely a Cloudinary URL).
            required: true, // This field is mandatory when creating a document.
        },
        thumbnail: {
            type: String, // Stores a URL or path to the video's thumbnail image.
            required: true, // Mandatory field.
        },
        tile: {
            type: String, // Stores the title of the video.
            required: true, // Mandatory field.
        },
        description: {
            type: String, // Detailed description of the video content.
            required: true, // Mandatory field.
        },
        duration: {
            type: Number, // Length of the video (in seconds or minutes).
            required: true, // Mandatory field.
        },
        views: {
            type: Number, // Keeps track of how many times the video has been viewed.
            default: 0 // Defaults to 0 if no value is provided during creation.
        },
        isPublished: {
            type: Boolean, // Indicates if the video is published (true) or in draft mode (false).
            required: true // Mandatory field.
        },
        owner: {
            type: Schema.Types.ObjectId, // Refers to the `_id` of a `User` document in another collection.
            ref: "User" // Establishes a relationship with the `User` model.
        }
    },
    {
        timestamps: true // Automatically adds `createdAt` and `updatedAt` fields to the schema.
    }
);
// Defining the schema for the "Video" collection in MongoDB.

videoSchema.plugin(mongooseAggregatePaginate);
// Adding the aggregate paginate plugin to the schema to enable pagination on aggregation queries.

export const Video = mongoose.model("Video", videoSchema);
// Creating and exporting the `Video` model based on the defined schema.
// This will allow interaction with the `videos` collection in MongoDB.

/* 
Explanation:
1. **Purpose**:
   - The `videoSchema` defines the structure for the `videos` collection in MongoDB.
   - It specifies the required fields, data types, and default values to ensure consistent data storage.

2. **Field Details**:
   - `videoFile`: Stores a string representing the URL of the video file (e.g., a Cloudinary link).
   - `thumbnail`: Stores a URL or path to the video thumbnail.
   - `tile`: Represents the title of the video.
   - `description`: Provides a detailed description of the video content.
   - `duration`: Specifies the length of the video, stored as a number.
   - `views`: Tracks the number of times the video has been viewed, with a default value of 0.
   - `isPublished`: Indicates whether the video is published or in draft mode.
   - `owner`: Links the video to a specific user, referencing the `User` model.

3. **Features**:
   - **Timestamps**: Automatically tracks when a video is created (`createdAt`) or updated (`updatedAt`).
   - **Relationship with Users**: The `owner` field establishes a reference to a `User`, enabling user-specific video management.
   - **Pagination Support**: The `mongooseAggregatePaginate` plugin simplifies handling large datasets by enabling efficient pagination in aggregation queries.

4. **Why Use This**:
   - Ensures a structured and validated data model for storing video-related data.
   - Facilitates relationships between videos and users for better data organization.
   - Provides additional features like pagination and timestamping for ease of use and improved performance.
   - Simplifies interaction with MongoDB through Mongoose's built-in methods and plugins.
*/ 
