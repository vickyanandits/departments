const {Department,departmentSchema} = require("../model/department.model");
const mongodb = require("mongodb");
var AppConfigConst = require('../appconfig-const');
const { default: mongoose } = require("mongoose");
const {Employee,employeeSchema}=require("../model/employee.model")
const AppCommonService=require("./appcommon.service")

mongoose.model("employees", employeeSchema);
exports.saveDepartment = async function (department) {
  const currTs = await AppCommonService.getCurrentTimestamp();
  
  let modDepartment = null;
  if (mongodb.ObjectId.isValid(department.id)) {
    try {
      modDepartment = await Department.findById(department.id);
    } catch (err) {
      throw Error("Error occured while Finding the Department");
    }
  }
  if (!modDepartment) {
    modDepartment = new Department();
    modDepartment.createdAt = currTs;
    modDepartment.createdBy = department.createdBy;
  }

  modDepartment.updatedAt = currTs;
  modDepartment.updatedBy = department.updatedBy;

  if (department.departmentName !== undefined)
    modDepartment.departmentName = department.departmentName;

  if (department.description !== undefined)
    modDepartment.description = department.description;

  if (department.isActive !== undefined)
    modDepartment.isActive = department.isActive;

  if (department.isDeleted !== undefined)
    modDepartment.isDeleted = department.isDeleted;

  try {
    var savedDepartment = await modDepartment.save();
    return savedDepartment;
  } catch (e) {
    throw Error("And Error occured while updating the Department " + e);
  }
};

exports.getDepartments = async function (req) {
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
      'departmentName': '$departmentName',
      'departmentNameI': { '$toLower': '$departmentName' },
      'description': '$description',
      'isActive': '$isActive',
      'createdAt': '$createdAt',
      'updatedAt': '$updatedAt',
      'createdBy': '$createdBy',
      'updatedBy': '$updatedBy'
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
      searchKeywordOptions.push({ 'departmentName' : regex });

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
              departmentNameI: sortOrderInt
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
          departmentNameI: sortOrderInt
      };
  }

  try 
  {
      let departments;
      if(forExport === true)
      {
          departments = await Department.aggregate([
                        {
                            $match: fetchOptions // For Fetch
                        }
                  ])
                  .project(projectObj)
                  .sort(sortOptions);
      }
      else
      {
          departments = await Department.aggregate([
                          {
                              $match: fetchOptions // For Fetch
                          }
                  ])
                  .project(projectObj)
                  .sort(sortOptions)
                  .skip(skipVal)
                  .limit(limit);
      }

    //   departments = await Department.find()
    //   .sort(sortOptions)
    //   .skip(skipVal)
    //   .limit(limit);

      let recordCntData =  await Department.aggregate([
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
          results: departments,
          totalRecords: totalRecords,
          filteredRecords: filteredRecords
      };

      return response;

  } 
  catch (e) 
  {
      throw Error('Error while Paginating Department ' + e)
  }
};

exports.findDepartmentById = async function(req, departmentId){
    
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
      _id : departmentId,
      isDeleted : 0
  };

  try {
     var department;
     if(mongodb.ObjectId.isValid(departmentId))
     {
         var department = await Department.findOne(options)
     }
     return department;
  } catch (e) {
      throw Error('Error while Fetching Department' + e)
  }
}

exports.getDepartmentsForSelect = async function(onlyActiveStatus){

  const projectObj = {
      '_id': '$_id',
      'id': '$_id',
      'text': '$departmentName',
      'textI': { '$toLower': '$departmentName' }
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
      var department = await Department.aggregate([ { $match: fetchOptions } ])
                                  .project(projectObj)
                                  .sort(sortOptions);
                              
      
          department.forEach(function(v){
                      delete v.textI;
                      delete v._id;
                  });

      return department;
  } catch (e) {
      throw Error('Error while Paginating Department ' + e)
  }
}


