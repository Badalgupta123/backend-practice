// it has nothing much use as it is already handled by express

/*
 this code helps us create responses to send back to clients from our Express.js application.
  It sets up the structure of the response, including the status code, any data to send, and
   a message to explain what happened. It also determines whether the response is successful
    based on the status code.

*/
class ApiResponse {
    constructor(statusCode,data,message="Success"){
        this.statusCode= statusCode
        this.data= data
        this.message = message
        this.success = statusCode < 400
    }   
}