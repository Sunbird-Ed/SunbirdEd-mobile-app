const path = require('path');
const fs = require('fs-extra');
const srcPath = 'node_modules/@project-sunbird/content-player';
const destinationPath = 'www/content-player';

fs.readdir(srcPath, function (err, files) {
    if (err) {
        // return console.log('Unable to scan directory: ' + err);
    }
    files.forEach(function (file) {
        if (file !== 'node_modules' && file !== 'preview.html' && file !== 'README.md'
            && file !== 'chunks' && file !== 'preview_cdn.html' && file !== 'package.json') {
            //    console.log(file);
            fs.copy(path.join(srcPath, file), path.join(destinationPath, file), (err) => {
                if (err) throw err;
              //  console.log('File was copied to destination');
            });
        }
    });
});





