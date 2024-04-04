var fs = require('fs');

// Example: Read properties from a file
const filePath = 'configurations/config.properties';
const properties = readPropertiesFile(filePath);

// Accessing property values
const appName = properties['app_name'];
const appid = properties['app_id'];
const verCode = properties['app_version_code'];

console.log("****** gradle properties ", properties);
let appId = `applicationId "${appid}"`;
let appendStr = '\t\tapplicationId app_id \n' +
    '\t\tresValue("string", "app_name", "${app_name}") \n' +  
    '\t\tresValue("string", "app_id", "${app_id}")'
let androidbuild = "android/app/build.gradle";
let appendStrCode = `\t\tversionCode ${verCode}`

// update gradle.properties file
fs.readFile("android/gradle.properties", "utf-8", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    if(data.match("# config.properties")) {
        console.log("exist ");
    } else {
        fs.readFile("configurations/config.properties", 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            fs.appendFileSync("android/gradle.properties", data);
        })
        fs.readFile("buildConfig/sunbird.properties", 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            fs.appendFileSync("android/gradle.properties", data);
        })
    }
})

 // build gardle fix
fs.readFile(androidbuild, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    let arr = data.split('\n');
    let exists = false;
    arr.forEach((a, i)=> {
        if(a.match(appId)) {
            arr[i] = appendStr
        }
        if(a.match('versionCode') && !a.match(appendStrCode)) {
            arr[i] = appendStrCode
        }
        if(a.match("signingConfigs {")) {
            exists = true;
        }
        if(a.match("minifyEnabled false")) {
            arr[i] = 
            `signingConfig signingConfigs.release
            minifyEnabled true`
        }
        if(a.match('buildTypes {') && !exists) {
            arr[i] = `signingConfigs {
                release {
                    storeFile = file("keystore/android_keystore.jks")
                    storePassword System.getenv("SIGNING_STORE_PASSWORD")
                    keyAlias System.getenv("SIGNING_KEY_ALIAS")
                    keyPassword System.getenv("SIGNING_KEY_PASSWORD")
                }
            }
            buildTypes {`
        }
    })
    fs.writeFile(androidbuild, arr.join("\n"), (err) => {
        if (err) {
        console.error("********* err", err);
        }
    });
});

function readPropertiesFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    const properties = {};

    for (const line of lines) {
        // Skip comments and empty lines
        if (line.trim() === '' || line.trim().startsWith('#') || line.trim().startsWith(';')) {
            continue;
        }

        const [key, value] = line.split('=');
        properties[key.trim()] = value.trim();
    }

    return properties;
}

fs.readFile("android/variables.gradle", 'utf-8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    if(data.match("minSdkVersion = 22")) {
        console.log("exist ");
        let updatedData = data.replace('minSdkVersion = 22', 'minSdkVersion = 23')
        fs.writeFile("android/variables.gradle", updatedData, (err) => {
            if (err) {
                console.error("********* err", err);
            }
        });
    }

})