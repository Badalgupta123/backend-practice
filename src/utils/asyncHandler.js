// using promise
// this is high order function i.e. it takes function as parameter

/****
 *  asyncHandler is a utility function used to handle asynchronous operations within Express.js
 *  route handlers. It ensures that errors thrown during asynchronous operations are properly caught
 *  and forwarded to Express's error handling middleware for centralized error handling.
 * ******/
const asyncHandler = (requestHandler) =>{
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=>next(err))
    }
}

export {asyncHandler}


// implementation using try catch block


/* const asyncHandler = ()=>{
    async ()=>{}
} */
// equivalent to above line

/* const asyncHandler = (fn)=> async (req,res,next) =>{
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
} */ 
