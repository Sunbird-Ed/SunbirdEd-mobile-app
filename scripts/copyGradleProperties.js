var fs = require('fs');

// Example: Read properties from a file
const filePath = 'configurations/config.properties';
const properties = readPropertiesFile(filePath);

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

// Accessing property values
const appid = properties['app_id'];
const verCode = properties['app_version_code'];

// =================================buildConfig/build.gradle=================================================== //
console.log("****** gradle properties ", properties);
let gradleAppId = `applicationId "${appid}"`;
let appendStr = '\t\tapplicationId app_id \n' +
    '\t\tresValue("string", "app_name", "${app_name}") \n' +  
    '\t\tresValue("string", "app_id", "${app_id}")'
let androidGradle = "android/app/build.gradle";
let appendStrCode = `\t\tversionCode ${verCode}`

const androidCapGradle = 'android/capacitor-cordova-android-plugins/build.gradle';
const codeToPatch = 'namespace "capacitor.cordova.android.plugins"';

updateAppId(androidCapGradle, codeToPatch)

function updateAppId(dest, codePatch) {
    // Update namespace in capacitor-cordova-android-plugin build gardle 
    fs.readFile(dest, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      data = data.replace(codePatch, `namespace "${appid}"`); // CHANGE APPLICATION ID
      fs.writeFile(dest, data, (err) => {
        if (err) {
          console.error("********* err", err);
        }
      });
    });
}

// build gardle fix
fs.readFile(androidGradle, 'utf8', (err, data) => {
  if (err) {
      console.error(err);
      return;
  }
  let arr = data.split('\n');
  arr.forEach((a, i)=> {
      if(a.match(gradleAppId)) {
          arr[i] = appendStr
      }
      if(a.match('versionCode') && !a.match(appendStrCode)) {
          arr[i] = appendStrCode
      }
  })
  fs.writeFile(androidGradle, arr.join("\n"), (err) => {
      if (err) {
      console.error("********* err", err);
      }
  });
});

//================================= update gradle.properties file ===================== //
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
    }
})