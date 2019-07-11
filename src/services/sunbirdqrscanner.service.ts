// import { CommonUtilService } from './common-util.service';
// import { Injectable } from '@angular/core';
// import { TranslateService } from '@ngx-translate/core';
// import { Platform, PopoverController } from '@ionic/angular';
// // import { QRAlertCallBack, QRScannerAlert } from './qrscanner_alert';
// import { TelemetryGeneratorService } from './telemetry-generator.service';
// import { QRScannerResultHandler } from './qrscanresulthandler.service';
// // import { ProfileSettingsPage } from '../profile-settings/profile-settings';
// import { AppGlobalService } from './app-global-service.service';
// import { Subscription, Observable } from 'rxjs';
// import { Profile, ProfileType, TelemetryObject } from 'sunbird-sdk';
// import {
//   Environment,
//   ImpressionSubtype,
//   ImpressionType,
//   InteractSubtype,
//   InteractType,
//   Mode,
//   PageId
// } from './telemetry-constants';
// import { ContainerService } from './container.services';
// // import { TabsPage } from '../tabs/tabs';
// import { AndroidPermissionsService } from './android-permissions/android-permissions.service';
// import { AndroidPermissionsStatus, AndroidPermission } from './android-permissions/android-permission';
// import { NavigationExtras, Router } from '@angular/router';




// import { GUEST_STUDENT_TABS, GUEST_TEACHER_TABS, initTabs } from './../app/module.service';
// import { CommonUtilService } from './../../service/common-util.service';
// import { Injectable } from '@angular/core';
// import { TranslateService } from '@ngx-translate/core';
// import { App, Platform, Popover, PopoverController, ToastController } from 'ionic-angular';
// import { QRAlertCallBack, QRScannerAlert } from './qrscanner_alert';
// import { TelemetryGeneratorService } from '../../service/telemetry-generator.service';
// import { QRScannerResultHandler } from './qrscanresulthandler.service';
// import { ProfileSettingsPage } from '../profile-settings/profile-settings';
// import { AppGlobalService } from '../../service/app-global.service';
// import { Subscription, Observable, Observer } from 'rxjs';
// import { Profile, ProfileType, TelemetryObject } from 'sunbird-sdk';
// import {
//   Environment,
//   ImpressionSubtype,
//   ImpressionType,
//   InteractSubtype,
//   InteractType,
//   Mode,
//   PageId
// } from '../../service/telemetry-constants';
// import { ContainerService } from '@app/service/container.services';
// import { TabsPage } from '../tabs/tabs';
// import { AndroidPermissionsService } from '@app/service/android-permissions/android-permissions.service';
// import { AndroidPermissionsStatus, AndroidPermission, PermissionAskedEnum } from '@app/service/android-permissions/android-permission';
// import { SbPopoverComponent } from '@app/component';
// // import { PermissionPage } from '../permission/permission';




// @Injectable()
// export class SunbirdQRScanner {
//   profile: Profile;
//   private readonly QR_SCANNER_TEXT = [
//     'SCAN_QR_CODE',
//     'SCAN_QR_INSTRUCTION',
//     'UNKNOWN_QR',
//     'SKIP',
//     'CANCEL',
//     'TRY_AGAIN',
//   ];
//   private mQRScannerText;
//   readonly permissionList = [AndroidPermission.CAMERA];
//   backButtonFunc = undefined;
//   private pauseSubscription?: Subscription;
//   source: string;
//   showButton = false;

//   constructor(
//     private popCtrl: PopoverController,
//     private translate: TranslateService,
//     private platform: Platform,
//     private qrScannerResultHandler: QRScannerResultHandler,
//     private telemetryGeneratorService: TelemetryGeneratorService,
//     // migration-TODO
//     // private app: IonApp,
//     private commonUtil: CommonUtilService,
//     private appGlobalService: AppGlobalService,
//     private container: ContainerService,
//     private permission: AndroidPermissionsService,
//     private router: Router
//   ) {
//     const that = this;
//     this.translate.get(this.QR_SCANNER_TEXT).subscribe((data) => {
//       that.mQRScannerText = data;
//     }, (error) => {

//     });

//     this.translate.onLangChange.subscribe(() => {
//       that.mQRScannerText = that.translate.instant(that.QR_SCANNER_TEXT);
//     });
//   }

//   public startScanner(source: string, showButton: boolean = false,
//     screenTitle = this.mQRScannerText['SCAN_QR_CODE'],
//     displayText = this.mQRScannerText['SCAN_QR_INSTRUCTION'],
//     displayTextColor = '#0b0b0b',
//     buttonText = this.mQRScannerText['SKIP']
//   ) {
//     this.source = source;
//     this.showButton = showButton;

//     /* Just need to override the back button functionality other wise  on pressing back button it will take to two pages back */
//     // migration-TODO
//     // this.backButtonFunc = this.platform.registerBackButtonAction(() => {
//     //   console.log('INNNNN BackButton');
//     //   //  this.stopScanner();
//     //   this.backButtonFunc();
//     // }, 10);
//     this.pauseSubscription = this.platform.pause.subscribe(() => this.stopScanner());
//     this.generateImpressionTelemetry(source);
//     this.generateStartEvent(source);

//     this.permission.checkPermissions(this.permissionList)
//       .mergeMap((statusMap: { [key: string]: AndroidPermissionsStatus }) => {
//         const toRequest: AndroidPermission[] = [];

//         for (const permission in statusMap) {
//           if (!statusMap[permission].hasPermission) {
//             toRequest.push(permission as AndroidPermission);
//           }
//         }

//         if (!toRequest.length) {
//           return Observable.of({ hasPermission: true });
//         }

//         return this.permission.requestPermissions(toRequest);
//       }).toPromise().then((status: AndroidPermissionsStatus) => {
//         if (status && status.hasPermission) {
//           this.startQRScanner(screenTitle, displayText, displayTextColor, buttonText, showButton, source);
//         } else {
//           this.commonUtil.showToast('PERMISSION_DENIED');
//         }
//       });
//   }

//   public stopScanner() {
//     // Unregister back button listner
//     console.log('InsideSTopScannere===>>');
//     this.backButtonFunc();
//     // QRScannerAlert.dismiss();
//     (<any>window).qrScanner.stopScanner();
//     if (this.pauseSubscription) {
//       this.pauseSubscription.unsubscribe();
//     }
//   }

//   getProfileSettingConfig() {
//     this.profile = this.appGlobalService.getCurrentUser();
//     if (this.profile.profileType === ProfileType.TEACHER) {
//       // migration-TODO
//       // initTabs(this.container, GUEST_TEACHER_TABS);
//     } else if (this.profile.profileType === ProfileType.STUDENT) {
//       // migration-TODO
//       // initTabs(this.container, GUEST_STUDENT_TABS);
//     }
//     this.stopScanner();
//     const navigationExtras: NavigationExtras = { state: { loginMode: 'guest' } };
//     this.router.navigate(['/tabs'], navigationExtras);
//   }

//   private startQRScanner(screenTitle: string, displayText: string, displayTextColor: string,
//     buttonText: string, showButton: boolean, source: string) {
//     debugger;
//     window['qrScanner'].startScanner(screenTitle, displayText,
//       displayTextColor, buttonText, showButton, this.platform.isRTL, (scannedData) => {
//         if (scannedData === 'skip') {
//           if (this.appGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE) {
//             const navigationExtras: NavigationExtras = { state: { stopScanner: true } };
//             this.router.navigate(['/profile-settings'], navigationExtras);
//           } else {
//             this.getProfileSettingConfig();
//           }
//           this.telemetryGeneratorService.generateInteractTelemetry(
//             InteractType.TOUCH,
//             InteractSubtype.SKIP_CLICKED,
//             Environment.ONBOARDING,
//             PageId.QRCodeScanner);
//           this.generateEndEvent(source, '');
//         } else {
//           if (scannedData === 'cancel' ||
//             scannedData === 'cancel_hw_back' ||
//             scannedData === 'cancel_nav_back') {
//             this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.QRCodeScanner,
//               source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
//               scannedData === 'cancel_nav_back' ? true : false);
//             this.telemetryGeneratorService.generateInteractTelemetry(
//               InteractType.OTHER,
//               InteractSubtype.QRCodeScanCancelled,
//               Environment.HOME,
//               PageId.QRCodeScanner);
//             this.generateEndEvent(source, '');
//           } else if (this.qrScannerResultHandler.isDialCode(scannedData)) {
//             this.qrScannerResultHandler.handleDialCode(source, scannedData);
//           } else if (this.qrScannerResultHandler.isContentId(scannedData)) {
//             this.qrScannerResultHandler.handleContentId(source, scannedData);
//           } else {
//             this.qrScannerResultHandler.handleInvalidQRCode(source, scannedData);
//             this.showInvalidCodeAlert();
//           }
//           this.stopScanner();
//         }
//       }, () => {
//         this.stopScanner();
//       });
//   }

//   generateImpressionTelemetry(source) {
//     this.telemetryGeneratorService.generateImpressionTelemetry(
//       ImpressionType.VIEW,
//       ImpressionSubtype.QRCodeScanInitiate,
//       PageId.QRCodeScanner,
//       source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME);
//   }

//   generateStartEvent(pageId: string) {
//     const telemetryObject = new TelemetryObject('', 'qr', undefined);
//     this.telemetryGeneratorService.generateStartTelemetry(
//       PageId.QRCodeScanner,
//       telemetryObject);
//   }

//   generateEndEvent(pageId: string, qrData: string) {
//     if (pageId) {
//       const telemetryObject: TelemetryObject = new TelemetryObject(qrData, 'qr', undefined);

//       this.telemetryGeneratorService.generateEndTelemetry(
//         'qr',
//         Mode.PLAY,
//         PageId.QRCodeScanner,
//         Environment.HOME,
//         telemetryObject
//       );
//     }
//   }

//   showInvalidCodeAlert() {
//     if (this.source !== 'user-type-selection') {
//       this.commonUtil.afterOnBoardQRErrorAlert('INVALID_QR', 'UNKNOWN_QR');
//       return;
//     }
//     // migration-TODO
//     let popUp:any;
//     // let popUp: Popover;
//     const self = this;

//     // migration-TODO
//     // const callback: QRAlertCallBack = {
//     //   tryAgain() {
//     //     popUp.dismiss().then(() => {
//     //       this.pauseSubscription.unsubscribe();
//     //     });
//     //     self.startScanner(self.source, self.showButton);
//     //   },
//     //   cancel() {
//     //     popUp.dismiss().then(() => {
//     //       this.pauseSubscription.unsubscribe();
//     //     });

//     //     if (self.showButton) {
//     //       if (this.appGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE) {
//     //         // migration-TODO
//     //         // self.app.getActiveNavs()[0].push(ProfileSettingsPage, { stopScanner: true });
//     //       } else {
//     //         this.getProfileSettingConfig();
//     //       }
//     //     }
//     //   }
//     // };

//     // migration-TODO
//     // popUp = this.popCtrl.create(QRScannerAlert, {
//     //   callback: callback,
//     //   invalidContent: true,
//     //   messageKey: 'UNKNOWN_QR',
//     //   tryAgainKey: 'TRY_DIFF_QR'
//     // }, {
//     //     cssClass: 'qr-alert-invalid'
//     //   });

//     // popUp.present();
//   }
// }

// export interface QRResultCallback {
//   dialcode(scanResult: string, code: string);

//   content(scanResult: string, contentId: string);
// }


















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
import { ContainerService } from './container.services';
import { AndroidPermissionsService } from './android-permissions/android-permissions.service';
import { AndroidPermissionsStatus, AndroidPermission, PermissionAskedEnum } from './android-permissions/android-permission';
import { QRScannerResultHandler, TelemetryGeneratorService, CommonUtilService, AppGlobalService } from '.';
import { Platform, ToastController, PopoverController } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { initTabs, GUEST_TEACHER_TABS, GUEST_STUDENT_TABS } from '@app/app/module.service';
import { ProfileSettingsPage } from '@app/app/profile-settings/profile-settings.page';
import { NavigationExtras, Router } from '@angular/router';
import { SbPopoverComponent } from '@app/app/components';
import { QRScannerAlert, QRAlertCallBack } from '@app/app/qrscanner-alert/qrscanner-alert.page';
import { RouterLinks } from '@app/app/app.constant';
// import { PermissionPage } from '../permission/permission';

declare const cordova;
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
  t1: number;
  t2: number;
  appName = '';
  constructor(
    private translate: TranslateService,
    private platform: Platform,
    private qrScannerResultHandler: QRScannerResultHandler,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtil: CommonUtilService,
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
    }, (error) => {

    });

    this.translate.onLangChange.subscribe(() => {
      that.mQRScannerText = that.translate.instant(that.QR_SCANNER_TEXT);
    });

    this.appVersion.getAppName().then((appName: any) => this.appName = appName);

  }

  public async startScanner(source: string, showButton: boolean = false,
    screenTitle = this.mQRScannerText['SCAN_QR_CODE'],
    displayText = this.mQRScannerText['SCAN_QR_INSTRUCTION'],
    displayTextColor = '#0b0b0b',
    buttonText = this.mQRScannerText['SKIP']
  ) {
    this.source = source;
    this.showButton = showButton;

    /* Just need to override the back button functionality other wise  on pressing back button it will take to two pages back */
    // this.backButtonFunc = this.platform.registerBackButtonAction(() => {
    //   console.log('INNNNN BackButton');
    //   //  this.stopScanner();
    //   this.backButtonFunc();
    // }, 10);
    this.pauseSubscription = this.platform.pause.subscribe(() => this.stopScanner());
    this.generateImpressionTelemetry(source);
    this.generateStartEvent(source);

    return this.permission.checkPermissions(this.permissionList)
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

        return Observable.create((observer: Observer<AndroidPermissionsStatus>) => {
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
              case cordova.plugins.diagnostic.permissionStatus.DENIED:
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

      }).toPromise().then((status?: AndroidPermissionsStatus) => {
        if (!status) {
          this.commonUtil.showToast('PERMISSION_DENIED');
        }

        if (status.isPermissionAlwaysDenied) {
          return this.showSettingErrorToast();
        }

        if (status.hasPermission) {
          this.startQRScanner(screenTitle, displayText, displayTextColor, buttonText, showButton, source);
        } else if (!status.hasPermission) {
          this.showPopover();
        }
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

    toast.present();
    /* migration-TODO
    toast.onWillDismiss((_null, role) => {
      switch (role) {
        case 'close':
          this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.TOUCH,
            InteractSubtype.SETTINGS_CLICKED,
            Environment.ONBOARDING,
            PageId.QRCodeScanner);
          const navigationExtras: NavigationExtras = { state: { changePermissionAccess: true }};
          this.router.navigate([`/${RouterLinks.SETTINGS}/permission`], navigationExtras);
          break;
        case 'backdrop':
          console.log('Duration timeout');
          break;
        default:
          console.log('toast dismissed');
      }
    });
    toast.onDidDismiss(() => {
    });
    */
  }
  async showPopover() {
    const confirm = await this.popCtrl.create({
      component: SbPopoverComponent,
      componentProps: {
      isNotShowCloseIcon: false,
      sbPopoverHeading: this.commonUtilService.translateMessage('PERMISSION_REQUIRED'),
      sbPopoverMainTitle: this.commonUtilService.translateMessage('CAMERA'),
      actionsButtons: [
        {
          btntext: this.commonUtilService.translateMessage('NOT_NOW'),
          btnClass: 'popover-button-cancel',
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
        } else {
          this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.TOUCH,
            InteractSubtype.PERMISSION_POPOVER_ALLOW_CLICKED,
            Environment.ONBOARDING,
            PageId.QRCodeScanner);
          this.appGlobalService.setIsPermissionAsked(PermissionAskedEnum.isCameraAsked, true);
          this.permission.requestPermissions(this.permissionList).subscribe((status: AndroidPermissionsStatus) => {
            if (status && status.hasPermission) {
              this.startScanner(this.source, this.showButton);
            } else {
              this.showSettingErrorToast();
            }
          });
        }
      },
      img: {
        path: './assets/imgs/ic_photo_camera.png',
      },
      metaInfo: this.commonUtilService.translateMessage('CAMERA_PERMISSION_DESCRIPTION', this.appName),
    },
      cssClass: 'sb-popover sb-popover-permissions primary dw-active-downloads-popover',
    });

    confirm.present();

  }
  public stopScanner() {
    // Unregister back button listner
    console.log('InsideSTopScannere===>>');
    this.backButtonFunc.unsubscribe();
    // QRScannerAlert.dismiss();
    (<any>window).qrScanner.stopScanner();
    if (this.pauseSubscription) {
      this.pauseSubscription.unsubscribe();
    }
  }

  getProfileSettingConfig() {
    this.profile = this.appGlobalService.getCurrentUser();
    if (this.profile.profileType === ProfileType.TEACHER) {
      /* migration-TODO
      initTabs(this.container, GUEST_TEACHER_TABS);
      */
    } else if (this.profile.profileType === ProfileType.STUDENT) {
      /* migration-TODO
      initTabs(this.container, GUEST_STUDENT_TABS);
      */
    }
    this.stopScanner();
    const navigationExtras: NavigationExtras = { state: { loginMode: 'guest' } };
    this.router.navigate(['/tabs'], navigationExtras);
  }

  private startQRScanner(screenTitle: string, displayText: string, displayTextColor: string,
    buttonText: string, showButton: boolean, source: string) {
    window['qrScanner'].startScanner(screenTitle, displayText,
      displayTextColor, buttonText, showButton, this.platform.isRTL, (scannedData) => {
        if (scannedData === 'skip') {
          if (this.appGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE) {
            // this.app.getActiveNavs()[0].push(ProfileSettingsPage, { stopScanner: true });
            const navigationExtras: NavigationExtras = { state: { stopScanner: true } };
            this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], navigationExtras);
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
      this.commonUtil.afterOnBoardQRErrorAlert('INVALID_QR', 'UNKNOWN_QR');
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
        callback: callback,
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
