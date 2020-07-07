import { ContentDetailsPage } from '../content-details/content-details.page';
import { Container } from 'inversify';
import {
    ContentService,
    EventsBusService,
    PlayerService,
    DownloadService,
    ProfileService,
    ProfileServiceImpl,
    SharedPreferences,
    StorageService,
    TelemetryObject,
    Content,
    GetAllProfileRequest,
    CourseService
} from 'sunbird-sdk';
import { ContentServiceImpl } from 'sunbird-sdk/content/impl/content-service-impl';
import { EventsBusServiceImpl } from 'sunbird-sdk/events-bus/impl/events-bus-service-impl';
import { StorageServiceImpl } from 'sunbird-sdk/storage/impl/storage-service-impl';
import { Events, Platform, PopoverController, ToastController } from '@ionic/angular';
import { NgZone } from '@angular/core';
import {
    AppGlobalService,
    AppHeaderService,
    CommonUtilService,
    CourseUtilService,
    TelemetryGeneratorService,
    UtilityService,
} from '@app/services';
import { Network } from '@ionic-native/network/ngx';
import { FileSizePipe } from '@app/pipes/file-size/file-size';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileSwitchHandler } from '@app/services/user-groups/profile-switch-handler';
import { RatingHandler } from '@app/services/rating/rating-handler';
import { ContentPlayerHandler } from '@app/services/content/player/content-player-handler';
import { ChildContentHandler } from '@app/services/content/child-content-handler';
import { ContentDeleteHandler } from '@app/services/content/content-delete-handler';
import { of, throwError, EMPTY } from 'rxjs';
import { mockContentData } from '@app/app/content-details/content-details.page.spec.data';
import { LoginHandlerService } from '@app/services/login-handler.service';
import {
    Environment,
    ImpressionType,
    InteractSubtype,
    InteractType,
    Mode,
    PageId,
} from '@app/services/telemetry-constants';
import { ContentUtil } from '@app/util/content-util';
import { EventTopics, ContentType, ShareItemType, PreferenceKey } from '../app.constant';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { truncate } from 'fs';
import { SbProgressLoader } from '@app/services/sb-progress-loader.service';

describe('ContentDetailsPage', () => {
    let contentDetailsPage: ContentDetailsPage;
    const container = new Container();

    const mockProfileService: Partial<ProfileService> = {};
    const mockContentService: Partial<ContentService> = {};
    const mockEventBusService: Partial<EventsBusService> = {};
    const mockPreferences: Partial<SharedPreferences> = {};
    const mockPlayerService: Partial<PlayerService> = {};
    const mockStorageService: Partial<StorageService> = {};
    const mockDownloadService: Partial<DownloadService> = {
        getActiveDownloadRequests: jest.fn(() => EMPTY)
    };
    const mockCourseService: Partial<CourseService> = {
        getContentState: jest.fn(() => of('success'))
    };
    const mockNgZone: Partial<NgZone> = {
        run: jest.fn()
    };
    const mockEvents: Partial<Events> = {
        subscribe: jest.fn(() => 'playConfig')
    };
    const mockPopoverController: Partial<PopoverController> = {};
    const mockPlatform: Partial<Platform> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {
        getCurrentUser: jest.fn()
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn(),
        generateEndTelemetry: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {};
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
    const mockLocation: Partial<Location> = {};
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockContentData)
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
        getLastPlayedContentId: jest.fn()
    };
    const mockChildContentHandler: Partial<ChildContentHandler> = {};
    const contentDeleteCompleted = { subscribe: jest.fn((fn) => fn({ closed: false })) };
    const mockContentDeleteHandler: Partial<ContentDeleteHandler> = { contentDeleteCompleted$: of(contentDeleteCompleted) };
    const mockLoginHandlerService: Partial<LoginHandlerService> = {};
    const mockToastController: Partial<ToastController> = {};
    const mockFileOpener: Partial<FileOpener> = {};
    const mockFileTransfer: Partial<FileTransfer> = {};
    const telemetryObject = new TelemetryObject('do_12345', 'Resource', '1');
    const rollUp = { l1: 'do_123', l2: 'do_123', l3: 'do_1' };
    const mockSbProgressLoader: Partial<SbProgressLoader> = {};

    beforeAll(() => {
        contentDetailsPage = new ContentDetailsPage(
            mockProfileService as ProfileServiceImpl,
            mockContentService as ContentServiceImpl,
            mockEventBusService as EventsBusServiceImpl,
            mockStorageService as StorageServiceImpl,
            mockDownloadService as DownloadService,
            mockPreferences as SharedPreferences,
            mockCourseService as CourseService,
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
            mockLoginHandlerService as LoginHandlerService,
            mockFileOpener as FileOpener,
            mockFileTransfer as FileTransfer,
            mockSbProgressLoader as SbProgressLoader
        );
    });
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create instance of contentDetailsPage', () => {
        expect(contentDetailsPage).toBeTruthy();
    });

    it('should get extras from content || navigation when getExtras() called', () => {
        // arrange
        const extras = mockContentData.extras.state;
        spyOn(contentDetailsPage, 'getNavParams');
        // act
        contentDetailsPage.getNavParams();
        // assert
        expect(contentDetailsPage.getNavParams).toHaveBeenCalled();
    });

    it('should call subscribeEvents when ngOnInit() invoked', () => {
        // arrange
        spyOn(contentDetailsPage, 'subscribeEvents').and.stub();
        // act
        contentDetailsPage.ngOnInit();
        // assert
        expect(contentDetailsPage.subscribeEvents).toHaveBeenCalled();
    });

    it('should invoke appVersion() and other subscription() when invoked', (done) => {
        // arrange
        mockAppVersion.getAppName = jest.fn(() => Promise.resolve('sunbird'));
        mockRatingHandler.showRatingPopup = jest.fn();
        mockContentPlayerHandler.setLastPlayedContentId = jest.fn();
        const called: { [topic: EventTopics]: boolean } = {};
        mockEvents.subscribe = jest.fn((topic, fn) => {
            if (called[topic]) {
                return;
            }

            called[topic] = true;

            if (topic === EventTopics.PLAYER_CLOSED) {
                fn({ selectedUser: 'sampleUser' });
            }
            if (topic === EventTopics.NEXT_CONTENT) {
                fn({ data: 'sample_data' });
            }
        });
        mockRouter.getCurrentNavigation = jest.fn(() => mockContentData);
        mockProfileService.getActiveProfileSession = jest.fn(() =>
            of({ uid: 'sample_uid', sid: 'sample_session_id', createdTime: Date.now() }));
        mockProfileSwitchHandler.switchUser = jest.fn();
        spyOn(contentDetailsPage, 'calculateAvailableUserCount').and.stub();
        spyOn(contentDetailsPage, 'generateEndEvent').and.stub();
        mockEvents.unsubscribe = jest.fn((topic) => {
            console.log(topic);
            called[topic] = false;
        });
        spyOn(contentDetailsPage, 'generateTelemetry').and.stub();
        mockDownloadService.getActiveDownloadRequests = jest.fn(() => EMPTY);
        // act
        contentDetailsPage.subscribeEvents();
        // assert
        setTimeout(() => {
            expect(mockAppVersion.getAppName).toHaveBeenCalled();
            expect(mockEvents.subscribe).toHaveBeenCalled();
            expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
            expect(mockProfileSwitchHandler.switchUser).toHaveBeenCalled();
            expect(mockRatingHandler.showRatingPopup).toHaveBeenCalled();
            expect(mockContentPlayerHandler.setLastPlayedContentId).toHaveBeenCalled();
            done();
        }, 1000);
    });

    it('should invoke appVersion() and other subscription() if data is false when invoked', (done) => {
        // arrange
        mockAppVersion.getAppName = jest.fn(() => Promise.resolve('sunbird'));
        mockRatingHandler.showRatingPopup = jest.fn();
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
        spyOn(contentDetailsPage, 'calculateAvailableUserCount').and.stub();
        mockEvents.unsubscribe = jest.fn((topic) => {
            console.log(topic);
            called[topic] = false;
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

    it('should be logged in before play the content by invoked promptToLogin() if user loggedin', async (done) => {
        // arrange
        mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
        contentDetailsPage.autoPlayQuizContent = true;
        jest.spyOn(contentDetailsPage, 'handleContentPlay').mockImplementation(() => {
            return 0;
        });
        // act
        await contentDetailsPage.promptToLogin();
        // assert
        setTimeout(() => {
            expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
            done();
        }, 1000);
    });


    it('should be logged in before play the content for isLoginPromptOpen() if user is not loggedin', (done) => {
        // arrange
        mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
        contentDetailsPage.isLoginPromptOpen = true;
        // act
        contentDetailsPage.promptToLogin();
        // assert
        setTimeout(() => {
            expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
            expect(contentDetailsPage.isLoginPromptOpen).toBeTruthy();
            done();
        }, 0);
    });

    it('should check limitedShareContentFlag', () => {
        // arrange
        const request = {
            contentData: {
                status: 'Unlisted'
            }
        };
        jest.spyOn(ContentUtil, 'getTelemetryObject').mockImplementation(() => {
            return request;
        });
        jest.spyOn(contentDetailsPage, 'promptToLogin').mockImplementation(() => {
            return;
        });
        // act
        contentDetailsPage.checkLimitedContentSharingFlag(request);
        // assert
        expect(ContentUtil.getTelemetryObject).toHaveBeenCalled();
        expect(contentDetailsPage.promptToLogin).toHaveBeenCalled();
    });

    it('should check limitedShareContentFlag', () => {
        // arrange
        const request = {
            contentData: {
                status: 'Unlisted'
            }
        };
        jest.spyOn(ContentUtil, 'getTelemetryObject').mockImplementation(() => {
            return request;
        });
        jest.spyOn(contentDetailsPage, 'promptToLogin').mockImplementation(() => {
            return;
        });
        // act
        contentDetailsPage.checkLimitedContentSharingFlag(request);
        // assert
        expect(ContentUtil.getTelemetryObject).toHaveBeenCalled();
        expect(contentDetailsPage.promptToLogin).toHaveBeenCalled();
    });

    it('shouldn\'t  show PlayAsPopup if limitedShareContentFlag flag is true', (done) => {
        // arrange
        contentDetailsPage.userCount = 3;
        contentDetailsPage.shouldOpenPlayAsPopup = true;
        mockNetwork.type = '3g';
        contentDetailsPage.limitedShareContentFlag = true;
        jest.spyOn(contentDetailsPage, 'openPlayAsPopup');
        // act
        contentDetailsPage.showSwitchUserAlert(false);
        // assert
        expect(contentDetailsPage.openPlayAsPopup).toHaveBeenCalledTimes(0);
        done();
    });

    it('shouldn playContent if network is available and more than 2g and user count is not more than 2', (done) => {
        // arrange
        contentDetailsPage.userCount = 2;
        contentDetailsPage.apiLevel = 19;
        contentDetailsPage.appAvailability = 'false';
        contentDetailsPage.shouldOpenPlayAsPopup = true;
        mockNetwork.type = '3g';
        contentDetailsPage.limitedShareContentFlag = false;
        mockCommonUtilService.translateMessage = jest.fn(() => '');
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        mockPopoverController.create = jest.fn(() => (Promise.resolve({
            present: jest.fn(() => Promise.resolve({})),
            onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
        } as any)));
        // act
        contentDetailsPage.showSwitchUserAlert(true).then(() => {
            // assert
            expect(mockPopoverController.create).toHaveBeenCalledTimes(1);
            done();
        });
    });

    it('should  show LowBandwidth Popup for 2g type network connection', (done) => {
        // arrange
        contentDetailsPage.content = { identifier: 'do_1234' };
        contentDetailsPage.userCount = 3;
        contentDetailsPage.shouldOpenPlayAsPopup = true;
        mockNetwork.type = '2g';
        mockCommonUtilService.translateMessage = jest.fn(() => '');
        mockPopoverController.create = jest.fn(() => (Promise.resolve({
            present: jest.fn(() => Promise.resolve({})),
            onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
        } as any)));
        // act
        contentDetailsPage.showSwitchUserAlert(false);
        // assert
        expect(mockPopoverController.create).toHaveBeenCalled();
        done();
    });

    it('should  show PlayAs Popup  When LowBandwidth popup Ok button click', (done) => {
        // arrange
        contentDetailsPage.content = { identifier: 'do_1234' };
        contentDetailsPage.userCount = 3;
        contentDetailsPage.shouldOpenPlayAsPopup = false;
        mockNetwork.type = '2g';
        contentDetailsPage.limitedShareContentFlag = false;
        mockCommonUtilService.translateMessage = jest.fn(() => '');
        mockPopoverController.create = jest.fn(() => (Promise.resolve({
            present: jest.fn(() => Promise.resolve({})),
            onDidDismiss: jest.fn(() => Promise.resolve({ data: { isLeftButtonClicked: true } }))
        } as any)));
        const profile = {
            handle: 'handle'
        };
        mockAppGlobalService.getCurrentUser = jest.fn(() => profile);
        jest.spyOn(contentDetailsPage, 'openPlayAsPopup');
        // act
        contentDetailsPage.showSwitchUserAlert(false);
        // assert
        setTimeout(() => {
            expect(contentDetailsPage.openPlayAsPopup).toHaveBeenCalled();
            done();
        }, 0);

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
            });
            window.cordova.plugins.printer.canPrintItem = jest.fn((_, cb) => { cb(true); });
            window.cordova.plugins.printer.print = jest.fn();
            // act
            contentDetailsPage.openPDFPreview(content as Content).then(() => {
                // assert
                expect(mockFileTransfer.create).toHaveBeenCalled();
                expect(mockDownload).toHaveBeenCalledWith(content.contentData.itemSetPreviewUrl, expect.any(String));
                expect(window.cordova.plugins.printer.print).toHaveBeenCalledWith('SOME_TEMP_URL');
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
            window.cordova.plugins.printer.canPrintItem = jest.fn((_, cb) => { cb(true); });
            window.cordova.plugins.printer.print = jest.fn();
            // act
            contentDetailsPage.openPDFPreview(content as Content).then(() => {
                // assert
                expect(mockFileTransfer.create).not.toHaveBeenCalled();
                expect(mockDownload).not.toHaveBeenCalled();
                expect(window.cordova.plugins.printer.print).toHaveBeenCalledWith(
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
            });
            window.cordova.plugins.printer.canPrintItem = jest.fn((_, cb) => { cb(true); });
            window.cordova.plugins.printer.print = jest.fn(() => { throw new Error('UNEXPECTED_ERROR'); });
            // act
            contentDetailsPage.openPDFPreview(content as Content).then(() => {
                // assert
                expect(window.cordova.plugins.printer.print).toHaveBeenCalledWith(
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
            });
            window.cordova.plugins.printer.canPrintItem = jest.fn((_, cb) => { cb(false); });
            // act
            contentDetailsPage.openPDFPreview(content as Content).then(() => {
                // assert
                expect(window.cordova.plugins.printer.print).not.toHaveBeenCalledWith(
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
            expect(mockTelemetryGeneratorService.generateEndTelemetry).toHaveBeenCalledWith(ContentType.RESOURCE,
                Mode.PLAY,
                PageId.CONTENT_DETAIL,
                Environment.HOME,
                telemetryObject,
                rollUp,
                [{id: 'do-123', type: 'Content'}]);
        });

        it('should generate END Telemetry with  contentType if telemetryObject contentType is empty', () => {
            // arrange
            contentDetailsPage.telemetryObject = new TelemetryObject('do_12345', '', '1');
            contentDetailsPage.objRollup = rollUp;
            // act
            contentDetailsPage.generateEndEvent();
            // assert
            expect(mockTelemetryGeneratorService.generateEndTelemetry).toHaveBeenCalledWith(ContentType.RESOURCE,
                Mode.PLAY,
                PageId.CONTENT_DETAIL,
                Environment.HOME,
                contentDetailsPage.telemetryObject,
                rollUp,
                [{id: 'do-123', type: 'Content'}]);
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
                    expect(mockPopoverController.create).toHaveBeenCalledWith(expect.objectContaining({
                        componentProps: expect.objectContaining({
                            shareItemType: ShareItemType.ROOT_CONTENT
                        })
                    }));
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
            // act
            contentDetailsPage.ngOnDestroy();
            // assert
            expect(mockEvents.unsubscribe).toBeCalledTimes(3);
        });
    });

    describe('ionViewWillEnter()', () => {
        it('should unsubscribe events', () => {
            // arrange
            spyOn(contentDetailsPage, 'generateTelemetry').and.stub();
            spyOn(contentDetailsPage, 'subscribeSdkEvent').and.stub();
            spyOn(contentDetailsPage, 'handleDeviceBackButton').and.stub();
            spyOn(contentDetailsPage, 'isPlayedFromCourse').and.stub();
            spyOn(contentDetailsPage, 'setContentDetails').and.stub();
            spyOn(contentDetailsPage, 'findHierarchyOfContent').and.stub();
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            // act
            contentDetailsPage.ionViewWillEnter();
            // assert
            expect(mockHeaderService.hideHeader).toBeCalled();
            expect(contentDetailsPage.isPlayedFromCourse).toBeCalled();
            expect(contentDetailsPage.setContentDetails).toBeCalled();
            expect(contentDetailsPage.findHierarchyOfContent).toBeCalled();
            expect(contentDetailsPage.handleDeviceBackButton).toBeCalled();
        });
    });

    describe('ionViewWillLeave()', () => {
        it('should unsubscribe', () => {
            // arrange
            const unsubscribe = jest.fn();
            contentDetailsPage.eventSubscription = {
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
            contentDetailsPage.eventSubscription = undefined;
            contentDetailsPage.contentDeleteObservable = undefined;
            contentDetailsPage.backButtonFunc = undefined;
            // act
            contentDetailsPage.ionViewWillLeave();
            // assert
        });
    });

    describe('handleNavBackButton', () => {
        it('should handle nav backbutton by invoked handleNavBackButton', () => {
            // arrange
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            jest.spyOn(contentDetailsPage, 'generateEndEvent').mockReturnValue();
            jest.spyOn(contentDetailsPage, 'popToPreviousPage').mockReturnValue();
            // act
            contentDetailsPage.handleNavBackButton();
            // assert
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                PageId.CONTENT_DETAIL,
                Environment.HOME,
                true,
                'do_212911645382959104165',
                [{id: 'do-123', type: 'Content'}],
                { l1: 'do_123', l2: 'do_123', l3: 'do_1' },
                { id: 'do_12345', type: '', version: '1' }
            );
        });

        it('should generate shouldGenerateEndTelemetry by invoked handleNavBackButton', () => {
            // arrange
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            jest.spyOn(contentDetailsPage, 'generateEndEvent').mockReturnValue();
            contentDetailsPage.shouldGenerateEndTelemetry = true;
            jest.spyOn(contentDetailsPage, 'popToPreviousPage').mockReturnValue();
            mockTelemetryGeneratorService.generateQRSessionEndEvent = jest.fn();
            // act
            contentDetailsPage.handleNavBackButton();
            // assert
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                PageId.CONTENT_DETAIL,
                Environment.HOME,
                true,
                'do_212911645382959104165',
                [{id: 'do-123', type: 'Content'}],
                { l1: 'do_123', l2: 'do_123', l3: 'do_1' },
                { id: 'do_12345', type: '', version: '1' }
            );
        });
    });

    describe('handleDeviceBackButton', () => {
        it('should handle device back button', () => {
            const subscribeWithPriorityData = jest.fn((_, fn) => fn());
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData,
            } as any;
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            contentDetailsPage.handleDeviceBackButton();
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                PageId.CONTENT_DETAIL,
                Environment.HOME,
                false,
                'do_212911645382959104165',
                [{id: 'do-123', type: 'Content'}],
                { l1: 'do_123', l2: 'do_123', l3: 'do_1' },
                { id: 'do_12345', type: '', version: '1' }
            );
        });

        it('should handle device back button', () => {
            const subscribeWithPriorityData = jest.fn((_, fn) => fn());
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData,
            } as any;
            contentDetailsPage.shouldGenerateEndTelemetry = contentDetailsPage.shouldGenerateEndTelemetry ? false : true;
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            contentDetailsPage.handleDeviceBackButton();
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                PageId.CONTENT_DETAIL,
                Environment.HOME,
                false,
                'do_212911645382959104165',
                [{id: 'do-123', type: 'Content'}],
                { l1: 'do_123', l2: 'do_123', l3: 'do_1' },
                { id: 'do_12345', type: '', version: '1' }
            );
        });
    });

    it('should subscribe play content', () => {
        mockEvents.subscribe = jest.fn((_, fn) => {
            fn({ selectedUser: 'user-1' });
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

    describe('extractApiResponse', () => {
        it('should be', () => {
            // arrange
            const request: Content = {
                contentData: {
                    licenseDetails: {
                        description: 'descript',
                        name: 'sample-name',
                        url: 'sample-url'
                    },
                    appIcon: 'sample-app-icon',
                    streamingUrl: 'streamingUrl'
                },
                mimeType: 'application/vnd.ekstep.h5p',
                contentMarker: [{
                    extraInfoMap: { hierarchyInfo: [{ id: 'do-123' }] }
                }],
                isAvailableLocally: true,
                contentAccess: 'content-access',
                isUpdateAvailable: true
            };
            contentDetailsPage.isResumedCourse = true;
            contentDetailsPage.resumedCourseCardData = {
                contentId: 'sample-content-id',
                identifier: 'sample-id'
            };
            mockChildContentHandler.setChildContents = jest.fn();
            jest.spyOn(ContentUtil, 'getAppIcon').mockReturnValue('sample-app-icon');
            mockCommonUtilService.convertFileSrc = jest.fn();
            jest.spyOn(contentDetailsPage, 'generateTelemetry').mockReturnValue();
            mockContentPlayerHandler.isContentPlayerLaunched = jest.fn(() => true);
            contentDetailsPage.cardData = {
                hierarchyInfo: truncate
            };
            if (contentDetailsPage.isChildContent) {
                contentDetailsPage.isChildContent = false;
            }
            // act
            contentDetailsPage.extractApiResponse(request);
            // assert
            expect(contentDetailsPage.isResumedCourse).toBeTruthy();
            expect(mockChildContentHandler.setChildContents).toHaveBeenCalledWith(
                contentDetailsPage.resumedCourseCardData.contentId, 0, undefined);
            expect(mockCommonUtilService.convertFileSrc).toHaveBeenCalledWith('sample-app-icon');
            expect(mockContentPlayerHandler.isContentPlayerLaunched).toHaveBeenCalled();
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
            const identifier = 'do_123', refreshContentDetails = true, showRating = true;
            mockContentService.getContentDetails = jest.fn(() => of({ contentData: { size: '12KB', status: 'Retired' } }));
            mockCommonUtilService.showToast = jest.fn();
            mockLocation.back = jest.fn();
            jest.spyOn(contentDetailsPage, 'extractApiResponse').mockReturnValue();
            jest.spyOn(contentDetailsPage, 'showRetiredContentPopup').mockImplementation(() => {
                return Promise.resolve();
            });
            mockContentPlayerHandler.setContentPlayerLaunchStatus = jest.fn();
            mockRatingHandler.showRatingPopup = jest.fn(() => Promise.resolve({}));
            // act
            contentDetailsPage.setContentDetails(identifier, refreshContentDetails, showRating);
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                expect(mockContentPlayerHandler.setContentPlayerLaunchStatus).toHaveBeenCalled();
                expect(mockRatingHandler.showRatingPopup).toHaveBeenCalled();
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
            [{id: 'do-123', type: 'Content'}, {id: 'content-detail', type: 'ChildUi'}]
        );
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenNthCalledWith(2,
            ImpressionType.DETAIL, '',
            PageId.CONTENT_DETAIL,
            Environment.HOME,
            undefined, undefined, undefined, {l1: 'do_123', l2: 'do_123', l3: 'do_1'},
            [{id: 'do-123', type: 'Content'},
            {id: 'content-detail', type: 'ChildUi'}]
        );
        expect(mockTelemetryGeneratorService.generatePageLoadedTelemetry).toHaveBeenCalledWith(
            PageId.CONTENT_DETAIL,
            Environment.HOME,
            undefined,
            undefined,
            undefined,
            undefined,
            [{id: 'do-123', type: 'Content'}, {id: 'content-detail', type: 'ChildUi'}]
        );
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
        it('should open a content download popup for dismiss data', (done) => {
            // arrange
            contentDetailsPage.limitedShareContentFlag = false;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            contentDetailsPage.content = { contentData: { name: 'matrix', size: 101100 } };
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
                expect(presentFN).toHaveBeenCalled();
                expect(onDismissFN).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should open a content download popup for dismiss data is undefined', (done) => {
            // arrange
            contentDetailsPage.limitedShareContentFlag = false;
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            contentDetailsPage.content = { contentData: { name: 'matrix', size: 101100 } };
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
            false,
            { contentData: { name: 'matrix', size: 101100 } },
            'rating',
            [{id: 'do-123', type: 'Content'}, {
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
            mockDownloadService.getActiveDownloadRequests = jest.fn(() => of(resp));
            // act
            contentDetailsPage.getNavParams();
            // assert
            expect(mockDownloadService.getActiveDownloadRequests).toHaveBeenCalled();
            contentDetailsPage.isContentDownloading$.subscribe((res) => {
                expect(res).toBeTruthy();
                done();
            });
        });
    });

    it('should hide deeplink progress loader', () => {
        // arrange
        contentDetailsPage.identifier = 'sample_doId';
        mockSbProgressLoader.hide = jest.fn();
        // act
        contentDetailsPage.ionViewDidEnter();
        // assert
        expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({ id: 'sample_doId' });
    });

    describe('cancelDownload', () => {
        it('should generate telemetry for cancel download', () => {
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockContentService.cancelDownload = jest.fn(() => of(undefined));
            // act
            contentDetailsPage.cancelDownload();
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                InteractType.SELECT_CLOSE,
                InteractSubtype.CANCEL,
                Environment.HOME,
                PageId.CONTENT_DETAIL,
                {id: 'sample_id1', type: 'Content', version: ''}, undefined, undefined,
                [{id: 'download-popup', type: 'ChildUi'}]
            );
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                InteractType.TOUCH,
                InteractSubtype.DOWNLOAD_CANCEL_CLICKED,
                Environment.HOME,
                PageId.CONTENT_DETAIL,
                undefined, undefined, {l1: 'do_123', l2: 'do_123', l3: 'do_1'}, undefined
            );
        });
    });
    describe('getContentState', () => {
        it('should not show course complete popup', (done) => {
            // arrange
            mockAppGlobalService.showCourseCompletePopup = false;
            mockAppGlobalService.getUserId = jest.fn(() => 'userid');
            const contenxt = '{"userId":"userid","courseId":"courseid","batchId":"batchid","isCertified":false,"leafNodeIds":["id1","id2"],"batchStatus":1}'
            mockPreferences.getString = jest.fn((key) => {
                switch (key) {
                    case PreferenceKey.CONTENT_CONTEXT:
                        return of(contenxt);
                }
            });
            const contentStatus = {
                contentList: [{contentId: 'id1'}]
            };
            mockCourseService.getContentState = jest.fn(() => of(contentStatus));
            // act
            contentDetailsPage.getContentState();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.showCourseCompletePopup).toBe(true);
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
            });
            const contentStatus = {
                contentList: [{contentId: 'id1', status: 2}]
            };
            mockCourseService.getContentState = jest.fn(() => of(contentStatus));
            // act
            contentDetailsPage.getContentState();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.showCourseCompletePopup).toBe(false);
                expect(contentDetailsPage.showCourseCompletePopup).toBe(true);
                done();
            });
        });
    });
});
