import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.sunbird.app',
  appName: 'Sunbird',
  webDir: "www",
  loggingBehavior: "none",
  server: {
    androidScheme: 'https',
  },
  plugins: {
    db: {},
    FCMPlugin: {
      "ANDROID_FIREBASE_BOM_VERSION": "26.5.0",
      "GRADLE_TOOLS_VERSION": "8.0.0",
      "GOOGLE_SERVICES_VERSION": "4.3.15",
      "ANDROID_DEFAULT_NOTIFICATION_ICON": "@mipmap/ic_launcher"
    },
    sbutility: {},
    customtabs: {
      "URL_SCHEME": "org.sunbird.app",
      "URL_HOST": "mobile",
    },
    "window.plugins.googleplus": {
      "PLAY_SERVICES_VERSION": "15.0.1"
    },
    downloadManager: {},
    SplashScreen: {
      "launchShowDuration": 0
    },
    LocalNotifications: {
      iconColor: "#488AFF",
      smallIcon: 'mipmap-hdpi-icon/ic_launcher',
      sound: "beep.wav",
    },
  },
  cordova: {
    accessOrigins: ["*"],
    preferences: {
      "ScrollEnabled": "false",
      "android-minSdkVersion": "22",
      "BackupWebStorage": "none",
      "Orientation": "portrait",
      "FadeSplashScreen": "false",
      "AndroidLaunchMode": "singleInstance",
      "KeyboardDisplayRequiresUserAction": "false",
      'android-targetSdkVersion': '33',
      'android-compileSdkVersion': '33',
      "android-manifest/@xmlns:tools": "http://schemas.android.com/tools",
      "android-manifest/application/@tools:replace": "android:allowBackup",
      "android-manifest/application/@android:allowBackup": "false",
      "loadUrlTimeoutValue": "700000",
      "CodePushDeploymentKey": "agojO-OZt4dZlt_pu9r9j2Ipy_jY90dbb065-3633-45a5-9c55-c0405eafaebb",
      "AndroidWindowSplashScreenAnimationDuration": "5000",
      "AndroidXEnabled": "true",
      "AndroidPersistentFileLocation": "Internal",
      "AutoHideSplashScreen":"true",
      "AndroidWindowSplashScreenBackground":"#ffffff",
      "SplashScreen":"resources/android/splash/drawable-ldpi-splash.png",
      "AndroidWindowSplashScreenAnimatedIcon":"resources/android/splash/drawable-ldpi-splash.png",
        
      "SplashMaintainAspectRatio": "true",
      "SplashShowOnlyFirstTime": "false",
      "SplashScreenDelay": "3000"
    }
  }
};

export default config;
