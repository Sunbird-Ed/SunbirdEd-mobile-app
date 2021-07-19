#!/bin/bash

# Accepted CLI arguments
while getopts a: flag
do
    case "${flag}" in
        a) angularConfiguration=${OPTARG};;
    esac
done

if [ "$1" != "skip-install" ]; then
# Simple script to clean install
rm -rf node_modules
rm -rf platforms
rm -rf plugins
rm -rf www

CORDOVA_COUNTER=0
SUNBIRD_CORDOVA_COUNTER=0

# Pass build branch as input
buildBranch="$1"
rm package-lock.json && npm install
export CORDOVA_ANDROID_GRADLE_DISTRIBUTION_URL="https\://services.gradle.org/distributions/gradle-6.5.1-all.zip"

file="./build_config"
while IFS="=" read -r key value; do
  case "$key" in
    '#'*) ;;
    'cordova'*)
      CORDOVA[$CORDOVA_COUNTER]=$value
      CORDOVA_COUNTER=$((CORDOVA_COUNTER+1));;
    'sunbird-cordova'*)
      SUNBIRD_CORDOVA[$SUNBIRD_CORDOVA_COUNTER]=$value
      SUNBIRD_CORDOVA_COUNTER=$((SUNBIRD_CORDOVA_COUNTER+1));
  esac
done < "$file"


for cordova_plugin in "${CORDOVA[@]}"
do
  ionic cordova plugin add $cordova_plugin --force
done

for cordova_plugin in "${SUNBIRD_CORDOVA[@]}"
do
  ionic cordova plugin add $cordova_plugin
done
fi

rm -rf platforms
mkdir platforms


npm uninstall code-push
npm uninstall cordova-plugin-dialogs
npm install @ionic-native/ionic-webview@5.33.1
npm install cordova-plugin-inappbrowser@5.0.0
npm install com.telerik.plugins.nativepagetransitions@0.7.0

ionic cordova plugin rm com.jjdltc.cordova.plugin.zip
ionic cordova plugin rm cordova-plugin-sunbirdsplash
ionic cordova plugin add cordova-plugin-splashscreen

#Temporary Workaround to generate build as webpack was complaining of Heap Space
#need to inspect on webpack dependdencies at the earliest
NODE_OPTIONS=--max-old-space-size=4096 ionic cordova platforms add ios
NODE_OPTIONS=--max-old-space-size=4096 ionic cordova build ios

