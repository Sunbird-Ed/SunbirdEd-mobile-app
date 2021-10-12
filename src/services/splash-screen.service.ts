import { Injectable } from '@angular/core';
import { SplashscreenImportActionHandlerDelegate } from './sunbird-splashscreen/splashscreen-import-action-handler-delegate';
import { SplashcreenTelemetryActionHandlerDelegate } from './sunbird-splashscreen/splashcreen-telemetry-action-handler-delegate';
import { SplaschreenDeeplinkActionHandlerDelegate } from './sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';

@Injectable()
export class SplashScreenService {

    constructor(
        private splashScreenImportActionHandlerDelegate: SplashscreenImportActionHandlerDelegate,
        private splashScreenTelemetryActionHandlerDelegate: SplashcreenTelemetryActionHandlerDelegate,
        private splashScreenDeeplinkActionHandlerDelegate: SplaschreenDeeplinkActionHandlerDelegate,
    ) {

    }

    async handleSunbirdSplashScreenActions(): Promise<undefined> {
        const stringifiedActions = await new Promise<string>((resolve) => {
            if(splashscreen){
                splashscreen.getActions((actionsTobeDone) => {
                    resolve(actionsTobeDone);
                });
            }
        });

        const actions: { type: string, payload: any }[] = JSON.parse(stringifiedActions);

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
            splashscreen.hide();
        }
    }

}
