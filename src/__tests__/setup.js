require('reflect-metadata');
require('babel-polyfill');

global.cordova = {
    plugins: {
        notification: {
            local: {
                lanchDetails: {},
                getScheduledIds: () => {},
                schedule: () => {}
            }
        },
        diagnostic: {
            switchToSettings: () => {}
        }
    },
    file: {
        applicationDirectory: "/path"
    }
};

global.supportfile = {
    shareSunbirdConfigurations: () => {}
}
