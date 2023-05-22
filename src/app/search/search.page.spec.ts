import { SearchPage } from './search.page';
import { MimeType, RouterLinks } from '../../app/app.constant';
import {
    FrameworkService,
    FrameworkUtilService,
    ProfileService,
    SharedPreferences,
    ContentService,
    EventsBusService,
    CourseService,
    SearchHistoryService,
    PageAssembleService,
    FrameworkCategoryCodesGroup,
    ContentImportStatus
} from '@project-sunbird/sunbird-sdk';
import { TranslateService } from '@ngx-translate/core';
import { Platform, NavController, PopoverController } from '@ionic/angular';
import { Events } from '../../util/events';
import { Router } from '@angular/router';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import {
    AppGlobalService,
    TelemetryGeneratorService,
    CommonUtilService,
    AppHeaderService
} from 'services';
import { Location } from '@angular/common';
import { ImpressionType, PageId, Environment, InteractSubtype, InteractType, LogLevel, Mode } from '../../services/telemetry-constants';
import { of, throwError } from 'rxjs';
import { NgZone, ChangeDetectorRef } from '@angular/core';
import { FormAndFrameworkUtilService, AuditType, ImpressionSubtype, GroupHandlerService, OnboardingConfigurationService, CorReleationDataType } from '../../services';
import { SbProgressLoader } from '../../services/sb-progress-loader.service';
import { CsGroupAddableBloc } from '@project-sunbird/client-services/blocs';
import { NavigationService } from '../../services/navigation-handler.service';
import { ProfileHandler } from '../../services/profile-handler';
import { mockSupportedUserTypeConfig } from '../../services/profile-handler.spec.data';
import { Search, SwitchableTabsConfig } from '../app.constant';
import { ContentEventType, CorrelationData, DownloadEventType, DownloadProgress, NetworkError } from '@project-sunbird/sunbird-sdk';
import { mockOnboardingConfigData } from '../components/discover/discover.page.spec.data';
describe('SearchPage', () => {
    let searchPage: SearchPage;
    window.console.warn = jest.fn()
    const mockAppGlobalService: Partial<AppGlobalService> = {
        generateSaveClickedTelemetry: jest.fn(),
        isUserLoggedIn: jest.fn(() => true),
        getCurrentUser: jest.fn(() => { }),
        getProfileSettingsStatus: jest.fn(),
        setOnBoardingCompleted: jest.fn()
    };
    const dismissFn = jest.fn(() => Promise.resolve());
    const presentFn = jest.fn(() => Promise.resolve());
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn(() => 'select-box'),
        convertFileSrc: jest.fn(() => 'img'),
        showContentComingSoonAlert: jest.fn(),
        showToast: jest.fn(),
        getLoader: jest.fn(() => ({
            present: presentFn,
            dismiss: dismissFn,
            onDidDismiss: jest.fn(() => Promise.resolve({ data: { isEnrolled: jest.fn() } }))
        })),
        getTranslatedValue: jest.fn(),
        networkInfo: {
            isNetworkAvailable: true
        }
    };
    const mockEvents: Partial<Events> = {
        unsubscribe: jest.fn(),
        publish: jest.fn()
    };
    const mockEvent: Partial<Events> = {
        unsubscribe: jest.fn(),
        subscribe: jest.fn()
    };
    const mockFrameworkService: Partial<FrameworkService> = {
        getFrameworkDetails: jest.fn()
    };
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {
        getFormFields: jest.fn(),
        getActiveChannelSuggestedFrameworkList: jest.fn(),
        getSupportedContentFilterConfig: jest.fn()
    };
    const mockHeaderService: Partial<AppHeaderService> = {
        hideHeader: jest.fn(),
        showHeaderWithBackButton: jest.fn(),
        showHeaderWithHomeButton: jest.fn()
    };
    const mockLocation: Partial<Location> = {
        back: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {
        is: jest.fn()
    };
    const mockProfileService: Partial<ProfileService> = {
        updateProfile: jest.fn(() => of())
    };
    const mockRouterExtras = {
        extras: {
            state: {
                primaryCategories: 'primaryCategories',
                corRelationList: 'corRelationList',
                source: PageId.GROUP_DETAIL,
                enrolledCourses: 'enrolledCourses' as any,
                userId: 'userId',
                shouldGenerateEndTelemetry: false,
                preAppliedFilter: {
                    query: ''
                },
            },
        }
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({extras: {state: {}}})) as any,
        navigate: jest.fn(() => Promise.resolve(true))
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn(),
        generateImpressionTelemetry: jest.fn(),
        generateBackClickedTelemetry: jest.fn(),
        generateExtraInfoTelemetry: jest.fn(),
        generatePageLoadedTelemetry: jest.fn()
    };
    const mockTranslate: Partial<TranslateService> = {
        currentLang: 'en'
    };
    const mockContentService: Partial<ContentService> = {
        searchContent: jest.fn(() => of()),
        getContentDetails: jest.fn(() => of()),
        importContent: jest.fn(() => of()),
        cancelDownload: jest.fn(() => of())
    };
    const mockpageService: Partial<PageAssembleService> = {
        getPageAssemble: jest.fn(() => of())
    };
    const mockEventsBusService: Partial<EventsBusService> = {
        events: jest.fn(() => of({}))
    };
    const mockZone: Partial<NgZone> = {
        run: jest.fn()
    };

    const mockNavCtrl: Partial<NavController> = {
        navigateForward: jest.fn(() => Promise.resolve(true))
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {
        putString: jest.fn(),
        getString: jest.fn(() => of('ka' as any))
    };
    const mockCourseService: Partial<CourseService> = {
        getCourseBatches: jest.fn(() => of()),
        getEnrolledCourses: jest.fn(() => of([]))
    };
    const mocksearchHistoryService: Partial<SearchHistoryService> = {
        getEntries: jest.fn(),
        addEntry: jest.fn(() => of())
    };
    const mockAppversion: Partial<AppVersion> = {
        getPackageName: jest.fn(() => Promise.resolve('org.sunbird.app')),
        getAppName: jest.fn(() => Promise.resolve('Sunbird'))
    };
    const mockchangeDetectionRef: Partial<ChangeDetectorRef> = {
        detectChanges: jest.fn()
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        init: jest.fn(),
        checkNewAppVersion: jest.fn(() => Promise.resolve({})),
        getFormFields: jest.fn(() => Promise.resolve([])),
        getSupportedContentFilterConfig: jest.fn()
    };
    const mockPopoverController: Partial<PopoverController> = {};
    const mockSbProgressLoader: Partial<SbProgressLoader> = {};
    const mockgroupHandlerService: Partial<GroupHandlerService> = {
        addActivityToGroup: jest.fn()
    };
    const mockNavigationService: Partial<NavigationService> = {
        navigateTo: jest.fn(),
        navigateToCollection: jest.fn(),
        navigateToDetailPage: jest.fn(),
        navigateToContent: jest.fn(),
        navigateToTrackableCollection: jest.fn()
    };

    const mockProfileHandler: Partial<ProfileHandler> = {
        getSupportedUserTypes: jest.fn(() => Promise.resolve(mockSupportedUserTypeConfig))
    };

    const mockOnboardingConfigurationService: Partial<OnboardingConfigurationService> = {
        initialOnboardingScreenName: '',
        getAppConfig: jest.fn(() => mockOnboardingConfigData)
    }


    beforeAll(() => {
        searchPage = new SearchPage(
            mockContentService as ContentService,
            mockpageService as PageAssembleService,
            mockEventsBusService as EventsBusService,
            mockSharedPreferences as SharedPreferences,
            mockProfileService as ProfileService,
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockCourseService as CourseService,
            mocksearchHistoryService as SearchHistoryService,
            mockAppversion as AppVersion,
            mockchangeDetectionRef as ChangeDetectorRef,
            mockZone as NgZone,
            mockEvent as Events,
            mockEvents as Events,
            mockAppGlobalService as AppGlobalService,
            mockPlatform as Platform,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockTranslate as TranslateService,
            mockHeaderService as AppHeaderService,
            mockPopoverController as PopoverController,
            mockLocation as Location,
            mockRouter as Router,
            mockNavCtrl as NavController,
            mockSbProgressLoader as SbProgressLoader,
            mockgroupHandlerService as GroupHandlerService,
            mockNavigationService as NavigationService,
            mockProfileHandler as ProfileHandler,
            mockOnboardingConfigurationService as OnboardingConfigurationService
        );
        const mockRouterExtras = {
            extras: {
                state: {
                    primaryCategories: 'primaryCategories',
                    corRelationList: 'corRelationList',
                    source: PageId.GROUP_DETAIL,
                    enrolledCourses: 'enrolledCourses' as any,
                    userId: 'userId',
                    shouldGenerateEndTelemetry: false,
                    preAppliedFilter: {
                        query: ''
                    },
                },
            }
        };
        mockRouter.getCurrentNavigation = jest.fn(() => mockRouterExtras) as any;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should create a instance of searchPage', () => {
        expect(searchPage).toBeTruthy();
        expect(searchPage.primaryCategories).toEqual(undefined);
    });

    // arrange
    // act
    // assert
    // describe('ngOnInit', () => {
    it('should fetch app name on ngOnInit', (done) => {
        // arrange
        const mockRouterExtras = {
            extras: {
                state: {
                    primaryCategories: 'primaryCategories',
                    corRelationList: 'corRelationList',
                    source: PageId.GROUP_DETAIL,
                    enrolledCourses: 'enrolledCourses' as any,
                    userId: 'userId',
                    shouldGenerateEndTelemetry: false,
                    preAppliedFilter: {
                        query: ''
                    },
                },
            }
        };
        mockRouter.getCurrentNavigation = jest.fn(() => mockRouterExtras) as any;
        // act
        searchPage.ngOnInit();
        // assert
        expect(mockAppversion.getAppName).toHaveBeenCalled();
        setTimeout(() => {
            expect(searchPage.appName).toEqual('Sunbird');
            done();
        }, 0);
    });

    it('should focus the search bar', (done) => {
        // arrange
        searchPage.isFirstLaunch = true;
        searchPage.source = "source";
        searchPage.searchBar = {
            setFocus: jest.fn()
        };
        jest.spyOn(searchPage, 'checkUserSession').mockImplementation();
        mockSbProgressLoader.hide = jest.fn();
        // act
        searchPage.ionViewDidEnter();
        // assert
        setTimeout(() => {
            expect(searchPage.checkUserSession).toHaveBeenCalled();
            expect(searchPage.isFirstLaunch).toBeFalsy();
            expect(mockSbProgressLoader.hide).toHaveBeenCalled();
            done();
        }, 200);
    });

    it('should focus the search bar, on else case without dialcode and has refresher', (done) => {
        // arrange
        searchPage.isFirstLaunch = true;
        searchPage.source = "source";
        searchPage.searchBar = {
            setFocus: jest.fn()
        };
        searchPage.dialCode = "abc";
        searchPage.refresher = {disabled: true} as any;
        jest.spyOn(searchPage, 'checkUserSession').mockImplementation();
        mockSbProgressLoader.hide = jest.fn();
        // act
        searchPage.ionViewDidEnter();
        // assert
        setTimeout(() => {
            expect(searchPage.checkUserSession).toHaveBeenCalled();
            expect(searchPage.isFirstLaunch).toBeTruthy();
            expect(mockSbProgressLoader.hide).toHaveBeenCalled();
            done();
        }, 200);
    });

    it('should set current FrameworkId', (done) => {
        // arrange
        // act
        searchPage.getFrameworkId();
        // assert
        expect(mockSharedPreferences.getString).toHaveBeenCalled();
        setTimeout(() => {
            expect(searchPage.currentFrameworkId).toEqual('ka');
            done();
        }, 0);
    });

    it('should set current FrameworkId', (done) => {
        // arrange
        mockSharedPreferences.getString = jest.fn(() => throwError({error:''}))
        // act
        searchPage.getFrameworkId();
        // assert
        expect(mockSharedPreferences.getString).toHaveBeenCalled();
        setTimeout(() => {
            done();
        }, 0);
    });

    describe('onSearchHistoryTap', () => {
        it('onSearchHistoryTap', (done) => {
            // arrange
            jest.spyOn(searchPage, 'handleSearch').mockImplementation();
            const searchEntry = {
                query: 'query'
            };
            // act
            searchPage.onSearchHistoryTap(searchEntry);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.SEARCH_HISTORY_CLICKED,
                    Environment.HOME,
                    PageId.SEARCH,
                    undefined,
                    {
                        selectedSearchHistory: searchEntry.query
                    },
                    undefined,
                    expect.anything()
                );
                done()
            }, 0);
        });
    });

    describe('navigateToPreviousPage', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });
        it('should navigateToPreviousPage', () => {
            // arrange
            searchPage.shouldGenerateEndTelemetry = true;
            jest.spyOn(searchPage, 'generateQRSessionEndEvent').mockImplementation();
            // act
            searchPage.navigateToPreviousPage();
            // assert
            expect(mockLocation.back).toHaveBeenCalled();
        });
        it('should navigateToPreviousPage', () => {
            // arrange
            searchPage.shouldGenerateEndTelemetry = false;
            mockAppGlobalService.isGuestUser = jest.fn(() => true);
            // act
            searchPage.navigateToPreviousPage();
            // assert
            expect(mockLocation.back).toHaveBeenCalled();
        });
        it('should navigate to profilesettings', () => {
            // arrange
            searchPage.shouldGenerateEndTelemetry = false;
            searchPage.source = PageId.ONBOARDING_PROFILE_PREFERENCES;
            mockAppGlobalService.isGuestUser = jest.fn(() => true);
            // act
            searchPage.navigateToPreviousPage();
            // assert
            expect(mockRouter.navigate).toHaveBeenCalledWith(
                [`/${RouterLinks.PROFILE_SETTINGS}`],
                expect.anything()
            );
        });
        it('should navigate to profilesettings', () => {
            // arrange
            searchPage.shouldGenerateEndTelemetry = false;
            searchPage.source = PageId.ONBOARDING_PROFILE_PREFERENCES;
            mockAppGlobalService.isGuestUser = jest.fn(() => true);
            mockAppGlobalService.isOnBoardingCompleted = jest.fn(() => true);
            mockAppGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE = jest.fn(() => true);
            // act
            searchPage.navigateToPreviousPage();
            // assert
            expect(mockRouter.navigate).toHaveBeenCalledWith(
                [`/${RouterLinks.PROFILE_SETTINGS}`],
                expect.anything()
            );
        });
        it('should navigate to district mapping', (done) => {
            // arrange
            searchPage.shouldGenerateEndTelemetry = false;
            searchPage.source = PageId.ONBOARDING_PROFILE_PREFERENCES;
            mockAppGlobalService.isGuestUser = jest.fn(() => true);
            mockAppGlobalService.isOnBoardingCompleted = jest.fn(() => true);
            mockAppGlobalService.isProfileSettingsCompleted = jest.fn(() => true);
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(false));
            // act
            searchPage.navigateToPreviousPage();
            // assert
            setTimeout(() => {
                expect(mockNavCtrl.navigateForward).toHaveBeenCalledWith(
                    [`/${RouterLinks.DISTRICT_MAPPING}`],
                    expect.anything()
                );
                done();
            }, 0);
        });
        it('should navigate to tabs page', (done) => {
            // arrange
            searchPage.shouldGenerateEndTelemetry = false;
            searchPage.source = PageId.ONBOARDING_PROFILE_PREFERENCES;
            mockAppGlobalService.isGuestUser = jest.fn(() => true);
            mockAppGlobalService.isOnBoardingCompleted = jest.fn(() => true);
            mockAppGlobalService.isProfileSettingsCompleted = jest.fn(() => true);
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(true));
            // act
            searchPage.navigateToPreviousPage();
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith(
                    [`/${RouterLinks.TABS}`],
                    expect.anything()
                );
                done();
            }, 0);
        });
    });

    describe('openCollection', () => {
        beforeEach(() => {
            const state = {
                pageIds: [],
                groupId: 'g1',
                params: {}
            };
            jest.spyOn(CsGroupAddableBloc.instance, 'state', 'get').mockReturnValue(state);
            jest.spyOn(CsGroupAddableBloc.instance, 'updateState').mockImplementation();
        });
        it('openCollection', () => {
            // arrange
            const collection = {
                identifier: 'identifier',
                contentType: 'collection'
            };
            mockAppGlobalService.isOnBoardingCompleted = false;
            mockTelemetryGeneratorService.isCollection = jest.fn(() => true);
            // act
            searchPage.openCollection(collection);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.CONTENT_CLICKED,
                Environment.ONBOARDING,
                PageId.DIAL_SEARCH,
                { id: 'identifier', type: 'collection', version: '' },
                { root: true },
                undefined,
                undefined
            );
        });
        it('openCollection', () => {
            // arrange
            const collection = {
                identifier: 'identifier',
                contentType: 'Course'
            };
            mockTelemetryGeneratorService.isCollection = jest.fn(() => true);
            searchPage.isDialCodeSearch = true;
            mockAppGlobalService.isOnBoardingCompleted = jest.fn(() => false);
            mockAppGlobalService.getProfileSettingsStatus = jest.fn(() => Promise.resolve(true));
            searchPage.guestUser = true;
            // act
            searchPage.openCollection(collection);
            // assert
            setTimeout(() => {
                
                expect(mockNavigationService.navigateToTrackableCollection).toHaveBeenCalled()
            }, 0);
        });
        it('should set enrolled courses', (done) => {
            // arrange
            const collection = {
                identifier: 'identifier',
                contentType: 'Course'
            };
            mockTelemetryGeneratorService.isCollection = jest.fn(() => true);
            searchPage.isDialCodeSearch = true;
            mockAppGlobalService.isOnBoardingCompleted = jest.fn(() => false);
            mockAppGlobalService.getProfileSettingsStatus = jest.fn(() => Promise.resolve(true));
            searchPage.guestUser = false;
            searchPage.isSingleContent = true;
            mockAppGlobalService.setEnrolledCourseList = jest.fn();
            const kgetEnrolledCoursesResp = [{ identifier: 'identifier' }];
            mockCourseService.getEnrolledCourses = jest.fn(() => of(kgetEnrolledCoursesResp));
            searchPage.showLoader = false;
            // act
            searchPage.openCollection(collection);
            // assert
            setTimeout(() => {
                expect(searchPage.enrolledCourses.length).toEqual(1);
                done();
            }, 0);
        });
        it('should set enrolled courses to empty array', (done) => {
            // arrange
            const collection = {
                identifier: 'identifier',
                contentType: 'Course'
            };
            mockTelemetryGeneratorService.isCollection = jest.fn(() => true);
            searchPage.isDialCodeSearch = true;
            mockAppGlobalService.isOnBoardingCompleted = jest.fn(() => false);
            mockAppGlobalService.getProfileSettingsStatus = jest.fn(() => Promise.resolve(true));
            searchPage.guestUser = false;
            mockAppGlobalService.setEnrolledCourseList = jest.fn();
            mockCourseService.getEnrolledCourses = jest.fn(() => throwError({}));
            // act
            searchPage.openCollection(collection);
            // assert
            setTimeout(() => {
                expect(searchPage.enrolledCourses.length).toEqual(0);
                expect(searchPage.showLoader).toBe(false);
                done();
            }, 0);
        });
        it('should navigate to qrcode result page', (done) => {
            // arrange
            const collection = {
                identifier: 'identifier',
                mimeType: MimeType.COLLECTION,
                contentType: 'collection'
            };
            mockTelemetryGeneratorService.isCollection = jest.fn(() => true);
            searchPage.isDialCodeSearch = true;
            mockAppGlobalService.isOnBoardingCompleted = jest.fn(() => true);
            mockAppGlobalService.getProfileSettingsStatus = jest.fn(() => Promise.resolve(true));
            searchPage.guestUser = false;
            // act
            searchPage.openCollection(collection);
            // assert
            setTimeout(() => {
                expect(mockNavigationService.navigateToCollection).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should navigate to content details page', (done) => {
            // arrange
            const collection = {
                identifier: 'identifier',
                mimeType: 'MimeType.COLLECTION',
                contentType: 'collection'
            };
            mockTelemetryGeneratorService.isCollection = jest.fn(() => true);
            searchPage.isDialCodeSearch = true;
            mockAppGlobalService.isOnBoardingCompleted = jest.fn(() => false);
            mockAppGlobalService.getProfileSettingsStatus = jest.fn(() => Promise.resolve(true));
            searchPage.guestUser = false;
            // act
            searchPage.openCollection(collection);
            // assert
            setTimeout(() => {
                
                expect(mockNavigationService.navigateToContent).toHaveBeenCalled()
                done();
            }, 0);
        });
        it('should generate a end telemetry and set onboarding completed', (done) => {
            // arrange
            const collection = {
                identifier: 'identifier',
                mimeType: 'MimeType.COLLECTION',
                contentType: 'collection'
            };
            searchPage.shouldGenerateEndTelemetry = true;
            searchPage.isDialCodeSearch = true;
            mockAppGlobalService.isOnBoardingCompleted = jest.fn(() => false);
            mockAppGlobalService.getProfileSettingsStatus = jest.fn(() => Promise.resolve(true));
            mockAppGlobalService.setOnBoardingCompleted = jest.fn()
            // act
            searchPage.openCollection(collection);
            // assert
            setTimeout(() => {
                done();
            }, 0);
        })
    });

    describe('set grade and medium', () => {
        it('should reset grade', () => {
            // arrange
            searchPage.profile = {} as any;
            // act
            searchPage.setGrade(true, ['grade1']);
            // assert
            expect(searchPage.profile.grade.length).toEqual(1);
        });
        it('should reset grade, if no grade', () => {
            // arrange
            searchPage.profile = {} as any;
            // act
            searchPage.setGrade(true, ['']);
            // assert
            expect(searchPage.profile.grade.length).toEqual(0);
        });
        it('should set grade', () => {
            // arrange
            searchPage.profile = {
                grade: ['grade']
            } as any;
            // act
            searchPage.setGrade(false, ['grade1']);
            // assert
            expect(searchPage.profile.grade.length).toEqual(2);
        });
        it('should reset medium', () => {
            // arrange
            searchPage.profile = {} as any;
            // act
            searchPage.setMedium(true, ['medium1']);
            // assert
            expect(searchPage.profile.medium.length).toEqual(1);
        });
        it('should reset medium, if no medium', () => {
            // arrange
            searchPage.profile = {} as any;
            // act
            searchPage.setMedium(true, ['']);
            // assert
            expect(searchPage.profile.medium.length).toEqual(0);
        });
        it('should set medium', () => {
            // arrange
            searchPage.profile = {
                medium: ['medium']
            } as any;
            // act
            searchPage.setMedium(false, ['medium1']);
            // assert
            expect(searchPage.profile.medium.length).toEqual(2);
        });
        it('should find code of a category', () => {
            // arrange
            const categoryType = 'grade';
            const categoryList = [{ name: 'sampleName', code: 'sampleCode' }];
            const data = { grade: 'sampleName' };
            // assert
            expect(searchPage.findCode(categoryList, data, categoryType)).toEqual('sampleCode');
        });
        it('should find code of a category', () => {
            // arrange
            const categoryType = 'grade';
            const categoryList = [{ name: 'sampleName', code: 'sampleCode' }];
            const data = { grade: 'Name' };
            // assert
            expect(searchPage.findCode(categoryList, data, categoryType)).toBeUndefined();
        });
    });
    describe('setCurrentProfile', () => {
        it('should set current profile', () => {
            // arrange
            searchPage.profile = {medium: []};
            const data = {
                framework: 'framework',
                board: 'board',
                medium: []
            };
            jest.spyOn(searchPage, 'setMedium').mockImplementation();
            jest.spyOn(searchPage, 'setGrade').mockImplementation();
            jest.spyOn(searchPage, 'editProfile').mockImplementation();
            // act
            searchPage.setCurrentProfile(0, data);
            // assert
            expect(searchPage.setMedium).toHaveBeenCalledWith(
                true,
                data.medium
            );
            expect(searchPage.editProfile).toHaveBeenCalled();
            expect(searchPage.profile.board).toEqual(['board']);
        });
        it('should set current profile', () => {
            // arrange
            searchPage.profile = {medium: ['medium1']};
            const data = {
                framework: 'framework',
                board: 'board',
                medium: ['medium1']
            };
            jest.spyOn(searchPage, 'setMedium').mockImplementation();
            jest.spyOn(searchPage, 'setGrade').mockImplementation();
            jest.spyOn(searchPage, 'editProfile').mockImplementation();
            // act
            searchPage.setCurrentProfile(1, data);
            // assert
            expect(searchPage.setMedium).toHaveBeenCalledWith(
                true,
                data.medium
            );
            expect(searchPage.editProfile).toHaveBeenCalled();
            expect(searchPage.profile.board).toEqual(['board']);
        });
        it('should set current profile', () => {
            // arrange
            searchPage.profile = {};
            const data = {
                medium: ['medium1']
            };
            jest.spyOn(searchPage, 'setMedium').mockImplementation();
            jest.spyOn(searchPage, 'editProfile').mockImplementation();
            // act
            searchPage.setCurrentProfile(2, data);
            // assert
            expect(searchPage.setMedium).toHaveBeenCalledWith(
                false,
                data.medium
            );
            expect(searchPage.editProfile).toHaveBeenCalled();
        });
        it('should set current profile', () => {
            // arrange
            searchPage.profile = {};
            const data = {
                gradeLevel: ['grade1']
            };
            jest.spyOn(searchPage, 'setGrade').mockImplementation();
            jest.spyOn(searchPage, 'editProfile').mockImplementation();
            // act
            searchPage.setCurrentProfile(3, data);
            // assert
            expect(searchPage.setGrade).toHaveBeenCalledWith(
                false,
                data.gradeLevel
            );
            expect(searchPage.editProfile).toHaveBeenCalled();
        });
    });
    describe('checkProfileData', () => {
        it('should return if no data framework', () => {
            // arrange
            const data = {};
            const profile = {syllabus: ['framework1']};
            // act
            searchPage.checkProfileData(data, profile);
            // assert
        })
        it('should set profile data accordingly', () => {
            // arrange
            const data = {
                framework: 'framework1',
                board: ['board1']
            };
            const profile = {
                syllabus: ['framework1']
            };
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of([{ identifier: 'fm', name: 'fm' }]));
            // act
            searchPage.checkProfileData(data, profile);
            // assert
            expect(mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList).toHaveBeenCalledWith(
                {
                    language: 'en',
                    requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
                }
            );
        });
        it('should set profile data accordingly, else case if framework or board are different', () => {
            // arrange
            const data = {
                framework: 'framework',
                board: ''
            };
            const profile = {
                syllabus: ['framework1']
            };
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of([{ identifier: 'framework', name: 'board1' }]));
            // act
            searchPage.checkProfileData(data, profile);
            // assert
            expect(mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList).toHaveBeenCalledWith(
                {
                    language: 'en',
                    requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
                }
            );
        });
        it('should set profile data accordingly', (done) => {
            // arrange
            const data = {
                framework: 'framework1',
                board: 'board',
                medium: ['medium1'],
                gradeLevel: ['grade1'],
                contentType: 'Resource'
            };
            const profile = {
                syllabus: ['framework']
            };
            const getActiveChannelSuggestedFrameworkListResp = [{ identifier: 'framework1', name: 'framework1' }];
            const getFrameworkDetailsResp = {
                categories: [
                    {
                        code: 'board',
                        terms: [
                            { code: 'boardcode', name: 'board' }
                        ]
                    },
                    {
                        code: 'medium',
                        terms: [
                            { code: 'medium1code', name: 'medium1' }
                        ]
                    },
                    {
                        code: 'gradeLevel',
                        terms: [
                            { code: 'grade1code', name: 'grade1' }
                        ]
                    }
                ]
            };
            jest.spyOn(searchPage, 'setCurrentProfile').mockImplementation();
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(getActiveChannelSuggestedFrameworkListResp));
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of(getFrameworkDetailsResp));
            // act
            searchPage.checkProfileData(data, profile);
            // assert
            setTimeout(() => {
                expect(searchPage.isProfileUpdated).toEqual(true);
                expect(mockFrameworkService.getFrameworkDetails).toHaveBeenCalled();
                expect(searchPage.boardList).toEqual(getFrameworkDetailsResp.categories[0].terms);
                done();
            }, 0);
        });
        it('should set profile data accordingly', (done) => {
            // arrange
            const data = {
                framework: 'framework1',
                board: 'board',
                medium: 'medium1',
                gradeLevel: ['grade1'],
                contentType: 'Resource'
            };
            const profile = {
                syllabus: ['framework1'],
                board: ['b1', 'b2']
            };
            const getActiveChannelSuggestedFrameworkListResp = [{ identifier: 'framework1', name: 'framework1' }];
            const getFrameworkDetailsResp = {
                categories: [
                    {
                        code: 'board',
                        terms: [
                            { code: 'boardcode', name: 'board' }
                        ]
                    },
                    {
                        code: 'medium',
                        terms: [
                            { code: 'medium1code', name: 'medium1' }
                        ]
                    },
                    {
                        code: 'gradeLevel',
                        terms: [
                            { code: 'grade1code', name: 'grade1' }
                        ]
                    }
                ]
            };
            jest.spyOn(searchPage, 'setCurrentProfile').mockImplementation();
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(getActiveChannelSuggestedFrameworkListResp));
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of(getFrameworkDetailsResp));
            // act
            searchPage.checkProfileData(data, profile);
            // assert
            setTimeout(() => {
                expect(searchPage.isProfileUpdated).toEqual(true);
                expect(mockFrameworkService.getFrameworkDetails).toHaveBeenCalled();
                expect(searchPage.boardList).toEqual(getFrameworkDetailsResp.categories[0].terms);
                done();
            }, 0);
        });
        it('should set profile data accordingly', (done) => {
            // arrange
            const data = {
                framework: 'framework1',
                board: 'board',
                medium: ['medium1'],
                gradeLevel: ['grade1'],
                contentType: 'Resource'
            };
            const profile = {
                syllabus: ['framework1'],
                board: ['boardcode']
            };
            const getActiveChannelSuggestedFrameworkListResp = [{ identifier: 'framework1', name: 'framework1' }];
            const getFrameworkDetailsResp = {
                categories: [
                    {
                        code: 'board',
                        terms: [
                            { code: 'boardcode', name: 'board' }
                        ]
                    },
                    {
                        code: 'medium',
                        terms: [
                            { code: 'medium1code', name: 'medium1' }
                        ]
                    },
                    {
                        code: 'gradeLevel',
                        terms: [
                            { code: 'grade1code', name: 'grade1' }
                        ]
                    }
                ]
            };
            jest.spyOn(searchPage, 'setCurrentProfile').mockImplementation();
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(getActiveChannelSuggestedFrameworkListResp));
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of(getFrameworkDetailsResp));
            // act
            searchPage.checkProfileData(data, profile);
            // assert
            setTimeout(() => {
                expect(searchPage.isProfileUpdated).toEqual(true);
                expect(mockFrameworkService.getFrameworkDetails).toHaveBeenCalled();
                expect(searchPage.boardList).toEqual(getFrameworkDetailsResp.categories[0].terms);
                expect(searchPage.setCurrentProfile).toHaveBeenCalledWith(
                    3,
                    data
                );
                done();
            }, 0);
        });
        
        it('should set profile data accordingly', (done) => {
            // arrange
            const data = {
                framework: 'framework1',
                board: '',
                medium: '',
                gradeLevel: '',
                contentType: 'Resource'
            };
            const profile = {
                syllabus: ['framework1'],
                board: ['boardcode'],
                medium: ['medium1'],
                grade: ['grade1']
            };
            const getActiveChannelSuggestedFrameworkListResp = [{ identifier: 'framework1', name: 'framework1' }];
            const getFrameworkDetailsResp = {
                categories: [
                    {
                        code: 'board',
                        terms: [
                            { code: 'boardcode', name: 'board' }
                        ]
                    },
                    {
                        code: 'medium',
                        terms: [
                            { code: 'medium1', name: 'medium1' }
                        ]
                    },
                    {
                        code: 'gradeLevel',
                        terms: [
                            { code: 'grade1', name: 'grade1' }
                        ]
                    }
                ]
            };
            jest.spyOn(searchPage, 'setCurrentProfile').mockImplementation();
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(getActiveChannelSuggestedFrameworkListResp));
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of(getFrameworkDetailsResp));
            // act
            searchPage.checkProfileData(data, profile);
            // assert
            setTimeout(() => {
                expect(searchPage.isProfileUpdated).toEqual(true);
                expect(searchPage.boardList).toEqual(getFrameworkDetailsResp.categories[0].terms);
                done();
            }, 10);
        });

        it('should set profile data accordingly', (done) => {
            // arrange
            const data = {
                framework: 'framework1',
                board: 'board',
                medium: ['medium1'],
                gradeLevel: ['grade1'],
                contentType: 'Resource'
            };
            const profile = {
                syllabus: ['framework1'],
                board: ['boardcode'],
                medium: ['medium1'],
                grade: ['grade1']
            };
            const getActiveChannelSuggestedFrameworkListResp = [{ identifier: 'framework1', name: 'framework1' }];
            const getFrameworkDetailsResp = {
                categories: [
                    {
                        code: 'board',
                        terms: [
                            { code: 'boardcode', name: 'board' }
                        ]
                    },
                    {
                        code: 'medium',
                        terms: [
                            { code: 'medium1', name: 'medium1' }
                        ]
                    },
                    {
                        code: 'gradeLevel',
                        terms: [
                            { code: 'grade1', name: 'grade1' }
                        ]
                    }
                ]
            };
            jest.spyOn(searchPage, 'setCurrentProfile').mockImplementation();
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(getActiveChannelSuggestedFrameworkListResp));
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of(getFrameworkDetailsResp));
            // act
            searchPage.checkProfileData(data, profile);
            // assert
            setTimeout(() => {
                expect(searchPage.isProfileUpdated).toEqual(true);
                expect(searchPage.boardList).toEqual(getFrameworkDetailsResp.categories[0].terms);
                done();
            }, 10);
        });

        it('should set profile data accordingly', (done) => {
            // arrange
            const data = {
                framework: 'framework1',
                board: 'board',
                medium: '',
                gradeLevel: '',
                contentType: 'Resource'
            };
            const profile = {
                syllabus: ['framework1'],
                board: ['boardcode'],
                medium: ['medium1'],
                grade: ['grade1']
            };
            const getActiveChannelSuggestedFrameworkListResp = [{ identifier: 'framework1', name: 'framework1' }];
            const getFrameworkDetailsResp = {
                categories: [
                    {
                        code: 'board',
                        terms: [
                            { code: 'boardcode', name: 'board' }
                        ]
                    },
                    {
                        code: 'medium',
                        terms: [
                            { code: 'medium1', name: 'medium1' }
                        ]
                    },
                    {
                        code: 'gradeLevel',
                        terms: [
                            { code: 'grade1', name: 'grade1' }
                        ]
                    }
                ]
            };
            jest.spyOn(searchPage, 'setCurrentProfile').mockImplementation();
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(getActiveChannelSuggestedFrameworkListResp));
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of(getFrameworkDetailsResp));
            // act
            searchPage.checkProfileData(data, profile);
            // assert
            setTimeout(() => {
                expect(searchPage.isProfileUpdated).toEqual(true);
                expect(searchPage.boardList).toEqual(getFrameworkDetailsResp.categories[0].terms);
                done();
            }, 10);
        });


        it('should set profile data accordingly', (done) => {
            // arrange
            const data = {
                framework: 'framework1',
                board: 'board',
                medium: ['medium1'],
                gradeLevel: '',
                contentType: 'Resource'
            };
            const profile = {
                syllabus: ['framework1'],
                board: ['boardcode'],
                medium: ['medium1'],
                grade: ['grade1']
            };
            const getActiveChannelSuggestedFrameworkListResp = [{ identifier: 'framework1', name: 'framework1' }];
            const getFrameworkDetailsResp = {
                categories: [
                    {
                        code: 'board',
                        terms: [
                            { code: 'boardcode', name: 'board' }
                        ]
                    },
                    {
                        code: 'medium',
                        terms: [
                            { code: 'medium1', name: 'medium1' }
                        ]
                    },
                    {
                        code: 'gradeLevel',
                        terms: [
                            { code: 'grade1', name: 'grade1' }
                        ]
                    }
                ]
            };
            jest.spyOn(searchPage, 'setCurrentProfile').mockImplementation();
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(getActiveChannelSuggestedFrameworkListResp));
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of(getFrameworkDetailsResp));
            // act
            searchPage.checkProfileData(data, profile);
            // assert
            setTimeout(() => {
                expect(searchPage.isProfileUpdated).toEqual(true);
                expect(searchPage.boardList).toEqual(getFrameworkDetailsResp.categories[0].terms);
                done();
            }, 10);
        });
        it('should set profile data accordingly', (done) => {
            // arrange
            const data = {
                framework: 'framework1',
                contentType: 'Resource'
            };
            const profile = {
                syllabus: ['framework1']
            };
            const getActiveChannelSuggestedFrameworkListResp = [{ identifier: 'framework1', name: 'framework1' }];
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(getActiveChannelSuggestedFrameworkListResp));
            mockFrameworkService.getFrameworkDetails = jest.fn(() => throwError(new NetworkError('No_Internet')));
            // act
            searchPage.checkProfileData(data, profile);
            // assert
            setTimeout(() => {
                expect(searchPage.isProfileUpdated).toEqual(true);
                done();
            }, 0);
        });
        it('should set profile data accordingly', (done) => {
            // arrange
            const data = {
                framework: 'framework1',
                contentType: 'Resource'
            };
            const profile = {
                syllabus: ['framework1']
            };
            const getActiveChannelSuggestedFrameworkListResp = [{ identifier: 'framework1', name: 'framework1' }];
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(getActiveChannelSuggestedFrameworkListResp));
            mockFrameworkService.getFrameworkDetails = jest.fn(() => throwError({error: 'No_Internet'}));
            // act
            searchPage.checkProfileData(data, profile);
            // assert
            setTimeout(() => {
                expect(searchPage.isProfileUpdated).toEqual(true);
                   done();
            }, 0);
        });
        it('should handle error on get active channel ', () => {
            // arrange
            const data = {
                framework: 'framework1'
            };
            const profile = {
                syllabus: ['framework1']
            };
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => throwError(new NetworkError('No_Internet')));
            // act
            searchPage.checkProfileData(data, profile);
            // assert
            setTimeout(() => {
                // expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_OFFLINE_MODE')
            }, 0);
        })
    });
    describe('editProfile', () => {
        it('should edit Profile', (done) => {
            // arrange
            searchPage.gradeList = [{ code: 'grade1', name: 'grade1' }];
            searchPage.profile = {
                grade: ['grade1'],
                gradeValue: {
                    grade1: 'grade1'
                }
            };
            mockProfileService.updateProfile = jest.fn(() => of({ syllabus: 'sylabus' }));
            mockCommonUtilService.handleToTopicBasedNotification = jest.fn();
            // act
            searchPage.editProfile();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.handleToTopicBasedNotification).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should edit Profile, handle else if no grades length', (done) => {
            // arrange
            searchPage.gradeList = [{ code: 'grade1', name: 'grade1' }];
            searchPage.profile = {
                grade: [],
                gradeValue: {
                    grade1: 'grade1'
                }
            };
            mockProfileService.updateProfile = jest.fn(() => of({ syllabus: 'sylabus' }));
            mockCommonUtilService.handleToTopicBasedNotification = jest.fn();
            // act
            searchPage.editProfile();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.handleToTopicBasedNotification).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should edit Profile and publish event for on boarding', (done) => {
            // arrange
            searchPage.gradeList = [{ code: 'grade', name: 'grade1' }];
            searchPage.profile = {
                grade: ['grade1'],
                gradeValue: {
                    grade1: 'grade1'
                }
            };
            mockProfileService.updateProfile = jest.fn(() => of({ syllabus: ['sylabus1', 'sylabus2'], board: ['board1', 'board2'], grade:['grade1', 'grade2'], medium: ['english', 'hindi']}));
            mockEvents.publish = jest.fn();
            mockAppGlobalService.setOnBoardingCompleted = jest.fn()
            // act
            searchPage.editProfile();
            // assert
            setTimeout(() => {
                expect(mockEvents.publish).toHaveBeenCalledWith('user-profile-changed');
                expect(mockEvents.publish).toHaveBeenCalledWith('refresh:profile');
                expect(mockAppGlobalService.setOnBoardingCompleted).toHaveBeenCalled();
                done();
            }, 0);
        });
    });
    describe('openContent', () => {
        it('should open content', () => {
            // arrange
            jest.spyOn(searchPage, 'generateInteractEvent').mockImplementation();
            jest.spyOn(searchPage, 'checkParent').mockImplementation();
            const contentMock = {
                identifier: 'id1',
                contentType: 'type1',
                pkgVersion: '1'
            };
            // act
            searchPage.openContent('collection', contentMock);
            // assert
            expect(searchPage.generateInteractEvent).toHaveBeenCalledWith(
                contentMock.identifier,
                contentMock.contentType,
                contentMock.pkgVersion,
                0
            );
            expect(searchPage.parentContent).toEqual('collection');
            expect(searchPage.checkParent).toHaveBeenCalled();

        });
        it('should navigate to batch list popup', (done) => {
            // arrange
            jest.spyOn(searchPage, 'generateInteractEvent').mockImplementation();
            jest.spyOn(searchPage, 'navigateToBatchListPopup').mockImplementation();
            mockAppGlobalService.setEnrolledCourseList = jest.fn();
            const kgetEnrolledCoursesResp = [
                {
                    contentId: 'id1',
                    cProgress: 80,
                    batch: {
                        status: 2
                    }
                }
            ];
            searchPage.enrolledCourses = kgetEnrolledCoursesResp;
            mockCourseService.getEnrolledCourses = jest.fn(() => of(kgetEnrolledCoursesResp));
            const contentMock = {
                identifier: 'id1',
                contentType: 'type1',
                pkgVersion: '1'
            };
            // act
            searchPage.openContent(undefined, contentMock, 0, undefined);
            // assert
            expect(searchPage.generateInteractEvent).toHaveBeenCalled();
            setTimeout(() => {
                expect(mockCourseService.getEnrolledCourses).toHaveBeenCalledWith({"returnFreshCourses": true, "userId": undefined});
                done();
            }, 0);
        });
        it('should show content details', (done) => {
            // arrange
            jest.spyOn(searchPage, 'generateInteractEvent').mockImplementation();
            jest.spyOn(searchPage, 'navigateToBatchListPopup').mockImplementation();
            mockAppGlobalService.setEnrolledCourseList = jest.fn();
            const kgetEnrolledCoursesResp = [
                {
                    contentId: 'id1',
                    cProgress: 80,
                    batch: {
                        status: 1
                    }
                }
            ];
            searchPage.enrolledCourses = kgetEnrolledCoursesResp;
            mockCourseService.getEnrolledCourses = jest.fn(() => of(kgetEnrolledCoursesResp));
            const contentMock = {
                identifier: 'id1',
                contentType: 'type1',
                pkgVersion: '1'
            };
            jest.spyOn(searchPage, 'showContentDetails').mockImplementation();
            // act
            searchPage.openContent(undefined, contentMock, 0, undefined);
            // assert
            expect(searchPage.generateInteractEvent).toHaveBeenCalled();
            setTimeout(() => {
                expect(mockCourseService.getEnrolledCourses).toHaveBeenCalledWith({"returnFreshCourses": true, "userId": undefined});
                done();
            }, 0);
        });
        it('should set selected for elements on opening a content', (done) => {
            // arrange
            searchPage.isFromGroupFlow = true;
            searchPage.searchContentResult = [{selected: false}, {selected: true}, {selected: false}]
            searchPage.showAddToGroupButtons = true;
            const contentMock = {
                identifier: 'id1',
                contentType: 'type1',
                pkgVersion: '1'
            };
            // act
            searchPage.openContent(undefined, contentMock, 1, undefined, true);
            // assert
            setTimeout(() => {
                done();
            }, 0);
        });
    });
    describe('showFilter', () => {
        it('should goto filter page on showFilter', (done) => {
            // arrange
            searchPage.source = 'source';
            searchPage.searchFilterConfig = [{code: 'name', name:'name', translation: 'msg'}]
            searchPage.initialFilterCriteria = {
                facetFilters: [{ name: 'name' }]
            };
            searchPage.responseData = {
                filterCriteria: {
                    facetFilters: [{ name: 'name' }]
                }
            };
            const getLibraryFilterConfigResp = [
                { name: 'name', code: 'code' }
            ];
            mockCommonUtilService.getTranslatedValue = jest.fn(() => 'translation');
            mockFormAndFrameworkUtilService.getLibraryFilterConfig = jest.fn(() => Promise.resolve(getLibraryFilterConfigResp));
            // act
            searchPage.showFilter();
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.FILTER_BUTTON_CLICKED,
                Environment.HOME,
                'source'
            );
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should goto filter page on showFilter, handle else cndtn', (done) => {
            // arrange
            searchPage.source = '';
            searchPage.searchFilterConfig = [{code: 'name', name:'name', translation: 'msg'}]
            searchPage.initialFilterCriteria = {
                facetFilters: [{ name: 'name2' }]
            };
            searchPage.responseData = {
                filterCriteria: {
                    facetFilters: [{ name: 'name1' }]
                }
            };
            const getLibraryFilterConfigResp = [
                { name: 'name', code: 'code' }
            ];
            mockCommonUtilService.getTranslatedValue = jest.fn(() => 'translation');
            mockFormAndFrameworkUtilService.getLibraryFilterConfig = jest.fn(() => Promise.resolve(getLibraryFilterConfigResp));
            // act
            searchPage.showFilter();
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.FILTER_BUTTON_CLICKED,
                Environment.HOME,
                'search'
            );
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalled();
                done();
            }, 0);
        });
    });
    describe('applyFilter and handleCancel', () => {
        it('should catch error on searchcontent', () => { 
            // arrange
            mockContentService.searchContent = jest.fn(() => throwError({}));
            searchPage.showLoader = false;
            mockZone.run = jest.fn((fn) => fn());
            // act
            searchPage.applyFilter();
            // assert
            setTimeout(() => {
                expect(mockZone.run).toHaveBeenCalled();
            }, 0);
        })
        it('should undefined or empty response on searchcontent', () => { 
            // arrange
            mockContentService.searchContent = jest.fn(() => of());
            searchPage.isEmptyResult = true;
            // act
            searchPage.applyFilter();
        })
        it('should updateFilterIcon on applyFilter, if no audience name for facet filter', (done) => {
            // arrange
            const offset = 10;
            const searchContentResp = ''
            searchPage.responseData = {
                filterCriteria: {
                    facetFilters: [{ name: 'audience1', values: ['val1'] }],
                    offset: offset
                }
            };
            jest.spyOn(searchPage, 'updateFilterIcon').mockImplementation();
            jest.spyOn(searchPage, 'fetchPrimaryCategoryFilters').mockImplementation();
            mockContentService.searchContent = jest.fn(() => of(searchContentResp));
            searchPage.isDialCodeSearch = false;
            // act
            searchPage.applyFilter(offset);
            // assert
            setTimeout(() => {
                done();
            }, 0);
        });
        it('should updateFilterIcon on applyFilter', (done) => {
            // arrange
            const offset = 10;
            const searchContentResp = {
                contentDataList: [{data: []}, {data: []}],
                count: 10,
                filterCriteria: {
                    facetFilters: [{ name: 'audience', values: ['val1'] }],
                    offset: 10
                }
            };
            searchPage.responseData = {
                filterCriteria: {
                    facetFilters: [{ name: 'audience', values: ['val1'] }],
                    offset: offset
                }
            };
            jest.spyOn(searchPage, 'updateFilterIcon').mockImplementation();
            jest.spyOn(searchPage, 'fetchPrimaryCategoryFilters').mockImplementation();
            mockContentService.searchContent = jest.fn(() => of(searchContentResp));
            searchPage.isDialCodeSearch = false;
            // act
            searchPage.applyFilter(offset);
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateExtraInfoTelemetry).toHaveBeenCalled();
                expect(searchPage.updateFilterIcon).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should updateFilterIcon for 0 offset on applyFilter', (done) => {
            // arrange
            const searchContentResp = {
                contentDataList: [{data: []}, {data: []}],
                count: 10,
                filterCriteria: {
                    facetFilters: [{ name: 'audience', values: ['val1'] }],
                    offset: 0
                }
            };
            searchPage.responseData = {
                filterCriteria: {
                    facetFilters: [{ name: 'audience', values: ['val1'] }],
                }
            };
            jest.spyOn(searchPage, 'updateFilterIcon').mockImplementation();
            jest.spyOn(searchPage, 'fetchPrimaryCategoryFilters').mockImplementation();
            mockContentService.searchContent = jest.fn(() => of(searchContentResp));
            searchPage.isDialCodeSearch = false;
            // act
            searchPage.applyFilter();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateExtraInfoTelemetry).toHaveBeenCalled();
                expect(searchPage.updateFilterIcon).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should process dailcoderesult on applyFilter', (done) => {
            // arrange
            const searchContentResp = {
                contentDataList: [{data: []}],
                count: 10
            };
            searchPage.responseData = {
                filterCriteria: {
                    facetFilters: [{ name: 'audience', values: ['val1'] }]
                }
            };
            jest.spyOn(searchPage, 'processDialCodeResult').mockImplementation();
            mockContentService.searchContent = jest.fn(() => of(searchContentResp));
            mockTelemetryGeneratorService.generateExtraInfoTelemetry = jest.fn()
            searchPage.isDialCodeSearch = true;
            // act
            searchPage.applyFilter();
            // assert
            setTimeout(() => {
                expect(searchPage.processDialCodeResult).toHaveBeenCalledWith(searchContentResp.contentDataList);
                done();
            }, 0);
        });

        it('should reset values on handle cancel', () => {
            // arrange
            // act
            searchPage.handleCancel();
            // assert
            expect(searchPage.isEmptyResult).toEqual(false);
        });
    });

    describe('handleSearch', () => {
        it('should return without doing anything', (done) => {
            // arrange
            jest.spyOn(searchPage, 'scrollToTop').mockImplementation();
            searchPage.searchKeywords = 'ab';
            searchPage.preAppliedFilter = false;
            (window as any)['Keyboard']={hide:()=>{}}
            window.cordova.plugins = {
                Keyboard: { close: jest.fn() }
            };
            mockContentService.searchContent = jest.fn(() => throwError({}));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            }
            // act
            searchPage.handleSearch();
            setTimeout(() => {
                done()
            }, 0);
        });
        it('should rnot scroll to top if offset has value', (done) => {
            // arrange
            searchPage.searchKeywords = '';
            (window as any)['Keyboard']={hide:()=>{}}
            window.cordova.plugins = {
                Keyboard: { close: jest.fn() }
            };
            mockContentService.searchContent = jest.fn(() => of(undefined));
            searchPage.isEmptyResult = true;
            // act
            searchPage.handleSearch(true, 100);
            // assert
            setTimeout(() => {
                done()
            }, 0);
        });
        it('should handle success search scenario', (done) => {
            // arange
            jest.spyOn(searchPage, 'scrollToTop').mockImplementation();
            searchPage.searchKeywords = 'abc';
            searchPage.searchContentResult = [{
                data: [{}],
                identifier: 'id'
            }];
            (window as any)['Keyboard']={hide:()=>{}}
            const searchContentResp = {
                contentDataList: {
                    identifier: 'id'
                },
                filterCriteria: {}
            };
            jest.spyOn(searchPage, 'fetchPrimaryCategoryFilters').mockImplementation();
            searchPage.searchFilterConfig = [{code: 'code', name: 'name', translations: 'translate_String'}]
            const contentSearchRequest = {
                searchType: "search",
                query: "abc",
                primaryCategories: searchPage.primaryCategories,
                facets: Search.FACETS,
                mode: 'soft',
                framework: searchPage.currentFrameworkId,
                languageCode: searchPage.selectedLanguageCode,
                limit: 10,
                offset: 100
              };
            mockContentService.searchContent = jest.fn(() => of(searchContentResp));
            mocksearchHistoryService.addEntry = jest.fn(() => of());
            window.cordova.plugins = {
                Keyboard: { close: jest.fn() }
            };
            jest.spyOn(searchPage, 'updateFilterIcon').mockImplementation();
            searchPage.profile = {
                grade: ['grade1']
            };
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            mockTelemetryGeneratorService.generateLogEvent = jest.fn();
            // act
            searchPage.handleSearch(false, 10);
            // assert
            expect(searchPage.showLoader).toEqual(false);
            expect(mocksearchHistoryService.addEntry).toHaveBeenCalledWith({
                query: "abc",
                namespace: "LIBRARY"
              });
            setTimeout(() => {
                expect(searchPage.isEmptyResult).toBe(false);
                expect(searchPage.responseData).toEqual(searchContentResp);
                // expect(searchPage.updateFilterIcon).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateLogEvent).toHaveBeenCalledWith(
                    LogLevel.INFO,
                    expect.anything(),
                    Environment.HOME,
                    ImpressionType.SEARCH,
                    expect.anything()
                );
                done()
            }, 0);
        });
        it('should handle search for preAppliedFilter', (done) => {
            // arange
            jest.spyOn(searchPage, 'scrollToTop').mockImplementation();
            searchPage.preAppliedFilter = {
                filters: {
                    status: ['Live'],
                    objectType: ['Content'],
                    board: ['cbse'],
                    medium: ['Hindi', 'English']
                }
            };
            // searchPage.searchKeywords = 'abcd';
            const searchContentResp = {
                contentDataList: {
                    identifier: 'id'
                },
                filterCriteria: {}
            };
            searchPage.initialFilterCriteria = undefined
            mockContentService.searchContent = jest.fn(() => of(searchContentResp));
            mocksearchHistoryService.addEntry = jest.fn(() => of());
            window.cordova.plugins = {
                Keyboard: { close: jest.fn() }
            };
            jest.spyOn(searchPage, 'updateFilterIcon').mockImplementation();
            searchPage.profile = {
                grade: ['grade1']
            };
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            mockTelemetryGeneratorService.generateLogEvent = jest.fn();
            // act
            searchPage.handleSearch(true, 0);
            // assert
            expect(searchPage.showLoader).toEqual(false);
            expect(mocksearchHistoryService.addEntry).toHaveBeenCalledWith({
                query: "abc",
                namespace: "LIBRARY"
              });
            setTimeout(() => {
                expect(searchPage.searchContentResult).toEqual(searchContentResp.contentDataList);
                expect(searchPage.isEmptyResult).toBe(false);
                expect(searchPage.responseData).toEqual(searchContentResp);
                // expect(searchPage.updateFilterIcon).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateLogEvent).toHaveBeenCalledWith(
                    LogLevel.INFO,
                    expect.anything(),
                    Environment.HOME,
                    ImpressionType.SEARCH,
                    expect.anything()
                );
                done()
            }, 0);
        });
    });
    describe('navigateToBatchListPopup', () => {
        it('should show network not availbale message', () => {
            // arrange
            searchPage.loader = {
                dismiss: jest.fn()
            };
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            const contentMock = {
                identifier: 'id'
            };
            // act
            searchPage.navigateToBatchListPopup(contentMock);
            // assert
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
            expect(searchPage.loader.dismiss).toHaveBeenCalled();
        });
        it('should get course batches', (done) => {
            // arrange
            searchPage.loader = {
                dismiss: jest.fn()
            };
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            const contentMock = {
                identifier: 'id'
            };
            const getCourseBatchesResp = [
                { identifier: 'id1', status: 1 }
            ];
            mockCourseService.getCourseBatches = jest.fn(() => of(getCourseBatchesResp));
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { isEnrolled: jest.fn() } }))
            } as any)));
            // act
            searchPage.navigateToBatchListPopup(contentMock);
            // assert
            setTimeout(() => {
                expect(searchPage.batches).toEqual(getCourseBatchesResp);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    'ongoing-batch-popup',
                    Environment.HOME,
                    PageId.SEARCH,
                    undefined,
                    expect.anything()
                );
                expect(searchPage.loader.dismiss).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should call get enrolled courses', (done) => {
            // arrange
            searchPage.loader = {
                dismiss: jest.fn()
            };
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            const contentMock = {
                identifier: 'id'
            };
            const getCourseBatchesResp = [
                { identifier: 'id1' }
            ];
            mockCourseService.getCourseBatches = jest.fn(() => of(getCourseBatchesResp));
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { isEnrolled: true } }))
            } as any)));
            mockCourseService.getEnrolledCourses = jest.fn(() => throwError({}));
            // act
            searchPage.navigateToBatchListPopup(contentMock);
            // assert
            setTimeout(() => {
                expect(searchPage.batches).toEqual(getCourseBatchesResp);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    'ongoing-batch-popup',
                    Environment.HOME,
                    PageId.SEARCH,
                    undefined,
                    expect.anything()
                );
                expect(searchPage.loader.dismiss).toHaveBeenCalled();
                expect(mockCourseService.getEnrolledCourses).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should call get content details', (done) => {
            // arrange
            searchPage.loader = {
                dismiss: jest.fn()
            };
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            const contentMock = {
                identifier: 'id',
                contentType: 'Resource'
            };
            const getCourseBatchesResp = [
            ];
            mockCourseService.getCourseBatches = jest.fn(() => of(getCourseBatchesResp));
            mockPopoverController.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { isEnrolled: true } }))
            } as any)));
            mockCourseService.getEnrolledCourses = jest.fn(() => throwError({}));
            // act
            searchPage.navigateToBatchListPopup(contentMock);
            // assert
            setTimeout(() => {
                expect(searchPage.batches).toEqual(getCourseBatchesResp);
                expect(searchPage.loader.dismiss).toHaveBeenCalled();
                expect(mockNavigationService.navigateToContent).toHaveBeenCalledWith(
                    expect.anything()
                );
                done();
            }, 0);
        });
        it('shouldhandle error scenario', (done) => {
            // arrange
            searchPage.loader = {
                dismiss: jest.fn()
            };
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            const contentMock = {
                identifier: 'id',
                contentType: 'Resource'
            };
            mockCourseService.getCourseBatches = jest.fn(() => throwError({}));
            // act
            searchPage.navigateToBatchListPopup(contentMock);
            // assert
            setTimeout(() => {
                done();
            }, 0);
        });
    });
    describe('getContentForDialCode', () => {
        beforeEach(() => {
            mockAppGlobalService.getNameForCodeInFramework = jest.fn(() => 'name');
        });
        it('should return without any action', () => {
            // arrange
            searchPage.dialCode = undefined;
            // act
            searchPage.getContentForDialCode();
        });
        it('should call processdialcoderesult', (done) => {
            // arrange
            searchPage.dialCode = 'abcdef';
            jest.spyOn(searchPage, 'processDialCodeResult').mockImplementation();
            const getSupportedContentFilterConfigResp = ['textbook', 'resource'];
            mockFormAndFrameworkUtilService.getSupportedContentFilterConfig = jest.fn(
                () => Promise.resolve(getSupportedContentFilterConfigResp));
            const dialAssembleResp = {
                sections: [{ identifier: 'id1' }]
            };
            mockpageService.getPageAssemble = jest.fn(() => of(dialAssembleResp));
            searchPage.profile = {
                board: ['baord1']
            };
            // act
            searchPage.getContentForDialCode();
            // assert
            setTimeout(() => {
                expect(searchPage.processDialCodeResult).toHaveBeenCalledWith(
                    dialAssembleResp.sections
                );
                expect(searchPage.isDialCodeSearch).toBe(true);
                expect(searchPage.primaryCategories).toEqual(getSupportedContentFilterConfigResp);
                done();
            }, 0);
        });
        it('should call processdialcoderesult, handle else case if no length for secctions and profile board', (done) => {
            // arrange
            searchPage.dialCode = 'abcdef';
            jest.spyOn(searchPage, 'processDialCodeResult').mockImplementation();
            const getSupportedContentFilterConfigResp = ['textbook', 'resource'];
            mockFormAndFrameworkUtilService.getSupportedContentFilterConfig = jest.fn(
                () => Promise.resolve(getSupportedContentFilterConfigResp));
            const dialAssembleResp = {
                sections: []
            };
            mockpageService.getPageAssemble = jest.fn(() => of(dialAssembleResp));
            searchPage.profile = {
                board: []
            };
            // act
            searchPage.getContentForDialCode();
            // assert
            setTimeout(() => {
                expect(searchPage.isDialCodeSearch).toBe(true);
                expect(searchPage.primaryCategories).toEqual(getSupportedContentFilterConfigResp);
                done();
            }, 0);
        });
        it('should handle failure case of dial pageassemble API', (done) => {
            // arrange
            searchPage.dialCode = 'abcdef';
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            const getSupportedContentFilterConfigResp = ['textbook', 'resource'];
            mockFormAndFrameworkUtilService.getSupportedContentFilterConfig = jest.fn(
                () => Promise.resolve(getSupportedContentFilterConfigResp));
            mockpageService.getPageAssemble = jest.fn(() => throwError({}));
            // act
            searchPage.getContentForDialCode();
            // assert
            setTimeout(() => {
                expect(searchPage.isDialCodeSearch).toBe(true);
                expect(searchPage.primaryCategories).toEqual(getSupportedContentFilterConfigResp);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SOMETHING_WENT_WRONG');
                expect(mockLocation.back).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should handle failure case of dial pageassemble API when network is not there', (done) => {
            // arrange
            searchPage.dialCode = 'abcdef';
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            const getSupportedContentFilterConfigResp = ['textbook', 'resource'];
            mockFormAndFrameworkUtilService.getSupportedContentFilterConfig = jest.fn(
                () => Promise.resolve(getSupportedContentFilterConfigResp));
            mockpageService.getPageAssemble = jest.fn(() => throwError({}));
            searchPage.source = PageId.ONBOARDING_PROFILE_PREFERENCES;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            // act
            searchPage.getContentForDialCode();
            // assert
            setTimeout(() => {
                expect(searchPage.isDialCodeSearch).toBe(true);
                expect(searchPage.primaryCategories).toEqual(getSupportedContentFilterConfigResp);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_OFFLINE_MODE');
                expect(mockLocation.back).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    AuditType.TOAST_SEEN,
                    ImpressionSubtype.OFFLINE_MODE,
                    PageId.SCAN_OR_MANUAL,
                    Environment.ONBOARDING,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    [{ id: 'abcdef', type: 'QR' }]
                );
                done();
            }, 0);
        });
        it('should handle failure case of dial pageassemble API when network is not there, handle for source home', (done) => {
            // arrange
            searchPage.dialCode = 'abcdef';
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            searchPage.source = PageId.HOME;
            const getSupportedContentFilterConfigResp = ['textbook', 'resource'];
            mockFormAndFrameworkUtilService.getSupportedContentFilterConfig = jest.fn(
                () => Promise.resolve(getSupportedContentFilterConfigResp));
            mockpageService.getPageAssemble = jest.fn(() => throwError({}));
            searchPage.source = PageId.HOME;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            // act
            searchPage.getContentForDialCode();
            // assert
            setTimeout(() => {
                expect(searchPage.isDialCodeSearch).toBe(true);
                expect(searchPage.primaryCategories).toEqual(getSupportedContentFilterConfigResp);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_OFFLINE_MODE');
                expect(mockLocation.back).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                    AuditType.TOAST_SEEN,
                    ImpressionSubtype.OFFLINE_MODE,
                    PageId.SCAN_OR_MANUAL,
                    Environment.HOME,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    [{ id: 'abcdef', type: 'QR' }]
                );
                done();
            }, 0);
        });
    });
    describe('telemetry events', () => {
        it('should generate interact event', () => {
            // arrange
            searchPage.isDialCodeSearch = true;
            mockAppGlobalService.isOnBoardingCompleted = jest.fn(() => true);
            // act
            searchPage.generateInteractEvent('identifier', 'collection', 'ver', 1);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.CONTENT_CLICKED,
                Environment.HOME,
                PageId.DIAL_SEARCH,
                expect.anything(),
                expect.anything(),
                expect.anything(),
                expect.anything(),
            );
        });
        it('should generate interact event', () => {
            // arrange
            searchPage.isDialCodeSearch = false;
            mockAppGlobalService.isOnBoardingCompleted = jest.fn(() => true);
            searchPage['corRelationList'] = []
            mockAppGlobalService.isOnBoardingCompleted = false;
            // act
            searchPage.generateInteractEvent('identifier', 'collection', 'ver', 1);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.CONTENT_CLICKED,
                Environment.ONBOARDING,
                PageId.HOME,
                expect.anything(),
                expect.anything(),
                expect.anything(),
                expect.anything(),
            );
        });
        it('should generate interact event', () => {
            // arrange
            searchPage.isDialCodeSearch = false;
            searchPage.source = "";
            mockAppGlobalService.isOnBoardingCompleted = jest.fn(() => true);
            searchPage['corRelationList'] = [{id: 'id1', type: 'section'}]
            mockAppGlobalService.isOnBoardingCompleted = false;
            // act
            searchPage.generateInteractEvent('identifier', 'collection', 'ver', 1);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.CONTENT_CLICKED,
                Environment.ONBOARDING,
                PageId.SEARCH,
                expect.anything(),
                expect.anything(),
                expect.anything(),
                expect.anything(),
            );
        });

        it('should generate qrsession end event', () => {
            // arrange
            mockTelemetryGeneratorService.generateEndTelemetry = jest.fn();
            // act
            searchPage.generateQRSessionEndEvent('pageID', 'qrData');
            // assert
            expect(mockTelemetryGeneratorService.generateEndTelemetry).toHaveBeenCalledWith(
                'qr',
                Mode.PLAY,
                'pageID',
                Environment.HOME,
                expect.anything(),
                undefined,
                expect.anything()
            );
        });
        it('should generate qrsession end event, if page id is undefined', () => {
            // arrange
            // act
            searchPage.generateQRSessionEndEvent(undefined, 'qrData');
            // assert
        });
        it('should generate QRScanSuccess Interact Event online', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            searchPage.source = 'home'
            // act
            searchPage.generateQRScanSuccessInteractEvent(2, 'ABCDEF');
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.OTHER,
                InteractSubtype.DIAL_SEARCH_RESULT_FOUND,
                expect.anything(),
                PageId.SEARCH,
                undefined,
                { count: 2, networkAvailable: 'Y', scannedData: 'ABCDEF' }
            );
        });
        it('should generate QRScanSuccess Interact Event offline', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            searchPage.source = "";
            // act
            searchPage.generateQRScanSuccessInteractEvent(2, 'ABCDEF');
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.OTHER,
                InteractSubtype.DIAL_SEARCH_RESULT_FOUND,
                PageId.SEARCH,
                PageId.SEARCH,
                undefined,
                { count: 2, networkAvailable: 'N', scannedData: 'ABCDEF' }
            );
        });
    });
    describe('updateFilterIcon', () => {
        it('should return without any action', () => {
            // arrange
            searchPage.responseData = {};
            // act
            searchPage.updateFilterIcon();
        });
        it('should set applied filter icon', () => {
            // arrange
            searchPage.responseData = {
                filterCriteria: {
                    facetFilters: [
                        { values: [{ apply: true }] }
                    ]
                }
            };
            // act
            searchPage.updateFilterIcon();
            // assert
            expect(searchPage.filterIcon).toEqual('./assets/imgs/ic_action_filter_applied.png');
        });
        it('should set normal filter icon', () => {
            // arrange
            searchPage.isFilterApplied = false;
            searchPage.responseData = {
                filterCriteria: {
                    facetFilters: [
                        { values: [{ apply: false }] }
                    ]
                }
            };
            // act
            searchPage.updateFilterIcon();
            // assert
            expect(searchPage.filterIcon).toEqual('./assets/imgs/ic_action_filter.png');
        });
        it('should not set filter icon', () => {
            // arrange
            searchPage.isEmptyResult = true;
            searchPage.responseData = {
                filterCriteria: {
                    facetFilters: [
                        {}
                    ]
                }
            };
            // act
            searchPage.updateFilterIcon();
            // assert
            expect(searchPage.filterIcon).toBe(undefined);
        });
    });
    describe('checkParent', () => {
        it('should call show content details', (done) => {
            // arrange
            const getContentDetailsResp = {
                isAvailableLocally: true,
                contentType: 'collection',
                contentData: {
                    identifier: 'id1'
                }
            };
            const collection = {
                identifier: 'identifier',
                mimeType: MimeType.COLLECTION,
                contentType: 'collection'
            };
            searchPage.isDialCodeSearch = true;
            mockAppGlobalService.getProfileSettingsStatus = jest.fn(() => Promise.resolve({}));
            mockAppGlobalService.setOnBoardingCompleted = jest.fn(() => Promise.resolve());
            mockContentService.getContentDetails = jest.fn(() => of(getContentDetailsResp));
            mockZone.run = jest.fn((fn) => fn());
            mockAppGlobalService.getCurrentUser = jest.fn(() => { });
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockNavCtrl.navigateForward = jest.fn(() => Promise.resolve(true));
            // act
            searchPage.checkParent('parent', collection);
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                expect(mockNavCtrl.navigateForward).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should call show content details', (done) => {
            // arrange
            const getContentDetailsResp = undefined;
            mockContentService.getContentDetails = jest.fn(() => of(getContentDetailsResp));
            mockAppGlobalService.getCurrentUser = jest.fn(() => { });
            const content = {
                isAvailableLocally: true,
                contentType: 'resource',
                contentData: {
                    identifier: 'id1'
                }
            };
            // act
            searchPage.checkParent('parent', content);
            // assert
            setTimeout(() => {
                expect(mockNavigationService.navigateToContent).toHaveBeenCalledWith(
                    expect.anything()
                );
                done();
            }, 0);
        });
        it('should check profile data', (done) => {
            // arrange
            const getContentDetailsResp = {
                isAvailableLocally: false,
                contentType: 'collection',
                contentData: {
                    identifier: 'id1'
                }
            };
            mockContentService.getContentDetails = jest.fn(() => of(getContentDetailsResp));
            mockAppGlobalService.getCurrentUser = jest.fn(() => { });
            jest.spyOn(searchPage, 'subscribeSdkEvent').mockImplementation();
            jest.spyOn(searchPage, 'downloadParentContent').mockImplementation();
            jest.spyOn(searchPage, 'checkProfileData').mockImplementation();
            // act
            searchPage.checkParent('parent', 'child');
            // assert
            setTimeout(() => {
                expect(searchPage.subscribeSdkEvent).toHaveBeenCalled();
                expect(searchPage.downloadParentContent).toHaveBeenCalledWith('parent');
                expect(searchPage.checkProfileData).toHaveBeenCalled();
                done();
            }, 400);
        });
        it('checkParent on error', (done) => {
            // arrange
            mockContentService.getContentDetails = jest.fn(() => throwError(new NetworkError('no-internet')));
            mockCommonUtilService.showToast = jest.fn()
            // act
            searchPage.checkParent('parent', 'child');
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_OFFLINE_MODE');
                done();
            }, 0);
        });
        it('checkParent on error, if not an instance of network', (done) => {
            // arrange
            mockContentService.getContentDetails = jest.fn(() => throwError({error:'no-internet'}));
            // act
            searchPage.checkParent('parent', 'child');
            // assert
            setTimeout(() => {
                done();
            }, 0);
        });
    });
    describe('processDialCodeResult', () => {
        it('processDialCodeResult, content and collections are empty array', () => {
            // arrange
            const dialResult = [{collections: [], contents: [], display: false}];
            mockCommonUtilService.getTranslatedValue = jest.fn();
            searchPage.displayDialCodeResult = [];
            searchPage.isSingleContent = false;
            jest.spyOn(searchPage, 'generateImpressionEvent').mockImplementation()
            // act
            searchPage.processDialCodeResult(dialResult);

        });

        it('processDialCodeResult', () => {
            // arrange
            const dialResult = [{collections: [{childNodes: 'id1'}], contents: [{identifier: 'id1', contentType: 'Course'}, {identifier: 'id2'}], display: false}];
            mockCommonUtilService.getTranslatedValue = jest.fn();
            searchPage.displayDialCodeResult = [];
            searchPage.isSingleContent = false;
            jest.spyOn(searchPage, 'generateImpressionEvent').mockImplementation()
            // act
            searchPage.processDialCodeResult(dialResult);

        });

        it('processDialCodeResult', () => {
            // arrange
            const dialResult = [{collections: [{childNodes: 'id2', content:[]}], contents: [{identifier: 'id1', contentType: 'Course'}, {identifier: 'id2'}], display: false}];
            mockCommonUtilService.getTranslatedValue = jest.fn();
            searchPage.displayDialCodeResult = [];
            searchPage.isSingleContent = false;
            jest.spyOn(searchPage, 'generateImpressionEvent').mockImplementation()
            // act
            searchPage.processDialCodeResult(dialResult);

        });

        it('processDialCodeResult', () => {
            // arrange
            const dialResult = [{collections: [{childNodes: 'id2', content:[{identifier:''}]}], contents: [{identifier: 'id1', contentType: 'Course2'}, {identifier: 'id2'}], display: true}];
            mockCommonUtilService.getTranslatedValue = jest.fn();
            searchPage.displayDialCodeResult = [];
            searchPage.isSingleContent = false;
            jest.spyOn(searchPage, 'generateImpressionEvent').mockImplementation()
            // act
            searchPage.processDialCodeResult(dialResult);

        });

        it('processDialCodeResult for sibling content and navigate back', (done) => {
            // arrange
            const dialResult = [{collections:  [], contents: '', display: false}];
            mockCommonUtilService.getTranslatedValue = jest.fn();
            searchPage.isSingleContent = false
            jest.spyOn(searchPage, 'generateImpressionEvent').mockImplementation()
            mockLocation.back = jest.fn()
            searchPage.shouldGenerateEndTelemetry = true
            searchPage.displayDialCodeResult = []
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn()
            mockCommonUtilService.showContentComingSoonAlert = jest.fn()
            // act
            searchPage.processDialCodeResult(dialResult);
            // assert
            setTimeout(() => {        
                done();
            }, 0);
        });
    });
    describe('downloadParentContent', () => {
        it('should handle else case if no import content data', (done) => {
            // arrange
            mockPlatform.is = jest.fn(platform => platform == 'ios')
            const importContentResp = [];
            mockContentService.importContent = jest.fn(() => of(importContentResp));
            const parent = { identifier: 'id' };
            // act
            searchPage.downloadParentContent(parent);
            // assert
            expect(searchPage.downloadProgress).toEqual(0);
            expect(searchPage.isDownloadStarted).toEqual(true);
            setTimeout(() => {
                expect(searchPage.queuedIdentifiers).toEqual([]);
                done();
            }, 0);
        });

        it('should push not downloaded identifiers in to queue', (done) => {
            // arrange
            mockPlatform.is = jest.fn(platform => platform == 'ios')
            const importContentResp = [
                { status: ContentImportStatus.ENQUEUED_FOR_DOWNLOAD, identifier: 'id1' }];
            mockContentService.importContent = jest.fn(() => of(importContentResp));
            const parent = { identifier: 'id' };
            // act
            searchPage.downloadParentContent(parent);
            // assert
            expect(searchPage.downloadProgress).toEqual(0);
            expect(searchPage.isDownloadStarted).toEqual(true);
            setTimeout(() => {
                expect(searchPage.queuedIdentifiers).toEqual(['id1']);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    InteractSubtype.LOADING_SPINE,
                    Environment.HOME,
                    PageId.DIAL_SEARCH,
                    undefined,
                    undefined,
                    undefined,
                    expect.anything()
                );
                done();
            }, 0);
        });

        it('should push not downloaded identifiers in to queue', (done) => {
            // arrange
            mockPlatform.is = jest.fn(platform => platform == 'ios')
            const importContentResp = [
                { status: ContentImportStatus.ENQUEUED_FOR_DOWNLOAD, identifier: 'id1' }];
            mockContentService.importContent = jest.fn(() => of(importContentResp));
            const parent = { identifier: 'id' };
            searchPage.source = PageId.USER_TYPE_SELECTION;
            // act
            searchPage.downloadParentContent(parent);
            // assert
            expect(searchPage.downloadProgress).toEqual(0);
            expect(searchPage.isDownloadStarted).toEqual(true);
            setTimeout(() => {
                expect(searchPage.queuedIdentifiers).toEqual(['id1', 'id1']);
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.OTHER,
                    InteractSubtype.LOADING_SPINE,
                    Environment.ONBOARDING,
                    PageId.DIAL_SEARCH,
                    undefined,
                    undefined,
                    undefined,
                    expect.anything()
                );
                done();
            }, 0);
        });

        it('should push not downloaded identifiers not found', (done) => {
            // arrange
            mockPlatform.is = jest.fn(platform => platform == 'android')
            const importContentResp = [
                { status: ContentImportStatus.NOT_FOUND, identifier: 'id1' }];
            mockContentService.importContent = jest.fn(() => of(importContentResp));
            const parent = { identifier: 'id' };
            searchPage.queuedIdentifiers = [];
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            }
            // act
            searchPage.downloadParentContent(parent);
            // assert
            expect(searchPage.downloadProgress).toEqual(0);
            expect(searchPage.isDownloadStarted).toEqual(true);
            setTimeout(() => {
                expect(mockCommonUtilService.showToast('ERROR_CONTENT_NOT_AVAILABLE'));
                done();
            }, 0);
        });

        it('should push not downloaded identifiers not found with network issue', (done) => {
            // arrange
            const importContentResp = [
                { status: ContentImportStatus.NOT_FOUND, identifier: 'id1' }];
            mockContentService.importContent = jest.fn(() => of(importContentResp));
            const parent = { identifier: 'id' };
            searchPage.queuedIdentifiers = [];
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            }
            // act
            searchPage.downloadParentContent(parent);
            // assert
            expect(searchPage.downloadProgress).toEqual(0);
            expect(searchPage.isDownloadStarted).toEqual(true);
            setTimeout(() => {
                expect(mockCommonUtilService.showToast('ERROR_OFFLINE_MODE'));
                done();
            }, 0);
        });

        it('should catch error on import content', (done) => {
            // arrange
            mockContentService.importContent = jest.fn(() => throwError(new NetworkError('no_internet')));
            const parent = { identifier: 'id' };
            mockCommonUtilService.showToast = jest.fn()
            searchPage['corRelationList'] = undefined as any;
            // act
            searchPage.downloadParentContent(parent);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_OFFLINE_MODE')
                done();
            }, 0);
        })

        it('should catch error on import content else case', (done) => {
            // arrange
            mockContentService.importContent = jest.fn(() => throwError({error:'no_internet'}));
            const parent = { identifier: 'id' };
            searchPage['corRelationList'] = undefined as any;
            // act
            searchPage.downloadParentContent(parent);
            // assert
            setTimeout(() => {
                done();
            }, 0);
        })

        describe('handleDeviceBackButton', () => {
            it('should handle Device BackButton for dialcode', (done) => {
                // arrange
                const subscribeWithPriorityData = jest.fn((_, fn) => fn());
                mockPlatform.backButton = {
                    subscribeWithPriority: subscribeWithPriorityData
                } as any;
                jest.spyOn(searchPage, 'navigateToPreviousPage').mockImplementation(() => {
                    return Promise.resolve();
                });
                searchPage.displayDialCodeResult = [{ dialCodeResult: ['result-1', 'result-2'] }];
                mockTelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
                // act
                searchPage.handleDeviceBackButton();
                // assert
                expect(searchPage.displayDialCodeResult[0].dialCodeResult.length).toBeGreaterThan(0);
                setTimeout(() => {
                    expect(mockTelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalledWith(
                        true,
                        Environment.HOME,
                        PageId.QR_BOOK_RESULT
                    );
                    done()
                }, 0);
            });

            it('should handle Device BackButton for dialcode', (done) => {
                // arrange
                const subscribeWithPriorityData = jest.fn((_, fn) => fn());
                mockPlatform.backButton = {
                    subscribeWithPriority: subscribeWithPriorityData
                } as any;
                jest.spyOn(searchPage, 'navigateToPreviousPage').mockImplementation(() => {
                    return Promise.resolve();
                });
                searchPage.source = PageId.ONBOARDING;
                searchPage.displayDialCodeResult = [{ dialCodeResult: ['result-1', 'result-2'] }];
                mockTelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
                // act
                searchPage.handleDeviceBackButton();
                // assert
                expect(searchPage.displayDialCodeResult[0].dialCodeResult.length).toBeGreaterThan(0);
                setTimeout(() => {
                    expect(mockTelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalledWith(
                        true,
                        Environment.ONBOARDING,
                        PageId.QR_BOOK_RESULT
                    );
                    done()
                }, 0);
            });

            it('should handle Device BackButton', (done) => {
                // arrange
                const subscribeWithPriorityData = jest.fn((_, fn) => fn());
                mockPlatform.backButton = {
                    subscribeWithPriority: subscribeWithPriorityData
                } as any;
                jest.spyOn(searchPage, 'navigateToPreviousPage').mockImplementation(() => {
                    return Promise.resolve();
                });
                searchPage.displayDialCodeResult = [{ dialCodeResult: [] }];
                mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
                // act
                searchPage.handleDeviceBackButton();
                // assert
                expect(searchPage.displayDialCodeResult[0].dialCodeResult.length).toBe(0);
                setTimeout(() => {
                    expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                        ImpressionType.SEARCH,
                        Environment.HOME, false, undefined,
                        undefined
                    );
                    done()
                }, 0);
            });
        });
    });

    describe('goBack', () => {
        it('should generate beck telemetry for qrCode', (done) => {
            searchPage.displayDialCodeResult = [{
                dialCodeResult: ['result-1']
            }];
            mockTelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
            searchPage.source = PageId.ONBOARDING_PROFILE_PREFERENCES;
            // act
            searchPage.goBack();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalledWith(
                    false,
                    Environment.ONBOARDING,
                    PageId.QR_BOOK_RESULT
                );
                done()
            }, 0);
        });
        it('should generate beck telemetry for qrCode', (done) => {
            searchPage.displayDialCodeResult = [{
                dialCodeResult: ['result-1']
            }];
            mockTelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
            searchPage.source = PageId.HOME;
            // act
            searchPage.goBack();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalledWith(
                    false,
                    Environment.HOME,
                    PageId.QR_BOOK_RESULT
                );
                done()
            }, 0);
        });
        it('should generate search telemetry for qrCode', (done) => {
            searchPage.displayDialCodeResult = [{
                dialCodeResult: []
            }];
            searchPage['corRelationList'] = [
                { id: '', type: 'API' },
                { id: '', type: 'API' },
                { id: '', type: 'API' },
                { id: 'SearchResult', type: 'Section' },
                { id: 'filter', type: 'DiscoveryType' },
              ]
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            // act
            searchPage.goBack();
            // assert
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                    ImpressionType.SEARCH, Environment.HOME, true, undefined, [
                        { id: '', type: 'API' },
                        { id: '', type: 'API' },
                        { id: '', type: 'API' },
                        { id: 'SearchResult', type: 'Section' },
                        { id: 'filter', type: 'DiscoveryType' },
                      ]
                  );
                    done();
                }, 0);
        });
    });

    describe('getContentCount',  () => {
        it('should check dail code result and return an count', () => {
            // arrange
            let totalCount;
            const displayDialCodeResult = [{
                dialCodeResult: [{content:['result-1']}],
                dialCodeContentResult: ['Result-2']
            }];
            // act
            searchPage.getContentCount(displayDialCodeResult)
            // assert
        })

        it('should check dail code result and return an count, if no content length', () => {
            // arrange
            let totalCount;
            const displayDialCodeResult = [{
                dialCodeResult: [{content:[]}],
                dialCodeContentResult: ['Result-2']
            }];
            // act
            searchPage.getContentCount(displayDialCodeResult)
            // assert
        })

        it('should check dail code result and return an count, if no dialcode result length', () => {
            // arrange
            let totalCount;
            const displayDialCodeResult = [{
                dialCodeResult: [],
                dialCodeContentResult: []
            }];
            // act
            searchPage.getContentCount(displayDialCodeResult)
            // assert
        })
    });

    describe('cancelDownload', () => {
        it('should cancel download', (done) => {
            // arrange
            searchPage.parentContent = {identifier: "result"}
            mockContentService.cancelDownload = jest.fn(() => of())
            mockLocation.back = jest.fn();
            mockZone.run = jest.fn((fn) => fn())
                searchPage.showLoading = false
                searchPage.isSingleContent = true
            // act
            searchPage.cancelDownload();
            // assert
            setTimeout(() => {
                expect(mockContentService.cancelDownload).toHaveBeenCalledWith(searchPage.parentContent.identifier);
                expect(mockZone.run).toHaveBeenCalled();
                expect(mockLocation.back).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should cancel download, else case if isSingleContent false', (done) => {
            // arrange
            searchPage.parentContent = {identifier: "result"}
            mockContentService.cancelDownload = jest.fn(() => of())
            mockLocation.back = jest.fn();
            mockZone.run = jest.fn((fn) => fn())
                searchPage.showLoading = false
                searchPage.isSingleContent = false
            // act
            searchPage.cancelDownload();
            // assert
            setTimeout(() => {
                expect(mockContentService.cancelDownload).toHaveBeenCalledWith(searchPage.parentContent.identifier);
                expect(mockZone.run).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should catch a error on cancel download', (done) => {
            // arrange
            searchPage.parentContent = {identifier: ""}
            mockContentService.cancelDownload = jest.fn(() => throwError({}))
            mockLocation.back = jest.fn();
            mockZone.run = jest.fn((fn) => fn(
                ))
                searchPage.showLoading = false
                searchPage.isSingleContent = true
            // act
            searchPage.cancelDownload();
            // assert
            setTimeout(() => {
                expect(mockContentService.cancelDownload).toHaveBeenCalledWith(searchPage.parentContent.identifier);
                expect(mockLocation.back).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should catch a error on cancel download, on singlecontent false', (done) => {
            // arrange
            searchPage.parentContent = {identifier: ""}
            mockContentService.cancelDownload = jest.fn(() => throwError({}))
            mockLocation.back = jest.fn();
            mockZone.run = jest.fn((fn) => fn(
                ))
                searchPage.showLoading = false
                searchPage.isSingleContent = false
            // act
            searchPage.cancelDownload();
            // assert
            setTimeout(() => {
                expect(mockContentService.cancelDownload).toHaveBeenCalledWith(searchPage.parentContent.identifier);
                done();
            }, 0);
        });
    })

    describe('add activity', () => {
        it('should addActivityToGroup', () => {
            // arrange
            searchPage.groupId = 'id1';
            searchPage.searchContentResult = [
                { identifier: 'some_id', selected: true, contentType: 'contentType' }
            ];
            searchPage.activityTypeData = {
                activityType: 'some_activity_type'
            }
            // act
            searchPage.addActivityToGroup();
            // assert
            expect(mockgroupHandlerService.addActivityToGroup).toHaveBeenCalledWith(
                'id1',
                'some_id',
                'some_activity_type',
                PageId.SEARCH,
                expect.anything(),
                -2
            );
        });

        it('should not addActivityToGroup', () => {
            // arrange
            searchPage.searchContentResult = [
                { identifier: 'id1', selected: true, contentType: 'contentType' }
            ];
            searchPage.activityList = [{
                id: 'id1'
            }];
            // act
            searchPage.addActivityToGroup();
            // assert
            expect(mockCommonUtilService.showToast).toHaveBeenCalled();
        });

        it('should not addActivityToGroup', () => {
            // arrange
            searchPage.searchContentResult = [
                { identifier: 'id1', selected: true, contentType: 'contentType' }
            ];
            searchPage.activityTypeData = {};
            searchPage.activityList = [{
                id: 'id2'
            }];
            // act
            searchPage.addActivityToGroup();
            // assert
        });

        it('should open content', () => {
            // arrange
            const result = [
                { identifier: 'some_id', selected: true, contentType: 'contentType' }
            ];
            searchPage.searchContentResult = result;
            jest.spyOn(searchPage, 'openContent').mockImplementation();
            // act
            searchPage.openSelectedContent();
            // assert
            expect(searchPage.openContent).toHaveBeenCalledWith(
                undefined,
                result[0],
                0,
                undefined,
                false
            );
        });
        it('should open content, handle if not selected', () => {
            // arrange
            const result = [
                { identifier: 'some_id', selected: false, contentType: 'contentType' }
            ];
            searchPage.searchContentResult = result;
            jest.spyOn(searchPage, 'openContent').mockImplementation();
            // act
            searchPage.openSelectedContent();
            // assert
            expect(searchPage.openContent).toHaveBeenCalledWith(
                undefined,
                undefined,
                0,
                undefined,
                false
            );
        });
    });

    describe('searchOnFocus()', ()=> {
        it('should animate the screen and show the search page', () => {
            // arrange
            mockHeaderService.showHeaderWithBackButton = jest.fn();
            // act
            searchPage.searchOnFocus();
            // assert
            expect(searchPage.enableSearch).toBeTruthy();
        });
    })

    describe('handleHeaderEvents()', () => {
        it('should animate the screen and show the discover page on heaser back button is clicked', () => {
            // arrange
            mockHeaderService.showHeaderWithHomeButton = jest.fn();
            searchPage.isFromGroupFlow = false;
            // act
            searchPage.handleHeaderEvents({ name: 'back' });
            // assert
            expect(searchPage.enableSearch).toBeFalsy();
        });

        it('should navigate to previous screen if its from group flow', () => {
            // arrange
            mockHeaderService.showHeaderWithHomeButton = jest.fn();
            searchPage.isFromGroupFlow = true;
            // act
            searchPage.handleHeaderEvents({ name: 'back' });
            // assert
            expect(mockLocation.back).toHaveBeenCalled();
        });
        it('should break if the tab is home discover page config', () => {
            // arrange
            mockHeaderService.showHeaderWithHomeButton = jest.fn();
            searchPage.isFromGroupFlow = false;
            searchPage.enableSearch = false;
            searchPage['selectedSwitchableTab'] = SwitchableTabsConfig.HOME_DISCOVER_TABS_CONFIG;
            mockSharedPreferences.getString = jest.fn(() => Promise.resolve("HOME_DISCOVER_TABS_CONFIG"))
            // act
            searchPage.handleHeaderEvents({ name: 'back' });
            // assert
        });
        it('should navigate back for other case', () => {
            // arrange
            mockHeaderService.showHeaderWithHomeButton = jest.fn();
            searchPage.isFromGroupFlow = false;
            searchPage.enableSearch = false;
            searchPage['selectedSwitchableTab'] = SwitchableTabsConfig.RESOURCE_COURSE_TABS_CONFIG;
            mockSharedPreferences.getString = jest.fn(() => Promise.resolve("somedata"))
            // act
            searchPage.handleHeaderEvents({ name: 'back' });
            // assert
            expect(mockLocation.back).toHaveBeenCalled();
        });
        it('should handle default event', () => {
            // arrange
            // act
            searchPage.handleHeaderEvents({ name: 'default' });
            // assert
        });
    });

    describe('fetchPrimaryCategoryFilters()', () => {
        it('should not assign any value to primaryCategoryFilters if the value is already assigned', () => {
            // arrange
            searchPage.primaryCategoryFilters = [];
            // act
            searchPage.fetchPrimaryCategoryFilters([]);
            // assert
            expect(searchPage.primaryCategoryFilters).toEqual([]);
        });

        it('should not assign any value to primaryCategoryFilters if the value is not assigned and primary category is not present i facetfilters', () => {
            // arrange
            searchPage.primaryCategoryFilters = undefined;
            const facetFilters = [
                {
                    name: 'primaryCategory',
                    value: [
                        {
                            name: 'category1'
                        },
                        {
                            name: 'category2'
                        },
                        {
                            name: 'category3'
                        }
                    ]
                },
                {
                    name: 'medium',
                    value: [
                        {
                            name: 'medium1'
                        },
                        {
                            name: 'medium2'
                        },
                        {
                            name: 'medium3'
                        }
                    ]
                }
            ]
            // act
            searchPage.fetchPrimaryCategoryFilters(facetFilters);
            // assert
        });

        it('should handle else case, if the name of facetfilters is not primary category', () => {
            // arrange
            const facetFilters = [
                {
                    name: 'board',
                    value: [
                        {
                            name: 'board1'
                        },
                        {
                            name: 'board2'
                        }
                    ]
                },
                {
                    name: 'primaryCategory2',
                    value: [
                        {
                            name: 'category1'
                        },
                        {
                            name: 'category2'
                        }
                    ]
                }
            ]
            // act
            searchPage.fetchPrimaryCategoryFilters(facetFilters);
            // assert
            setTimeout(() => {
            });
        });

        it('should assign value to primaryCategoryFilters if the value is not assigned and primary category is present in facetfilters', () => {
            // arrange
            const facetFilters = [
                {
                    name: 'board',
                    value: [
                        {
                            name: 'board1'
                        },
                        {
                            name: 'board2'
                        }
                    ]
                },
                {
                    name: 'primaryCategory',
                    value: [
                        {
                            name: 'category1'
                        },
                        {
                            name: 'category2'
                        }
                    ]
                }
            ]
            searchPage.primaryCategoryFilters = facetFilters[1].value;
            // act
            searchPage.fetchPrimaryCategoryFilters(facetFilters);
            // assert
            setTimeout(() => {
            });
        });
    });

    describe('handleFilterSelect', () => {
        it('should terminate the flow if the event has no data', () => {
            // arrange
            const event = {};
            searchPage.applyFilter = jest.fn();
            // act
            searchPage.handleFilterSelect(event);
            // assert
            expect(searchPage.applyFilter).not.toHaveBeenCalled();
        });

        it('should handle else if no initialfiltercrietria', () => {
            // arrange
            const event = {
                data: [
                    {
                        name: 'facet 1',
                        value: {
                            name: 'value1'
                        }
                    }
                ]
            };
            searchPage.initialFilterCriteria = ''
            searchPage.applyFilter = jest.fn();
            // act
            searchPage.handleFilterSelect(event);
            // assert
            expect(searchPage.applyFilter).not.toHaveBeenCalled();
        });

        it('should terminate the flow if the initialFilterCriteria does not have the facet primaryCategory', () => {
            // arrange
            const event = {
                data: [
                    {
                        name: 'facet 1',
                        value: {
                            name: 'value1'
                        }
                    }
                ]
            };
            searchPage.initialFilterCriteria = {
                facetFilters: [
                    {
                        name: 'medium'
                    },
                    {
                        name: 'grade'
                    }
                ]
            }
            searchPage.applyFilter = jest.fn();
            // act
            searchPage.handleFilterSelect(event);
            // assert
            expect(searchPage.applyFilter).not.toHaveBeenCalled();
        });

        it('should terminate the flow if the primaryCategory values does not have the value of the selected pill', () => {
            // arrange
            const event = {
                data: [
                    {
                        name: 'facet 1',
                        value: {
                            name: 'value1'
                        }
                    }
                ]
            };
            searchPage.initialFilterCriteria = {
                facetFilters: [
                    {
                        name: 'primaryCategory',
                        values: [
                            {
                                name: 'category 1',
                                value: 'value 1'
                            },
                            {
                                name: 'category 2',
                                value: 'value 2'
                            }
                        ]
                    },
                    {
                        name: 'grade',
                        values: [
                            {
                                name: 'grade 1',
                                value: 'value 1'
                            },
                            {
                                name: 'grade 2',
                                value: 'value 2'
                            }
                        ]
                    }
                ]
            }
            searchPage.applyFilter = jest.fn();
            // act
            searchPage.handleFilterSelect(event);
            // assert
            expect(searchPage.applyFilter).not.toHaveBeenCalled();
        });

        it('should not apply the filter if the primaryCategory values have the same value of the selected pill but its already applied is true', () => {
            // arrange
            const event = {
                data: [
                    {
                        name: 'facet 1',
                        value: {
                            name: 'category 1'
                        }
                    }
                ]
            };
            searchPage.initialFilterCriteria = {
                facetFilters: [
                    {
                        name: 'primaryCategory',
                        values: [
                            {
                                name: 'category 1',
                                value: 'value 1',
                                apply: true
                            },
                            {
                                name: 'category 2',
                                value: 'value 2',
                                apply: false
                            }
                        ]
                    },
                    {
                        name: 'grade',
                        values: [
                            {
                                name: 'grade 1',
                                value: 'value 1'
                            },
                            {
                                name: 'grade 2',
                                value: 'value 2'
                            }
                        ]
                    }
                ]
            }
            searchPage.applyFilter = jest.fn();
            // act
            searchPage.handleFilterSelect(event);
            // assert
            expect(searchPage.applyFilter).not.toHaveBeenCalled();
        });

        it('should apply the filter if the primaryCategory values have the same value of the selected pill', () => {
            // arrange
            const event = {
                data: [
                    {
                        name: 'facet 1',
                        value: {
                            name: 'category 1'
                        }
                    }
                ]
            };
            searchPage.initialFilterCriteria = {
                facetFilters: [
                    {
                        name: 'primaryCategory',
                        values: [
                            {
                                name: 'category 1',
                                value: 'value 1',
                                apply: false
                            },
                            {
                                name: 'category 2',
                                value: 'value 2',
                                apply: false
                            }
                        ]
                    },
                    {
                        name: 'grade',
                        values: [
                            {
                                name: 'grade 1',
                                value: 'value 1'
                            },
                            {
                                name: 'grade 2',
                                value: 'value 2'
                            }
                        ]
                    }
                ]
            }
            searchPage.applyFilter = jest.fn();
            // act
            searchPage.handleFilterSelect(event);
            // assert
            expect(searchPage.applyFilter).toHaveBeenCalled();
        });
    });
    describe('ionViewWillEnter', () => {
        it('show header with home button for download and notification on ionview enter', () => {
            // arrange
            searchPage.isFromGroupFlow = false;
            searchPage.searchWithBackButton = false;
            jest.spyOn(searchPage, 'enableHeaderEvents').mockImplementation();
            mockHeaderService.headerEventEmitted$ = {
                subscribe: jest.fn((fn => fn({ name: 'notification' })))}
            mockHeaderService.showHeaderWithHomeButton = jest.fn()
            mockFormAndFrameworkUtilService.getFormFields = jest.fn();
            mockSharedPreferences.getString = jest.fn(() => of())
            jest.spyOn(searchPage, 'handleSearch').mockImplementation();
            // act
            searchPage.ionViewWillEnter();
            // assert
            expect(mockHeaderService.showHeaderWithHomeButton).toHaveBeenCalledWith(['download', 'notification']);
        });
        it('show header with back button on ionview enter', (done) => {
            // arrange
            searchPage.isFromGroupFlow = true;
            searchPage.searchWithBackButton = false;
            searchPage.source = "group-detail"
            searchPage.preAppliedFilter = {
                query: ''
            }
            searchPage.dialCode = '';
            jest.spyOn(searchPage, 'enableHeaderEvents').mockImplementation();
            mockHeaderService.headerEventEmitted$ = {
                subscribe: jest.fn((fn => fn({ name: '' })))}
            mockHeaderService.showHeaderWithBackButton = jest.fn()
            mockFormAndFrameworkUtilService.getFormFields = jest.fn();
            mockSharedPreferences.getString = jest.fn(() => of())
            jest.spyOn(searchPage, 'handleSearch').mockImplementation();
            // act
            searchPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalledWith(null, mockCommonUtilService.translateMessage('SEARCH_IN_APP', { 'app_name': searchPage.appName}));
                done();
            }, 0);
        })
    })
    describe('ionViewWillLeave', () => {
        it('should unsubscribe event ', () => {
            // arrange
            searchPage.backButtonFunc = {
                unsubscribe: jest.fn()
            }
            searchPage.eventSubscription = {
                unsubscribe: jest.fn()
            }
            searchPage.headerObservable = {
                unsubscribe: jest.fn()
            }
            searchPage.refresher = {
                disabled: true
            }
            // act
            searchPage.ionViewWillLeave();
            // assert
            expect(searchPage.eventSubscription.unsubscribe).toHaveBeenCalled();
            expect(searchPage.headerObservable).toBeUndefined();
        })

        it('should unsubscribe event ', () => {
            // arrange
            searchPage.backButtonFunc = undefined
            searchPage.eventSubscription = undefined
            searchPage.headerObservable = {
                unsubscribe: jest.fn()
            }
            searchPage.refresher = {
                disabled: true
            }
            // act
            searchPage.ionViewWillLeave();
            // assert
            expect(searchPage.headerObservable).toBeUndefined();
        })
    });
    describe('redirectToNotifications', () => {
        it('should call telemetry and redirect to notification', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockRouter.navigate = jest.fn();
            // act
            searchPage.redirectToNotifications();
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith( InteractType.TOUCH,
                InteractSubtype.NOTIFICATION_CLICKED,
                Environment.HOME,
                PageId.SEARCH);
            expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.NOTIFICATION]);
        })
    });

    describe('hideRefresher', () => {
        it ('should hide referesher ', () => {
            // aarange
            const hide = true;
            searchPage.refresh = hide;
            // act
            searchPage.hideRefresher(hide);
        })
    });
    describe('ngOnDestroy', () => {
        it('should destory events subscribed ', () => {
            // arrange
            searchPage.eventSubscription = {
                unsubscribe: jest.fn()
            }
            searchPage.headerObservable = {
                unsubscribe: jest.fn()
            }
            // act
            searchPage.ngOnDestroy();
            // assert
            expect(searchPage.eventSubscription.unsubscribe).toHaveBeenCalled();
            expect(searchPage.headerObservable).toBeUndefined();
        })

        it('should return if events not subscribed ', () => {
            // arrange
            searchPage.eventSubscription = undefined;
            searchPage.headerObservable = {
                unsubscribe: jest.fn()
            }
            // act
            searchPage.ngOnDestroy();
            // assert
            expect(searchPage.headerObservable).toBeUndefined();
        })
    })
    
    describe('scrollToTop', () => {
        it('should scroll up the content list to top ', () => {
            searchPage.contentView = {
                scrollToTop: jest.fn(() => Promise.resolve())
            } as any;
            // act
            searchPage.scrollToTop();
            // assert
            expect(searchPage.contentView.scrollToTop).toHaveBeenCalled();
        })
    });

    describe('tabViewWillEnter', () => {
        it('show header with home button for download and notification', () => {
            // arrange
            searchPage.isFromGroupFlow = false;
            searchPage.searchWithBackButton = false;
            mockHeaderService.headerEventEmitted$ = {
                subscribe: jest.fn((fn => fn({ name: 'notification' })))}
            mockHeaderService.showHeaderWithHomeButton = jest.fn()
            // act
            searchPage.tabViewWillEnter();
            // assert
            expect(mockHeaderService.showHeaderWithHomeButton).toHaveBeenCalledWith(['download', 'notification']);
        });
        it('show header with back button', () => {
            // arrange
            searchPage.isFromGroupFlow = true;
            searchPage.searchWithBackButton = false;
            mockHeaderService.headerEventEmitted$ = {
                subscribe: jest.fn((fn => fn({ name: '' })))}
            mockHeaderService.showHeaderWithBackButton = jest.fn()
            searchPage.headerObservable = {
                unsubscribe: jest.fn()
            } as any
            // act
            searchPage.tabViewWillEnter();
            // assert
            expect(mockHeaderService.showHeaderWithBackButton).toHaveBeenCalledWith(null, mockCommonUtilService.translateMessage('SEARCH_IN_APP', { 'app_name': searchPage.appName}));
        })
    })
    describe('loadData', () => {
        it('should load data if no filter applied', (done) => {
            // arrange
            searchPage.isFilterApplied = false;
            searchPage.searchContentResult = undefined;
            jest.spyOn(searchPage, 'handleSearch').mockImplementation();
            // act
            searchPage.loadData();
            // assert
            setTimeout(() => {
                expect(searchPage.handleSearch).toHaveBeenCalledWith(true, 0);
                done();
            }, 500);
        });
        it('should load data if filter applied', (done) => {
            // arrange
            searchPage.isFilterApplied = true;
            searchPage.searchContentResult = [{data: {}, count: 0}, {data: {}, count: 0}, {data: {}, count: 0}];
            // act
            searchPage.loadData();
            // assert
            setTimeout(() => {
                expect(searchPage.applyFilter).toHaveBeenCalledWith(searchPage.searchContentResult.length);
                done();
            }, 500);
        })
    })

    describe('subscribeSdkEvent', () => {
        it('should subscribe sdk events ', () => {
            // arrange
            const event = {type: DownloadEventType.PROGRESS, payload: {
                downloadId: 'sample_id',
                identifier: 'sample',
                progress: 100,
                status: 8,
                bytesDownloaded: 3242,
                totalSizeInBytes: 234
            }};
            mockEventsBusService.events = jest.fn(() => of(event))
            mockEvents.subscribe = jest.fn();
            // act
            searchPage.subscribeSdkEvent()
            // assert
            setTimeout(() => {
                expect(mockEventsBusService.events).toHaveBeenCalled();
            }, 0);
        });
        it('should subscribe sdk events, if progress is not 100 ', () => {
            // arrange
            const event = {type: DownloadEventType.PROGRESS, payload: {
                downloadId: 'sample_id',
                identifier: 'sample',
                progress: -1,
                status: 8,
                bytesDownloaded: 3242,
                totalSizeInBytes: 234
            }};
            mockEventsBusService.events = jest.fn(() => of(event))
            mockEvents.subscribe = jest.fn();
            // act
            searchPage.subscribeSdkEvent()
            // assert
            setTimeout(() => {
                expect(mockEventsBusService.events).toHaveBeenCalled();
            }, 0);
        });
        it('should subscribe sdk events for import progress ', () => {
            // arrange
            const event = {type: ContentEventType.IMPORT_PROGRESS, payload: {
                downloadId: 'sample_id',
                identifier: 'sample',
                progress: 2,
                status: 8,
                totalCount: 2,
                currentCount: 1,
                bytesDownloaded: 3242,
                totalSizeInBytes: 234
            }}
            mockEventsBusService.events = jest.fn(() => of(event))
            mockEvents.subscribe = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn()
            // act
            searchPage.subscribeSdkEvent()
            // assert
            setTimeout(() => {
                expect(mockEventsBusService.events).toHaveBeenCalled();
                clearInterval()
            }, 1000);
        })
        it('should subscribe sdk events for import progress, current count and total count are same ', () => {
            // arrange
            const event = {type: ContentEventType.IMPORT_PROGRESS, payload: {
                downloadId: 'sample_id',
                identifier: 'sample',
                progress: 2,
                status: 8,
                totalCount: 2,
                currentCount: 2,
                bytesDownloaded: 3242,
                totalSizeInBytes: 234
            }}
            mockEventsBusService.events = jest.fn(() => of(event))
            mockEvents.subscribe = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn();
            let timer = 2;
            window.setInterval = jest.fn((fn) => fn({
                searchPage:{['loadingDisplayText'] : `Getting things ready in ${timer--}  seconds`}

            }), 1000) as any
            window.clearInterval = jest.fn();
            // act
            searchPage.subscribeSdkEvent()
            // assert
            setTimeout(() => {
                expect(mockEventsBusService.events).toHaveBeenCalled();
                clearInterval()
            }, 1000);
        })
        it('should subscribe sdk events for import progress, current count and total count are same ', () => {
            // arrange
            const event = {type: ContentEventType.IMPORT_PROGRESS, payload: {
                downloadId: 'sample_id',
                identifier: 'sample',
                progress: 2,
                status: 8,
                totalCount: 2,
                currentCount: 2,
                bytesDownloaded: 3242,
                totalSizeInBytes: 234
            }}
            mockEventsBusService.events = jest.fn(() => of(event))
            mockEvents.subscribe = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn();
            window.setInterval = jest.fn((fn) => fn({

            }), 1000) as any
            window.clearInterval = jest.fn();
            // act
            searchPage.subscribeSdkEvent()
            // assert
            setTimeout(() => {
                expect(mockEventsBusService.events).toHaveBeenCalled();
                clearInterval()
            }, 1000);
        })
        it('should subscribe sdk events for import completed ', () => {
            // arrange
            const event = {type: ContentEventType.IMPORT_COMPLETED, payload: {
                downloadId: 'sample_id',
                identifier: 'sample',
                progress: 2,
                contentId: 'id',
                status: 8,
                totalCount: 2,
                currentCount: 1,
                bytesDownloaded: 3242,
                totalSizeInBytes: 234
            }}
            searchPage.source = PageId.USER_TYPE_SELECTION;
            mockEventsBusService.events = jest.fn(() => of(event))
            mockEvents.subscribe = jest.fn();
            mockEvents.publish = jest.fn();
            searchPage.queuedIdentifiers = ['id', 'id1'];
            searchPage.isDownloadStarted = true;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn()
            // act
            searchPage.subscribeSdkEvent()
            // assert
            setTimeout(() => {
                expect(mockEventsBusService.events).toHaveBeenCalled();
                expect(mockEvents.publish).toHaveBeenCalledWith('savedResources:update', {
                    update: true
                  })
            }, 0);
        })

        it('should subscribe sdk events for import completed, if source is not USER_TYPE_SELECTION ', () => {
            // arrange
            const event = {type: ContentEventType.IMPORT_COMPLETED, payload: {
                downloadId: 'sample_id',
                identifier: 'sample',
                progress: 2,
                contentId: 'id',
                status: 8,
                totalCount: 2,
                currentCount: 1,
                bytesDownloaded: 3242,
                totalSizeInBytes: 234
            }}
            searchPage.source = PageId.HOME;
            mockEventsBusService.events = jest.fn(() => of(event))
            mockEvents.subscribe = jest.fn();
            mockEvents.publish = jest.fn();
            searchPage.queuedIdentifiers = ['id', 'id1'];
            searchPage.isDownloadStarted = true;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn()
            // act
            searchPage.subscribeSdkEvent()
            // assert
            setTimeout(() => {
                expect(mockEventsBusService.events).toHaveBeenCalled();
                expect(mockEvents.publish).toHaveBeenCalledWith('savedResources:update', {
                    update: true
                  })
            }, 0);
        })

        it('should subscribe sdk events for import completed, if queued identifier does not include contentid ', () => {
            // arrange
            const event = {type: ContentEventType.IMPORT_COMPLETED, payload: {
                downloadId: 'sample_id',
                identifier: 'sample',
                progress: 2,
                contentId: 'id',
                status: 8,
                totalCount: 2,
                currentCount: 1,
                bytesDownloaded: 3242,
                totalSizeInBytes: 234
            }}
            searchPage.source = PageId.USER_TYPE_SELECTION;
            mockEventsBusService.events = jest.fn(() => of(event))
            mockEvents.subscribe = jest.fn();
            mockEvents.publish = jest.fn();
            searchPage.queuedIdentifiers = ['id2', 'id1'];
            searchPage.isDownloadStarted = true;
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn()
            // act
            searchPage.subscribeSdkEvent()
            // assert
            setTimeout(() => {
                expect(mockEventsBusService.events).toHaveBeenCalled();
                expect(mockEvents.publish).toHaveBeenCalledWith('savedResources:update', {
                    update: true
                  })
            }, 0);
        })
        it('should subscribe sdk events for import completed with different length', () => {
            // arrange
            const event = {type: ContentEventType.IMPORT_COMPLETED, payload: {
                downloadId: 'sample_id',
                identifier: 'sample',
                progress: 2,
                contentId: 'id',
                status: 8,
                totalCount: 2,
                currentCount: 1,
                bytesDownloaded: 3242,
                totalSizeInBytes: 234
            }}
            searchPage.queuedIdentifiers = [];
            mockEventsBusService.events = jest.fn(() => of(event))
            mockEvents.subscribe = jest.fn();
            mockEvents.publish = jest.fn();
            // act
            searchPage.subscribeSdkEvent()
            // assert
            setTimeout(() => {
                expect(mockEventsBusService.events).toHaveBeenCalled();
                expect(mockEvents.publish).toHaveBeenCalledWith('savedResources:update', {
                    update: true
                  })
            }, 0);
        })
    })

    describe('ngAfterViewInit', () => {
        it('should handle searchbar and search history on ngAfterViewInit ', () => {
            // arrange
            const event: CustomEvent<any> = {target:['value']}
            searchPage.searchBar = {
                ionChange: {
                    pipe: jest.fn(() => ({
                        rxjsMap: jest.fn((fn) => fn(event)),
                        share:jest.fn(),
                        startWith: jest.fn(),
                        debounceTime: jest.fn(),
                        switchMap: jest.fn((fn) => fn('')),
                        tap: jest.fn((fn1) => fn1())
                    }))
                }
            };
            window.setTimeout = jest.fn((fn) => fn({}), ) as any;
            searchPage['searchHistoryService'] = {
                getEntries: jest.fn()
            }
            // act
            searchPage.ngAfterViewInit();
            // assert
        })
    });

    describe('init', () => {
        beforeEach(() => {
            const mockRouterExtras = {
                extras: {
                    state: {
                        dialCode: [{}],
                        primaryCategories: 'primaryCategories',
                        corRelationList: 'corRelationList',
                        source: PageId.HOME,
                        enrolledCourses: 'enrolledCourses' as any,
                        userId: 'userId',
                        shouldGenerateEndTelemetry: false,
                        preAppliedFilter: ''
                    },
                }
            };
            mockRouter.getCurrentNavigation = jest.fn(() => mockRouterExtras as any);
        })
        it('should call init and generatepage loaded telemtry', () => {
            // arrange
            const mockRouterExtras = {
                extras: {
                    state: {
                        dialCode: [{}],
                        primaryCategories: 'primaryCategories',
                        corRelationList: 'corRelationList',
                        source: PageId.HOME,
                        enrolledCourses: 'enrolledCourses' as any,
                        userId: 'userId',
                        shouldGenerateEndTelemetry: false,
                        preAppliedFilter: ''
                    },
                }
            };
            searchPage.responseData = {
                filterCriteria: {
                    facetFilters: [{ name: 'audience1', values: ['val1'] }]
                }
            };
            mockRouter.getCurrentNavigation = jest.fn(() => mockRouterExtras as any),
            mockEvent.subscribe = jest.fn((_, fn) => fn({
                facetFilters: [{ name: 'audience1', values: ['val1'] }]
            }));
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn()
            const corRelationList: Array<CorrelationData> = [];
            corRelationList.push({ id: searchPage.dialCode, type: CorReleationDataType.QR });
            corRelationList.push({ id: '1', type: CorReleationDataType.COUNT_BOOK });
            // act
            searchPage.init()
            // assert
            setTimeout(() => {
            }, 0);
        })
        it('should call init and generatepage loaded telemtry', () => {
            // arrange
            const mockRouterExtras = {
                extras: {
                    state: {
                        dialCode: [],
                        primaryCategories: 'primaryCategories',
                        corRelationList: 'corRelationList',
                        source: PageId.HOME,
                        enrolledCourses: 'enrolledCourses' as any,
                        userId: 'userId',
                        shouldGenerateEndTelemetry: false,
                        preAppliedFilter: ''
                    },
                }
            };
            searchPage.responseData = {
                filterCriteria: {
                    facetFilters: [{ name: 'audience1', values: ['val1'] }]
                }
            };
            mockRouter.getCurrentNavigation = jest.fn(() => mockRouterExtras as any),
            mockEvent.subscribe = jest.fn((_, fn) => fn( {
                facetFilters: [{ name: 'audience1', values: ['val1'] }]
            }));
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn()
            const corRelationList: Array<CorrelationData> = [];
            corRelationList.push({ id: searchPage.dialCode, type: CorReleationDataType.QR });
            corRelationList.push({ id: '1', type: CorReleationDataType.COUNT_BOOK });
            // act
            searchPage.init()
            // assert
            setTimeout(() => {
            }, 0);
        })
    })
});
