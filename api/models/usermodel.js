const mongoose=require("mongoose")

const Userschema= mongoose.Schema({
    
    username:{
        type:String,
        required:[true,"Please enter the name"],
        unique:[true,"Username already taken!"]
    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
        unique:[true,"Email already taken!"]

    },
    password:{
        type:String,
        required:[true,"Please enter your password"]
    },



},
{
    timestamps:true,
}
)

module.exports=mongoose.model("User",Userschema)