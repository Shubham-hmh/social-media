const cloudinary =require("cloudinary");
const multer = require('multer');
const path =require("path");
require("dotenv").config();




const cloudinaryUploadImg =async (fileToUploads)=>{

    return new Promise((resolve)=>{
        cloudinary.uploader.upload(fileToUploads,(result)=>{
            resolve(
                {
                url:result.secure_url
            },
            {
                resource_type:"auto"
            }
            )
        })
    })
};







cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.SECRET_KEY


});


const multerStorage =multer.diskStorage({
    destination:function(req,file,cb){
     cb(null,path.join(__dirname,"../public/images"))
    },
    filename:function(req,file,cb){
        const uniqueSuffix =Date.now()+"-"+Math.round(Math.random()*1e9);
        cb(null,file.fieldname+"-"+uniqueSuffix+".jpeg");


    }
});

const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }
    else{
        cb({
            message:"Unsupported File format"
        },false)
    }
}


const uploadPhoto =multer({
    storage:multerStorage,
    fileFilter:multerFilter,
    limits:{fieldSize:2000000}
});


module.exports ={uploadPhoto ,cloudinaryUploadImg}
