const multer= require("multer");
const uploader=multer({
    storage:multer.diskStorage({
        destination:function(req,file,cb){
            cb(null,"uploads")
        },
        filename(req,file,cb){
            cb(null,file.fieldname+Date.now()+".jpg")
        }
    })
  }).single("user");

  module.exports={uploader};