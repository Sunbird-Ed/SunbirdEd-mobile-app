var parseString = require("xml2js").parseString;
var xml2js = require("xml2js");
const fs = require('fs-extra');
const propertiesReader = require('properties-reader');

(function () {
    const configXmlPath = "config.xml";
    const properties = propertiesReader('buildConfig/sunbird-ios.properties');
    fs.readFile(configXmlPath, "utf-8", function (err, data) {
        if (err) console.log(err);
        parseString(data, function (err, result) {
            if (err) console.log(err);
            var json = result;
            json.widget.$.id = properties.get('app_id')
            json.widget.name = properties.get('app_name')
            const deeplinkDomain = `applinks:${properties.get('deeplink_base_url')}`
            for (const platform of json.widget.platform) {
                if (platform.$.name === 'ios') {
                    if (platform["config-file"]) {
                        for (const config of platform["config-file"]) {
                            for (const domain of config.array) {
                                domain.string = [deeplinkDomain]
                            }
                        }
                    }
                }
            }
            var builder = new xml2js.Builder();
            var xml = builder.buildObject(json);

            fs.writeFile(configXmlPath, xml, function (err, data) {
                if (err) console.log(err);
                console.log("updated config.xml");
            });
        });
    });
})();
