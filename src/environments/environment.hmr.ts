export const environment = {
  production: false,
  staging: false,
  developement: false,
  hmr: true,
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
  CHANNEL_ID: "505c7c48ac6dc1edc9b08f21db5a571d",
  // Field from product flavor: staging
  MAX_COMPATIBILITY_LEVEL: 5,
  // Field from product flavor: staging
  MOBILE_APP_CONSUMER: "mobile_device",
  // Field from product flavor: staging
  MOBILE_APP_KEY: "sunbird-0.1",
  // Field from product flavor: staging
  MOBILE_APP_SECRET: "c0MsZyjLdKYMz255KKRvP0TxVbkeNFlx",
  // Field from the variant API
  REAL_VERSION_NAME: "6.0.local.0-debug",
  // Field from default config.
  SUPPORT_EMAIL: "dummy@example.com",
  // Field from build type: debug
  USE_CRASHLYTICS: false
};
