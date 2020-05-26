import { Component, OnInit } from '@angular/core';
import { AppHeaderService, CommonUtilService, LoginHandlerService, AppGlobalService } from '@app/services';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TocCardType } from '@project-sunbird/common-consumption';
import { SbPopoverComponent } from '@app/app/components/popups/sb-popover/sb-popover.component';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-chapter-details',
  templateUrl: './chapter-details.page.html',
  styleUrls: ['./chapter-details.page.scss'],
})
export class ChapterDetailsPage implements OnInit {

  courseName: string;
  chapter: any;
  cardType: TocCardType = TocCardType.COURSE;
  private extrasData: any;

  constructor(
    private appHeaderService: AppHeaderService,
    private translate: TranslateService,
    private commonUtilService: CommonUtilService,
    private router: Router,
    private loginHandlerService: LoginHandlerService,
    private appGlobalService: AppGlobalService,
    private popoverCtrl: PopoverController,
  ) {
    if ((!this.router.getCurrentNavigation() || !this.router.getCurrentNavigation().extras) && this.appGlobalService.preSignInData) {
      this.extrasData = this.appGlobalService.preSignInData;
    } else {
      this.extrasData = this.router.getCurrentNavigation().extras.state;
    }
    this.courseName = this.extrasData.courseName;
    this.chapter = this.extrasData.chapterData;
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.appHeaderService.showHeaderWithBackButton();
  }

  startLearning() {
    const isUserLoggedIn = this.appGlobalService.isUserLoggedIn();
    if (!isUserLoggedIn) {
      this.showLoginPopup();
      return;
    }
    // TODO navigate to details
  }

  async showOverflowMenu(event) {
  }

  onTocCardClick(event) {
    console.log('onTocCardClick', event);
  }

  async showLoginPopup() {
    const confirm = await this.popoverCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
        sbPopoverMainTitle: this.commonUtilService.translateMessage('YOU_MUST_JOIN_TO_ACCESS_TRAINING_DETAIL'),
        metaInfo: this.commonUtilService.translateMessage('TRAININGS_ONLY_REGISTERED_USERS'),
        sbPopoverHeading: this.commonUtilService.translateMessage('OVERLAY_SIGN_IN'),
        isNotShowCloseIcon: true,
        actionsButtons: [
          {
            btntext: this.commonUtilService.translateMessage('OVERLAY_SIGN_IN'),
            btnClass: 'popover-color'
          },
        ]
      },
      cssClass: 'sb-popover info',
    });
    await confirm.present();
    const { data } = await confirm.onDidDismiss();
    if (data && data.canDelete) {
      this.loginHandlerService.signIn({skipRootNavigation: true, componentData: this.extrasData});
    }
  }

}
