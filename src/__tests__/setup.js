require('reflect-metadata');
require('babel-polyfill');
require('./regexp-polyfill.min')

window.dayjs = require('dayjs')

global.cordova = {
    plugins: {
        InAppUpdateManager: {
            checkForImmediateUpdate: () => {}
        },
        notification: {
            local: {
                lanchDetails: {},
                getScheduledIds: () => { },
                schedule: () => { }
            }
        },
        diagnostic: {
            switchToSettings: () => { },
            getPermissionAuthorizationStatus: () => { },
            permissionStatus: {
                DENIED_ALWAYS: 'DENIED_ALWAYS'
            }
        },
        printer: {
            print: () => { }
        },
        permissions: {
            checkPermission: () => { },
            requestPermissions: () => { },
            checkPermission: () => { }
        }
    },
    file: {
        applicationDirectory: "/path",
        externalRootDirectory: '/path'
    },
    InAppBrowser: {
        open: () => ({
            executeScript: () => { },
            addEventListener: () => { },
            close: () => { }
        })
    }
};

global.supportfile = {
    shareSunbirdConfigurations: () => { },
    makeEntryInSunbirdSupportFile: () => { }
}
global.document = {
    getElementById: () => { },
}

global.FCMPlugin = {
    subscribeToTopic: (topic, success, error) => {
        setTimeout(() => {
            success();
        });
    },
    unsubscribeFromTopic: (topic, success, error) => {
        setTimeout(() => {
            success();
        });
    },
    onTokenRefresh: () => { },
    onNotification: () => { }
}

global.splashscreen = {
    markImportDone: () => { },
    hide: () => { },
    clearPrefs: () => { },
    setContent: () => { },
    getActions: (data) => {data(JSON.stringify([
        {
            type: 'TELEMETRY',
            payload: 'sample-payload'
        }, {
            type: 'IMPORT',
            payload: 'sample-payload'
        }, {
            type: 'DEEPLINK',
            payload: 'payload'
        }
    ]))}
}

global.codePush = {
    getCurrentPackage: () => { },
    sync: () => { }
}

global.SyncStatus = {
    DOWNLOADING_PACKAGE: 'DOWNLOADING_PACKAGE',
    INSTALLING_UPDATE: 'INSTALLING_UPDATE',
    ERROR: 'ERROR'
}

global.plugins = {
    webViewChecker: {
        getCurrentWebViewPackageInfo: () => Promise.resolve({versionName: '0'}),
        openGooglePlayPage: () => Promise.resolve()
    }
}
global.FCMPlugin = {
    getToken: () => {},
    onNotification: () => {},
    onTokenRefresh: () => {},
    subscribeToTopic: () => {},
    unsubscribeFromTopic: () => {}
}

global.sbsync = {
    onSyncSucces: () => {}
}

global.qrScanner = {
    startScanner: (screenTitle, displayText, displayTextColor, buttonText, showButton, isRTL, callback) => {},
    stopScanner: () => {}
}

global.downloadManager = {
    enqueue: () => { }
}

