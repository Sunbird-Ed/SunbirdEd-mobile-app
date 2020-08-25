var fs = require("fs");
var fsextra = require('fs-extra');

var languageList = [
    "Assamese",
    "Bengali",
    "English",
    "Gujarati",
    "Hindi",
    "Kannada",
    "Marathi",
    "Oriya",
    "Punjabi",
    "Tamil",
    "Telugu",
    "Urdu"
];

var languageCodeList = [
    "as",
    "bn",
    "en",
    "gu",
    "hi",
    "kn",
    "mr",
    "or",
    "pa",
    "ta",
    "te",
    "ur"
];

formatFaqTranslations();

async function formatFaqTranslations() {
    createSubFolders('.', 'res');
    for (let i = 0; i < languageList.length; i++) {
        const data = await readFile(languageList[i]);

        const response = {
            "faqs": [],
            "constants": {}
        };

        if (data['constants']) {
            response.constants = data['constants'];
        }

        //console.log(Object.keys(data));
        var j = 1;
        while (data['FAQ_' + j] && data['ANS_' + j]) {
            console.log(j, data['FAQ_' + j]);
            response.faqs.push({ "topic": data['FAQ_' + j], "description": data['ANS_' + j] });
            j++;
        }

        await writeFile('res', 'faq-' + languageCodeList[i], JSON.stringify(response));
    }
}

async function readFile(fileName) {
    var data = JSON.parse(fs.readFileSync('./' + fileName + '.json', 'utf8'));

    return new Promise((resolve, reject) => {
        resolve(data);
    });
}

async function writeFile(dirName, fileName, response) {
    return new Promise((resolve, reject) => {
        var name = dirName + '/' + fileName + '.json';
        fs.writeFile(name, response, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log("File " + name + " saved")
                resolve();
            }
        });
    });
}

function createSubFolders(rootDir, dirName) {
    var dir = rootDir + '/' + dirName;
    return new Promise((resolve, reject) => {
        try {
            if (!fs.existsSync(dir)) {
                fsextra.ensureDirSync(dir);
                resolve(dir);
            } else {
                resolve(dir)
            }
        } catch (err) {
            reject(err);
        }
    });

}