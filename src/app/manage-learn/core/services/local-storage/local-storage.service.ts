import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(private storage: Storage) {
    console.log("Hello LocalStorageProvider Provider");
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
          debugger
          if (data) {
            resolve(data);
          } else {
            reject(null);
          }
        })
        .catch((error) => {
          debugger
          reject(error);
        });
    });
  }

  deleteAllStorage(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage
        .clear()
        .then((data) => {
          resolve();
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
          resolve();
        })
        .catch((error) => {
          reject();
        });
    });
  }
}
