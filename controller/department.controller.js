const {Department} = require("../model/department.model");
const {mongoose}=require("mongoose")
const DepartmentService = require("../services/department.services");
const { Timestamp } = require("mongodb");
var AppConfigNotif = require("../appconfig-notif");
var AppConfigConst = require("../appconfig-const");
var AppCommonService = require('../services/appcommon.service')

exports.saveDepartment = async function (req, res) {
  var departmentId = req.body.id;
  var departmentName = req.body.department;
  var description = req.body.description;

  if (!departmentId) departmentId = "";

  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};
  var systemUser = "Employee";
  var systemUserId = "6417fed9c2ced3fb668860e5";

  if (!systemUser) {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_USER;
  } else if (departmentName !== undefined && departmentName !== "") {
    var hasAddRights = true;
    var hasEditRights = true;
    if (
      (departmentId == "" && !hasAddRights) ||
      (departmentId != "" && !hasEditRights)
    ) {
      resStatus = -1;
      resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
    } else {
      try {
        // await AppCommonService.setSystemUserAppAccessed(req);

        var department = {
          departmentName: departmentName,
          description: description,
          updatedBy: systemUserId,
        };

        if (departmentId == "") {
          department.createdBy = systemUserId;
          department.isDeleted = 0;
        } else {
          department.id = departmentId;
        }

        let savedDepartment = await DepartmentService.saveDepartment(
          department
        );

        if (savedDepartment) {
          responseObj.savedDepartmentId = savedDepartment._id;
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
};

exports.changeDepartmentStatus = async function (req, res) {
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

        var department = {
          id,
          isActive: isActive,
          updatedBy: systemUserId,
        };

        await DepartmentService.saveDepartment(department);

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
};

exports.getDepartments = async function (req, res) {
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
        let departmentsList = await DepartmentService.getDepartments(req);

        resStatus = 1;
        if (departmentsList != null) {
          departmentData = departmentsList.results;
          totalRecords = departmentsList.totalRecords;
          filteredRecords = departmentsList.filteredRecords;
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
  responseObj.data = departmentData;

  return res.status(httpStatus).json(responseObj);
  //   try {
  //     const body = await req.body;
  //     console.log(body);
  //     const count = await DepartmentService.countit();
  //     //const data=await paginate(body.page,body.length,body.searchstr,body.sortBy);
  //     let x;

  //     const data = await DepartmentService.aggregate(
  //       body.page,
  //       body.length,
  //       body.searchstr,
  //       body.sortBy
  //     );
  //     const response = await {
  //       status: "status",
  //       message: "message",
  //       data: data.a,
  //       recordsFiltered: data.b,
  //       recordsTotal: count,
  //     };
  //     await res.end(JSON.stringify(response));
  //   } catch (err) {
  //     console.log(err.message);
  //     res.end(err.message);
  //   }
};

exports.checkCanBeDeleted = async function (req, res) {
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
          resMsg = "This Department is associated with super user";
        } else {
          resStatus = 1;
          resMsg="This department can be deleted"
        }
      } catch (e) {
        resStatus = -1;
        resMsg = "Department Status Change Unsuccesful" + e;
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
};

exports.removeDepartment = async function (req, res) {
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
            var department = {
              id,
              isDeleted: 1,
              updatedBy: systemUserId,
            };

           await DepartmentService.saveDepartment(
              department
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
        resMsg = "Department Deletion Unsuccesful" + e;
      }
    }
  } else {
    resStatus = -1;
    resMsg = AppConfigNotif.INVALID_DATA;
  }

  return res.end(JSON.stringify({ status: resStatus, message: resMsg }))
};

exports.getDepartmentDetails = async function (req, res) {
  var id = req.body._id;

    var resStatus = 0;
    var resMsg = "";
    var httpStatus = 201;
    var responseObj = {};

    var systemUser = "Employee";
    var systemUserId = "64182d7e6713b2b316538c58";

    if(!systemUser)
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_USER;
    }
    else if(id && id != "")
    {
        var hasRights =true;
        if(!hasRights)
        {
            resStatus = -1;
            resMsg = AppConfigNotif.ACTION_PERMISSION_DENIED;
        }
        else
        {
            try
            {
                // await AppCommonService.setSystemUserAppAccessed(req);
                var fetchedDepartment = await DepartmentService.findDepartmentById(req, id);
                if(fetchedDepartment)
                {
                    resStatus = 1;
                    responseObj.department = fetchedDepartment;
                }
                else
                {
                    resStatus = -1;
                    resMsg = "Department Retrieval Unsuccesful ";
                }
            }
            catch(e)
            {
                resStatus = -1;
                resMsg = "Department Retrieval Unsuccesful " + e;
            }
        }
    }
    else
    {
        resStatus = -1;
        resMsg = AppConfigNotif.INVALID_DATA;
    }

  responseObj.status = resStatus;
  responseObj.message = resMsg;

  return res.status(httpStatus).json(responseObj);
};

exports.selectDepartmentList = async function (req, res) {
  var resStatus = 0;
  var resMsg = "";
  var httpStatus = 201;
  var responseObj = {};

  var onlyActiveStatus = req.body.onlyActive ? req.body.onlyActive*1 : 1;
  var forFilter = req.body.forFilter ? req.body.forFilter && typeof req.body.forFilter === 'boolean' : false;

  let totalRecords = 0;
  let departmentData = [];

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

          let departmentList = await DepartmentService.getDepartmentsForSelect(onlyActiveStatus);

          resStatus = 1;
          if(departmentList != null)
          {
              totalRecords = departmentList.length;
              departmentData = departmentList;

              if(forFilter) {
                  let departmentObj = {};
                  departmentObj.id = "";
                  departmentObj.text = "All Departments";

                  departmentData.unshift(departmentObj);
                }
          }
      }
      catch(e)
      {
          resStatus = -1;
          resMsg = "Departments could not be fetched" + e;
      }
  }

  responseObj.status = resStatus;
  responseObj.message = resMsg;
  responseObj.total_count = totalRecords;
  responseObj.results = departmentData;

  return res.status(httpStatus).json(responseObj)
};

exports.postcheckdepartmentname = async function (req, res) {
  try {
    const body = req.body;
    console.log(body);
    res.end("validating department name");
  } catch (err) {
    res.end(err);
  }
};

exports.gethomepagedata = async function (req, res) {
  try {
    let data = await Department.find();
    res.end(JSON.stringify(data));
  } catch (err) {
    console.log(err);
    res.end(err);
  }
};
