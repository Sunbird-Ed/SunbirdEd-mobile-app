import { Component, Input } from '@angular/core';
import { UtilityService } from '../../../../services/utility-service';

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
      private utilityService: UtilityService) {
      this.init();
  }

  init() {
    this.upgradeType = this.type;

    if (this.upgradeType.optional === 'forceful') {
        this.isMandatoryUpgrade = true;
    }
  }

  cancel() {
    /* migration-TODO
    this.viewCtrl.dismiss();
    */
  }

  upgrade(link) {
    const appId = link.substring(link.indexOf('=') + 1, link.lenght);
    this.utilityService.openPlayStore(appId);
    this.cancel();
  }

}