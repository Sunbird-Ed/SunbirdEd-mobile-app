import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TelemetryGeneratorService } from '@app/services';
import { AppVersion } from '@ionic-native/app-version/ngx';

@Component({
    selector: 'app-sb-preferences-popup',
    templateUrl: './sb-preferences-popup.component.html',
    styleUrls: ['./sb-preferences-popup.component.scss']
})
export class SbPreferencePopupComponent {
    @Input() public userName = '';
    @Input() public preferenceData;

    public appLabel = '';

    constructor(
        private modalCtrl: ModalController,
        private appVersion: AppVersion
    ) {
        this.appVersion.getAppName().then((appName: any) => {
            this.appLabel = appName;
        });
    }

    changePreference() {
        this.modalCtrl.dismiss({ showPreference: true });
    }
}
