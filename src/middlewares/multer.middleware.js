import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp") // file will be saved in given file path , cb= callback
    },
    filename: function (req, file, cb) {
        // setting the name of the file
     // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      //cb(null, file.fieldname + '-' + uniqueSuffix)
      cb(null,file.originalname)
    }
  })
  
export  const upload = multer({ storage ,}) // will be uploaded in disk storage

// any file which user upload will be first uploaded to local then cloudinary 
//we can also directly upload to cloudinary 

/* if we want to use this middle ware anywhere use
  like this app.post("/profile",upload,function(req,res,next){
    .....
  })
 */

