import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"


const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken ,refreshToken}
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating accecc and refresh token")
    }
}

const registerUser = asyncHandler(async(req,res) =>{
    // get details from user
    // validation 
    // check if user already exist: via username, email
    // check for images check for avatar
    // upload them to cloudinary,avatar
    // create user object   create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email,username, password}= req.body
    //console.log("email: ",email);

    /* if(fullName === ""){
        throw new ApiError(400,"Full name is required")
    } */
    // INSTEAD of checking this condition for each file we use some method which 
    // checks the given condition and return true or false
    if([fullName,email,username,password].some((field)=>field?.trim() === "")){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser = await User.findOne({
        $or : [{ username },{ email }] // if either email or username already exist in db
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath =  req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
        coverImageLocalPath= req.files.coverImage[0].path
      }
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar) {
        throw new ApiError(400,"Avatar file is required");
    }

    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()

    })

    const createdUser =  await User.findById(user._id).select(
        "-password -refreshToken"     // this will return all data except password and refresh token
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})


const loginUser= asyncHandler(async(req,res)=>{
    // get data from req body
    // username or email
    // find user
    // password check
    // access and refresh token
    // send cookies

    const {email,username,password } = req.body
    // we need both username and email
    // if need any one then do this !(email||username)
    if(!username && !email){
        throw new ApiError(400,"username or email is required")
    }

    const user = await User.findOne({
        $or : [{email},{username}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }
    // this is the user that we get from db not of mongoose
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }

    const {accessToken ,refreshToken} = await generateAccessAndRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options= {
        httpOnly : true,
        secure: true,
    }
    return res
        .status(200)
        .cookie("accessToken",accessToken, options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken,
                    refreshToken
                },
                "user logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async(req,res)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $unset :{
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true,
        }
    )

    const options= {
        httpOnly : true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"User logged out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    
        if(!incomingRefreshToken){
            throw new ApiError(401,"unauthorized request")
        }
    
        const decodedToken =jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user =await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
    
        // match the refresh tokens 
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
        }
    
        //if match then generate new access token
        const options= {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken ,newRefreshToken}= await generateAccessAndRefreshTokens(user._id)
    
        return res
                .status(200)
                .cookie("accessToken",accessToken,options)
                .cookie("refreshToken",refreshToken.options)
                .json(
                    new ApiResponse(
                        200,
                        {accessToken,refreshToken:newRefreshToken},
                        "Access token refreshed"
                    )
                )
    
    } catch (error) {
        throw new ApiError(401, error?.message ||"Refresh token is expired or used" )
    }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old password")
    }

    user.password = newPassword // as we save this new password will 
    // be encrypted automatically as we have written logic in models
    await user.save({validateBeforeSave:false})

    return res
            .status(200)
            .json(new ApiResponse(200,{},"Password changed successfully"))




})

const getCurrentUser = asyncHandler(async(req,res)=>{
    const user = req?.user
    if(!user){
        throw new ApiError(404,"user not found")
    }
    return res
            .status(200)
            .json(new ApiResponse(200,user, "current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName, email} = req.body
    if(!fullName || !email){
        throw new ApiError(400,"All fields are required")
    }

    const user =await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName, // we can write in both ways fullName:fullName or fullName
                email:email
            }
        },
        {new: true}
    ).select("-password")

    return res
            .status(200)
            .json(new ApiResponse(200,user,"Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading on avatar")
    }
    const imgUrl = req.user?.avatar
   
    deleteFromCloudinary(imgUrl);
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")

    return res  
            .status(200)
            .json(
                new ApiResponse(200,user,"Avatar updated successfully")
            )
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"CoverImage file is missing")
    }
    
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading coverImage on cloudinary")
    }
    const imgUrl = req.user?.avatar
   
    deleteFromCloudinary(imgUrl);

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}
    ).select("-password")

    return res  
            .status(200)
            .json(
                new ApiResponse(200,user,"Cover Image updated successfully")
            )
})

const getUserChannelProfile= asyncHandler(async(req,res)=>{
    const {username}= req.params
    if(!username?.trim()){
        throw new ApiError(400,"username is missing")
    }
    // we can also find user by normal find method but match already can do this for us
    // these are aggregation pipelines
    // this will find the no of subscribers user have and number of channels user has subscribed
    // and add these fields in user schema
    const channel = await User.aggregate([
        {
            $match:{
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount:{
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond:{
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false,
                    }
                }
            }
        },
        {
            $project: {
                fullName:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                coverImage:1,
                avatar:1,
                email:1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404,"channel does not exists")
    }
    return res
            .status(200)
            .json(
                new ApiResponse(200,channel[0],"User channel fetched successfully")
            )
})

const getWatchHistory = asyncHandler(async(req,res)=>{
    // actually req.user._id return a string which is converted automatically to id whenever we use find method or any other method
    // but when we need actual id we need to convert it 
    
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
       {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1,
                                    }
                                }
                            ]
                        }
                    },
                    { // this will only take the 0th element from owner array and return 
                        $addFields:{
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
       }
    ])

    return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    user[0].watchHistory,
                    "watch history fetched successfully"
                )
            )
})

export {
        registerUser ,
        loginUser,
        logoutUser,
        refreshAccessToken ,
        changeCurrentPassword,
        getCurrentUser,
        updateAccountDetails,
        updateUserAvatar,
        updateUserCoverImage,
        getUserChannelProfile,
        getWatchHistory
    }