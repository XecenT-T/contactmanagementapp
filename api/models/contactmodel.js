const mongoose=require("mongoose")

const mongooseschema= mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User",
    },
    name:{
        type:String,
        required:[true,"Please enter the name"]
    },
    phone:{
        type:String,
        require:[true,"Please enter the phone number"]
    }
})

module.exports=mongoose.model("Contact",mongooseschema)