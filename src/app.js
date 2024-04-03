import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const app= express();


// app.use is used for accessing middlewares generally
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
// accept json data(payload) only upto 16kb (json data like in forms)
app.use(express.json({limit: "16kb"}))
// to read encoded url (parsing encoded url)
app.use(express.urlencoded({extended:true, limit:"16kb"}))
// this is public folder for assets or file which anyone can use
app.use(express.static("public"))

// cookie parser is used to read and put cookie in web browser
app.use(cookieParser())



// routes import 
import userRouter from "./routes/user.routes.js"

// routes declaration
app.use("/api/v1/users/",userRouter)


// https://localhost:3000/api/v1/users/ the route which we write in routes file

export {app}