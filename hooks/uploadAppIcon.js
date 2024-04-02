var fs = require('fs');

let srcPath = 'configurations/icon.png';
let destPath = 'assets/icon.png';

checkFileAndUploadAppIcon();

function checkFileAndUploadAppIcon() {
    if (fs.existsSync(destPath)) {
        fs.rm(destPath, (err, data) => {
            if(err) {
                console.log('err ', err )
            } else {
                fs.copyFile(srcPath, destPath, (err, data) => {
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
            fs.copyFile(srcPath, destPath, (err, data) => {
                if(err) {
                    console.log('err cpy 1', err )
                } 
                console.log('data cpy ', data )
            })
        })
    }
}