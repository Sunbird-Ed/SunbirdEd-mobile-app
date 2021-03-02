const path = require('path');
var fs = require('fs');

function deleteUnUsableIosIcon(ionicIconFilePath) {
    try {
        const files = fs.readdirSync(ionicIconFilePath);
        files.forEach(function (file) {
            if (!([
                "add.svg",
                "close.svg",
                "arrow-dropright-circle.svg",
                "arrow-dropdown.svg",
                "arrow-dropup.svg",
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
                "stats.svg",
                "checkmark.svg",
                "remove.svg",
                "play.svg",
                "notifications.svg",
                "notifications-outline.svg",
                "arrow-round-forward.svg",
                "refresh-circle.svg",
                "start.svg",
                "more.svg",
                "time.svg",
                "checkmark-circle.svg",
                "create.svg",
                "call.svg",
                "mail.svg",
                "arrow-round-down.svg",
                "download.svg",
                "search.svg",
                "close-circle.svg",
                "eye.svg",
                "alert-circle-outline.svg"
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