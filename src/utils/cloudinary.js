import { v2 as cloudinary} from "cloudinary";
// fs = filesystem it is present in node to read write file
import fs from "fs"
import { ApiError } from "./ApiError";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return null;
        // upload the file on cloudinary
        const response = cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
       // console.log("Response from clodinary", (await response))
        // file has been uploaded successfully
        console.log("file is uploaded on cloudinary",(await response).url)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as
        // the upload operation got failed
        return null;
    }
}

const deleteFromCloudinary = async(imgUrl)=>{
    try {
        cloudinary.uploader.destroy(imgUrl,{resource_type:"auto"})
        console.log("file deleted successfully")
        
    } catch (error) {
        throw new ApiError(400,"Error while deleting image from cloudinary")
    }
}

export {uploadOnCloudinary,deleteFromCloudinary}