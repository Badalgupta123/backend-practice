
// we are overwriting original node error class
class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors= [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message= message
        this.success= false
        this.errors= errors

        if(stack){
            this.stack= stack
        } else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}


/*

This code defines a custom error class named ApiError in JavaScript, specifically designed for use within an Express.js application. Here's what it does:

 => The ApiError class extends the built-in Error class, allowing it to inherit its properties and methods.
 => It has a constructor method which takes four parameters: statusCode, message, errors, and stack.

 => statusCode is the HTTP status code that will be sent in the response when this error occurs.
 => message is the error message. If not provided, it defaults to "Something went wrong".
 => errors is an optional array that can contain additional error information.
 => stack is the stack trace associated with the error. If provided, it's used; otherwise, it captures the stack trace using Error.captureStackTrace.


 Inside the constructor, it calls the superclass constructor (Error) with the provided message.

It sets properties such as statusCode, data, message, success, and errors on the instance of ApiError being created.
This ApiError class can be used within an Express.js application to create custom error objects with specific status codes, messages, and additional error data.
 It provides a standardized way to handle errors and send appropriate responses to clients.


*/