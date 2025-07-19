const express=require("express");
const router=express.Router();
const {getall_cont,createnew_cont,geta_cont,update_cont,delete_cont}=require("../controller/controllers");
const tokenvalidation = require("../middleware/validatetoken");

router.use(tokenvalidation)

router.route("/")
.get(getall_cont)
.post(createnew_cont)

router.route("/:name")
.get(geta_cont)
.put(update_cont)
.delete(delete_cont)


module.exports=router;