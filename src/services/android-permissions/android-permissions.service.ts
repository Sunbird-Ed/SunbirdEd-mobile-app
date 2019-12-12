import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AndroidPermission, AndroidPermissionsStatus } from '@app/services/android-permissions/android-permission';
import { defer } from 'rxjs';

declare const cordova;

@Injectable()
export class AndroidPermissionsService {
  checkPermissions(permissions: AndroidPermission[]): Observable<{ [key: string]: AndroidPermissionsStatus }> {
    return defer(async () => {
      const requestPromises = permissions.map((permission) => {
        return new Promise<AndroidPermissionsStatus>((resolve, reject) => {
          cordova.plugins.permissions.checkPermission(permission, (status: AndroidPermissionsStatus) => {
            resolve(status);
          }, (err) => {
            reject(err);
          });
        });
      });

      const statuses = await Promise.all(requestPromises);

      const permissionStatus = permissions.reduce((acc, permission, index) => {
        acc[permission] = statuses[index];
        return acc;
      }, {});

      for (const permission in permissionStatus) {
        if (permissionStatus.hasOwnProperty(permission)) {
          permissionStatus[permission].isPermissionAlwaysDenied = await this.getAlwaysDeniedStatus(permission as any);
        }
      }

      return permissionStatus;
    });
  }

  requestPermission(permission: AndroidPermission): Observable<AndroidPermissionsStatus> {
    return defer(async () => {
      const permissionStatus: AndroidPermissionsStatus = await new Promise<AndroidPermissionsStatus>((resolve, reject) => {
        cordova.plugins.permissions.requestPermissions([permission], (status: AndroidPermissionsStatus) => {
          resolve(status);
        }, (err) => {
          reject(err);
        });
      });

      permissionStatus.isPermissionAlwaysDenied = await this.getAlwaysDeniedStatus(permission);

      return permissionStatus;
    });
  }

  requestPermissions(permissions: AndroidPermission[]): Observable<AndroidPermissionsStatus> {
    return defer(async () => {
      const permissionStatus: AndroidPermissionsStatus = await new Promise<AndroidPermissionsStatus>((resolve, reject) => {
        cordova.plugins.permissions.requestPermissions(permissions, (status: AndroidPermissionsStatus) => {
          resolve(status);
        }, (err) => {
          reject(err);
        });
      });

      return permissionStatus;
    });
  }

  private async getAlwaysDeniedStatus(androidPermission: AndroidPermission): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      cordova.plugins.diagnostic.getPermissionAuthorizationStatus((status) => {
        switch (status) {
          case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
          case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
            resolve(true);
            break;
          default:
            resolve(false);
        }
      }, (e) => {
        reject(e);
      }, androidPermission.split('.')[2]);
    });
  }
}
