import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, Observable, Observer } from 'rxjs';
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
import { ContainerService } from '@app/services/container.services';
import { AndroidPermissionsService } from '@app/services/android-permissions/android-permissions.service';
import { AndroidPermissionsStatus, AndroidPermission, PermissionAskedEnum } from './android-permissions/android-permission';
import { QRScannerResultHandler, AppGlobalService } from '@app/services/';
import { TelemetryGeneratorService } from '@app/services/';
import { CommonUtilService } from '@app/services/';
import { Platform, ToastController, PopoverController } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { initTabs, GUEST_TEACHER_TABS, GUEST_STUDENT_TABS } from '@app/app/module.service';
import { NavigationExtras, Router } from '@angular/router';
import { SbPopoverComponent } from '@app/app/components/popups/sb-popover/sb-popover.component';
import { QRScannerAlert, QRAlertCallBack } from '@app/app/qrscanner-alert/qrscanner-alert.page';
import { RouterLinks } from '@app/app/app.constant';
import { mergeMap, take } from 'rxjs/operators';
import { of } from 'rxjs';

declare const cordova;
@Injectable()
export class SunbirdQRScanner {
  profile: Profile;
  private readonly QR_SCANNER_TEXT = [
    'SCAN_QR_CODE',
    'SCAN_QR_INSTRUCTION',
    'UNKNOWN_QR',
    'NO_QR_CODE',
    'CANCEL',
    'TRY_AGAIN',
  ];
  private mQRScannerText;
  readonly permissionList = [AndroidPermission.CAMERA];
  backButtonFunc = undefined;
  source: string;
  showButton = false;
  appName = '';
  private isScannerActive = false;
  constructor(
    private translate: TranslateService,
    private platform: Platform,
    private qrScannerResultHandler: QRScannerResultHandler,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appGlobalService: AppGlobalService,
    private container: ContainerService,
    private permission: AndroidPermissionsService,
    private commonUtilService: CommonUtilService,
    private appVersion: AppVersion,
    private toastController: ToastController,
    private popCtrl: PopoverController,
    private router: Router
  ) {
    const that = this;
    this.translate.get(this.QR_SCANNER_TEXT).subscribe((data) => {
      that.mQRScannerText = data;
    });

    this.translate.onLangChange.subscribe(() => {
      that.mQRScannerText = that.translate.instant(that.QR_SCANNER_TEXT);
    });

    this.appVersion.getAppName().then((appName: any) => this.appName = appName);
  }

  public async startScanner(
    source: string,
    showButton: boolean = false,
    screenTitle = this.mQRScannerText['SCAN_QR_CODE'],
    displayText = this.mQRScannerText['SCAN_QR_INSTRUCTION'],
    displayTextColor = '#0b0b0b',
    buttonText = this.mQRScannerText['NO_QR_CODE']
  ): Promise<string | undefined> {
    this.source = source;
    this.showButton = showButton;

    this.platform.pause.pipe(
    take(1)
    ).subscribe(() => this.stopScanner());
    this.generateImpressionTelemetry(source);
    this.generateStartEvent(source);

    return this.permission.checkPermissions(this.permissionList).pipe(
      mergeMap((statusMap: { [key: string]: AndroidPermissionsStatus }) => {
        const toRequest: AndroidPermission[] = [];

        for (const permission in statusMap) {
          if (!statusMap[permission].hasPermission) {
            toRequest.push(permission as AndroidPermission);
          }
        }

        if (!toRequest.length) {
          return of({ hasPermission: true });
        }

        return new Observable((observer: Observer<AndroidPermissionsStatus>) => {
          cordova.plugins.diagnostic.getPermissionAuthorizationStatus((status) => {
            switch (status) {
              case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
              case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                // call popover
                this.appGlobalService.getIsPermissionAsked(PermissionAskedEnum.isCameraAsked).toPromise()
                  .then((isPemissionAsked: boolean) => {
                    if (!isPemissionAsked) {
                      observer.next({ hasPermission: false } as AndroidPermissionsStatus);
                      observer.complete();
                      return;
                    }
                    observer.next({ isPermissionAlwaysDenied: true } as AndroidPermissionsStatus);
                    observer.complete();
                    return;
                  });
                break;
              case cordova.plugins.diagnostic.permissionStatus.DENIED_ONCE:
                // call popover
                observer.next({ hasPermission: false } as AndroidPermissionsStatus);
                observer.complete();
                return;
              // call permission settings error
              default:
                observer.next(undefined);
                observer.complete();
            }
          }, (e) => {
            console.error(e);
            observer.next(undefined);
            observer.complete();
          }, cordova.plugins.diagnostic.permission.CAMERA);
        });
      })
    ).toPromise().then((status?: AndroidPermissionsStatus) => {
      if (!status) {
        this.commonUtilService.showToast('PERMISSION_DENIED');
      }

      if (status.isPermissionAlwaysDenied) {
        this.showSettingErrorToast();
        return undefined;
      }

      if (status.hasPermission) {
        return this.startQRScanner(screenTitle, displayText, displayTextColor, buttonText, showButton, source);
      } else if (!status.hasPermission) {
        return this.showPopover();
      }
      return undefined;
    });
  }

  async showSettingErrorToast() {
    const toast = await this.toastController.create({
      message: this.commonUtilService.translateMessage('CAMERA_PERMISSION_DESCRIPTION', this.appName),
      cssClass: 'permissionSettingToast',
      showCloseButton: true,
      closeButtonText: this.commonUtilService.translateMessage('SETTINGS'),
      position: 'bottom',
      duration: 3000
    });

    await toast.present();
    toast.onWillDismiss().then((res) => {
      if (res.role === 'cancel') {

        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.SETTINGS_CLICKED,
          Environment.ONBOARDING,
          PageId.QRCodeScanner);
        const navigationExtras: NavigationExtras = { state: { changePermissionAccess: true } };
        this.router.navigate([`/${RouterLinks.SETTINGS}/${RouterLinks.PERMISSION}`], navigationExtras);
      }

    }).catch((error) => {
      console.error('Unable to dismiss toast', error);
    });

  }

  async showPopover(): Promise<string | undefined> {
    return new Promise<string | undefined>(async (resolve, reject) => {
      const confirm = await this.popCtrl.create({
        component: SbPopoverComponent,
        componentProps: {
          isNotShowCloseIcon: false,
          sbPopoverHeading: this.commonUtilService.translateMessage('PERMISSION_REQUIRED'),
          sbPopoverMainTitle: this.commonUtilService.translateMessage('CAMERA'),
          actionsButtons: [
            {
              btntext: this.commonUtilService.translateMessage('NOT_NOW'),
              btnClass: (this.commonUtilService.translateMessage('NOT_NOW').length > 10) ?
                  'popover-button-cancel-longlength' : 'popover-button-cancel',
            },
            {
              btntext: this.commonUtilService.translateMessage('ALLOW'),
              btnClass: 'popover-button-allow',
            }
          ],
          handler: (whichBtnClicked: string) => {
            if (whichBtnClicked === this.commonUtilService.translateMessage('NOT_NOW')) {
              this.telemetryGeneratorService.generateInteractTelemetry(
                  InteractType.TOUCH,
                  InteractSubtype.PERMISSION_POPOVER_NOT_NOW_CLICKED,
                  Environment.ONBOARDING,
                  PageId.QRCodeScanner);
              this.showSettingErrorToast();
              resolve(undefined);
            } else {
              this.telemetryGeneratorService.generateInteractTelemetry(
                  InteractType.TOUCH,
                  InteractSubtype.PERMISSION_POPOVER_ALLOW_CLICKED,
                  Environment.ONBOARDING,
                  PageId.QRCodeScanner);
              this.appGlobalService.setIsPermissionAsked(PermissionAskedEnum.isCameraAsked, true);
              this.permission.requestPermissions(this.permissionList).subscribe((status: AndroidPermissionsStatus) => {
                if (status && status.hasPermission) {
                  resolve(this.startScanner(this.source, this.showButton));
                } else {
                  this.showSettingErrorToast();
                  resolve(undefined);
                }
              }, (e) => { reject(e); });
            }
          },
          img: {
            path: './assets/imgs/ic_photo_camera.png',
          },
          metaInfo: this.commonUtilService.translateMessage('CAMERA_PERMISSION_DESCRIPTION', this.appName),
        },
        cssClass: 'sb-popover sb-popover-permissions primary dw-active-downloads-popover',
      });

      await confirm.present();
    });
  }

  public stopScanner() {
    if (!this.isScannerActive) {
      return;
    }
    // to prevent back event propagating up to parent
    setTimeout(() => {
      (window as any).qrScanner.stopScanner();
      this.isScannerActive = false;
    }, 100);
  }

  getProfileSettingConfig() {
    this.profile = this.appGlobalService.getCurrentUser();
    if (this.profile.profileType === ProfileType.TEACHER) {
      initTabs(this.container, GUEST_TEACHER_TABS);
    } else if (this.profile.profileType === ProfileType.STUDENT) {
      initTabs(this.container, GUEST_STUDENT_TABS);
    }
    this.stopScanner();
    const navigationExtras: NavigationExtras = { state: { loginMode: 'guest' } };
    this.router.navigate(['/tabs'], navigationExtras);
  }

  private async startQRScanner(
    screenTitle: string, displayText: string, displayTextColor: string,
    buttonText: string, showButton: boolean, source: string): Promise<string | undefined> {

    if (this.isScannerActive) {
      return;
    }
    this.isScannerActive = true;
    return new Promise<string | undefined>((resolve, reject) => {
      (window as any).qrScanner.startScanner(screenTitle, displayText,
        displayTextColor, buttonText, showButton, this.platform.isRTL, async (scannedData) => {
          if (scannedData === 'skip') {
            if (this.appGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE) {
              this.stopScanner();
            } else {
              this.getProfileSettingConfig();
            }
            this.telemetryGeneratorService.generateInteractTelemetry(
              InteractType.TOUCH,
              InteractSubtype.NO_QR_CODE_CLICKED,
              Environment.ONBOARDING,
              PageId.QRCodeScanner);
            this.generateEndEvent(source, '');
          } else {
            const dialCode = await this.qrScannerResultHandler.parseDialCode(scannedData);
            if (scannedData === 'cancel' ||
              scannedData === 'cancel_hw_back' ||
              scannedData === 'cancel_nav_back') {
              this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.QRCodeScanner,
                source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
                scannedData === 'cancel_nav_back');
              this.telemetryGeneratorService.generateInteractTelemetry(
                InteractType.OTHER,
                InteractSubtype.QRCodeScanCancelled,
                Environment.HOME,
                PageId.QRCodeScanner);
              this.generateEndEvent(source, '');
            } else if (dialCode) {
              this.qrScannerResultHandler.handleDialCode(source, scannedData, dialCode);
            } else if (this.qrScannerResultHandler.isContentId(scannedData)) {
              this.qrScannerResultHandler.handleContentId(source, scannedData);
            } else if (scannedData.includes('/certs/')) {
              this.qrScannerResultHandler.handleCertsQR(source, scannedData);
            } else {
              this.qrScannerResultHandler.handleInvalidQRCode(source, scannedData);
              this.showInvalidCodeAlert();
            }
            this.stopScanner();
          }
          resolve(scannedData);
        }, (e) => {
          reject(e);
          this.stopScanner();
        });
    });
  }

  generateImpressionTelemetry(source) {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      ImpressionSubtype.QRCodeScanInitiate,
      source,
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

  async showInvalidCodeAlert() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.OTHER,
      InteractSubtype.QR_CODE_INVALID,
      this.source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
      this.source
    );
    if (this.source !== 'permission') {
      this.commonUtilService.afterOnBoardQRErrorAlert('INVALID_QR', 'UNKNOWN_QR');
      return;
    }
    let popUp;
    const self = this;
    const callback: QRAlertCallBack = {
      tryAgain() {
        popUp.dismiss().then(() => {
          this.pauseSubscription.unsubscribe();
        });
        self.startScanner(self.source, self.showButton);
      },
      cancel() {
        popUp.dismiss().then(() => {
          this.pauseSubscription.unsubscribe();
        });

        if (self.showButton) {
          if (this.appGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE) {
            const navigationExtras: NavigationExtras = { state: { stopScanner: true } };
            self.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], navigationExtras);
          } else {
            this.getProfileSettingConfig();
          }
        }
      }
    };

    popUp = await this.popCtrl.create({
      component: QRScannerAlert,
      componentProps: {
        callback,
        invalidContent: true,
        messageKey: 'UNKNOWN_QR',
        tryAgainKey: 'TRY_DIFF_QR'
      },
      cssClass: 'qr-alert-invalid'
    });

    await popUp.present();
  }
}

export interface QRResultCallback {
  dialcode(scanResult: string, code: string);

  content(scanResult: string, contentId: string);
}
