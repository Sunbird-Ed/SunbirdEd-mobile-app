import {Injectable} from '@angular/core';
import {Observable} from 'rxjs-compat';
import {AndroidPermission, AndroidPermissionsStatus} from '../android-permissions/android-permission';

declare const cordova;

@Injectable()
export class AndroidPermissionsService {
  checkPermissions(permissions: AndroidPermission[]): Observable<{ [key: string]: AndroidPermissionsStatus }> {
    return Observable.defer(async () => {
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

      return permissions.reduce((acc, permission, index) => {
        acc[permission] = statuses[index];
        return acc;
      }, {});
    });
  }

  requestPermissions(permissions: AndroidPermission[]): Observable<AndroidPermissionsStatus> {
    return Observable.defer(() => {
      return new Promise<AndroidPermissionsStatus>((resolve, reject) => {
        cordova.plugins.permissions.requestPermissions(permissions, (status: AndroidPermissionsStatus) => {
          resolve(status);
        }, (err) => {
          reject(err);
        });
      });
    });
  }
}
