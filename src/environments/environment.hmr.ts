export const environment = {
  production: false,
  dev: false,
  developement: false,
  hmr: true,
  debug: false
}

export const buildConfig = {
  DEBUG: true,
  APPLICATION_ID: "APPLICATION_ID",
  BUILD_TYPE: "BUILD_TYPE",
  FLAVOR: "FLAVOR",
  VERSION_CODE: 1,
  VERSION_NAME: "VERSION_NAME",
  // Field from product flavor: staging
  BASE_URL: "BASE_URL",
  // Field from product flavor: staging
  CHANNEL_ID: "CHANNEL_ID",
  // Field from product flavor: staging
  MAX_COMPATIBILITY_LEVEL: 5,
  // Field from product flavor: staging
  MOBILE_APP_CONSUMER: "MOBILE_APP_CONSUMER",
  // Field from product flavor: staging
  MOBILE_APP_KEY: "APP_KEY",
  // Field from product flavor: staging
  MOBILE_APP_SECRET: "APP_SECRET",
  // Field from the variant API
  REAL_VERSION_NAME: "REAL_VERSION_NAME",
  // Field from default config.
  SUPPORT_EMAIL: "SUPPORT_EMAIL",
  // Field from build type: debug
  USE_CRASHLYTICS: false
};
