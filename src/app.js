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
import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

// routes declaration

app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)
// https://localhost:3000/api/v1/users/ the route which we write in routes file

export {app}