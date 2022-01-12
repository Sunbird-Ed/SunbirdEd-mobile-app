import { Injectable } from '@angular/core';
import { AppGlobalService } from '@app/services';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor(private storage: Storage, private appGlobalService: AppGlobalService) {}

  setLocalStorage(key, value): Promise<any> {
    return new Promise((resolve, reject) => {
      this.appGlobalService
        .getActiveProfileUid()
        .then((userId) => {
          key = userId + key;
        })
        .then(() => {
          this.storage.set(key, value).then((success) => {
            resolve(success);
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getLocalStorage(key): Promise<any> {
    return new Promise((resolve, reject) => {
      this.appGlobalService
        .getActiveProfileUid()
        .then((userId) => {
          key = userId + key;
        })
        .then(() => {
          this.storage.get(key).then((data) => {
            if (data) {
              resolve(data);
            } else {
              reject(null);
            }
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  deleteAllStorage(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage
        .clear()
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject();
        });
    });
  }

  deleteOneStorage(key): Promise<any> {
    return new Promise((resolve, reject) => {
      this.appGlobalService
        .getActiveProfileUid()
        .then((userId) => {
          key = userId + key;
        })
        .then(() => {
          this.storage.remove(key).then((data) => {
            resolve(data);
          });
        })
        .catch((error) => {
          reject();
        });
    });
  }

  hasKey(key): Promise<any> {
    return new Promise((resolve, reject) => {
      this.appGlobalService
        .getActiveProfileUid()
        .then((userId) => {
          key = userId + key;
        })
        .then(() => {
          this.storage.keys().then((data) => {
            data.find((d) => d == key) ? resolve(true) : resolve(false);
          });
        })
        .catch((error) => {
          reject();
        });
    });
  }
}
