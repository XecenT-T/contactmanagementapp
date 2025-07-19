const express=require("express")
const router=express.Router();

const {register,login,current}=require("../controller/usercontroller")

const validate=require("../middleware/validatetoken")

router.route("/register").
post(register)

router.route("/login").
post(login)

router.route("/current").
get(validate,current)




module.exports=router
