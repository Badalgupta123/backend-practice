import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId= req.user
    //TODO: toggle like on video
    if(!videoId){
        throw new ApiError(400,"Video Id not found")
    }

    const video = await Like.findById(videoId)
    if(video){
        const result = await Like.findByIdAndDelete(videoId)
        if(!result){
            throw new ApiError(400,"There is some error while disliking video")
        }
        return res
                .status(200)
                .json(
                    new ApiResponse(200,{},"Video disliked successfully")
                )
    }
    else{
        const like = await Like.create(
           { video:videoId, likedBy:userId}

        )
        if(!like){
            throw new ApiError(400,"There is some issue while creating like")
        }
        return res
                .status(200)
                .json(
                    new ApiResponse(200,{},"Video liked successfully")
                )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
   
    const userId= req.user?._id
    //TODO: toggle like on video
    if(!commentId){
        throw new ApiError(400,"comment Id not found")
    }

    const comment = await Like.findById(commentId)
    if(comment){
        const result = await Like.findByIdAndDelete(commentId)
        if(!result){
            throw new ApiError(400,"There is some error while disliking comment")
        }
        return res
                .status(200)
                .json(
                    new ApiResponse(200,{},"comment disliked successfully")
                )
    }
    else{
        const like = await Like.create(
           { comment:commentId, likedBy:userId}

        )
        if(!like){
            throw new ApiError(400,"There is some issue while creating like")
        }
        return res
                .status(200)
                .json(
                    new ApiResponse(200,{},"comment liked successfully")
                )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}