import { combineLatest, EMPTY, of, throwError } from "rxjs";
import { ApplicationHeaderComponent } from "./application-header.component";
import {
    CachedItemRequestSourceFrom,
    CorrelationData, DownloadService,
    EventNamespace, EventsBusService, NotificationService as PushNotificationService,
    Profile, ProfileService, ProfileType,
    ServerProfile, SharedPreferences
  } from '@project-sunbird/sunbird-sdk';
import { MenuController, Platform, PopoverController } from "@ionic/angular";
import { ActivePageService, AppGlobalService, AppHeaderService, CommonUtilService, CorReleationDataType, Environment, ID, InteractSubtype, InteractType, NotificationService, PageId, TelemetryGeneratorService, UtilityService } from "../../../services";
import { Events } from "../../../../src/util/events";
import { ChangeDetectorRef, ElementRef, EventEmitter, NgZone, Renderer2 } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { AppVersion } from "@awesome-cordova-plugins/app-version/ngx";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import { TncUpdateHandlerService } from "../../../services/handlers/tnc-update-handler.service";
import { AppMode, AppOrientation, AppThemes, EventTopics, PreferenceKey, ProfileConstants, RouterLinks } from "../../app.constant";
import { ProfileSource, RootOrg } from "@project-sunbird/sunbird-sdk";
import { error } from "console";

describe('ApplicationHeaderComponent', () => {
    let applicationHeaderComponent: ApplicationHeaderComponent;

    window.cordova.plugins = {
        InAppUpdateManager: {
            isUpdateAvailable: jest.fn((fn) => fn(Promise.resolve('22')))
        }
    };

    const param = {selectedLanguage: 'en'};
    const mockSharedPreference: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('en' as any))
    };
    const mockDownloadService: Partial<DownloadService> = {
        getActiveDownloadRequests: jest.fn()
    };
    const mockPushNotificationService: Partial<PushNotificationService> = {
        notifications: jest.fn(() => of())
    };
    const mockEventsBusService: Partial<EventsBusService> = {};
    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn(() => of()),
        managedProfileManager: {
            getManagedServerProfiles: jest.fn(()=> Promise.resolve({})),
            switchSessionToManagedProfile: jest.fn(() => of())
        }
    };
    const mockMenuController: Partial<MenuController> = {
        toggle: jest.fn(() => Promise.resolve(true)),
        isOpen: jest.fn(() => Promise.resolve(true)),
        close: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        networkInfo: {isNetworkAvailable: true},
        showToast: jest.fn(),
        translateMessage: jest.fn(),
        populateGlobalCData: jest.fn(),
        isAccessibleForNonStudentRole: jest.fn()
    };
    const mockEvents: Partial<Events> = {
        subscribe: jest.fn((_, fn) => fn()),
        publish: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        isUserLoggedIn: jest.fn(),
        getGuestUserType: jest.fn()
    };
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn()
    };
    const mockUtilityService: Partial<UtilityService> = {
        getBuildConfigValue: jest.fn()
    };
    const mockChangeDetectionRef: Partial<ChangeDetectorRef> = {
        detectChanges: jest.fn(() => Promise.resolve())
    };
    const mockNotification: Partial<NotificationService> = {
        setupLocalNotification: jest.fn(),
        fetchNotificationList: jest.fn(() => Promise.resolve(nData))
    };
    class MockTranslateService {
        public get onLangChange() {
            return new EventEmitter<LangChangeEvent>();
        }
    }
    const mockTranslate: Partial<TranslateService> = new MockTranslateService() as any;
    const mockRouter: Partial<Router> = {
        navigate: jest.fn()
    };
    const mockNgZone: Partial<NgZone> = {
        run: jest.fn()
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn(),
        generateNewExprienceSwitchTelemetry: jest.fn()
    };
    const mockActivePageService: Partial<ActivePageService> = {
        computePageId: jest.fn()
    };
    const mockPopoverCtrl: Partial<PopoverController> = {}
    mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
        present: jest.fn(),
        dismiss: jest.fn(),
        onDidDismiss: jest.fn()
        } as any)));
    const mockTncUpdateHandlerService: Partial<TncUpdateHandlerService> = {
        checkForTncUpdate: jest.fn()
    };
    const mockAppHeaderService: Partial<AppHeaderService> = {
        showStatusBar: jest.fn(),
        hideStatusBar: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {};
    const nData = {
        feeds: [
            {name: 'name', status: 'unread'}
        ]
    } as any;
    const mockRenderer: Partial<Renderer2> = {
        setAttribute: jest.fn(() => {}),
        removeAttribute: jest.fn(() => {})
    };
    const increaseFontSize: Partial<ElementRef> = {
        nativeElement: jest.fn(() => {})
    };
    const decreaseFontSize: Partial<ElementRef> = {
        nativeElement: jest.fn(() => {})
    };
    const resetFontSize: Partial<ElementRef> = {
        nativeElement: jest.fn(() => {})
    };

    beforeAll(() => {
        applicationHeaderComponent = new ApplicationHeaderComponent(
            mockSharedPreference as SharedPreferences,
            mockDownloadService as DownloadService,
            mockPushNotificationService as PushNotificationService,
            mockEventsBusService as EventsBusService,
            mockProfileService as ProfileService,
            mockMenuController as MenuController,
            mockCommonUtilService as CommonUtilService,
            mockEvents as Events,
            mockAppGlobalService as AppGlobalService,
            mockAppVersion as AppVersion,
            mockUtilityService as UtilityService,
            mockChangeDetectionRef as ChangeDetectorRef,
            mockNotification as NotificationService,
            mockTranslate as TranslateService,
            mockPlatform as Platform,
            mockRouter as Router,
            mockNgZone as NgZone,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockActivePageService as ActivePageService,
            mockPopoverCtrl as PopoverController,
            mockTncUpdateHandlerService as TncUpdateHandlerService,
            mockAppHeaderService as AppHeaderService,
            mockRenderer as Renderer2
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of application header component', () => {
        expect(applicationHeaderComponent).toBeTruthy();
    });

    describe('checkCurrentOrientation', ()=> {
        it('should check the orientation on chnage tp landscape', () => {
            mockSharedPreference.getString = jest.fn(() => of('Potrait'));
            applicationHeaderComponent.orientationToSwitch = AppOrientation.LANDSCAPE;
            applicationHeaderComponent = new ApplicationHeaderComponent(
                mockSharedPreference as SharedPreferences,
                mockDownloadService as DownloadService,
                mockPushNotificationService as PushNotificationService,
                mockEventsBusService as EventsBusService,
                mockProfileService as ProfileService,
                mockMenuController as MenuController,
                mockCommonUtilService as CommonUtilService,
                mockEvents as Events,
                mockAppGlobalService as AppGlobalService,
                mockAppVersion as AppVersion,
                mockUtilityService as UtilityService,
                mockChangeDetectionRef as ChangeDetectorRef,
                mockNotification as NotificationService,
                mockTranslate as TranslateService,
                mockPlatform as Platform,
                mockRouter as Router,
                mockNgZone as NgZone,
                mockTelemetryGeneratorService as TelemetryGeneratorService,
                mockActivePageService as ActivePageService,
                mockPopoverCtrl as PopoverController,
                mockTncUpdateHandlerService as TncUpdateHandlerService,
                mockAppHeaderService as AppHeaderService,
                mockRenderer as Renderer2
            );
        });
        it('should check the orientation on change to potrait', () => {
            mockSharedPreference.getString = jest.fn(() => of('Landscape'));
            applicationHeaderComponent.orientationToSwitch = AppOrientation.PORTRAIT;
            applicationHeaderComponent = new ApplicationHeaderComponent(
                mockSharedPreference as SharedPreferences,
                mockDownloadService as DownloadService,
                mockPushNotificationService as PushNotificationService,
                mockEventsBusService as EventsBusService,
                mockProfileService as ProfileService,
                mockMenuController as MenuController,
                mockCommonUtilService as CommonUtilService,
                mockEvents as Events,
                mockAppGlobalService as AppGlobalService,
                mockAppVersion as AppVersion,
                mockUtilityService as UtilityService,
                mockChangeDetectionRef as ChangeDetectorRef,
                mockNotification as NotificationService,
                mockTranslate as TranslateService,
                mockPlatform as Platform,
                mockRouter as Router,
                mockNgZone as NgZone,
                mockTelemetryGeneratorService as TelemetryGeneratorService,
                mockActivePageService as ActivePageService,
                mockPopoverCtrl as PopoverController,
                mockTncUpdateHandlerService as TncUpdateHandlerService,
                mockAppHeaderService as AppHeaderService,
                mockRenderer as Renderer2
            );
        });
    })

    describe('onInit', () => {
        it('should check for app update when returns true', (done) => {
            // arrange
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('sample_version_name'));
            mockEvents.subscribe = jest.fn((topic, fn) => {
                if (topic === 'user-profile-changed') {
                    jest.spyOn(applicationHeaderComponent, 'setAppLogo').mockImplementation();
                    mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
                    fn();
                } else if (topic === 'app-global:profile-obj-changed') {
                    mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
                    jest.spyOn(applicationHeaderComponent, 'setAppLogo').mockImplementation();
                    fn();
                } else if (topic === 'notification-status:update') {
                    fn({isUnreadNotifications: true});
                }
            });
            mockAppVersion.getAppName = jest.fn(() => Promise.resolve('app_name'));
            mockNgZone.run = jest.fn((fn) => fn());
            jest.spyOn(mockTranslate, 'onLangChange', 'get')
                .mockImplementation(() => of({ lang: 'ur' }) as any);
            jest.spyOn(applicationHeaderComponent, 'listenDownloads').mockImplementation();
            mockPushNotificationService.notifications$ = of([{isRead: true}]);
            mockCommonUtilService.networkAvailability$ = of(true);
            mockSharedPreference.getString = jest.fn(() => of('en'));
            mockNotification.setupLocalNotification = jest.fn();
            // act
            applicationHeaderComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(applicationHeaderComponent.setAppLogo).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should check for notification and events and on language change other than ur', (done) => {
            // arrange
            jest.spyOn(applicationHeaderComponent, 'setAppLogo').mockImplementation();
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('sample_version_name'));
            mockEvents.subscribe = jest.fn((topic, fn) => {
                if (topic === 'header:decreasezIndex') {
                    fn({pplicationHeaderComponent:{decreaseZindex: true}});
                } else if (topic === 'header:setzIndexToNormal') {
                    fn({pplicationHeaderComponent:{decreaseZindex: false}});
                } else if (topic === EventTopics.NOTIFICATION_REFRESH) {
                    fn(jest.spyOn(applicationHeaderComponent, 'getUnreadNotifications').mockImplementation());
                }
            });
            mockNgZone.run = jest.fn((fn) => fn());
            jest.spyOn(mockTranslate, 'onLangChange', 'get')
                .mockImplementation(() => of({ lang: 'en' }) as any);
            jest.spyOn(applicationHeaderComponent, 'listenDownloads').mockImplementation();
            mockPushNotificationService.notifications$ = of([{isRead: true}]);
            mockCommonUtilService.networkAvailability$ = of(true);
            mockSharedPreference.getString = jest.fn(() => of('en'));
            mockNotification.setupLocalNotification = jest.fn();
            // act
            applicationHeaderComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(applicationHeaderComponent.setAppLogo).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should set a app version and config', () => {
            // arrange
            jest.spyOn(applicationHeaderComponent, 'setAppLogo').mockImplementation();
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('App_name'))
            applicationHeaderComponent.versionName = 'App_name';
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('Version_code'))
            applicationHeaderComponent.versionCode = "Version_code";
            // act
            applicationHeaderComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalledWith('VERSION_NAME');
                expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalledWith('VERSION_CODE');
            })
        });
        it('should console a error on app config version code', () => {
            // arrange
            jest.spyOn(applicationHeaderComponent, 'setAppLogo').mockImplementation();
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve().then(()=>{
                mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.reject('error'))
            })) as any
            // act
            applicationHeaderComponent.ngOnInit();
            // assert
        });
        it('should console a error on app config version name', () => {
            // arrange
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.reject(undefined))
            // act
            applicationHeaderComponent.ngOnInit();
            // assert
            setTimeout(() => {
                expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalledWith('VERSION_NAME');
            })
        });
    });

    describe('setLanguageValue', () => {
        it('should set a language value and language code', () => {
            // arrange
            mockSharedPreference.getString = jest.fn(() => of('English'));
            mockSharedPreference.getString = jest.fn(() => of('en'));
            mockNotification.setupLocalNotification = jest.fn();
            // act
            applicationHeaderComponent.setLanguageValue()
            // assert
            setTimeout(() => {
                expect(mockSharedPreference.getString).toHaveBeenCalledWith('sunbirdselected_language')
                expect(mockSharedPreference.getString).toHaveBeenCalledWith('sunbirdselected_language_code')
                expect(mockNotification.setupLocalNotification).toHaveBeenCalledWith('en');
            },0);
        });
    });

    describe('listenDownloads', () => {
        it('should listen doenloads and combine latest', () => {
            // arrange
            mockDownloadService.getActiveDownloadRequests = jest.fn();
            mockEventsBusService.events = jest.fn(() => Promise.resolve({type: 'PROGRESS', payload: {
                downloadId: 'sample_id',
                identifier: 'sample',
                progress: 2,
                status: 8,
                bytesDownloaded: 3242,
                totalSizeInBytes: 234
            }}))
            var combined = combineLatest(mockDownloadService.getActiveDownloadRequests = jest.fn(),
            mockEventsBusService.events = jest.fn(() => Promise.resolve({type: 'PROGRESS', payload: {
                downloadId: 'sample_id',
                identifier: 'sample',
                progress: 2,
                status: 8,
                bytesDownloaded: 3242,
                totalSizeInBytes: 234
            }})), () => of());
            mockChangeDetectionRef.detectChanges = jest.fn();
            // act
            applicationHeaderComponent.listenDownloads();
            // assert
            setTimeout(() => {
                expect(combined).toBeCalled();
                // expect(combineLatest).toHaveBeenCalledWith();
                expect(mockDownloadService.getActiveDownloadRequests).toHaveBeenCalled();
                expect(mockEventsBusService.events).toHaveBeenCalledWith(EventNamespace.DOWNLOADS);
                expect(mockChangeDetectionRef.detectChanges).toHaveBeenCalled();
            }, 0);
        });
    });

    describe('toggleMenu', () => {
        it('should toggle and if menu controller is open compute page id and generate telemetry', () => {
            // arrange
            mockMenuController.toggle = jest.fn();
            mockMenuController.isOpen = jest.fn(() => Promise.resolve(true));
            mockActivePageService.computePageId = jest.fn(() => ('sample_page_id'));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            applicationHeaderComponent.toggleMenu();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
                    InteractSubtype.MENU_CLICKED,
                    Environment.HOME,
                    'pageId');
            }, 0);
        });
        it('should toggle menu controller and publish a event', () => {
            // arrange
            mockMenuController.toggle = jest.fn();
            mockMenuController.isOpen = jest.fn(() => Promise.resolve(false));
            mockEvents.publish = jest.fn();
            mockSharedPreference.getString = jest.fn(() => of('APP_NAME'));
            // act
            applicationHeaderComponent.toggleMenu();
            // assert
            setTimeout(() => {
                expect(mockEvents.publish).toHaveBeenCalledWith('HAMBURGER_MENU_CLICKED');
                expect(mockSharedPreference.getString).toHaveBeenCalledWith('selected_switchable_tabs_config');
            }, 0);
        });
    });

    describe('emitEvent', () => {
        it('should emit event for other events', () => {
            // arrange
            const name = 'other'
            const event: any = ''
            applicationHeaderComponent.headerEvents.emit = jest.fn();
            // act
            applicationHeaderComponent.emitEvent(event, name);
            // assert
            expect(applicationHeaderComponent.headerEvents.emit).toHaveBeenCalledWith({name, event:event});
        });
        it('should emit for filter events if network available', () => {
            // arrange
            const name = 'filter'
            const event: any = {}
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            applicationHeaderComponent.headerEvents.emit = jest.fn();
            // act
            applicationHeaderComponent.emitEvent(event, name);
            // assert
            expect(applicationHeaderComponent.headerEvents.emit).toHaveBeenCalledWith({name, event:event});
        });
        it('should show toast if network not available', () => {
            // arrange
            const name = 'filter'
            const event: any = {}
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            }
            mockCommonUtilService.showToast = jest.fn();
            // act
            applicationHeaderComponent.emitEvent(event, name);
            // assert
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NEED_INTERNET_TO_CHANGE');
        });
    });

    describe('emitSideMenuItemEvent', () => {
        it('emit side menu items if menu ctrl close', () => {
            // arrange
            const menuItem = 'sample_item';
            mockMenuController.close = jest.fn(() => Promise.resolve(true));
            applicationHeaderComponent.sideMenuItemEvent.emit = jest.fn();
            // act
            applicationHeaderComponent.emitSideMenuItemEvent({}, menuItem);
            // assert
            setTimeout(() => {
                expect(applicationHeaderComponent.sideMenuItemEvent.emit).toHaveBeenCalledWith({menuItem});
            }, 0);
        });
        it('emit side menu items if menu ctrl open or on catch error', () => {
            // arrange
            const menuItem = 'sample_item';
            mockMenuController.close = jest.fn(() => Promise.reject(false));
            applicationHeaderComponent.sideMenuItemEvent.emit = jest.fn();
            // act
            applicationHeaderComponent.emitSideMenuItemEvent({}, menuItem);
            // assert
            setTimeout(() => {
                expect(applicationHeaderComponent.sideMenuItemEvent.emit).toHaveBeenCalledWith({menuItem});
            }, 0);
        });
    });

    describe('ngOnDestroy', () => {
        it('should subscribe events', () => {
            // arrange
            mockEvents.subscribe = jest.fn();
            // act
            applicationHeaderComponent.ngOnDestroy();
            // assert
            expect(mockEvents.subscribe).toBeCalledWith('user-profile-changed');
            expect(mockEvents.subscribe).toBeCalledWith('app-global:profile-obj-changed');
        });
    
        it('should unsubscribe networkSubscription', () => {
            // arrange
            applicationHeaderComponent['networkSubscription'] = {
                unsubscribe: jest.fn(),
            } as any;
            // act
            applicationHeaderComponent.ngOnDestroy();
            // assert
            expect(applicationHeaderComponent['networkSubscription'].unsubscribe).toHaveBeenCalled();
        });
    });

    describe('getUnreadNotifications', () => {
        it('should fetch notification list', () => {
            // arrange
            mockNotification.fetchNotificationList = jest.fn(() => Promise.resolve(nData))
            // act
            applicationHeaderComponent.getUnreadNotifications();
            // assert
            setTimeout(() => {
                expect(mockNotification.fetchNotificationList).toHaveBeenCalled()
            })
        });
    });

    describe('fetchManagedProfileDetails', () => {
        it('should throw error if no active session profile', () => {
            // arrange
            mockProfileService.getActiveSessionProfile = jest.fn(() => throwError(error));
            // act
            applicationHeaderComponent.fetchManagedProfileDetails();
            // assert
            setTimeout(() => {
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalledWith('');
            }, 0);
        });
        it('should get managed server profile', () => {
            // arrange
            const rootOrgData: RootOrg = {
                rootOrgId: 'sample_rootOrgId',
                orgName: 'sample_orgName',
                slug: 'sample_slug',
                hashTagId: 'sample_hashTagId'
              };
            
              const serverProfileData: ServerProfile = {
                userId: 'sample_userId',
                identifier: 'sample_identifier',
                firstName: 'sample_firstName',
                lastName: 'sample_lastName',
                rootOrg: rootOrgData,
                tncAcceptedVersion: 'sample_tncAcceptedVersion',
                tncAcceptedOn: 'sample_tncAcceptedOn',
                tncLatestVersion: 'sample_tncLatestVersion',
                promptTnC: false,
                tncLatestVersionUrl: 'sample_tncLatestVersionUrl',
                id: 'sample_id',
                avatar: 'sample_avatar',
                declarations: [{name: 'sample-name'}],
                profileUserType:{
                  subType: null,
                  type: "OTHER"
                },
              };
            const ProfileData: Profile = {
                uid: 'sample_uid',
                handle: 'sample_handle',
                createdAt: 0,
                medium: ['sample_medium1', 'sample_medium2'],
                board: ['sample_board'],
                subject: ['sample_subject1', 'sample_subject2'],
                profileType: ProfileType.STUDENT,
                grade: ['sample_grade1', 'sample_grade2'],
                syllabus: ['sample_syllabus'],
                source: ProfileSource.LOCAL,
                serverProfile: serverProfileData
              };
            mockProfileService.getActiveSessionProfile = jest.fn(() => of(ProfileData));
            const response = mockProfileService.managedProfileManager = {
                getManagedServerProfiles: jest.fn(() => Promise.resolve([
                    {
                        uid: 'sample_uid_1'
                    },
                    {
                        uid: 'sample_uid_2'
                    },
                    ]
                ))
            };
            // act
            applicationHeaderComponent.fetchManagedProfileDetails();
            // assert
            setTimeout(() => {
                expect(mockProfileService.managedProfileManager.getManagedServerProfiles).toHaveBeenCalledWith({from: CachedItemRequestSourceFrom.CACHE,
                    requiredFields: ProfileConstants.REQUIRED_FIELDS
                })
                expect(response).toEqual([
                    {
                        uid: 'sample_uid_1'
                    },
                    {
                        uid: 'sample_uid_2'
                    },
                    ])
            }, 0);
        })
        it('should get session profile and return empty if no profile data', () => {
            // arrange
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({}));
            applicationHeaderComponent.managedProfileList$ = EMPTY
            // act
            applicationHeaderComponent.fetchManagedProfileDetails();
            // assert
            setTimeout(() => {
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalledWith({ requiredFields: ProfileConstants.REQUIRED_FIELDS });
                expect(applicationHeaderComponent.managedProfileList$).toBeNull()
            }, 0);
        });
    });

    describe('addManagedUser', () => {
        it('should show toast if no network available', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            mockCommonUtilService.showToast = jest.fn();
            // act
            applicationHeaderComponent.addManagedUser();
            // assert
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NEED_INTERNET_TO_CHANGE')
        });
        it('should compute page id and generate telemetry on network avaliablity', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            mockActivePageService.computePageId = jest.fn(() => ('sample_page_id'));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockRouter.navigate = jest.fn();
            // act
            applicationHeaderComponent.addManagedUser();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.SELECT_ADD,
                    '',
                    Environment.HOME,
                    'pageId',
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    ID.BTN_ADD);
                expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.PROFILE}/${RouterLinks.SUB_PROFILE_EDIT}`]);
            }, 0);
        });
    });

    describe('openManagedUsers', () => {
        it('should open managed users and navigate to profile manager users', () => {
            // arrange
            mockActivePageService.computePageId = jest.fn(() => ('sample_page_id'));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockRouter.navigate = jest.fn();
            const navigationExtras: NavigationExtras = {
                state: {
                  profile: {
                      uid: 'sample_id',
                      syllabus: [],
                      grade: [],
                      medium: [],
                      ProfileType: 'STUDENT'
                  }
                }
              };
            // act
            applicationHeaderComponent.openManagedUsers();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.SELECT_MORE,
                    '',
                    Environment.HOME,
                    'pageId',
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    ID.BTN_MORE);
                expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.PROFILE}/${RouterLinks.MANAGE_USER_PROFILES}`], navigationExtras);
            }, 0);
        });
    });

    describe('switchUser', () => {
        it('should generate telemetry for switch used', () => {
            // arrange
            const user = {id: 'sample_userId', firstName: 'userName', lastName: 'lastName'};
            const cData: Array<CorrelationData> = [
                { id: 'sample_userid' || '', type: CorReleationDataType.SWITCHED_USER }
              ];
            
            mockProfileService.managedProfileManager = {
                switchSessionToManagedProfile: jest.fn(() => of(undefined))};
            mockActivePageService.computePageId = jest.fn(() => ('sample_page_id'));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            applicationHeaderComponent.switchUser(user);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.SELECT_ADD,
                    '',
                    Environment.HOME,
                    'pageId',
                    undefined,
                    undefined,
                    undefined,
                    cData,
                    ID.BTN_ADD);
            }, 0);
        });
        it('should switch session to manage profile and publish events', () => {
            // arrange
            const user = {id: 'sample_userId', firstName: 'userName', lastName: 'lastName'};
            mockProfileService.managedProfileManager = {
                switchSessionToManagedProfile: jest.fn(() => of(undefined))};
            mockEvents.publish = jest.fn();
            mockMenuController.close = jest.fn(() => Promise.resolve(true));
            mockTncUpdateHandlerService.checkForTncUpdate = jest.fn();
            // act
            applicationHeaderComponent.switchUser(user);
            // assert
            setTimeout(() => {
                expect(mockProfileService.managedProfileManager.switchSessionToManagedProfile).toHaveBeenCalledWith({uid: user.id});
                expect(mockEvents.publish).toHaveBeenCalledWith(AppGlobalService.USER_INFO_UPDATED);
                expect(mockEvents.publish).toHaveBeenCalledWith('loggedInProfile:update');
                expect(mockMenuController.close).toHaveBeenCalled();
                expect(mockTncUpdateHandlerService.checkForTncUpdate).toHaveBeenCalled();
            }, 0);
        });
        it('should switch session to manage profile and publish events if profile user has profile user type', () => {
            // arrange
            const user = {id: 'sample_userId', firstName: 'userName', lastName: 'lastName', profileUserType:{type: 'OTHER'}};
            mockProfileService.managedProfileManager = {
                switchSessionToManagedProfile: jest.fn(() => of(undefined))};
            mockEvents.publish = jest.fn();
            mockMenuController.close = jest.fn(() => Promise.resolve(true));
            mockTncUpdateHandlerService.checkForTncUpdate = jest.fn();
            mockSharedPreference.putString = jest.fn(() => of());
            // act
            applicationHeaderComponent.switchUser(user);
            // assert
            setTimeout(() => {
                expect(mockProfileService.managedProfileManager.switchSessionToManagedProfile).toHaveBeenCalledWith({uid: user.id});
                expect(mockEvents.publish).toHaveBeenCalledWith(AppGlobalService.USER_INFO_UPDATED);
                expect(mockEvents.publish).toHaveBeenCalledWith('loggedInProfile:update');
                expect(mockMenuController.close).toHaveBeenCalled();
                expect(mockTncUpdateHandlerService.checkForTncUpdate).toHaveBeenCalled();
                expect(mockSharedPreference.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_USER_TYPE, user.profileUserType.type)
                expect(mockEvents.publish).toHaveBeenCalledWith('UPDATE_TABS', {type: 'SWITCH_TABS_USERTYPE'});
            }, 0);
        });
        it('should throw error on switch session to manage profile', async() => {
            // arrange
            const user = {};
            mockProfileService.managedProfileManager = {
                switchSessionToManagedProfile: jest.fn(() => throwError({ error: 'ERROR_WHILE_SWITCHING_USER' }))};
            mockCommonUtilService.showToast = jest.fn();
            // act
            applicationHeaderComponent.switchUser(user);
            // assert
            setTimeout(() => {
                expect(mockProfileService.managedProfileManager.switchSessionToManagedProfile).toHaveBeenCalledWith({uid: undefined});
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_WHILE_SWITCHING_USER');
            }, 0);
        });
    });

    describe('showSwitchSuccessPopup', () => {
        it('should dismiss toast navigation component popover', () => {
            // arrange
            const present = jest.fn(() => Promise.resolve(true));
            const dismiss = jest.fn(() => Promise.resolve({}));
            const confirm = mockPopoverCtrl.create = jest.fn(() => Promise.resolve({
                present, 
                dismiss
            })) as any;
            // act
            applicationHeaderComponent.showSwitchSuccessPopup('userName');
            // assert
            expect(confirm).toBeTruthy();
            setTimeout(() => {
                setTimeout(() => {
                    expect(dismiss).toHaveBeenCalled();
                }, 3000);
            }, 0);
        });
        it('should check data onDidDismiss and navigate to profile tab', () => {
            // arrange
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({data: {val: false} }))
            }))) as any;
            mockRouter.navigate = jest.fn();
            // act
            applicationHeaderComponent.showSwitchSuccessPopup('userName');
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith([`/tabs/profile`]);
            }, 0);
        });
    });
    
    describe('switchTheme', () => {
        it('should switch a mode to joyfull if it is default', () => {
            // arrange
            const mHeader = {getAttribute: jest.fn(() => 'DEFAULT')};
            applicationHeaderComponent.appTheme = AppThemes.JOYFUL;
            jest.spyOn(document, 'querySelector').mockImplementation((selector) => {
                switch (selector) {
                    case 'html':
                        return mHeader as any;
                }
            });
            mockSharedPreference.putString = jest.fn(() => of());
            mockAppHeaderService.showStatusBar = jest.fn(() => Promise.resolve());
            mockMenuController.close = jest.fn(() => Promise.resolve(true));
            // act
            applicationHeaderComponent.switchTheme();
            // assert
            setTimeout(() => {
                expect(mockSharedPreference.querySelector('html').setAttribute).toHaveBeenCalledWith('device-accessable-theme', 'accessible');
                expect(mockAppHeaderService.showStatusBar).toHaveBeenCalled();
                expect(mockMenuController.close).toHaveBeenCalled();
            }, 0);
        });
        it('should switch a mode to joyfull if it is default', () => {
            // arrange
            const mHeader = {getAttribute: jest.fn(() => 'JOYFUL')};
            applicationHeaderComponent.appTheme = AppThemes.DEFAULT;
            jest.spyOn(document, 'querySelector').mockImplementation((selector) => {
                switch (selector) {
                    case 'html':
                        return mHeader as any;
                }
            });
            mockSharedPreference.putString = jest.fn(() => of());
            mockAppHeaderService.hideStatusBar = jest.fn(() => Promise.resolve());
            mockMenuController.close = jest.fn(() => Promise.resolve(true));
            // act
            applicationHeaderComponent.switchTheme();
            // assert
            setTimeout(() => {
                expect(mockSharedPreference.querySelector('html').setAttribute).toHaveBeenCalledWith('device-accessable-theme', '');
                expect(mockAppHeaderService.hideStatusBar).toHaveBeenCalled();
                expect(mockMenuController.close).toHaveBeenCalled();
            }, 0);
        });
    });

    describe('switchMode', () => {
        it('should switch a mode to dark if it is default', () => {
            // arrange
            const mHeader = {getAttribute: jest.fn(() => 'DEFAULT')};
            applicationHeaderComponent.isDarkMode = true;
            applicationHeaderComponent.appTheme = AppMode.DARKMODE;
            jest.spyOn(document, 'querySelector').mockImplementation((selector) => {
                switch (selector) {
                    case 'html':
                        return mHeader as any;
                }
            });
            mockSharedPreference.putString = jest.fn(() => of());
            mockAppHeaderService.showStatusBar = jest.fn(() => Promise.resolve());
            mockMenuController.close = jest.fn(() => Promise.resolve(true));
            // act
            applicationHeaderComponent.switchMode();
            // assert
            setTimeout(() => {
                expect(document.querySelector('html').setAttribute).toHaveBeenCalledWith('data-mode', AppMode.DARKMODE);
                expect(mockSharedPreference.putString).toHaveBeenCalledWith('data-mode', AppMode.DARKMODE);
                expect(mockAppHeaderService.showStatusBar).toHaveBeenCalled();
                expect(mockMenuController.close).toHaveBeenCalled();
            }, 0);
        });
        it('should switch a mode to default', () => {
            // arrange
            const mHeader = {getAttribute: jest.fn(() => 'DARKMODE')};
            applicationHeaderComponent.isDarkMode = false;
            applicationHeaderComponent.appTheme = AppMode.DEFAULT;
            jest.spyOn(document, 'querySelector').mockImplementation((selector) => {
                switch (selector) {
                    case 'html':
                        return mHeader as any;
                }
            });
            mockSharedPreference.putString = jest.fn(() => of());
            mockAppHeaderService.hideStatusBar = jest.fn(() => Promise.resolve());
            mockMenuController.close = jest.fn(() => Promise.resolve(true));
            // act
            applicationHeaderComponent.switchMode();
            // assert
            setTimeout(() => {
                expect(document.querySelector('html').setAttribute).toHaveBeenCalledWith('data-mode', 'DARKMODE');
                expect(document.querySelector('html').setAttribute).toHaveBeenCalledWith('data-mode', 'DEFAULT');
                expect(mockSharedPreference.putString).toHaveBeenCalledWith('data-mode', AppMode.DEFAULT);
                expect(mockAppHeaderService.hideStatusBar).toHaveBeenCalled();
                expect(mockMenuController.close).toHaveBeenCalled();
            }, 0);
        });
    });

    describe('switchTabs', () => {
        it('should generate new experience telemetry ', () => {
            // arrange
            mockSharedPreference.getString = jest.fn(() => of('sample_usertype'))
            mockSharedPreference.getBoolean = jest.fn(() => of(true));
            mockTelemetryGeneratorService.generateNewExprienceSwitchTelemetry = jest.fn();
            mockCommonUtilService.populateGlobalCData = jest.fn();
            mockMenuController.close = jest.fn();
            // act
            applicationHeaderComponent.switchTabs();
            // assert
            setTimeout(() => {
                expect(mockSharedPreference.getString).toHaveBeenCalledWith('sunbirdselected_user_type');
                expect(mockSharedPreference.getBoolean).toHaveBeenCalledWith('is_new_user');
                expect(mockTelemetryGeneratorService.generateNewExprienceSwitchTelemetry).toHaveBeenCalledWith(
                    PageId.MENU,
                    'opted-in',
                    {userType:'sample_usertype', isNewUser: true});
                expect(mockCommonUtilService.populateGlobalCData).toHaveBeenCalled();
                expect(mockMenuController.close).toHaveBeenCalled();
            }, 0);
        });
        it('should publish a event for home discovery tabs', () => {
            // arrange
            const subType = InteractSubtype.OPTED_IN;
            mockSharedPreference.getString = jest.fn(() => of('HOME_DISCOVER_TABS_CONFIG'));
            mockSharedPreference.putString = jest.fn(() => of());
            mockEvents.publish = jest.fn();
            // act
            applicationHeaderComponent.switchTabs();
            // assert
            setTimeout(() => {
                expect(mockSharedPreference.getString).toHaveBeenCalledWith('selected_switchable_tabs_config');
                expect(mockSharedPreference.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_SWITCHABLE_TABS_CONFIG,
                    'RESOURCE_COURSE_TABS_CONFIG');
                expect(mockEvents.publish).toHaveBeenCalledWith('UPDATE_TABS', { type: 'SWITCH_TABS_USERTYPE' });
                expect(subType).toBe(InteractSubtype.OPTED_OUT);
            }, 0);
        });
        it('should publish a event for resource course tabs', () => {
            // arrange
            const subType = InteractSubtype.OPTED_IN;
            mockSharedPreference.getString = jest.fn(() => of('RESOURCE_COURSE_TABS_CONFIG'));
            mockSharedPreference.putString = jest.fn(() => of());
            mockEvents.publish = jest.fn();
            // act
            applicationHeaderComponent.switchTabs();
            // assert
            setTimeout(() => {
                expect(mockSharedPreference.getString).toHaveBeenCalledWith('selected_switchable_tabs_config');
                expect(mockSharedPreference.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_SWITCHABLE_TABS_CONFIG,
                    'HOME_DISCOVER_TABS_CONFIG');
                expect(mockEvents.publish).toHaveBeenCalledWith('UPDATE_TABS', { type: 'SWITCH_TABS_USERTYPE' });
                expect(subType).toBe(InteractSubtype.OPTED_IN);
            }, 0);
        })
    });

    describe('showKebabMenu', () => {
        it('should presnt application header kebabmenu component popover', () => {
            // arrange
            const event: any = {};
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({data: {
                    option: {
                        label: 'string',
                        value: 'any'
                    }
                }}))
            }))) as any;
            jest.spyOn(applicationHeaderComponent, 'emitEvent').mockImplementation()
            // act
            applicationHeaderComponent.showKebabMenu(event);
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create.prototype.present).toHaveBeenCalled();
            }, 0);
        });
        it('should check data onDidDismiss return if data not present', () => {
            // arrange
            const event: any = {};
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve()),
                onDidDismiss: jest.fn(() => Promise.resolve({}))
            }))) as any;
            // act
            applicationHeaderComponent.showKebabMenu(event);
            // assert
        });
    });

    describe('signin', () => {
        it('should navigate to signin page', () => {
            // arrange
            mockRouter.navigate = jest.fn();
            // act
            applicationHeaderComponent.signin();
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.SIGN_IN}`]);
            }, 0)
        })
    });

    describe('ngAfterViewInit', () => {
        it('should reset the value on after view init ', () => {
            // arrange
            applicationHeaderComponent.decreaseFontSize = {
                nativeElement: {'aria-passed': true}
            }
            applicationHeaderComponent.increaseFontSize = {
                nativeElement: {'aria-passed': false}
            }
            applicationHeaderComponent.resetFontSize = {
                nativeElement: {'aria-passed': false}
            }
            // act
            applicationHeaderComponent.ngAfterViewInit();
            // assert
            setTimeout(() => {
                expect(applicationHeaderComponent.changeFontSize).toHaveBeenCalledWith('reset');
            }, 0);
        })
    })

    describe('changeFontSize', () => {
        it('font size accessibile on increase', () => {
            // arrange
            const value = 'increase';
            window.getComputedStyle(document.documentElement).getPropertyValue('font-size');
            const localFontSize = localStorage.getItem('fontSize');
            const currentFontSize = 20;
            // applicationHeaderComponent.fontSize = 20;
            applicationHeaderComponent.increaseFontSize = {
                nativeElement: {'aria-passed': true}
            }
            applicationHeaderComponent.decreaseFontSize = {
                nativeElement: {'aria-passed': false}
            }
            applicationHeaderComponent.resetFontSize = {
                nativeElement: {'aria-passed': false}
            }
            // act
            applicationHeaderComponent.changeFontSize(value);
            // assert
            setTimeout(() => {
                expect(currentFontSize).toBeLessThanOrEqual(20);
                expect(applicationHeaderComponent.setLocalFontSize).toHaveBeenCalledWith();
            });
        });
        it('font size accessibile on decrease', () => {
            // arrange
            const value = 'decrease';
            localStorage.getItem = jest.fn();
            window.getComputedStyle(document.documentElement).getPropertyValue('font-size');
            applicationHeaderComponent.decreaseFontSize = {
                nativeElement: {'aria-passed': true}
            }
            applicationHeaderComponent.increaseFontSize = {
                nativeElement: {'aria-passed': false}
            }
            applicationHeaderComponent.resetFontSize = {
                nativeElement: {'aria-passed': false}
            }
            // act
            applicationHeaderComponent.changeFontSize(value);
            // assert
            setTimeout(() => {
                expect(applicationHeaderComponent.fontSize).toBeGreaterThanOrEqual(12);
                expect(applicationHeaderComponent.setLocalFontSize).toHaveBeenCalledWith();
            })
        });
        it('font size accessibile on reset to default', () => {
            // arrange
            localStorage.getItem = jest.fn();
            applicationHeaderComponent.increaseFontSize = {
                nativeElement: {'aria-passed': false}
            }
            applicationHeaderComponent.decreaseFontSize = {
                nativeElement: {'aria-passed': false}
            }
            applicationHeaderComponent.resetFontSize = {
                nativeElement: {'aria-passed': true}
            }
            // act
            applicationHeaderComponent.changeFontSize('reset');
            // assert
            setTimeout(() => {
                expect(applicationHeaderComponent.setLocalFontSize).toHaveBeenCalled();
            })
        })
    });

    describe('setLocalFontSize', () => {
        it('set font size to local', () => {
            // arrange
            const value = 12;
            document.documentElement.style.setProperty('font-size', value + 'px', 'important');
            // act
            applicationHeaderComponent.setLocalFontSize(12);
            // assert
            setTimeout(() => {
                expect(localStorage.setItem).toHaveBeenCalledWith('font-size', value);
            })
        })
    });

    describe('isDisableFontSize', () => {
        it('set disable on max font size', () => {
            // arrange
            const val = 20;
            // act
            applicationHeaderComponent.isDisableFontSize(val);
            // assert
            setTimeout(() => {
                expect(mockRenderer.setAttribute).toHaveBeenCalledWith(increaseFontSize.nativeElement, 'disabled', true);
                expect(mockRenderer.removeAttribute).toHaveBeenCalledWith(decreaseFontSize.nativeElement, 'disabled');
                expect(mockRenderer.removeAttribute).toHaveBeenCalledWith(resetFontSize.nativeElement, 'disabled');
            }, 0);
        })
        it('set disable on min font size', () => {
            // arrange
            const val = 12;
            // act
            applicationHeaderComponent.isDisableFontSize(val);
            // assert
            setTimeout(() => {
                expect(mockRenderer.setAttribute).toHaveBeenCalledWith(decreaseFontSize.nativeElement, 'disabled', true);
                expect(mockRenderer.removeAttribute).toHaveBeenCalledWith(increaseFontSize.nativeElement, 'disabled');
                expect(mockRenderer.removeAttribute).toHaveBeenCalledWith(resetFontSize.nativeElement, 'disabled');
            }, 0);
        })
        it('set disable on default font size', () => {
            // arrange
            const val = 16;
            // act
            applicationHeaderComponent.isDisableFontSize(val);
            // assert
            setTimeout(() => {
                expect(mockRenderer.setAttribute).toHaveBeenCalledWith(resetFontSize.nativeElement, 'disabled', true);
                expect(mockRenderer.removeAttribute).toHaveBeenCalledWith(increaseFontSize.nativeElement, 'disabled');
                expect(mockRenderer.removeAttribute).toHaveBeenCalledWith(decreaseFontSize.nativeElement, 'disabled');
            }, 0);
        })
        it('set disable on other font size', () => {
            // arrange
            mockRenderer.removeAttribute = jest.fn(() => {
                increaseFontSize.nativeElement = { disabled: false }
                decreaseFontSize.nativeElement = { disabled: false }
                resetFontSize.nativeElement = { disabled: false }
            })
            // act
            applicationHeaderComponent.isDisableFontSize('');
            // assert
            setTimeout(() => {
                expect(mockRenderer.removeAttribute).toHaveBeenCalledWith(increaseFontSize.nativeElement, 'disabled');
                expect(mockRenderer.removeAttribute).toHaveBeenCalledWith(decreaseFontSize.nativeElement, 'disabled');
                expect(mockRenderer.removeAttribute).toHaveBeenCalledWith(resetFontSize.nativeElement, 'disabled');
            }, 0);
        })
    });
})