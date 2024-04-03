import mongoose, { Schema } from "mongoose"
import { Jwt } from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema= new Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase:true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        index: true,
        trim: true,
    },
    avatar: {
        type: String, // url
        required: true,
    },
    coverImage:{
        type: String, // cloudinary image url
    },
    watchHistory:[
        {
            type:Scheme.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type: String,
        required: [true, "Password is required"]
    },
    refreshToken:{
        type: String,
    }

},
{
    timestamps:true,
})


// this method will be called just before saving data in db
// dont use ()=>{} arrow function otherwise we dont have access to this
userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next(); // if password not modified return  
    this.password = bcrypt.hash(this.password, 10) // else bcrypt
    next()
})

//this will take password and encrypted password and compare the password is correct or not
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password)
}



userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username: this.username,
            fulName:this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User= mongoose.model("User",userSchema)