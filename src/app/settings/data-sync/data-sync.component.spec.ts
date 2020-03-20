import {DataSyncComponent} from '@app/app/settings/data-sync/data-sync.component';
import {ArchiveObjectExportProgress, ArchiveObjectType, TelemetryService, ArchiveService, TelemetrySyncStat, ArchiveExportProgress, ObjectNotFoundError} from 'sunbird-sdk';
import {ChangeDetectorRef, NgZone} from '@angular/core';
import {SocialSharing} from '@ionic-native/social-sharing/ngx';
import {CommonUtilService, TelemetryGeneratorService} from '@app/services';
import {Location} from '@angular/common';
import {Platform} from '@ionic/angular';
import {EMPTY, of, throwError} from 'rxjs';

describe('DataSyncComponent', () => {
    let dataSyncComponent: DataSyncComponent;

    const mockTelemetryService: Partial<TelemetryService> = {
        lastSyncedTimestamp: jest.fn().mockImplementation(() => EMPTY)
    };
    const mockArchiveService: Partial<ArchiveService> = {};
    const mockZone: Partial<NgZone> = {};
    const mockChangeDetectionRef: Partial<ChangeDetectorRef> = {};
    const mockSocialSharing: Partial<SocialSharing> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const location: Partial<Location> = {};
    const mockPlatform: Partial<Platform> = {};

    beforeAll(() => {
        dataSyncComponent = new DataSyncComponent(
            mockTelemetryService as TelemetryService,
            mockArchiveService as ArchiveService,
            mockZone as NgZone,
            mockChangeDetectionRef as ChangeDetectorRef,
            mockSocialSharing as SocialSharing,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            location as Location,
            mockPlatform as Platform,
        );
    });

    it('should be able to create an instance', () => {
        expect(dataSyncComponent).toBeTruthy();
    });

    describe('shareTelemetry()', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.clearAllMocks();
            jest.restoreAllMocks();

            mockCommonUtilService.getLoader = jest.fn().mockImplementation(() => {
                return Promise.resolve({
                    present: () => {},
                    dismiss: () => {}
                });
            });
            mockCommonUtilService.showToast = jest.fn().mockImplementation();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn().mockImplementation();

            mockArchiveService.export = jest.fn().mockImplementation(() => of({
                task: 'SOME_TASK',
                progress: new Map<ArchiveObjectType, ArchiveObjectExportProgress>(),
                filePath: 'SOME_FILE_PATH'
            } as ArchiveExportProgress));

            mockSocialSharing.share = jest.fn().mockImplementation();
        });

        describe('should attempt telemetry sync before exporting', () => {
            it('should export telemetry if telemetry sync is successful', (done) => {
                // arrange
                mockTelemetryService.sync = jest.fn().mockImplementation(() => of({
                    syncedEventCount: 100,
                    syncTime: Date.now(),
                    syncedFileSize: 100
                } as TelemetrySyncStat));

                // assert
                dataSyncComponent.shareTelemetry().then(() => {
                    expect(mockTelemetryService.sync).toHaveBeenCalledWith({
                        ignoreAutoSyncMode: false,
                        ignoreSyncThreshold: true
                    });
                    done();
                });
            });

            it('should export telemetry if telemetry sync fails', (done) => {
                // arrange
                mockTelemetryService.sync = jest.fn().mockImplementation(() => throwError(new Error('SOME_ERROR')));

                // assert
                dataSyncComponent.shareTelemetry().then(() => {
                    expect(mockTelemetryService.sync).toHaveBeenCalledWith({
                        ignoreAutoSyncMode: false,
                        ignoreSyncThreshold: true
                    });
                    done();
                });
            });
        });

        describe('should show toast with corresponding error message', () => {
            mockTelemetryService.sync = jest.fn().mockImplementation(() => of({
                syncedEventCount: 100,
                syncTime: Date.now(),
                syncedFileSize: 100
            } as TelemetrySyncStat));

            it('should show toast with generic error message for unknown errors', (done) => {
                // arrange
                mockArchiveService.export = jest.fn().mockImplementation(() => throwError(new Error('SOME_ERROR')));

                // assert
                dataSyncComponent.shareTelemetry().then(() => {
                    expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SHARE_TELEMETRY_FAILED');
                    done();
                });
            });

            it('should show toast with corresponding error message if no data available for export', (done) => {
                // arrange
                mockArchiveService.export = jest.fn().mockImplementation(() => throwError(new ObjectNotFoundError('SOME_ERROR')));

                // assert
                dataSyncComponent.shareTelemetry().then(() => {
                    expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SHARE_TELEMETRY_NO_DATA_FOUND');
                    done();
                });
            });
        });
    });
});
