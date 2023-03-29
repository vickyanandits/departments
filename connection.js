const mongoose = require("mongoose");
const connection=mongoose.connect("mongodb://127.0.0.1:27017/itechnosol").then(()=>console.log("The connection to the mongo database has been established successfully"))
module.exports={connection}

