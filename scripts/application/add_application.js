module.exports = function (context) {
  var fs = require('fs');
  fs.copyFileSync("scripts/application/SunbirdApplication.java", "platforms/android/app/src/main/java/org/sunbird/SunbirdApplication.java");
  var APPLICATION_CLASS = "org.sunbird.SunbirdApplication";

  var fs = context.requireCordovaModule('fs'),
    path = context.requireCordovaModule('path');

  console.log("Finding Manifest File");
  var platformRoot = path.join(context.opts.projectRoot, 'platforms/android/app/src/main');
  var manifestFile = path.join(platformRoot, 'AndroidManifest.xml');


  if (fs.existsSync(manifestFile)) {
    console.log("Manifest Found");

    fs.readFile(manifestFile, 'utf8', function (err, data) {
      if (err) {
        throw new Error('Unable to find AndroidManifest.xml: ' + err);
      }

      if (data.indexOf(APPLICATION_CLASS) == -1) {
        var result = data.replace(/<application/g, '<application android:name="' + APPLICATION_CLASS + '"');
        fs.writeFile(manifestFile, result, 'utf8', function (err) {
          if (err) throw new Error('Unable to write into AndroidManifest.xml: ' + err);
        })

        console.log("Manifest Edited Successfully");
      }
    });
  }
};
