import { Component, Input } from '@angular/core';
import { UtilityService } from '@app/services/utility-service';
import { NavParams, PopoverController } from '@ionic/angular';

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

  @Input() type;
  constructor(
    private utilityService: UtilityService,
    private popCtrl: PopoverController,
    private navParams: NavParams
  ) {
    this.init();
  }

  init() {
    this.upgradeType = this.navParams.get('type');

    if (this.upgradeType && this.upgradeType.optional === 'forceful') {
      this.isMandatoryUpgrade = true;
    }
  }

  cancel() {
    this.popCtrl.dismiss();
  }

  upgrade(link) {
    const appId = link.substring(link.indexOf('=') + 1, link.length);
    this.utilityService.openPlayStore(appId);
    this.cancel();
  }
}
