const path = require('path');
const fs = require('fs-extra');

function copyFromNodeModule(src, dist) {
    try {
        const files = fs.readdirSync(src);
        files.forEach(function (file) {
            if (['assets', 'coreplugins', 'fonts', 'style.min.1.1.js', 'coreplugins.js',
             'script.min.1.1.js', 'style.min.1.1.css', 'youtube.html'].includes(file)) {
                fs.copySync(path.join(src, file), path.join(dist, file));
            }
        });
    } catch(e) {
        console.error(e);
    }

}

function copyFromContentPlayer(src, dist) {
    try {
        fs.copySync(src, dist);
    } catch(e) {
        console.error(e);
    }
    
}
module.exports = function (context) {
    var srcPath;
    var destinationPath;

    srcPath = path.join(__dirname, '../content-player');
    destinationPath = path.join(__dirname, '../www/content-player');
    copyFromContentPlayer(srcPath, destinationPath);
    console.log('copy completed!');

    srcPath = path.join(__dirname, '../node_modules/@project-sunbird/content-player');
    destinationPath = path.join(__dirname, '../www/content-player');
    copyFromNodeModule(srcPath, destinationPath);
    console.log('copy completed!');
}





