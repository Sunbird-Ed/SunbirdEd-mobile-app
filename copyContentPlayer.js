const path = require('path');
const fs = require('fs-extra');
var srcPath;
var destinationPath;

function copyFromNodeModule(src, dist) {
    fs.readdir(src, function (err, files) {
        if (err) {
            // return console.log('Unable to scan directory: ' + err);
        }
        files.forEach(function (file) {
            if (file !== 'node_modules' && file !== 'preview.html' && file !== 'README.md'
                && file !== 'chunks' && file !== 'preview_cdn.html' && file !== 'package.json') {
                //    console.log(file);
                fs.copy(path.join(src, file), path.join(dist, file), (err) => {
                    if (err) throw err;
                    //  console.log('File was copied to destination');
                });
            }
        });
    });
}

function copyFromContentPlayer(src, dist) {
    fs.readdir(src, function (err, files) {
        if (err) {
          //  return console.log('Unable to scan directory: ' + err);
        }
        files.forEach(function (file) {
            if (file === 'canvas-interface.js' || file === 'canvas-telemetry-interface.js'
                || file === 'polyfills.js' || file === 'preview.html') {
             //   console.log(file);
                fs.copy(path.join(src, file), path.join(dist, file), (err) => {
                    if (err) throw err;
                  //  console.log('File was copied to destination');
                });
            }
        });
    });
}

module.exports = function (context) {
    srcPath = 'node_modules/@project-sunbird/content-player';
    destinationPath = 'www/content-player';
    copyFromNodeModule(srcPath, destinationPath);
    console.log('copy file/folders from node_modules/content-player to www/content-player')
    srcPath = 'content-player';
    destinationPath = 'www/content-player';
    copyFromContentPlayer(srcPath, destinationPath);
    console.log('copy file/folders from app content-player to www/content-player');
}
