import { Component, NgZone } from '@angular/core';
import { NavParams, Platform, PopoverController } from '@ionic/angular';
import { TelemetryObject } from 'sunbird-sdk';

import { ProfileConstants } from '@app/app/app.constant';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { Environment, InteractType } from '@app/services/telemetry-constants';

@Component({
  selector: 'app-view-credits',
  templateUrl: './view-credits.component.html',
  styleUrls: ['./view-credits.component.scss'],
})
export class ViewCreditsComponent {

  userId = '';
  backButtonFunc = undefined;
  content: any;
  rollUp: any;
  correlation: any;
  private pageId = '';
  private popupType: string;

  /**
   * Default function of class ViewCreditsComponent
   *
   * @param navParams
   * @param viewCtrl
   * @param platform
   * @param ngZone
   * @param telemetrygeneratorService
   * @param appGlobalService
   */
  constructor(
    private navParams: NavParams,
    private platform: Platform,
    private ngZone: NgZone,
    private telemetrygeneratorService: TelemetryGeneratorService,
    private appGlobalService: AppGlobalService,
    private popOverCtrl: PopoverController
  ) {
    this.getUserId();
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
      this.popOverCtrl.dismiss();
      this.backButtonFunc.unsubscribe();
    });
    this.ngZone.run(() => {
      this.popupType = this.navParams.get('popupType');
    });
  }

  /**
   * Ionic life cycle hook
   */
  ionViewDidLoad(): void {
    this.content = this.navParams.get('content');
    this.pageId = this.navParams.get('pageId');
    this.rollUp = this.navParams.get('rollUp');
    this.correlation = this.navParams.get('correlation');
    const telemetryObject = new TelemetryObject(this.content.identifier, this.content.contentType, this.content.pkgVersion);

    this.telemetrygeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      'credits-clicked',
      Environment.HOME,
      this.pageId,
      telemetryObject,
      undefined,
      this.rollUp,
      this.correlation
    );
  }

  /* SUDO
    if firstprperty is there and secondprperty is not there, then return firstprperty value
    else if firstprperty is not there and secondprperty is there, then return secondprperty value
    else do the merger of firstprperty and secondprperty value and return merged value
  */
  mergeProperties(firstProp, secondProp) {
    if (this.content[firstProp] && !this.content[secondProp]) {
      return this.content[firstProp];
    } else if (!this.content[firstProp] && this.content[secondProp]) {
      return this.content[secondProp];
    } else {
      let first: any;
      let second: any;
      first = this.content[firstProp].split(', ');
      second = this.content[secondProp].split(', ');
      first = second.concat(first);
      first = Array.from(new Set(first));
      return first.join(', ');
    }
  }

  /**
   * Get user id
   */
  getUserId() {
    if (this.appGlobalService.getSessionData()) {
      this.userId = this.appGlobalService.getSessionData()[
        ProfileConstants.USER_TOKEN
      ];
    } else {
      this.userId = '';
    }
  }

  cancel() {
    this.popOverCtrl.dismiss();
    if(this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }
  }
}
