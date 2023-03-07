Recommended Branch - release-4.9.0

Kindly mail back to sunbird to get the starter kit Which consists of two files:
a) google-services.json - To be Copied at the root of the project
b) sunbird.properties.  - To be Copied into buildConfig/ folder


**Dependencies:**    
NPM Version - above 6    
Node Version - 14 (Recommended)
Cordova Version - 9 (Recommended)

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
    - Run `./build.sh`    

**3. Onboarding/Tabs Configuration**
    Onboarding steps and Tabs can be configured via this configuration settings.

**Onboarding Configurations**
|Name|Description|Options|
|----|-----|-----|
|Language Selection|User should select their prefered language|To skip language selection, set skip as false and provide default values|
|User Role Selection|User should select their role|If want to skip User Type selection, set skip as false and provide default user type|
|Profile Settings|User should set their profile by choosing their framework fields|Provide deafult profile values to skip profile settings page|
|District Maping|Here user need to provide details related to their location|To skip this page deafult location values are required|

#### Language Selection
```
{
  "onboarding": [
    {
      "name": "language-setting",
      "skip": false,
      "default": {
        "code": "en",
        "label": "English"
      }
    }
  ]
}
```

#### User Role Selection
```
{
  "onboarding": [
    {
      "name": "user-type-selection",
      "skip": false,
      "default": "teacher"
    }
  ]
}
```

#### Profile Settings
```
{
  "onboarding": [
    {
      "name": "profile-settings",
      "skip": false,
      "default": {
        "syllabus": [
          "CBSE"
        ],
        "board": [
          "cbse"
        ],
        "medium": [
          "english"
        ],
        "grade": [
          "class5",
          "class6"
        ]
      }
    }
  ]
}
```
#### District Maping
```
{
  "onboarding": [
    {
      "name": "district-mapping",
      "skip": false,
      "default": {
        "state": "Andaman & Nicobar Islands",
        "stateId": "83h3u832ui4",
        "district": "Nicobars",
        "districtId": "aef899d41"
      }
    }
  ]
}
```

**Tabs Page COnfigurations**

Configure the tabs page according to the requirement. Fllowing are the configurable settings for tabs.

```
{
  "tabs": [
    {
      "root": "home",
      "name": "home",
      "icon": {
        "active": "assets/imgs/tab_home_selected.svg",
        "inactive": "assets/imgs/tab_home.svg",
        "disabled": "assets/imgs/ic_home.png"
      },
      "label": "TAB_HOME",
      "index": 2,
      "isSelected": true,
      "is_visable": true,
      "disabled": false,
      "theme": "NEW",
      "status": "ALL",
      "userTypeAdmin": true
    }
  ]
}
```

|Property|Description|Value|
|----|----|----|
|`root`|On which page the tab should be shown.|`home`|
|`name`|Name given to the tab|`home`|
|`icon`|Different icons for respective events. i.e when the tab is selected, not seleted and disabled.|Object with path to the respectivr icons|
|`label`|Label name to displayed for the tab|'TAB_NAME'|
|`index`|At which position the tab should be displayed|numeric value ex: `2` shows at 2 position in order|
|`isSelected`|Wheather the tab should be selected by deafult|Boolean value ex: `true` default selected|
|`is_visable`|To display the tab or not|Boolean value|
|`disabled`|If `true`, tab is displayed, but can't select|Boolean. |
|`is_visable`|To display the tab or not|Boolean value|
|`theme`|Theme on which the tab should be displayed(If there are multiple theme for the app available)|name of theme for which tab has to be displayed|
|`status`|To display to a spefic user criteria|ex: 'logIn' will show to logged in users only|
|`userTypeAdmin`|Wheather to show for only Admin users|Boolean value|
  

**4. How to build apk**    
    - To check attached devices do `adb devices`    
    - `npm run ionic-build` (Make sure you have attached device)    
    - `ionic cordova run android --prod`    
    - Apk location `project_folder/platforms/android/app/build/outputs/apk/staging/debug/apk_name.apk`    

**5. How to debug apk**    
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

    NOTE: For M1 chipset users please go through FAQ section for ROSETA 2 compatibility and usage.
    
## Steps
    1. Checkout sunbird-mobile-app repo from https://github.com/shikshalokam/SunbirdEd-mobile-app with branch release-3.9.0-ios
    2. Add `GoogleService-Info.plist` file
    3. cd to <sunbird-mobile-app> local path
    4. Rename `sunbird.properties.example` file to `sunbird.properties` and put all the valid credentials and api endpoint.
    5. RUN ./build-ios.sh
    6. RUN cordova emulate ios
## FAQ
1. error: Value for SWIFT_VERSION cannot be empty. (in target 'Sunbird' from project 'Sunbird') or Duplicate GoogleService-Info.plist file error
  open platforms/ios/Sunbird.xcworkspace 
  Select Sunbird 
  Build setting Project, targets
  update Swift language version to 4 
  Inside Tagets -> Build phases -> Copy Bundle Resources -> remove duplicate GoogleService-Info.plist if present
  and close Xcode then rerun the **cordova emulate ios**
2. M1 Chipset users - Turn off ROSETA for XCODE 
  Open Applications -> Right Click Xcode -> Click on Get Info -> Unchek Open with Roseta
  Once `build-ios.sh` is completed, open platforms/ios/Sunbird.xcworkspace and run the application by clicking on Play button
3. Install Java on Mac
  Check if JAVA is already insalled or not by running following command in terminal
  `javac --version` if you get the verdetails then it's installed already
  Check the installation path in `/Library/Java/JavaVirtualMachines`
  Check is JAVA_HOME is set by runnig `echo $JAVA_HOME`, if you get the installation path as output then JAVA_HOME is set
  For Further details follow the link - https://stackoverflow.com/a/50683158/4259981
4. (iOS Setup only) POD installation - https://cocoapods.org/
5. (Android Setup only) Gradle installation - https://gradle.org/install/

