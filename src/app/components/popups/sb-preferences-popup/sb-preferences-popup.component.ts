import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TelemetryGeneratorService } from '@app/services';
import { AppVersion } from '@ionic-native/app-version/ngx';

@Component({
    selector: 'app-sb-preferences-popup',
    templateUrl: './sb-preferences-popup.component.html',
    styleUrls: ['./sb-preferences-popup.component.scss']
})
export class SbPreferencePopupComponent implements OnInit {
    @Input() public userName = '';
    @Input() public preferenceData;

    public appLabel = '';

    constructor(
        private modalCtrl: ModalController,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private appVersion: AppVersion
    ) {
        this.appVersion.getAppName().then((appName: any) => {
            this.appLabel = appName;
        });
    }

    ngOnInit(): void {
        // this.telemetryGeneratorService.generateImpressionTelemetry(
        //     ImpressionType.POP_UP_CATEGORY,
        //     '',
        //     Environment.HOME,
        //     PageId.HOME,
        //     undefined, undefined, undefined, undefined, undefined
        // );
    }

    changePreference() {
        this.modalCtrl.dismiss({ showPreference: true });
    }
}
