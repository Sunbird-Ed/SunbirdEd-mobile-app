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
                "alert-circle-outline.svg"
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