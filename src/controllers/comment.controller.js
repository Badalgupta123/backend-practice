import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const isUserOwner = async(commentId,req)=>{
    const comment = await Comment.findById(commentId);
    
    if(comment?.owner.toString() !== req.user?._id.toString()){
        return false;
    }
    
    return true;
    
}
const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId){
        throw new ApiError(400,"VideoId not found")
    }
     // Validate videoId using mongoose.Types.ObjectId
     if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Please enter valid videoId")
    }
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const does_video_exist= await Video.findById(videoId)
    if(does_video_exist === null){
        throw new ApiError(404,"There is not such video exist with this videoid")
    }

    const comments = await Comment.find({
        video: videoId
    }).skip((pageNumber - 1) * limitNumber)
    

    if(!comments){
        //console.log("This is comment =>*****",comments)
        throw new ApiError(400,"There is some issue while fetching comments")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,comments,"Comments fetched successfully")
            )
    


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content}= req.body
    const {videoId} =req.params
    if(!videoId || !mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"VideoId is invalid")
    }
    const owner = req.user?._id

    if(!content || !videoId || !owner){
        throw new ApiError(400,"All the fields are compulsory")
    }
    const does_video_exist= await Video.findById(videoId)
    if(does_video_exist === null){
        throw new ApiError(404,"There is not such video exist with this videoid")
    }
    const comment = await Comment.create(
        {
            content:content,
            owner:owner,
            video:videoId
        }
    )

    if(!comment){
        throw new ApiError(400,"There is some error while creating comment")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,comment,"Comment created successfully")
            )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId}= req.params
    const {content}= req.body
    if(!content){
        throw new ApiError("Please provide something to update")
    }
    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400,"Please enter valid commentId")
    }
    if(!commentId){
        throw new ApiError("CommentId not found")
    }

    const comment= await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404,"There is no such comment exist with this commentid")
    }
    const authorized= await isUserOwner(commentId,req)
    if(!authorized){
        throw new ApiError(400,"Only the owner can edit this comment")
    } 
    
    const updatedComment= await Comment.findByIdAndUpdate(
        commentId,
        {
            content:content
        },
        {
            new: true,
        }
    )

    if(!updatedComment){
        throw new ApiError(400,"There is some issue while updating comment")
    }
    return res
            .status(200)
            .json(
                new ApiResponse(200,updatedComment,"comment updated successfully")
            )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    if(!commentId){
        throw new ApiError(400,"CommentId not found")
    } 
    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400,"Please enter valid videoId")
    }
    const comment= await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404,"There is no such comment exist with this commentid")
    }
    const authorized= await isUserOwner(commentId, req)
    if(!authorized){
        throw new ApiError(400,"You are not allowed to delete this comment")
    }
    
    const deletedComment= await Comment.findByIdAndDelete(commentId)
    if(!deletedComment){
        throw new ApiError(400,"There is some issue while deleting comment")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,"Comment deleted successfully")
            )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }