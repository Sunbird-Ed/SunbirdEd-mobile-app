var fs = require('fs');
var propertiesReader = require('properties-reader');

let filePath = 'android/gradle.properties';
var properties = propertiesReader(filePath).getAllProperties();

updateCapacitorPluginModuleNameSpace();
updateAppBuildGradle();
updateGradleProperties()


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
            // if (a.match('versionName') && !a.match(versionNameStr)) {
            //     arr[i] = versionNameStr
            // }
            // if (a.match('versionCode') && !a.match(versionCodeStr)) {
            //     arr[i] = versionCodeStr
            // }
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
