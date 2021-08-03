const fs    = require('fs-extra');  
const plist = require('plist');
const glob = require('tiny-glob');
const propertiesReader = require('properties-reader');
let environment;

module.exports = function (context) {

    (async function(){
        
        const properties = propertiesReader('buildConfig/sunbird-ios.properties');
        const files = await glob('platforms/ios/*/*-Info.plist');
        let xml = fs.readFileSync(files[0], 'utf8');
        let obj = plist.parse(xml);
        const defaultConfig = ["DISPLAY_FRAMEWORK_CATEGORIES_IN_PROFILE", 
                                "DISPLAY_SIGNIN_FOOTER_CARD_IN_COURSE_TAB_FOR_TEACHER", 
                                "DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_TEACHER", 
                                "DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_TEACHER",
                                "DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_STUDENT",
                                "DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_STUDENT",
                                "TRACK_USER_TELEMETRY", 
                                "CONTENT_STREAMING_ENABLED",
                                "DISPLAY_ONBOARDING_CATEGORY_PAGE",
                                "OPEN_RAPDISCOVERY_ENABLED", 
                                "SUPPORT_EMAIL",
                                "deeplink_base_url",
                                "deeplink_ncert_url",
                                "deeplink_igot_url",
                                'BASE_URL', 
                                'MERGE_ACCOUNT_BASE_URL', 
                                'PRODUCER_ID', 
                                'CHANNEL_ID', 
                                'MAX_COMPATIBILITY_LEVEL', 
                                'MOBILE_APP_CONSUMER', 
                                'MOBILE_APP_KEY', 
                                'MOBILE_APP_SECRET', 
                                'OAUTH_REDIRECT_URL',
                                'TOU_BASE_URL', 
                                'SURVEY_BASE_URL', 
                                'PROJECTS_BASE_URL',
                                'VERSION_NAME',
                                'ENVIRONMENT']

        defaultConfig.forEach(config => {
            obj[config] = properties.get(config.toLowerCase()) + ""
        });
        environment = properties.get('environment')+""
        obj['custom_scheme_url'] = properties.get('custom_scheme') + ""
        obj['REAL_VERSION_NAME'] = properties.get('version_name') + "" 
        obj['FLAVOR'] = properties.get('version_name')+""
        obj['APPLICATION_ID'] = properties.get('app_id') + "" 
        // obj['VERSION_CODE'] = properties.get('app_version_code')

        const releaseBuild = process.argv.some(arg => arg === "--release")
        obj["DEBUG"] = !releaseBuild
        obj["BUILD_TYPE"] = releaseBuild ? "release" : "debug" 

        xml = plist.build(obj);
        fs.writeFileSync(files[0], xml, { encoding: 'utf8' });

        //copy the data
        await fs.remove('platforms/ios/www/assets/data')
        await fs.ensureDir('platforms/ios/www/assets/data')
        await fs.ensureDir('platforms/ios/www/assets/data/faq')
        await fs.copy(`buildConfig/data/${environment}`, 'platforms/ios/www/assets/data')
        await fs.copy(`buildConfig/data/notificationconfig`, 'platforms/ios/www/assets/data')
        await fs.copy(`buildConfig/data/faq`, 'platforms/ios/www/assets/data/faq')
        await fs.copy(`buildConfig/data/content-rating`, 'platforms/ios/www/assets/data/content-rating')

    })();
};
