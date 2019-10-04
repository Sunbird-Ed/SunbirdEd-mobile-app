import {SplashscreenImportActionHandlerDelegate} from '@app/services/sunbird-splashscreen/splashscreen-import-action-handler-delegate';
import {SplashcreenTelemetryActionHandlerDelegate} from '@app/services/sunbird-splashscreen/splashcreen-telemetry-action-handler-delegate';
import {SplaschreenDeeplinkActionHandlerDelegate} from '@app/services/sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import {Injectable} from '@angular/core';

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
             splashscreen.getActions((actionsTobeDone) => {
                 resolve(actionsTobeDone);
             });
         });

         const actions: { type: string, payload: any }[] = JSON.parse(stringifiedActions);

         if (!actions.length) {
             splashscreen.markImportDone();
             splashscreen.hide();
             return;
         }

         for (const action of actions) {
            switch (action.type) {
                case 'TELEMETRY': {
                    await this.splashScreenTelemetryActionHandlerDelegate.onAction(action.type, action.payload).toPromise();
                    break;
                }
                case 'IMPORT': {
                    await this.splashScreenImportActionHandlerDelegate.onAction(action.type, action.payload).toPromise();
                    break;
                }
                case 'DEEPLINK': {
                    await this.splashScreenDeeplinkActionHandlerDelegate.onAction(action.payload.type, action.payload).toPromise();
                    break;
                }
                default:
                    return;
            }
        }

         splashscreen.markImportDone();
         splashscreen.hide();
    }

}
