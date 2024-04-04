import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"


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

export {registerUser}