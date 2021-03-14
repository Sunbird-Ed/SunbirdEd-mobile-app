var https = require('https');
var fs = require("fs");
var fsextra = require('fs-extra');


var formRequestArray = [{
        'type': 'pageassemble',
        'subType': 'course',
        'action': 'filter_v2'
    },
    {
        'type': 'pageassemble',
        'subType': 'library',
        'action': 'filter'
    },
    {
        'type': 'config',
        'subType': 'login',
        'action': 'get'
    },
    {
        'type': 'config',
        'subType': 'location',
        'action': 'get'
    },
    {
        'type': 'config',
        'subType': 'content_v2',
        'action': 'filter'
    },
    {
        'type': 'config',
        'subType': 'supportedUrlRegex',
        'action': 'get'
    },
    {
        'type': 'user',
        'subType': 'externalIdVerification',
        'action': 'onboarding'
    },
    {
        'type':'contentfeedback',
        'subType':'en',
        'action':'get'
    },
    {
        'type': 'config',
        'subType': 'webview_version',
        'action': 'get'
    },
    {
        'type': 'user',
        'subType': 'manageduser',
        'action': 'create',
        'component': 'app'
    },
    {
        'type': 'group',
        'subType': 'activities_v2',
        'action': 'list'
    },
    {
        'type': 'dynamicform',
        'subType': 'support_v2',
        'action': 'get',
        'component': 'app'
    },
    {
        'type': 'form',
        'subType': 'boardContactInfo',
        'action': 'get',
        'component': 'app'
    },
    {
        'type': 'config',
        'subType': 'notification',
        'action': 'get',
        'component': 'app'
    },
    {
        'type': 'config',
        'subType': 'boardAlias',
        'action': 'get',
        'component': 'app'
    },
    {
        'type': 'dynamicform',
        'subType': 'consentdeclaration_v2',
        'action': 'submit',
        'component': 'app'
    },
    {
        'type': 'dynamicform',
        'subType': 'contentrequest',
        'action': 'submit',
        'component': 'app'
    },
    {
        'type': 'config',
        'subType': 'library_v3',
        'action': 'get',
        'component': 'app'
    },
    {
        'type': 'config',
        'subType': 'course_v2',
        'action': 'get',
        'component': 'app'
    },
    {
        'type': 'config',
        'subType': 'pdfPlayer',
        'action': 'get'
    },
    {
        'type': 'config',
        'subType': 'userType_v2',
        'action': 'get',
        'component': 'app'
    },
    {
        'type': 'profileConfig',
        'subType': 'default',
        'action': 'get'
    },
    {
        'type': 'config',
        'subType': 'deeplink',
        'action': 'get'
    }


];

var state_list_request_body = {
    request: {
        'filters': {
            'type': 'state'
        },
        "sort_by": {
            "name": "ASC"
        }
    }
}

var district_list_request_body = function(district_id) {
    var objDistrict = {
        request: {
            filters: {
                'type': 'district',
                'parentId': district_id
            },
            "sort_by": {
                "name": "ASC"
            }
        }
    }
    return objDistrict;
}

readFileConfig();


async function readFileConfig() {
    var obj = JSON.parse(fs.readFileSync('./data_config.json', 'utf8'));
    var jsonArray = obj.config;

    for (var i = 0; i < jsonArray.length; i++) {
        var jsonObj = jsonArray[i];

        API_FRAMEWORK = jsonObj.apiFramework;

        await saveFormResponse(jsonObj.apiKey, jsonObj.baseUrl, jsonObj.apiForm, jsonObj.filePathToSaveResonse);
        await saveSystemList(jsonObj.apiKey, jsonObj.apiChannel, jsonObj.baseUrl, jsonObj.apiChannelList, jsonObj.apiSystemSetting, jsonObj.filePathToSaveResonse, jsonObj.apiFramework);
        await saveStateList(jsonObj.apiKey, jsonObj.baseUrl, jsonObj.apiSearch, jsonObj.filePathToSaveResonse);

    }
}

async function saveStateList(apiKey, baseUrl, apiSearch, rootDir) {

    await makeAPICall(apiKey, baseUrl, 'POST', apiSearch, state_list_request_body)
        .then((response) => {
            return createSubFolders(rootDir, 'location')
                .then((dirName) => {
                    return writeFile(response, dirName, 'state', '')
                })
                .then(async () => {
                    await saveDistrictList(response, apiKey, baseUrl, apiSearch, rootDir)
                })
        }).catch((err) => {
            console.error(err);
        });
}

async function saveDistrictList(res, apiKey, baseUrl, apiSearch, rootDir) {
    const data = JSON.parse(res).result.response;
    for (let i = 0; i < data.length; i++) {
        let id = data[i].id;
        await makeAPICallnSaveResponse({
            apiKey: apiKey,
            baseUrl: baseUrl,
            requestType: 'POST',
            endPoint: apiSearch,
            body: district_list_request_body(data[i].id)
        }, {
            rootDir: rootDir,
            subFolder: 'location',
            preFix: 'district-',
            fileName: id
        });
    }
}

function makeAPICallnSaveResponse(apiConfig, fileConfig) {
    return makeAPICall(apiConfig.apiKey, apiConfig.baseUrl, apiConfig.requestType, apiConfig.endPoint, apiConfig.body)
        .then((response) => {
            return createSubFolders(fileConfig.rootDir, fileConfig.subFolder)
                .then((dirName) => {
                    return writeFile(response, dirName, fileConfig.preFix, fileConfig.fileName);
                });
        }).catch((err) => {
            console.error(err);
        });
}

async function saveSystemList(apiKey, apiChannel, baseUrl, apiSystemSettingList, apiSystemSettingId, rootDir, apiFramework) {
    await makeAPICall(apiKey, baseUrl, 'GET', apiSystemSettingList)
        .then(async (response) => {
            const result = JSON.parse(response).result.response;
            for (let i = 0; i < result.length; i++) {
                const json = result[i];
                const fieldName = json.field;
                const systemSettingsId = json.id;
                const systemSettingsValue = json.value;
                if (fieldName === 'custodianOrgId') {
                    await saveCustodianDetails(apiKey, apiChannel, baseUrl, systemSettingsValue, rootDir, apiFramework)
                        .then(() => {
                            return saveSystemSettingResponse(apiKey, baseUrl, apiSystemSettingId, rootDir, systemSettingsId)
                        });
                } else if (fieldName === 'courseFrameworkId') {
                    await saveFrameworkResponse(apiKey, baseUrl, [{
                            identifier: systemSettingsValue
                        }], rootDir, apiFramework, true)
                        .then(() => {
                            return saveSystemSettingResponse(apiKey, baseUrl, apiSystemSettingId, rootDir, systemSettingsId)
                        });
                } else if (fieldName === 'tenantCoursePage') {
                    await saveSystemSettingResponse(apiKey, baseUrl, apiSystemSettingId, rootDir, systemSettingsId);
                }
            }
        })
}

async function saveSystemSettingResponse(apiKey, baseUrl, apiSystemSettingId, rootDir, id) {
    await makeAPICallnSaveResponse({
        apiKey: apiKey,
        baseUrl: baseUrl,
        requestType: 'GET',
        endPoint: apiSystemSettingId + id
    }, {
        rootDir: rootDir,
        subFolder: 'system',
        preFix: 'system-setting-',
        fileName: id
    });
}

async function saveCustodianDetails(apiKey, apiChannel, baseUrl, custodianOrgId, rootDir, apiFramework) {

    await makeAPICall(apiKey, baseUrl, 'GET', apiChannel + custodianOrgId)
        .then((response) => {
            return createSubFolders(rootDir, 'channel')
                .then((dirName) => {
                    return writeFile(response, dirName, 'channel-', custodianOrgId)
                })
                .then(() => {
                    return saveFrameworkResponse(apiKey, baseUrl, response, rootDir, apiFramework);
                })
        })
}
async function saveFrameworkResponse(apiKey, baseUrl, response, rootDir, apiFramework, isTPD) {
    const frameworkList = !(response instanceof Array) ? JSON.parse(response).result.channel.frameworks : response;

    urlParameter = '?categories=board,gradeLevel,subject,medium' + (isTPD ? ',topic,purpose' : '');
    for (let i = 0; i < frameworkList.length; i++) {
        const frameworkIdentifier = frameworkList[i].identifier;
        await makeAPICallnSaveResponse({
            apiKey: apiKey,
            baseUrl: baseUrl,
            requestType: 'GET',
            endPoint: apiFramework + frameworkIdentifier + urlParameter
        }, {
            rootDir: rootDir,
            subFolder: 'framework',
            preFix: 'framework-',
            fileName: frameworkIdentifier
        });
    }
}

async function saveFormResponse(apiKey, baseUrl, apiForm, rootDir) {
    for (var i = 0; i < formRequestArray.length; i++) {
        const formRequest = formRequestArray[i];
        let fileName = formRequest.type + '_' + formRequest.subType + '_' + formRequest.action;
        if (formRequest.rootOrgId) {
            fileName += ('_' + formRequest.rootOrgId);
        }
        if (formRequest.component) {
            fileName += ('_' + formRequest.component);
        }
        await makeAPICallnSaveResponse({
            apiKey: apiKey,
            baseUrl: baseUrl,
            requestType: 'POST',
            endPoint: apiForm,
            body: {
                request: formRequest
            }
        }, {
            rootDir: rootDir,
            subFolder: 'form',
            preFix: 'form-',
            fileName: fileName
        });
    }

}

function writeFile(response, dirName, preFix, identifier) {
    return new Promise((resolve, reject) => {
        var fileName = dirName + '/' + preFix + identifier + '.json';
        fs.writeFile(fileName, response, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log("File " + fileName + " saved")
                resolve();
            }
        });
    });

}

function createSubFolders(rootDir, dirName) {
    var dir = rootDir + '/' + dirName;
    return new Promise((resolve, reject) => {
        try {
            if (!fs.existsSync(dir)) {
                fsextra.ensureDirSync(dir);
                resolve(dir);
            } else {
                resolve(dir)
            }
        } catch (err) {
            reject(err);
        }
    });

}

function makeAPICall(apiKey, baseUrl, requestType, url, body) {
    var options = {
        hostname: baseUrl,
        path: url,
        method: requestType,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
        }
    };
    var data;
    if (body && requestType === 'POST') {
        data = JSON.stringify(body);
        options.headers['Content-Length'] = data.length;
    }
    return new Promise((resolve, reject) => {
        const req = https.request(options,
            (res) => {
                let body = '';
                res.on('data', (chunk) => (body += chunk.toString()));
                res.on('error', reject);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode <= 299) {
                        resolve(body);
                    } else {
                        reject('Request failed. status: ' + res.statusCode + ', body: ' + body);
                    }
                });
            });
        req.on('error', reject);
        if (body && requestType === 'POST') {
            req.write(data);
        }
        req.end();
    });
}