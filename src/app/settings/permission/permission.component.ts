import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { RouterLinks } from '../../../app/app.constant';
import { AndroidPermission, AndroidPermissionsStatus, PermissionAskedEnum } from '../../../services/android-permissions/android-permission';
import { AndroidPermissionsService } from '../../../services/android-permissions/android-permissions.service';
import { AppGlobalService } from '../../../services/app-global-service.service';
import { AppHeaderService } from '../../../services/app-header.service';
import { CommonUtilService } from '../../../services/common-util.service';
import { SunbirdQRScanner } from '../../../services/sunbirdqrscanner.service';
import { Environment, InteractSubtype, InteractType, PageId } from '../../../services/telemetry-constants';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { App } from '@capacitor/app';
import { Platform } from '@ionic/angular';
import { Events } from '../../../util/events';
import { of, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

declare const cordova;

@Component({
    selector: 'app-permission',
    templateUrl: './permission.component.html',
    styleUrls: ['./permission.component.scss'],
    standalone: false
})
export class PermissionComponent implements OnInit {

  appName;

  permissionListDetails: any;

  readonly permissionList = [
    AndroidPermission.CAMERA,
    AndroidPermission.WRITE_EXTERNAL_STORAGE,
    AndroidPermission.RECORD_AUDIO
  ];

  changePermissionAccess = false;
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
    private router: Router,
    private platform: Platform,
    private route: ActivatedRoute
  ) {
    App.getInfo().then((info: any) => {
      this.appName = info.name;
      this.permissionListDetails = [
        {
          title: this.commonUtilService.translateMessage('CAMERA'),
          path: './assets/imgs/ic_photo_camera.png',
          description: this.commonUtilService.translateMessage('CAMERA_PERMISSION_DESCRIPTION', this.appName),
          permission: false
        },
        {
          title: this.commonUtilService.translateMessage('FILE_MANAGER'),
          path: './assets/imgs/ic_folder_open.png',
          description: this.commonUtilService.translateMessage('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName),
          permission: false
        },
        {
          title: this.commonUtilService.translateMessage('MICROPHONE'),
          path: './assets/imgs/ic_keyboard_voice.png',
          description: this.commonUtilService.translateMessage('MICROPHONE_PERMISSION_DESCRIPTION', this.appName),
          permission: false
        }
      ];
    }).catch((e) => console.error(e));

    this.route.queryParams.subscribe(params => {
      this.getNavParams();
    });
  }

  getNavParams() {
    this.navParams = this.router.getCurrentNavigation().extras.state;
    console.log(this.navParams);
  }

  async ionViewWillEnter() {
    this.permission.checkPermissions(this.permissionList).subscribe((res: { [key: string]: AndroidPermissionsStatus }) => {
      this.permissionListDetails[0].permission = res[AndroidPermission.CAMERA].hasPermission;
      this.permissionListDetails[1].permission = res[AndroidPermission.WRITE_EXTERNAL_STORAGE].hasPermission;
      this.permissionListDetails[2].permission = res[AndroidPermission.RECORD_AUDIO].hasPermission;
    });

    if (this.navParams) {
      this.changePermissionAccess = Boolean(this.navParams.changePermissionAccess);
      this.showProfileSettingPage = Boolean(this.navParams.showProfileSettingPage);
      this.showTabsPage = Boolean(this.navParams.showTabsPage);
    }

    await this.headerService.showHeaderWithBackButton();
    this.event.subscribe('event:showScanner', async (data) => {
      if (data.pageName === PageId.PERMISSION) {
        await this.scannerService.startScanner(PageId.PERMISSION, true);
      }
    });

    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
    this.handleBackButton();
  }

  handleBackButton() {
    this.backButtonFunc = this.platform.backButton.subscribeWithPriority(10, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.PERMISSION, Environment.ONBOARDING, false);
      this.location.back();
      this.backButtonFunc.unsubscribe();
    });
  }

  ngOnInit() {
    this.telemetryGeneratorService.generatePageViewTelemetry(PageId.PERMISSION,
      Environment.ONBOARDING, '');
  }

  ionViewWillLeave() {
    if (this.backButtonFunc) {
      this.backButtonFunc.unsubscribe();
    }

    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
  }

  grantAccess() {
    this.appGlobalService.setIsPermissionAsked(PermissionAskedEnum.isCameraAsked, true);
    this.appGlobalService.setIsPermissionAsked(PermissionAskedEnum.isRecordAudioAsked, true);
    this.appGlobalService.setIsPermissionAsked(PermissionAskedEnum.isStorageAsked, true);
    this.generateInteractEvent(true);
    // If user given camera access and the showScannerPage is ON
    this.requestAppPermissions().then(async (status) => {
      if (this.showProfileSettingPage) {
        // check if profileSetting page config. is ON
        const navigationExtras: NavigationExtras = { state: { hideBackButton: false } };
        await this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], navigationExtras);
      } else {
        const navigationExtras: NavigationExtras = { state: { loginMode: 'guest' } };
        await this.router.navigate(['/tabs'], navigationExtras);
      }
    }).catch((e) => console.error(e));
  }

  async skipAccess() {
    this.generateInteractEvent(false);
    if (this.showProfileSettingPage) {
      const navigationExtras: NavigationExtras = { state: { hideBackButton: false } };
      await this.router.navigate([`/${RouterLinks.PROFILE_SETTINGS}`], navigationExtras);
    } else {
      const navigationExtras: NavigationExtras = { state: { loginMode: 'guest' } };
      await this.router.navigate(['/tabs'], navigationExtras);
    }
  }

  private async requestAppPermissions() {
    return this.permission.checkPermissions(this.permissionList).pipe(
      mergeMap((statusMap: { [key: string]: AndroidPermissionsStatus }) => {
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
          return of(undefined);
        }
        return this.permission.requestPermissions(toRequest);
      })
    ).toPromise();
  }

  handleHeaderEvents($event) {
    if ($event.name === 'back') {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.PERMISSION, Environment.ONBOARDING, true);
      this.location.back();
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
