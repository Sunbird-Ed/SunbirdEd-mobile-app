import { Component, Input,OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { RouterLinks } from '@app/app/app.constant';
import { CommonUtilService,UtilityService } from '@app/services';

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
  @Input() isPrivacyPolicy;
  isChecked = false;
  isClicked = false;
  appName;
  constructor(
    private popOverCtrl: PopoverController,
    private utilityService: UtilityService,
    private commonUtilService : CommonUtilService
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
  ngOnInit(){
    this.commonUtilService.getAppName().then((res) => { this.appName = res; });
  }
  async openTermsOfUse() {
    const baseUrl = await this.utilityService.getBuildConfigValue('TOU_BASE_URL');
    const url = baseUrl + RouterLinks.TERM_OF_USE;
    const options
      = 'hardwareback=yes,clearcache=no,zoom=no,toolbar=yes,disallowoverscroll=yes';
    (window as any).cordova.InAppBrowser.open(url, '_blank', options);
  }
}
