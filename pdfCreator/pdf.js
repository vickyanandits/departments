var fonts = {
  'Roboto' : {
     normal: 'Times-Roman',
     bold: 'Times-Roman',
     italics: 'Times-Roman',
     bolditalics: 'Times-Roman'
  }

}

var PdfPrinter = require('pdfmake');
var printer = new PdfPrinter(fonts);
var fs = require('fs');

// reading parameters from the command line
var params = process.argv;
var data = [];
data["invoicenumber"] = params[2];
data["buyeraddress"] = params[3]
data["item"] = params[4];
data["price"] = params[5];


var docDefinition = {
  content: [
    {
      layout: 'lightHorizontalLines',
      table: {
        headerRows: 1,
        widths: [ '*', 'auto', 100, '*' ],

        body: [
          [ 'Name', 'Department', 'Active', 'Deleted' ],
        ]
      }
    }
  ]
};



const action=async(d)=>{
  try{
    d.map(async(ele)=>docDefinition.content[0].table.body.push(ele));
    var pdfDoc =await printer.createPdfKitDocument(docDefinition, options);
    pdfDoc.pipe(fs.createWriteStream('employees.pdf'));
    pdfDoc.end();
  }
  catch(e){
    console.log(e.message);
  }
}

module.exports=action;