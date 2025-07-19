
const asynchandler=require("express-async-handler")
const U_model=require("../models/usermodel")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
//@ to register user
//@ api/user/register
//@ Type: POST
const register=asynchandler(async(req,res)=>{
    const {username,email,password}=req.body
    if(!username || !email || !password){
        res.status(404)
        throw new Error("Please fill all mandatory fields")
    }
    const user_available=await U_model.findOne({email:email})
    if(user_available){
        res.status(404)
        throw new Error("Email already in use")
    }
    const Hashed_pass=await bcrypt.hash(password,10)

    const user=await U_model.create({
        username,
        email,
        password:Hashed_pass
       })
     if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email
        });
    } else {
        res.status(500);
        throw new Error("Failed to create user");
    }
    
}) 

//@ to login user
//@ api/user/login
//@ Type: POST
const login=asynchandler(async(req,res)=>{
    const{email,password}=req.body
    if(!email || !password){
        res.send("All fields are mandatory")
    }
    const user=await U_model.findOne({email:email})
    if(user && await bcrypt.compare(password,user.password)){
   const accessToken=jwt.sign({
    user:{
        username:user.username,
        email:user.email,
        id:user.id
    },
   },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn:"10m"}
    )
    res.status(200).json(accessToken)
    }
    else{
        res.status(401)
        throw new Error("email or password is invalid")
    }
}) 

//@ to get current user contacts
//@ api/user/current
//@ Type: GET
const current=asynchandler(async(req,res)=>{
    res.send("Hello")
}) 







module.exports={register,login,current}