import { Component, Input } from '@angular/core';
import { UtilityService } from '@app/services/utility-service';
import { NavParams, PopoverController } from '@ionic/angular';
import {
  Environment,
  ImpressionSubtype,
  ImpressionType,
  InteractSubtype,
  InteractType,
  PageId,
} from '@app/services';
import { TelemetryGeneratorService } from '../../../../services/telemetry-generator.service';
import { AppVersion } from '@ionic-native/app-version/ngx';

@Component({
  selector: 'app-upgrade-popover',
  templateUrl: './upgrade-popover.component.html',
  styleUrls: ['./upgrade-popover.component.scss'],
})
export class UpgradePopoverComponent {

  upgradeType: any;
  isMandatoryUpgrade = false;
  pageId: PageId;
  appName: string;
  actionButtonYes: any;
  actionButtonNo: any;

  @Input() type;
  constructor(
    private utilityService: UtilityService,
    private popCtrl: PopoverController,
    private navParams: NavParams,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appVersion: AppVersion,
  ) {
    this.init();
  }

  async init() {
    this.appName = await this.appVersion.getAppName();
    this.upgradeType = this.navParams.get('upgrade');
    if (this.upgradeType.type === 'force' || this.upgradeType.type === 'forced') {
      this.isMandatoryUpgrade = true;
    }

    if (this.upgradeType.actionButtons) {
      for (const actionButton of this.upgradeType.actionButtons) {
        if (actionButton.action === 'yes') {
          this.actionButtonYes = actionButton;
        } else if (actionButton.action === 'no') {
          this.actionButtonNo = actionButton;
        }
      }
    }

    const values = {};
    values['minVersionCode'] = this.upgradeType.minVersionCode;
    values['maxVersionCode'] = this.upgradeType.maxVersionCode;
    values['currentAppVersionCode'] = this.upgradeType.currentAppVersionCode;
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      ImpressionSubtype.UPGRADE_POPUP,
      PageId.UPGRADE_POPUP,
      Environment.HOME
    );
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.OTHER,
      InteractSubtype.FORCE_UPGRADE_INFO,
      Environment.HOME,
      PageId.UPGRADE_POPUP,
      undefined,
      values
    );
  }

  cancel() {
    this.popCtrl.dismiss();
  }

  upgradeApp(link) {
    const appId = link.substring(link.indexOf('=') + 1, link.length);
    this.utilityService.openPlayStore(appId);
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.UPGRADE_CLICKED,
      Environment.HOME,
      PageId.UPGRADE_POPUP,
      undefined
    );
    this.cancel();
  }
}
