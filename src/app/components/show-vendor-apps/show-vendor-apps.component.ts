import {Component, OnInit} from '@angular/core';
import {TelemetryGeneratorService, UtilityService} from '@app/services';
import {NavParams} from '@ionic/angular';

@Component({
    selector: 'show-vendor-apps',
    templateUrl: './show-vendor-apps.component.html',
    styleUrls: ['./show-vendor-apps.component.scss'],
})
export class ShowVendorAppsComponent implements OnInit {
    appLists = [];
    content: any;
    systemAppsLists;

    constructor(
        private navParams: NavParams,
        private utilityService: UtilityService,
        private telemetryGeneratorService: TelemetryGeneratorService
    ) {
        this.content = this.navParams.get('content');
        this.appLists = this.navParams.get('appLists');
    }

    async ngOnInit() {
        this.systemAppsLists = await this.utilityService.checkAvailableAppList(this.appLists.map((a) => a.android.packageId));
    }

    open3rdPartyApps(packageId: string) {
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
        }).catch((error) => {
            // error
            console.log('------------', error);
        });
    }
}
