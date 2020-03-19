import { ResourcesComponent } from '@app/app/resources/resources.component';
import { Container } from 'inversify';
import { ContentService, EventsBusService, ProfileService, ProfileServiceImpl, SharedPreferences } from 'sunbird-sdk';
import { EventsBusServiceImpl } from 'sunbird-sdk/events-bus/impl/events-bus-service-impl';
import { ContentServiceImpl } from 'sunbird-sdk/content/impl/content-service-impl';
import { NgZone, ChangeDetectorRef } from '@angular/core';
import {
    AppGlobalService,
    AppHeaderService,
    CommonUtilService,
    FormAndFrameworkUtilService,
    PageId,
    SunbirdQRScanner,
    TelemetryGeneratorService
} from '@app/services';
import { Events, MenuController, ToastController } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Network } from '@ionic-native/network/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { SplaschreenDeeplinkActionHandlerDelegate } from '@app/services/sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { mockContentData } from '@app/app/content-details/content-details.page.spec.data';
import { of, Subscription, NEVER } from 'rxjs';
import {
    ContentSearchCriteria,
    ContentsGroupedByPageSection,
    FrameworkService,
    FrameworkUtilService,
    Profile,
    ProfileSource,
    ProfileType,
    SearchType,
    GetFrameworkCategoryTermsRequest,
    FrameworkCategoryCode,
    FrameworkCategoryCodesGroup,
    TelemetryObject
} from 'sunbird-sdk';
import { NotificationService } from '../../services/notification.service';
import { EventTopics } from '../app.constant';

describe('ResourcesComponent', () => {
    let resourcesComponent: ResourcesComponent;
    const container = new Container();

    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn(() => of({}))
    };
    const mockSharedPreference: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('en'))
    };
    const mockEventBusService: Partial<EventsBusService> = {};
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {};
    const mockframeworkService: Partial<FrameworkService> = {
        getActiveChannelId: jest.fn()
    };
    const mockContentService: Partial<ContentService> = {
        getContents: jest.fn(() => of([{
            identifier: 'sampleIdentifier',
            contentData: {
                identifier: 'sample_identifier',
                appIcon: 'https:'
            }
        }]))
    };
    const mockSplashScreenDeeplinkActionHandlerDelegate: Partial<SplaschreenDeeplinkActionHandlerDelegate> = {};
    const mockNgZone: Partial<NgZone> = {};
    const mockQRScanner: Partial<SunbirdQRScanner> = {};
    const mockEvents: Partial<Events> = {
        subscribe: jest.fn(() => 'playConfig')
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        selectedBoardMediumGrade: jest.fn(),
        getPageIdForTelemetry: jest.fn(),
        getGuestUserType: jest.fn(),
        getCurrentUser: jest.fn(),
        isUserLoggedIn: jest.fn()
    };
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('Sunbird'))
    };
    const mockNetwork: Partial<Network> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateExtraInfoTelemetry: jest.fn(),
        generateStartSheenAnimationTelemetry: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        convertFileSrc: jest.fn(),
        networkInfo: jest.fn()
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockTranslateService: Partial<TranslateService> = {};
    const mockToastCtrlService: Partial<ToastController> = {};
    const mockMenuController: Partial<MenuController> = {};
    const mockHeaderService: Partial<AppHeaderService> = {
        showHeaderWithBackButton: jest.fn()
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockContentData)
    };
    const mockAppNotificationService: Partial<NotificationService> = {
    };
    const mockChangeRef: Partial<ChangeDetectorRef> = {};

    const constructComponent = () => {
        resourcesComponent = new ResourcesComponent(
            mockProfileService as ProfileServiceImpl,
            mockEventBusService as EventsBusServiceImpl,
            mockFrameworkUtilService as FrameworkUtilService,
            mockframeworkService as FrameworkService,
            mockContentService as ContentServiceImpl,
            mockSharedPreference as SharedPreferences,
            mockSplashScreenDeeplinkActionHandlerDelegate as SplaschreenDeeplinkActionHandlerDelegate,
            mockNgZone as NgZone,
            mockQRScanner as SunbirdQRScanner,
            mockEvents as Events,
            mockAppGlobalService as AppGlobalService,
            mockAppVersion as AppVersion,
            mockNetwork as Network,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockCommonUtilService as CommonUtilService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockTranslateService as TranslateService,
            mockToastCtrlService as ToastController,
            mockMenuController as MenuController,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockChangeRef as ChangeDetectorRef,
            mockAppNotificationService as NotificationService
        );
    };
    beforeAll(() => {
        constructComponent();
    });
    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should create instance of ResourceComponent', () => {
        expect(resourcesComponent).toBeTruthy();
    });

    it('should call relevant services when subscribeUtility() called upon', (done) => {
        // arrange
        mockQRScanner.startScanner = jest.fn();
        jest.spyOn(resourcesComponent, 'getGroupByPage').mockImplementation();
        jest.spyOn(resourcesComponent, 'loadRecentlyViewedContent').mockImplementation();
        jest.spyOn(resourcesComponent, 'getLocalContent').mockImplementation();
        jest.spyOn(resourcesComponent, 'getPopularContent').mockImplementation();
        jest.spyOn(resourcesComponent, 'swipeDownToRefresh').mockImplementation();
        mockProfileService.getActiveSessionProfile = jest.fn((profile) => {
            return of(profile);
        });
        mockTelemetryGeneratorService.generateStartSheenAnimationTelemetry = jest.fn();
        mockAppGlobalService.setSelectedBoardMediumGrade = jest.fn();
        mockAppGlobalService.openPopover = jest.fn();
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockContentService.searchContentGroupedByPageSection = jest.fn(() => {
            of({
                name: 'sample_name', sections: {
                    count: 2, name: 'sample_string', contents: 2,
                }
            });
        });
        mockEvents.subscribe = jest.fn((topic, fn) => {
            if (topic === 'savedResources:update') {
                fn({ update: 'sample_update_result' });
            }

            if (topic === 'event:showScanner') {
                fn({ pageName: 'library' });
            }
            if (topic === 'onAfterLanguageChange:update') {
                fn({ selectedLanguage: 'ur' });
                resourcesComponent.selectedLanguage = 'ur';
            }

            if (topic === 'app-global:profile-obj-changed') {
                fn();
            }
            if (topic === 'force_optional_upgrade') {
                fn({ upgrade: 'sample_result' });
                mockAppGlobalService.openPopover = jest.fn(() => Promise.resolve());
                resourcesComponent.isUpgradePopoverShown = true;
            }
        });
        // act
        resourcesComponent.subscribeUtilityEvents();
        // assert
        setTimeout(() => {
            expect(mockEvents.subscribe).toHaveBeenCalled();
            expect(resourcesComponent.loadRecentlyViewedContent).toHaveBeenCalled();
            expect(resourcesComponent.getLocalContent).toHaveBeenCalled();
            expect(resourcesComponent.getPopularContent).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should getActive ChannelId when getActiveChannelId()', (done) => {
        // arrange
        mockframeworkService.getActiveChannelId = jest.fn(() => {
            return of('sample_channel');
        });
        // act
        resourcesComponent.getChannelId();
        setTimeout(() => {
            // assert
            expect(mockframeworkService.getActiveChannelId).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should configure and set details of board, medium and class when getPopularContent() is called', (done) => {
        // arrange
        jest.spyOn(resourcesComponent, 'getGroupByPage').mockImplementation();
        jest.spyOn(mockTelemetryGeneratorService, 'generateStartSheenAnimationTelemetry').mockImplementation();
        spyOn(mockframeworkService, 'getActiveChannelId').and.returnValue(of('sample_channelId'));
        // act
        resourcesComponent.getChannelId();
        resourcesComponent.getPopularContent(false);
        // assert
        setTimeout(() => {
            expect(resourcesComponent.getGroupByPage).toHaveBeenCalled();
            expect(resourcesComponent.getGroupByPageReq.board).toBe(undefined);
            expect(resourcesComponent.getGroupByPageReq.channel).toEqual(
                (expect.arrayContaining(['sample_channelId'])));
            done();
        }, 0);
    });

    describe('getGroupByPage', () => {
        it('should convert the courseLogoUrl if it is there in the content', (done) => {
            // arrange
            const request: ContentSearchCriteria = {
                searchType: SearchType.SEARCH,
                mode: 'hard',
                board: ['Tripura', 'Assam'],
                medium: ['English', 'Bengali'],
                grade: ['Mathematics', 'Science']
            };
            mockAppGlobalService.setSelectedBoardMediumGrade = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateEndSheenAnimationTelemetry = jest.fn();
            jest.spyOn(resourcesComponent, 'generateExtraInfoTelemetry').mockImplementation();
            mockContentService.searchContentGroupedByPageSection = jest.fn(() => of({
                name: 'sample_name',
                sections: [
                    {
                        contents: [
                            {
                                appIcon: 'https:',
                            }
                        ],
                        name: 'mathematics',
                        display: {
                            name: {
                                en: 'Mathematics'
                            }
                        },
                    },
                ]
            } as ContentsGroupedByPageSection));
            mockCommonUtilService.networkInfo.isNetworkAvailable = true;
            mockNgZone.run = jest.fn((fn) => fn());
            mockCommonUtilService.convertFileSrc = jest.fn(() => 'http://sample.png');
            // act
            resourcesComponent.getPopularContent(false, request);
            resourcesComponent.getGroupByPage(false, false);
            setTimeout(() => {
                // assert
                expect(mockAppGlobalService.setSelectedBoardMediumGrade).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(mockContentService.searchContentGroupedByPageSection).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not convert the courseLogoUrl if it is not there in the content, and skip this step', (done) => {
            // arrange
            const request: ContentSearchCriteria = {
                searchType: SearchType.SEARCH,
                mode: 'hard',
                board: ['Tripura', 'Assam'],
                medium: ['English', 'Bengali'],
                grade: ['Mathematics', 'Science']
            };
            mockAppGlobalService.setSelectedBoardMediumGrade = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateEndSheenAnimationTelemetry = jest.fn();
            jest.spyOn(resourcesComponent, 'generateExtraInfoTelemetry').mockImplementation();
            mockContentService.searchContentGroupedByPageSection = jest.fn(() => of({
                name: 'sample_name',
                sections: [
                    {
                        contents: [
                            {
                                appIcon: 'https:',
                            }
                        ],
                        name: 'mathematics',
                        display: {
                            name: {
                                en: 'Mathematics'
                            }
                        },
                    },
                ]
            } as ContentsGroupedByPageSection));
            mockCommonUtilService.networkInfo.isNetworkAvailable = true;
            mockNgZone.run = jest.fn((fn) => fn());
            const fileSrcStack = [undefined, 'appIcon'];
            mockCommonUtilService.convertFileSrc = jest.fn(() => fileSrcStack.shift());
            // act
            resourcesComponent.getPopularContent(false, request);
            resourcesComponent.getGroupByPage(false, false);
            setTimeout(() => {
                // assert
                expect(mockAppGlobalService.setSelectedBoardMediumGrade).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(mockContentService.searchContentGroupedByPageSection).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should assign white cloud image if content is not locally avaialable and network is not there', (done) => {
            // arrange
            const request: ContentSearchCriteria = {
                searchType: SearchType.SEARCH,
                mode: 'hard',
                board: ['Tripura', 'Assam'],
                medium: ['English', 'Bengali'],
                grade: ['Mathematics', 'Science']
            };
            mockAppGlobalService.setSelectedBoardMediumGrade = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateEndSheenAnimationTelemetry = jest.fn();
            jest.spyOn(resourcesComponent, 'generateExtraInfoTelemetry').mockImplementation();
            mockContentService.searchContentGroupedByPageSection = jest.fn(() => of({
                name: 'sample_name',
                sections: [
                    {
                        contents: [
                            {
                                appIcon: 'https:',
                            }
                        ],
                        name: 'mathematics',
                        display: {
                            name: {
                                en: 'Mathematics'
                            }
                        },
                    },
                ]
            } as ContentsGroupedByPageSection));
            mockCommonUtilService.networkInfo.isNetworkAvailable = false;
            mockNgZone.run = jest.fn((fn) => fn());
            // act
            resourcesComponent.getPopularContent(false, request);
            resourcesComponent.getGroupByPage(false, false);
            setTimeout(() => {
                // assert
                expect(mockAppGlobalService.setSelectedBoardMediumGrade).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(mockContentService.searchContentGroupedByPageSection).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should handle catchPart when getGroupByPageSection() returns an error', (done) => {
            // arrange
            const request: ContentSearchCriteria = {
                searchType: SearchType.SEARCH,
                mode: 'hard',
                board: ['Tripura', 'Assam'],
                medium: ['English', 'Bengali'],
                grade: ['Mathematics', 'Science']
            };
            mockAppGlobalService.setSelectedBoardMediumGrade = jest.fn();
            mockTelemetryGeneratorService.generateEndSheenAnimationTelemetry = jest.fn();
            mockContentService.searchContentGroupedByPageSection = jest.fn(() => {
                return of(Promise.reject('SERVER_ERROR'));
            });
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockNgZone.run = jest.fn((fn) => fn());
            mockCommonUtilService.showToast = jest.fn(() => {
                return 'ERROR_FETCHING_DATA';
            });

            // act
            resourcesComponent.getGroupByPage(false, false);
            setTimeout(() => {
                // assert
                expect(mockAppGlobalService.setSelectedBoardMediumGrade).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(mockContentService.searchContentGroupedByPageSection).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                // expect(mockCommonUtilService.convertFileSrc).toHaveBeenCalledWith('http://sample.path');
                done();
            }, 0);
        });

    });

    it('should call relevant methods inside when ngOnInit() called at the beginning', (done) => {
        // arrange
        resourcesComponent.appliedFilter = 'sample_filter';
        jest.spyOn(resourcesComponent, 'getCurrentUser').mockImplementation();
        jest.spyOn(resourcesComponent, 'scrollToTop').mockImplementation();
        jest.spyOn(resourcesComponent, 'getPopularContent').mockImplementation();
        jest.spyOn(resourcesComponent, 'loadRecentlyViewedContent').mockImplementation();
        const data = jest.fn((fn) => fn());
        mockCommonUtilService.networkAvailability$ = {
            subscribe: data
        } as any;
        mockAppGlobalService.generateConfigInteractEvent = jest.fn();
        mockAppNotificationService.handleNotification = jest.fn(() => Promise.resolve());
        mockEvents.subscribe = jest.fn((topic, fn) => {
            if (topic === EventTopics.TAB_CHANGE) {
                fn('LIBRARY');
            }
            if (resourcesComponent.appliedFilter) {
            }
            if (topic === 'event:update_recently_viewed') {
                fn();
            }
        });
        resourcesComponent.storyAndWorksheets = [{
            contents: [{
                name: 'sunbird',
                appIcon: 'http:appIcon'
            }]
        }];
        mockCommonUtilService.networkInfo.isNetworkAvailable = true;
        mockChangeRef.detectChanges = jest.fn();
        // act
        resourcesComponent.ngOnInit();
        // assert
        setTimeout(() => {
            expect(resourcesComponent.getCurrentUser).toHaveBeenCalled();
            expect(resourcesComponent.scrollToTop).toHaveBeenCalled();
            expect(resourcesComponent.getPopularContent).toHaveBeenCalled();
            expect(resourcesComponent.loadRecentlyViewedContent).toHaveBeenCalled();
            expect(mockAppGlobalService.generateConfigInteractEvent).toHaveBeenCalled();
            expect(mockAppNotificationService.handleNotification).toHaveBeenCalled();
            expect(mockEvents.subscribe).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should appIcon is not avilable', (done) => {
        // arrange
        resourcesComponent.appliedFilter = 'sample_filter';
        jest.spyOn(resourcesComponent, 'getCurrentUser').mockImplementation();
        jest.spyOn(resourcesComponent, 'scrollToTop').mockImplementation();
        jest.spyOn(resourcesComponent, 'getPopularContent').mockImplementation();
        jest.spyOn(resourcesComponent, 'loadRecentlyViewedContent').mockImplementation();
        const data = jest.fn((fn) => fn());
        mockCommonUtilService.networkAvailability$ = {
            subscribe: data
        } as any;
        mockAppGlobalService.generateConfigInteractEvent = jest.fn();
        mockAppNotificationService.handleNotification = jest.fn(() => Promise.resolve());
        mockEvents.subscribe = jest.fn((topic, fn) => {
            if (topic === EventTopics.TAB_CHANGE) {
                fn('LIBRARY');
            }
            if (resourcesComponent.appliedFilter) {
            }
            if (topic === 'event:update_recently_viewed') {
                fn();
            }
        });
        resourcesComponent.storyAndWorksheets = [{
            contents: [{
                name: 'sunbird',
            }]
        }];
        mockCommonUtilService.networkInfo.isNetworkAvailable = true;
        mockChangeRef.detectChanges = jest.fn();
        mockCommonUtilService.convertFileSrc = jest.fn(() => 'http://sample.png');
        // act
        resourcesComponent.ngOnInit();
        // assert
        setTimeout(() => {
            expect(resourcesComponent.getCurrentUser).toHaveBeenCalled();
            expect(resourcesComponent.scrollToTop).toHaveBeenCalled();
            expect(resourcesComponent.getPopularContent).toHaveBeenCalled();
            expect(resourcesComponent.loadRecentlyViewedContent).toHaveBeenCalled();
            expect(mockAppGlobalService.generateConfigInteractEvent).toHaveBeenCalled();
            expect(mockAppNotificationService.handleNotification).toHaveBeenCalled();
            expect(mockEvents.subscribe).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should appIcon is not avilable', (done) => {
        // arrange
        resourcesComponent.appliedFilter = 'sample_filter';
        jest.spyOn(resourcesComponent, 'getCurrentUser').mockImplementation();
        jest.spyOn(resourcesComponent, 'scrollToTop').mockImplementation();
        jest.spyOn(resourcesComponent, 'getPopularContent').mockImplementation();
        jest.spyOn(resourcesComponent, 'loadRecentlyViewedContent').mockImplementation();
        const data = jest.fn((fn) => fn());
        mockCommonUtilService.networkAvailability$ = {
            subscribe: data
        } as any;
        mockAppGlobalService.generateConfigInteractEvent = jest.fn();
        mockAppNotificationService.handleNotification = jest.fn(() => Promise.resolve());
        mockEvents.subscribe = jest.fn((topic, fn) => {
            if (topic === EventTopics.TAB_CHANGE) {
                fn('LIBRARY');
            }
            if (resourcesComponent.appliedFilter) {
            }
            if (topic === 'event:update_recently_viewed') {
                fn();
            }
        });
        resourcesComponent.storyAndWorksheets = [{
            contents: [{
                name: 'sunbird',
            }]
        }];
        mockCommonUtilService.networkInfo.isNetworkAvailable = true;
        mockChangeRef.detectChanges = jest.fn();
        const fileSrcData = [undefined, 'sample'];
        mockCommonUtilService.convertFileSrc = jest.fn(() => fileSrcData.shift());
        // act
        resourcesComponent.ngOnInit();
        // assert
        setTimeout(() => {
            expect(resourcesComponent.getCurrentUser).toHaveBeenCalled();
            expect(resourcesComponent.scrollToTop).toHaveBeenCalled();
            expect(resourcesComponent.getPopularContent).toHaveBeenCalled();
            expect(resourcesComponent.loadRecentlyViewedContent).toHaveBeenCalled();
            expect(mockAppGlobalService.generateConfigInteractEvent).toHaveBeenCalled();
            expect(mockAppNotificationService.handleNotification).toHaveBeenCalled();
            expect(mockEvents.subscribe).toHaveBeenCalled();
            done();
        }, 0);
    });

    // it('should appIcon is not avilable', (done) => {
    //     // arrange
    //     resourcesComponent.appliedFilter = 'sample_filter';
    //     jest.spyOn(resourcesComponent, 'getCurrentUser').mockImplementation();
    //     jest.spyOn(resourcesComponent, 'scrollToTop').mockImplementation();
    //     jest.spyOn(resourcesComponent, 'getPopularContent').mockImplementation();
    //     jest.spyOn(resourcesComponent, 'loadRecentlyViewedContent').mockImplementation();
    //     const data = jest.fn((fn) => fn());
    //     mockCommonUtilService.networkAvailability$ = {
    //         subscribe: data
    //     } as any;
    //     mockAppGlobalService.generateConfigInteractEvent = jest.fn();
    //     mockAppNotificationService.handleNotification = jest.fn(() => Promise.resolve());
    //     mockEvents.subscribe = jest.fn((topic, fn) => {
    //         if (topic === EventTopics.TAB_CHANGE) {
    //             fn('LIBRARY');
    //         }
    //         if (resourcesComponent.appliedFilter) {
    //         }
    //         if (topic === 'event:update_recently_viewed') {
    //             fn();
    //         }
    //     });
    //     resourcesComponent.storyAndWorksheets = [{
    //         contents: [{
    //             name: 'sunbird',
    //         }]
    //     }];
    //     mockCommonUtilService.networkInfo.isNetworkAvailable = true;
    //     mockChangeRef.detectChanges = jest.fn();
    //     const fileSrcData = [undefined, undefined];
    //     mockCommonUtilService.convertFileSrc = jest.fn(() => fileSrcData.shift());
    //     // act
    //     resourcesComponent.ngOnInit();
    //     // assert
    //     setTimeout(() => {
    //         expect(resourcesComponent.getCurrentUser).toHaveBeenCalled();
    //         expect(resourcesComponent.scrollToTop).toHaveBeenCalled();
    //         expect(resourcesComponent.getPopularContent).toHaveBeenCalled();
    //         expect(resourcesComponent.loadRecentlyViewedContent).toHaveBeenCalled();
    //         expect(mockAppGlobalService.generateConfigInteractEvent).toHaveBeenCalled();
    //         expect(mockAppNotificationService.handleNotification).toHaveBeenCalled();
    //         expect(mockEvents.subscribe).toHaveBeenCalled();
    //         done();
    //     }, 0);
    // });

    it('should call qrScanner else if part when subscribeMethod returns emptyString', (done) => {
        // arrange

        jest.spyOn(resourcesComponent, 'getCurrentUser').mockImplementation();
        jest.spyOn(resourcesComponent, 'scrollToTop').mockImplementation();
        mockAppGlobalService.generateConfigInteractEvent = jest.fn();
        mockAppNotificationService.handleNotification = jest.fn(() => Promise.resolve());
        jest.spyOn(mockAppGlobalService, 'getPageIdForTelemetry').mockReturnValue(PageId.LIBRARY);
        mockQRScanner.startScanner = jest.fn();
        mockEvents.subscribe = jest.fn((topic, fn) => {
            if (topic === EventTopics.TAB_CHANGE) {
                fn('');
            }
        });
        // act
        resourcesComponent.ngOnInit();
        // assert
        setTimeout(() => {
            expect(mockEvents.subscribe).toHaveBeenCalled();
            expect(mockQRScanner.startScanner).toHaveBeenCalledWith(PageId.LIBRARY);
            expect(mockAppGlobalService.getPageIdForTelemetry).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should subscribe onBoardingCard completed event when ngAfterViewInit called', (done) => {
        // arrange
        mockEvents.subscribe = jest.fn((topic, fn) => {
            if (topic === 'onboarding-card:completed') {
                fn(true);
            }
        });
        // act
        resourcesComponent.ngAfterViewInit();
        // assert
        setTimeout(() => {
            expect(mockEvents.subscribe).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should check for subscription and unsubscribe all those events when ionViewWillLeave()', (done) => {
        // arrange
        mockHeaderService.showHeaderWithHomeButton = jest.fn();
        jest.spyOn(resourcesComponent, 'getCategoryData').mockImplementation();
        jest.spyOn(resourcesComponent, 'getCurrentUser').mockImplementation();
        jest.spyOn(resourcesComponent, 'getChannelId').mockImplementation();
        jest.spyOn(resourcesComponent, 'getPopularContent').mockImplementation();
        const mockHeaderEventsSubscription = { unsubscribe: jest.fn() } as Partial<Subscription>;
        const mockEventsBusSubscription = { unsubscribe: jest.fn() } as Partial<Subscription>;
        mockEventBusService.events = () => ({
            subscribe: jest.fn(() => mockEventsBusSubscription)
        });
        mockHeaderService.headerEventEmitted$ = {
            subscribe: jest.fn(() => mockHeaderEventsSubscription)
        };
        mockEvents.unsubscribe = jest.fn();
        resourcesComponent.coachTimeout = { clearTimeout: jest.fn() };
        // act
        resourcesComponent.ionViewWillEnter().then(() => {
            resourcesComponent.ionViewWillLeave();

            // assert
            expect(mockEventsBusSubscription.unsubscribe).toHaveBeenCalled();
            expect(mockHeaderEventsSubscription.unsubscribe).toHaveBeenCalled();
            expect(mockEvents.unsubscribe).toHaveBeenCalled();
            done();
        });
    });

    describe('getCurrentUser profile checks ', () => {
        it('should check for guest user based on the that profile will be set to teacher', () => {
            // arrange
            const mockGuestProfile: Profile = {
                uid: 'sample_uid',
                handle: 'Guest',
                profileType: ProfileType.TEACHER,
                board: ['CBSE'],
                grade: ['Class 12'],
                medium: ['English', 'Bengali'],
                source: ProfileSource.LOCAL,
                createdAt: '08.01.2020',
                subject: ['Physics', 'Mathematics']
            };
            resourcesComponent.guestUser = true;
            const profileType = jest.spyOn(mockAppGlobalService, 'getGuestUserType').mockReturnValue(ProfileType.TEACHER);
            jest.spyOn(resourcesComponent, 'loadRecentlyViewedContent').mockImplementation();
            jest.spyOn(resourcesComponent, 'getLocalContent').mockImplementation();
            jest.spyOn(mockAppGlobalService, 'getCurrentUser').mockReturnValue(mockGuestProfile);
            // act
            resourcesComponent.getCurrentUser();
            // assert
            expect(resourcesComponent.getLocalContent).toHaveBeenCalled();
            expect(resourcesComponent.loadRecentlyViewedContent).toHaveBeenCalled();
            expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalledWith();
        });

        it('should check for guest user profileType.STUDENT', () => {
            // arrange
            const mockGuestProfile: Profile = {
                uid: 'sample_uid',
                handle: 'Guest',
                profileType: ProfileType.STUDENT,
                board: ['CBSE'],
                grade: ['Class 12'],
                medium: ['English', 'Bengali'],
                source: ProfileSource.LOCAL,
                createdAt: '08.01.2020',
                subject: ['Physics', 'Mathematics']
            };
            resourcesComponent.guestUser = true;
            const profileType = jest.spyOn(mockAppGlobalService, 'getGuestUserType').mockReturnValue(ProfileType.STUDENT);
            jest.spyOn(resourcesComponent, 'loadRecentlyViewedContent').mockImplementation();
            jest.spyOn(resourcesComponent, 'getLocalContent').mockImplementation();
            jest.spyOn(mockAppGlobalService, 'getCurrentUser').mockReturnValue(mockGuestProfile);
            // act
            resourcesComponent.getCurrentUser();
            // assert
            expect(resourcesComponent.getLocalContent).toHaveBeenCalled();
            expect(resourcesComponent.loadRecentlyViewedContent).toHaveBeenCalled();
            expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalledWith();
        });

        it('should assign audiance filter as loggedIn if current user is loggedIn', () => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            jest.spyOn(resourcesComponent, 'loadRecentlyViewedContent').mockImplementation();
            jest.spyOn(resourcesComponent, 'getLocalContent').mockImplementation();
            jest.spyOn(mockAppGlobalService, 'getCurrentUser').mockImplementation();
            // act
            resourcesComponent.getCurrentUser();
            // assert
            expect(resourcesComponent.audienceFilter).toEqual(['instructor', 'learner']);
            expect(resourcesComponent.getLocalContent).toHaveBeenCalled();
            expect(resourcesComponent.loadRecentlyViewedContent).toHaveBeenCalled();
            expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalledWith();
        });
    });

    describe('NavigateToViewMoreActivity from various pages', () => {
        it('should navigate to viewMoreActivity when user clicked from savedResources', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            // act
            resourcesComponent.navigateToViewMoreContentsPage(resourcesComponent.savedResourcesSection);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalled();
        });
        it('should navigate to ViewMoreAcitvity when user clicked on from recentlyViewed', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            // act
            resourcesComponent.navigateToViewMoreContentsPage(resourcesComponent.recentViewedSection);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalled();
        });
    });

    describe('loadRecentlyViewed test suites', () => {
        it('should call getContents from contentService, then loop eachData and setContentData appIcon', (done) => {
            // arrange
            mockContentService.getContents = jest.fn(() => {
                return of([{
                    identifier: 'sampleIdentifier',
                    contentData: {
                        identifier: 'sample_identifier',
                        appIcon: 'https:'
                    },
                    basePath: 'sample_base_path'
                }]);
            });
            resourcesComponent.showLoader = true;
            mockNgZone.run = jest.fn((fn) => fn());
            mockCommonUtilService.networkInfo.isNetworkAvailable = true;
            constructComponent();
            // act
            resourcesComponent.loadRecentlyViewedContent(false);
            // assert
            setTimeout(() => {
                expect(mockContentService.getContents).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should catch throw error and call sheenEnd telemetry function', (done) => {
            // arrange
            mockContentService.getContents = jest.fn(() => {
                return of(Promise.reject('new Error'));
            });
            mockNgZone.run = jest.fn((fn) => fn());
            resourcesComponent.showLoader = true;
            // act
            resourcesComponent.loadRecentlyViewedContent(false);
            // assert
            setTimeout(() => {
                expect(mockContentService.getContents).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    it('should order result data by Subject', () => {
        // arrange
        const searchResults = [
            {
                name: 'Mathematics'
            }
        ];
        jest.spyOn(resourcesComponent, 'applyProfileFilter').mockReturnValue([
            'Mathematics', 'Physics'
        ]);
        // act
        resourcesComponent.orderBySubject(searchResults);
        // assert
        expect(resourcesComponent.applyProfileFilter).toHaveBeenCalled();
    });

    it('should check for Textbook which is locally Available', () => {
        // arrange
        resourcesComponent.locallyDownloadResources = [
            {
                identifier: 'sample_identifier',
                contentData: {},
                isAvailableLocally: true
            }
        ];
        resourcesComponent.storyAndWorksheets = [
            {
                contents: [{
                    identifier: 'sample_identifier',
                    contentData: {},
                    mimeType: 'sample_mimeType',
                    basePath: 'sampleBasePath',
                    contentType: 'sample_contentType',
                    isAvailableLocally: true
                }]
            }
        ];
        // act
        resourcesComponent.markLocallyAvailableTextBook();
        // assert
        expect(resourcesComponent.locallyDownloadResources).toEqual(resourcesComponent.locallyDownloadResources);
        expect(resourcesComponent.storyAndWorksheets).toEqual(resourcesComponent.storyAndWorksheets);

    });

    it('should generateExtra info telemetry when generateExtraInfo Telemetry() called', () => {
        // arrange
        const mockSectionsCount = [
            {
                contents: [{
                    identifier: 'sample_identifier',
                    contentData: {},
                    mimeType: 'sample_mimeType',
                    basePath: 'sampleBasePath',
                    contentType: 'sample_contentType',
                    isAvailableLocally: true
                }]
            }
        ];
        mockTelemetryGeneratorService.generateExtraInfoTelemetry = jest.fn();
        // act
        resourcesComponent.generateExtraInfoTelemetry(mockSectionsCount.length);
        // assert
        expect(mockTelemetryGeneratorService.generateExtraInfoTelemetry).toHaveBeenCalled();
    });

    it('should filter the profile when applyProfileFilter() called', () => {
        // arrange
        const profileFilterForMedium = ['English', 'Bengali'];
        const assembleFilterForMedium = ['English', 'Bengali'];
        mockAppGlobalService.getNameForCodeInFramework = jest.fn(() => {
            return 'en';
        });
        // act
        resourcesComponent.applyProfileFilter(profileFilterForMedium, assembleFilterForMedium, 'medium');
        // assert
        expect(mockAppGlobalService.getNameForCodeInFramework).toHaveBeenCalled();
    });

    it('should subscribe events and other methods when ionViewWillEnter()', (done) => {
        // arrange
        resourcesComponent.pageLoadedSuccess = false;
        mockHeaderService.showHeaderWithHomeButton = jest.fn();
        mockHeaderService.headerEventEmitted$ = NEVER;
        mockEvents.subscribe = jest.fn((topic, fn) => {
            if (topic === 'update_header') {
                fn();
            }
        });
        jest.spyOn(resourcesComponent, 'getCategoryData').mockImplementation();
        jest.spyOn(resourcesComponent, 'getPopularContent').mockImplementation();
        jest.spyOn(resourcesComponent, 'getCurrentUser').mockImplementation();
        jest.spyOn(resourcesComponent, 'getChannelId').mockImplementation();
        jest.spyOn(resourcesComponent, 'subscribeSdkEvent').mockImplementation();
        // act
        resourcesComponent.ionViewWillEnter().then(() => {
            // assert
            expect(mockHeaderService.showHeaderWithHomeButton).toHaveBeenCalled();
            expect(mockSplashScreenDeeplinkActionHandlerDelegate.isDelegateReady).toEqual(true);
            done();
        });
    });

    it('should subscribe events and other methods when ionViewDidEnter()', (done) => {
        // arrange
        resourcesComponent.coachTimeout = { setTimeout: jest.fn() };
        mockAppGlobalService.showCouchMarkScreen = jest.fn();
        // act
        resourcesComponent.ionViewDidEnter()
        // assert
        setTimeout(() => {
            expect(mockAppGlobalService.showCouchMarkScreen).toHaveBeenCalled();
            done();
        }, 2000);
    });

    it('should call toastCtrller when in offline', (done) => {
        // arrange
        mockToastCtrlService.create = jest.fn(() => {
            return Promise.resolve({
                present: jest.fn(),
                onDidDismiss: jest.fn((fn) => {
                    fn();
                })
            });
        });
        mockCommonUtilService.translateMessage = jest.fn();
        // act
        resourcesComponent.presentToastForOffline('offline');
        // assert
        setTimeout(() => {
            expect(mockToastCtrlService.create).toHaveBeenCalled();
            expect(mockCommonUtilService.translateMessage).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should be invoked classClickEvent', () => {
        // arrange
        const event = { data: { index: 0 } };
        jest.spyOn(resourcesComponent, 'classClickHandler').mockImplementation(() => {
            return;
        });
        // act
        resourcesComponent.classClickEvent(event, true);
    });

    it('should be handle medium click filter', () => {
        // arrange
        jest.spyOn(resourcesComponent, 'generateClassInteractTelemetry').mockImplementation(() => {
            return;
        });
        const scrollIntoView = {
            scrollIntoView: jest.fn()
        } as any;
        // Object.defineProperty(global.document, 'getElementById', {  scrollIntoView: jest.fn() } as any);
        jest.spyOn(document, 'getElementById').mockReturnValue(scrollIntoView);
        resourcesComponent.getGroupByPageReq = { grade: [{ name: 'sample' }] };
        resourcesComponent.currentGrade = 'class-v';
        resourcesComponent.categoryGradeLevelsArray[0] = 'sample';
        resourcesComponent.categoryGradeLevels = [{ selected: 'classAnimate' }];
        // act
        resourcesComponent.classClickHandler(0, true);
        // assert
        expect(resourcesComponent.currentGrade).toBe('sample');
        expect(resourcesComponent.categoryGradeLevelsArray[0]).toBe('sample');
    });

    describe('mediuClickedEvent', () => {
        it('should be invoked mediumClickEvent', () => {
            // arrange
            const event = { data: { index: 0, text: 'sample-text' } };
            jest.spyOn(resourcesComponent, 'mediumClickHandler').mockImplementation(() => {
                return;
            });
            // act
            resourcesComponent.mediumClickEvent(event, true);
        });

        it('should be handle medium click filter', () => {
            // arrange
            jest.spyOn(resourcesComponent, 'generateClassInteractTelemetry').mockImplementation(() => {
                return;
            });
            const scrollIntoView = {
                scrollIntoView: jest.fn()
            } as any;
            // Object.defineProperty(global.document, 'getElementById', {  scrollIntoView: jest.fn() } as any);
            jest.spyOn(document, 'getElementById').mockReturnValue(scrollIntoView);
            resourcesComponent.getGroupByPageReq = { medium: [{ name: 'sample' }] };
            resourcesComponent.currentMedium = 'hindi';
            resourcesComponent.categoryGradeLevelsArray[0] = 'sample';
            resourcesComponent.categoryMediumNamesArray = ['sample-text'];
            // act
            resourcesComponent.mediumClickHandler(0, 'sample-text', true);
            // assert
            expect(resourcesComponent.currentGrade).toBe('sample');
            expect(resourcesComponent.categoryGradeLevelsArray[0]).toBe('sample');
        });
    });

    it('should fetch all the grade level data based on framework data from the api and call classclickHandler if found', () => {
        // arrange
        const frameworkId = 'frame-id';
        const categories = {};

        const req: GetFrameworkCategoryTermsRequest = {
            currentCategoryCode: 'gradeLevel',
            language: undefined,
            requiredCategories: {},
            frameworkId
        };
        mockFrameworkUtilService.getFrameworkCategoryTerms = jest.fn(() => of([{ name: 'sunbird' }]));
        jest.spyOn(resourcesComponent, 'classClickHandler').mockImplementation(() => {
            return;
        });
        resourcesComponent.getGroupByPageReq = {
            grade: ['sunbird']
        };
        // act
        resourcesComponent.getGradeLevelData(frameworkId, categories);

        // assert
        expect(mockFrameworkUtilService.getFrameworkCategoryTerms).toHaveBeenLastCalledWith(req);

    });

    it('should fetch all the grade level data based on framework data from the api and do not call classclickHandler if not found', () => {
        // arrange
        const frameworkId = 'frame-id';
        const categories = {};

        const req: GetFrameworkCategoryTermsRequest = {
            currentCategoryCode: 'gradeLevel',
            language: undefined,
            requiredCategories: {},
            frameworkId
        };
        mockFrameworkUtilService.getFrameworkCategoryTerms = jest.fn(() => of([{ name: 'sunbird1' }]));
        jest.spyOn(resourcesComponent, 'classClickHandler').mockImplementation(() => {
            return;
        });
        resourcesComponent.getGroupByPageReq = {
            grade: ['sunbird-not-matched']
        };
        // act
        resourcesComponent.getGradeLevelData(frameworkId, categories);

        // assert
        expect(mockFrameworkUtilService.getFrameworkCategoryTerms).toHaveBeenLastCalledWith(req);

    });

    it('should call recentlyViewedCardClick method and perform navigation to collection details page if mimetype is collection', () => {
        // arrange
        const event = {
            data: {
                identifier: 'do_123456789',
                mimeType: 'application/vnd.ekstep.content-collection',
                contentType: 'sample-content-type'
            }
        };
        const course = {
            isAvailableLocally: true,
            mimeType: 'application/vnd.ekstep.content-collection'
        };

        const telemetryObject: Partial<TelemetryObject> = {
            id: 'do_123456789',
            type: 'sample-content-type',
            version: ''
        };
        const values = {
            sectionName: 'Recently Viewed',
            positionClicked: undefined
        };
        mockTelemetryGeneratorService.isCollection = jest.fn(() => true);
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        resourcesComponent.recentlyViewedCardClick(event, course);
        // assert
        expect(mockTelemetryGeneratorService.isCollection).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            'TOUCH',
            'content-clicked',
            'home',
            'library',
            telemetryObject,
            values
        );
    });
    it('should call recentlyViewedCardClick method and perform navigation to content details page if mimetype is non collection', () => {
        // arrange
        const event = {
            data: {
                identifier: 'do_123456789',
                mimeType: 'application/vnd.ekstep.content-collection',
                contentType: 'sample-content-type'
            }
        };
        const course = {
            isAvailableLocally: true,
            mimeType: 'vide0/mp4'
        };

        const telemetryObject: Partial<TelemetryObject> = {
            id: 'do_123456789',
            type: 'sample-content-type',
            version: ''
        };
        const values = {
            sectionName: 'Recently Viewed',
            positionClicked: undefined
        };
        mockTelemetryGeneratorService.isCollection = jest.fn(() => true);
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        resourcesComponent.recentlyViewedCardClick(event, course);
        // assert
        expect(mockTelemetryGeneratorService.isCollection).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            'TOUCH',
            'content-clicked',
            'home',
            'library',
            telemetryObject,
            values
        );
    });

    it('should check for subscription and unsubscribe all those events on ngOnDestroy()', () => {
        // arrange
        resourcesComponent.networkSubscription = true;
        resourcesComponent.networkSubscription = {
            unsubscribe: jest.fn()
        };

        // act
        resourcesComponent.ngOnDestroy();

        // assert
        expect(resourcesComponent.networkSubscription.unsubscribe).toHaveBeenCalled();
    });
});
