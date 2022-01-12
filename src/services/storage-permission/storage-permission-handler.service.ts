import { Injectable } from '@angular/core';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { CommonUtilService } from '@app/services/common-util.service';
import {
  Environment, InteractSubtype, InteractType, PageId
} from '../telemetry-constants';
import { AndroidPermission, AndroidPermissionsStatus } from '@app/services/android-permissions/android-permission';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { AndroidPermissionsService } from '../android-permissions/android-permissions.service';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class StoragePermissionHandlerService {
    appName: string;
  constructor(
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appVersion: AppVersion,
    private permissionService: AndroidPermissionsService,
    private platform: Platform
  ) {
  }

  async checkForPermissions(pageId): Promise<boolean | undefined> {
    if(this.platform.is('ios')) {
      return new Promise<boolean | undefined>(async (resolve, reject) => {
        resolve(true);
      });
    }
    this.appName = await this.appVersion.getAppName();
    return new Promise<boolean | undefined>(async (resolve) => {
      const permissionStatus = await this.commonUtilService.getGivenPermissionStatus(AndroidPermission.WRITE_EXTERNAL_STORAGE);
      if (permissionStatus.hasPermission) {
        resolve(true);
      } else if (permissionStatus.isPermissionAlwaysDenied) {
        await this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, pageId, true);
        resolve(false);
      } else {
        this.showStoragePermissionPopover(pageId).then((result) => {
          if (result) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      }
    });
  }

  private async showStoragePermissionPopover(pageId): Promise<boolean | undefined> {
    return new Promise<boolean | undefined>(async (resolve) => {
      const confirm = await this.commonUtilService.buildPermissionPopover(
        async (selectedButton: string) => {
          if (selectedButton === this.commonUtilService.translateMessage('NOT_NOW')) {
            this.telemetryGeneratorService.generateInteractTelemetry( InteractType.TOUCH, InteractSubtype.NOT_NOW_CLICKED, Environment.SETTINGS, PageId.PERMISSION_POPUP);
            await this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, pageId, true);
          } else if (selectedButton === this.commonUtilService.translateMessage('ALLOW')) {
            this.telemetryGeneratorService.generateInteractTelemetry(
              InteractType.TOUCH,
              InteractSubtype.ALLOW_CLICKED,
              Environment.SETTINGS,
              PageId.PERMISSION_POPUP);
            this.permissionService.requestPermission(AndroidPermission.WRITE_EXTERNAL_STORAGE).subscribe(async (status: AndroidPermissionsStatus) => {
                if (status.hasPermission) {
                  this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.ALLOW_CLICKED, Environment.SETTINGS, PageId.APP_PERMISSION_POPUP);
                  resolve(true);
                } else if (status.isPermissionAlwaysDenied) {
                  await this.commonUtilService.showSettingsPageToast
                    ('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, pageId, true);
                  resolve(false);
                } else {
                  this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.DENY_CLICKED, Environment.SETTINGS, PageId.APP_PERMISSION_POPUP);
                  await this.commonUtilService.showSettingsPageToast('FILE_MANAGER_PERMISSION_DESCRIPTION', this.appName, pageId, true);
                }
                resolve(undefined);
              });
          }
        }, this.appName, this.commonUtilService.translateMessage('FILE_MANAGER'), 'FILE_MANAGER_PERMISSION_DESCRIPTION', pageId, true
      );
      await confirm.present();
    });
  }

}
