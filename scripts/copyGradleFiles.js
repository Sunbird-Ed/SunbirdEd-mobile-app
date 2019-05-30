module.exports = function (context) {
    var fs = require('fs');
    fs.copyFileSync("buildConfig/build-extras.gradle", "platforms/android/app/build-extras.gradle");
    fs.copyFileSync("buildConfig/build.gradle", "platforms/android/build.gradle");
    fs.copyFileSync("buildConfig/sunbird.properties", "platforms/android/gradle.properties");
     
    // var configFile = fs.readFileSync("config.xml").toString();

    // var sunbirdProps = fs.readFileSync("buildConfig/sunbird.properties").toString();
    // var properties = sunbirdProps.split("\n");

    // properties.forEach(line => {
    //     if (line.startsWith("app_id")) {
    //         console.log("Application Id : " + line.split("=")[0].trim() + " == " + line.split("=")[1].trim());
    //         var appId = line.split("=")[1].trim()

    //         configFile = configFile.replace(new RegExp('id="([a-z, .]+)"', 'g'), 'id="' + appId + '"');
    //         fs.writeFileSync("config.xml", configFile);
    //     }
    // });
}
