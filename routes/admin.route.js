var express = require('express')

var router = express.Router()

var departmentRoute = require("./department.routes")
var employeeRoute =require("./employee.route")

router.use('/departments', departmentRoute);
router.use("/employees",employeeRoute)
module.exports = router;