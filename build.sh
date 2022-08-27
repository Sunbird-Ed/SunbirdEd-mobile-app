#!/bin/bash

# Accepted CLI arguments
while getopts a: flag
do
    case "${flag}" in
        a) angularConfiguration=${OPTARG};;
    esac
done

themeBranchName='apex-master'
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

#APEX theme install
echo "Cloning Sb-styles"
git clone https://github.com/shikshalokam/sb-styles.git
cd sb-styles
git checkout $themeBranchName
npm pack
cd ..
echo "installing Sb-styles"
npm i file:./sb-styles/project-sunbird-sb-styles-0.0.9.tgz
rm -rf sb-styles
echo "Cloning Sb-themes"
git clone https://github.com/shikshalokam/sb-themes.git
cd sb-themes
git checkout $themeBranchName
npm pack
cd ..
echo "installing Sb-themes"
npm i file:./sb-themes/project-sunbird-sb-themes-0.0.39.tgz
rm -rf sb-themes
#APEX theme install Ends

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
  ionic cordova plugin add $cordova_plugin
done

for cordova_plugin in "${SUNBIRD_CORDOVA[@]}"
do
  ionic cordova plugin add $cordova_plugin
done


rm -rf platforms
#Temporary Workaround to generate build as webpack was complaining of Heap Space
#need to inspect on webpack dependdencies at the earliest
NODE_OPTIONS=--max-old-space-size=4096 ionic cordova platforms add android@9.0.0

NODE_OPTIONS=--max-old-space-size=4096 ionic cordova build android --prod --release --verbose --buildConfig ./buildConfig/build.json

if [ -n "$angularConfiguration" ]; then
  echo "$angularConfiguration"
  npm run ionic-build --angular-configuration=$angularConfiguration
else
  npm run ionic-build --angular-configuration=production
fi

