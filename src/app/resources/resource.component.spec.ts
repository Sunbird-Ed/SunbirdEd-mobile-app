import {ResourcesComponent} from '@app/app/resources/resources.component';
import {
    ContentEventType,
    ContentSearchCriteria,
    ContentService,
    ContentsGroupedByPageSection,
    EventsBusService,
    FrameworkService,
    FrameworkUtilService,
    GetFrameworkCategoryTermsRequest,
    Profile,
    ProfileService,
    ProfileServiceImpl,
    ProfileSource,
    ProfileType,
    SearchType,
    SharedPreferences,
} from 'sunbird-sdk';
import {EventsBusServiceImpl} from 'sunbird-sdk/events-bus/impl/events-bus-service-impl';
import {ContentServiceImpl} from 'sunbird-sdk/content/impl/content-service-impl';
import {ChangeDetectorRef, NgZone} from '@angular/core';
import {
    AppGlobalService,
    AppHeaderService,
    CommonUtilService,
    Environment,
    FormAndFrameworkUtilService,
    InteractSubtype,
    InteractType,
    NotificationService,
    PageId,
    SunbirdQRScanner,
    TelemetryGeneratorService,
    ProfileHandler
} from '@app/services';
import {Events, MenuController, PopoverController, ToastController} from '@ionic/angular';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {Network} from '@ionic-native/network/ngx';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {SplaschreenDeeplinkActionHandlerDelegate} from '@app/services/sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import {mockContentData} from '@app/app/content-details/content-details.page.spec.data';
import {NEVER, of, Subscription} from 'rxjs';
import {ContentFilterConfig, EventTopics, PreferenceKey, RouterLinks, ViewMore} from '../app.constant';
import {ImpressionType} from '../../services/telemetry-constants';
import {NavigationService} from '../../services/navigation-handler.service';
import {FrameworkSelectionDelegateService} from '../profile/framework-selection/framework-selection.page';
import { FormService } from '@project-sunbird/sunbird-sdk';
import { ContentAggregatorHandler } from '../../services/content/content-aggregator-handler.service';

describe('ResourcesComponent', () => {
    let resourcesComponent: ResourcesComponent;

    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn(() => of({profileType: 'Student'}))
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
        networkInfo: {
            isNetworkAvailable: true
        },
        isAccessibleForNonStudentRole: jest.fn(),
        presentToastForOffline: jest.fn()
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
    const mockAppNotificationService: Partial<NotificationService> = {};
    const mockChangeRef: Partial<ChangeDetectorRef> = {};
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockNavService: Partial<NavigationService> = {
        navigateToCollection: jest.fn(),
        navigateToDetailPage: jest.fn()
    };
    const mockFrameworkSelectionDelegateService: Partial<FrameworkSelectionDelegateService> = {
        delegate: {
            onFrameworkSelectionSubmit: jest.fn()
        }
    };
    const mockFormService: Partial<FormService> = {};
    const mockContentAggregatorHandler: Partial<ContentAggregatorHandler> = {};
    const mockProfileHandler: Partial<ProfileHandler> = {
        getAudience: jest.fn(() => Promise.resolve(['Student']))
    };

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
            mockNavService as NavigationService,
            mockRouter as Router,
            mockChangeRef as ChangeDetectorRef,
            mockAppNotificationService as NotificationService,
            mockPopoverCtrl as PopoverController,
            mockFrameworkSelectionDelegateService as FrameworkSelectionDelegateService,
            mockContentAggregatorHandler as ContentAggregatorHandler,
            mockProfileHandler as ProfileHandler
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
        jest.spyOn(resourcesComponent, 'getLocalContent').mockImplementation();
        jest.spyOn(resourcesComponent, 'getPopularContent').mockImplementation();
        jest.spyOn(resourcesComponent, 'swipeDownToRefresh').mockImplementation();
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

    it('should fetch channelId only when board is not available', (done) => {
        // arrange
        resourcesComponent.profile = {
            uid: 'sample_uid',
            handle: 'Guest',
            profileType: ProfileType.TEACHER,
            board: undefined,
            grade: ['Class 12'],
            medium: ['English', 'Bengali'],
            source: ProfileSource.LOCAL,
            createdAt: '08.01.2020',
            subject: ['Physics', 'Mathematics']
        };
        jest.spyOn(resourcesComponent, 'getGroupByPage').mockImplementation();
        jest.spyOn(mockTelemetryGeneratorService, 'generateStartSheenAnimationTelemetry').mockImplementation();
        spyOn(mockframeworkService, 'getActiveChannelId').and.returnValue(of('sample_channelId'));
        mockAppGlobalService.getNameForCodeInFramework = jest.fn();
        // act
        resourcesComponent.getChannelId();
        resourcesComponent.getPopularContent(false, resourcesComponent.profile);
        // assert
        setTimeout(() => {
            expect(resourcesComponent.getGroupByPage).toHaveBeenCalled();
            expect(resourcesComponent.getGroupByPageReq.board).toBe(undefined);
            expect(resourcesComponent.getGroupByPageReq.channel).toEqual(expect.arrayContaining(['sample_channelId']));
            done();
        }, 0);
    });

    it('should configure and set details of board, medium and class when getPopularContent() is called', (done) => {
        // arrange
        resourcesComponent.profile = {
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
        jest.spyOn(resourcesComponent, 'getGroupByPage').mockImplementation();
        jest.spyOn(mockTelemetryGeneratorService, 'generateStartSheenAnimationTelemetry').mockImplementation();
        spyOn(mockframeworkService, 'getActiveChannelId').and.returnValue(of('sample_channelId'));
        mockAppGlobalService.getNameForCodeInFramework = jest.fn();
        // act
        resourcesComponent.getChannelId();
        resourcesComponent.getPopularContent(false);
        // assert
        setTimeout(() => {
            expect(resourcesComponent.getGroupByPage).toHaveBeenCalled();
            expect(resourcesComponent.getGroupByPageReq.board).toEqual(['CBSE']);
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
            jest.spyOn(resourcesComponent, 'getCategoryData').mockImplementation();
            mockContentService.buildContentAggregator = jest.fn(() => ({
                handle: jest.fn(() => of({
                    title: JSON.stringify({en: 'TV Programs'}),
                    orientation: 'horizontal',
                    section: {
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
                    }
                }))
            }));
            mockContentAggregatorHandler.aggregate = jest.fn(() => Promise.resolve([{
                title: JSON.stringify({en: 'TV Programs'}),
                orientation: 'horizontal',
                section: {
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
                }
            }]));
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
                expect(mockNgZone.run).toHaveBeenCalled();
                expect(mockContentAggregatorHandler.aggregate).toHaveBeenCalled();
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
            jest.spyOn(resourcesComponent, 'getCategoryData').mockImplementation();
            mockContentAggregatorHandler.aggregate = jest.fn(() => Promise.resolve([{
                title: JSON.stringify({en: 'Digital Books'}),
                orientation: 'vertical',
                section: {
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
                    ],
                    combination: {
                        gradeLevel: ['class 1', 'class 2']
                    }
                }
            }]));
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
                expect(mockContentAggregatorHandler.aggregate).toHaveBeenCalled();
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
            jest.spyOn(resourcesComponent, 'getCategoryData').mockImplementation();
            jest.spyOn(resourcesComponent, 'generateExtraInfoTelemetry').mockImplementation();
            mockContentAggregatorHandler.aggregate = jest.fn(() => Promise.resolve([{
                title: JSON.stringify({en: 'Digital Books'}),
                orientation: 'vertical',
                section: {
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
                }
            }] as ContentsGroupedByPageSection));
            mockCommonUtilService.networkInfo.isNetworkAvailable = false;
            mockNgZone.run = jest.fn((fn) => fn());
            // act
            resourcesComponent.getPopularContent(false, request);
            resourcesComponent.getGroupByPage(false, false);
            setTimeout(() => {
                // assert
                expect(mockAppGlobalService.setSelectedBoardMediumGrade).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(mockContentAggregatorHandler.aggregate).toHaveBeenCalled();
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
            mockContentAggregatorHandler.aggregate = jest.fn(() => undefined);
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
                expect(mockContentAggregatorHandler.aggregate).toHaveBeenCalled();
                done();
            }, 0);
        });

    });

    it('should call relevant methods inside when ngOnInit() called at the beginning', (done) => {
        // arrange
        mockSharedPreference.getBoolean = jest.fn(() => of(false));
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        jest.spyOn(resourcesComponent, 'getCurrentUser').mockImplementation();
        jest.spyOn(resourcesComponent, 'scrollToTop').mockImplementation();
        jest.spyOn(resourcesComponent, 'getPopularContent').mockImplementation();
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
            expect(mockSharedPreference.getBoolean).toHaveBeenCalledWith(PreferenceKey.COACH_MARK_SEEN);
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.PAGE_REQUEST, '',
                PageId.LIBRARY,
                Environment.ONBOARDING
            );
            expect(resourcesComponent.getCurrentUser).toHaveBeenCalled();
            expect(resourcesComponent.scrollToTop).toHaveBeenCalled();
            expect(mockAppGlobalService.generateConfigInteractEvent).toHaveBeenCalled();
            expect(mockAppNotificationService.handleNotification).toHaveBeenCalled();
            expect(mockEvents.subscribe).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should appIcon is not avilable', (done) => {
        // arrange
        mockSharedPreference.getBoolean = jest.fn(() => of(true));
        jest.spyOn(resourcesComponent, 'getCurrentUser').mockImplementation();
        jest.spyOn(resourcesComponent, 'scrollToTop').mockImplementation();
        jest.spyOn(resourcesComponent, 'getPopularContent').mockImplementation();
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
            expect(mockSharedPreference.getBoolean).toHaveBeenCalledWith(PreferenceKey.COACH_MARK_SEEN);
            expect(resourcesComponent.getCurrentUser).toHaveBeenCalled();
            expect(resourcesComponent.scrollToTop).toHaveBeenCalled();
            expect(mockAppGlobalService.generateConfigInteractEvent).toHaveBeenCalled();
            expect(mockAppNotificationService.handleNotification).toHaveBeenCalled();
            expect(mockEvents.subscribe).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should appIcon is not avilable', (done) => {
        // arrange
        mockSharedPreference.getBoolean = jest.fn(() => of(true));
        jest.spyOn(resourcesComponent, 'getCurrentUser').mockImplementation();
        jest.spyOn(resourcesComponent, 'scrollToTop').mockImplementation();
        jest.spyOn(resourcesComponent, 'getPopularContent').mockImplementation();
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
            expect(mockSharedPreference.getBoolean).toHaveBeenCalledWith(PreferenceKey.COACH_MARK_SEEN);
            expect(resourcesComponent.getCurrentUser).toHaveBeenCalled();
            expect(resourcesComponent.scrollToTop).toHaveBeenCalled();
            expect(mockAppGlobalService.generateConfigInteractEvent).toHaveBeenCalled();
            expect(mockAppNotificationService.handleNotification).toHaveBeenCalled();
            expect(mockEvents.subscribe).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should call qrScanner else if part when subscribeMethod returns emptyString', (done) => {
        // arrange
        mockSharedPreference.getBoolean = jest.fn(() => of(true));
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
            expect(mockSharedPreference.getBoolean).toHaveBeenCalledWith(PreferenceKey.COACH_MARK_SEEN);
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
        resourcesComponent.refresher = { disabled: false };
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
        mockSharedPreference.getBoolean = jest.fn(() => of(false));
        mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
        // act
        resourcesComponent.ionViewWillEnter().then(() => {
            resourcesComponent.ionViewWillLeave();

            // assert
            expect(mockEventsBusSubscription.unsubscribe).toHaveBeenCalled();
            expect(mockHeaderEventsSubscription.unsubscribe).toHaveBeenCalled();
            expect(mockEvents.unsubscribe).toHaveBeenCalled();
            expect(mockSharedPreference.getBoolean).toHaveBeenCalledWith(PreferenceKey.COACH_MARK_SEEN);
            expect(mockTelemetryGeneratorService.generatePageLoadedTelemetry).toHaveBeenCalledWith(
                PageId.LIBRARY,
                Environment.ONBOARDING
            );
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
            jest.spyOn(resourcesComponent, 'getLocalContent').mockImplementation();
            jest.spyOn(mockAppGlobalService, 'getCurrentUser').mockReturnValue(mockGuestProfile);
            // act
            resourcesComponent.getCurrentUser();
            // assert
            expect(resourcesComponent.getLocalContent).toHaveBeenCalled();
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
            jest.spyOn(resourcesComponent, 'getLocalContent').mockImplementation();
            jest.spyOn(mockAppGlobalService, 'getCurrentUser').mockReturnValue(mockGuestProfile);
            // act
            resourcesComponent.getCurrentUser();
            // assert
            expect(resourcesComponent.getLocalContent).toHaveBeenCalled();
            expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalledWith();
        });

        it('should assign audiance filter as loggedIn if current user is loggedIn', () => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            jest.spyOn(resourcesComponent, 'getLocalContent').mockImplementation();
            jest.spyOn(mockAppGlobalService, 'getCurrentUser').mockImplementation();
            // act
            resourcesComponent.getCurrentUser();
            // assert
            expect(resourcesComponent.audienceFilter).toEqual(['instructor', 'learner']);
            expect(resourcesComponent.getLocalContent).toHaveBeenCalled();
            expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalledWith();
        });
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

    it('should subscribe events and other methods when ionViewWillEnter()', (done) => {
        // arrange
        resourcesComponent.refresher = { disabled: false };
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
        mockSharedPreference.getBoolean = jest.fn(() => of(true));
        // act
        resourcesComponent.ionViewWillEnter().then(() => {
            // assert
            expect(mockHeaderService.showHeaderWithHomeButton).toHaveBeenCalled();
            expect(mockSplashScreenDeeplinkActionHandlerDelegate.isDelegateReady).toEqual(true);
            expect(mockSharedPreference.getBoolean).toHaveBeenCalled();
            done();
        });
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

    it('should handle else part when index does not match and classClicked is false ', () => {
        // arrange
        resourcesComponent.currentGrade = undefined;
        resourcesComponent.categoryGradeLevels = [{ selected: ' ' }];
        resourcesComponent.categoryGradeLevelsArray[0] = 'sample';
        // act
        resourcesComponent.classClickHandler(undefined, false);
        // assert
        expect(resourcesComponent.currentGrade).toBe(undefined);
    });

    // it('should be handle medium click filter', () => {
    //     // arrange
    //     jest.spyOn(resourcesComponent, 'generateClassInteractTelemetry').mockImplementation(() => {
    //         return;
    //     });
    //     const scrollIntoView = {
    //         scrollIntoView: jest.fn()
    //     } as any;
    //     // Object.defineProperty(global.document, 'getElementById', {  scrollIntoView: jest.fn() } as any);
    //     jest.spyOn(document, 'getElementById').mockReturnValue(scrollIntoView);
    //     resourcesComponent.getGroupByPageReq = { grade: [{ name: 'sample' }] };
    //     resourcesComponent.currentGrade = 'class-v';
    //     resourcesComponent.categoryGradeLevelsArray[0] = 'sample';
    //     resourcesComponent.categoryGradeLevels = [{ selected: 'classAnimate' }];
    //     // act
    //     resourcesComponent.classClickHandler(0, true);
    //     // assert
    //     expect(resourcesComponent.currentGrade).toBe('sample');
    //     expect(resourcesComponent.categoryGradeLevelsArray[0]).toBe('sample');
    // });

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

        // it('should be handle medium click filter', (done) => {
        //     // arrange
        //     jest.spyOn(resourcesComponent, 'generateClassInteractTelemetry').mockImplementation(() => {
        //         return;
        //     });
        //     const scrollIntoView = {
        //         scrollIntoView: jest.fn()
        //     } as any;
        //     // Object.defineProperty(global.document, 'getElementById', {  scrollIntoView: jest.fn() } as any);
        //     jest.spyOn(document, 'getElementById').mockReturnValue(scrollIntoView);
        //     resourcesComponent.getGroupByPageReq = { medium: [{ name: 'sample' }] };
        //     resourcesComponent.currentMedium = 'hindi';
        //     resourcesComponent.categoryGradeLevelsArray[0] = 'sample';
        //     resourcesComponent.categoryMediumNamesArray = ['sample-text'];
        //     resourcesComponent['profile'] = { profileType: 'Student'};
        //     // act
        //     // assert
        //     setTimeout(() => {
        //         expect(resourcesComponent.currentGrade).toBe('sample');
        //         expect(resourcesComponent.categoryGradeLevelsArray[0]).toBe('sample');
        //         done();
        //     }, 1000);
        // });
    });

    describe('getGradeLevelData', () => {
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
            resourcesComponent.searchGroupingContents = {
                combination: {
                    gradeLevel: 'class 1'
                }
            };
            resourcesComponent.categoryGradeLevelsArray = ['class 1', 'class 2'];
            // act
            resourcesComponent.getGradeLevelData(frameworkId, categories);

            // assert
            expect(mockFrameworkUtilService.getFrameworkCategoryTerms).toHaveBeenLastCalledWith(req);

        });

        it('should fetch all the grade level data based on framework data from the api and call classclickHandler if not found', () => {
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
            resourcesComponent.searchGroupingContents = {
                combination: {
                    gradeLevel: undefined
                }
            };
            resourcesComponent.getGroupByPageReq = {
                grade: ['class 1']
            };
            resourcesComponent.categoryGradeLevelsArray = ['class 1', 'class 2'];
            // act
            resourcesComponent.getGradeLevelData(frameworkId, categories);

            // assert
            expect(mockFrameworkUtilService.getFrameworkCategoryTerms).toHaveBeenLastCalledWith(req);

        });
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

    it('should subscribe events and check for payload', (done) => {
        // arrange
        mockEventBusService.events = jest.fn(() => of({
            payload: { currentCount: 1, totalCount: 10 },
            type: ContentEventType.IMPORT_COMPLETED,

        }));
        jest.spyOn(resourcesComponent, 'getLocalContent').mockImplementation();
        // act
        resourcesComponent.subscribeSdkEvent();
        // assert
        setTimeout(() => {
            expect(mockEventBusService.events).toHaveBeenCalled();
            done();
        }, 0);
    });

    describe('swipeDownToRefresh', () => {
        it('calls getCurrentUser and getCategoryData when called upon', (done) => {
            // arrange
            const refresher = { target: { complete: jest.fn() } };
            jest.spyOn(resourcesComponent, 'getCurrentUser').mockImplementation();
            mockTelemetryGeneratorService.generatePullToRefreshTelemetry = jest.fn();
            jest.spyOn(resourcesComponent, 'getGroupByPage').mockImplementation();
            // act
            resourcesComponent.swipeDownToRefresh(refresher);
            // assert
            setTimeout(() => {
                expect(resourcesComponent.getCurrentUser).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generatePullToRefreshTelemetry).toHaveBeenCalledWith(
                    PageId.LIBRARY, Environment.HOME
                );
                expect(resourcesComponent.getGroupByPage).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should call getPopular content if refresh is undefined', (done) => {
            // arrange
            const refresher = undefined;
            jest.spyOn(resourcesComponent, 'getCategoryData').mockImplementation();
            jest.spyOn(resourcesComponent, 'getCurrentUser').mockImplementation();
            jest.spyOn(resourcesComponent, 'getPopularContent').mockImplementation();
            // act
            resourcesComponent.swipeDownToRefresh(refresher);
            // assert
            setTimeout(() => {
                expect(resourcesComponent.getPopularContent).toHaveBeenCalledWith(false, null);
                done();
            }, 0);
        });
    });

    it('should generate interact telemetry and call QR scanner service when called upon', (done) => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockQRScanner.startScanner = jest.fn(() => Promise.resolve('qr_scanner called'));
        // act
        resourcesComponent.scanQRCode();
        // assert
        setTimeout(() => {
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.QRCodeScanClicked,
                Environment.HOME,
                PageId.LIBRARY
            );
            expect(mockQRScanner.startScanner).toHaveBeenCalledWith(PageId.LIBRARY);
            done();
        }, 0);
    });

    it('should navigate, getFilteredConfig and navigate to search page', (done) => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockFormAndFrameworkUtilService.getSupportedContentFilterConfig = jest.fn(() => Promise.resolve('supported_config'));
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));
        // act
        resourcesComponent.search();
        // assert
        setTimeout(() => {
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.SEARCH_BUTTON_CLICKED,
                Environment.HOME,
                PageId.LIBRARY
            );
            expect(mockFormAndFrameworkUtilService.getSupportedContentFilterConfig)
                .toHaveBeenCalledWith(ContentFilterConfig.NAME_LIBRARY);
            expect(mockRouter.navigate).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should fetch current user data and call board, medium and grade methods ', () => {
        // arrange
        mockAppGlobalService.getCurrentUser = jest.fn(() => ['sample_syllabus']);
        jest.spyOn(resourcesComponent, 'getMediumData').mockImplementation();
        jest.spyOn(resourcesComponent, 'getGradeLevelData').mockImplementation();
        jest.spyOn(resourcesComponent, 'getSubjectData').mockImplementation();
        // act
        resourcesComponent.getCategoryData();
        // assert
        expect(resourcesComponent.getMediumData).toHaveBeenCalled();
        expect(resourcesComponent.getGradeLevelData).toHaveBeenCalled();
        expect(resourcesComponent.getSubjectData).toHaveBeenCalled();
    });

    it('should fetch framework category terms and set into subjects ', () => {
        // arrange
        mockFrameworkUtilService.getFrameworkCategoryTerms = jest.fn(() => of());
        // act
        resourcesComponent.getSubjectData();
        // assert
        expect(mockFrameworkUtilService.getFrameworkCategoryTerms).toHaveBeenCalled();
    });

    it('should fetch medium data from framework category ', (done) => {
        // arrange
        mockFrameworkUtilService.getFrameworkCategoryTerms = jest.fn(() => of(['sample_data']));
        jest.spyOn(resourcesComponent, 'arrangeMediumsByUserData').mockImplementation();
        // act
        resourcesComponent.getMediumData();
        // assert
        setTimeout(() => {
            expect(mockFrameworkUtilService.getFrameworkCategoryTerms).toHaveBeenCalled();
            expect(resourcesComponent.arrangeMediumsByUserData).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should generate an interact telemetry when clicked on class', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        resourcesComponent.generateClassInteractTelemetry('class 6', 'class 5');
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.CLASS_CLICKED,
            Environment.HOME,
            PageId.LIBRARY,
            undefined,
            { currentSelected: 'class 6', previousSelected: 'class 5' }
        );
    });

    it('should generate interact telemetry when content clicked and check if network available which is' +
        ' set true then navigate to collection etb', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.networkInfo.isNetworkAvailable = true;
            mockRouter.navigate = jest.fn();
            // act
            resourcesComponent.navigateToDetailPage({
                data: { subject: 'mathematics part 1', isAvailableLocally: true },
                index: 0
            }, 'mathematics');
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.CONTENT_CLICKED,
                Environment.HOME, PageId.LIBRARY, { id: undefined, type: undefined, version: '' },
                { positionClicked: 0, sectionName: 'mathematics' }, { l1: undefined }, [{ id: 'mathematics', type: 'Section' }]);
            expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBe(true);
            expect(mockNavService.navigateToDetailPage).toHaveBeenCalled();
        });

    it('should cover else part after interact event called and check network availability' +
        ' which is set to false and call offline toast method', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.networkInfo.isNetworkAvailable = false;
            mockRouter.navigate = jest.fn();
            // act
            resourcesComponent.navigateToDetailPage({
                data: { subject: 'mathematics part 1', isAvailableLocally: false },
                index: 0
            }, 'mathematics');
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.CONTENT_CLICKED,
                Environment.HOME, PageId.LIBRARY, { id: undefined, type: undefined, version: '' },
                { positionClicked: 0, sectionName: 'mathematics' }, { l1: undefined }, [{ id: 'mathematics', type: 'Section' }]);
            expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBe(false);
        });

    it('should generate interact telemetry when textbook is clicked and also check for network available which is set to true ', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockCommonUtilService.networkInfo.isNetworkAvailable = true;
        mockRouter.navigate = jest.fn();
        // act
        resourcesComponent.navigateToTextbookPage({
            contentId: 'sample_doId', identifier: 'do_id1234', contentType: 'textbook',
            isAvailableLocally: true
        }, 'mathematics');
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.VIEW_MORE_CLICKED,
            Environment.HOME,
            PageId.LIBRARY,
            { id: 'do_id1234', type: 'textbook', version: '' });
        expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBe(true);
        expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should generate interact event and check of network availabilty which is set to false', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockCommonUtilService.networkInfo.isNetworkAvailable = false;
        mockRouter.navigate = jest.fn();
        // act
        resourcesComponent.navigateToTextbookPage({ identifier: 'do_id1234', contentType: 'textbook' },
            'mathematics');
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.VIEW_MORE_CLICKED,
            Environment.HOME,
            PageId.LIBRARY,
            { id: 'do_id1234', type: 'textbook', version: '' });
        expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBe(false);
    });

    it('should navigate to content player when launch contentPlayer called upon', () => {
        // arrange
        mockRouter.navigate = jest.fn();
        // act
        resourcesComponent.launchContent();
        // assert
        expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.PLAYER]);
    });

    it('should generate interact event and navigate to active downloads page', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockRouter.navigate = jest.fn();
        // act
        resourcesComponent.redirectToActivedownloads();
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.ACTIVE_DOWNLOADS_CLICKED,
            Environment.HOME,
            PageId.LIBRARY);
        expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.ACTIVE_DOWNLOADS]);
    });

    it('should generate interact event and navigate to notifications page', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockRouter.navigate = jest.fn();
        // act
        resourcesComponent.redirectToNotifications();
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.NOTIFICATION_CLICKED,
            Environment.HOME,
            PageId.LIBRARY);
        expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.NOTIFICATION]);
    });

    describe('handle headerEvents cases', () => {
        it('should call search method when event name is equal search', () => {
            // arrange
            jest.spyOn(resourcesComponent, 'search').mockImplementation();
            // act
            resourcesComponent.handleHeaderEvents({ name: 'search' });
            // assert
            expect(resourcesComponent.search).toHaveBeenCalled();
        });

        it('should call activeDownloads method when event name is equal download', () => {
            // arrange
            jest.spyOn(resourcesComponent, 'redirectToActivedownloads').mockImplementation();
            // act
            resourcesComponent.handleHeaderEvents({ name: 'download' });
            // assert
            expect(resourcesComponent.redirectToActivedownloads).toHaveBeenCalled();
        });

        // it('should call notification method when event name is equal notification', () => {
        //     // arrange
        //     jest.spyOn(resourcesComponent, 'redirectToNotifications').mockImplementation();
        //     // act
        //     resourcesComponent.handleHeaderEvents({ name: 'notification' });
        //     // assert
        //     expect(resourcesComponent.redirectToNotifications).toHaveBeenCalled();
        // });

        it('should call information method when event name is equal information', () => {
            // arrange
            jest.spyOn(resourcesComponent, 'appTutorialScreen').mockImplementation();
            // act
            resourcesComponent.handleHeaderEvents({ name: 'information' });
            // assert
          //  expect(resourcesComponent.appTutorialScreen).toHaveBeenCalled();
        });

        it('should go default section if event is not matched at all', () => {
            jest.spyOn(console, 'warn').mockImplementation();
            resourcesComponent.handleHeaderEvents({ name: 'any_event' });

            expect(console.warn).toHaveBeenCalledWith('Use Proper Event name');
        });
    });

    it('should generate interact event if event and scroll ended', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        resourcesComponent.logScrollEnd({ target: { scrollHeight: 10, scrollTop: 20, offsetHeight: 10 } });
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.SCROLL,
            InteractSubtype.BOOK_LIST_END_REACHED,
            Environment.HOME,
            PageId.LIBRARY);
    });

    it('should cover else part if event is undefined', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        resourcesComponent.logScrollEnd(undefined);
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).not.toHaveBeenCalled();
    });

    it('should fetch localContent when called upon', () => {
        // arrange
        mockContentService.getContents = jest.fn((data) => of(data));
        mockNgZone.run = jest.fn((fn) => fn());
        // act
        resourcesComponent.getLocalContent();
        // assert
        expect(mockContentService.getContents).toHaveBeenCalled();
    });

    describe('arrangeMediumsByUserData', () => {
        it('should return slected medium if data is present', () => {
            // arrange
            const categoryMediumsParam = ['english', 'hindi'];
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({
                name: 'sample-name',
                board: ['cbsc'],
                medium: ['english', 'hindi'],
                grade: ['class 1', 'class 2']
            }));
            resourcesComponent.categoryMediumNamesArray = ['english', 'hindi'];
            resourcesComponent.searchGroupingContents = {
                combination: { medium: 'english' }
            };
            jest.spyOn(resourcesComponent, 'mediumClickHandler').mockImplementation(() => {
                return 0;
            });
            // act
            resourcesComponent.arrangeMediumsByUserData(categoryMediumsParam);
            // assert
            expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
        });

        it('should return slected medium if data is not present', () => {
            // arrange
            const categoryMediumsParam = ['english', 'hindi'];
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({
                name: 'sample-name',
                board: ['cbsc'],
                medium: ['english', 'hindi'],
                grade: ['class 1', 'class 2']
            }));
            resourcesComponent.categoryMediumNamesArray = ['english', 'hindi'];
            resourcesComponent.searchGroupingContents = {
                combination: {}
            };
            resourcesComponent.getGroupByPageReq = {
                medium: ['english']
            };
            jest.spyOn(resourcesComponent, 'mediumClickHandler').mockImplementation(() => {
                return 0;
            });
            // act
            resourcesComponent.arrangeMediumsByUserData(categoryMediumsParam);
            // assert
            expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
        });
    });

    // it('should call setTimeout for ionViewDidEnter', (done) => {
    //     // arrange
    //     resourcesComponent.refresher = { disabled: false };
    //     mockAppGlobalService.showTutorialScreen = jest.fn();
    //     // act
    //     resourcesComponent.ionViewDidEnter();
    //     // assert
    //     setTimeout(() => {
    //         expect(mockAppGlobalService.showTutorialScreen).toHaveBeenCalled();
    //         done();
    //     }, 2000);
    // });

    it('should navigate To ViewMoreContentsPage for horizontal section', () => {
        const request = {
            searchCriteria: undefined,
            title: JSON.stringify({en: 'TV Programs'}),
            data: {sections: [{contents: {}}]}
        };
        mockCommonUtilService.getTranslatedValue = jest.fn(() => 'TV Programs');
        const params = {
            state: {
                enrolledCourses: {},
                headerTitle: 'TV Programs',
                pageName: ViewMore.PAGE_COURSE_ENROLLED,
                userId: 'sample-user'
            }
          };
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));
        mockAppGlobalService.getUserId = jest.fn(() => 'sample-user');
        // act
        resourcesComponent.navigateToViewMoreContentsPage(request);
        // assert
        expect(mockCommonUtilService.getTranslatedValue).toHaveBeenCalledWith(request.title, '');
        expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.VIEW_MORE_ACTIVITY], params);
        expect(mockAppGlobalService.getUserId).toHaveBeenCalled();
    });

    describe('requestMoreContent()', () => {
        it('should prepare the delegate and navigate to Framework details page', (done) => {
            // act
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockFormAndFrameworkUtilService.getContentRequestFormConfig = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn();
            mockRouter.navigate = jest.fn();
            // act
            resourcesComponent.requestMoreContent().then(() => {
                // assert
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(mockFormAndFrameworkUtilService.getContentRequestFormConfig).toHaveBeenCalled();
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('onFrameworkSelectionSubmit()', () => {
        it('should prepare the delegate navigation method for Frameworkdetails page when internet is available', (done) => {
            // act
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            const formOutput = {
                board: {
                    name: 'State (Karnataka)',
                    code: 'ka_k-12_1'
                },
                medium: {
                    name: 'English',
                    code: 'english',
                    frameworkCode: 'ka_k-12_1'
                },
                grade: {
                    name: 'Class 9',
                    code: 'class9',
                    frameworkCode: 'ka_k-12_1'
                },
                subject: 'other',
                contenttype: 'digitextbbok',
                children: {
                    subject: {
                        other: 'Cdc'
                    }
                }
            };
            mockRouter.navigate = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            resourcesComponent.onFrameworkSelectionSubmit({}, formOutput, mockRouter, mockCommonUtilService,
                mockTelemetryGeneratorService, []).then(() => {
                // assert
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalled();
                done();
            });
        });

        it('should show the offline toast when internet is now available', (done) => {
            // act
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            mockCommonUtilService.showToast = jest.fn();
            // act
            resourcesComponent.onFrameworkSelectionSubmit({}, {}, mockRouter, mockCommonUtilService).then(() => {
                // assert
                expect(mockCommonUtilService.showToast).toHaveBeenCalled();
                done();
            });
        });
    });
});
