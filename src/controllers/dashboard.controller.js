import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId= req?.user?._id
    if(!userId){
        throw new ApiError(500,"User not found")
    }
    const subscribersCount= await Subscription.find({channel:userId})
    if(!subscribersCount){
        throw new ApiError(400,"There is some issue while getting subscribers count")
    }
    const videos = await Video.find({owner:userId})
    if(!videos || videos === null){
        throw new ApiError(404,"No video found")  
    }
    let totalViewCount;
    const views = videos.forEach(video => totalViewCount += video.views )
   
    if(!totalViewCount){
        throw new ApiError(400,"error while getting total view count")
    }
    const totalLikeCount= await Like.countDocuments(
        {
            likedBy:userId,
            video: { $exists: true, $ne: null }
        }
    )
    if(!totalLikeCount){
        throw new ApiError(400,"error while getting likecount")
    }
    const data={}
    data.subscribersCount= subscribers
    data.totalLikeCount = totalLikeCount
    data.totalViewCount= totalViewCount

    return res
            .status(200)
            .json(
                new ApiResponse(200,data,"Account Data fetched Successfully")
            )


})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    // this is same as getting all videos of a user
    const userId= req.user?._id
    const { page = 1, limit = 10, query, sortBy, sortType } = req.query
    //TODO: get all videos based on query, sort, pagination
   
    // Parse query parameters
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Prepare filters based on query parameters
    const filters = {};

    // Apply text search query if provided
    if (query) {
        filters.$or = [
            { title: { $regex: query, $options: 'i' } }, // Case-insensitive search on title
            { description: { $regex: query, $options: 'i' } } // Case-insensitive search on description
        ];
    }

    // Apply userId filter if provided
    if (userId) {
        filters.userId = userId;
    }

    // Prepare sorting options based on sortBy and sortType parameters
    const sortOptions = {};
    if (sortBy) {
        sortOptions[sortBy] = sortType === 'desc' ? -1 : 1; // Sort by the specified field in ascending or descending order
    } else {
        // Default sorting: newest videos first based on createdAt timestamp
        sortOptions.createdAt = -1;
    }

    try {
        // Fetch videos based on filters, pagination, and sorting
        const videos = await Video.find(filters)
            .sort(sortOptions)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .exec();

        // Count total number of videos matching the filters (for pagination)
        const totalCount = await Video.countDocuments(filters);

        // Prepare response object with fetched videos and pagination metadata
        const response = {
            videos,
            page: pageNumber,
            totalPages: Math.ceil(totalCount / limitNumber),
            totalVideos: totalCount
        };

        // Return success response with the fetched videos
        return res.status(200).json(new ApiResponse(200, response, "Videos fetched successfully"));
    } catch (error) {
        // Handle any errors that occur during database query
        throw new ApiError(500, "Failed to fetch videos");
    }
})

export {
    getChannelStats, 
    getChannelVideos
    }