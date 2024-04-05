const fs = require('fs-extra');
const path = require('path')

function copyFromNodeModule(src, dist) {
    try {
        const files = fs.readdirSync(src);

        files.forEach(function (file) {
            if (!(['node_modules', 'preview.html', 'README.md', 'chunks', 'preview_cdn.html', 'package.json'].includes(file))) {
                fs.copySync(path.join(src, file), path.join(dist, file));
            }
        });
    } catch (e) {
        console.error(e);
    }

}

function copyFromContentPlayer(src, dist) {
    try {
        console.log('copy sync form content player');
        fs.copySync(src, dist);
    } catch (e) {
        console.log('error on copy form content player');
        console.error(e);
    }

}
var srcPath;
var destinationPath;
var destinationPath1;
console.log('***** copy content');
srcPath = 'content-player';
destinationPath = 'www/content-player';
destinationPath1 = 'dist/content-player';
copyFromContentPlayer(srcPath, destinationPath);
copyFromContentPlayer(srcPath, destinationPath1);
console.log('copied from content-player to www/content-player');

srcPath = 'node_modules/@project-sunbird/content-player';
destinationPath = 'www/content-player';
destinationPath1 = 'dist/content-player';
copyFromNodeModule(srcPath, destinationPath);
copyFromNodeModule(srcPath, destinationPath1);
console.log('copied from node_modules/content-player to wwww/content-player');





