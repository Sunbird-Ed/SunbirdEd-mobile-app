**Dependencies:**    
NPM Version - above 6    
Node JS Version - above 8    

**1. Ionic-Android build Setup**    
    - [Install java](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)    
    - [Install Gradle](https://gradle.org/install/)    
    - [Install Android Studio](https://developer.android.com/studio/)   
    - After Android studio installation, install SDK    
    - Open Android studio and goto `settings/appearance and behavior/system settings/Android SDK`    
    - Install appropriate Android sdk platform package.    
    - Add environment variables in `~/.bashrc` or `~/.bash_profile` as follows    
        ```export ANDROID_SDK_ROOT=path_to_sdk```    
        ```export PATH=$PATH:$ANDROID_SDK_ROOT/tools/bin```    
        ```export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools```    
    - Reference: https://ionicframework.com/docs/installation/android    
 
    CLI Setup    
    - `npm install -g ionic`   
    - `npm install -g cordova`   

**2. Project Setup**    
    - git clone the repo(https://github.com/Sunbird-Ed/SunbirdEd-mobile-app).    
    - Rename `sunbird.properties.example` file to `sunbird.properties` and put all the valid credentials and api endpoint.    
    - Go to project folder and run npm i    
    - Run `./build.sh`    

**3. How to build apk**    
    - To check attached devices do `adb devices`    
    - `npm run ionic-build` (Make sure you have attached device)    
    - `ionic cordova run android --prod`    
    - Apk location `project_folder/platforms/android/app/build/outputs/apk/staging/debug/apk_name.apk`    

**4. How to debug apk**    
    - Open chrome and enter `chrome://inspect`    
    - Select app    





---------------------------------------

# IOS Development setup

## Prerequisites

    1. Node js version 10.18.1
    2. Ionic 5.4.16 using `npm i ionic@5.4.16 -g`
    3. Cordova 9.0.0  using `npm i cordova@9.0.0 -g`
    4. cordova-res 0.15.3 - using `npm install -g cordova-res`
    5. ios-deploy  1.11.4 - using `brew install ios-deploy`

    all of the above should be installed globally

    Xcode 12.4 Build version 12D4e or above
    
## Steps

    1. Checkout sunbird-sdk repo from https://github.com/shikshalokam/sunbird-mobile-sdk with branch release-3.9.0-ios
    2. Checkout sunbird-mobile-app repo from https://github.com/shikshalokam/SunbirdEd-mobile-app with branch release-3.9.0-ios
    3. Add `GoogleService-Info.plist` file
    3. cd to <sunbird-mobile-app> local path
    4. RUN npm i <sunbird-sdk repo local path>/dist
    5. RUN npm i
    6. RUN ./build-ios.sh
    7. RUN cordova emulate ios


## Possible Errors 

1. error: Value for SWIFT_VERSION cannot be empty. (in target 'Sunbird' from project 'Sunbird') or Duplicate GoogleService-Info.plist file error

### Solution
    open platforms/ios/Sunbird.xcworkspace 

    Select Sunbird 
    Build setting Project, targets
    update Swift language version to 4 
    Inside Tagets -> Build phases -> Copy Bundle Resources -> remove duplicate GoogleService-Info.plist if present
    and close Xcode then rerun the **cordova emulate ios**


