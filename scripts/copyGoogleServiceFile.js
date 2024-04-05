const fs = require('fs');

// =================================google-services.json=================================================== //
if (process.argv[2] === 'android') {
	const googleServicesBase = 'configurations/google-services.json';
	const googleServicesCap = ['android/app/google-services.json', 'android/capacitor-cordova-android-plugins/google-services.json'];
  
  // google-service fix 
  googleServicesCap.forEach(capService => {
    fs.copyFile(googleServicesBase, capService, (err) => {
        if (err) {
            console.error(err);
        }
    });
  })
}
