import { Injectable } from '@angular/core';
import { DeviceSpecification } from 'sunbird-sdk';

declare const buildconfigreader;

@Injectable()

export class UtilityService {
    getBuildConfigValue(property): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                buildconfigreader.getBuildConfigValue('org.sunbird.app', property, (entry: string) => {
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
                buildconfigreader.rm(directoryPath, directoryToBeSkipped, (entry: string) => {
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
                buildconfigreader.openPlayStore(appId, (entry: string) => {
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
                buildconfigreader.getDeviceAPILevel((entry: string) => {
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
                buildconfigreader.checkAppAvailability(packageName, (entry: string) => {
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
                buildconfigreader.getDownloadDirectoryPath((entry: string) => {
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
    exportApk(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                buildconfigreader.exportApk((entry: string) => {
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
                buildconfigreader.getDeviceSpec((deviceSpec: DeviceSpecification) => {
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
                buildconfigreader.getUtmInfo((utmInfo: any) => {
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
                buildconfigreader.clearUtmInfo(() => {
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
                buildconfigreader.readFromAssets(fileName, (entry: string) => {
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
                buildconfigreader.getApkSize((entry: string) => {
                    resolve(entry);
                }, err => {
                    reject(err);
                });
            } catch (xc) {
                reject(xc);
            }
        });
    }
}
