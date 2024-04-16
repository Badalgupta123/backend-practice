import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!name || !description){
        throw new ApiError(400,"Please provide all details")
    }

    const user= req.user
    const playlist = await Playlist.create(
        {
            name:name,
            description:description,
            owner: user,
            videos: [],
        }
    )

    if(!playlist){
        throw new ApiError(400,"There is some error while creating playlist")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,playlist,"Playlist created successfully")
            )
    
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    let {userId} = req.params
    //TODO: get user playlists
    userId= userId.trim()
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400,"Invalid userId")
    }

    const user= req.user
    if(user?._id !== userId){
        throw new ApiError("Unauthorized user cannot fetch playlist")
    }
    const playlists = await Playlist.find(
        {
            owner: userId
        }
    )

    if(!playlists || playlists===null ){
        throw new ApiError(500,"There is some issue while fetching playlist")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,playlists,"playlists fetched successfully")
            )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    let {playlistId} = req.params
    playlistId = playlistId.trim

    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError("invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist || playlist === null){
        throw new ApiError(500,"There is some issue while fetching playlist")
    }
    return res
            .status(200)
            .json(
                 new ApiResponse(200,playlist,"playlist fetched successfully")
            )

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !videoId ||
        !isValidObjectId(playlistId) ||
        !isValidObjectId(videoId)){
            throw new ApiError(400,"invalid playlistId or videoId")
    }

    const user= req.user
    const playlist= await Playlist.findById(playlistId)
    if(playlist?.owner !== user?._id){
        throw new ApiError(400,"Only owner can make changes in playlist")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"No such video exist with this videoId")
    }

    const updatedPlaylist = await playlist.videos.push(videoId)
    if(!updatedPlaylist){
        throw new ApiError(500,"There is some issue while adding video to playlist")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(20,updatedPlaylist,"Video added successfully")
            )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!playlistId || !videoId ||
        !isValidObjectId(playlistId) ||
        !isValidObjectId(videoId)){
            throw new ApiError(400,"invalid playlistId or videoId")
    }

    const user= req.user
    const playlist= await Playlist.findById(playlistId)
    if(playlist?.owner !== user?._id){
        throw new ApiError(400,"Only owner can make changes in playlist")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"No such video exist with this videoId")
    }
    const is_video_in_playlist = await Playlist.find({videos:videoId})
    if(!is_video_in_playlist){
        throw new ApiError(400,"No such video exist with this videoId in playlist")
    }


    const updatedPlaylist= playlist.videos.filter(video => video !==videoId)
    if(!updatedPlaylist){
        throw new ApiError(400,"There is some issue while removing video from playlist")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,updatedPlaylist,"Video removed successfully")
            )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlistId")
    }

    const user= req.user
    const playlist= await Playlist.findById(playlistId)
    if(playlist?.owner !== user?._id){
        throw new ApiError(400,"Only owner can delete playlist")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)
    if(!deletedPlaylist){
        throw new ApiError(400,"There is some issue while deleting playlist")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,{},"Playlist deleted successfully")
            )

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!name || !description ){
            throw new ApiError(400,"invalid name or description")
    }
    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError("invalid playlist id")
    }

    const user= req.user
    const playlist= await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"No such playlist exist with this playlistId")
    }
    if(playlist?.owner !== user?._id){
        throw new ApiError(400,"Only owner can make changes in playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name:name,
            description:description,
        },
        {
            new: true,
        }
    )
    
    if(!updatedPlaylist){
        throw new ApiError(500,"There is some issue while updating playlist")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,updatedPlaylist,"Playlist updated successfully")
            )

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}