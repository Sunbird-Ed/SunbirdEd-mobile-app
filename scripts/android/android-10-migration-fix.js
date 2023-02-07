#!/bin/bash

const shell = require('child_process').execSync
var pathList = [
    "platforms/android/cordova-plugin-badge/app-badge.gradle",
    "platforms/android/com-sarriaroman-photoviewer/app-photoviewer.gradle",
    "platforms/android/cordova-plugin-code-push/app-build-extras.gradle",
    "platforms/android/cordova-plugin-local-notification/app-localnotification.gradle",
]
for (let i = 0; i < pathList.length; i++) {
    try {
        if(process.platform == "darwin") {
            shell(`sed -i "" "s!compile!implementation!g" ${pathList[i]}`)
        } else {
            shell(`sed -i "s!compile!implementation!g" ${pathList[i]}`)
        }
    }
    catch(err) {
        console.log('error on script plugins ', pathList[i] + ' - ' + err);
    }
  }