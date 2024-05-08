import { PageId, Environment, ImpressionType, InteractSubtype } from '../../../services/telemetry-constants';
import { DashboardComponent } from './dashboard.component';
import { Router } from '@angular/router';
import { TelemetryGeneratorService } from '../../../services';
import { AppHeaderService, AppGlobalService, CommonUtilService } from '../../../services';
import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { InteractType } from '@project-sunbird/sunbird-sdk';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { StoragePermissionHandlerService } from '../../../services/storage-permission/storage-permission-handler.service';
import { FileOpener } from '@capacitor-community/file-opener';
import { App } from '@capacitor/app';

jest.mock('@capacitor/app', () => {
    return {
      ...jest.requireActual('@capacitor/app'),
        App: {
            getInfo: jest.fn(() => Promise.resolve({id: 'org.sunbird.app', name: 'Sunbird', build: '', version: 9}))
        }
    }
})

jest.mock('@capacitor-community/file-opener', () => {
    return {
      ...jest.requireActual('@capacitor-community/file-opener'),
        FileOpener: {
            open: jest.fn(() => Promise.resolve())
        }
    }
})
describe('DashboardComponent', () => {
    let dashboardComponent: DashboardComponent;

    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        selectedActivityCourseId: ''
    };
    const mockFileService: Partial<File> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn(),
        translateMessage: jest.fn(),
        showSettingsPageToast: jest.fn(),
        isAndroidVer13: jest.fn(() => Promise.resolve(true))
    };
    const mockStoragePermissionHandlerService: Partial<StoragePermissionHandlerService> = {};
    const mockPlatform: Partial<Platform> = {
        is: jest.fn(),
    }
    beforeAll(() => {
        dashboardComponent = new DashboardComponent(
            mockStoragePermissionHandlerService as StoragePermissionHandlerService,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockFileService as File,
            mockPlatform as Platform
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of dashboardComponent', () => {
        expect(dashboardComponent).toBeTruthy();
    });

    describe('ngonInit', () => {
        it('should assign values', () => {
            //arrange
            dashboardComponent.dashletData = {
                rows : [{name: 'some_name'}],
                columns: [{title: 'some_titile'}]
            }
            // act
            dashboardComponent.ngOnInit();
            // assert
        })
    })

    describe('exportCsv', () => {
        it('should call exportcsv from library', (done) => {
            // arrange
            dashboardComponent.collectionName = 'some name';
            App.getInfo = jest.fn(() => Promise.resolve({id: 'org.sunbird.app', name: 'Sunbird', build: '', version: 9})) as any
            mockFileService.writeFile = jest.fn(() => Promise.resolve('path'));
            dashboardComponent.lib = {
                instance: {
                    exportCsv: jest.fn(() => Promise.resolve('csv data'))
                }
            }
            mockStoragePermissionHandlerService.checkForPermissions = jest.fn(() => Promise.resolve(true))
            // act
            dashboardComponent.exportCsv()
            // assert
            setTimeout(() => {
                expect(mockStoragePermissionHandlerService.checkForPermissions).toHaveBeenCalled();
                done()
            });
        })
        it('should call exportcsv from library', (done) => {
            // arrange
            dashboardComponent.collectionName = 'some name';
            App.getInfo = jest.fn(() => Promise.resolve({id: 'org.sunbird.app', name: 'Sunbird', build: '', version: 9})) as any
            mockFileService.writeFile = jest.fn(() => Promise.resolve('path'));
            dashboardComponent.lib = {
                instance: {
                    exportCsv: jest.fn(() => Promise.resolve('csv data'))
                }
            }
            mockStoragePermissionHandlerService.checkForPermissions = jest.fn(() => Promise.resolve(undefined))
            // act
            dashboardComponent.exportCsv()
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showSettingsPageToast).toHaveBeenCalled();
                done()
            });
        })
    })

    describe('openCSV', () => {
        it('should open Intent for opening CSV', () => {
            //arrange
            FileOpener.open = jest.fn(() => Promise.resolve({filePath: 'msg'})) as any
            const type = 'text/csv';
            //act
            dashboardComponent.openCsv('path')
            //assert
            expect( FileOpener.open).toHaveBeenCalledWith({"contentType": "text/csv", "filePath": "path"})
        })
        it('should open Intent for opening CSV', (done) => {
            //arrange
            FileOpener.open = jest.fn(() => Promise.reject({filePath: 'msg'}))
            const type = 'text/csv';
            //act
            dashboardComponent.openCsv('path')
            //assert
            expect( FileOpener.open).toHaveBeenCalledWith({"contentType": "text/csv", "filePath": "path"})
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('CERTIFICATE_ALREADY_DOWNLOADED');
                done();
            }, 0);
        })
    })

});
