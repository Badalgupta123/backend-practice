import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    let {videoId} = req.params
    const userId= req.user
    videoId= videoId.trim()
    //TODO: toggle like on video
    if(!videoId){
        throw new ApiError(400,"Video Id not found")
    }
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Please enter valid videoId")
    }
   
    const existingLike = await Like.findOne(
        {
            video: videoId,
            likedBy: userId
        }
    )
   
   // console.log("existing like => ",existingLike)
    if(existingLike !== null){
        const deletedLike= await Like.findByIdAndDelete(existingLike?._id)
        if(!deletedLike){
            throw new ApiError(404,"There is some issue while deleting like")
        }
        return res
                .status(200)
                .json(
                    new ApiResponse(200,{},"Video disliked successfully")
                )
    }

    const does_video_exist= await Video.findById(videoId)
    if(does_video_exist === null){
        throw new ApiError(404,"There is not such video exist with this videoid")
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
                    new ApiResponse(200,like,"Video liked successfully")
                )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    let {commentId} = req.params
    //TODO: toggle like on comment
    commentId= commentId.trim()
    const userId= req.user

    if(!commentId){
        throw new ApiError(400,"Comment Id not found")
    }
    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400,"Please enter valid commentId")
    }
   
    const existingLike = await Like.findOne(
        {
            comment: commentId,
            likedBy: userId
        }
    )
   
   // console.log("existing like => ",existingLike)
    if(existingLike !== null){
        const deletedLike= await Like.findByIdAndDelete(existingLike?._id)
        if(!deletedLike){
            throw new ApiError(404,"There is some issue while deleting like")
        }
        return res
                .status(200)
                .json(
                    new ApiResponse(200,{},"Comment disliked successfully")
                )
    }
    
    const does_comment_exist= await Comment.findById(commentId)
    if(does_comment_exist === null){
        throw new ApiError(404,"There is not such comment exist with this commentId")
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
                    new ApiResponse(200,{},"Comment disliked successfully")
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
                    new ApiResponse(200,{},"Comment liked successfully")
                )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    let {tweetId} = req.params
    //TODO: toggle like on tweet
    const userId= req.user
    tweetId= tweetId.trim()
    //TODO: toggle like on video
    
    if(!tweetId){
        throw new ApiError(400,"Tweet Id not found")
    }
    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400,"Please enter valid TweetId")
    }
   
    const existingLike = await Like.findOne(
        {
            tweet: tweetId,
            likedBy: userId
        }
    )
   
   // console.log("existing like => ",existingLike)
    if(existingLike !== null){
        const deletedLike= await Like.findByIdAndDelete(existingLike?._id)
        if(!deletedLike){
            throw new ApiError(404,"There is some issue while deleting like")
        }
        return res
                .status(200)
                .json(
                    new ApiResponse(200,{},"Tweet disliked successfully")
                )
    }

    const does_tweet_exist= await Tweet.findById(tweetId)
    if(does_tweet_exist === null){
        throw new ApiError(404,"There is not such tweet exist with this tweetId")
    }

    const tweet = await Like.findById(tweetId)
    if(tweet){
        const result = await Like.findByIdAndDelete(tweet)
        if(!result){
            throw new ApiError(400,"There is some error while disliking tweet")
        }
        return res
                .status(200)
                .json(
                    new ApiResponse(200,{},"Tweet disliked successfully")
                )
    }
    else{
        const like = await Like.create(
           { tweet:tweetId, likedBy:userId}

        )
        if(!like){
            throw new ApiError(400,"There is some issue while creating like")
            
        }
        return res
                .status(200)
                .json(
                    new ApiResponse(200,{},"Tweet liked successfully")
                )
    }

    
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    
    const likedVideo= await Like.find(
        { 
            video: { $exists: true, $ne: null } // ne:null means not equal to null
        }
    ).populate('video');

    if(!likedVideo){
        throw new ApiError(400,"There is some issue while fetching liked videos")
    }
    return res
            .status(200)
            .json(
                new ApiResponse(200,likedVideo,"Liked videos fetched successfully")
            )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}