import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { RouterLinks } from '@app/app/app.constant';
import { UtilityService } from '@app/services';

@Component({
  selector: 'app-privacy-policy-and-tc',
  templateUrl: './privacy-policy-and-tc.component.html',
  styleUrls: ['./privacy-policy-and-tc.component.scss'],
})
export class PrivacyPolicyAndTCComponent {
  @Input() header;
  @Input() link;
  @Input() message;
  @Input() message1;
  @Input() linkLabel;
  @Input() isPrivacyPolicy;
  isChecked = false;
  isClicked = false;
  constructor(
    private popOverCtrl: PopoverController,
    private utilityService: UtilityService
  ) { }

  closePopover() {
    let data = {
      isChecked: this.isChecked,
      isClicked: true
    }
    this.popOverCtrl.dismiss(data);
  }
  changeEvent(event) {
    if (event.detail.checked) {
      this.isChecked = true;
    } else {
      this.isChecked = false;
    }
  }

  async openTermsOfUse() {
    const baseUrl = await this.utilityService.getBuildConfigValue('TOU_BASE_URL');
    const url = baseUrl + RouterLinks.TERM_OF_USE;
    const options
      = 'hardwareback=yes,clearcache=no,zoom=no,toolbar=yes,disallowoverscroll=yes';
    (window as any).cordova.InAppBrowser.open(url, '_blank', options);
  }
}
