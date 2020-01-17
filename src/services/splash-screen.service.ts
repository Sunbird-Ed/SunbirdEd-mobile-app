import { Injectable } from '@angular/core';
import { SplashscreenImportActionHandlerDelegate } from './sunbird-splashscreen/splashscreen-import-action-handler-delegate';
import { SplashcreenTelemetryActionHandlerDelegate } from './sunbird-splashscreen/splashcreen-telemetry-action-handler-delegate';
import { SplaschreenDeeplinkActionHandlerDelegate } from './sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
// import {PopoverController} from '@ionic/angular';
// import {ImportPopoverComponent} from '@app/app/components/import-popover/import-popover.component';

@Injectable()
export class SplashScreenService {

    constructor(
        private splashScreenImportActionHandlerDelegate: SplashscreenImportActionHandlerDelegate,
        private splashScreenTelemetryActionHandlerDelegate: SplashcreenTelemetryActionHandlerDelegate,
        private splashScreenDeeplinkActionHandlerDelegate: SplaschreenDeeplinkActionHandlerDelegate,
        // private popoverCtrl: PopoverController
    ) {

    }

    async handleSunbirdSplashScreenActions(): Promise<undefined> {
        const stringifiedActions = await new Promise<string>((resolve) => {
            splashscreen.getActions((actionsTobeDone) => {
                resolve(actionsTobeDone);
            });
        });

        const actions: { type: string, payload: any }[] = JSON.parse(stringifiedActions);

        if (actions.length) {
            for (const action of actions) {
                switch (action.type) {
                    case 'TELEMETRY': {
                        await this.splashScreenTelemetryActionHandlerDelegate.onAction(action.type, action.payload).toPromise();
                        break;
                    }
                    case 'IMPORT': {
                        // const popover = await this.popoverCtrl.create({
                        //     component: ImportPopoverComponent,
                        //     componentProps: {},
                        //     cssClass: 'sb-popover',
                        // });
                        // popover.present();
                        //
                        // await new Promise(async (resolve) => {
                        //     const result = await popover.onDidDismiss();
                        //
                        //     if (result.data.isDeleteChecked) {
                        //     } else {
                        //     }
                        //
                        //     resolve();
                        // });

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
        }

        splashscreen.markImportDone();
        splashscreen.hide();
    }

}
