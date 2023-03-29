const express = require("express");

const router = express.Router();
const DepartmentController = require("../controller/department.controller");

//route to save a doc to the departments collection
router.route("/").post(DepartmentController.saveDepartment);

//table route to see all the table data depending upon the payload sent in the body
router.route("/table").post(DepartmentController.getDepartments);

//route to update the isActive field in the document
router.route("/").patch(DepartmentController.changeDepartmentStatus);

//route to delete a data by _id
router.route("/:id").delete(DepartmentController.removeDepartment);

//route for all the acive users
router.route("/selectlist").post(DepartmentController.selectDepartmentList);

//route to check for delete
router.route("/checkfordelete").post(DepartmentController.checkCanBeDeleted);

//details route to see details of a particular _id data
router.route("/details").post(DepartmentController.getDepartmentDetails);

//route to validate department name
router
  .route("checkdepartmentname")
  .post(DepartmentController.postcheckdepartmentname);

//home route to see all the data present in the collection departments
router.route("/").get(DepartmentController.gethomepagedata);

module.exports = router;
