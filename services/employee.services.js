const { Employee } = require("../model/employee.model");
const mongoose = require("mongoose");
const { Department, departmentSchema } = require("../model/department.model");
mongoose.model("Department", departmentSchema);
const mongodb = require("mongodb");
var AppConfigConst = require('../appconfig-const');
const AppCommonService=require("./appcommon.service")
const port=8080;



exports.saveEmployee = async function (employee,req) {
  const currTs = await AppCommonService.getCurrentTimestamp();
  let modEmployee = null;
  if (mongodb.ObjectId.isValid(employee.id)) {
    try {
      modEmployee = await Employee.findById(employee.id);
    } catch (err) {
      throw Error("Error occured while Finding the Department");
    }
  }
  if (!modEmployee) {
    modEmployee = new Employee();
    modEmployee.createdAt = currTs;
    modEmployee.createdBy = employee.createdBy;
  }

  modEmployee.updatedAt = currTs;
  modEmployee.updatedBy = employee.updatedBy;

  if (employee.name !== undefined)
    modEmployee.name = employee.name;

  if (employee.department !== undefined)
    modEmployee.department = employee.department;

  if (employee.number !== undefined)
    modEmployee.number = employee.number;

  if (employee.isActive !== undefined)
    modEmployee.isActive = employee.isActive;

  if (employee.isDeleted !== undefined)
    modEmployee.isDeleted = employee.isDeleted;

    if (employee.date_of_birth !== undefined)
    modEmployee.date_of_birth = employee.date_of_birth;

  try {
         if(req){modEmployee.profilePicture={
                originalName: req.file.originalname,
                fileType: req.file.mimetype,
                destinationFolder: req.file.destination,
                fileName: req.file.filename,
                path: req.file.path,
                imgurl: `http://localhost:${port}/${req.file.filename}`}}
            resStatus = 1;
            resMsg = "Employee added successfully "
    var savedEmployee = await modEmployee.save();
    console.log(savedEmployee);
    return savedEmployee;
  } catch (e) {
    throw Error("And Error occured while updating the Department " + e);
  }
};

exports.getEmployees= async function(req){
  var filKeyword =  req.body.filKeyword;
  var filCreatedBy = req.body.filCreatedBy;
  var filUpdatedBy = req.body.filUpdatedBy;

  var forExport = req.body.forExport && typeof req.body.forExport === 'boolean' ? req.body.forExport : false;

  var status = req.body.isActive ? req.body.isActive*1 : -1;
  var page = req.body.page ? req.body.page*1 : 1;
  var limit = req.body.length ? req.body.length*1 : 10;
  var searchStr = req.body.searchStr ? req.body.searchStr : '';
  var sortByCol = req.body.sortBy ? req.body.sortBy : 'col1';
  var sortOrder = req.body.sortOrder ? req.body.sortOrder : 'asc';

  var skipVal = req.body.start ? req.body.start*1 : 0;

  if(page && page > 0)
  {
    skipVal = (page - 1) * limit;
  }
  // Options setup for the mongoose paginate
  const populateOptions = [
      {
          path : 'createdBy',
          select : 'userFullName'
      },
      {
          path : 'updatedBy',
          select : 'userFullName'
      }
  ];

  const projectObj = {
      '_id': '$_id',
      'name': '$name',
      'nameI': { '$toLower': '$name' },
      'department': '$department',
      'phone':"$phone",
      'date_of_birth':'$date_of_birth',
      'isActive': '$isActive',
      'createdAt': '$createdAt',
      'updatedAt': '$updatedAt',
      'createdBy': '$createdBy',
      'updatedBy': '$updatedBy',
      'profilePicture':'$profilePicture'
  };

  let fetchOptions = {};
  fetchOptions.isDeleted =  0;

 
  if(mongodb.ObjectId.isValid(filCreatedBy)) {
      fetchOptions['createdBy'] = new mongoose.Types.ObjectId(filCreatedBy);
  }

  if(filUpdatedBy != undefined && filUpdatedBy != null)
  {
      if(mongodb.ObjectId.isValid(filUpdatedBy)) {
          fetchOptions.updatedBy = new mongoose.Types.ObjectId(filUpdatedBy);
      }
  }
  
  if(filKeyword && filKeyword !== undefined && filKeyword !== '')
  {
      searchStr = filKeyword;
  }

  if(searchStr && searchStr !== "")
  {
      var regex = new RegExp(searchStr, "i");

      let searchKeywordOptions = [];
      searchKeywordOptions.push({ 'name' : regex });

      let allOtherFetchOptions = [];
      Object.keys(fetchOptions).forEach(function(k){
          allOtherFetchOptions.push({ [k] :fetchOptions[k] });
      });
      allOtherFetchOptions.push({ '$or' : searchKeywordOptions });

      let complexFetchOptions = {
        '$and' : allOtherFetchOptions
      };

      fetchOptions = complexFetchOptions;
  }

  let sortOrderInt = 1;
  if(sortOrder && sortOrder === "asc") {
    sortOrderInt = 1;
  } else if(sortOrder && sortOrder === "desc") {
    sortOrderInt = -1;
  }

  let sortOptions;
  if(sortByCol && typeof sortByCol === 'string') {

      if(sortByCol == 'col1') {
          sortOptions = {
              nameI: sortOrderInt
          };
      }
      else if(sortByCol == 'col2') {
          sortOptions = {
              createdAt: sortOrderInt
          };
      }
      else if(sortByCol == 'col3') {
          sortOptions = {
              updatedAt: sortOrderInt
          };
      }
      else if(sortByCol == AppConfigConst.MAT_COLUMN_NAME_STATUS) {
          sortOptions = {
              isActive: sortOrderInt
          };
      }
  }
  else {
      sortOptions = {
          nameI: sortOrderInt
      };
  }

  try 
  {
      let employees;
      if(forExport === true)
      {
          employees = await Employee.aggregate([
                        {
                            $match: fetchOptions // For Fetch
                        }
                  ])
                  .project(projectObj)
                 
      }
      else
      {
          employees = await Employee.aggregate([
                          {
                              $match: fetchOptions // For Fetch
                          }
                  ])
                  .project(projectObj)
                 
                  .skip(skipVal)
                  .limit(limit);
      }

    //   departments = await Department.find()
    //   .sort(sortOptions)
    //   .skip(skipVal)
    //   .limit(limit);

      let recordCntData =  await Employee.aggregate([
                                          {
                                              $match: fetchOptions
                                          },
                                          {
                                              $group: { _id: null, count: { $sum: 1 } }
                                          }
                                  ]);

      let totalRecords = 0;

      if(recordCntData && recordCntData[0] && recordCntData[0].count) {
          totalRecords = recordCntData[0].count;
      }

      let filteredRecords = totalRecords;

      let response = {
          results: employees,
          totalRecords: totalRecords,
          filteredRecords: filteredRecords
      };
      return response;

  } 
  catch (e) 
  {
      throw Error('Error while Paginating Department ' + e)
  }
}

exports.findEmployeeById = async function(req, employeeId){
    
  const populateOptions = [
     {
         path : 'createdBy',
         select : 'userFullName'
     },
     {
         path : 'updatedBy',
         select : 'userFullName'
     }
   ];
 
  var options = {
      _id : employeeId,
      isDeleted : 0
  };

  try {
     var employee;
     if(mongodb.ObjectId.isValid(employeeId))
     {
         var employee = await Employee.findOne(options)
     }
     return employee;
  } catch (e) {
      throw Error('Error while Fetching Department' + e)
  }
}

exports.getEmployeeForSelect = async function(onlyActiveStatus){

  const projectObj = {
      '_id': '$_id',
      'id': '$_id',
      'text': '$name',
      'textI': { '$toLower': '$name' }
  };

  const sortOptions = {};
  sortOptions.textI = 1;

  let fetchOptions = {};
  fetchOptions.isDeleted =  0;
  if(onlyActiveStatus && onlyActiveStatus == 1)
  {
      fetchOptions.isActive =  1;
  }

  try {
      var employee = await Employee.aggregate([ { $match: fetchOptions } ])
                                  .project(projectObj)
                                  .sort(sortOptions);
                              
      
          employee.forEach(function(v){
                      delete v.textI;
                      delete v._id;
                  });

      return employee;
  } catch (e) {
      throw Error('Error while Paginating Employee ' + e)
  }
}

exports.getEmployeesPDF= async function(){
  let data= await Employee.find().populate("department");
  return data;
}



