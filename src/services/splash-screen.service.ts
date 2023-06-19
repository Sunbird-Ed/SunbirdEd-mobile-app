import { Injectable } from '@angular/core';
import { SplashscreenImportActionHandlerDelegate } from './sunbird-splashscreen/splashscreen-import-action-handler-delegate';
import { SplashcreenTelemetryActionHandlerDelegate } from './sunbird-splashscreen/splashcreen-telemetry-action-handler-delegate';
import { SplaschreenDeeplinkActionHandlerDelegate } from './sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { Platform } from '@ionic/angular';
import { AppGlobalService } from './app-global-service.service';

@Injectable()
export class SplashScreenService {

    constructor(
        private splashScreenImportActionHandlerDelegate: SplashscreenImportActionHandlerDelegate,
        private splashScreenTelemetryActionHandlerDelegate: SplashcreenTelemetryActionHandlerDelegate,
        private splashScreenDeeplinkActionHandlerDelegate: SplaschreenDeeplinkActionHandlerDelegate,
        private platform: Platform,
        private appGlobalService: AppGlobalService
    ) {

    }

    async handleSunbirdSplashScreenActions(): Promise<undefined> {
        const stringifiedActions = await new Promise<string>((resolve) => {
            if(this.platform.is('android') && splashscreen){
                splashscreen.getActions((actionsTobeDone) => {
                    resolve(actionsTobeDone);
                });
            }
        });

        let actions: { type: string, payload: any }[] = JSON.parse(stringifiedActions);
        if (!actions.length && !this.appGlobalService.isSplashscreenDisplay
            && (performance.navigation.type !== performance.navigation.TYPE_RELOAD)) {
            await this.appGlobalService.generateTelemetryForSplashscreen().then((data) => {
                actions = data;
                this.appGlobalService.isSplashscreenDisplay = true;
            });
        }
        if (actions.length) {
            for (const action of actions) {
                switch (action.type) {
                    case 'TELEMETRY': {
                        await this.splashScreenTelemetryActionHandlerDelegate.onAction(action.payload).toPromise();
                        break;
                    }
                    case 'IMPORT': {
                        await this.splashScreenImportActionHandlerDelegate.onAction(action.payload).toPromise();
                        break;
                    }
                    case 'DEEPLINK': {
                        await this.splashScreenDeeplinkActionHandlerDelegate.onAction(action.payload).toPromise();
                        break;
                    }
                    default:
                        return;
                }
            }
        }
        if(splashscreen){
            splashscreen.markImportDone();
        }
    }

}
