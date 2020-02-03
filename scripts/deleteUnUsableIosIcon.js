const path = require('path');
var fs = require('fs');

function deleteUnUsableIosIcon(ionicIconFilePath) {
    try {
        const files = fs.readdirSync(ionicIconFilePath);
        files.forEach(function (file) {
            if (!([
                'ios-close.svg',
                'ios-arrow-dropright-circle.svg',
                'ios-arrow-dropdown.svg',
                'ios-arrow-dropup.svg',
                'ios-arrow-up.svg',
                'ios-arrow-down.svg',
                'ios-alert.svg',
                'ios-star.svg',
                'ios-cloud-download.svg',
                'ios-trash.svg',
                'ios-share.svg',
                'ios-information-circle-outline.svg',
                'ios-star-outline.svg',
                'ios-refresh.svg',
                'ios-print.svg',
                'ios-sad.svg',
                'ios-warning.svg',
                'ios-arrow-back.svg',
                'ios-arrow-forward.svg',
                'ios-albums.svg',
                'ios-information-circle.svg',
            ].includes(file))) {
                fs.unlinkSync(ionicIconFilePath+'/'+file);
            }
        });
    } catch (e) {
        console.error(e);
    }

}

module.exports = function (context) {
    var ionicIconFolderPath;

    ionicIconFolderPath = path.join(__dirname, '../www/svg');
    console.log('deleted unusable Icon from www/svg');
    deleteUnUsableIosIcon(ionicIconFolderPath);
}

var ionicIconFolderPath;

ionicIconFolderPath = path.join(__dirname, '../www/svg');
console.log('deleted unusable Icon from www/svg');
deleteUnUsableIosIcon(ionicIconFolderPath);