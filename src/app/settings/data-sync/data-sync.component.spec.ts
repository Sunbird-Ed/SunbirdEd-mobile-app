import {DataSyncComponent} from '../../../app/settings/data-sync/data-sync.component';
import {
    ArchiveExportProgress,
    ArchiveObjectExportProgress,
    ArchiveObjectType,
    ArchiveService,
    ObjectNotFoundError,
    TelemetryAutoSyncModes,
    TelemetryService,
    TelemetrySyncStat
} from '@project-sunbird/sunbird-sdk';
import {ChangeDetectorRef, NgZone} from '@angular/core';
import {SocialSharing} from '@awesome-cordova-plugins/social-sharing/ngx';
import {
    CommonUtilService,
    Environment,
    ImpressionType,
    InteractSubtype,
    InteractType,
    PageId,
    TelemetryGeneratorService
} from '../../../services';
import {Location} from '@angular/common';
import {Platform} from '@ionic/angular';
import {EMPTY, of, throwError} from 'rxjs';

describe('DataSyncComponent', () => {
    let dataSyncComponent: DataSyncComponent;

    const mockTelemetryService: Partial<TelemetryService> = {
        lastSyncedTimestamp: jest.fn().mockImplementation(() => of(100))
    };
    const mockArchiveService: Partial<ArchiveService> = {};
    const mockZone: Partial<NgZone> = {};
    const mockChangeDetectionRef: Partial<ChangeDetectorRef> = {
        detectChanges: jest.fn()
    };
    const mockSocialSharing: Partial<SocialSharing> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockLocation: Partial<Location> = {};
    const mockPlatform: Partial<Platform> = {
        is: jest.fn()
    };

    beforeAll(() => {
        dataSyncComponent = new DataSyncComponent(
            mockTelemetryService as TelemetryService,
            mockArchiveService as ArchiveService,
            mockZone as NgZone,
            mockChangeDetectionRef as ChangeDetectorRef,
            mockSocialSharing as SocialSharing,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockLocation as Location,
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
                    present: () => {
                    },
                    dismiss: () => {
                    }
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

    it('should check for dataSyncType if available generate telemetry and setSyncMode based on that', (done) => {
        // arrange
        dataSyncComponent.dataSyncType = TelemetryAutoSyncModes.ALWAYS_ON;
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        const data = jest.fn(() => of());
        mockTelemetryService.autoSync = {setSyncMode: data};
        const value = new Map();
        value['dataSyncType'] = dataSyncComponent.dataSyncType;
        // act
        dataSyncComponent.onSelected();
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.DATA_SYNC_TYPE,
            Environment.SETTINGS,
            PageId.SETTINGS_DATASYNC,
            undefined,
            value
        );
        setTimeout(() => {
            expect(mockTelemetryService.autoSync.setSyncMode).toHaveBeenCalledWith(dataSyncComponent.dataSyncType);
            done();
        }, 0);
    });

    it('should not call telemetry service and interact telemetry if dataSyncType not available', () => {
        // arrange
        dataSyncComponent.dataSyncType = undefined;
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        const data = jest.fn(() => of());
        mockTelemetryService.autoSync = {setSyncMode: data};
        // act
        dataSyncComponent.onSelected();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).not.toHaveBeenCalled();
    });

    it('should call init method and set dataSyncType and generateImpressionTelemetry', (done) => {
        // arrange
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        const data = jest.fn(() => of(undefined));
        mockTelemetryService.autoSync = {getSyncMode: data};
        mockZone.run = jest.fn();
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,
        } as any;

        const unsubscribeFn = jest.fn();
        dataSyncComponent.backButtonFunc = {
            unsubscribe: unsubscribeFn,
        } as any;
        mockLocation.back = jest.fn();
        mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();

        dataSyncComponent.ngOnInit();
        setTimeout(() => {
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.VIEW, '',
                PageId.SETTINGS_DATASYNC,
                Environment.SETTINGS, '', '', ''
            );
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry)
                .toHaveBeenCalledWith(PageId.SETTINGS_DATASYNC, Environment.SETTINGS, false);
            expect(dataSyncComponent.dataSyncType).toBe(undefined);
            expect(mockLocation.back).toHaveBeenCalled();
            expect(unsubscribeFn).toHaveBeenCalled();
            done();
        }, 0);
    });

    describe('onSyncClick  test cases', () => {
        it('should start loader and generate telemetry and call sbSync handle on telemetry_error', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockTelemetryService.sync = jest.fn(() => of({
                syncedEventCount: 2,
                syncTime: 100,
                syncedFileSize: 3000

            }));
            jest.spyOn(global.sbsync, 'onSyncSucces').mockImplementation((cb) => cb({telemetry_error: 'error'}));
            mockCommonUtilService.showToast = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            dataSyncComponent.onSyncClick();
            expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
            setTimeout(() => {
                expect(presentFn).toHaveBeenCalled();
                expect(global.sbsync.onSyncSucces).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('DATA_SYNC_FAILURE');
                done();
            }, 0);
        });

        it('should start loader and generate telemetry and call sbSync handle on syncedEventCount', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockTelemetryService.sync = jest.fn(() => of({
                syncedEventCount: 2,
                syncTime: 100,
                syncedFileSize: 3000

            }));
            jest.spyOn(global.sbsync, 'onSyncSucces').mockImplementation((cb) => cb({syncedEventCount: 3}));
            mockCommonUtilService.showToast = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            dataSyncComponent.onSyncClick();
            expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
            setTimeout(() => {
                expect(presentFn).toHaveBeenCalled();
                expect(global.sbsync.onSyncSucces).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.TOUCH,
                    InteractSubtype.SYNC_NOW_CLICKED,
                    Environment.SETTINGS,
                    PageId.SETTINGS_DATASYNC,
                    undefined,
                    undefined
                );
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.OTHER, InteractSubtype.MANUALSYNC_SUCCESS, Environment.SETTINGS,
                    PageId.SETTINGS_DATASYNC,
                    undefined,
                    undefined
                );
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('DATA_SYNC_SUCCESSFUL');
                done();
            }, 0);
        });

        it('should show Toast and dismiss loader ', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockTelemetryService.sync = jest.fn(() => of({
                syncedEventCount: 2,
                syncTime: 100,
                syncedFileSize: 3000

            }));
            jest.spyOn(global.sbsync, 'onSyncSucces').mockImplementation((cb) => cb({syncedEventCount: undefined}));
            mockCommonUtilService.showToast = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            dataSyncComponent.onSyncClick();
            expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
            setTimeout(() => {
                expect(presentFn).toHaveBeenCalled();
                expect(global.sbsync.onSyncSucces).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('DATA_SYNC_NOTHING_TO_SYNC');
                done();
            }, 0);
        });

        it('should throw error and go to catch part on sbSyncSuccess ()', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockTelemetryService.sync = jest.fn(() => of({
                syncedEventCount: 2,
                syncTime: 100,
                syncedFileSize: 3000

            }));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            jest.spyOn(global.sbsync, 'onSyncSucces').mockImplementation((_, error) => error('error'));
            mockCommonUtilService.showToast = jest.fn();

            dataSyncComponent.onSyncClick();
            setTimeout(() => {
                expect(presentFn).toHaveBeenCalled();
                expect(global.sbsync.onSyncSucces).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('DATA_SYNC_FAILURE');
                done();
            }, 0);
        });
    });
});
