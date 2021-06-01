import { PageId, Environment, ImpressionType, InteractSubtype } from '../../../services/telemetry-constants';
import { DashboardComponent } from './dashboard.component';
import { Router } from '@angular/router';
import { TelemetryGeneratorService } from '@app/services';
import { AppHeaderService, AppGlobalService, CommonUtilService } from '../../../services';
import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { InteractType } from '@project-sunbird/sunbird-sdk';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { File } from '@ionic-native/file/ngx';
import { StoragePermissionHandlerService } from '@app/services/storage-permission/storage-permission-handler.service';

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
    const mockFileOpener: Partial<FileOpener> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {
        showToast: jest.fn(),
        translateMessage: jest.fn()
    };
    const mockStoragePermissionHandlerService: Partial<StoragePermissionHandlerService> = {};

    beforeAll(() => {
        dashboardComponent = new DashboardComponent(
            mockStoragePermissionHandlerService as StoragePermissionHandlerService,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockFileService as File,
            mockFileOpener as FileOpener,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of dashboardComponent', () => {
        expect(dashboardComponent).toBeTruthy();
    });

    describe('openCSV', () => {
        it('should open Intent for opening CSV', () => {
            //arrange
            mockFileOpener.open = jest.fn(() => Promise.resolve('msg'))
            const type = 'text/csv';
            //act
            dashboardComponent.openCsv('path')
            //assert
            expect( mockFileOpener.open).toHaveBeenCalledWith('path', type)
        })
        it('should open Intent for opening CSV', (done) => {
            //arrange
            mockFileOpener.open = jest.fn(() => Promise.reject('msg'))
            const type = 'text/csv';
            //act
            dashboardComponent.openCsv('path')
            //assert
            expect( mockFileOpener.open).toHaveBeenCalledWith('path', type)
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('CERTIFICATE_ALREADY_DOWNLOADED');
                done();
            }, 0);
        })
    })

});
