import { Component, Inject, OnInit } from '@angular/core';
import { NavParams, Platform, PopoverController } from '@ionic/angular';
import { AppRatingService } from '@app/services/app-rating.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { UtilityService } from '@app/services/utility-service';
import { SharedPreferences, TelemetryService } from 'sunbird-sdk';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Observable } from 'rxjs';
import { PreferenceKey, StoreRating } from '@app/app/app.constant';
import {
  Environment,
  ImpressionSubtype,
  ImpressionType,
  InteractSubtype,
  InteractType
} from '@app/services/telemetry-constants';
import { map } from 'rxjs/operators';

enum ViewType {
  APP_RATE = 'appRate',
  STORE_RATE = 'storeRate',
  HELP_DESK = 'helpDesk',
}

interface ViewText {
  type: string;
  heading: string;
  message: string;
}

@Component({
  selector: 'app-rating-alert',
  templateUrl: './rating-alert.component.html',
  styleUrls: ['./rating-alert.component.scss'],
})
export class AppRatingAlertComponent implements OnInit {

  private readonly appRateView = {
    appRate: { type: ViewType.APP_RATE, heading: 'APP_RATING_RATE_EXPERIENCE', message: 'APP_RATING_TAP_ON_STARS' },
    storeRate: {
      type: ViewType.STORE_RATE,
      heading: 'APP_RATING_THANKS_FOR_RATING',
      message: 'APP_RATING_RATE_ON_PLAYSTORE'
    },
    helpDesk: { type: ViewType.HELP_DESK, heading: 'APP_RATING_THANKS_FOR_RATING', message: 'APP_RATING_REPORT_AN_ISSUE' }
  };
  public appRate = 0;
  private pageId = '';
  public currentViewText: ViewText;
  public appLogo$: Observable<string>;
  public appName: string;
  backButtonFunc = undefined;
  private appRatingPopCount = 0;
  private rateLaterClickedCount = 0;

  constructor(
    @Inject('SHARED_PREFERENCES') private preference: SharedPreferences,
    @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
    private popOverCtrl: PopoverController,
    private appVersion: AppVersion,
    private utilityService: UtilityService,
    private appRatingService: AppRatingService,
    private platform: Platform,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private navParams: NavParams,
  ) {
    this.getAppName();
    this.appLogo$ = this.preference.getString('app_logo').pipe(
      map((logo) => logo || './assets/imgs/ic_launcher.png')
    );
    this.currentViewText = this.appRateView[ViewType.APP_RATE];
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.closePopover();
    });
  }

  ngOnInit() {
    this.pageId = this.navParams.get('pageId');
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      ImpressionSubtype.APP_RATING_POPUP,
      this.pageId,
      Environment.HOME
    );
    this.appRatePopup();
  }

  getAppName() {
    this.appVersion.getAppName()
      .then((appName: any) => {
        this.appName = appName;
      });
  }

  closePopover() {
    this.popOverCtrl.dismiss(null);
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }

  async rateLater() {
    this.rateLaterClickedCount = await this.appRatingService.rateLaterClickedCount();
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.RATE_LATER_CLICKED,
      Environment.HOME,
      this.pageId,
      undefined,
      { rateLaterCount: this.rateLaterClickedCount }
    );
    this.closePopover();
  }

  rateOnStore() {
    this.appVersion.getPackageName().then((pkg: any) => {
      this.utilityService.openPlayStore(pkg);
      this.appRatingService.setEndStoreRate(this.appRate);
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.PLAY_STORE_BUTTON_CLICKED,
        Environment.HOME,
        this.pageId,
        undefined,
        { appRating: this.appRate }
      );
      this.popOverCtrl.dismiss(StoreRating.RETURN_CLOSE);
    });
  }

  submitRating() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.RATING_SUBMITTED,
      Environment.HOME,
      this.pageId,
      undefined,
      { appRating: this.appRate }
    );
    if (this.appRate >= StoreRating.APP_MIN_RATE) {
      this.currentViewText = this.appRateView[ViewType.STORE_RATE];
    } else {
      this.currentViewText = this.appRateView[ViewType.HELP_DESK];
    }
  }

  goToHelpSection() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.HELP_SECTION_CLICKED,
      Environment.HOME,
      this.pageId
    );
    this.popOverCtrl.dismiss(StoreRating.RETURN_HELP);
  }

  private async appRatePopup() {
    this.appRatingPopCount = await this.countAppRatingPopupAppeared();
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.OTHER,
      InteractSubtype.APP_RATING_APPEARED,
      this.pageId,
      Environment.HOME,
      undefined,
      { appRatingPopAppearedCount: this.appRatingPopCount }
    );
  }

  async calculateAppRatingCountAppeared(value) {
    return this.preference.putString(PreferenceKey.APP_RATING_POPUP_APPEARED, String(value)).toPromise().then(() => value);
  }

  async countAppRatingPopupAppeared() {
    return this.preference.getString(PreferenceKey.APP_RATE_LATER_CLICKED).toPromise().then(async (val) => {
      if (val) {
        const incrementedVal = Number(val) + 1;
        await this.calculateAppRatingCountAppeared(incrementedVal);
        return incrementedVal;
      } else {
        return this.calculateAppRatingCountAppeared(1);
      }
    });
  }

}
