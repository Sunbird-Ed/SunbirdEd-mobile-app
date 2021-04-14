import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { RouterLinks } from '@app/app/app.constant';
import { UtilityService } from '@app/services';

@Component({
  selector: 'app-privacy-policy-and-tc',
  templateUrl: './privacy-policy-and-tc.component.html',
  styleUrls: ['./privacy-policy-and-tc.component.scss'],
})
export class PrivacyPolicyAndTCComponent implements OnInit {
  @Input() header;
  @Input() link;
  @Input() message;
  @Input() message1;
  @Input() linkLabel;
  isChecked = false;
  constructor(
    private popOverCtrl: PopoverController,
    private utilityService :UtilityService
  ) { }

  ngOnInit() {}
  closePopover() {
    this.popOverCtrl.dismiss(this.isChecked);
  }
  changeEvent(event) {
    debugger
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
