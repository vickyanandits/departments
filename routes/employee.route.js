const express = require("express");
const router = express.Router();
const employeeController = require("../controller/employee.controller");
const port = 8080;
const {EmployeesModel } = require("../model/employee.model");
const { uploader } = require("../multer");

router.post("/", uploader,employeeController.saveEmployee);
router.route("/table").post(employeeController.getEmployees);
router.patch("/",employeeController.changeEmployeeStatus);
router.delete("/:id",employeeController.removeEmployee);
router.route("/checkfordelete").post(employeeController.checkCanBeDeleted);
router.get("/getEmployeesPDF",employeeController.getEmployeesPDF);
router.get("/clientPDF",employeeController.clientPDF);
router.get("/createExcelSheet",employeeController.createExcelSheet);
router.get("/videoStream", employeeController.streamVideo);

router.get("/ejs", async (req, res) => {
  const data = await EmployeesModel.find();
  res.render("app.ejs", { data: data });
});


module.exports =  router ;
