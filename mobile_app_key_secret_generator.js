
var https = require('https');
var readline = require('readline-sync');
var cryptoJS = require("crypto-js");


function run(){
  try {
    var domain = readline.question("Please enter domain name of your instance (For ex: It should be staging.sunbirded.org not https://staging.sunbirded.org):");
    var mobileAdminKey = readline.question("Please enter Mobile Admin Key :");
    var mobileAdminSecret = readline.question("Please enter Mobile Admin Secret :");
    var mobileAppKey = readline.question("Please enter Mobile App Key :");

    var bearerToken = createJWTToken(mobileAdminKey, mobileAdminSecret);
    register(domain, bearerToken, mobileAppKey)

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

function createJWTToken(subject, secretKey){
  var payload = `${createHeader()}.${createBody(subject)}`
  var hash = cryptoJS.HmacSHA256(payload,secretKey);
  var signature = cryptoJS.enc.Base64.stringify(hash);
  return `${payload}.${signature}`
}

function createHeader(){
  var header = {
     "alg": "HS256"
  };
  return Buffer.from(JSON.stringify(header)).toString('base64url')
}

function createBody(secretKey){
  var body = {
    "iss": secretKey
  };
  return Buffer.from(JSON.stringify(body)).toString('base64url')
}

function register(baseUrl, bearerToken, appKey) {
  var request = {
    "request": {
      "key": appKey
    }
  }
    var options = {
        hostname: baseUrl,
        path: "/api/api-manager/v1/consumer/mobile_app/credential/register",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + bearerToken
        }
    };
    var data = JSON.stringify(request);
    options.headers['Content-Length'] = data.length;
    return new Promise((resolve, reject) => {
        const req = https.request(options,
            (res) => {
                let body = '';
                res.on('data', (chunk) => (body += chunk.toString()));
                res.on('error', reject);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode <= 299) {
                        resolve(body);
                        console.log(`mobile_app_key is ${appKey}`);
                        console.log(`mobile_app_secret is ${JSON.parse(body).result.secret}`);
                    } else {
                        console.error('Request failed. status: ' + res.statusCode + ', body: ' + body);
                        reject('Request failed. status: ' + res.statusCode + ', body: ' + body);
                    }
                });
            });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

run();
