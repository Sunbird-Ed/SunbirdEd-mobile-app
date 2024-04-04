// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const configuration = {
  production: false,
  staging: false,
  hmr: false,
  debug: false
};

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
}
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
