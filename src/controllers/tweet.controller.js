import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    if(!content ){
        throw new ApiError(400,"All fields are required")
    }

    const tweet = await Tweet.create(
        {
            content:content,
            owner:req.user
        }
    )
    
    if(!tweet){
        throw new ApiError(500,"Something went wrong while creating tweet")
    }

    return res  
            .status(200)
            .json(
                new ApiResponse(200,tweet,"Tweet created successfully")
            )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId= req.params.userId
    if(!userId){
        throw new ApiError(400,"UserId not found")
    }
    const tweets =await Tweet.find({owner: userId})
    
    if(!tweets){
        throw new ApiError(404,"There is some error while fetching tweets")
    }
    
    return res
            .status(200)
            .json(
                new ApiResponse(200,tweets,"Tweets fetched successfully")
            ) 
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const tweetId = req.params.tweetId
    const {content} = req.body

    if(!tweetId ){
        throw new ApiError(400,"TweetId not found")
    }
    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400,"Please enter valid videoId")
    }
    if(!content ){
        throw new ApiError(400,"please provide the updated content")
    }
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content: content
            }
        },
        {new:true}
    )
    return res  
            .status(200)
            .json(
                new ApiResponse(200,updatedTweet,"Tweet updated successfully")
            )

})

const deleteTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.tweetId

    if(!tweetId){
        throw new ApiError(400,"TweetId not found")
    }
    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400,"Please enter valid videoId")
    }

    const result= await Tweet.findByIdAndDelete(tweetId )
    if(!result){
        throw new ApiError(400,"There is some error while deleting the tweet")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,result,"Tweet deleted successfully")
            )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}