import {Injectable} from '@angular/core';
import {DeviceSpecification} from 'sunbird-sdk';
import {GenericAppConfig} from '@app/app/app.constant';

declare const sbutility;

@Injectable()
export class UtilityService {

    getBuildConfigValue(property): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                sbutility.getBuildConfigValue('org.sunbird.app', property, (entry: string) => {
                    resolve(entry);
                }, err => {
                    console.error(err);
                    reject(err);
                });
            } catch (xc) {
                console.error(xc);
                reject(xc);
            }
        });
    }

    rm(directoryPath, directoryToBeSkipped): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                sbutility.rm(directoryPath, directoryToBeSkipped, (entry: string) => {
                    resolve(entry);
                }, err => {
                    console.error(err);
                    reject(err);
                });
            } catch (xc) {
                console.error(xc);
                reject(xc);
            }
        });
    }

    openPlayStore(appId): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                sbutility.openPlayStore(appId, (entry: string) => {
                    resolve(entry);
                }, err => {
                    console.error(err);
                    reject(err);
                });
            } catch (xc) {
                console.error(xc);
                reject(xc);
            }
        });
    }

    getDeviceAPILevel(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                sbutility.getDeviceAPILevel((entry: string) => {
                    resolve(entry);
                }, err => {
                    console.error(err);
                    reject(err);
                });
            } catch (xc) {
                console.error(xc);
                reject(xc);
            }
        });
    }

    checkAppAvailability(packageName): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                sbutility.checkAppAvailability(packageName, (entry: string) => {
                    resolve(entry);
                }, err => {
                    console.error(err);
                    reject(err);
                });
            } catch (xc) {
                console.error(xc);
                reject(xc);
            }
        });
    }

    getDownloadDirectoryPath(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                sbutility.getDownloadDirectoryPath((entry: string) => {
                    resolve(entry);
                }, err => {
                    console.error(err);
                    reject(err);
                });
            } catch (xc) {
                console.error(xc);
                reject(xc);
            }
        });
    }

    exportApk(destination): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                sbutility.exportApk(destination, (entry: string) => {
                    resolve(entry);
                }, err => {
                    console.error(err);
                    reject(err);
                });
            } catch (xc) {
                console.error(xc);
                reject(xc);
            }
        });
    }

    getDeviceSpec(): Promise<DeviceSpecification> {
        return new Promise<DeviceSpecification>((resolve, reject) => {
            try {
                sbutility.getDeviceSpec((deviceSpec: DeviceSpecification) => {
                    resolve(deviceSpec);
                }, err => {
                    console.error(err);
                    reject(err);
                });
            } catch (xc) {
                console.error(xc);
                reject(xc);
            }
        });
    }

    getUtmInfo(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            try {
                sbutility.getUtmInfo((utmInfo: any) => {
                    console.log('utm parameter', utmInfo);
                    resolve(utmInfo);
                }, err => {
                    reject(err);
                });
            } catch (xc) {
                reject(xc);
            }
        });
    }

    clearUtmInfo(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            try {
                sbutility.clearUtmInfo(() => {
                    console.log('utm paramter clear');
                    resolve();
                }, err => {
                    reject(err);
                });
            } catch (xc) {
                console.error(xc);
                reject(xc);
            }
        });
    }

    readFileFromAssets(fileName: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                sbutility.readFromAssets(fileName, (entry: string) => {
                    resolve(entry);
                }, err => {
                    reject(err);
                });
            } catch (xc) {
                reject(xc);
            }
        });
    }

    getApkSize(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                sbutility.getApkSize((entry: string) => {
                    resolve(entry);
                }, err => {
                    reject(err);
                });
            } catch (xc) {
                reject(xc);
            }
        });
    }

    getMetaData(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            sbutility.getMetaData([{path: filePath, identifier: 'ecar'}], (data) => {
                resolve(data.ecar.size);
            }, err => {
                reject(err);
            });
        });
    }

    removeFile(filePath: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            sbutility.rm([filePath], false, (successfullyDeleted) => {
                resolve(successfullyDeleted);
            }, error => {
                reject(error);
            });
        });
    }

    getAppVersionCode(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.getBuildConfigValue(GenericAppConfig.VERSION_CODE)
                .then(response => {
                    resolve(+response);
                })
                .catch(error => {
                    console.log('Error--', error);
                    resolve(0);
                });
        });
    }

    verifyCaptcha(apiKey: string): Promise<string> {
        return new Promise((resolve, reject) => {
            sbutility.verifyCaptcha(apiKey, (data) => {
                resolve(data);
            }, err => {
                reject(err);
            });
        });
    }

    checkAvailableAppList(packageIds: Array<string>): Promise<{[packageId: string]: boolean}> {
        return new Promise((resolve, reject) => {
            sbutility.getAvailableAppLists(packageIds, (data) => {
                resolve(data);
            }, err => {
                reject(err);
            });
        });
    }

    startActivityForResult(params: {}): Promise<string> {
        return new Promise((resolve, reject) => {
            sbutility.startActivityForResult(params, (data) => {
                resolve(data);
            }, err => {
                reject(err);
            });
        });
    }
}
