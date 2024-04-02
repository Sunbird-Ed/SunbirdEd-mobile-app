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
var srcPath;
var destinationPath;

srcPath = 'configurations/android';
destinationPath = 'android/app/src/main/res/values';
copyThemes(srcPath, destinationPath);
