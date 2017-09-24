/// 
/// File:				  rsdModule.js
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


var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');


// https://github.com/google/google-api-nodejs-client/
// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-rsdAuth.json';
var CLIENT_SECRET = 'Rapid Sheet Data Service-be67afaae764.json';   // filename eg.: "rsd_example_secret.json"


// 
// Public API
// 

var exports = module.exports = {};

/**
 * getSheetsAsJson(spreadsheetId, sheetName, callback)
 * Returns sheet data from the target spreadsheet as JSON
 */
exports.getSheetsAsJson = function (spreadsheetId, requestData, callback) {

  console.log("[rsdModule] getSheetsAsJson : spreadsheet id = '%s', sheets = '%s', dimension = '%s'", 
    spreadsheetId, requestData);

    //
    authorize(CLIENT_SECRET, function(authClient) {
      var data = { };
      var requests = createRequests(authClient, spreadsheetId, requestData); // 0: ROWS, 1: COLUMNS
      var sheetsApi = google.sheets('v4');

      // Sends a request to Google sheets and removes it from the queue
      var executeRequest = function() {
        if(requests.length > 0) {
          sheetsApi.spreadsheets.values.batchGet(requests[requests.length - 1], processResponse);
          requests.pop();
        } else {
          callback(true, JSON.stringify(data));
        }
      };

      // Processes a Google sheet response
      var processResponse = function(err, response) {
        // Handle error(s)
        if (err) {
          console.log("[rsdModule] processResponse : The API returned an error: '%s'", err);
          callback(false, err);
          return;
        }

        // Add sheet(s) to data
        for(var i = 0; i < response.valueRanges.length; ++i) {
          var sheetName = response.valueRanges[i].range.match(/(?:'[^']*'|^[^']*$)/)[0].replace(/'/g, "");
          data[sheetName] = parseRowsToList(response.valueRanges[i].values);
        }

        executeRequest();
      };

      executeRequest();
    });
};


// 
// Private
// 

/**
 * Creates batchGet requests for Rows and Columns using the passed requestData array
 * requestData always has the format sheet_name:DIMENSION,
 * @param {*} authClient 
 * @param {*} spreadsheetId 
 * @param {*} sheets
 */
function createRequests(authClient, spreadsheetId, requestData) {
  var requests = []; // 0: ROWS, 1: COLUMNS
  var getSheetsRowMajor = [];
  var getSheetsColumnMajor = [];

  var requestList = requestData.split(",");
  for(var i = 0; i < requestList.length; ++i) {
    var request = requestList[i].split(":");

    // Sheet name
    var sheet = "";
    if(request.length > 0) {
      sheet = request[0];
    } else {
      console.log("[rsdModule] createRequests : No sheet name was specified in requestData");
    }

    // Dimension
    var dimension = "ROWS";
    if(request.length > 1) {
      dimension = request[1];
    } else {
      console.log("[rsdModule] createRequests : No dimension was specified for sheet '%s' in requestData. Defaulting to ROWS.", sheet);
    }

    if(dimension.toUpperCase() == "COLUMNS") {
      getSheetsColumnMajor.push(sheet);
    } else {
      getSheetsRowMajor.push(sheet);
    }
  }

  var addRequest = function(sheets, dimension) {
    var request = {};
    request.auth = authClient;
    request.spreadsheetId = spreadsheetId;
    request.ranges = sheets;
    request.majorDimension = dimension;
    requests.push(request);
  };

  if(getSheetsRowMajor.length > 0) {
    addRequest(getSheetsRowMajor, "ROWS");      
  }

  if(getSheetsColumnMajor.length > 0) {
    addRequest(getSheetsColumnMajor, "COLUMNS");      
  }

  return requests;
}

/**
 * 
 * @param {*} file 
 * @param {*} callback 
 */
function authorize(file, callback) {
  // Load client secrets from a local file.
  fs.readFile(file, 
    function processClientSecrets(err, content) {
      if (err) {
        console.log('[rsdModule] authorize : Error loading client secret file: ' + err);
        return;
      }

      // Credentials
      var credentials = JSON.parse(content);

      // Authenticate
      var authClient = new google.auth.JWT(
        credentials.client_email,
        null,
        credentials.private_key,
        SCOPES,
        // User to impersonate (leave empty if no impersonation needed)
        null);

      // Authorize
      authClient.authorize(function(err, tokens) {
        // 
        if (err) {
          return console.log(err);
        }

        callback(authClient);
      });
    });
}

/**
 * 
 * @param {*} rows 
 */
function parseRowsToList(rows) {

  var data = [];

  // Process variables : remove whitespace (e.g.: Init Items -> InitItems)
  var variables = rows[0];
  for(var vIdx = 0; vIdx < variables.length; ++vIdx) {
    variables[vIdx] = variables[vIdx].replace(/\s/g,'');
  }

  // Create objects
  for (var i = 1; i < rows.length; ++i) {
    var row = rows[i];
    var entry = {};

    for(var j = 0; j < row.length; ++j) {
      // Ignore empty variables
      if(variables[j]) {
        entry[variables[j]] = row[j];
      }
    }

    data.push(entry);
  }

  return data;
}