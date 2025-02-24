import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Platform, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { UtilityService } from '../../../../services/utility-service';
import { CommonUtilService } from '../../../../services/common-util.service';
import { RouterLinks } from '../../../../app/app.constant';
import { Location } from '@angular/common';

@Component({
    selector: 'app-group-guidelines-popover',
    templateUrl: 'group-guidelines-popup.component.html',
    styleUrls: ['./group-guidelines-popup.component.scss'],
    standalone: false
})
export class GroupGuideLinesPopoverComponent implements OnInit, OnDestroy {

  @Input("shouldUpdateUserLevelGroupTnc") shouldUpdateUserLevelGroupTnc;
  backButtonFunc: Subscription;
  appName: string;
  showGroupGuideLinesError = false;
  agreedToGroupGuidelines = false;

  constructor(
    public popoverCtrl: PopoverController,
    private platform: Platform,
    private utilityService: UtilityService,
    private commonUtilService: CommonUtilService,
    private location: Location
    ) { }

  async ngOnInit() {
    this.appName = await this.commonUtilService.getAppName();
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, async () => {
      await this.popoverCtrl.dismiss({ isLeftButtonClicked: null });
      if(this.shouldUpdateUserLevelGroupTnc) {
        this.location.back();
      }
      this.backButtonFunc.unsubscribe();
    });
  }

  ngOnDestroy(): void {
    this.backButtonFunc.unsubscribe();
  }

  async closePopover() {
    await this.popoverCtrl.dismiss({ isLeftButtonClicked: null });
  }

  async continue() {
    if (this.agreedToGroupGuidelines) {
        await this.popoverCtrl.dismiss({ isLeftButtonClicked: true });
    } else {
        this.showGroupGuideLinesError = true;
    }
  }

  async openTermsOfUse() {
    const baseUrl = await this.utilityService.getBuildConfigValue('TOU_BASE_URL');
    const url = baseUrl + RouterLinks.TERM_OF_USE + '#groupGuidelines';
    const options
      = 'hardwareback=yes,clearcache=no,zoom=no,toolbar=yes,disallowoverscroll=yes';

    (window as any).cordova.InAppBrowser.open(url, '_blank', options);
  }

}
