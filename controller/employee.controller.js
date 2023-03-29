const EmployeeServices = require("../services/employee.services");
var fileSave = require('file-save');
const { Employee } = require("../model/employee.model");
const path= require("path");
const fs=require('fs');
const http=require("http");
const port = 8080;
const DepartmentService = require("../services/department.services");
const { Timestamp } = require("mongodb");
var AppConfigNotif = require("../appconfig-notif");
var AppConfigConst = require("../appconfig-const");
var AppCommonService = require('../services/appcommon.service');
var action = require("../pdfCreator/pdf");
const { resolve } = require("path");
const createSheet = require("../excelCreator/excel");

exports.saveEmployee= async function(req,res){
  var employeeId = req.body.id;
  var employeeName = req.body.name;
  var employeePhone = req.body.number;
  var employeeDateOfBirth= req.body.dob;
  var employeeDepartment=req.body.department;

  if (!employeeId) employeeId = "";

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};
  var systemUser = "Employee";
  var systemUserId = "6417fed9c2ced3fb668860e5";

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (employeeName !== undefined && employeeName !== "") {
    var hasAddRights = true;
    var hasEditRights = true;
    if (
      (employeeId == "" && !hasAddRights) ||
      (employeeId != "" && !hasEditRights)
    ) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        // await AppCommonService.setSystemUserAppAccessed(req);

        var employee = {
          name: employeeName,
          phone: employeePhone,
          updatedBy: systemUserId,
          date_of_birth:employeeDateOfBirth,
          department:employeeDepartment
        };

        if (employeeId == "") {
          employee.createdBy = systemUserId;
          employee.isDeleted = 0;
        } else {
          employee.id = employeeId;
        }

        let savedEmployee = await EmployeeServices.saveEmployee(
          employee,req
        );

        if (savedEmployee) {
          responseObj.savedEmployeeId = savedEmployee._id;
          resStatus = 1;
          resMsg = "AppCommonService.getSavedMessage(thisModulename)";
        } else {
          resStatus = -1;
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "Department Retrieval Unsuccesful " + e;
      }
    }
  } else {
    resStatus = -1;
    resMsg = "AppConfigNotif.INVALID_DATA";
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
}

exports.changeEmployeeStatus = async function (req, res) {
  var id = req.body._id;
  
  var isActive = req.body.isActive;
  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;

  var systemUser = "Employee";
  var systemUserId = "64182d7e6713b2b316538c58";

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (id != "") {
    var hasRights = true;
    if (!hasRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        // await AppCommonService.setSystemUserAppAccessed(req);

        var employee = {
          id,
          isActive: isActive,
          updatedBy: systemUserId,
        };

        await EmployeeServices.saveEmployee(employee);

        resStatus = 1;
        resMsg = "AppCommonService.getStatusChangedMessage()";
      } catch (e) {
        resStatus = -1;
        resMsg = "Department Status Change Unsuccesful" + e;
      }
    }
  } else {
    resStatus = -1;
    resMsg = "Invalid Data";
  }

  return res.status(httpStatus).json({ status: resStatus, message: resMsg });
}

exports.getEmployees= async function(req,res){
  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  let totalRecords = 0;
  let filteredRecords = 0;
  let departmentData = [];

  var systemUser = "Employee";
  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else {
    var hasRights = true;
    if (!hasRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        let employeesList = await EmployeeServices.getEmployees(req);
        resStatus = 1;
        if (employeesList != null) {
          employeeData = employeesList.results;
          totalRecords = employeesList.totalRecords;
          filteredRecords = employeesList.filteredRecords;
        }
      } catch (err) {
        resStatus = -1;
        resMsg = "DepartmentsList could not be fetched" + err;
      }
    }
  }
  responseObj.status = resStatus;
  responseObj.message = resMsg;
  responseObj.draw = 0;
  responseObj.recordsTotal = totalRecords;
  responseObj.recordsFiltered = filteredRecords;
  responseObj.data = employeeData;

  return res.status(httpStatus).json(responseObj);

}

exports.removeEmployee =async function(req, res) {
  var id = req.params.id;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;

  var systemUser = "Employee";
  var systemUserId = "64182d7e6713b2b316538c58";

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (id != "") {
    var hasRights = true;
    if (!hasRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        // await AppCommonService.setSystemUserAppAccessed(req);

        const compiledReq =
          AppCommonService.compileRequestWithSkipSendResponse(req);
        compiledReq.body._id = id;
        const canBeDeletedResponse = await exports.checkCanBeDeleted(
          compiledReq,
          res
        );
        if (canBeDeletedResponse) {
          if (true) {
            var employee = {
              id,
              isDeleted: 1,
              updatedBy: systemUserId,
            };

           await EmployeeServices.saveEmployee(
              employee
            );

            resStatus = 1;
            resMsg = "AppCommonService.getDeletedMessage(thisModulename)";
          } else {
            resStatus = canBeDeletedResponse.status;
            resMsg = canBeDeletedResponse.message;
          }
        } else {
          resStatus = -1;
          resMsg = AppConfigNotif.SERVER_ERROR;
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "Employee Deletion Unsuccesful" + e;
      }
    }
  } else {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_DATA;
  }

  return res.end(JSON.stringify({ status: resStatus, message: resMsg }))
}

exports.checkCanBeDeleted = async function(req, res) {
  var id = req.body._id;

   var skipSend = true;

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var systemUser = "Employee";
  var systemUserId = "64182d7e6713b2b316538c58";
  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (id && id != "") {
    var hasRights = true;
    if (!hasRights) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        // await AppCommonService.setSystemUserAppAccessed(req);

        let systemUser = false;
        if (systemUser) {
          resStatus = -1;
          resMsg = "This Employee is associated with super user";
        } else {
          resStatus = 1;
          resMsg="This Employee can be deleted"
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "Employee Status Change Unsuccesful" + e;
      }
    }
  } else {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_DATA;
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  if (skipSend === true) {
    return res.status(httpStatus).json(responseObj);
  } else {
    return res.status(httpStatus).json(responseObj);
  }
}

exports.selectEmployeeList = async function (req, res) {
  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var onlyActiveStatus = req.body.onlyActive ? req.body.onlyActive*1 : 1;
  var forFilter = req.body.forFilter ? req.body.forFilter && typeof req.body.forFilter === 'boolean' : false;

  let totalRecords = 0;
  let employeeData = [];

  var systemUser = "Employee";
  var systemUserId = "64182d7e6713b2b316538c58";
  if(!systemUser)
  {
      resStatus = -1;
      resMsg = AppConfigNotif.INVALID_USER;
  }
  else
  {
      try
      {

          // await AppCommonService.setSystemUserAppAccessed(req);

          let employeeList = await EmployeeServices.getEmployeeForSelect(onlyActiveStatus);

          resStatus = 1;
          if(employeeList != null)
          {
              totalRecords = employeeList.length;
              employeeData = employeeList;

              if(forFilter) {
                  let employeeObj = {};
                  employeeObj.id = "";
                  employeeObj.text = "All Employees";

                  employeeData.unshift(employeeObj);
                }
          }
      }
      catch(e)
      {
          resStatus = -1;
          resMsg = "Employees could not be fetched" + e;
      }
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;
  responseObj.total_count = totalRecords;
  responseObj.results = employeeData;

  return res.status(httpStatus).json(responseObj)
}

exports.getEmployeesPDF= async function(req,res){
  try{
    const url=path.resolve("./employees.pdf")
    const data= await EmployeeServices.getEmployeesPDF();
    let desiredArray=[];
    await data.map((ele)=>{
      let desiredData=[ele.name,ele.department.departmentName,ele.isActive,ele.isDeleted]
      array.push(desiredData);
    })
    await action(desiredArray);
var file = fs.createReadStream(url);
var stat = fs.statSync(url);
res.setHeader('Content-Length', stat.size);
res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', 'attachment; filename=employees.pdf');
file.pipe(res);
    
  }
  catch(e){
console.log(e.message)
  }
}

exports.clientPDF= async function(req,res){
  try
  {
    const url=path.resolve("./employees.pdf")
    var file = fs.createReadStream(url);
    var stat = fs.statSync(url);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=employees.pdf');
    file.pipe(res);
  }
  catch(e){
    console.log(e.message);
  }
}

exports.createExcelSheet= async function(req,res){
  const employeeData= await EmployeeServices.getEmployeesPDF();
  createSheet(employeeData);
  const readStream= fs.createReadStream("./employees.xlsx")
  //console.log(readStream)
   readStream.pipe(res);
}

exports.streamVideo= async function(req,res){
 res.setHeader('Content-Type', 'video/mp4');
 const readStream= fs.createReadStream("./video.mp4");
 const writeStream= fs.createWriteStream("./streamStorage.jpg");
 readStream.pipe(res);
// var range= req.headers.range;

// if(!range){range = 'bytes=0-'}

// const videoPath="video.mp4"
// const videoSize=fs.statSync(videoPath).size;
// const chunk_size= 10**6;
// const start= Number(range.replace(/\D/g,""));
// const End= Math.min(start+ chunk_size,videoSize-1)
// const contentLength= End-start+1;
// const headers={
//   "Content-Range":`bytes ${start}-${End}/${videoSize}`,
//   "Accept-Ranges":"bytes",
//   "Content-Length":contentLength,
//   "Content-Type":"video/mp4"
// }
// res.writeHead(206,headers);
// const videoStream= fs.createReadStream(videoPath,{start,End});
// videoStream.pipe(res)
// res.end("streaming")
}