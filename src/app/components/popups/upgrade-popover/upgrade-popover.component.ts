import { Component, Input } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import {
  Environment, ID,
  ImpressionSubtype,
  ImpressionType,
  InteractSubtype,
  InteractType,
  PageId,
} from '../../../../services/telemetry-constants';
import { TelemetryGeneratorService } from '../../../../services/telemetry-generator.service';
import { App } from '@capacitor/app';

declare const cordova;


@Component({
    selector: 'app-upgrade-popover',
    templateUrl: './upgrade-popover.component.html',
    styleUrls: ['./upgrade-popover.component.scss'],
    standalone: false
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
    private popCtrl: PopoverController,
    private navParams: NavParams,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) {
    this.init();
  }

  async init() {
    const values = {};
    this.appName = await (await App.getInfo()).name;
    this.upgradeType = this.navParams.get('upgrade');
    if (this.upgradeType.type === 'force' || this.upgradeType.type === 'forced') {
      this.isMandatoryUpgrade = true;
      values['minVersionCode'] = this.upgradeType.minVersionCode;
      values['maxVersionCode'] = this.upgradeType.maxVersionCode;
    }
    values['currentAppVersionCode'] = this.upgradeType.currentAppVersionCode;
    values['requiredVersionCode'] = this.upgradeType.requiredVersionCode;
    const impressionSubtype: string = this.upgradeType.requiredVersionCode ? ImpressionSubtype.DEEPLINK : ImpressionSubtype.UPGRADE_POPUP;
    if (this.upgradeType.actionButtons) {
      for (const actionButton of this.upgradeType.actionButtons) {
        if (actionButton.action === 'yes') {
          this.actionButtonYes = actionButton;
        } else if (actionButton.action === 'no') {
          this.actionButtonNo = actionButton;
        }
      }
    }
    const interactSubType: string = this.upgradeType.type === 'force' || this.upgradeType.type === 'forced'
        ? InteractSubtype.FORCE_UPGRADE_INFO : this.upgradeType.type === 'optional' &&
        this.upgradeType.isFromDeeplink ? InteractSubtype.DEEPLINK_UPGRADE : InteractSubtype.OPTIONAL_UPGRADE;

    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      impressionSubtype,
      PageId.UPGRADE_POPUP,
      this.upgradeType.isOnboardingCompleted ? Environment.HOME : Environment.ONBOARDING
    );
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.OTHER,
      interactSubType,
      this.upgradeType.isOnboardingCompleted ? Environment.HOME : Environment.ONBOARDING,
      PageId.UPGRADE_POPUP,
      undefined,
      values
    );
  }

  async cancel() {
    await this.popCtrl.dismiss();
    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.OTHER,
        '',
        this.upgradeType.isOnboardingCompleted ? Environment.HOME : Environment.ONBOARDING,
        PageId.UPGRADE_POPUP,
        undefined,
        undefined,
        undefined,
        undefined,
        ID.CANCEL_CLICKED
    );
  }

  async upgradeApp(link) {
    // for in app update
    cordova.plugins.InAppUpdateManager.checkForImmediateUpdate(
        () => {},
        () => {}
    );
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.UPGRADE_CLICKED,
      Environment.HOME,
      PageId.UPGRADE_POPUP
    );
    if (this.upgradeType.type === 'optional') {
      await this.popCtrl.dismiss();
    }
  }
}
