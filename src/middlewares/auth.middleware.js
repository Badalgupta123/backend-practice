import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import  jwt  from "jsonwebtoken"

export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        // to logout we use the accesstoken stored in cookies but in case of mobile it will be in req. header
        // by the way for computer cookies are present in request
        // for mobile it will be received in header in the form of authorization("beared access_token")
        // we need only access token so remove bearer and space from front 
        const token = req.cookies?.accessToken|| req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id.select(
            "-password -refreshToken"
        ))
    
        if(!user){
            throw new ApiError(401,"Invalid Acess Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})