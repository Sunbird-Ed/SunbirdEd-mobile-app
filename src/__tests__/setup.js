require('reflect-metadata');
require('babel-polyfill');
require('./regexp-polyfill.min')

window.dayjs = require('dayjs')

global.cordova = {
    plugins: {
        notification: {
            local: {
                lanchDetails: {},
                getScheduledIds: () => { },
                schedule: () => { }
            }
        },
        diagnostic: {
            switchToSettings: () => { }
        },
        printer: {
            print: () => { }
        }
    },
    file: {
        applicationDirectory: "/path"
    },
    InAppBrowser: {
        open: () => ({
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
    subscribeToTopic: () => {}
}
