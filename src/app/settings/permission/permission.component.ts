import { Component, OnInit } from '@angular/core';
import { PageId, Environment, InteractType, InteractSubtype } from '../../../services/telemetry-constants';
import { Observable, Subscription } from 'rxjs';
import { Events, Platform } from '@ionic/angular';
import { Router, NavigationExtras } from '@angular/router';
import { AndroidPermission, AndroidPermissionsStatus, PermissionAskedEnum } from '@app/services/android-permissions/android-permission';
import {
  CommonUtilService,
  SunbirdQRScanner,
  AndroidPermissionsService,
  AppGlobalService,
  AppHeaderService,
  TelemetryGeneratorService
} from '@app/services';
import { Location } from '@angular/common';
import { RouterLinks } from '@app/app/app.constant';
import { AppVersion } from '@ionic-native/app-version/ngx';

declare const cordova;

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.scss'],
})
export class PermissionComponent implements OnInit {

  appName = '';

  permissionListDetails = [
    {
      title: this.commonUtilService.translateMessage('CAMERA'),
      path: './assets/imgs/ic_photo_camera.png',
      description: this.commonUtilService.translateMessage('CAMERA_PERMISSION_DESCRIPTION', this.appName),
      permission: false
    },
    {
      title: this.commonUtilService.translateMessage('FILE_MANAGER'),
      path: './assets/imgs/ic_folder_open.png',
      description: this.commonUtilService.translateMessage('FILE_MANAGER_PERMISSION_DESCRIPTION'),
      permission: false
    },
    {
      title: this.commonUtilService.translateMessage('MICROPHONE'),
      path: './assets/imgs/ic_keyboard_voice.png',
      description: this.commonUtilService.translateMessage('MICROPHONE_PERMISSION_DESCRIPTION'),
      permission: false
    }
  ];

  readonly permissionList = [
    AndroidPermission.CAMERA,
    AndroidPermission.WRITE_EXTERNAL_STORAGE,
    AndroidPermission.RECORD_AUDIO
  ];

  changePermissionAccess = false;
  showScannerPage = false;
  showProfileSettingPage = false;
  showTabsPage = false;
  headerObservable: any;
  private navParams: any;
  backButtonFunc: Subscription;

  constructor(
    public commonUtilService: CommonUtilService,
    private scannerService: SunbirdQRScanner,
    private permission: AndroidPermissionsService,
    private appGlobalService: AppGlobalService,
    private headerService: AppHeaderService,
    private event: Events,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private location: Location,
    private appVersion: AppVersion,
    private router: Router,
    private platform: Platform
    ) {
    this.appVersion.getAppName()
      .then((appName: any) => this.appName = appName);
    this.getNavParams();
  }

  getNavParams() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      this.navParams = navigation.extras.state;
    }
    console.log(this.navParams);
  }

  async ionViewWillEnter() {
    await this.permission.checkPermissions(this.permissionList).subscribe((res: { [key: string]: AndroidPermissionsStatus }) => {
      this.permissionListDetails[0].permission = res[AndroidPermission.CAMERA].hasPermission;
      this.permissionListDetails[1].permission = res[AndroidPermission.WRITE_EXTERNAL_STORAGE].hasPermission;
      this.permissionListDetails[2].permission = res[AndroidPermission.RECORD_AUDIO].hasPermission;
    });
    this.changePermissionAccess = Boolean(this.navParams.changePermissionAccess);
    this.showScannerPage = Boolean(this.navParams.showScannerPage);
    this.showProfileSettingPage = Boolean(this.navParams.showProfileSettingPage);
    this.showTabsPage = Boolean(this.navParams.showTabsPage);
    this.headerService.showHeaderWithBackButton();

    this.event.subscribe('event:showScanner', (data) => {
      if (data.pageName === PageId.PERMISSION) {
        this.scannerService.startScanner(PageId.PERMISSION, true);
      }
    });

    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.handleBackButton();
  }

  handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribe(() => {
      this.location.back();
      this.backButtonFunc.unsubscribe();
    });
  }

  ngOnInit() {
    this.telemetryGeneratorService.generatePageViewTelemetry(PageId.PERMISSION,
      Environment.ONBOARDING,
      '');
  }

  ionViewWillLeave() {
    this.backButtonFunc.unsubscribe();
  }

  grantAccess() {
    this.appGlobalService.setIsPermissionAsked(PermissionAskedEnum.isCameraAsked, true);
    this.appGlobalService.setIsPermissionAsked(PermissionAskedEnum.isRecordAudioAsked, true);
    this.appGlobalService.setIsPermissionAsked(PermissionAskedEnum.isStorageAsked, true);
    this.generateInteractEvent(true);
    // If user given camera access and the showScannerPage is ON
    this.requestAppPermissions().then((status) => {
      // Check if scannerpage is ON and user given permission to camera then open scanner page
      if (this.showScannerPage) {
        if (status && status.hasPermission) {
          this.scannerService.startScanner(PageId.PERMISSION, true);
        } else {
          this.permission.checkPermissions([AndroidPermission.CAMERA]).toPromise().then((cameraStatus) => {
            if (cameraStatus && cameraStatus[AndroidPermission.CAMERA] && cameraStatus[AndroidPermission.CAMERA].hasPermission) {
              this.scannerService.startScanner(PageId.PERMISSION, true);
            } else if (this.appGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE) {
              const navigationExtras: NavigationExtras = { state: { hideBackButton: false } };
              this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], navigationExtras);
            } else {
              const navigationExtras: NavigationExtras = { state: { loginMode: 'guest' } };
              this.router.navigate(['/tabs'], navigationExtras);
            }
          });
        }
      } else if (this.showProfileSettingPage) {
        // check if profileSetting page config. is ON
        const navigationExtras: NavigationExtras = { state: { hideBackButton: false } };
        this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], navigationExtras);
      } else {
        const navigationExtras: NavigationExtras = { state: { loginMode: 'guest' } };
        this.router.navigate(['/tabs'], navigationExtras);
      }
    });
  }

  skipAccess() {
    this.generateInteractEvent(false);
    if (this.showProfileSettingPage || this.appGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE) {
      const navigationExtras: NavigationExtras = { state: { hideBackButton: false } };
      this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], navigationExtras);
    } else if (this.showScannerPage) {
      this.permission.checkPermissions([AndroidPermission.CAMERA]).toPromise().then((cameraStatus) => {
        if (cameraStatus && cameraStatus[AndroidPermission.CAMERA] && cameraStatus[AndroidPermission.CAMERA].hasPermission) {
          this.scannerService.startScanner(PageId.PERMISSION, true);
        }
      });
    } else {
      const navigationExtras: NavigationExtras = { state: { loginMode: 'guest' } };
      this.router.navigate(['/tabs'], navigationExtras);
    }
  }

  private async requestAppPermissions() {
    return this.permission.checkPermissions(this.permissionList)
      .mergeMap((statusMap: { [key: string]: AndroidPermissionsStatus }) => {
        const toRequest: AndroidPermission[] = [];

        for (const permission in statusMap) {
          if (!statusMap[permission].hasPermission) {
            const values = new Map();
            values['permission'] = permission;
            values['permissionStatus'] = statusMap[permission];
            this.telemetryGeneratorService.generateInteractTelemetry(
              InteractType.OTHER,
              InteractSubtype.PERMISSION_POPUP,
              Environment.HOME,
              PageId.ONBOARDING_LANGUAGE_SETTING,
              undefined,
              values
            );
            toRequest.push(permission as AndroidPermission);
          }
        }

        if (!toRequest.length) {
          return Observable.of(undefined);
        }
        return this.permission.requestPermissions(toRequest);
      }).toPromise();
  }

  handleHeaderEvents($event) {
    if ($event.name === 'back') {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.PERMISSION, Environment.ONBOARDING, true);
    }
  }

  generateInteractEvent(permissionAllowed: boolean) {
    const values = new Map();
    values['permissionAllowed'] = permissionAllowed;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      (permissionAllowed) ? InteractSubtype.GRANT_ACCESS_CLICKED : InteractSubtype.SKIP_CLICKED,
      Environment.ONBOARDING,
      PageId.PERMISSION,
      undefined,
      values);
  }

  stateChange(event) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.APP_PERMISSION_SETTING_CLICKED,
      Environment.ONBOARDING,
      PageId.PERMISSION
    );
    this.location.back();
    cordova.plugins.diagnostic.switchToSettings('application_details', () => {
      console.log('opened settings');
    },
      (err) => {
        console.log('failed to open settings' + err);
      }
    );
  }

}
