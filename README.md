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
