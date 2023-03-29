const ExcelJS = require('exceljs');

const workbook= new ExcelJS.Workbook();

const createSheet=async(emp)=>{
    try{
        const worksheet= workbook.addWorksheet("employees");
        worksheet.columns=[
            {header:"S_no",key:"S_no",width:10},
            {header:"name",key:"name",width:10},
            {header:"department",key:"department",width:10},
            {header:"isActive",key:"isActive",width:10},
            {header:"isDeleted",key:"isDeleted",width:10}, 
        ]
        let count=1;
       await emp.map((ele)=>{
        const dummy={
            S_no:count,
            name:ele.name,
            department:ele.department.departmentName,
            isActive:ele.isActive,
            isDeleted:ele.isDeleted
        }
            worksheet.addRow(dummy);
         count++;
        })
       workbook.xlsx.writeFile("employees.xlsx").then((data)=>{
       console.log("done")
        })
    }
    catch(err){
        console.log(err.message);
    }
}

module.exports=createSheet;