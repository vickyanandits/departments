const {mongoose}=require("mongoose")
var mongoosePaginate = require('mongoose-paginate')
const departmentSchema = new mongoose.Schema({
    departmentName:  { type : String, required : true },
    description: String,
    isActive: { 
        type: Number,
        default: 1
    },
    createdAt: { 
        type: String
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'employees'
    },
    updatedAt: { 
        type: String
    },
    updatedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'employees'
    },
    isDeleted: { 
        type: Number,
        default: 0
    }
})

departmentSchema.plugin(mongoosePaginate)
const Department = mongoose.model("departments", departmentSchema);


module.exports={Department,departmentSchema}