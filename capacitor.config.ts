import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.sunbird.app',
  appName: 'Sunbird',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
    "PushNotifications": {
      "presentationOptions": [
        "badge",
        "sound",
        "alert"
      ]
    },
    "CapacitorHttp": {
      "enabled": true
    },
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
    downloadManager: {}
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
      "SplashScreen":"splash.png",
      "AndroidWindowSplashScreenAnimatedIcon":"splash.png",
      "SplashMaintainAspectRatio": "true",
      "SplashShowOnlyFirstTime": "false",
      "SplashScreenDelay": "3000"
    }
  }
};

export default config;
