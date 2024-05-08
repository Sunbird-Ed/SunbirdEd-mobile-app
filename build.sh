#!/bin/bash

# config properties exist or not
if [[ -f configurations/configuration.ts ]]; then 
    echo "File exists"
    # Simple script to clean install
    rm -rf node_modules
    rm -rf www
    rm package-lock.json

    npm install

    # Read properties from config.properties
    if [[ "$(uname)" == "Darwin" ]] || [[ "$(uname)" == "Linux" ]]; then
        APP_NAME=$(grep 'app_name' configurations/config.properties | cut -d'=' -f2)
        APP_ID=$(grep 'app_id' configurations/config.properties | cut -d'=' -f2)
    else
        APP_NAME=$(powershell.exe -Command "(Get-Content -Path 'configurations\config.properties' | Select-String 'app_name').ToString().Split('=')[1].Trim()")
        APP_ID=$(powershell.exe -Command "(Get-Content -Path 'configurations\config.properties' | Select-String 'app_id').ToString().Split('=')[1].Trim()")
    fi

    # Update capacitor.config.ts
    sed -i'' -e "s/'app.name'/'$APP_NAME'/" capacitor.config.ts
    sed -i'' -e "s/'app.id'/'$APP_ID'/" capacitor.config.ts

    echo "updated appname and appid"

    # Build your Ionic app, add android, generate icons and build
    npx cap add android
    # appIcon
    node scripts/uploadAppIcon.js
    npx @capacitor/assets generate --iconBackgroundColor '#ffffff' --iconBackgroundColorDark '#222222' --splashBackgroundColor '#ffffff' --splashBackgroundColorDark '#111111'
    
    # Build your Ionic app
    ionic build && npx cap sync
    
    npm run ionic-build

else
    echo "File does not exists"
fi
