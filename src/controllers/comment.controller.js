import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    const commentAggregate = Comment.aggregate([
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $lookup:{
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields:{
                likesCount:{
                    $size: "$likes"
                },
                owner:{
                    $first: "$owner"
                },
                isLiked:{
                    $cond:{
                        if:{$in:[req.user?._id, "likes.likedBy"]},
                        then: true,
                        else: false
                    }
                }
            }

        },
        {
            $sort: {
                createdAt: -1,
            }
        },
        {
            $project:{
                content: 1,
                likesCount: 1,
                createdAt: 1,
                isLiked: 1,
                owner:{
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1
                }
            }
        }
    ])

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const comments = await Comment.aggregatePaginate(
        commentAggregate,
        options
    )

    return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"))

    

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    

    const {videoId} = req.params
    const {content} = req.body

    if(!content){
        throw new ApiError(400, "Content is required")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if(!comment){
        throw new ApiError(500, "Failed to add comment please try again")
    }

    return res
    .status(200)
    .json(new ApiResponse(201, comment, "Comment added successfully"))



})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    
    const {commentId} = req.params
    const {content} = req.body

    if(!content){
        throw new ApiError(400, "Content is required")
    }

    const comment = await comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if(!comment.owner.equals(req.user?._id)){
        throw new ApiError(400, "Only comment owner can update their comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        comment?._id,
        {
            $set:{
                content
            }
        },
        {new: true}
    )

    if(!updateComment){
        throw new ApiError(500, "Failed to edit comment pleae try again")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updateComment, "Comment updated successfully"))



})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    
    const { commentId } = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment id")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404, "Comment not found")
    }
   

    if (!comment.owner.equals(req.user?._id)) {
        throw new ApiError(400, "Only comment owner can delete their comment");
    }

    await Comment.findByIdAndDelete(commentId)

    await Like.deleteMany({
        comment: commentId,
        likedBy: req.user
    })

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }