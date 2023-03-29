const {mongoose}=require("mongoose")

const employeeSchema = mongoose.Schema({
  name: String,
  phone: Number,
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  date_of_birth: Date,
  profilePicture: {
    originalName: String,
    fileType: String,
    destinationFolder: String,
    fileName: String,
    path: String,
    imgurl: String,
  },
  isActive: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: String,
  },
  createdBy: {
    type:mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  updatedAt: {
    type: String,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  isDeleted: {
    type: Number,
    default: 0,
  },
});
  const Employee = mongoose.model("employees", employeeSchema);
//   mongoose.model("employee", employeesSchema);
  module.exports= {Employee,employeeSchema};