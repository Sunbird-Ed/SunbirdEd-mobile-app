var https = require('https');
var fs = require("fs");
var request = require("request");
var shell = require('shelljs');

var frameworkIdentifier;
var frameworkUrlParameter = '?categories=board,gradeLevel,subject,medium';


var course_request_body = {
  request: {
    'type': 'pageassemble',
    'subType': 'course',
    'action': 'filter_v2'
  }
};

var library_request_body = {
  request: {
    'type': 'pageassemble',
    'subType': 'library',
    'action': 'filter'
  }
};

var state_list_request_body = {
  request : {
    'filters': {
      'type': 'state'
   }
  }
}

var district_list_request_body = function(district_id) {
  var objDistrict = {
    request : {
      filters : {
         'type' : 'district',
         'parentId' : district_id
          }
      }
    }
  return objDistrict;
}

readFileConfig();


function readFileConfig() {
  var obj = JSON.parse(fs.readFileSync('./data_config.json', 'utf8'));
  var jsonArray = obj.config;

  for (var i = 0; i < jsonArray.length; i++) {
    var jsonObj = jsonArray[i];
  
    API_FRAMEWORK = jsonObj.apiFramework;

    getCourseFormResponse(jsonObj.apiKey, jsonObj.baseUrl, jsonObj.apiForm, jsonObj.filePathToSaveResonse);
    getLibraryFormResponse(jsonObj.apiKey, jsonObj.baseUrl, jsonObj.apiForm, jsonObj.filePathToSaveResonse);

    getSystemList(jsonObj.apiKey, jsonObj.apiChannel, jsonObj.baseUrl, jsonObj.apiChannelList, jsonObj.apiSystemSetting, jsonObj.filePathToSaveResonse,jsonObj.apiFramework);

    getStateList(jsonObj.apiKey, jsonObj.baseUrl, jsonObj.apiSearch, jsonObj.filePathToSaveResonse);
  }
}

//GET SYSTEM LIST RESPONSE HERE
function getSystemList(apiKey, apiChannel, baseUrl, apiSystemSettingList, apiSystemSettingId, strFileDirectory,apiFramework) {
  var getSystemListUrl = apiSystemSettingList
  makeApiCall(apiKey, baseUrl, 'GET', getSystemListUrl, function (resp) {
    getCustodianId(apiKey, apiChannel, baseUrl, resp, apiSystemSettingId, strFileDirectory,apiFramework);
  })
}

//GET STATE WISE LIST RESPONSE FUNCTION
function getStateList(apiKey, baseUrl, apiSearch, strFileDirectory) {
   var res = makePostApiCall(apiKey, baseUrl, 'POST', apiSearch, state_list_request_body, function (response) {
       createMainDirectory(strFileDirectory, 'location', function (dirName) {
          saveResponse(JSON.stringify(response.body), dirName, 'state', '');
        });
        //Call District wise api call
        getDistrictList(response.body,apiKey,baseUrl,apiSearch,strFileDirectory);
   });
}

//GET DISTRICT WISE API RESPONSE FUNCTION
function getDistrictList(res,apiKey, baseUrl, apiSearch, strFileDirectory) {
  var data = res.result.response;
  for(var i=0;i<data.length;i++) {
    let id = data[i].id;
    makePostApiCall(apiKey, baseUrl, 'POST', apiSearch, district_list_request_body(data[i].id), function (response) {
         createMainDirectory(strFileDirectory, 'location', function (dirName) {
            saveResponse(JSON.stringify(response.body), dirName, 'district-', id);
        });
    });
  }
}

//GET CUSTODIAN RESPONSE HERE
function getCustodianId(apiKey, apiChannel, baseUrl, res, apiSystemSettingId, strFileDirectory,apiFramework) {

  var data = JSON.parse(res).result.response;
  frameworkUrlParameter = '?categories=board,gradeLevel,subject,medium,topic,purpose';

  for (var i = 0; i < data.length; i++) {
    var json = data[i];
    var fieldName = json.field;
    if (fieldName === 'custodianOrgId') {
      var KEY_CUSTODIAN_ORG_ID = json.id;
      var KEY_CUSTODIAN_ORG_VALUE = json.value;
      getChannelResponse(apiKey, apiChannel, baseUrl, KEY_CUSTODIAN_ORG_VALUE, strFileDirectory, apiFramework);
      getSystemSettingResponse(apiKey, baseUrl, KEY_CUSTODIAN_ORG_ID, apiSystemSettingId, strFileDirectory);
    }

    if (fieldName === 'courseFrameworkId') {
      var KEY_FRAMEWORK_ID = json.id;
      var courseFrameworkId = json.value;
      getFrameworkIdResponse(apiKey, baseUrl, courseFrameworkId, strFileDirectory, apiFramework, frameworkUrlParameter);
      getSystemSettingResponse(apiKey, baseUrl, KEY_FRAMEWORK_ID, apiSystemSettingId, strFileDirectory);
    }
  }
}

//GET CHANNEL RESPONSE HERE
function getChannelResponse(apiKey, apiChannel, baseUrl, custodianOrgId, strFileDirectory, apiFramework) {
  var channelAPi = apiChannel + custodianOrgId;
  makeApiCall(apiKey, baseUrl, 'GET', channelAPi, function (res) {

    createMainDirectory(strFileDirectory, 'channel', function (dirName) {
      saveResponse(res, dirName, 'channel-', custodianOrgId);
    });
    getFrameworkResponse(apiKey, baseUrl, res, strFileDirectory, apiFramework);

  });
}


function getFrameworkResponse(apiKey, baseUrl, response, strFileDirectory, apiFramework) {

  // TODO: Add null/empty check for frameworks
  var frameworkId = JSON.parse(response).result.channel.frameworks;
  urlParameter = '?categories=board,gradeLevel,subject,medium';
  for (var i = 0; i < frameworkId.length; i++) {
    frameworkIdentifier = frameworkId[i].identifier;
    getFrameworkIdResponse(apiKey, baseUrl, frameworkIdentifier, strFileDirectory, apiFramework, urlParameter);
  }
}

//GET FRAMEWORK RESPONSE HERE
function getFrameworkIdResponse(apiKey, baseUrl, id, strFileDirectory, apiFramework, urlParameter) {
  url = apiFramework + id + urlParameter;
  var res = makeApiCall(apiKey, baseUrl, 'GET', url, function (response) {
    createMainDirectory(strFileDirectory, 'framework', function (dirName) {
      saveResponse(response, dirName, 'framework-', id);
    });
  });
}

//GET SYSTEM SETTING RESPONSE HERE
function getSystemSettingResponse(apiKey, baseUrl, id, apiSystemSettingId, strFileDirectory) {
  var url = apiSystemSettingId + id;
  var res = makeApiCall(apiKey, baseUrl, 'GET', url, function (res) {

    createMainDirectory(strFileDirectory, 'system', function (dirName) {
      saveResponse(res, dirName, 'system-setting-', id);

    });
  });
}


function getCourseFormResponse(apiKey, baseUrl, apiForm, strFileDirectory) {

  //readFileConfig();
  var res = makePostApiCall(apiKey, baseUrl, 'POST', apiForm, course_request_body, function (response) {

    createMainDirectory(strFileDirectory, 'form', function (dirName) {
      saveResponse(JSON.stringify(response.body), dirName, 'form-', 'pageassemble_course_filter');
    });
  });
}

function getLibraryFormResponse(apiKey, baseUrl, apiForm, strFileDirectory) {
  var res = makePostApiCall(apiKey, baseUrl, 'POST', apiForm, library_request_body, function (response) {
    createMainDirectory(strFileDirectory, 'form', function (dirName) {
      saveResponse(JSON.stringify(response.body), dirName, 'form-', 'pageassemble_library_filter');
    });
  });
}

function saveResponse(response, dirName, preFixOfFileName, fileName) {

  var strFileName = dirName + '/' +
    preFixOfFileName + fileName + '.json';
  console.log("File Name "+strFileName+" Saved")

  fs.writeFile(strFileName, response, (err) => {
    if (err) {
      console.error(err);
      return;
    };
  });
}


function createMainDirectory(strFileDirectory1, dirName, callback) {
  var parentDir = strFileDirectory1;

  var dir = parentDir + '/' + dirName;

  if (!fs.existsSync(dir)) {
    //fs.mkdirSync(dir);
    shell.mkdir('-p', dir);
    return callback(dir);
  } else {
    return callback(dir);
  }
}

function makePostApiCall(apiKey, baseUrl, requestType, url, body, callback) {
  request({
    url: "https://" + baseUrl + url,
    method: requestType,
    json: true,   // <--Very important!!!
    body: body,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    }
  }, function (error, response, body) {
    return callback(response);
  });
}

function makeApiCall(apiKey, baseUrl, requestType, url, callback) {
  var options = {
    hostname: baseUrl,
    path: url,
    method: requestType,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    }
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      if (res.statusCode == 200) {
        //var data = JSON.parse(chunk).result;
        console.log('API called--------', url);
        return callback(body);
      } else {
        console.log('API failed--------', options.hostname + url);
      }
    });
  });


  req.on('error', function(e) {
    console.error('problem with request: ' + e.message);
  });

  req.end();

}
