
import {Video} from "../models/video.model.js"

import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"

const isUserOwner = async(videoId,req)=>{
    const video = await Video.findById(videoId);
    
    if(video?.owner.toString() !== req.user?._id.toString()){
        return false;
    }
    
    return true;
    
}
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
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

const publishAVideo = asyncHandler(async (req, res) => {
    
    const { title, description} = req.body
    const user= req.user
    // TODO: get video, upload to cloudinary, create video
    if([title,description].some((field)=>field?.trim() === "")){
        throw new ApiError(400,"All fields are required")
    }
     

    const videoLocalPath= req.files?.videoFile[0]?.path

    let thumbnailLocalPath;
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length >0){
        thumbnailLocalPath = req.files.thumbnail[0].path
      }
    if(!videoLocalPath){
        throw new ApiError(400,"Video file is required");
    }


    const video = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    console.log(video)
    if(!video){
        throw new ApiError(400,"something went wrong while uploading ")
    }

    const newVideo = Video.create(
        {
            videoFile: video?.url,
            thumbnail: thumbnail?.url,
            title: title,
            description: description,
            duration:video?.duration,
            views:0,
            isPublished:true,
            owner: user,
        }
    )
    if(!newVideo){
        throw new ApiError(400,"something went wrong while creating video")
    }
    return res  
            .status(200)
            .json(
                new ApiResponse(200,newVideo,"Video created successfully")
            )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"Video id not found")
    }
    
    
    const video = await Video.findById(videoId);
    
    
    if(!video ){
        throw new ApiError(400,"Video does not exist")
    }
    return res
            .status(200)
            .json(
                new ApiResponse(200,video,"Video fetched successfully")
            )
    
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title,description}= req.body
    //TODO: update video details like title, description, thumbnail
    if(!title && !description ){
        throw new ApiError(400,"Please enter something to update")
    }
    const authorized = await isUserOwner(videoId,req)

    if(!authorized){
        throw new ApiError(300,"Unauthorized Access")
    } 
    if(!videoId){
        throw new ApiError(400,"Video Id is required")
    }
    const thumbnaillocalpath = req.file?.path;
   
    const thumbnailUrl = await uploadOnCloudinary(thumbnaillocalpath);
    if(!thumbnailUrl?.url){
     throw new ApiError(400,"Something went wrong while updating the thumbnail")
    }

    let updatedObject={};
    if(title){
        updatedObject.title= title
    }
    if(description){
        updatedObject.description= description
    }
    if(thumbnailUrl){
        updatedObject.thumbnail= thumbnailUrl?.url
    }
    const video = await Video.findByIdAndUpdate(
        videoId,
        updatedObject,
        {
            new:true
        }
    )
    if(!video){
        throw new ApiError(400,"Error while updating video")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,video,"Video updated successfully")
            )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    //TODO: delete video
    if(!videoId){
        throw new ApiError(400,"Video Id is required")
    }
    const authorized = await isUserOwner(videoId,req)

    if(!authorized){
        throw new ApiError(300,"Unauthorized Access")
    } 
    const deletedVideo= await Video.findByIdAndDelete(videoId)

    deleteFromCloudinary(videoId);
    if(!deletedVideo){
        throw new ApiError("Something went wrong while deleting video")
    }
    return res
            .status(200)
            .json(
                new ApiResponse(200,{},"Video deleted successfully")
            )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}