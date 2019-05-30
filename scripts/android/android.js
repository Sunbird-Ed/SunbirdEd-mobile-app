module.exports = function (context) {
    var fs = require('fs');
    fs.unlink("platforms/android/src/io/ionic/keyboard/IonicKeyboard.java");
    fs.unlink("platforms/android/CordovaLib/src/org/apache/cordova/BuildHelper.java");
    fs.unlink("platforms/android/CordovaLib/src/org/apache/cordova/PermissionHelper.java");
    fs.unlink("platforms/android/src/org/apache/cordova/device/Device.java");

    var rimraf = require('rimraf');
    rimraf("platforms/android/src/org/apache/cordova/file", function () {
        console.log("Deleted => platforms/android/src/org/apache/cordova/file");
    });
    rimraf("platforms/android/src/org/apache/cordova/filetransfer", function () {
        console.log("Deleted => platforms/android/src/org/apache/cordova/filetransfer");
    });
    rimraf("platforms/android/src/org/apache/cordova/inappbrowser", function () {
        console.log("Deleted => platforms/android/src/org/apache/cordova/inappbrowser");
    });
    rimraf("platforms/android/src/org/apache/cordova/whitelist", function () {
        console.log("Deleted => platforms/android/src/org/apache/cordova/whitelist");
    });
}