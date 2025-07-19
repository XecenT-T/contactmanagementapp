const asynchandler=require("express-async-handler")
const model=require("../models/contactmodel")
//@ to get all contacts
//@ api/contacts
//@ Type: GET
const getall_cont=  asynchandler(async(req,res)=>{
    const contacts=await model.find({ user_id: req.user.id });
    res.json(contacts);
})

//@ to create new contact
//@ api/contacts
//@ Type: POST
const createnew_cont=asynchandler(async(req,res)=>{
    console.log(req.body)
    const{name,phone}=req.body
    if(!name || !phone){
        res.status(400)
        throw new Error("All fields are mandatory")
    }
    if(await model.findOne({name:name,user_id: req.user.id})){
        res.status(409)
        throw new Error("A contact with this name already exist")
    }
    const contacts= await model.create({
        user_id: req.user.id,
        name,phone
    })
    res.status(201).json(contacts);
})
//@ to get a contact
//@ api/contacts
//@ Type: GET
const geta_cont=asynchandler(async(req,res)=>{
    const contact=await model.findOne({name:req.params.name, user_id: req.user.id})
    if(!contact){
        res.status(404)
        throw new Error("Not found")
        
    }
    res.status(200).json(contact);
})
//@ to update a contact
//@ api/contacts/:id
//@ Type: PUT
const update_cont=asynchandler(async(req,res)=>{
    const contact=await model.findOne({name:req.params.name,user_id: req.user.id})
    if(!contact){
        res.status(404)
        throw new Error("Not found")
        
    }
    const updated=await model.findOneAndUpdate(
        {name:req.params.name,user_id: req.user.id},
        req.body,
        {new:true}
    )
    res.status(200).json(updated);
})

//@ to delete a contact
//@ api/contacts/:id
//@ Type: DELETE
const delete_cont=asynchandler(async(req,res)=>{
    const contact=await model.findOne({name:req.params.name,user_id: req.user.id})
    if(!contact){
        res.status(404)
        throw new Error("Not found")
        
    }
    await contact.deleteOne()
    res.status(200).json({ message: "deleted" });
})

module.exports={getall_cont,createnew_cont,geta_cont,update_cont,delete_cont}