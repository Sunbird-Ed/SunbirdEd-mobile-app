require('reflect-metadata');
require('babel-polyfill');

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
            print: () => {}
        }
    },
    file: {
        applicationDirectory: "/path"
    },
    InAppBrowser: {
        open: () => ({
            addEventListener: () => { },
        }),
    }
};

global.supportfile = {
    shareSunbirdConfigurations: () => { },
    makeEntryInSunbirdSupportFile: () => { }
}
global.document = {
    getElementById: () => {},
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
    getCurrentPackage: () => { }
}
