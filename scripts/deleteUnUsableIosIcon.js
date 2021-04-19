const path = require('path');
var fs = require('fs');

function deleteUnUsableIosIcon(ionicIconFilePath) {
    try {
        const files = fs.readdirSync(ionicIconFilePath);
        files.forEach(function (file) {
            if (!([
                "add.svg",
                "close.svg",
                "caret-forward-circle", // ionic 4 -> 5, md replacement of "arrow-dropright-circle.svg",
                "chevron-forward-circle", // ionic 4 -> 5, ios replacement of "arrow-dropright-circle.svg",
                "caret-down-circle", // ionic 4 -> 5, md replacement of "arrow-dropdown.svg",
                "chevron-down-circle", // ionic 4 -> 5, ios replacement of "arrow-dropdown.svg",
                "caret-up", // ionic 4 -> 5, md replacement of "arrow-dropup.svg",
                "chevron-up-circle-outline", // ionic 4 -> 5, ios replacement of "arrow-dropup.svg",
                "arrow-up.svg",
                "arrow-down.svg",
                "alert.svg",
                "star.svg",
                "cloud-download.svg",
                "trash.svg",
                "share.svg",
                "information-circle-outline.svg",
                "star-outline.svg",
                "refresh.svg",
                "print.svg",
                "sad.svg",
                "warning.svg",
                "arrow-back.svg",
                "arrow-forward.svg",
                "albums.svg",
                "information-circle.svg",
                "settings.svg",
                "person.svg",
                "stats-chart", // ionic 4 -> 5, renamed from stats.svg",
                "checkmark.svg",
                "remove.svg",
                "play.svg",
                "notifications.svg",
                "notifications-circle-outline", // ionic 4 -> 5, replacement of "notifications-outline.svg",
                "arrow-forward", // ionic 4 -> 5, replacement of "arrow-round-forward.svg",
                "refresh-circle.svg",
                "start.svg",
                "ellipsis-horizontal.svg", // ionic 4 -> 5, ios replacement of "more.svg",
                "ellipsis-vertical.svg", // ionic 4 -> 5, md replacement of "more.svg",
                "time.svg",
                "checkmark-circle.svg",
                "create.svg",
                "call.svg",
                "mail.svg",
                "arrow-down.svg", // ionic 4 -> 5, replacement of "arrow-round-down.svg",
                "download.svg",
                "search.svg",
                "close-circle.svg",
                "eye.svg",
                "alert-circle-outline.svg",
                'image-outline.svg',
                'camera.svg',
                'cloud-upload.svg',
                'caret-down.svg',
                'caret-forward.svg',
                'cloud-done.svg',
                'cloud-offline.svg',
                'document.svg',
                'radio-button-off-outline.svg',
                'share-social.svg',
                'calendar.svg',
                'newspaper.svg',
                'attach.svg',
                'image.svg',
                'map.svg',
                'book.svg',
                'checkmark-circle.svg',
                'caret-down-outline.svg',
                'location-outline.svg',
                'link-outline.svg',
                'caret-down.svg',
                'radio-button-off.svg',
                'md-location.svg',
                'md-link.svg',
                'funnel.svg',
                'clipboard.svg',
                'caret-down.svg',
                'radio-button-off.svg',
                'md-document.svg',
                'volume-medium.svg',
                'md-more.svg',
                'md-caret-down.svg',
                'person.svg',
                'calendar.svg',
                'chevron-forward.svg',
                'cloud-outline.svg',
                'ellipsis-vertical.svg',
                'caret-down.svg',
                'arrow-dropup-circle.svg',
                'add-circle.svg',
                'arrow-dropdown.svg',
                'arrow-dropright.svg',
                'musical-notes.svg',
                'videocam.svg',
                'md-information-circle.svg',
                'bulb.svg',
                'list.svg',
                'checkmark-circle.svg',
                'contrast.svg',
                'cloud-done.svg',
                'save.svg',
                'chevron-up-circle.svg',
                'cloud-upload.svg',
                'options.svg',
                'more.svg',
                'ellipsis-vertical-outline.svg',
                'document-text.svg',
                'caret-down-circle.svg',
                'file-tray-full.svg',
                'close-sharp.svg',
                'search-outline".svg',
                'pricetag-outline.svg',
                'play-skip-forward.svg',
                'share-social.svg'
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