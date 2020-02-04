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
                'md-trash.svg',
                'md-share.svg',
                'md-arrow-back.svg',
                'md-arrow-dropdown.svg',
                'md-arrow-dropup.svg',
                'md-cloud-download.svg',
                'md-star.svg',
                'md-star-outline.svg',
                'md-close.svg',
                'md-start.svg',
                'md-arrow-dropright-circle',
                'md-alert',
                'md-more',
                'md-time',
                'md-checkmark-circle',
                'md-refresh',
                'md-print',
                'md-create',
                'md-call',
                'md-mail',
                'md-arrow-round-down',
                'md-arrow-round-forward',
                'md-download',
                'md-search',
                'md-information-circle'
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