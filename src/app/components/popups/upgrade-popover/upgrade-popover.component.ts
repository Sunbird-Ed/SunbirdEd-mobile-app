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

import {TelemetryGeneratorService} from '../../../../services/telemetry-generator.service';

@Component({
  selector: 'app-upgrade-popover',
  templateUrl: './upgrade-popover.component.html',
  styleUrls: ['./upgrade-popover.component.scss'],
})
export class UpgradePopoverComponent {

  upgradeType: any;
  upgradeTitle: string;
  upgradeContent: string;
  isMandatoryUpgrade = false;
  pageId: PageId;

  @Input() type;
  constructor(
    private utilityService: UtilityService,
    private popCtrl: PopoverController,
    private navParams: NavParams,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) {
    this.init();
  }

  init() {
    this.upgradeType = this.navParams.get('type');

    if (this.upgradeType && this.upgradeType.optional === 'forceful') {
      this.isMandatoryUpgrade = true;
    }
    this.telemetryGeneratorService.generateImpressionTelemetry(
        ImpressionType.VIEW,
        ImpressionSubtype.UPGRADE_POPUP,
        PageId.UPGRADE_POPUP,
        Environment.HOME,
        this.upgradeType
    );
  }

  cancel() {
    this.popCtrl.dismiss();
  }

  upgrade(link) {
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
