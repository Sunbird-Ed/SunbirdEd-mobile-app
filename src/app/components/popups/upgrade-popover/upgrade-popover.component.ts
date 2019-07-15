import { Component, Input } from '@angular/core';
import { UtilityService } from '@app/services/utility-service';
import { ModalController } from '@ionic/angular';

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
    private modalCtrl: ModalController
  ) {
    this.init();
  }

  init() {
    this.upgradeType = this.type;

    if (this.upgradeType && this.upgradeType.optional === 'forceful') {
      this.isMandatoryUpgrade = true;
    }
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

  upgrade(link) {
    const appId = link.substring(link.indexOf('=') + 1, link.lenght);
    this.utilityService.openPlayStore(appId);
    this.cancel();
  }

}