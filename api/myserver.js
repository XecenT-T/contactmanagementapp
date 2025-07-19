const cors=require("cors")
const dotenv=require("dotenv").config()
const express=require("express")
const app=express()
const dbm = require("./config/dbconnection")
app.use(cors())
dbm();
const path = require('path');

app.use(express.static(path.join(__dirname, 'build')));


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.use(express.json())
app.use("/api/contacts",require("./routes/contactroutes"))
app.use("/api/users",require("./routes/userroutes"))
app.use(require("./middleware/errorhandler"))

const port=process.env.PORT || 3001
app.listen(port,()=>{

})