import { ContentDetailsPage } from '../content-details/content-details.page';
import {
    ContentService,
    EventsBusService,
    DownloadService,
    ProfileService,
    SharedPreferences,
    StorageService,
    TelemetryObject,
    Content,
    GetAllProfileRequest,
} from '@project-sunbird/sunbird-sdk';
import { Platform, PopoverController } from '@ionic/angular';
import { Events } from '../../util/events';
import { NgZone } from '@angular/core';
import {
    AppGlobalService,
    AppHeaderService,
    CommonUtilService,
    CourseUtilService, FormAndFrameworkUtilService,
    TelemetryGeneratorService,
    UtilityService,
} from '../../services';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { FileSizePipe } from '../../pipes/file-size/file-size';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileSwitchHandler } from '../../services/user-groups/profile-switch-handler';
import { RatingHandler } from '../../services/rating/rating-handler';
import { ContentPlayerHandler } from '../../services/content/player/content-player-handler';
import { ChildContentHandler } from '../../services/content/child-content-handler';
import { ContentDeleteHandler } from '../../services/content/content-delete-handler';
import { of, throwError, EMPTY, Subscription } from 'rxjs';
import { mockContentData } from '../../app/content-details/content-details.page.spec.data';
import {
    Environment,
    ImpressionType,
    InteractSubtype,
    InteractType,
    Mode,
    PageId,
} from '../../services/telemetry-constants';
import { ContentUtil } from '../../util/content-util';
import { PreferenceKey, RouterLinks } from '../app.constant';
import { EventTopics, ShareItemType, ContentFilterConfig } from '../app.constant';
import { FileTransfer } from '@awesome-cordova-plugins/file-transfer/ngx';
import { SbProgressLoader } from '../../services/sb-progress-loader.service';
import { LocalCourseService } from '../../services';
import { ContentEventType, PlayerService } from '@project-sunbird/sunbird-sdk';
import { CourseService } from '@project-sunbird/sunbird-sdk';
import { CsContentType } from '@project-sunbird/client-services/services/content';
import { DomSanitizer } from '@angular/platform-browser';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';

describe('ContentDetailsPage', () => {
    let contentDetailsPage: ContentDetailsPage;

    const mockProfileService: Partial<ProfileService> = {
        addContentAccess: jest.fn(() => of())
    };
    const mockContentService: Partial<ContentService> = {
        getContentDetails: jest.fn(() => of({ contentData: { size: '12KB', status: 'Retired' } })),
        setContentMarker: jest.fn(() => of())
    } as any;
    const mockEventBusService: Partial<EventsBusService> = {};
    const mockPreferences: Partial<SharedPreferences> = {};
    const mockStorageService: Partial<StorageService> = {};
    const mockDownloadService: Partial<DownloadService> = {
        getActiveDownloadRequests: jest.fn(() => of([{identifier: 'sample-id'}]))
    } as any;
    const mockLocalCourseService: Partial<LocalCourseService> = {};
    const mockNgZone: Partial<NgZone> = {
        run: jest.fn()
    };
    const mockEvents: Partial<Events> = {
        subscribe: jest.fn(() => 'playConfig')
    };
    const mockPopoverController: Partial<PopoverController> = {};
    const mockPlatform: Partial<Platform> = {
        is: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        getCurrentUser: jest.fn(() => ({uid: 'user_id'})),
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn(),
        generateEndTelemetry: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        getLoader: jest.fn(() => ({
            present: jest.fn(() => Promise.resolve()),
            dismiss: jest.fn(() => Promise.resolve()),
        })),
        showToast: jest.fn(),
        networkInfo: {
            isNetworkAvailable: true
        },
        convertFileSrc: jest.fn()
    };
    const mockCourseUtilService: Partial<CourseUtilService> = {};
    const mockUtilityService: Partial<UtilityService> = {
        getDeviceAPILevel: jest.fn(() => Promise.resolve('sample')),
        checkAppAvailability: jest.fn(() => Promise.resolve('sample_check'))
    };
    const mockNetwork: Partial<Network> = {};
    const mockFileSizePipe: Partial<FileSizePipe> = {};
    const mockHeaderService: Partial<AppHeaderService> = {
        hideHeader: jest.fn()
    };
    const mockAppVersion: Partial<AppVersion> = {};
    const mockLocation: Partial<Location> = {
        back: jest.fn(() => true)
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockContentData) as any
    };
    const mockRoute: Partial<ActivatedRoute> = {
        queryParams: of({})
    };
    const mockProfileSwitchHandler: Partial<ProfileSwitchHandler> = {};
    const mockRatingHandler: Partial<RatingHandler> = {
        resetRating: jest.fn()
    };
    const mockContentPlayerHandler: Partial<ContentPlayerHandler> = {
        launchContentPlayer: jest.fn(),
        getLastPlayedContentId: jest.fn(),
        isContentPlayerLaunched: jest.fn()
    };
    const mockChildContentHandler: Partial<ChildContentHandler> = {
        contentHierarchyInfo: [{ id: 'do-123' }]
    };
    const contentDeleteCompleted = { subscribe: jest.fn((fn) => fn({ closed: false })) };
    const mockContentDeleteHandler: Partial<ContentDeleteHandler> = { contentDeleteCompleted$: of(contentDeleteCompleted) };
    const mockFileTransfer: Partial<FileTransfer> = {};
    const telemetryObject = new TelemetryObject('do_12345', 'Resource', '1');
    const rollUp = { l1: 'do_123', l2: 'do_123', l3: 'do_1' };
    const mockSbProgressLoader: Partial<SbProgressLoader> = {};
    const mockCourseService: Partial<CourseService> = {};
    const mockFormFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};

    global.window['segmentation'] = {
        init: jest.fn(),
        SBTagService: {
            pushTag: jest.fn(),
            removeAllTags: jest.fn(),
            getTags: jest.fn(() => undefined),
            restoreTags: jest.fn()
        }
    };
    const mockPlayerService: Partial<PlayerService> = {};
    const mockSantizer: Partial<DomSanitizer> = {};
    const mockScreenOrientation: Partial<ScreenOrientation> = {};

    beforeAll(() => {
        contentDetailsPage = new ContentDetailsPage(
            mockProfileService as ProfileService,
            mockContentService as ContentService,
            mockEventBusService as EventsBusService,
            mockStorageService as StorageService,
            mockDownloadService as DownloadService,
            mockPreferences as SharedPreferences,
            mockCourseService as CourseService,
            mockPlayerService as PlayerService,
            mockNgZone as NgZone,
            mockEvents as Events,
            mockPopoverController as PopoverController,
            mockPlatform as Platform,
            mockAppGlobalService as AppGlobalService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockCommonUtilService as CommonUtilService,
            mockCourseUtilService as CourseUtilService,
            mockUtilityService as UtilityService,
            mockNetwork as Network,
            mockFileSizePipe as FileSizePipe,
            mockHeaderService as AppHeaderService,
            mockAppVersion as AppVersion,
            mockLocation as Location,
            mockRouter as Router,
            mockRoute as ActivatedRoute,
            mockProfileSwitchHandler as ProfileSwitchHandler,
            mockRatingHandler as RatingHandler,
            mockContentPlayerHandler as ContentPlayerHandler,
            mockChildContentHandler as ChildContentHandler,
            mockContentDeleteHandler as ContentDeleteHandler,
            mockFileTransfer as FileTransfer,
            mockSbProgressLoader as SbProgressLoader,
            mockLocalCourseService as LocalCourseService,
            mockFormFrameworkUtilService as FormAndFrameworkUtilService,
            mockSantizer as DomSanitizer,
            mockScreenOrientation as ScreenOrientation
        );
    });
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create instance of contentDetailsPage', () => {
        expect(contentDetailsPage).toBeTruthy();
    });

    describe('showSwitchUserAlert', () => {
        it('should return tost for offline', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: false } as any;
            mockCommonUtilService.showToast = jest.fn();
            jest.spyOn(contentDetailsPage, 'openPlayAsPopup').mockImplementation();
            // act
            contentDetailsPage.showSwitchUserAlert(true);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.networkInfo?.isNetworkAvailable).toBeFalsy();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('INTERNET_CONNECTIVITY_NEEDED');
                done();
            }, 0);
        });

        it('should invoked openPlayAsPopup', () => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            AppGlobalService.isPlayerLaunched = false;
            contentDetailsPage.userCount = 3;
            mockNetwork.type = '4g';
            contentDetailsPage.shouldOpenPlayAsPopup = false;
            contentDetailsPage.limitedShareContentFlag = false;
            jest.spyOn(contentDetailsPage, 'openPlayAsPopup').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            contentDetailsPage.showSwitchUserAlert(true);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.PLAY_ONLINE,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    {"id": undefined, "type": undefined, "version": ""},
                    { networkType: '4g' },
                    undefined,
                    [{ id: 'do-123', type: 'Content' }]
                );
                expect(contentDetailsPage.userCount).toBe(1);
                expect(mockNetwork.type).toBe('4g');
                expect(contentDetailsPage.limitedShareContentFlag).toBeFalsy();
            }, 0);
        });

        it('should return a popup if network is 2g and dismiss data is null', () => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            AppGlobalService.isPlayerLaunched = false;
            contentDetailsPage.userCount = 1;
            mockNetwork.type = '2g';
            contentDetailsPage.shouldOpenPlayAsPopup = false;
            contentDetailsPage.limitedShareContentFlag = false;
            contentDetailsPage.content = {
                identifier: 'id'
            };
            contentDetailsPage.contentDownloadable = {
                'id': false
            } as any;
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: null }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn();
            // act
            contentDetailsPage.showSwitchUserAlert(true);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.PLAY_ONLINE,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    {"id": undefined, "type": undefined, "version": ""},
                    { networkType: '4g' },
                    undefined,
                    [{ id: 'do-123', type: 'Content' }]
                );
                expect(mockNetwork.type).toBe('4g');
                expect(contentDetailsPage.limitedShareContentFlag).toBeFalsy();
            }, 0);
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'LOW_BANDWIDTH');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'LOW_BANDWIDTH_DETECTED');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'PLAY_ONLINE');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(4, 'DOWNLOAD');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(5, 'CONSIDER_DOWNLOAD');
        });

        it('should return a popup if network is 2g, isLeftButtonClicked and userCount is 2 ', () => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            AppGlobalService.isPlayerLaunched = false;
            contentDetailsPage.userCount = 2;
            mockNetwork.type = '2g';
            contentDetailsPage.shouldOpenPlayAsPopup = false;
            contentDetailsPage.limitedShareContentFlag = false;
            contentDetailsPage.content = {
                identifier: 'id'
            };
            contentDetailsPage.contentDownloadable = {
                'id': false
            } as any;
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({data: { isLeftButtonClicked: true }}))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn();
            jest.spyOn(contentDetailsPage, 'openPlayAsPopup').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            contentDetailsPage.showSwitchUserAlert(true);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.PLAY_ONLINE,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    {"id": undefined, "type": undefined, "version": ""},
                    { networkType: '4g' },
                    undefined,
                    [{ id: 'do-123', type: 'Content' }]
                );
                expect(mockNetwork.type).toBe('4g');
                expect(contentDetailsPage.limitedShareContentFlag).toBeFalsy();
            }, 0);
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'LOW_BANDWIDTH');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'LOW_BANDWIDTH_DETECTED');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'PLAY_ONLINE');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(4, 'DOWNLOAD');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(5, 'CONSIDER_DOWNLOAD');
        });

        it('should return a popup if network is 2g, isLeftButtonClicked and player is launched ', () => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            AppGlobalService.isPlayerLaunched = false;
            contentDetailsPage.userCount = 1;
            mockNetwork.type = '2g';
            contentDetailsPage.shouldOpenPlayAsPopup = false;
            contentDetailsPage.limitedShareContentFlag = false;
            contentDetailsPage.content = {
                identifier: 'id'
            };
            contentDetailsPage.contentDownloadable = {
                'id': false
            } as any;
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({data: { isLeftButtonClicked: true }}))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn();
            // act
            contentDetailsPage.showSwitchUserAlert(true);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.PLAY_ONLINE,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    {"id": undefined, "type": undefined, "version": ""},
                    { networkType: '4g' },
                    undefined,
                    [{ id: 'do-123', type: 'Content' }]
                );
                expect(mockNetwork.type).toBe('4g');
                expect(contentDetailsPage.limitedShareContentFlag).toBeFalsy();
            }, 0);
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'LOW_BANDWIDTH');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'LOW_BANDWIDTH_DETECTED');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'PLAY_ONLINE');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(4, 'DOWNLOAD');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(5, 'CONSIDER_DOWNLOAD');
        });

        it('should invoked downloadContent()', () => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            AppGlobalService.isPlayerLaunched = false;
            contentDetailsPage.userCount = 1;
            mockNetwork.type = '2g';
            contentDetailsPage.shouldOpenPlayAsPopup = false;
            contentDetailsPage.limitedShareContentFlag = false;
            contentDetailsPage.content = {
                identifier: 'id'
            };
            contentDetailsPage.contentDownloadable = {
                'id': false
            } as any;
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({data: { isLeftButtonClicked: false }}))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn();
            // act
            contentDetailsPage.showSwitchUserAlert(true);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.PLAY_ONLINE,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    {"id": undefined, "type": undefined, "version": ""},
                    { networkType: '4g' },
                    undefined,
                    [{ id: 'do-123', type: 'Content' }]
                );
                expect(mockNetwork.type).toBe('4g');
                expect(contentDetailsPage.limitedShareContentFlag).toBeFalsy();
            }, 0);
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'LOW_BANDWIDTH');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'LOW_BANDWIDTH_DETECTED');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'PLAY_ONLINE');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(4, 'DOWNLOAD');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(5, 'CONSIDER_DOWNLOAD');
        });

        it('should invoked playContent()', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            AppGlobalService.isPlayerLaunched = false;
            contentDetailsPage.userCount = 1;
            mockNetwork.type = '4g';
            contentDetailsPage.shouldOpenPlayAsPopup = false;
            contentDetailsPage.limitedShareContentFlag = false;
            jest.spyOn(contentDetailsPage, 'openPlayAsPopup').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            contentDetailsPage.showSwitchUserAlert(true);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.PLAY_ONLINE,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    {"id": undefined, "type": undefined, "version": ""},
                    { networkType: '4g' },
                    undefined,
                    [{ id: 'do-123', type: 'Content' }]
                );
                expect(mockNetwork.type).toBe('4g');
                expect(contentDetailsPage.limitedShareContentFlag).toBeFalsy();
                done();
            }, 0);
        });

        it('should invoked playContent() for downloaded content', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            AppGlobalService.isPlayerLaunched = false;
            contentDetailsPage.userCount = 1;
            mockNetwork.type = '4g';
            contentDetailsPage.shouldOpenPlayAsPopup = false;
            contentDetailsPage.limitedShareContentFlag = false;
            jest.spyOn(contentDetailsPage, 'openPlayAsPopup').mockImplementation(() => {
                return Promise.resolve();
            });
            contentDetailsPage.source = PageId.ONBOARDING_PROFILE_PREFERENCES;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            // act
            contentDetailsPage.showSwitchUserAlert(true);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.PLAY_ONLINE,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    {"id": undefined, "type": undefined, "version": ""},
                    { networkType: '4g' },
                    undefined,
                    [{ id: 'do-123', type: 'Content' }]
                );
                expect(mockNetwork.type).toBe('4g');
                expect(contentDetailsPage.limitedShareContentFlag).toBeFalsy();
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    InteractType.PLAY,
                    InteractSubtype.DOWNLOAD,
                    PageId.QR_CONTENT_RESULT,
                    Environment.ONBOARDING
                );
                done();
            }, 0);
        });
    });

    describe('generateTelemetry', () => {
        it('should generate event for start event and impression event', () => {
            contentDetailsPage.didViewLoad = false;
            contentDetailsPage.isContentPlayed = false;
            contentDetailsPage.cardData = {
                hierarchyInfo: [{ id: 'sample-id' }],
                identifier: 'do-123',
                pkgVersion: 'v-3'
            };
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateStartTelemetry = jest.fn();
            contentDetailsPage.generateTelemetry();
            // assert
            expect(contentDetailsPage.didViewLoad).toBeTruthy();
            expect(contentDetailsPage.isContentPlayed).toBeFalsy();
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenNthCalledWith(1,
                ImpressionType.DETAIL, '',
                PageId.CONTENT_DETAIL,
                Environment.HOME,
                'do-123', undefined, 'v-3',
                { l1: undefined }, [{ id: 'do-123', type: 'Content' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }]
            );
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenNthCalledWith(2,
                ImpressionType.PAGE_REQUEST, '',
                PageId.CONTENT_DETAIL,
                Environment.ONBOARDING
            );
            expect(mockTelemetryGeneratorService.generatePageLoadedTelemetry).toHaveBeenCalledWith(
                PageId.CONTENT_DETAIL,
                Environment.ONBOARDING,
                undefined,
                undefined,
                undefined,
                undefined,
                [{ id: 'do-123', type: 'Content' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }]
            );
            expect(mockTelemetryGeneratorService.generateStartTelemetry).toHaveBeenCalledWith(
                PageId.CONTENT_DETAIL,
                { id: 'do-123', type: undefined, version: 'v-3' },
                { l1: undefined }, [{ id: 'do-123', type: 'Content' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }]
            );
        });

        it('should return null for else part', () => {
            contentDetailsPage.didViewLoad = true;
            contentDetailsPage.isContentPlayed = true;
            contentDetailsPage.generateTelemetry();
            expect(contentDetailsPage.didViewLoad).toBeTruthy();
            expect(contentDetailsPage.isContentPlayed).toBeTruthy();
        });
    });

    describe('downloadContent', () => {
        it('should return event for download initiated', (done) => {
            // arrange
            mockNgZone.run = jest.fn((fn) => fn());
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            contentDetailsPage.content = {
                contentData: {
                    size: '64kb'
                }
            };
            mockNetwork.type = '4g';
            // jest.spyOn(contentDetailsPage, 'importContent').mockImplementation();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const values = {
                'network-type': '4g',
                size: '64kb'
            };
            mockStorageService.getStorageDestinationDirectoryPath = jest.fn();
            mockContentService.importContent = jest.fn(() => of([{ status: -1 }]));
            mockCommonUtilService.showToast = jest.fn();
            // act
            contentDetailsPage.downloadContent();
            // assert
            setTimeout(() => {
                expect(mockNgZone.run).toHaveBeenCalled();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.DOWNLOAD_INITIATE,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    { id: 'do-123', type: undefined, version: 'v-3' },
                    values, { l1: undefined },
                    [{ id: 'do-123', type: 'Content' }, { id: 'content-detail', type: 'ChildUi' }]
                );
                done();
            }, 0);
        });

        it('should return null for else part', (done) => {
            mockNgZone.run = jest.fn((fn) => fn());
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            contentDetailsPage.downloadContent();
            setTimeout(() => {
                expect(mockNgZone.run).toHaveBeenCalled();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeFalsy();
                done();
            }, 0);
        });
    });

    describe('markContent', () => {
        it('should update content last access time', (done) => {
            // arrange
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({
                uid: 'sample-uid'
            }));
            mockProfileService.addContentAccess = jest.fn(() => of(true));
            mockEvents.publish = jest.fn();
            mockContentService.setContentMarker = jest.fn(() => of(true));
            // act
            contentDetailsPage.markContent();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
                expect(mockProfileService.addContentAccess).toHaveBeenCalledWith({
                    contentId: 'do_212911645382959104165',
                    contentType: undefined,
                    status: 1
                });
                expect(mockEvents.publish).toHaveBeenCalledWith(EventTopics.LAST_ACCESS_ON, true);
                expect(mockContentService.setContentMarker).toHaveBeenCalledWith(
                    {
                        contentId: 'do_212911645382959104165',
                        data: JSON.stringify({ size: '64kb' }),
                        extraInfo: {},
                        isMarked: true,
                        marker: 1,
                        uid: 'sample-uid'
                    }
                );
                done();
            }, 0);
        });

        it('should not update content last access time for else part', (done) => {
            // arrange
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({
                uid: 'sample-uid'
            }));
            mockProfileService.addContentAccess = jest.fn(() => of(false));
            mockContentService.setContentMarker = jest.fn(() => of(true));
            // act
            contentDetailsPage.markContent();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
                expect(mockProfileService.addContentAccess).toHaveBeenCalledWith({
                    contentId: 'do_212911645382959104165',
                    contentType: undefined,
                    status: 1
                });
                expect(mockContentService.setContentMarker).toHaveBeenCalledWith(
                    {
                        contentId: 'do_212911645382959104165',
                        data: JSON.stringify({ size: '64kb' }),
                        extraInfo: {},
                        isMarked: true,
                        marker: 1,
                        uid: 'sample-uid'
                    }
                );
                done();
            }, 0);
        });
    });

    describe('extractApiResponse', () => {
        it('should be return player response', (done) => {
            // arrange
            const request: Content = {
                contentData: {
                    licenseDetails: {
                        description: 'descript',
                        name: 'sample-name',
                        url: 'sample-url'
                    },
                    appIcon: 'sample-app-icon',
                    streamingUrl: 'streamingUrl',
                    me_totalDownloads: 'true',
                    attributions: ['sample-2', 'sample-1']
                },
                mimeType: 'application/vnd.ekstep.h5p',
                contentMarker: [{
                    extraInfoMap: { hierarchyInfo: [{ id: 'do-123' }] }
                }],
                isAvailableLocally: true,
                contentAccess: 'content-access',
                isUpdateAvailable: true
            };
            jest.spyOn(contentDetailsPage, 'checkLimitedContentSharingFlag').mockImplementation();
            contentDetailsPage.isResumedCourse = true;
            contentDetailsPage.resumedCourseCardData = {
                contentId: 'sample-content-id',
                identifier: 'sample-id'
            };
            mockChildContentHandler.setChildContents = jest.fn();
            jest.spyOn(ContentUtil, 'getAppIcon').mockReturnValue('sample-app-icon');
            mockCommonUtilService.convertFileSrc = jest.fn();
            jest.spyOn(contentDetailsPage, 'generateTelemetry').mockReturnValue();
            jest.spyOn(contentDetailsPage, 'markContent').mockImplementation();
            mockUtilityService.getDeviceAPILevel = jest.fn(() => Promise.resolve('sample'));
            mockContentPlayerHandler.isContentPlayerLaunched = jest.fn(() => true);
            contentDetailsPage.cardData = {
                hierarchyInfo: undefined
            };
            contentDetailsPage.isChildContent = false;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            contentDetailsPage.playingContent = request;
            contentDetailsPage.downloadAndPlay = true;
            // act
            contentDetailsPage.extractApiResponse(request);
            // assert
            setTimeout(() => {
                expect(contentDetailsPage.isResumedCourse).toBeTruthy();
                expect(mockChildContentHandler.setChildContents).toHaveBeenCalledWith(
                    contentDetailsPage.resumedCourseCardData.contentId, 0, 'do_212911645382959104165');
                expect(mockCommonUtilService.convertFileSrc).toHaveBeenCalledWith('sample-app-icon');
                expect(mockContentPlayerHandler.isContentPlayerLaunched).toHaveBeenCalled();
                expect(contentDetailsPage.isChildContent).toBeTruthy();
                expect(contentDetailsPage.streamingUrl).toBe(request.contentData.streamingUrl);
                expect(contentDetailsPage.content.contentData.attributions).toBe('sample-1, sample-2');
                done();
            }, 0);
        });

        it('should not return api respone', (done) => {
            // arrange
            const request: Content = {
                contentData: {
                    licenseDetails: undefined,
                    appIcon: 'sample-app-icon',
                    streamingUrl: undefined,
                    me_totalDownloads: false
                },
                mimeType: 'application',
                contentMarker: [{
                    extraInfoMap: { hierarchyInfo: [{ id: 'do-123' }] }
                }],
                isAvailableLocally: false,
                contentAccess: 'content-access',
                isUpdateAvailable: true,
                me_totalDownloads: true,
                lastUpdatedTime: 0
            };
            jest.spyOn(contentDetailsPage, 'checkLimitedContentSharingFlag').mockImplementation();
            contentDetailsPage.isResumedCourse = false;
            contentDetailsPage.resumedCourseCardData = {
                contentId: 'sample-content-id',
                identifier: 'sample-id'
            };
            mockChildContentHandler.setChildContents = jest.fn();
            jest.spyOn(ContentUtil, 'getAppIcon').mockReturnValue('sample-app-icon');
            mockCommonUtilService.convertFileSrc = jest.fn();
            jest.spyOn(contentDetailsPage, 'generateTelemetry').mockReturnValue();
            jest.spyOn(contentDetailsPage, 'markContent').mockImplementation();
            mockUtilityService.getDeviceAPILevel = jest.fn(() => Promise.resolve('sample'));
            mockContentPlayerHandler.isContentPlayerLaunched = jest.fn(() => true);
            contentDetailsPage.cardData = {
                hierarchyInfo: [{ id: 'do-123' }]
            };
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            contentDetailsPage.playingContent = request;
            contentDetailsPage.downloadAndPlay = true;
            contentDetailsPage.shouldGenerateTelemetry = false;
            mockContentPlayerHandler.isContentPlayerLaunched = jest.fn(() => false);
            jest.spyOn(contentDetailsPage, 'downloadContent').mockImplementation();
            // act
            contentDetailsPage.extractApiResponse(request);
            // assert
            setTimeout(() => {
                expect(contentDetailsPage.isResumedCourse).toBeFalsy();
                expect(mockCommonUtilService.convertFileSrc).toHaveBeenCalledWith('sample-app-icon');
                expect(mockContentPlayerHandler.isContentPlayerLaunched).toHaveBeenCalled();
                done()
            }, 0);
        });
    });

    describe('getNextContent', () => {
        it('should return response with next content', () => {
            // arrange
            const hierarchyInfo = [{ id: 'sample-id' }];
            const identifier = 'do-123';
            mockContentService.nextContent = jest.fn(()=> of({
                hierarchyInfo: hierarchyInfo,
                    identifier: 'identifier'
               })) as any;  
            // act
            contentDetailsPage.getNextContent(hierarchyInfo, identifier);
            // assert
            setTimeout(() => {
            }, 0);
        });
    });

    describe('setContentDetails', () => {
        it('should return content data by invoked setContentDetails', (done) => {
            // arrange
            const identifier = 'do_123', refreshContentDetails = true, showRating = false;
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockContentService.getContentDetails = jest.fn(() => of({ contentData: { size: '12KB', status: 'Retired' } }));
            const content = { hierachyInfo: [ { id: 'do-123' } ] };
            mockCommonUtilService.showToast = jest.fn();
            contentDetailsPage.cardData = content;
            mockLocation.back = jest.fn();
            jest.spyOn(contentDetailsPage, 'extractApiResponse').mockReturnValue();
            jest.spyOn(contentDetailsPage, 'showRetiredContentPopup').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            contentDetailsPage.setContentDetails(identifier, refreshContentDetails, showRating);
            // assert
            setTimeout(() => {
                expect(presentFn).toHaveBeenCalled();
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return content data by invoked setContentDetails if size and status are null', (done) => {
            // arrange
            const identifier = 'do_123', refreshContentDetails = true, showRating = false;
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockContentService.getContentDetails = jest.fn(() => of({ contentData: {} }));
            mockCommonUtilService.showToast = jest.fn();
            mockLocation.back = jest.fn();
            jest.spyOn(contentDetailsPage, 'extractApiResponse').mockReturnValue();
            jest.spyOn(contentDetailsPage, 'showRetiredContentPopup').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            contentDetailsPage.setContentDetails(identifier, refreshContentDetails, showRating);
            // assert
            setTimeout(() => {
                expect(presentFn).toHaveBeenCalled();
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return content data by invoked setContentDetails for empty content', (done) => {
            // arrange
            const identifier = 'do_123', refreshContentDetails = true, showRating = false;
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockContentService.getContentDetails = jest.fn(() => of(undefined));
            mockCommonUtilService.showToast = jest.fn();
            mockLocation.back = jest.fn();
            jest.spyOn(contentDetailsPage, 'extractApiResponse').mockReturnValue();
            jest.spyOn(contentDetailsPage, 'showRetiredContentPopup').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            contentDetailsPage.setContentDetails(identifier, refreshContentDetails, showRating);
            // assert
            setTimeout(() => {
                expect(presentFn).toHaveBeenCalled();
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return content data by invoked setContentDetails for showRating', (done) => {
            // arrange
            const content = { hierachyInfo: [ { id: 'do-123' } ] };
            contentDetailsPage.cardData = content;
            const identifier = 'do_123', refreshContentDetails = true, showRating = true;
            mockContentService.getContentDetails = jest.fn(() => of({ contentData: { size: '12KB', status: 'Retired' } }));
            mockCommonUtilService.showToast = jest.fn();
            mockLocation.back = jest.fn();
            contentDetailsPage.navigateBackFlag = false; 
            jest.spyOn(contentDetailsPage, 'extractApiResponse').mockReturnValue();
            jest.spyOn(contentDetailsPage, 'showRetiredContentPopup').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(contentDetailsPage, 'getNextContent').mockImplementation(() => {
                return Promise.resolve();
            });
            mockContentPlayerHandler.setContentPlayerLaunchStatus = jest.fn();
            mockRatingHandler.showRatingPopup = jest.fn(() => Promise.resolve({}));
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockContentPlayerHandler.setLastPlayedContentId = jest.fn();
            // act
            contentDetailsPage.setContentDetails(identifier, refreshContentDetails, showRating);
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return content data by invoked setContentDetails for catch part for ERROR_CONTENT_NOT_AVAILABLE', (done) => {
            // arrange
            const identifier = 'do_123', refreshContentDetails = true, showRating = false;
            contentDetailsPage.content = { identifier: 'd0_123' };
            mockContentService.getContentDetails = jest.fn(() => throwError('error'));
            mockCommonUtilService.showToast = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            contentDetailsPage.isDownloadStarted = false;
            contentDetailsPage.navigateBackFlag = false; 
            mockLocation.back = jest.fn();
            // act
            contentDetailsPage.setContentDetails(identifier, refreshContentDetails, showRating);
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_CONTENT_NOT_AVAILABLE');
                expect(mockLocation.back).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return content data by invoked setContentDetails for catch part for CONNECTION_ERROR', (done) => {
            // arrange
            const identifier = 'do_123', refreshContentDetails = true, showRating = false;
            contentDetailsPage.content = { identifier: 'd0_123' };
            mockContentService.getContentDetails = jest.fn(() => throwError({ CONNECTION_ERROR: 'CONNECTION_ERROR' }));
            mockCommonUtilService.showToast = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            contentDetailsPage.isDownloadStarted = true;
            contentDetailsPage.navigateBackFlag = false; 
            mockLocation.back = jest.fn();
            // act
            contentDetailsPage.setContentDetails(identifier, refreshContentDetails, showRating);
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
                expect(mockLocation.back).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return content data by invoked setContentDetails for catch part for SERVER_ERROR', (done) => {
            // arrange
            const identifier = 'do_123', refreshContentDetails = true, showRating = false;
            contentDetailsPage.content = { identifier: 'd0_123' };
            mockContentService.getContentDetails = jest.fn(() => throwError({ SERVER_ERROR: 'CONNECTION_ERROR' }));
            mockCommonUtilService.showToast = jest.fn();
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            }));
            contentDetailsPage.isDownloadStarted = true;
            contentDetailsPage.navigateBackFlag = false; 
            mockLocation.back = jest.fn();
            // act
            contentDetailsPage.setContentDetails(identifier, refreshContentDetails, showRating);
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_FETCHING_DATA');
                expect(mockLocation.back).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('openPDFPreview()', () => {
        it('should download pdf if not available locally', (done) => {
            // arrange
            const content: Partial<Content> = {
                contentData: {
                    itemSetPreviewUrl: 'http://some_domain.com/som_path.some_extension'
                }
            };
            const mockPresent = jest.fn(() => Promise.resolve());
            const mockDismiss = jest.fn(() => Promise.resolve());
            const mockDownload = jest.fn(() => Promise.resolve({
                toURL: () => 'SOME_TEMP_URL'
            }));
            mockCommonUtilService.getLoader = jest.fn(() => {
                return Promise.resolve({
                    present: mockPresent,
                    dismiss: mockDismiss
                });
            });
            mockCommonUtilService.showToast = jest.fn(() => { });
            mockFileTransfer.create = jest.fn(() => {
                return {
                    download: mockDownload
                };
            })as any;
            window.cordova.plugins['printer'].canPrintItem = jest.fn((_, cb) => { cb(true); });
            window.cordova.plugins['printer'].print = jest.fn();
            // act
            contentDetailsPage.openPDFPreview(content as Content).then(() => {
                // assert
                expect(mockFileTransfer.create).toHaveBeenCalled();
                expect(mockDownload).toHaveBeenCalledWith(content.contentData.itemSetPreviewUrl, expect.any(String));
                expect(window.cordova.plugins['printer'].print).toHaveBeenCalledWith('SOME_TEMP_URL');
                done();
            });
        });

        it('should not download pdf if available locally', (done) => {
            // arrange
            const content: Partial<Content> = {
                basePath: '/some_local_path/some_local_path',
                contentData: {
                    itemSetPreviewUrl: '/some_path.some_extension'
                }
            };
            const mockPresent = jest.fn(() => Promise.resolve());
            const mockDismiss = jest.fn(() => Promise.resolve());
            const mockDownload = jest.fn(() => Promise.resolve({
                toURL: () => 'SOME_TEMP_URL'
            }));
            mockCommonUtilService.getLoader = jest.fn(() => {
                return Promise.resolve({
                    present: mockPresent,
                    dismiss: mockDismiss
                });
            });
            mockCommonUtilService.showToast = jest.fn(() => { });
            mockFileTransfer.create = jest.fn(() => {
                return {
                    download: mockDownload
                };
            });
            window.cordova.plugins['printer'].canPrintItem = jest.fn((_, cb) => { cb(true); });
            window.cordova.plugins['printer'].print = jest.fn();
            // act
            contentDetailsPage.openPDFPreview(content as Content).then(() => {
                // assert
                expect(mockFileTransfer.create).not.toHaveBeenCalled();
                expect(mockDownload).not.toHaveBeenCalled();
                expect(window.cordova.plugins['printer'].print).toHaveBeenCalledWith(
                    'file:///some_local_path/some_local_path/some_path.some_extension'
                );
                done();
            });
        });

        it('should show error toast on file print failure', (done) => {
            // arrange
            const content: Partial<Content> = {
                basePath: '/some_local_path/some_local_path',
                contentData: {
                    itemSetPreviewUrl: '/some_path.some_extension'
                }
            };
            const mockPresent = jest.fn(() => Promise.resolve());
            const mockDismiss = jest.fn(() => Promise.resolve());
            const mockDownload = jest.fn(() => Promise.resolve({
                toURL: () => 'SOME_TEMP_URL'
            }));
            mockCommonUtilService.getLoader = jest.fn(() => {
                return Promise.resolve({
                    present: mockPresent,
                    dismiss: mockDismiss
                });
            });
            mockCommonUtilService.showToast = jest.fn(() => { });
            mockFileTransfer.create = jest.fn(() => {
                return {
                    download: mockDownload
                };
            })as any;
            window.cordova.plugins['printer'].canPrintItem = jest.fn((_, cb) => { cb(true); });
            window.cordova.plugins['printer'].print = jest.fn(() => { throw new Error('UNEXPECTED_ERROR'); });
            // act
            contentDetailsPage.openPDFPreview(content as Content).then(() => {
                // assert
                expect(window.cordova.plugins['printer'].print).toHaveBeenCalledWith(
                    'file:///some_local_path/some_local_path/some_path.some_extension'
                );
                expect(mockDismiss).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_COULD_NOT_OPEN_FILE');
                done();
            });
        });

        it('should show error toast on fileCanPrint() returns false', (done) => {
            // arrange
            const content: Partial<Content> = {
                basePath: 'file://some_local_path/some_local_path',
                contentData: {
                    itemSetPreviewUrl: '/some_path.some_extension'
                }
            };
            const mockPresent = jest.fn(() => Promise.resolve());
            const mockDismiss = jest.fn(() => Promise.resolve());
            const mockDownload = jest.fn(() => Promise.resolve({
                toURL: () => 'SOME_TEMP_URL'
            }));
            mockCommonUtilService.getLoader = jest.fn(() => {
                return Promise.resolve({
                    present: mockPresent,
                    dismiss: mockDismiss
                });
            });
            mockCommonUtilService.showToast = jest.fn(() => { });
            mockFileTransfer.create = jest.fn(() => {
                return {
                    download: mockDownload
                };
            })as any;
            window.cordova.plugins['printer'].canPrintItem = jest.fn((_, cb) => { cb(false); });
            // act
            contentDetailsPage.openPDFPreview(content as Content).then(() => {
                // assert
                expect(window.cordova.plugins['printer'].print).not.toHaveBeenCalledWith(
                    'file://some_local_path/some_local_path/some_path.some_extension'
                );
                expect(mockDismiss).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_COULD_NOT_OPEN_FILE');
                done();
            });
        });
    });

    describe('generateEndEvent()', () => {
        it('should generate END Telemetry with given contentType', () => {
            // arrange
            contentDetailsPage.telemetryObject = telemetryObject;
            contentDetailsPage.objRollup = rollUp;
            // act
            contentDetailsPage.generateEndEvent();
            // assert
            expect(mockTelemetryGeneratorService.generateEndTelemetry).toHaveBeenCalledWith(CsContentType.RESOURCE,
                Mode.PLAY,
                PageId.CONTENT_DETAIL,
                Environment.HOME,
                telemetryObject,
                rollUp,
                [{ id: 'do-123', type: 'Content' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }]);
        });

        it('should generate END Telemetry with  contentType if telemetryObject contentType is empty', () => {
            // arrange
            contentDetailsPage.telemetryObject = new TelemetryObject('do_12345', '', '1');
            contentDetailsPage.objRollup = rollUp;
            // act
            contentDetailsPage.generateEndEvent();
            // assert
            expect(mockTelemetryGeneratorService.generateEndTelemetry).toHaveBeenCalledWith('Learning Resource',
                Mode.PLAY,
                PageId.CONTENT_DETAIL,
                Environment.HOME,
                contentDetailsPage.telemetryObject,
                rollUp,
                [{ id: 'do-123', type: 'Content' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }]);
        });
    });

    describe('generateQRSessionEndEvent', () => {
        it('should return end event for qr code', () => {
            const pageId = 'sample-page-id', qrData = 'QR1234';
            mockTelemetryGeneratorService.generateEndTelemetry = jest.fn();
            contentDetailsPage.generateQRSessionEndEvent(pageId, qrData);
            expect(mockTelemetryGeneratorService.generateEndTelemetry).toHaveBeenCalledWith(
                'qr',
                Mode.PLAY,
                pageId,
                Environment.HOME,
                { id: 'QR1234', type: 'qr', version: '' }, undefined,
                [{ id: 'do-123', type: 'Content' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }]
            );
        });

        it('should not return end event for else part', () => {
            const pageId = '', qrData = 'QR1234';
            mockTelemetryGeneratorService.generateEndTelemetry = jest.fn();
            contentDetailsPage.generateQRSessionEndEvent(pageId, qrData);
        });
    });

    describe('popToPreviousPage', () => {
        it('should navigate to profile-settings page', () => {
            mockAppGlobalService.showCourseCompletePopup = false;
            contentDetailsPage.source = PageId.ONBOARDING_PROFILE_PREFERENCES;
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            // act
            contentDetailsPage.popToPreviousPage();
            // assert
            expect(mockAppGlobalService.showCourseCompletePopup).toBeFalsy();
            expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.PROFILE_SETTINGS}`],
                { state: { showFrameworkCategoriesMenu: true }, replaceUrl: true });
        });

        it('should goback to 3steps for single content', () => {
            mockAppGlobalService.showCourseCompletePopup = false;
            contentDetailsPage.source = PageId.HOME;
            contentDetailsPage.isSingleContent = true;
            window.history = {
                go: jest.fn()
            } as any;
            // act
            contentDetailsPage.popToPreviousPage();
            // assert
            expect(mockAppGlobalService.showCourseCompletePopup).toBeFalsy();
        });

        it('should navigate to search page for multiple content', () => {
            mockAppGlobalService.showCourseCompletePopup = false;
            contentDetailsPage.source = PageId.HOME;
            contentDetailsPage.isSingleContent = false;
            contentDetailsPage.resultLength = 1;
            window.history = {
                go: jest.fn()
            } as any;
            // act
            contentDetailsPage.popToPreviousPage();
            // assert
            expect(mockAppGlobalService.showCourseCompletePopup).toBeFalsy();
        });

        it('should navigate to previous page for else part', () => {
            mockAppGlobalService.showCourseCompletePopup = false;
            contentDetailsPage.source = PageId.HOME;
            contentDetailsPage.isSingleContent = false;
            contentDetailsPage.resultLength = 2;
            mockEvents.publish = jest.fn(() => []);
            mockLocation.back = jest.fn();
            // act
            contentDetailsPage.popToPreviousPage();
            // assert
            expect(mockAppGlobalService.showCourseCompletePopup).toBeFalsy();
            expect(mockLocation.back).toHaveBeenCalled();
        });
    });

    describe('handleDeviceBackButton', () => {
        it('should handle device back button', () => {
            const subscribeWithPriorityData = jest.fn((_, fn) => fn());
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData,
            } as any;
            mockEvents.publish = jest.fn();
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockLocation.back = jest.fn();
            jest.spyOn(contentDetailsPage, 'popToPreviousPage').mockImplementation();
            jest.spyOn(contentDetailsPage, 'generateEndEvent').mockImplementation();
            contentDetailsPage.shouldGenerateEndTelemetry = true;
            jest.spyOn(contentDetailsPage, 'generateQRSessionEndEvent').mockImplementation();
            contentDetailsPage.handleDeviceBackButton();
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                PageId.CONTENT_DETAIL,
                Environment.HOME,
                false,
                undefined,
                [{ id: 'do-123', type: 'Content' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }],
                { l1: 'do_123', l2: 'do_123', l3: 'do_1' },
                { id: 'do_12345', type: '', version: '1' }
            );
        });

        it('should handle device back button', () => {
            const subscribeWithPriorityData = jest.fn((_, fn) => fn());
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData,
            } as any;
            mockEvents.publish = jest.fn();
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockLocation.back = jest.fn();
            jest.spyOn(contentDetailsPage, 'popToPreviousPage').mockImplementation();
            jest.spyOn(contentDetailsPage, 'generateEndEvent').mockImplementation();
            contentDetailsPage.shouldGenerateEndTelemetry = false;
            jest.spyOn(contentDetailsPage, 'generateQRSessionEndEvent').mockImplementation();
            contentDetailsPage.handleDeviceBackButton();
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                PageId.CONTENT_DETAIL,
                Environment.HOME,
                false,
                undefined,
                [{ id: 'do-123', type: 'Content' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }],
                { l1: 'do_123', l2: 'do_123', l3: 'do_1' },
                { id: 'do_12345', type: '', version: '1' }
            );
        });
    });

    describe('share()', () => {
        describe('shouldn create share popover', () => {
            it('shareItemType should be root-content', (done) => {
                // arrange
                contentDetailsPage.content = { identifier: 'do_1234', contentData: { size: undefined } };
                mockCommonUtilService.translateMessage = jest.fn(() => '');
                mockPopoverController.create = jest.fn(() => (Promise.resolve({
                    present: jest.fn(() => Promise.resolve({})),
                    onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
                } as any)));
                // act
                contentDetailsPage.share().then(() => {
                    // assert
                    expect(mockPopoverController.create).toHaveBeenCalledTimes(1);
                    expect(mockPopoverController.create).toHaveBeenCalled();
                    done();
                });
            });
            it('shareItemType should be leaf-content', (done) => {
                // arrange
                contentDetailsPage.content = { identifier: 'do_1234', contentData: { size: '10.00KB' } };
                contentDetailsPage.isChildContent = true;
                mockCommonUtilService.translateMessage = jest.fn(() => '');
                mockPopoverController.create = jest.fn(() => (Promise.resolve({
                    present: jest.fn(() => Promise.resolve({})),
                    onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
                } as any)));
                // act
                contentDetailsPage.share().then(() => {
                    // assert
                    expect(mockPopoverController.create).toHaveBeenCalledTimes(1);
                    expect(mockPopoverController.create).toHaveBeenCalledWith(expect.objectContaining({
                        componentProps: expect.objectContaining({
                            shareItemType: ShareItemType.LEAF_CONTENT
                        })
                    }));
                    done();
                });
            });
        });
    });

    describe('ngOnDestroy()', () => {
        it('should unsubscribe events', () => {
            // arrange
            mockEvents.unsubscribe = jest.fn();
            mockEventBusService.events = jest.fn(() => of({
                unsubscribe: jest.fn()
            }))as any;
            contentDetailsPage['contentProgressSubscription'] = { unsubscribe: jest.fn() } as any;
            // act
            contentDetailsPage.ngOnDestroy();
            // assert
            expect(mockEvents.unsubscribe).toBeCalledTimes(3);
        });
    });

    describe('getContentState', () => {
        it('should not show course complete popup', (done) => {
            // arrange
            mockAppGlobalService.showCourseCompletePopup = false;
            mockAppGlobalService.getUserId = jest.fn(() => 'userid');
            const contenxt = '{"userId":"userid","courseId":"courseid","batchId":"batchid","isCertified":false,"leafNodeIds":["id1","id2"],"batchStatus":1}';
            mockPreferences.getString = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.CONTENT_CONTEXT:
                        return of(contenxt);
                }
            });
            mockLocalCourseService.getCourseProgress = jest.fn(() => Promise.resolve(10));
            mockLocalCourseService.fetchAssessmentStatus = jest.fn(() => ({ isLastAttempt: false, isContentDisabled: false }))
            // act
            contentDetailsPage.getContentState();
            // assert
            setTimeout(() => {
                expect(mockLocalCourseService.fetchAssessmentStatus).toHaveBeenCalled();
                expect(mockAppGlobalService.showCourseCompletePopup).toBeTruthy();
                done();
            });
        });
        it('should show course complete popup', (done) => {
            // arrange
            mockAppGlobalService.showCourseCompletePopup = true;
            mockAppGlobalService.getUserId = jest.fn(() => 'userid');
            const context = '{"userId":"userid","courseId":"courseid","batchId":"batchid","isCertified":false,"leafNodeIds":["id1"],"batchStatus":2}'
            mockPreferences.getString = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.CONTENT_CONTEXT:
                        return of(context);
                }
            })as any;
            // mockAppGlobalService.identifier = 'do_id';
            const contentStatusData = {
                contentList: [
                    {
                        contentId: 'do_id',
                        bestScore: {},
                        score:[{}]
                    }
                ]
            }
            mockLocalCourseService.fetchAssessmentStatus = jest.fn(() => ({ isLastAttempt: false, isContentDisabled: false }))
            mockLocalCourseService.getCourseProgress = jest.fn(() => Promise.resolve({ progress: 100, contentStatusData: contentStatusData }));
            // act
            contentDetailsPage.getContentState();
            // assert
            setTimeout(() => {
                expect(mockLocalCourseService.fetchAssessmentStatus).toHaveBeenCalled();
                expect(mockAppGlobalService.showCourseCompletePopup).toBeFalsy();
                expect(contentDetailsPage.showCourseCompletePopup).toBeTruthy();
                done();
            });
        });

        it('should show course complete popup, make isLastAttempt as true', (done) => {
            // arrange
            mockAppGlobalService.showCourseCompletePopup = true;
            mockAppGlobalService.getUserId = jest.fn(() => 'userid');
            const context = '{"userId":"userid","courseId":"courseid","batchId":"batchid","isCertified":false,"leafNodeIds":["id1"],"batchStatus":2}'
            mockPreferences.getString = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.CONTENT_CONTEXT:
                        return of(context);
                }
            })as any;
            // mockAppGlobalService.identifier = 'do_id';
            const contentStatusData = {
                contentList: [
                    {
                        contentId: 'do_id',
                        bestScore: {},
                        score:[{}, {}]
                    }
                ]
            }
            mockLocalCourseService.fetchAssessmentStatus = jest.fn(() => ({ isLastAttempt: false, isContentDisabled: false }))
            mockLocalCourseService.getCourseProgress = jest.fn(() => Promise.resolve({progress: 100, contentStatusData: contentStatusData}));
            // act
            contentDetailsPage.getContentState();
            // assert
            setTimeout(() => {
                expect(mockLocalCourseService.fetchAssessmentStatus).toHaveBeenCalled();
                expect(mockAppGlobalService.showCourseCompletePopup).toBeFalsy();
                expect(contentDetailsPage.showCourseCompletePopup).toBeTruthy();
                done();
            });
        });

        it('should show course complete popup, make isContentDisabled as true', (done) => {
            // arrange
            mockAppGlobalService.showCourseCompletePopup = true;
            mockAppGlobalService.getUserId = jest.fn(() => 'userid');
            const context = '{"userId":"userid","courseId":"courseid","batchId":"batchid","isCertified":false,"leafNodeIds":["id1"],"batchStatus":2}'
            mockPreferences.getString = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.CONTENT_CONTEXT:
                        return of(context);
                }
            })as any;
            // mockAppGlobalService.identifier = 'do_id';
            const contentStatusData = {
                contentList: [
                    {
                        contentId: 'do_id',
                        bestScore: {},
                        score:[{}, {}, {}]
                    }
                ]
            }
            mockLocalCourseService.fetchAssessmentStatus = jest.fn(() => ({ isLastAttempt: false, isContentDisabled: false }))
            mockLocalCourseService.getCourseProgress = jest.fn(() => Promise.resolve({progress: 100, contentStatusData: contentStatusData}));
            // act
            contentDetailsPage.getContentState();
            // assert
            setTimeout(() => {
                expect(mockLocalCourseService.fetchAssessmentStatus).toHaveBeenCalled();
                expect(mockAppGlobalService.showCourseCompletePopup).toBeFalsy();
                expect(contentDetailsPage.showCourseCompletePopup).toBeTruthy();
                done();
            });
        });
    });

    it('should generate ImpressionEvent', () => {
        contentDetailsPage.downloadAndPlay = true;
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
        contentDetailsPage.generateImpressionEvent('download');
        // assert
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenNthCalledWith(1,
            InteractType.DOWNLOAD_COMPLETE,
            InteractType.DOWNLOAD_COMPLETE,
            PageId.QR_CONTENT_RESULT,
            Environment.HOME,
            undefined,
            undefined, undefined, undefined,
            [{ id: 'do-123', type: 'Content' }, { id: 'content-detail', type: 'ChildUi' }, {
                id: PageId.CONTENT_DETAIL,
                type: 'ChildUi'
            }]
        );
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenNthCalledWith(2,
            ImpressionType.DETAIL, '',
            PageId.CONTENT_DETAIL,
            Environment.HOME,
            undefined, undefined, undefined, { l1: 'do_123', l2: 'do_123', l3: 'do_1' },
            [{ id: 'do-123', type: 'Content' },
            { id: 'content-detail', type: 'ChildUi' }, {
                id: PageId.CONTENT_DETAIL,
                type: 'ChildUi'
            }]
        );
        expect(mockTelemetryGeneratorService.generatePageLoadedTelemetry).toHaveBeenCalledWith(
            PageId.CONTENT_DETAIL,
            Environment.HOME,
            undefined,
            undefined,
            undefined,
            undefined,
            [{ id: 'do-123', type: 'Content' }, { id: 'content-detail', type: 'ChildUi' }, {
                id: PageId.CONTENT_DETAIL,
                type: 'ChildUi'
            }]
        );
    });

    describe('subscribeSdkEvent', () => {
        it('should return progress of 100 for progress', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'PROGRESS',
                payload: {
                    identifier: 'do-123',
                    progress: 100
                }
            }));
            mockNgZone.run = jest.fn((fn) => fn());
            contentDetailsPage.content = {
                identifier: 'do-123'
            };
            contentDetailsPage.downloadProgress = 100;
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should should return progress of nan for progress', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'PROGRESS',
                payload: {
                    identifier: 'do-123',
                    progress: {}
                }
            }));
            mockNgZone.run = jest.fn((fn) => fn());
            contentDetailsPage.content = {
                identifier: 'do-123'
            };
            if (contentDetailsPage.downloadProgress === 100) {
                contentDetailsPage.downloadProgress = {};
            }
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should should return progress of nan for progress', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'PROGRESS',
                payload: {
                    identifier: 'do-123',
                    progress: 100
                }
            }));
            mockNgZone.run = jest.fn((fn) => fn());
            contentDetailsPage.content = {
                identifier: 'do-1234'
            };
            contentDetailsPage.downloadProgress = 'complete';
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return message for IMPORT_COMPLETED', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'IMPORT_COMPLETED'
            }));
            mockNgZone.run = jest.fn((fn) => fn());
            contentDetailsPage.content = {
                identifier: 'do-123'
            };
            contentDetailsPage.isDownloadStarted = true;
            jest.spyOn(contentDetailsPage, 'generateImpressionEvent').mockImplementation();
            jest.spyOn(contentDetailsPage, 'setContentDetails').mockImplementation(() => {
                return Promise.resolve();
            });
            mockEvents.publish = jest.fn(() => []);
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                expect(mockEvents.publish).toHaveBeenCalledWith('savedResources:update', {
                    update: true
                });
                done();
            }, 0);
        });

        it('should failed for file IMPORT_COMPLETED', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'IMPORT_COMPLETED'
            }));
            mockNgZone.run = jest.fn((fn) => fn());
            contentDetailsPage.content = {
                identifier: 'do-123'
            };
            contentDetailsPage.isDownloadStarted = false;
            jest.spyOn(contentDetailsPage, 'generateImpressionEvent').mockImplementation();
            jest.spyOn(contentDetailsPage, 'setContentDetails').mockImplementation(() => {
                return Promise.resolve();
            });
            mockEvents.publish = jest.fn(() => []);
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should update', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'UPDATE',
                payload: {
                    size: '64kb'
                }
            }));
            mockNgZone.run = jest.fn((fn) => fn());
            contentDetailsPage.content = {
                identifier: 'do-123',
                contentData: {
                    size: '10kb'
                }
            };
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not update for error part', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'UPDATE',
                payload: {
                    size: undefined
                }
            }));
            mockNgZone.run = jest.fn((fn) => fn());
            contentDetailsPage.content = {
                identifier: 'do-123',
                contentData: {
                    size: '10kb'
                }
            };
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return streamingUrl for SERVER_CONTENT_DATA', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'SERVER_CONTENT_DATA',
                payload: {
                    contentId: 'do-123',
                    streamingUrl: 'streamingUrl',
                    licenseDetails: {
                        description: 'descript',
                        name: 'sample-name',
                        url: 'sample-url'
                    }
                }
            }));
            mockNgZone.run = jest.fn((fn) => fn());
            contentDetailsPage.content = {
                identifier: 'do-123',
                mimeType: 'sample-mimeType',
                contentData: {
                    size: '10kb'
                }
            };
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return streamingUrl for SERVER_CONTENT_DATA if mimeType is matched', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'SERVER_CONTENT_DATA',
                payload: {
                    contentId: 'do-123',
                    streamingUrl: 'streamingUrl',
                    licenseDetails: undefined
                }
            }));
            mockNgZone.run = jest.fn((fn) => fn());
            contentDetailsPage.content = {
                identifier: 'do-123',
                mimeType: 'application/vnd.ekstep.h5p-archive',
                contentData: {
                    size: '10kb'
                }
            };
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return streamingUrl for SERVER_CONTENT_DATA if identifier is not matched', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'SERVER_CONTENT_DATA',
                payload: {
                    contentId: 'do-123',
                    streamingUrl: 'streamingUrl',
                    licenseDetails: {
                        description: 'descript',
                        name: 'sample-name',
                        url: 'sample-url'
                    }
                }
            }));
            mockNgZone.run = jest.fn((fn) => fn())as any;
            contentDetailsPage.content = {
                identifier: 'do-1234',
                mimeType: 'application/vnd.ekstep.h5p-archive',
                contentData: {
                    size: '10kb'
                }
            };
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return undefined if event type is not matched', (done) => {
            mockEventBusService.events = jest.fn(() => of({
                type: 'SERVER_CONTENT',
                payload: {
                    contentId: 'do-123',
                    streamingUrl: 'streamingUrl',
                    licenseDetails: {
                        description: 'descript',
                        name: 'sample-name',
                        url: 'sample-url'
                    }
                }
            }));
            mockNgZone.run = jest.fn((fn) => fn())as any;
            contentDetailsPage.content = {
                identifier: 'do-1234',
                mimeType: 'application/vnd.ekstep.h5p-archive',
                contentData: {
                    size: '10kb'
                }
            };
            // act
            contentDetailsPage.subscribeSdkEvent();
            // assert
            setTimeout(() => {
                expect(mockEventBusService.events).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('ionViewWillEnter()', () => {
        it('should unsubscribe events', (done) => {
            // arrange
            contentDetailsPage.isResumedCourse = true;
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            mockContentPlayerHandler.isContentPlayerLaunched = jest.fn(() => false);
            contentDetailsPage.isUsrGrpAlrtOpen = true;
            contentDetailsPage.shouldOpenPlayAsPopup = true;
            jest.spyOn(contentDetailsPage, 'isPlayedFromCourse').mockImplementation();
            jest.spyOn(contentDetailsPage, 'getContentState').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(contentDetailsPage, 'setContentDetails').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(contentDetailsPage, 'subscribeSdkEvent').mockImplementation();
            jest.spyOn(contentDetailsPage, 'findHierarchyOfContent').mockImplementation();
            jest.spyOn(contentDetailsPage, 'handleDeviceBackButton').mockImplementation();
            mockContentPlayerHandler.getLastPlayedContentId = jest.fn(() => 'sample-last-content-id') as any;
            mockHeaderService.hideStatusBar = jest.fn();
            // act
            contentDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(contentDetailsPage.isResumedCourse).toBeTruthy();
                expect(mockContentPlayerHandler.isContentPlayerLaunched).toHaveBeenCalled();
                expect(contentDetailsPage.isUsrGrpAlrtOpen).toBeFalsy();
                expect(mockHeaderService.hideStatusBar).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should unsubscribe events for else part of isUsrGrpAlrtOpen', (done) => {
            // arrange
            contentDetailsPage.isResumedCourse = true;
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            mockContentPlayerHandler.isContentPlayerLaunched = jest.fn(() => false);
            contentDetailsPage.isUsrGrpAlrtOpen = false;
            contentDetailsPage.shouldOpenPlayAsPopup = false;
            jest.spyOn(contentDetailsPage, 'isPlayedFromCourse').mockImplementation();
            jest.spyOn(contentDetailsPage, 'setContentDetails').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(contentDetailsPage, 'subscribeSdkEvent').mockImplementation();
            jest.spyOn(contentDetailsPage, 'findHierarchyOfContent').mockImplementation();
            jest.spyOn(contentDetailsPage, 'handleDeviceBackButton').mockImplementation();
            mockContentPlayerHandler.getLastPlayedContentId = jest.fn(() => 'sample-last-content-id');
            mockHeaderService.hideStatusBar = jest.fn();
            // act
            contentDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(contentDetailsPage.isResumedCourse).toBeTruthy();
                expect(mockContentPlayerHandler.isContentPlayerLaunched).toHaveBeenCalled();
                expect(contentDetailsPage.isUsrGrpAlrtOpen).toBeFalsy();
                expect(mockHeaderService.hideStatusBar).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should unsubscribe events for else part of isUsrGrpAlrtOpen', (done) => {
            // arrange
            contentDetailsPage.isResumedCourse = true;
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            mockContentPlayerHandler.isContentPlayerLaunched = jest.fn(() => true);
            contentDetailsPage.shouldOpenPlayAsPopup = false;
            jest.spyOn(contentDetailsPage, 'generateTelemetry').mockImplementation();
            jest.spyOn(contentDetailsPage, 'isPlayedFromCourse').mockImplementation();
            jest.spyOn(contentDetailsPage, 'setContentDetails').mockImplementation(() => {
                return Promise.resolve();
            });
            jest.spyOn(contentDetailsPage, 'subscribeSdkEvent').mockImplementation();
            jest.spyOn(contentDetailsPage, 'findHierarchyOfContent').mockImplementation();
            jest.spyOn(contentDetailsPage, 'handleDeviceBackButton').mockImplementation();
            mockContentPlayerHandler.getLastPlayedContentId = jest.fn(() => 'sample-last-content-id');
            // act
            contentDetailsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(contentDetailsPage.isResumedCourse).toBeTruthy();
                expect(mockContentPlayerHandler.isContentPlayerLaunched).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('ionViewWillLeave()', () => {
        it('should unsubscribe', () => {
            // arrange
            const unsubscribe = jest.fn();
            contentDetailsPage['eventSubscription'] = {
                unsubscribe
            };
            contentDetailsPage.contentDeleteObservable = {
                unsubscribe
            };
            contentDetailsPage.backButtonFunc = {
                unsubscribe
            };
            // act
            contentDetailsPage.ionViewWillLeave();
            // assert
            expect(unsubscribe).toBeCalledTimes(3);
        });

        it('should unsubscribe for else part', () => {
            // arrange
            contentDetailsPage['eventSubscription'] = undefined as any;
            contentDetailsPage.contentDeleteObservable = undefined;
            contentDetailsPage.backButtonFunc = undefined as any;
            // act
            contentDetailsPage.ionViewWillLeave();
            // assert
        });
    });

    describe('handleNavBackButton', () => {
        it('should handle nav backbutton by invoked handleNavBackButton', () => {
            // arrange
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            contentDetailsPage.shouldGenerateEndTelemetry = true;
            jest.spyOn(contentDetailsPage, 'generateEndEvent').mockReturnValue();
            jest.spyOn(contentDetailsPage, 'popToPreviousPage').mockReturnValue();
            jest.spyOn(contentDetailsPage, 'generateQRSessionEndEvent').mockImplementation();
            // act
            contentDetailsPage.handleNavBackButton();
            // assert
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                PageId.CONTENT_DETAIL,
                Environment.HOME,
                true,
                undefined,
                [{ id: 'do-123', type: 'Content' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' },
                { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }],
                { l1: 'do_123', l2: 'do_123', l3: 'do_1' },
                { id: 'do_12345', type: '', version: '1' }
            );
        });

        it('should generate shouldGenerateEndTelemetry by invoked handleNavBackButton', () => {
            // arrange
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            jest.spyOn(contentDetailsPage, 'generateEndEvent').mockReturnValue();
            contentDetailsPage.shouldGenerateEndTelemetry = false;
            jest.spyOn(contentDetailsPage, 'popToPreviousPage').mockReturnValue();
            // act
            contentDetailsPage.handleNavBackButton();
            // assert
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                PageId.CONTENT_DETAIL,
                Environment.HOME,
                true,
                undefined,
                [{ id: 'do-123', type: 'Content' }, { id: PageId.CONTENT_DETAIL, type: 'ChildUi' },
                { id: PageId.CONTENT_DETAIL, type: 'ChildUi' }],
                { l1: 'do_123', l2: 'do_123', l3: 'do_1' },
                { id: 'do_12345', type: '', version: '1' }
            );
        });
    });

    it('should subscribe play content', () => {
        mockEvents.subscribe = jest.fn((_, fn) => {
            fn({ selectedUser: 'user-1', streaming: true });
        });
        mockAppGlobalService.setSelectedUser = jest.fn();
        const presentf = jest.fn(() => Promise.resolve());
        mockPopoverController.create = jest.fn(() => Promise.resolve({
            present: presentf
        }) as any);
        contentDetailsPage.subscribePlayEvent();
        expect(mockAppGlobalService.setSelectedUser).toHaveBeenCalledWith('user-1');
    });

    describe('calculateAvailableUserCount', () => {
        it('should be calaulate all available users', () => {
            // arrange
            mockProfileService.getAllProfiles = jest.fn();
            // act
            // assert
        });
    });

    describe('showDeletePopup', () => {
        it('should delete a content if content size is not available', () => {
            // arrange
            contentDetailsPage.content = { contentData: { size: undefined } };
            mockContentDeleteHandler.showContentDeletePopup = jest.fn();
            // act
            contentDetailsPage.showDeletePopup();
            // assert
            expect(mockContentDeleteHandler.showContentDeletePopup).toHaveBeenCalled();
        });
    });

    it('should delete a content if content size available', () => {
        // arrange
        contentDetailsPage.content = { contentData: { size: '10KB' } };
        mockContentDeleteHandler.showContentDeletePopup = jest.fn();
        // act
        contentDetailsPage.showDeletePopup();
        // assert
        expect(mockContentDeleteHandler.showContentDeletePopup).toHaveBeenCalled();
    });

    describe('openConfirmPopUp', () => {
        it('should return content not downloaded for undefined downloadUrl with no internet message', (done) => {
            mockCommonUtilService.networkInfo = {isNetworkAvailable: false}
            contentDetailsPage.content = { contentData: { name: 'matrix', size: 101100 , downloadUrl: ''} };
            mockCommonUtilService.showToast = jest.fn();
            mockFileSizePipe.transform = jest.fn(() => '');
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
            } as any)));
            // act
            contentDetailsPage.openConfirmPopUp();
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('DOWNLOAD_NOT_ALLOWED_FOR_QUIZ');
                done();
            }, 0);
        });

        it('should open a content download popup for dismiss data', (done) => {
            // arrange
            contentDetailsPage.limitedShareContentFlag = false;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            contentDetailsPage.content = { contentData: { name: 'matrix', size: 101100 , downloadUrl: 'sample-url'} };
            mockFileSizePipe.transform = jest.fn(() => '10KB');
            const presentFN = jest.fn(() => Promise.resolve({}));
            const onDismissFN = jest.fn(() => Promise.resolve({ data: { canDelete: true } }));
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: presentFN,
                onDidDismiss: onDismissFN
            } as any)));
            jest.spyOn(contentDetailsPage, 'downloadContent').mockReturnValue();
            // act
            contentDetailsPage.openConfirmPopUp();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
                expect(mockFileSizePipe.transform).toHaveBeenLastCalledWith(101100, 2);
                expect(mockPopoverController.create).toHaveBeenCalledTimes(1);
                done();
            }, 0);
        });

        it('should open a content download popup for dismiss data is undefined', (done) => {
            // arrange
            contentDetailsPage.limitedShareContentFlag = false;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            contentDetailsPage.content = { contentData: { name: 'matrix', size: 101100, downloadUrl: 'sample-url' } };
            mockFileSizePipe.transform = jest.fn(() => '10KB');
            const presentFN = jest.fn(() => Promise.resolve({}));
            const onDismissFN = jest.fn(() => Promise.resolve({ undefined }));
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: presentFN,
                onDidDismiss: onDismissFN
            } as any)));
            jest.spyOn(contentDetailsPage, 'downloadContent').mockReturnValue();
            // act
            contentDetailsPage.openConfirmPopUp();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
                expect(mockFileSizePipe.transform).toHaveBeenLastCalledWith(101100, 2);
                expect(mockPopoverController.create).toHaveBeenCalledTimes(1);
                expect(presentFN).toHaveBeenCalled();
                expect(onDismissFN).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not open a content download popup for offline ', (done) => {
            // arrange
            contentDetailsPage.limitedShareContentFlag = false;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            contentDetailsPage.content = { contentData: { name: 'matrix', size: 101100 } };
            // act
            contentDetailsPage.openConfirmPopUp();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeFalsy();
                done();
            }, 0);
        });

        it('should open a content download popup for download not allow ', (done) => {
            // arrange
            contentDetailsPage.limitedShareContentFlag = true;
            mockCommonUtilService.showToast = jest.fn();
            // act
            contentDetailsPage.openConfirmPopUp();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('DOWNLOAD_NOT_ALLOWED_FOR_QUIZ');
                done();
            }, 0);
        });
    });

    describe('calculateAvailableUserCount', () => {
        it('should calculate loggedin user', (done) => {
            // arrange
            const profileRequest: GetAllProfileRequest = {
                local: true,
                server: false
            };
            mockProfileService.getAllProfiles = jest.fn(() => of([{
                uid: 'SAMPLE_UID',
                handle: 'SAMPLE_HANDLE',
                profileType: 'student',
                source: 'local'
            }]));
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            // act
            contentDetailsPage.calculateAvailableUserCount();
            // assert
            setTimeout(() => {
                expect(mockProfileService.getAllProfiles).toHaveBeenCalledWith(profileRequest);
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(contentDetailsPage.userCount).toBe(2);
                done();
            }, 0);
        });

        it('should not increment users count for no active user', (done) => {
            // arrange
            const profileRequest: GetAllProfileRequest = {
                local: true,
                server: false
            };
            mockProfileService.getAllProfiles = jest.fn(() => of([]));
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            // act
            contentDetailsPage.calculateAvailableUserCount();
            // assert
            setTimeout(() => {
                expect(mockProfileService.getAllProfiles).toHaveBeenCalledWith(profileRequest);
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(contentDetailsPage.userCount).toBe(0);
                done();
            }, 0);
        });

        it('should not calculate loggedin user for catch part', (done) => {
            // arrange
            const profileRequest: GetAllProfileRequest = {
                local: true,
                server: false
            };
            mockProfileService.getAllProfiles = jest.fn(() => throwError({ error: 'server-error' }));
            // act
            contentDetailsPage.calculateAvailableUserCount();
            // assert
            setTimeout(() => {
                expect(mockProfileService.getAllProfiles).toHaveBeenCalledWith(profileRequest);
                expect(contentDetailsPage.userCount).toBe(0);
                done();
            }, 0);
        });
    });

    it('should return rateing for content', () => {
        // arrange
        const popUpType = 'rating';
        mockRatingHandler.showRatingPopup = jest.fn(() => Promise.resolve({}));
        // act
        contentDetailsPage.rateContent(popUpType);
        // assert
        expect(mockRatingHandler.showRatingPopup).toHaveBeenCalledWith(
            true,
            { contentData: { name: 'matrix', size: 101100 } },
            'rating',
            [{ id: 'do-123', type: 'Content' }, {
                id: PageId.CONTENT_DETAIL,
                type: 'ChildUi'
            }, {
                id: PageId.CONTENT_DETAIL,
                type: 'ChildUi'
            }],
            { l1: 'do_123', l2: 'do_123', l3: 'do_1' }
        );
    });

    describe('getNavParams', () => {
        it('should check the active download list', (done) => {
            // arrange
            contentDetailsPage.content = {
                content: {
                    contentData: {},
                    identifier: 'sample_id1'
                },
                contentData: {},
                identifier: 'sample_id1'
            };
            const resp = [{ identifier: 'sample_id1' }, { identifier: 'sample_id2' }];
            mockDownloadService.getActiveDownloadRequests = jest.fn(() => of(resp)) as any;
            // act
            contentDetailsPage.getNavParams();
            // assert
            setTimeout(() => {
                expect(mockDownloadService.getActiveDownloadRequests).toHaveBeenCalled();
                contentDetailsPage.isContentDownloading$.subscribe((res) => {
                    expect(res).toBeTruthy();
                    done();
                });
            }, 0);
        });
    });

    it('should hide deeplink progress loader', () => {
        // arrange
        contentDetailsPage.identifier = 'sample_doId';
        mockSbProgressLoader.hide = jest.fn();
        // act
        contentDetailsPage.ionViewDidEnter();
        // assert
        setTimeout(() => {
        }, 0);
        expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({ id: 'login' });
    });

    describe('cancelDownload', () => {
        it('should generate telemetry for cancel download', (done) => {
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockContentService.cancelDownload = jest.fn(() => of(undefined));
            mockNgZone.run = jest.fn((fn) => fn());
            mockTelemetryGeneratorService.generateContentCancelClickedTelemetry = jest.fn();
            contentDetailsPage.isUpdateAvail = false;
            // act
            contentDetailsPage.cancelDownload();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.SELECT_CLOSE,
                    InteractSubtype.CANCEL,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    { id: 'sample_id1', type: 'Content', version: '' }, undefined, undefined,
                    [{ id: 'download-popup', type: 'ChildUi' }]
                );
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.TOUCH,
                    InteractSubtype.DOWNLOAD_CANCEL_CLICKED,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    { id: 'do_12345', type: '', version: '1' },
                    undefined, { l1: 'do_123', l2: 'do_123', l3: 'do_1' }, undefined
                );
                expect(mockNgZone.run).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateContentCancelClickedTelemetry).toHaveBeenCalled();
                expect(contentDetailsPage.isDownloadStarted).toBeFalsy();
                expect(contentDetailsPage.showDownload).toBeFalsy();
                done();
            }, 0);
        });

        it('should generate telemetry for update available', (done) => {
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockContentService.cancelDownload = jest.fn(() => of(undefined));
            mockNgZone.run = jest.fn((fn) => fn());
            mockTelemetryGeneratorService.generateContentCancelClickedTelemetry = jest.fn();
            contentDetailsPage.isUpdateAvail = true;
            // act
            contentDetailsPage.cancelDownload();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.SELECT_CLOSE,
                    InteractSubtype.CANCEL,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    { id: 'sample_id1', type: 'Content', version: '' }, undefined, undefined,
                    [{ id: 'download-popup', type: 'ChildUi' }]
                );
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.TOUCH,
                    InteractSubtype.DOWNLOAD_CANCEL_CLICKED,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    { id: 'do_12345', type: '', version: '1' },
                    undefined, { l1: 'do_123', l2: 'do_123', l3: 'do_1' }, undefined
                );
                expect(mockNgZone.run).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateContentCancelClickedTelemetry).toHaveBeenCalled();
                expect(contentDetailsPage.isDownloadStarted).toBeFalsy();
                expect(contentDetailsPage.showDownload).toBeFalsy();
                done();
            }, 0);
        });

        it('should generate telemetry for cancel download for catch part', (done) => {
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockContentService.cancelDownload = jest.fn(() => throwError({ error: 'error' }));
            mockNgZone.run = jest.fn((fn) => fn());
            // act
            contentDetailsPage.cancelDownload();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                    InteractType.SELECT_CLOSE,
                    InteractSubtype.CANCEL,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    { id: 'sample_id1', type: 'Content', version: '' }, undefined, undefined,
                    [{ id: 'download-popup', type: 'ChildUi' }]
                );
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                    InteractType.TOUCH,
                    InteractSubtype.DOWNLOAD_CANCEL_CLICKED,
                    Environment.HOME,
                    PageId.CONTENT_DETAIL,
                    { id: 'do_12345', type: '', version: '1' },
                    undefined, { l1: 'do_123', l2: 'do_123', l3: 'do_1' }, undefined
                );
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('handleContentPlay', () => {
        it('should return null if content is undefined', (done) => {
            contentDetailsPage.limitedShareContentFlag = true;
            contentDetailsPage.content = {
                contentData: undefined
            };
            mockCommonUtilService.handleAssessmentStatus =
                jest.fn(() => Promise.resolve({ isLastAttempt: false, limitExceeded: false, isCloseButtonClicked: false }));
            contentDetailsPage.handleContentPlay('');
            setTimeout(() => {
                expect(contentDetailsPage.limitedShareContentFlag).toBeTruthy();
                expect(mockCommonUtilService.handleAssessmentStatus).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should invoked promotToLogIn page', (done) => {
            // arrange
            contentDetailsPage.limitedShareContentFlag = true;
            contentDetailsPage.content = {
                contentData: {
                    streamingUrl: 'streamingUrl'
                }
            };
            mockCommonUtilService.handleAssessmentStatus =
                jest.fn(() => Promise.resolve({ isLastAttempt: false, limitExceeded: true, isCloseButtonClicked: true }));
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            jest.spyOn(contentDetailsPage, 'showSwitchUserAlert').mockImplementation();
            // act
            contentDetailsPage.handleContentPlay('');
            // assert
            setTimeout(() => {
                expect(contentDetailsPage.limitedShareContentFlag).toBeTruthy();
                expect(mockCommonUtilService.handleAssessmentStatus).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should invoked showSwitchUserAlert page', (done) => {
            contentDetailsPage.limitedShareContentFlag = false;
            jest.spyOn(contentDetailsPage, 'showSwitchUserAlert').mockImplementation();
            mockCommonUtilService.handleAssessmentStatus =
                jest.fn(() => Promise.resolve({ isLastAttempt: false, limitExceeded: true, isCloseButtonClicked: true }));
            contentDetailsPage.handleContentPlay('');
            setTimeout(() => {
                expect(contentDetailsPage.limitedShareContentFlag).toBeFalsy();
                expect(mockCommonUtilService.handleAssessmentStatus).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should show a toast message with User has exceeded the number of atempts', (done) => {
            // arrange
            contentDetailsPage['isContentDisabled'] = true;
            mockCommonUtilService.handleAssessmentStatus =
                jest.fn(() => Promise.resolve({ isLastAttempt: false, limitExceeded: true, isCloseButtonClicked: true }));
            // act
            contentDetailsPage.handleContentPlay('');
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.handleAssessmentStatus).toHaveBeenCalled();
                done();
            }, 0);
        });
    });


    describe('promptToLogin', () => {
        it('should be logged in before play the content by invoked promptToLogin() if user loggedin', (done) => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            jest.spyOn(contentDetailsPage, 'handleContentPlay').mockImplementation()
            // act
            contentDetailsPage.promptToLogin();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                done();
            }, 1000);
        });

        it('should be logged in before play the content for isLoginPromptOpen() if user is not loggedin, and network available', (done) => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            contentDetailsPage.telemetryObject = { id: 'sample-id' };
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true, btn: {isInternetNeededMessage: 'network'} } }))
            } as any)));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            mockCommonUtilService.showToast = jest.fn()
            // act
            contentDetailsPage.promptToLogin();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should be logged in before play the content for isLoginPromptOpen() if user is not loggedin, on dismiss can delete is false or empty string', (done) => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            contentDetailsPage.telemetryObject = { id: 'sample-id' };
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: false} }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'you must login');
            // act
            contentDetailsPage.promptToLogin();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should be logged in before play the content for isLoginPromptOpen() if user is not loggedin, can delete true on dismiss', (done) => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            contentDetailsPage.telemetryObject = { id: 'sample-id' };
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true, btn: '' } }))
            } as any)));
            mockCommonUtilService.translateMessage = jest.fn(() => 'you must login');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockRouter.navigate = jest.fn();
            // act
            contentDetailsPage.promptToLogin();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW,
                    '', PageId.SIGNIN_POPUP,
                    Environment.HOME,
                    'sample-id', undefined, undefined,
                    { l1: 'do_123', l2: 'do_123', l3: 'do_1' }, undefined
                );
                expect(mockPopoverController.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'YOU_MUST_LOGIN_TO_ACCESS_QUIZ_CONTENT');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'QUIZ_CONTENTS_ONLY_REGISTERED_USERS');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'OVERLAY_SIGN_IN');
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.LOGIN_CLICKED,
                    Environment.HOME,
                    PageId.SIGNIN_POPUP,
                    { id: 'sample-id' }, undefined,
                    { l1: 'do_123', l2: 'do_123', l3: 'do_1' }, undefined
                );
                expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.SIGN_IN], {state: {navigateToCourse: true}});
                done();
            }, 0);
        });

        it('should be logged in before play the content for isLoginPromptOpen() if user is not loggedin', (done) => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            contentDetailsPage.telemetryObject = { id: 'sample-id' };
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true, btn: {isInternetNeededMessage: 'network'} } }))
            } as any)));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            }
            mockCommonUtilService.showToast = jest.fn()
            mockCommonUtilService.translateMessage = jest.fn(() => 'you must login');
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            contentDetailsPage.promptToLogin();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    ImpressionType.VIEW,
                    '', PageId.SIGNIN_POPUP,
                    Environment.HOME,
                    'sample-id', undefined, undefined,
                    { l1: 'do_123', l2: 'do_123', l3: 'do_1' }, undefined
                );
                expect(mockPopoverController.create).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'YOU_MUST_LOGIN_TO_ACCESS_QUIZ_CONTENT');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'QUIZ_CONTENTS_ONLY_REGISTERED_USERS');
                expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(3, 'OVERLAY_SIGN_IN');
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.LOGIN_CLICKED,
                    Environment.HOME,
                    PageId.SIGNIN_POPUP,
                    { id: 'sample-id' }, undefined,
                    { l1: 'do_123', l2: 'do_123', l3: 'do_1' }, undefined
                );
                done();
            }, 0);
        });
    });

    describe('checkLimitedContentSharingFlag', () => {
        it('should check limitedShareContentFlag', () => {
            // arrange
            const request = {
                contentData: {
                    status: ContentFilterConfig.CONTENT_STATUS_UNLISTED
                },
                contentId: 'sample-content-id'
            };
            // contentDetailsPage.limitedShareContentFlag = true;
            jest.spyOn(contentDetailsPage, 'promptToLogin').mockImplementation(() => {
                return Promise.resolve(false);
            });
            // act
            contentDetailsPage.checkLimitedContentSharingFlag(request);
            // assert
            expect(contentDetailsPage.limitedShareContentFlag).toBeFalsy();
            expect(contentDetailsPage.content).not.toBeUndefined();
            expect(contentDetailsPage.playingContent).not.toBeUndefined();
            expect(contentDetailsPage.identifier).toBe('sample_doId');
        });

        it('should check limitedShareContentFlag', () => {
            // arrange
            const request = {
                contentData: {
                    status: undefined
                }
            };
            // act
            contentDetailsPage.checkLimitedContentSharingFlag(request);
            // assert
            expect(contentDetailsPage.limitedShareContentFlag).toBeFalsy();
        });
    });

    describe('getImportContentRequestBody', () => {
        it('should return requestParams', () => {
            // arrange
            const identifiers = ['do-123', 'do-234'];
            const isChild = true;
            mockStorageService.getStorageDestinationDirectoryPath = jest.fn(() => 'c:/files');
            // act
            contentDetailsPage.getImportContentRequestBody(identifiers, isChild);
            // assert
            expect(mockStorageService.getStorageDestinationDirectoryPath).toHaveBeenCalled();
        });
    });

    describe('importContent', () => {
        it('should return a toast for content not available', (done) => {
            // arrange
            const identifiers = ['do-123', 'do-234'];
            const isChild = true;
            jest.spyOn(contentDetailsPage, 'getImportContentRequestBody').mockImplementation(() => {
                return [];
            });
            mockContentService.importContent = jest.fn(() => of([{ status: -1 }]));
            mockCommonUtilService.showToast = jest.fn();
            // act
            contentDetailsPage.importContent(identifiers, isChild);
            // assert
            setTimeout(() => {
                expect(mockContentService.importContent).toHaveBeenCalled();
                expect(contentDetailsPage.showDownload).toBeFalsy();
                expect(contentDetailsPage.isDownloadStarted).toBeFalsy();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_CONTENT_NOT_AVAILABLE');
                done();
            }, 0);
        });

        it('should not return a toast for status is not matched', (done) => {
            // arrange
            const identifiers = ['do-123', 'do-234'];
            const isChild = true;
            jest.spyOn(contentDetailsPage, 'getImportContentRequestBody').mockImplementation(() => {
                return [];
            });
            mockContentService.importContent = jest.fn(() => of([{ status: 2 }]));
            mockCommonUtilService.showToast = jest.fn();
            // act
            contentDetailsPage.importContent(identifiers, isChild);
            // assert
            setTimeout(() => {
                expect(mockContentService.importContent).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return a toast of somthing went wrong for catch part', (done) => {
            // arrange
            const identifiers = ['do-123', 'do-234'];
            const isChild = true;
            jest.spyOn(contentDetailsPage, 'getImportContentRequestBody').mockImplementation(() => {
                return [];
            });
            mockContentService.importContent = jest.fn(() => throwError({ error: 'error' }));
            contentDetailsPage.isDownloadStarted = true;
            contentDetailsPage.content = {
                identifier: 'id'
            };
            contentDetailsPage.contentDownloadable = {
                id: true
            };
            mockCommonUtilService.showToast = jest.fn();
            // act
            contentDetailsPage.importContent(identifiers, isChild);
            // assert
            setTimeout(() => {
                expect(mockContentService.importContent).toHaveBeenCalled();
                expect(contentDetailsPage.showDownload).toBeFalsy();
                expect(contentDetailsPage.isDownloadStarted).toBeFalsy();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SOMETHING_WENT_WRONG');
                done();
            }, 0);
        });

        it('should return a toast of somthing went wrong for catch part and download not started', (done) => {
            // arrange
            const identifiers = ['do-123', 'do-234'];
            const isChild = true;
            jest.spyOn(contentDetailsPage, 'getImportContentRequestBody').mockImplementation(() => {
                return [];
            });
            mockContentService.importContent = jest.fn(() => throwError({ error: 'error' }));
            contentDetailsPage.isDownloadStarted = false;
            contentDetailsPage.content = {
                identifier: 'id'
            };
            contentDetailsPage.contentDownloadable = {
                id: true
            };
            mockCommonUtilService.showToast = jest.fn();
            // act
            contentDetailsPage.importContent(identifiers, isChild);
            // assert
            setTimeout(() => {
                expect(mockContentService.importContent).toHaveBeenCalled();
                expect(contentDetailsPage.showDownload).toBeFalsy();
                expect(contentDetailsPage.isDownloadStarted).toBeFalsy();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SOMETHING_WENT_WRONG');
                done();
            }, 0);
        });
    });

    it('should open a Url In Browser', () => {
        mockCommonUtilService.openUrlInBrowser = jest.fn();
        contentDetailsPage.openinBrowser('sample-url');
        expect(mockCommonUtilService.openUrlInBrowser).toHaveBeenCalled();
    });

    describe('fetchCertificateDescription', () => {
        it('should return empty string if batchId is null', (done) => {
            // act
            contentDetailsPage.fetchCertificateDescription(null).then(res => {
                // assert
                done();
            });
        });

        it('should returncertificate message if batchId is present', (done) => {
            mockCourseService.getBatchDetails = jest.fn(() => of({
                cert_templates: { someKey: { description: 'some_description' } }
            })) as any;
            // act
            contentDetailsPage.fetchCertificateDescription('batch_id').then(res => {
                // assert
                expect(mockCourseService.getBatchDetails).toHaveBeenCalled();
                done();
            });
        });

        it('should return empty string if there is an error', (done) => {
            mockCourseService.getBatchDetails = jest.fn(() => throwError({error: 'some_error'})) as any;
            // act
            contentDetailsPage.fetchCertificateDescription('batch_id').then(res => {
                // assert
                expect(mockCourseService.getBatchDetails).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('openCourseCompletionPopup', () => {
        it('should not open the course completion popup if the course is not completed', (done) => {
            // arrange
            contentDetailsPage['playerEndEventTriggered'] = true;
            contentDetailsPage.showCourseCompletePopup = false;
            mockEventBusService.events = jest.fn(() => of({
                type: 'COURSE_STATE_UPDATE',
                payload: {
                    identifier: 'do-123',
                    progress: 100
                }
            }));
            jest.spyOn(contentDetailsPage, 'getContentState').mockImplementation();
            // act
            contentDetailsPage.openCourseCompletionPopup().then(res => {
                expect(contentDetailsPage.getContentState).toHaveBeenCalled();
                expect(mockEventBusService.events).toHaveBeenCalled();
                done();
            });
        });

        it('should open the course completion popup if the course is completed', (done) => {
            // arrange
            contentDetailsPage['playerEndEventTriggered'] = false;
            jest.spyOn(contentDetailsPage, 'getContentState').mockImplementation();
            contentDetailsPage.courseContext = '{"userId":"userid","courseId":' +
                '"courseid","batchId":"batchid","isCertified":true,"leafNodeIds":["id1","id2"],"batchStatus":1}';
            contentDetailsPage.showCourseCompletePopup = true;
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({})),
            } as any)));
            mockEventBusService.events = jest.fn(() => of({
                type: 'COURSE_STATE_UPDATE',
                payload: {
                    identifier: 'do-123',
                    progress: 100
                }
            }));

            contentDetailsPage.fetchCertificateDescription = jest.fn(() => Promise.resolve(''));

            // act
            contentDetailsPage.openCourseCompletionPopup().then(res => {
                expect(mockPopoverController.create).toHaveBeenCalled();
                expect(contentDetailsPage.fetchCertificateDescription).toHaveBeenCalled();
                done();
            });
        });
    });

    it('should get extras from content || navigation when getExtras() called', (done) => {
        // arrange
        // contentDetailsPage.content = mockContentData.extras.state;
        mockRouter.getCurrentNavigation = jest.fn(() => mockContentData);
      // jest.spyOn(contentDetailsPage, 'getNavParams');
        jest.spyOn(contentDetailsPage, 'checkLimitedContentSharingFlag').mockImplementation(() => {
            return {};
        });
        jest.spyOn(contentDetailsPage, 'getContentState').mockImplementation(() => {
            return Promise.resolve();
        });
        jest.spyOn(contentDetailsPage, 'setContentDetails').mockImplementation(() => {
            return Promise.resolve();
        });
        mockDownloadService.getActiveDownloadRequests = jest.fn(() => of([{identifier: 'sample-id'}]));
        // act
        contentDetailsPage.getNavParams();
        // assert
        setTimeout(() => {
           // expect(contentDetailsPage.getNavParams).toHaveBeenCalled();
            done();
        }, 0);
    });

    describe('subscribeEvents', () => {
        it('should invoke appVersion() and other subscription() when invoked', (done) => {
            // arrange
            mockAppVersion.getAppName = jest.fn(() => Promise.resolve('sunbird'));
            mockContentPlayerHandler.setLastPlayedContentId = jest.fn();
            const called:  { [topic: EventTopics]: boolean } = {};
            mockEvents.subscribe = jest.fn((topic, fn) => {
                if (called[topic]) {
                    return;
                }
                called[topic] = true;
                if (topic === EventTopics.DEEPLINK_CONTENT_PAGE_OPEN) {
                    fn({ content: {} });
                }
                if (topic === EventTopics.PLAYER_CLOSED) {
                    fn({ selectedUser: 'sampleUser' });
                }
                if (topic === EventTopics.NEXT_CONTENT) {
                    fn({ data: 'sample_data' });
                }
            });
            mockRatingHandler.resetRating = jest.fn();
            jest.spyOn(contentDetailsPage, 'checkLimitedContentSharingFlag').mockImplementation();
            mockRouter.getCurrentNavigation = jest.fn(() => mockContentData);
            mockProfileService.getActiveProfileSession = jest.fn(() =>
                of({ uid: 'sample_uid', sid: 'sample_session_id', createdTime: Date.now() }));
            mockProfileSwitchHandler.switchUser = jest.fn();
            jest.spyOn(contentDetailsPage, 'calculateAvailableUserCount').mockImplementation();
            jest.spyOn(contentDetailsPage, 'generateEndEvent').mockImplementation();
            jest.spyOn(contentDetailsPage, 'getNavParams').mockImplementation(() => {
                return Promise.resolve();
            });
            mockEvents.unsubscribe = jest.fn((topic) => {
                console.log(topic);
                called[topic] = false;
            });
            jest.spyOn(contentDetailsPage, 'generateTelemetry').mockImplementation();
            mockDownloadService.getActiveDownloadRequests = jest.fn(() => EMPTY);
            contentDetailsPage['course'] = {
                contentId: 'content_id'
            };
            mockEventBusService.events = jest.fn(() => of({
                payload: {
                    contentId: 'content_id'
                },
                type: ContentEventType.COURSE_STATE_UPDATED
            }));
            contentDetailsPage.shouldOpenPlayAsPopup = true;
            // act
            contentDetailsPage.subscribeEvents();
            // assert
            setTimeout(() => {
                expect(mockAppVersion.getAppName).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenNthCalledWith(1, EventTopics.DEEPLINK_CONTENT_PAGE_OPEN, expect.anything());
                expect(mockEvents.subscribe).toHaveBeenNthCalledWith(2, EventTopics.PLAYER_CLOSED, expect.anything());
                expect(mockEvents.subscribe).toHaveBeenNthCalledWith(3, EventTopics.NEXT_CONTENT, expect.anything());
                expect(mockRatingHandler.resetRating).toHaveBeenCalled();
                expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                expect(mockProfileSwitchHandler.switchUser).toHaveBeenCalled();
                done();
            }, 1000);
        });

        it('should invoke appVersion() and other subscription() if data is false when invoked', (done) => {
            // arrange
            mockAppVersion.getAppName = jest.fn(() => Promise.resolve('sunbird'));
            mockContentPlayerHandler.setLastPlayedContentId = jest.fn();
            const called: { [topic: EventTopics]: boolean } = {};
            mockEvents.subscribe = jest.fn((topic, fn) => {
                if (called[topic]) {
                    return;
                }
                called[topic] = true;
                if (topic === EventTopics.PLAYER_CLOSED) {
                    fn({ selectedUser: { profileType: 'Teacher' } });
                }
                // if (topic === EventTopics.NEXT_CONTENT) {
                //     fn({data: 'sample_data'});
                // }
            });
            mockProfileSwitchHandler.switchUser = jest.fn();
           jest.spyOn(contentDetailsPage, 'calculateAvailableUserCount').mockImplementation();
            mockEvents.unsubscribe = jest.fn((topic) => {
                console.log(topic);
                called[topic] = false;
            });
            contentDetailsPage.course = {
                contentId: 'content_id'
            };
            mockEventBusService.events = jest.fn(() => of({
                payload: {
                    contentId: 'content_id'
                },
                type: ContentEventType.COURSE_STATE_UPDATED
            }));
            jest.spyOn(contentDetailsPage, 'getNavParams').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            contentDetailsPage.subscribeEvents();
            // assert
            setTimeout(() => {
                expect(mockAppVersion.getAppName).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockProfileSwitchHandler.switchUser).toHaveBeenCalledWith({ profileType: 'Teacher' });
                done();
            }, 0);
        });
    });

    it('should call subscribeEvents when ngOnInit() invoked', (done) => {
        // arrange
        jest.spyOn(contentDetailsPage, 'subscribeEvents').mockImplementation(() => {
            return;
        });
        jest.spyOn(mockContentService, 'getContentDetails').mockResolvedValue(of({ contentData: { size: '12KB', status: 'Retired' } }));

        const dismissFn = jest.fn(() => Promise.resolve());
        const presentFn = jest.fn(() => Promise.resolve());
        mockCommonUtilService.getLoader = jest.fn(() => ({
            present: presentFn,
            dismiss: dismissFn,
        }));
        mockAppVersion.getAppName = jest.fn(() => Promise.resolve('sample-app'));
        mockFormFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve([{
            target: {
                mimeType: [
                    'application/pdf'
                ],
                primaryCategory: [
                    'LearningResource'
                ]
            }
        }]));
        // act
        contentDetailsPage.ngOnInit();
        // assert
        setTimeout(() => {
            expect(contentDetailsPage.subscribeEvents).toHaveBeenCalled();
            expect(mockFormFrameworkUtilService.getFormFields).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should return a transcript download popup', (done) => {
        // arrange
        mockPopoverController.create = jest.fn(() => (Promise.resolve({
            present: jest.fn(() => Promise.resolve({})),
        } as any)));
        contentDetailsPage.content = {
            contentData: {
                transcripts: [{
                    identifier: 'sample-do_id',
                    artifactUrl: 'http//:sample-url/do_id',
                    language: 'english'
                  }, {
                    identifier: 'sample-do_id',
                    artifactUrl: 'http//:sample-url/do_id',
                    language: 'hindi'
                  }],
                  name: 'transcript-content'
            }
        };
        // act
        contentDetailsPage.showDownloadTranscript();
        // assert
        setTimeout(() => {
            expect(mockPopoverController.create).toHaveBeenCalled();
            expect(contentDetailsPage.content.contentData.transcripts).not.toBeUndefined();
            done();
        }, 0);
    });

    describe('playerEvents', () => {
        it('should check on edata type END', () => {
            // arrange
            const event = {edata:{type: 'END', metaData: {}}, type: ''};
            const saveState = JSON.stringify(event.edata.metaData);
            contentDetailsPage.content = {
                hierarchyInfo: [{ id: 'sample-id' }],
                identifier: 'do-123',
                pkgVersion: 'v-3',
                rollUp: { l1: 'do_123', l2: 'do_123', l3: 'do_1' }
            };
            const contentId = contentDetailsPage.content.identifier;
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: 'user_id'}));
            if(event.edata['type'] === 'END') {
                mockPlayerService.savePlayerState = jest.fn(() => of());
                contentDetailsPage.isPlayerPlaying = false;
            }
            // act
            contentDetailsPage.playerEvents(event);
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
                expect(mockPlayerService.savePlayerState).toHaveBeenCalledWith('user_id', contentDetailsPage.content.rollUp.l1, contentId, saveState);
            }, 0);
        });
        it('should check on edata type EXIT', () => {
            // arrange
            const event = {edata:{type: 'EXIT'}, type: ''};
            contentDetailsPage.content = {
                hierarchyInfo: [{ id: 'sample-id' }],
                identifier: 'do-123',
                pkgVersion: 'v-3',
                rollUp: { l1: 'do_123', l2: 'do_123', l3: 'do_1' }
            };
            const contentId = contentDetailsPage.content.identifier;
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: 'user_id'}));
            if(event.edata['type'] === 'EXIT') {
                mockPlayerService.deletePlayerSaveState = jest.fn(() => of());
                mockScreenOrientation.type = 'landscape-primary';
                mockScreenOrientation.lock = jest.fn(() => Promise.resolve());
            }
            // act
            contentDetailsPage.playerEvents(event);
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
                expect(mockPlayerService.deletePlayerSaveState).toHaveBeenCalledWith('user_id', contentDetailsPage.content.rollUp.l1, contentId)
            }, 0);
        });
        it('should check on edata type NEXT_CONTENT_PLAY', () => {
            // arrange
            const event = {edata:{type: 'NEXT_CONTENT_PLAY'}, type: ''};
            contentDetailsPage.content = {
                hierarchyInfo: [{ id: 'sample-id' }],
                identifier: 'do-123',
                pkgVersion: 'v-3',
                rollUp: { l1: 'do_123', l2: 'do_123', l3: 'do_1' }
            };
            const contentId = contentDetailsPage.content.identifier;
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({uid: 'user_id'}));
            mockScreenOrientation.type = 'landscape-primary';
            mockScreenOrientation.lock = jest.fn(() => Promise.resolve());
            mockEvents.publish = jest.fn(() => Promise.resolve());
            jest.spyOn(contentDetailsPage, 'playNextContent').mockImplementation();
            // act
            contentDetailsPage.playerEvents(event);
            // assert
            setTimeout(() => {
                expect(mockEvents.publish).toHaveBeenCalledWith(EventTopics.NEXT_CONTENT, {
                    contentData:{
                        hierarchyInfo: [{ id: 'sample-id' }],
                        identifier: 'do-123',
                        pkgVersion: 'v-3',
                        rollUp: { l1: 'do_123', l2: 'do_123', l3: 'do_1' }
                    },
                    course: contentDetailsPage.course
                });
            }, 0);
        });
        it('should check on edata type compatibility-error', () => {
            // arrange
            const event = {edata:{type: 'compatibility-error'}, type: ''};
            contentDetailsPage.content = {
                hierarchyInfo: [{ id: 'sample-id' }],
                identifier: 'do-123',
                pkgVersion: 'v-3',
                rollUp: { l1: 'do_123', l2: 'do_123', l3: 'do_1' }
            };
            mockAppGlobalService.getCurrentUser = jest.fn(() => 'user_id');
            cordova.plugins['InAppUpdateManager'].checkForImmediateUpdate = jest.fn(() => of()) as any;
            // act
            contentDetailsPage.playerEvents(event);
            // assert
        });
        it('should check on edata type exdata', () => {
            // arrange
            const event = {edata:{type: 'exdata', currentattempt: true, maxLimitExceeded: 2, isLastAttempt: 'no'}, type: ''};
            contentDetailsPage.content = {
                hierarchyInfo: [{ id: 'sample-id' }],
                identifier: 'do-123',
                pkgVersion: 'v-3',
                rollUp: { l1: 'do_123', l2: 'do_123', l3: 'do_1' }
            };
            const attemptInfo = {
                isContentDisabled: event.edata.maxLimitExceeded,
                isLastAttempt: event.edata.isLastAttempt
            };
            mockCommonUtilService.handleAssessmentStatus = jest.fn(() => of());
            // act
            contentDetailsPage.playerEvents(event);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.handleAssessmentStatus).toHaveBeenCalledWith(attemptInfo);
            }, 0);
        });
        it('should check on edata type FULLSCREEN and screentype', () => {
            // arrange
            const event = {edata:{type: 'FULLSCREEN'}, type: ''};
            contentDetailsPage.content = {
                hierarchyInfo: [{ id: 'sample-id' }],
                identifier: 'do-123',
                pkgVersion: 'v-3',
                rollUp: { l1: 'do_123', l2: 'do_123', l3: 'do_1' }
            };
            if (mockScreenOrientation.type == 'portrait-primary') {
                mockScreenOrientation.lock = jest.fn(() => Promise.resolve());
            } else if (mockScreenOrientation.type == 'landscape-primary') {
                mockScreenOrientation.lock = jest.fn(() => Promise.resolve());
            }
            // act
            contentDetailsPage.playerEvents(event);
            // assert
        });
        it('should check on type ended and ratecontent', () => {
            // arrange
            const event = {edata: '', type: 'ended'};
            contentDetailsPage.content = {
                hierarchyInfo: [{ id: 'sample-id' }],
                identifier: 'do-123',
                pkgVersion: 'v-3',
                rollUp: { l1: 'do_123', l2: 'do_123', l3: 'do_1' }
            };
            // act
            contentDetailsPage.playerEvents(event);
            // assert
        });
        it('should check on type REPLAY', () => {
            // arrange
            const event = {edata: '', type: 'REPLAY'};
            // act
            contentDetailsPage.playerEvents(event);
            // assert
        });
        it('should check on type REPLAY', () => {
            // arrange
            const event = {edata: '', type: ''};
            // act
            contentDetailsPage.playerEvents(event);
            // assert
        });
    });
});