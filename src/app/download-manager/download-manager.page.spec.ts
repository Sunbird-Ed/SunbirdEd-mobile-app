import { NgZone } from '@angular/core';
import {
    ContentDeleteStatus,
    ContentService,
    DeviceInfo,
    InteractType,
    SortOrder,
    StorageDestination,
    StorageService
} from '@project-sunbird/sunbird-sdk';
import { DownloadManagerPage } from './download-manager.page';
import {
    AppHeaderService,
    AppGlobalService,
    CommonUtilService,
    FormAndFrameworkUtilService,
    TelemetryGeneratorService
} from '../../services';
import { RouterLinks, EventTopics } from '../../app/app.constant';
import { PopoverController } from '@ionic/angular';
import { Events } from '../../util/events';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Environment, InteractSubtype, PageId } from '../../services/telemetry-constants';
import { featureIdMap } from '../feature-id-map';
import { DbService, LocalStorageService, UtilsService } from '../manage-learn/core/services';

describe('DownloadManagerPage', () => {
    let downloadManagerPage: DownloadManagerPage;

    const mockContentService: Partial<ContentService> = {
        getContentSpaceUsageSummary: jest.fn(() => of([{
            sizeOnDevice: 0,
            path: 'sample_path'
        }])),
        getContents: jest.fn(() => of([])),
        enqueueContentDelete: jest.fn(() => of({} as any)),
        getContentDeleteQueue: jest.fn(() => of([] as any)),
        clearContentDeleteQueue: jest.fn(() => of({} as any))
    };

    const mockDeviceInfo: Partial<DeviceInfo> = {
        getAvailableInternalMemorySize: jest.fn(() => of(''))
    };

    const mockStorageService: Partial<StorageService> = {
        getStorageDestinationDirectoryPath: jest.fn(),
        getStorageDestinationVolumeInfo: jest.fn(() => of({
            info: {
                availableSize: 0,
            }
        } as any)),
        getStorageDestination: jest.fn(() => of(StorageDestination.INTERNAL_STORAGE))
    };
    const mockNgZone: Partial<NgZone> = {
        run: jest.fn((cb) => {
            cb();
        }) as any
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        convertFileSrc: jest.fn(() => 'sample_image_path'),
        translateMessage: jest.fn(() => 'sample_translation'),
        getAppName: jest.fn(() => Promise.resolve('Sunbird')),
        showToast: jest.fn(),
        fileSizeInMB: jest.fn(() => '1MB'),
    };
    const dismissFn = jest.fn(() => Promise.resolve({}));
    const presentFn = jest.fn(() => Promise.resolve({}));
    mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
    }));

    const mockAppHeaderService: Partial<AppHeaderService> = {
        showHeaderWithBackButton: jest.fn(),
        showHeaderWithHomeButton: jest.fn(),
        headerEventEmitted$: of('')
    };

    const mockEvents: Partial<Events> = {
        subscribe: jest.fn((topic, fn) => {
            switch (topic) {
                case EventTopics.LAST_ACCESS_ON:
                    return fn(true);
            }
        }),
        publish: jest.fn(),
        unsubscribe: jest.fn()
    };

    const mockPopOverController: Partial<PopoverController> = {};
    mockPopOverController.create = jest.fn(() => (Promise.resolve({
        present: jest.fn(() => Promise.resolve({})),
        dismiss: jest.fn(() => Promise.resolve({})),
        onDidDismiss: jest.fn(() => Promise.resolve({})),
    } as any)));

    const mockAppGlobalService: Partial<AppGlobalService> = {
        getCurrentUser: jest.fn(() => ({ uid: 'sample_uid' }))
    };

    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: {
                    profile: {},
                }
            }
        } as any)),
        navigate: jest.fn()
    };

    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn(),
        generateAuditTelemetry: jest.fn()
    };

    const supportedPrimaryCategories = [
        'Course',
        'Learning Resource',
        'Explanation Content',
        'Teacher Resource',
        'Content Playlist',
        'Digital Textbook',
        'Practice Question Set',
        'eTextbook',
        'Course Assessment',
    ];
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        getSupportedContentFilterConfig: jest.fn(() => Promise.resolve(supportedPrimaryCategories))
    };

    const mockDb: Partial<DbService> = {
        
    }
    const mockStorage: Partial<LocalStorageService> = {
        getLocalStorage: jest.fn(() => Promise.resolve([])),
        setLocalStorage:jest.fn(() => Promise.resolve())
    }
    const mockUtils: Partial<UtilsService> = {
        
    }
    

    beforeAll(() => {
        downloadManagerPage = new DownloadManagerPage(
            mockContentService as ContentService,
            mockDeviceInfo as DeviceInfo,
            mockStorageService as StorageService,
            mockNgZone as NgZone,
            mockCommonUtilService as CommonUtilService,
            mockAppHeaderService as AppHeaderService,
            mockEvents as Events,
            mockPopOverController as PopoverController,
            mockAppGlobalService as AppGlobalService,
            mockRouter as Router,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockDb as DbService,
            mockStorage as LocalStorageService,
            mockUtils as UtilsService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of DownloadManagerPage', () => {
        // arrange
        // assert
        expect(downloadManagerPage).toBeTruthy();
    });

    describe('ionViewWillEnter', () => {

        it('should show app header with home button', (done) => {
            // arrange
            mockEvents.subscribe = jest.fn((req, fn) => {
                switch (req) {
                    case 'update_header':
                        return fn('sample_respone');
                }
            });
            mockAppHeaderService.showHeaderWithBackButton = jest.fn();
            // act
            downloadManagerPage.ionViewWillEnter().then(() => {
                // assert
                expect(mockAppHeaderService.showHeaderWithHomeButton).toHaveBeenCalledWith(['download', 'settings']);
                done();
            });
        });


        describe('handleHeaderEvents', () => {
            it('should navigate to Active downloads page and generate INTERACT Telemetry', (done) => {
                // arrange
                mockAppHeaderService.headerEventEmitted$ = of({ name: 'download' });
                mockTelemetryGeneratorService.generateExtraInfoTelemetry = jest.fn();
                // act
                downloadManagerPage.ionViewWillEnter().then(() => {
                    // assert
                    expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.ACTIVE_DOWNLOADS]);
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                        InteractType.TOUCH,
                        InteractSubtype.ACTIVE_DOWNLOADS_CLICKED,
                        Environment.DOWNLOADS,
                        PageId.DOWNLOADS);
                    done();
                });
            });

            it('should navigate to Storage settings page and generate INTERACT Telemetry', (done) => {
                // arrange
                mockAppHeaderService.headerEventEmitted$ = of({ name: 'settings' });
                downloadManagerPage.downloadsTab = {
                    deleteAllConfirm: {
                        dismiss: jest.fn(() => Promise.resolve())
                    },
                    unSelectAllContents: jest.fn()
                } as any;
                // act
                downloadManagerPage.ionViewWillEnter().then(() => {
                    // assert
                    expect(downloadManagerPage.downloadsTab.deleteAllConfirm.dismiss).toHaveBeenCalled();
                    expect(downloadManagerPage.downloadsTab.unSelectAllContents).toHaveBeenCalled();
                    expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.STORAGE_SETTINGS]);
                    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                        InteractType.TOUCH,
                        InteractSubtype.SETTINGS_CLICKED,
                        Environment.DOWNLOADS,
                        PageId.DOWNLOADS);
                    done();
                });
            });
        });

        it('should close all the popups when hamburger menu is clicked', (done) => {
            // arrange
            mockEvents.subscribe = jest.fn((req, fn) => {
                switch (req) {
                    case EventTopics.HAMBURGER_MENU_CLICKED:
                        return fn('sample_respone');
                }
            });
            downloadManagerPage.downloadsTab = {
                deleteAllConfirm: {
                    dismiss: jest.fn(() => Promise.resolve())
                },
                unSelectAllContents: jest.fn()
            } as any;
            // act
            downloadManagerPage.ionViewWillEnter().then(() => {
                // assert
                expect(downloadManagerPage.downloadsTab.deleteAllConfirm.dismiss).toHaveBeenCalled();
                expect(downloadManagerPage.downloadsTab.unSelectAllContents).toHaveBeenCalled();
                done();
            });
        });

        it('should not close all the popups when hamburger menu is clicked if download tabs is undefined', (done) => {
            // arrange
            mockStorageService.getStorageDestinationVolumeInfo = jest.fn(() => of({
                info: {
                    availableSize: 309715200,
                }
            } as any));
            mockEvents.subscribe = jest.fn((req, fn) => {
                switch (req) {
                    case EventTopics.HAMBURGER_MENU_CLICKED:
                        return fn('sample_respone');
                }
            });
            downloadManagerPage.downloadsTab = undefined;
            // act
            downloadManagerPage.ionViewWillEnter().then(() => {
                // assert
                expect(downloadManagerPage.downloadsTab).toBeUndefined();
                done();
            });
        });
    });

    describe('ngOnInit', () => {

        it('should invoke getContents and getContentSpaceUsageSummary when resource update event is received', (done) => {
            // arrange
            mockEvents.subscribe = jest.fn((req, fn) => {
                switch (req) {
                    case 'savedResources:update':
                        return fn({ update: true });
                }
            });
            // act
            downloadManagerPage.ngOnInit().then(() => {
                // assert
                expect(mockContentService.getContents).toHaveBeenCalledTimes(2);
                expect(mockContentService.getContentSpaceUsageSummary).toHaveBeenCalledTimes(2);
                done();
            });
        });

        it('should not invoke getContents and getContentSpaceUsageSummary when resource update event is received', (done) => {
            // arrange
            mockEvents.subscribe = jest.fn((req, fn) => {
                switch (req) {
                    case 'savedResources:update':
                        return fn(undefined);
                }
            });
            // act
            downloadManagerPage.ngOnInit().then(() => {
                // assert
                expect(mockContentService.getContents).toHaveBeenCalledTimes(1);
                expect(mockContentService.getContentSpaceUsageSummary).toHaveBeenCalledTimes(1);
                done();
            });
        });

        it('should invoke getContents when ngOnit is called', (done) => {
            // arrange
            mockEvents.subscribe = jest.fn((req, fn) => {
                switch (req) {
                    case 'savedResources:update':
                        return fn({ update: true });
                }
            });
            // act
            downloadManagerPage.ngOnInit().then(() => {
                // assert
                expect(mockContentService.getContents).toHaveBeenCalled();
                expect(downloadManagerPage.appName).toEqual('Sunbird');
                done();
            });
        });

    });

    describe('getDownloadedContents', () => {

        it('should invoke getContents and getContentSpaceUsageSummary when resource update event is received', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockContentService.getContents = jest.fn(() => of([{
                identifier: 'do_21280756435836108811838',
                contentData: {
                    mimeType: 'application/vnd.ekstep.ecml-archive',
                    contentType: 'Resource',
                    identifier: 'do_21280756435836108811838',
                    version: 2,
                    size: 6194293,
                    streamingUrl: 'sample_url',
                    totalScore: 1,
                    pkgVersion: 8,
                },
                isUpdateAvailable: false,
                mimeType: 'application/vnd.ekstep.ecml-archive',
                contentType: 'resource',
                isAvailableLocally: false,
                basePath: 'sample_basepath'
            }] as any));
            // act
            downloadManagerPage.getDownloadedContents(false, false).then(() => {
                // assert
                expect(mockContentService.getContents).toHaveBeenCalledWith({
                    audience: [],
                    primaryCategories: supportedPrimaryCategories,
                    sortCriteria: [{
                        sortAttribute: 'sizeOnDevice',
                        sortOrder: SortOrder.DESC
                    }],
                    uid: 'sample_uid'
                });

                expect(downloadManagerPage.downloadedContents).toBeDefined();
                done();
            });
        });

    });

    describe('deleteContents', () => {
        it('should  invoke deleteContent once if request has only 1 selected content', (done) => {
            // arrange
            mockContentService.deleteContent = jest.fn(() => of([{ status: 'CONTENT_DELETED' }] as any));
            // act
            downloadManagerPage.deleteContents({
                selectedContents: [
                    'do_id_1'
                ]
            } as any);

            setTimeout(() => {
                // assert
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('sample_translation');
                expect(mockEvents.publish).toHaveBeenCalledWith('savedResources:update', {
                    update: true
                });
                done();
            }, 0);
        });

        it('should  show error message if content delete failed', (done) => {
            // arrange
            mockContentService.deleteContent = jest.fn(() => of([{ status: ContentDeleteStatus.NOT_FOUND }] as any));
            // act
            downloadManagerPage.deleteContents({
                selectedContents: [
                    'do_id_1'
                ]
            } as any);

            setTimeout(() => {
                // assert
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('sample_translation');
                done();
            }, 0);
        });

        it('should  show error message if content delete failed', (done) => {
            // arrange
            mockContentService.deleteContent = jest.fn(() => throwError([{ status: ContentDeleteStatus.NOT_FOUND }] as any));
            // act
            downloadManagerPage.deleteContents({
                selectedContents: [
                    'do_id_1'
                ]
            } as any);

            setTimeout(() => {
                // assert
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('sample_translation');
                done();
            }, 0);
        });

        it('should  invoke enqueueContentDelete  if request has more than 1 selected content', (done) => {
            // arrange
            mockContentService.deleteContent = jest.fn(() => of([{ status: 'CONTENT_DELETED' }] as any));
            mockContentService.getContentDeleteQueue = jest.fn(() => of(['o_id_1', 'do_id_2'] as any));
            // act
            downloadManagerPage.deleteContents({
                selectedContents: [
                    'do_id_1',
                    'do_id_2'
                ],
                selectedContentsInfo: { totalSize: 1024 }
            } as any);

            setTimeout(() => {
                // assert
                expect(mockContentService.enqueueContentDelete).toHaveBeenCalledWith({
                    contentDeleteList: ['do_id_1', 'do_id_2']
                });
                done();
            }, 0);
        });

    });

    describe('onSortCriteriaChange', () => {
        it('should invoke getContents with selected sorting type sizeOnDevice', (done) => {
            // arrange
            // act
            downloadManagerPage.onSortCriteriaChange({
                selectedItem: 'CONTENT_SIZE'
            });

            setTimeout(() => {
                // assert
                expect(mockContentService.getContents).toHaveBeenCalledWith({
                    audience: [],
                    primaryCategories: supportedPrimaryCategories,
                    sortCriteria: [{
                        sortAttribute: 'sizeOnDevice',
                        sortOrder: SortOrder.DESC
                    }],
                    uid: 'sample_uid'
                });
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.SORT_OPTION_SELECTED,
                    Environment.DOWNLOADS,
                    PageId.DOWNLOADS,
                    undefined,
                    { selectedOption: 'sizeOnDevice'},
                    undefined,
                    featureIdMap.downloadManager.DOWNLOADS_SORT);
                done();
            }, 0);
        });

        it('should invoke getContents with selected sorting type lastUsedOn', (done) => {
            // arrange
            // act
            downloadManagerPage.onSortCriteriaChange({
                selectedItem: 'LAST_VIEWED'
            });

            setTimeout(() => {
                // assert
                expect(mockContentService.getContents).toHaveBeenCalledWith({
                    audience: [],
                    primaryCategories: supportedPrimaryCategories,
                    sortCriteria: [{
                        sortAttribute: 'lastUsedOn',
                        sortOrder: SortOrder.DESC
                    }],
                    uid: 'sample_uid'
                });
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.SORT_OPTION_SELECTED,
                    Environment.DOWNLOADS,
                    PageId.DOWNLOADS,
                    undefined,
                    { selectedOption: 'lastUsedOn'},
                    undefined,
                    featureIdMap.downloadManager.DOWNLOADS_SORT);
                done();
            }, 0);
        });

        it('should invoke getContents with selected sorting type lastUsedOn', (done) => {
            // arrange
            // act
            downloadManagerPage.onSortCriteriaChange({
                selectedItem: 'NEW_VALUE'
            });

            setTimeout(() => {
                // assert
                expect(mockContentService.getContents).toHaveBeenCalledWith({
                    audience: [],
                    primaryCategories: supportedPrimaryCategories,
                    sortCriteria: [{
                        sortAttribute: undefined,
                        sortOrder: SortOrder.DESC
                    }],
                    uid: 'sample_uid'
                });
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.SORT_OPTION_SELECTED,
                    Environment.DOWNLOADS,
                    PageId.DOWNLOADS,
                    undefined,
                    { selectedOption: undefined},
                    undefined,
                    featureIdMap.downloadManager.DOWNLOADS_SORT);
                done();
            }, 0);
        });

    });

    describe('ionViewWillLeave', () => {
        it('should unsubscribe all events', () => {
            // arrange
            mockContentService.deleteContent = jest.fn(() => of([{ status: 'CONTENT_DELETED' }] as any));
            mockEvents.unSubscribe = jest.fn((topic, fn) => {
                switch (topic) {
                    case EventTopics.LAST_ACCESS_ON:
                        return fn('some_page_id');
                }
            });
            // act
            downloadManagerPage.ionViewWillLeave();
            // assert
            expect(mockEvents.unsubscribe).toHaveBeenNthCalledWith(1, 'update_header');
            expect(mockEvents.unsubscribe).toHaveBeenNthCalledWith(2, EventTopics.HAMBURGER_MENU_CLICKED);
            expect(mockEvents.unsubscribe).toHaveBeenNthCalledWith(3, EventTopics.LAST_ACCESS_ON);
        });
    });
});
