const fs = require('fs');
const path = require('path');

let updateCode = `<uses-permission android:name="android.permission.RECORD_AUDIO" />
<queries>
    <intent>
        <action android:name="android.media.action.IMAGE_CAPTURE" />
    </intent>
    <intent>
        <action android:name="android.intent.action.GET_CONTENT" />
    </intent>
    <intent>
        <action android:name="android.intent.action.PICK" />
    </intent>
    <intent>
        <action android:name="com.android.camera.action.CROP" />
        <data android:mimeType="image/*" android:scheme="content" />
    </intent>
</queries>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
<uses-permission android:name="android.permission.GET_ACCOUNTS" />
<uses-permission android:name="android.permission.USE_CREDENTIALS" />
<uses-permission android:name="android.permission.ACCESS_NOTIFICATION_POLICY" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.BLUETOOTH" />
<queries>
    <intent>
        <action android:name="android.media.action.IMAGE_CAPTURE" />
    </intent>
    <intent>
        <action android:name="android.intent.action.GET_CONTENT" />
    </intent>
</queries>`
let destinationPath = 'android/app/src/main/AndroidManifest.xml';

fs.readFile(destinationPath, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('update manifest with permissions ');
    data = data.replace('<!-- Permissions -->', updateCode); // CHANGE APPLICATION ID
    fs.writeFile(destinationPath, data, (err) => {
        if (err) {
            console.error("********* err", err);
        }
    });
});