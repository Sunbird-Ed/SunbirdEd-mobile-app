export const configuration = {
  production: true,
  staging: false,
  hmr: false,
  debug: false
}

export const buildConfig = {
  DEBUG: true,
  APPLICATION_ID: "org.sunbird.app.staging",
  BUILD_TYPE: "debug",
  FLAVOR: "staging",
  VERSION_CODE: 1,
  VERSION_NAME: "6.0.local",
  // Field from product flavor: staging
  BASE_URL: "https://staging.sunbirded.org",
  // Field from product flavor: staging
  CHANNEL_ID: "CHANNEL_ID",
  // Field from product flavor: staging
  MAX_COMPATIBILITY_LEVEL: 5,
  // Field from product flavor: staging
  MOBILE_APP_CONSUMER: "mobile_device",
  // Field from product flavor: staging
  MOBILE_APP_KEY: "APP_KEY",
  // Field from product flavor: staging
  MOBILE_APP_SECRET: "APP_SECRET",
  // Field from the variant API
  REAL_VERSION_NAME: "6.0.local.0-debug",
  // Field from default config.
  SUPPORT_EMAIL: "dummy@example.com",
  // Field from build type: debug
  USE_CRASHLYTICS: false
};
