import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.sunbird.app',
  appName: 'Sunbird',
  webDir: "www/browser",
  loggingBehavior: "none",
  server: {
    androidScheme: 'https',
  },
  plugins: {
    FCMPlugin: {
      "ANDROID_FIREBASE_BOM_VERSION": "26.5.0",
      "GRADLE_TOOLS_VERSION": "8.1.1",
      "GOOGLE_SERVICES_VERSION": "4.3.15",
      "ANDROID_DEFAULT_NOTIFICATION_ICON": "@mipmap/ic_launcher"
    },
    customtabs: {
      "URL_SCHEME": "org.sunbird.app",
      "URL_HOST": "mobile",
    },
    "window.plugins.googleplus": {
      "PLAY_SERVICES_VERSION": "15.0.1"
    },
    SplashScreen: {
      "launchShowDuration": 0
    },
    LocalNotifications: {
      iconColor: "#488AFF",
      smallIcon: 'mipmap-hdpi-icon/ic_launcher',
      sound: "beep.wav",
    },
    EdgeToEdge: {
      backgroundColor: "#FFD954",
    },
    StatusBar: {
      overlaysWebView: false,
  },
  },
};

export default config;
