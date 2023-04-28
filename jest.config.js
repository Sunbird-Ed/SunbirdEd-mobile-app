/**
 * @file jest.config.js
 * @description
 * Jest test suite configuration
 * @since - release-4.9.0
 * @Reference_Docs
 * - https://jestjs.io/docs/configuration
 */

const { defaults } = require('jest-config');
const { pathsToModuleNameMapper } = require('ts-jest');
const { paths } = require('./tsconfig.json').compilerOptions;

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  verbose: true,
  testEnvironment: 'jsdom',
  moduleNameMapper: pathsToModuleNameMapper(paths, { prefix: '<rootDir>/src' }),
  rootDir: "./",
  setupFiles: [
    "<rootDir>/src/__tests__/setup.js"
  ],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  globals: {
    cordova: true,
    'ts-jest': {
      tsconfig: '<rootDir>/src/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
    }
  },
  transform: { '^.+.(ts|mjs|js|html)$': 'jest-preset-angular' },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$|@project-sunbird)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
  roots: [
    "<rootDir>/src/app",
    "<rootDir>/src/config",
    "<rootDir>/src/directives",
    "<rootDir>/src/guards",
    "<rootDir>/src/pipes",
    "<rootDir>/src/services",
    "<rootDir>/src/util"
  ],
  moduleDirectories: [
    "node_modules"
  ],
  collectCoverage: true,
  coverageReporters: ['text', 'html'],
  coverageDirectory: '<rootDir>/coverage/',
  testMatch: [
    '**/?(*.)(spec).ts'
  ],
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'ts',
    'tsx',
    'html',
    'mjs',
    'd.ts'
  ],
  coveragePathIgnorePatterns: [
    "<rootDir>/src/app/*/*.module.ts",
    "<rootDir>/src/app/animations/*.ts",
    "<rootDir>/src/app/manage-learn/"
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '.data.spec.ts',
    '.spec.data.ts'
  ],
  // transform: {
  //   'lodash-es': '<rootDir>/node_modules/lodash-es'
  // }
};

/**
 * @description
 * Function to log all module mapped under src folder
 * - Use mode - DEBUG ONLY
 */
function setModuleNameMapper() {
  console.log('_______________MODULE_MAPPER________________')
  let _moduleMaps = pathsToModuleNameMapper(paths, { prefix: '<rootDir>/src' });
  console.log(_moduleMaps); // TODO: log!
  console.log('_______________MODULE_MAPPER________________')
}
// setModuleNameMapper()
