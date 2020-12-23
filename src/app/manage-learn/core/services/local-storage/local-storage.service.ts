import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(private storage: Storage) {
  }

  setLocalStorage(key, value): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage
        .set(key, value)
        .then((success) => {
          resolve(success);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getLocalStorage(key): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage
        .get(key)
        .then((data) => {
          if (data) {
            resolve(data);
          } else {
            reject(null);
          }
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
      this.storage
        .remove(key)
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject();
        });
    });
  }
}
