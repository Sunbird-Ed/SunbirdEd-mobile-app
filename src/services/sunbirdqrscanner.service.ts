// import { GUEST_STUDENT_TABS, GUEST_TEACHER_TABS, initTabs } from './../../app/module.service';
import { CommonUtilService } from './common-util.service';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonApp, Platform, PopoverController } from '@ionic/angular';
// import { QRAlertCallBack, QRScannerAlert } from './qrscanner_alert';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import { QRScannerResultHandler } from './qrscanresulthandler.service';
// import { ProfileSettingsPage } from '../profile-settings/profile-settings';
import { AppGlobalService } from './app-global-service.service';
import { Subscription, Observable } from 'rxjs';
import { Profile, ProfileType, TelemetryObject } from 'sunbird-sdk';
import {
  Environment,
  ImpressionSubtype,
  ImpressionType,
  InteractSubtype,
  InteractType,
  Mode,
  PageId
} from './telemetry-constants';
import { ContainerService } from './container.services';
// import { TabsPage } from '../tabs/tabs';
import { AndroidPermissionsService } from './android-permissions/android-permissions.service';
import { AndroidPermissionsStatus, AndroidPermission } from './android-permissions/android-permission';

@Injectable()
export class SunbirdQRScanner {
  profile: Profile;
  private readonly QR_SCANNER_TEXT = [
    'SCAN_QR_CODE',
    'SCAN_QR_INSTRUCTION',
    'UNKNOWN_QR',
    'SKIP',
    'CANCEL',
    'TRY_AGAIN',
  ];
  private mQRScannerText;
  readonly permissionList = [AndroidPermission.CAMERA];
  backButtonFunc = undefined;
  private pauseSubscription?: Subscription;
  source: string;
  showButton = false;

  constructor(
    private popCtrl: PopoverController,
    private translate: TranslateService,
    private platform: Platform,
    private qrScannerResultHandler: QRScannerResultHandler,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private app: IonApp,
    private commonUtil: CommonUtilService,
    private appGlobalService: AppGlobalService,
    private container: ContainerService,
    private permission: AndroidPermissionsService,
  ) {
    const that = this;
    this.translate.get(this.QR_SCANNER_TEXT).subscribe((data) => {
      that.mQRScannerText = data;
    }, (error) => {

    });

    this.translate.onLangChange.subscribe(() => {
      that.mQRScannerText = that.translate.instant(that.QR_SCANNER_TEXT);
    });
  }

  public startScanner(source: string, showButton: boolean = false,
    screenTitle = this.mQRScannerText['SCAN_QR_CODE'],
    displayText = this.mQRScannerText['SCAN_QR_INSTRUCTION'],
    displayTextColor = '#0b0b0b',
    buttonText = this.mQRScannerText['SKIP']
  ) {
    this.source = source;
    this.showButton = showButton;

    /* Just need to override the back button functionality other wise  on pressing back button it will take to two pages back */
    // migration-TODO
    // this.backButtonFunc = this.platform.registerBackButtonAction(() => {
    //   console.log('INNNNN BackButton');
    //   //  this.stopScanner();
    //   this.backButtonFunc();
    // }, 10);
    this.pauseSubscription = this.platform.pause.subscribe(() => this.stopScanner());
    this.generateImpressionTelemetry(source);
    this.generateStartEvent(source);

    this.permission.checkPermissions(this.permissionList)
      .mergeMap((statusMap: { [key: string]: AndroidPermissionsStatus }) => {
        const toRequest: AndroidPermission[] = [];

        for (const permission in statusMap) {
          if (!statusMap[permission].hasPermission) {
            toRequest.push(permission as AndroidPermission);
          }
        }

        if (!toRequest.length) {
          return Observable.of({ hasPermission: true });
        }

        return this.permission.requestPermissions(toRequest);
      }).toPromise().then((status: AndroidPermissionsStatus) => {
        if (status && status.hasPermission) {
          this.startQRScanner(screenTitle, displayText, displayTextColor, buttonText, showButton, source);
        } else {
          this.commonUtil.showToast('PERMISSION_DENIED');
        }
      });
  }

  public stopScanner() {
    // Unregister back button listner
    console.log('InsideSTopScannere===>>');
    this.backButtonFunc();
    // QRScannerAlert.dismiss();
    (<any>window).qrScanner.stopScanner();
    if (this.pauseSubscription) {
      this.pauseSubscription.unsubscribe();
    }
  }

  getProfileSettingConfig() {
    this.profile = this.appGlobalService.getCurrentUser();
    if (this.profile.profileType === ProfileType.TEACHER) {
      // migration-TODO
      // initTabs(this.container, GUEST_TEACHER_TABS);
    } else if (this.profile.profileType === ProfileType.STUDENT) {
      // migration-TODO
      // initTabs(this.container, GUEST_STUDENT_TABS);
    }
    this.stopScanner();
    // migration-TODO
    // this.app.getActiveNavs()[0].push(TabsPage, { loginMode: 'guest' });
  }

  private startQRScanner(screenTitle: string, displayText: string, displayTextColor: string,
    buttonText: string, showButton: boolean, source: string) {
    window['qrScanner'].startScanner(screenTitle, displayText,
      displayTextColor, buttonText, showButton, this.platform.isRTL, (scannedData) => {
        if (scannedData === 'skip') {
          if (this.appGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE) {
            // migration-TODO
            // this.app.getActiveNavs()[0].push(ProfileSettingsPage, { stopScanner: true });
          } else {
            this.getProfileSettingConfig();
          }
          this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.TOUCH,
            InteractSubtype.SKIP_CLICKED,
            Environment.ONBOARDING,
            PageId.QRCodeScanner);
          this.generateEndEvent(source, '');
        } else {
          if (scannedData === 'cancel' ||
            scannedData === 'cancel_hw_back' ||
            scannedData === 'cancel_nav_back') {
            this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.QRCodeScanner,
              source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
              scannedData === 'cancel_nav_back' ? true : false);
            this.telemetryGeneratorService.generateInteractTelemetry(
              InteractType.OTHER,
              InteractSubtype.QRCodeScanCancelled,
              Environment.HOME,
              PageId.QRCodeScanner);
            this.generateEndEvent(source, '');
          } else if (this.qrScannerResultHandler.isDialCode(scannedData)) {
            this.qrScannerResultHandler.handleDialCode(source, scannedData);
          } else if (this.qrScannerResultHandler.isContentId(scannedData)) {
            this.qrScannerResultHandler.handleContentId(source, scannedData);
          } else {
            this.qrScannerResultHandler.handleInvalidQRCode(source, scannedData);
            this.showInvalidCodeAlert();
          }
          this.stopScanner();
        }
      }, () => {
        this.stopScanner();
      });
  }

  generateImpressionTelemetry(source) {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      ImpressionSubtype.QRCodeScanInitiate,
      PageId.QRCodeScanner,
      source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME);
  }

  generateStartEvent(pageId: string) {
    const telemetryObject = new TelemetryObject('', 'qr', undefined);
    this.telemetryGeneratorService.generateStartTelemetry(
      PageId.QRCodeScanner,
      telemetryObject);
  }

  generateEndEvent(pageId: string, qrData: string) {
    if (pageId) {
      const telemetryObject: TelemetryObject = new TelemetryObject(qrData, 'qr', undefined);

      this.telemetryGeneratorService.generateEndTelemetry(
        'qr',
        Mode.PLAY,
        PageId.QRCodeScanner,
        Environment.HOME,
        telemetryObject
      );
    }
  }

  showInvalidCodeAlert() {
    if (this.source !== 'user-type-selection') {
      this.commonUtil.afterOnBoardQRErrorAlert('INVALID_QR', 'UNKNOWN_QR');
      return;
    }
    // migration-TODO
    let popUp:any;
    // let popUp: Popover;
    const self = this;

    // migration-TODO
    // const callback: QRAlertCallBack = {
    //   tryAgain() {
    //     popUp.dismiss().then(() => {
    //       this.pauseSubscription.unsubscribe();
    //     });
    //     self.startScanner(self.source, self.showButton);
    //   },
    //   cancel() {
    //     popUp.dismiss().then(() => {
    //       this.pauseSubscription.unsubscribe();
    //     });

    //     if (self.showButton) {
    //       if (this.appGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE) {
    //         // migration-TODO
    //         // self.app.getActiveNavs()[0].push(ProfileSettingsPage, { stopScanner: true });
    //       } else {
    //         this.getProfileSettingConfig();
    //       }
    //     }
    //   }
    // };

    // migration-TODO
    // popUp = this.popCtrl.create(QRScannerAlert, {
    //   callback: callback,
    //   invalidContent: true,
    //   messageKey: 'UNKNOWN_QR',
    //   tryAgainKey: 'TRY_DIFF_QR'
    // }, {
    //     cssClass: 'qr-alert-invalid'
    //   });

    // popUp.present();
  }
}

export interface QRResultCallback {
  dialcode(scanResult: string, code: string);

  content(scanResult: string, contentId: string);
}
