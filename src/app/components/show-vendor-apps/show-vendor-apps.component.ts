import {Component, OnInit} from '@angular/core';
import {CommonUtilService, TelemetryGeneratorService, UtilityService} from '@app/services';
import {NavParams, PopoverController} from '@ionic/angular';

@Component({
    selector: 'show-vendor-apps',
    templateUrl: './show-vendor-apps.component.html',
    styleUrls: ['./show-vendor-apps.component.scss'],
})
export class ShowVendorAppsComponent implements OnInit {
    appLists = [];
    content: any;
    appListAvailability = {};
    isAppListAvailable = false;
    appName = '';

    constructor(
        private navParams: NavParams,
        private utilityService: UtilityService,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private popOverCtrl: PopoverController,
        private commonUtilService: CommonUtilService
    ) {
        this.content = this.navParams.get('content');
        this.appLists = this.navParams.get('appLists');
    }

    async ngOnInit() {
        this.appName = await this.commonUtilService.getAppName();
        this.appListAvailability = await this.utilityService.checkAvailableAppList(this.appLists.map((a) => a.android.packageId));
        this.isAppListAvailable = Object.keys(this.appListAvailability).some((packageId) => {
            return this.appListAvailability[packageId];
        });
    }

    openThirdPartyApps(packageId: string, appListAvailability) {
        if (appListAvailability) {
            this.utilityService.startActivityForResult({
                package: packageId,
                extras: {
                    content: this.content
                },
                requestCode: 101,
            }).then((result: any) => {
                const telemetryResult = result.extras;
                this.telemetryGeneratorService.generateSummaryTelemetry(
                    telemetryResult.edata.type,
                    telemetryResult.edata.starttime,
                    telemetryResult.edata.endtime,
                    telemetryResult.edata.timespent,
                    telemetryResult.edata.pageviews,
                    telemetryResult.edata.interactions,
                    'home'
                );
                this.popOverCtrl.dismiss();
            }).catch((error) => {
                // error
                console.log('------------', error);
            });
        } else {
            this.utilityService.openPlayStore(packageId);
        }
    }
}
