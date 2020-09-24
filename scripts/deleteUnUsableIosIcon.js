const path = require('path');
var fs = require('fs');

function deleteUnUsableIosIcon(ionicIconFilePath) {
    try {
        const files = fs.readdirSync(ionicIconFilePath);
        files.forEach(function (file) {
            if (!([
                'ios-add.svg',
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
                'ios-settings.svg',
                'ios-person.svg',
                'ios-stats.svg',
                'ios-checkmark.svg',
                'ios-remove.svg',
                'ios-play.svg',
                'ios-notifications.svg',
                'ios-notifications-outline.svg',
                'ios-arrow-round-forward.svg',
                'ios-refresh-circle.svg',
                'md-add.svg',
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
                'md-arrow-dropright-circle.svg',
                'md-alert.svg',
                'md-more.svg',
                'md-time.svg',
                'md-checkmark-circle.svg',
                'md-refresh.svg',
                'md-print.svg',
                'md-create.svg',
                'md-call.svg',
                'md-mail.svg',
                'md-arrow-round-down.svg',
                'md-arrow-round-forward.svg',
                'md-download.svg',
                'md-search.svg',
                'md-information-circle.svg',
                'md-settings.svg',
                'md-person.svg',
                'md-stats.svg',
                'md-checkmark.svg',
                'md-remove.svg',
                'md-play.svg',
                'md-notifications.svg',
                'md-notifications-outline.svg',
                'md-close-circle.svg',
                'md-eye.svg',
                'md-refresh-circle.svg',
                'alert-circle-outline.svg',
                'close.svg',
                'md-contact.svg'
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