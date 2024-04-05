var fs = require('fs');

let srcPath = 'configurations/icon.png';
let splashPath = 'configurations/splash.png';
let destPath = 'assets/icon.png';
let destSplashPath = 'assets/splash.png';

checkFileAndUploadAppIcon(srcPath, destPath);
checkFileAndUploadAppIcon(splashPath, destSplashPath);

function checkFileAndUploadAppIcon(src, dest) {
    if (fs.existsSync(dest)) {
        fs.rm(dest, (err, data) => {
            if(err) {
                console.log('err ', err )
            } else {
                fs.copyFile(src, dest, (err, data) => {
                    if(err) {
                        console.log('err cpy', err )
                    } 
                    console.log('data cpy ', data )
                })
            }

        })
    } else {
        fs.mkdir('assets', (err, data) => {
            if(err) {
                console.log('err cpy 2', err )
            }
            fs.copyFile(src, dest, (err, data) => {
                if(err) {
                    console.log('err cpy 1', err )
                } 
                console.log('data cpy ', data )
            })
        })
    }
}