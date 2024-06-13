const mongoose =require("mongoose");

const validateMongoDbId =(id)=>{
    const isValid=mongoose.Types.ObjectId.isValid(id);
    if(!isValid){
        throw new Error("This is id not found or not valid !");
    }
}

module.exports=validateMongoDbId;