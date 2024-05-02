export const configuration = {
  production: true,
  staging: false,
  hmr: false,
  debug: false
}

export const buildConfig = {
  DEBUG: true,
  NAMESPACE: "org.sunbird.app",
  APPLICATION_ID: "org.sunbird.app.staging",
  APP_NAME: "Sunbird",
  BUILD_TYPE: "debug",
  FLAVOR: "staging",
  VERSION_CODE: 1,
  VERSION_NAME: "6.0.local",
  BASE_URL: "https://staging.sunbirded.org",
  CHANNEL_ID: "CHANNEL_ID",
  MAX_COMPATIBILITY_LEVEL: 5,
  MOBILE_APP_CONSUMER: "mobile_device",
  MOBILE_APP_KEY: "APP_KEY",
  MOBILE_APP_SECRET: "APP_SECRET",
  REAL_VERSION_NAME: "6.0.local.0-debug",
  SUPPORT_EMAIL: "dummy@example.com",
  USE_CRASHLYTICS: false
};
