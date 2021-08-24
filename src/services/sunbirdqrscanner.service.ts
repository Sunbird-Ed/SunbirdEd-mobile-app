import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { QrScannerIOSComponent } from '@app/app/components/qr-scanner-ios/qr-scanner-ios.component';
import { GUEST_STUDENT_TABS, GUEST_TEACHER_TABS, initTabs } from '@app/app/module.service';
import { AppGlobalService, CommonUtilService, QRScannerResultHandler, TelemetryGeneratorService } from '@app/services/';
import { AndroidPermissionsService } from '@app/services/android-permissions/android-permissions.service';
import { ContainerService } from '@app/services/container.services';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { ModalController, Platform, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';
import { CorrelationData, Profile, ProfileType, TelemetryObject } from 'sunbird-sdk';
import { AndroidPermission, AndroidPermissionsStatus, PermissionAskedEnum } from './android-permissions/android-permission';
import {
  CorReleationDataType, Environment,
  ImpressionSubtype,
  ImpressionType,
  InteractSubtype,
  InteractType,
  Mode,
  PageId
} from './telemetry-constants';

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
  backButtonFunc = undefined;
  source: string;
  showButton = false;
  appName = '';
  private isScannerActive = false;
  private qrModal: HTMLIonModalElement
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
    private router: Router,
    private modalCtrl: ModalController
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
    return new Promise<string | undefined>(async (resolve, reject) => {
      this.source = source;
      this.showButton = showButton;
      
      this.platform.pause.pipe(
        take(1)
      ).subscribe(() => this.stopScanner());
      this.generateImpressionTelemetry(source);
      this.generateStartEvent(source);
      if (this.platform.is("ios")) {
        resolve(this.startQRScanner(screenTitle, displayText, displayTextColor, buttonText, showButton, source));
      } else {
        const permissionStatus = await this.commonUtilService.getGivenPermissionStatus(AndroidPermission.CAMERA);
        if (permissionStatus.hasPermission) {
          resolve(this.startQRScanner(screenTitle, displayText, displayTextColor, buttonText, showButton, source));
        } else if (permissionStatus.isPermissionAlwaysDenied) {
          await this.commonUtilService.showSettingsPageToast('CAMERA_PERMISSION_DESCRIPTION', this.appName, PageId.QRCodeScanner, false);
        } else {
          this.showPopover(source).then((result) => {
            if (result) {
              resolve(result);
            } else {
              resolve(undefined);
            }
          });
        }
      }
    });
  }

  private async showPopover(pageId: string): Promise<string | undefined> {
    return new Promise<string | undefined>(async (resolve, reject) => {
      const confirm = await this.commonUtilService.buildPermissionPopover(
        async (whichBtnClicked: string) => {
          if (whichBtnClicked === this.commonUtilService.translateMessage('NOT_NOW')) {
            this.telemetryGeneratorService.generateInteractTelemetry(
                InteractType.TOUCH,
                InteractSubtype.NOT_NOW_CLICKED,
                pageId === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
                PageId.PERMISSION_POPUP);
            await this.commonUtilService.showSettingsPageToast
            ('CAMERA_PERMISSION_DESCRIPTION', this.appName, PageId.QRCodeScanner, this.appGlobalService.isOnBoardingCompleted);
          } else {
            this.telemetryGeneratorService.generateInteractTelemetry(
                InteractType.TOUCH,
                InteractSubtype.ALLOW_CLICKED,
                pageId === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
                PageId.PERMISSION_POPUP);
            this.appGlobalService.setIsPermissionAsked(PermissionAskedEnum.isCameraAsked, true);
            this.appGlobalService.isNativePopupVisible = true;
            this.permission.requestPermissions([AndroidPermission.CAMERA]).subscribe((status: AndroidPermissionsStatus) => {
              if (status && status.hasPermission) {
                  this.telemetryGeneratorService.generateInteractTelemetry(
                      InteractType.TOUCH,
                      InteractSubtype.ALLOW_CLICKED,
                      pageId === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
                      PageId.APP_PERMISSION_POPUP
                  );
                  this.startScanner(this.source, this.showButton).then((result) => {
                    if (result) {
                      resolve(result);
                    } else {
                      resolve(undefined);
                    }
                    this.appGlobalService.isNativePopupVisible = false;
                  });
              } else {
                  this.telemetryGeneratorService.generateInteractTelemetry(
                      InteractType.TOUCH,
                      InteractSubtype.DENY_CLICKED,
                      pageId === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
                      PageId.APP_PERMISSION_POPUP
                  );
                  this.commonUtilService.showSettingsPageToast
                ('CAMERA_PERMISSION_DESCRIPTION', this.appName, PageId.QRCodeScanner, this.appGlobalService.isOnBoardingCompleted);
                  this.appGlobalService.setNativePopupVisible(false, 1000);
              }
            }, (e) => { reject(e); });
          }
        }, this.appName, this.commonUtilService.translateMessage('CAMERA'), 'CAMERA_PERMISSION_DESCRIPTION', PageId.QRCodeScanner,
          this.appGlobalService.isOnBoardingCompleted
      );

      await confirm.present();
    });
  }

  public stopScanner() {
    if (!this.isScannerActive) {
      return;
    }
    if (this.platform.is("ios") && this.qrModal) this.qrModal.dismiss();
    // to prevent back event propagating up to parent
    setTimeout(() => {
      (window as any).qrScanner.stopScanner();
      this.isScannerActive = false;
    }, 100);
  }

private getProfileSettingConfig() {
    this.profile = this.appGlobalService.getCurrentUser();
    if (this.commonUtilService.isAccessibleForNonStudentRole(this.profile.profileType)) {
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
    if (this.platform.is("ios")) {
      this.qrModal = await this.modalCtrl.create({
        component: QrScannerIOSComponent,
        cssClass: 'qr-scanner-modal',
        showBackdrop: false,
        backdropDismiss: true,
        mode: 'ios',
        swipeToClose: false
      })
      await this.qrModal.present();
      this.qrModal.onWillDismiss().finally(() => {
        this.stopScanner();
      });
    }
    
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
              this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.SCAN,
                source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
                scannedData === 'cancel_nav_back');
              this.telemetryGeneratorService.generateBackClickedNewTelemetry(
                scannedData === 'cancel_hw_back',
                this.appGlobalService.isOnBoardingCompleted ? Environment.HOME : Environment.ONBOARDING,
                PageId.SCAN
               );
              this.telemetryGeneratorService.generateInteractTelemetry(
                InteractType.OTHER,
                InteractSubtype.QRCodeScanCancelled,
                Environment.HOME,
                PageId.QRCodeScanner);
              this.generateEndEvent(source, '');
            } else if (dialCode) {
              const corRelationList: Array<CorrelationData> = [];
              corRelationList.push({id: dialCode, type: CorReleationDataType.QR});
              this.telemetryGeneratorService.generateInteractTelemetry(
                InteractType.QR_CAPTURED,
                '',
                source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
                PageId.SCAN,
                undefined,
                undefined,
                undefined,
                corRelationList);
              this.generateImpressionTelemetry(source, dialCode);
              this.qrScannerResultHandler.handleDialCode(source, scannedData, dialCode);

            } else if (this.qrScannerResultHandler.isContentId(scannedData)) {
              this.qrScannerResultHandler.handleContentId(source, scannedData);
            } else if (scannedData.includes('/certs/')) {
              this.qrScannerResultHandler.handleCertsQR(source, scannedData);
            } else {
              this.qrScannerResultHandler.handleInvalidQRCode(source, scannedData);
              this.showInvalidCodeAlert(scannedData);
            }
            this.stopScanner();
          }
          resolve(scannedData);
        }, (e) => {
          reject(e);
          if (this.platform.is("ios") && ["camera_access_denied", "camera_access_restricted"].includes(e)) {
            this.commonUtilService.showSettingsPageToast('CAMERA_PERMISSION_DESCRIPTION', this.appName, PageId.QRCodeScanner, false)
          }
          this.stopScanner();
        });
    });
  }

private generateImpressionTelemetry(source, dialCode?) {
    if (dialCode) {
     const corRelationList: Array<CorrelationData> = [];
     corRelationList.push({id: dialCode, type: CorReleationDataType.QR});
     this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.QR_REQUEST, '',
      PageId.SCAN,
      source ? Environment.ONBOARDING : Environment.HOME, '', '', '',
      undefined,
      corRelationList);
     } else {
      this.telemetryGeneratorService.generatePageLoadedTelemetry(
        PageId.SCAN,
        source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME
     );
      this.telemetryGeneratorService.generateImpressionTelemetry(
        ImpressionType.VIEW,
        ImpressionSubtype.QRCodeScanInitiate,
        source,
        source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME);
     }
  }

private generateStartEvent(pageId: string) {
    const telemetryObject = new TelemetryObject('', 'qr', undefined);
    this.telemetryGeneratorService.generateStartTelemetry(
      PageId.QRCodeScanner,
      telemetryObject);
  }

private generateEndEvent(pageId: string, qrData: string) {
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

  private async showInvalidCodeAlert(scannedData) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.OTHER,
      InteractSubtype.QR_CODE_INVALID,
      this.source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
      this.source
    );
    if (this.source !== 'permission') {
      const corRelationList: CorrelationData[] = [{
        id: PageId.SCAN,
        type: CorReleationDataType.CHILD_UI
      }];
      this.telemetryGeneratorService.generateImpressionTelemetry(
          InteractSubtype.QR_CODE_INVALID, '',
          this.source === PageId.ONBOARDING_PROFILE_PREFERENCES ? PageId.SCAN_OR_MANUAL : this.source,
          this.source === PageId.ONBOARDING_PROFILE_PREFERENCES ? Environment.ONBOARDING : Environment.HOME,
          undefined,
          undefined,
          undefined,
          undefined,
          corRelationList
      );
      this.commonUtilService.afterOnBoardQRErrorAlert('INVALID_QR', 'UNKNOWN_QR', this.source, scannedData);
      return;
    }
  }
}
export interface QRResultCallback {
  dialcode(scanResult: string, code: string);

  content(scanResult: string, contentId: string);
}