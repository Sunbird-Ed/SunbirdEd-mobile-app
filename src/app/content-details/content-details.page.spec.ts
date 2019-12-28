import { ContentDetailsPage } from '@app/app/content-details/content-details.page';
import { Container } from 'inversify';
import {
    AuthService,
    ContentService,
    EventsBusService,
    PlayerService,
    PlayerServiceImpl,
    ProfileService,
    ProfileServiceImpl,
    SharedPreferences,
    StorageService,
    TelemetryObject
} from 'sunbird-sdk';
import { ContentServiceImpl } from 'sunbird-sdk/content/impl/content-service-impl';
import { EventsBusServiceImpl } from 'sunbird-sdk/events-bus/impl/events-bus-service-impl';
import { StorageServiceImpl } from 'sunbird-sdk/storage/impl/storage-service-impl';
import { AuthServiceImpl } from 'sunbird-sdk/auth/impl/auth-service-impl';
import { Events, Platform, PopoverController, ToastController } from '@ionic/angular';
import { NgZone } from '@angular/core';
import { SbPopoverComponent } from '../components/popups/sb-popover/sb-popover.component';
import {
    AppGlobalService,
    AppHeaderService,
    CommonUtilService,
    ContentShareHandlerService,
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
import { of } from 'rxjs';
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
import { EventTopics } from '../app.constant';

describe('ContentDetailsPage', () => {
    let contentDetailsPage: ContentDetailsPage;
    const container = new Container();

    const mockProfileService: Partial<ProfileService> = {};
    const mockContentService: Partial<ContentService> = {};
    const mockEventBusService: Partial<EventsBusService> = {};
    const mockPreferences: Partial<SharedPreferences> = {};
    const mockPlayerService: Partial<PlayerService> = {};
    const mockStorageService: Partial<StorageService> = {};
    const mockAuthService: Partial<AuthService> = {};
    const mockNgZone: Partial<NgZone> = {};
    const mockEvents: Partial<Events> = {
        subscribe: jest.fn(() => 'playConfig')
    };
    const mockPopoverController: Partial<PopoverController> = {};
    const mockPlatform: Partial<Platform> = {};
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockCourseUtilService: Partial<CourseUtilService> = {};
    const mockUtilityService: Partial<UtilityService> = {
        getDeviceAPILevel: jest.fn(() => Promise.resolve('sample')),
        checkAppAvailability: jest.fn(() => Promise.resolve('sample_check'))
    };
    const mockNetwork: Partial<Network> = {};
    const mockFileSizePipe: Partial<FileSizePipe> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockContentShareHandler: Partial<ContentShareHandlerService> = {};
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
    const mockContentPlayerHandler: Partial<ContentPlayerHandler> = {};
    const mockChildContentHandler: Partial<ChildContentHandler> = {};
    const mockContentDeleteHandler: Partial<ContentDeleteHandler> = {};
    const mockLoginHandlerService: Partial<LoginHandlerService> = {};
    const mockToastController: Partial<ToastController> = {};

    beforeAll(() => {
        contentDetailsPage = new ContentDetailsPage(
            mockProfileService as ProfileServiceImpl,
            mockContentService as ContentServiceImpl,
            mockEventBusService as EventsBusServiceImpl,
            mockPreferences as SharedPreferences,
            mockPlayerService as PlayerServiceImpl,
            mockStorageService as StorageServiceImpl,
            mockAuthService as AuthServiceImpl,
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
            mockContentShareHandler as ContentShareHandlerService,
            mockAppVersion as AppVersion,
            mockLocation as Location,
            mockRouter as Router,
            mockRoute as ActivatedRoute,
            mockProfileSwitchHandler as ProfileSwitchHandler,
            mockRatingHandler as RatingHandler,
            mockContentPlayerHandler as ContentPlayerHandler,
            mockChildContentHandler as ChildContentHandler,
            mockContentDeleteHandler as ContentDeleteHandler,
            mockLoginHandlerService as LoginHandlerService
        );
    });
    beforeEach(() => {
        jest.clearAllMocks();
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
                fn({selectedUser: 'sampleUser'});
            }
            if (topic === EventTopics.NEXT_CONTENT) {
                fn({data: 'sample_data'});
            }
        });
        mockProfileService.getActiveProfileSession = jest.fn(() =>
            of({uid: 'sample_uid', sid: 'sample_session_id', createdTime: Date.now()}));
        mockProfileSwitchHandler.switchUser = jest.fn();
        spyOn(contentDetailsPage, 'calculateAvailableUserCount').and.stub();
        spyOn(contentDetailsPage, 'generateEndEvent').and.stub();
        mockEvents.unsubscribe = jest.fn((topic) => {
            console.log(topic);
            called[topic] = false;
        });
        spyOn(contentDetailsPage, 'generateTelemetry').and.stub();
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
                fn({selectedUser: {profileType: 'Teacher'} });
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
            expect(mockProfileSwitchHandler.switchUser).toHaveBeenCalledWith({profileType: 'Teacher'});
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

    it('should be logged in before play the content by invoked promptToLogin() if user is not loggedin', (done) => {
        // arrange
        mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);

        contentDetailsPage.telemetryObject = {
            id: 'sample-id',
            type: 'content-details',
            version: 'v-7.0',
            setRollup: jest.fn()
        };

        ContentUtil.prototype.getTelemetryObject = jest.fn(() => contentDetailsPage.telemetryObject);
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn(() => { });
        const dismissData = jest.fn(() => Promise.resolve({ data: { canDelete: true } }));
        const presentFn = jest.fn(() => Promise.resolve());
        mockPopoverController.create = jest.fn(() => Promise.resolve({
            present: presentFn,
            onDidDismiss: dismissData
        }) as any);
        mockCommonUtilService.translateMessage = jest.fn(() => 'you must loin to access quiz content');
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn(() => { });
        mockLoginHandlerService.signIn = jest.fn();
        // act
        contentDetailsPage.promptToLogin();
        // assert
        setTimeout(() => {
            expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.VIEW,
                '', PageId.SIGNIN_POPUP,
                Environment.HOME,
                'sample-id',
                'content-details',
                'v-7.0',
                undefined,
                undefined
            );
            expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('YOU_MUST_LOGIN_TO_ACCESS_QUIZ_CONTENT');
            expect(mockPopoverController.create).toHaveBeenCalledWith({
                component: SbPopoverComponent,
                componentProps: {
                    actionsButtons: [{
                        btnClass: 'popover-color',
                        btntext: 'you must loin to access quiz content',
                    }
                    ],
                    isNotShowCloseIcon: true,
                    metaInfo: 'you must loin to access quiz content',
                    sbPopoverHeading: 'you must loin to access quiz content',
                    sbPopoverMainTitle: 'you must loin to access quiz content',
                }, cssClass: 'sb-popover info'
            });
            expect(presentFn).toHaveBeenCalled();
            expect(dismissData).toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
            expect(mockLoginHandlerService.signIn).toHaveBeenCalled();
            done();
        }, 0);
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

});
