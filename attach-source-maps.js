let fs = require('fs');
let path = require('path');

const TARGET_DIR = 'www';

module.exports = function (ctx) {
    let files = fs.readdirSync(TARGET_DIR);
    if(!ctx.opts.options.release){
        console.log('=====================');
        console.log('attaching source maps');
        console.log('=====================');
        files.forEach(file => {
            let mapFile = path.join(TARGET_DIR, file + '.map');
            let targetFile = path.join(TARGET_DIR, file);
            console.log('file', file);
            console.log('mapFile', mapFile);
            if (path.extname(file) === '.js' && fs.existsSync(mapFile)) {
                let bufMap = fs.readFileSync(mapFile).toString('base64');
                let bufFile = fs.readFileSync(targetFile, "utf8");
                let result = bufFile.replace('sourceMappingURL=' + file + '.map', 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + bufMap);
                console.log('Target', targetFile);
                fs.writeFileSync(targetFile, result);
            }
        });
    }
};