const{connection}=require("./connection");
const { StringDecoder } = require('node:string_decoder');
const express=require("express");
const router =require("./routes/admin.route")
const cors=require("cors");
const multer = require("multer");
const router2=require("./routes/employee.route")
const path = require("path");
const upload = multer({ dest: "uploads/" });
const app=express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./uploads"));
app.set("view engine", "ejs");
app.use(cors({
  origin:'http://localhost:3000'
}))

app.use("/",router)
app.use("/employees", router2);


app.listen("8080",async()=>{
    try{
      await connection;
       console.log("server running on port 8080");
    }
    catch(err){
      console.log(err);
    }
})
const decoder = new StringDecoder('utf8');
