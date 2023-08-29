const path = require('path');
const fs = require('fs-extra');

function copyThemes(src, dist) {

    try {
        fs.readdirSync(src).forEach(function (file) {
            if(file == 'themes.xml' || file == 'colors.xml') {
                fs.copySync(src, dist);
                console.log('update themes and colors');
            }
        });
    } catch (e) {
        console.error(e);
    }

}
module.exports = function (context) {
    var srcPath;
    var destinationPath;

    srcPath = path.join(__dirname, '../../resources/android');
    destinationPath = path.join(__dirname, '../../platforms/android/app/src/main/res/values');
    copyThemes(srcPath, destinationPath);
}
