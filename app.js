/// 
/// File:				  app.js
/// 
/// System:		    Rapid Sheet Data (RSD) service
/// Version:			1.0.0
/// 
/// Language:		  JavaScript (Node.js)
/// 
/// License:			
/// 
/// Author:			  Tasos Giannakopoulos (tasosg@voidinspace.com)
/// Date:				  07 Mar 2017
/// 
/// Description:  
/// 


var express = require('express');
var rsdModule = require('./rsdModule');
var app = express();


// Configure express
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));


/**
 * Handles 'getSheets' requests
 * format: /getSheets?spreadsheetId=spreadsheet_id&requestData=sheet0:Row,sheet1:Column
 */
app.get('/getSheets', function (req, res) {
  var spreadsheetId = req.query.spreadsheetId;
  var requestData = req.query.requestData;

  if(rsdModule.getSheetsAsJson(spreadsheetId, requestData, 
    function(success, data) {
      if(success){
        res.send(data); 
      } else {
        if(data.code && data.errors && (data.errors.length > 0)) {
          res.status(data.code).send(data.errors[0].message);
        } else {
          res.status(400).send(data);
        }
      }
    }));
});

/**
 * 
 */
app.listen(app.get('port'), function() {
  console.log('Rapid Sheet Data service is running on port ', app.get('port'));
});