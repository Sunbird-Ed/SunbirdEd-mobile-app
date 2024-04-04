module.exports = function (context) {
    var fs = require('fs');
    fs.unlink("android/src/io/ionic/keyboard/IonicKeyboard.java");
    fs.unlink("android/CordovaLib/src/org/apache/cordova/BuildHelper.java");
    fs.unlink("android/CordovaLib/src/org/apache/cordova/PermissionHelper.java");
    fs.unlink("android/src/org/apache/cordova/device/Device.java");

    var rimraf = require('rimraf');
    rimraf("android/src/org/apache/cordova/file", function () {
        console.log("Deleted => android/src/org/apache/cordova/file");
    });
    rimraf("android/src/org/apache/cordova/filetransfer", function () {
        console.log("Deleted => android/src/org/apache/cordova/filetransfer");
    });
}