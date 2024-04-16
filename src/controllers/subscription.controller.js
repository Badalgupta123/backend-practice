import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!channelId || !isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel Id")
    }

    const user = req.user
    const subscription= await Subscription.find({
        channel:channelId,
        subscriber:user?._id
    })

    if(subscription){
        const subscriptionId= subscription?._id
        if(!subscriptionId || !isValidObjectId(subscriptionId)){
            throw new ApiError(400,"Invalid subscriptionId")
        }
        const deletedSubscription= await Subscription.findByIdAndDelete(subscriptionId)
        if(!deletedSubscription){
            throw new ApiError(400,"Unable to delete subscription")
        }
        return res
                .status(200)
                .json(
                    new ApiResponse(200,{},"Subscription deleted successfully")
                )
    }else{

        const newSubscription= await Subscription.create(
            {
                subscriber:user,
                channel: channelId
            }
        )

        if(!newSubscription){
            throw new ApiError(500,"There is some issue while creating new subscription")
        }

        return res
                .status(200)
                .json(
                    new ApiResponse(200,newSubscription,"New subscription created successfully")
                )
    }

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!channelId || !isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channelId")
    }

    const channelSubscriber= await Subscription.find({channel:channelId})
    if(!channelSubscriber){
        throw new ApiError(400,"There is some issue while getting channelSubscriber")
    }
    return res
            .status(200)
            .json(
                new ApiResponse(200,channelSubscriber,"ChannelSubscriber fetched successfully")
            )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!subscriberId ||!isValidObjectId(subscriberId)){
        throw new ApiError(400,"Invalid objectId")
    }
    const user= req.user
    if(user?._id !== subscriberId){
        throw new ApiError(400,"Only user can view his subscribed channels")
    }
    const channelList = await Subscription.find({subscriber:subscriberId})

    if(!channelList){
        throw new ApiError(400,"there is some issue while fetching channel list")
    }
    return res
            .status(200)
            .json(
                new ApiResponse(200,channelList,"Channellist fetched successfully")
            )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}