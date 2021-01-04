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
                'ios-caret-down.svg',
                'ios-caret-forward.svg',
                'ios-cloud-done.svg',
                'ios-cloud-offline-outline.svg',
                'ios-document.svg',
                'ios-radio-button-off-outline.svg',
                'ios-attach.svg',
                'ios-camera.svg',
                'ios-create.svg',
                'ios-person-outline.svg',
                'ios-share-social.svg',
                'ios-calendar-outline.svg',
                'ios-newspaper-outline.svg',
                'ios-attach-outline.svg',
                'ios-image-outline.svg',
                'ios-attach-outline.svg',
                'ios-book.svg',
                'ios-checkmark-circle.svg',
                'ios-contrast.svg',
                'ios-cloud-done.svg',
                'ios-list-box.svg',
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
                'md-arrow-forward.svg',
                'alert-circle-outline.svg',
                'close.svg',
                'md-camera.svg',
                'md-document.svg',
                'md-cloud-upload.svg',
                'md-filing.svg',
                'md-caret-down.svg',
                'md-caret-forward.svg',
                'md-cloud-done.svg',
                'md-cloud-offline-outline.svg',
                'md-document.svg',
                'md-radio-button-off-outline.svg',
                'md-attach.svg',
                'md-person.svg',
                'md-share-social.svg',
                'md-calendar.svg',
                'md-newspaper.svg',
                'md-attach.svg',
                'md-image.svg',
                'md-map.svg',
                'md-book.svg',
                'md-checkmark-circle.svg',
                'md-contrast.svg',
                'md-cloud-done.svg',
                'md-list-box.svg',
                'md-caret-down-outline.svg',
                'md-location-outline.svg',
                'md-link-outline.svg',
                'md-caret-down.svg',
                'md-ellipsis-vertical.svg',
                'md-radio-button-off.svg',
                'md-location.svg',
                'md-link.svg',
                'md-funnel.svg',
                'md-caret-down.svg',
                'md-ellipsis-vertical.svg',
                'md-person.svg',
                'md-share-social.svg',
                'md-calendar.svg',
                'md-newspaper.svg',
                'md-image.svg',
                'md-attach.svg'
            ].includes(file))) {
                fs.unlinkSync(ionicIconFilePath + '/' + file);
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