var fs = require('fs');
var readline = require('readline');

let filePath = '';
if (process.env.NODE_ENV == "staging") {
    filePath = 'configurations/configuration.stag.ts';
} else if (process.env.NODE_ENV == "production") {
    filePath = 'configurations/configuration.prod.ts';
} else {
    filePath = 'configurations/configuration.prod.ts';
}
const properties = {}

updateConfigFile();
readConfigurationFile();

function readConfigurationFile() {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    rl.on('line', (line) => {
        if (line.includes('APPLICATION_ID:')) {
            var appId = line.replace(/[^A-Za-z._:]/g, '').replace('APPLICATION_ID:', '')
            properties['app_id'] = appId
        } else if (line.includes('APP_NAME:')) {
            var appName = line.replace(/[^A-Za-z._:]/g, '').replace('APP_NAME:', '')
            properties['app_name'] = appName
        } else if (line.includes('VERSION_CODE:')) {
            var versionCode = line.replace(/\s/g, '').replace('VERSION_CODE:', '').replace(',', '')
            properties['app_version_code'] = versionCode
        } else if (line.includes('NAMESPACE:')) {
            var namespace = line.replace(/[^A-Za-z._:]/g, '').replace('NAMESPACE:', '')
            properties['namespace'] = namespace
        } else if (line.includes('FLAVOR:')) {
            var namespace = line.replace(/[^A-Za-z._:]/g, '').replace('FLAVOR:', '')
            properties['flavor'] = namespace
        } else if (line.includes('VERSION_NAME:')) {
            var versionName = line.replace(/[^A-Za-z0-9._:]/g, '').replace('VERSION_NAME:', '')
            properties['version_name'] = versionName
        } else if (line.includes('CUSTOM_SCHEME_URL:')) {
            var versionName = line.replace(/[^A-Za-z0-9._:]/g, '').replace('CUSTOM_SCHEME_URL:', '')
            properties['custom_scheme_url'] = versionName
        } else if (line.includes('DEEPLINK_BASE_URL:')) {
            var versionName = line.replace(/[^A-Za-z0-9._:]/g, '').replace('DEEPLINK_BASE_URL:', '')
            properties['deeplink_base_url'] = versionName
        } else if (line.includes('DEEPLINK_IGOT_URL:')) {
            var versionName = line.replace(/[^A-Za-z0-9._:]/g, '').replace('DEEPLINK_IGOT_URL:', '')
            properties['deeplink_igot_url'] = versionName
        } else if (line.includes('DEEPLINK_NCERT_URL:')) {
            var versionName = line.replace(/[^A-Za-z0-9._:]/g, '').replace('DEEPLINK_NCERT_URL:', '')
            properties['deeplink_ncert_url'] = versionName
        }
    });

    rl.on('close', () => {
        console.log('Finished reading the configuration file.');
        updateCapacitorPluginModuleNameSpace();
        updateAppBuildGradle();
        updateGradleProperties()
    });

}

function updateCapacitorPluginModuleNameSpace() {
    const dest = 'android/capacitor-cordova-android-plugins/build.gradle';
    const codePatch = 'namespace "capacitor.cordova.android.plugins"';
    // Update namespace in capacitor-cordova-android-plugin build gardle 
    fs.readFile(dest, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        data = data.replace(codePatch, `namespace "${properties['namespace']}"`); // CHANGE APPLICATION ID
        fs.writeFile(dest, data, (err) => {
            if (err) {
                console.error("********* err", err);
            }
        });
    });
    console.log("Updated namespace in capacitor.cordova.android.plugins");
}

function updateAppBuildGradle() {
    let gradleAppId = `applicationId "${properties['app_id']}"`;
    let appendStr = '\t\tapplicationId app_id \n' +
        '\t\tresValue("string", "app_name", "${app_name}") \n' +
        '\t\tresValue("string", "app_id", "${app_id}")'
    let androidGradle = "android/app/build.gradle";
    let versionCodeStr = `\t\tversionCode ${properties['app_version_code']}`
    let versionNameStr = `\t\tversionName "${properties['version_name']}"`
    fs.readFile(androidGradle, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        let arr = data.split('\n');
        arr.forEach((a, i) => {
            if (a.match(gradleAppId)) {
                arr[i] = appendStr
            }
            if (a.match('versionName') && !a.match(versionNameStr)) {
                arr[i] = versionNameStr
            }
            if (a.match('versionCode') && !a.match(versionCodeStr)) {
                arr[i] = versionCodeStr
            }
        })
        fs.writeFile(androidGradle, arr.join("\n"), (err) => {
            if (err) {
                console.error("********* err", err);
            }
        });
    });
    console.log("Updated versionCode and versionName along with appId in app/build.gradle");
}

function updateGradleProperties() {
    fs.readFile("android/gradle.properties", "utf-8", (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        if (!data.match("# App.properties")) {
            const data = `\n # App.properties \napp_name=${properties['app_name']}\napp_id=${properties['app_id']}\nflavor=${properties['flavor']}\nversion_name=${properties['version_name']}\ncustom_scheme_url=${properties['custom_scheme_url']}\ndeeplink_base_url=${properties['deeplink_base_url']}\ndeeplink_igot_url=${properties['deeplink_igot_url']}\ndeeplink_ncert_url=${properties['deeplink_ncert_url']}`
            console.log("Merged gradle properties with SUnbird properties data", data);
            fs.appendFileSync("android/gradle.properties", data);
        }
    })
    console.log("Merged gradle properties with SUnbird properties");
}

function updateConfigFile() {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if(data) {
            fs.writeFile('configurations/configuration.ts', data, (err) => {
                if (err) {
                    console.log("Error, file not saved ", err);
                } else {
                    console.log("File saved ")
                }
            });
        } 
        if(err) [
            console.log('err ', err)
        ]
    })
}