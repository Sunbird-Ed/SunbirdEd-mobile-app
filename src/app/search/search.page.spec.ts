import { SearchPage } from './search.page';
import { MimeType, RouterLinks } from '@app/app/app.constant';
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
} from 'sunbird-sdk';
import { TranslateService } from '@ngx-translate/core';
import { Events, Platform, NavController, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import {
    AppGlobalService,
    TelemetryGeneratorService,
    CommonUtilService,
    AppHeaderService
} from 'services';
import { Location } from '@angular/common';
import { ImpressionType, PageId, Environment, InteractSubtype, InteractType, LogLevel, Mode } from '@app/services/telemetry-constants';
import { of, throwError } from 'rxjs';
import { NgZone, ChangeDetectorRef } from '@angular/core';
import { FormAndFrameworkUtilService, AuditType, ImpressionSubtype, GroupHandlerService } from '../../services';
import { SbProgressLoader } from '@app/services/sb-progress-loader.service';
import { CsGroupAddableBloc } from '@project-sunbird/client-services/blocs';
import { NavigationService } from '../../services/navigation-handler.service';
import { ProfileHandler } from '@app/services/profile-handler';
import { mockSupportedUserTypeConfig } from '../../services/profile-handler.spec.data';
describe('SearchPage', () => {
    let searchPage: SearchPage;
    const mockAppGlobalService: Partial<AppGlobalService> = {
        generateSaveClickedTelemetry: jest.fn(),
        isUserLoggedIn: jest.fn(() => true),
        getCurrentUser: jest.fn(() => { })
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
        }))
    };
    const mockEvents: Partial<Events> = {
        unsubscribe: jest.fn()
    };
    const mockEvent: Partial<Events> = {
        unsubscribe: jest.fn(),
        subscribe: jest.fn()
    };
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {
        hideHeader: jest.fn()
    };
    const mockLocation: Partial<Location> = {
        back: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {};
    const mockProfileService: Partial<ProfileService> = {};
    const mockRouterExtras = {
        extras: {
            state: {
                primaryCategories: 'primaryCategories',
                corRelationList: 'corRelationList',
                source: 'source',
                enrolledCourses: 'enrolledCourses' as any,
                userId: 'userId',
                shouldGenerateEndTelemetry: false
            }
        }
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockRouterExtras as any),
        navigate: jest.fn(() => Promise.resolve(true))
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn(),
        generateImpressionTelemetry: jest.fn(),
        generateBackClickedTelemetry: jest.fn(),
        generateExtraInfoTelemetry: jest.fn()
    };
    const mockTranslate: Partial<TranslateService> = {
        currentLang: 'en'
    };
    const mockContentService: Partial<ContentService> = {};
    const mockpageService: Partial<ContentService> = {};
    const mockEventsBusService: Partial<EventsBusService> = {};
    const mockZone: Partial<NgZone> = {
        run: jest.fn((fn) => fn())
    };

    const mockNavCtrl: Partial<NavController> = {
        navigateForward: jest.fn(() => Promise.resolve(true))
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {
        putString: jest.fn(),
        getString: jest.fn(() => of('ka' as any))
    };
    const mockCourseService: Partial<CourseService> = {
        getEnrolledCourses: jest.fn(() => of([]))
    };
    const mocksearchHistoryService: Partial<SearchHistoryService> = {};
    const mockAppversion: Partial<AppVersion> = {
        getPackageName: jest.fn(() => Promise.resolve('org.sunbird.app')),
        getAppName: jest.fn(() => Promise.resolve('Sunbird'))
    };
    const mockchangeDetectionRef: Partial<ChangeDetectorRef> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        init: jest.fn(),
        checkNewAppVersion: jest.fn(() => Promise.resolve({})),
        getFormFields: jest.fn(() => Promise.resolve([]))
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
            mockProfileHandler as ProfileHandler
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should create a instance of searchPage', () => {
        expect(searchPage).toBeTruthy();
        expect(searchPage.primaryCategories).toEqual('primaryCategories');
    });

    // arrange
    // act
    // assert
    // describe('ngOnInit', () => {
    it('should fetch app name on ngOnInit', (done) => {
        // arrange
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
        searchPage.searchBar = {
            setFocus: jest.fn()
        };
        jest.spyOn(searchPage, 'checkUserSession').mockImplementation();
        mockSbProgressLoader.hide = jest.fn();
        // act
        searchPage.ionViewDidEnter();
        // assert
        expect(searchPage.checkUserSession).toHaveBeenCalled();
        setTimeout(() => {
            expect(searchPage.isFirstLaunch).toBe(false);
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

    describe('onSearchHistoryTap', () => {
        it('onSearchHistoryTap', () => {
            // arrange
            jest.spyOn(searchPage, 'handleSearch').mockImplementation();
            const searchEntry = {
                query: 'query'
            };
            // act
            searchPage.onSearchHistoryTap(searchEntry);
            // assert
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
            mockTelemetryGeneratorService.isCollection = jest.fn(() => true);
            // act
            searchPage.openCollection(collection);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.CONTENT_CLICKED,
                Environment.HOME,
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
            expect(searchPage.enrolledCourses.length).toEqual(0);
            expect(mockNavigationService.navigateToTrackableCollection).toHaveBeenCalledWith(
                expect.anything()
            );
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
            // act
            searchPage.openCollection(collection);
            // assert
            setTimeout(() => {
                expect(searchPage.enrolledCourses.length).toEqual(1);
                expect(searchPage.showLoader).toBe(false);
                expect(mockAppGlobalService.setEnrolledCourseList).toHaveBeenCalled();
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
        it('should navigate to qrcode result page', () => {
            // arrange
            const collection = {
                identifier: 'identifier',
                mimeType: MimeType.COLLECTION,
                contentType: 'collection'
            };
            mockTelemetryGeneratorService.isCollection = jest.fn(() => true);
            searchPage.isDialCodeSearch = true;
            mockAppGlobalService.isOnBoardingCompleted = jest.fn(() => false);
            mockAppGlobalService.getProfileSettingsStatus = jest.fn(() => Promise.resolve(true));
            searchPage.guestUser = false;
            // mockAppGlobalService.setEnrolledCourseList = jest.fn();
            // mockCourseService.getEnrolledCourses = jest.fn(() => throwError({}));
            // act
            searchPage.openCollection(collection);
            // assert
            expect(mockNavigationService.navigateToCollection).toHaveBeenCalledWith(
                expect.anything()
            );
        });
        it('should navigate to content details page', () => {
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
            expect(mockNavigationService.navigateToContent).toHaveBeenCalledWith(
                expect.anything()
            );
        });
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
            searchPage.profile = {};
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
            searchPage.profile = {};
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
        it('should set profile data accordingly', () => {
            // arrange
            const data = {
                framework: 'framework1'
            };
            const profile = {
                syllabus: ['framework1']
            };
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of({ identifier: 'fm', name: 'fm' }));
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
                contentType: 'Resource'
            };
            const profile = {
                syllabus: ['framework1']
            };
            const getActiveChannelSuggestedFrameworkListResp = [{ identifier: 'framework1', name: 'framework1' }];
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(getActiveChannelSuggestedFrameworkListResp));
            mockFrameworkService.getFrameworkDetails = jest.fn(() => throwError('err' as any));
            // act
            searchPage.checkProfileData(data, profile);
            // assert
            setTimeout(() => {
                expect(searchPage.isProfileUpdated).toEqual(true);
                expect(mockFrameworkService.getFrameworkDetails).toHaveBeenCalled();
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
                expect(searchPage.setCurrentProfile).toHaveBeenCalledWith(
                    0,
                    data
                );
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
                expect(searchPage.setCurrentProfile).toHaveBeenCalledWith(
                    1,
                    data
                );
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
                    2,
                    data
                );
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
                expect(mockFrameworkService.getFrameworkDetails).toHaveBeenCalled();
                expect(searchPage.boardList).toEqual(getFrameworkDetailsResp.categories[0].terms);
                done();
            }, 10);
        });

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
            mockCourseService.getEnrolledCourses = jest.fn(() => of(kgetEnrolledCoursesResp));
            const contentMock = {
                identifier: 'id1',
                contentType: 'type1',
                pkgVersion: '1'
            };
            // act
            searchPage.openContent(undefined, contentMock);
            // assert
            expect(searchPage.generateInteractEvent).toHaveBeenCalled();
            setTimeout(() => {
                expect(searchPage.navigateToBatchListPopup).toHaveBeenCalled();
                done();
            }, 0);
        });
    });
    describe('showFilter', () => {
        it('should goto filter page on showFilter', (done) => {
            // arrange
            searchPage.source = 'source';
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
            searchPage.searchFilterConfig = [];
            // act
            searchPage.showFilter();
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.FILTER_BUTTON_CLICKED,
                Environment.HOME,
                'source',
                undefined
            );
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalled();
                done();
            }, 0);
        });
    });
    describe('applyFilter and handleCancel', () => {
        it('should updateFilterIcon on applyFilter', (done) => {
            // arrange
            const searchContentResp = {
                contentDataList: {}
            };
            jest.spyOn(searchPage, 'updateFilterIcon').mockImplementation();
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

        it('should reset values on handle cancel', () => {
            // arrange
            // act
            searchPage.handleCancel();
            // assert
            expect(searchPage.isEmptyResult).toEqual(false);
        });
    });
    describe('handleSearch', () => {
        it('should return without doing anything', () => {
            // arrange
            jest.spyOn(searchPage, 'scrollToTop').mockImplementation();
            searchPage.searchKeywords = 'ab';
            // act
            searchPage.handleSearch();
            // assert
        });
        it('should handle success search scenario', (done) => {
            // arange
            jest.spyOn(searchPage, 'scrollToTop').mockImplementation();
            searchPage.searchKeywords = 'abcd';
            const searchContentResp = {
                contentDataList: {
                    identifier: 'id'
                },
                filterCriteria: {}
            };
            mockContentService.searchContent = jest.fn(() => of(searchContentResp));
            mocksearchHistoryService.addEntry = jest.fn(() => of(undefined));
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
            searchPage.handleSearch();
            // assert
            expect(searchPage.showLoader).toEqual(true);
            expect(mocksearchHistoryService.addEntry).toHaveBeenCalled();
            setTimeout(() => {
                expect(searchPage.searchContentResult).toEqual(searchContentResp.contentDataList);
                expect(searchPage.isEmptyResult).toBe(false);
                expect(searchPage.responseData).toEqual(searchContentResp);
                expect(searchPage.updateFilterIcon).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateLogEvent).toHaveBeenCalledWith(
                    LogLevel.INFO,
                    expect.anything(),
                    Environment.HOME,
                    ImpressionType.SEARCH,
                    expect.anything()
                );
                done();
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
            mockContentService.searchContent = jest.fn(() => of(searchContentResp));
            mocksearchHistoryService.addEntry = jest.fn(() => of(undefined));
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
            searchPage.handleSearch();
            // assert
            expect(searchPage.showLoader).toEqual(true);
            expect(mocksearchHistoryService.addEntry).toHaveBeenCalled();
            setTimeout(() => {
                expect(searchPage.searchContentResult).toEqual(searchContentResp.contentDataList);
                expect(searchPage.isEmptyResult).toBe(false);
                expect(searchPage.responseData).toEqual(searchContentResp);
                expect(searchPage.updateFilterIcon).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateLogEvent).toHaveBeenCalledWith(
                    LogLevel.INFO,
                    expect.anything(),
                    Environment.HOME,
                    ImpressionType.SEARCH,
                    expect.anything()
                );
                done();
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
            searchPage.source = PageId.ONBOARDING_PROFILE_PREFERENCES;
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
        it('should generate QRScanSuccess Interact Event online', () => {
            // arrange
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
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
            // act
            searchPage.generateQRScanSuccessInteractEvent(2, 'ABCDEF');
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.OTHER,
                InteractSubtype.DIAL_SEARCH_RESULT_FOUND,
                expect.anything(),
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
        // it('checkParent', (done) => {
        //     // arrange
        //     mockContentService.getContentDetails = jest.fn(() => throwError({ error: 'CONNECTION_ERROR' }));
        //     // act
        //     searchPage.checkParent('parent', 'child');
        //     // assert
        //     setTimeout(() => {
        //         expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_OFFLINE_MODE');
        //         done();
        //     }, 0);
        // });
    });
    // describe('processDialCodeResult', () => {
    //     it('processDialCodeResult', () => {

    //     });
    // });
    describe('downloadParentContent', () => {
        it('should push not downloaded identifiers in to queue', (done) => {
            // arrange
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

        describe('handleDeviceBackButton', () => {
            it('should handle Device BackButton for dialcode', () => {
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
                expect(mockTelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalledWith(
                    true,
                    Environment.HOME,
                    PageId.QR_BOOK_RESULT
                );
            });

            it('should handle Device BackButton', () => {
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
                expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                    ImpressionType.SEARCH,
                    Environment.HOME, false, undefined,
                    [{ id: '', type: 'API' },
                    { id: '', type: 'API' },
                    { id: 'SearchResult', type: 'Section' },
                    { id: 'filter', type: 'DiscoveryType' }]
                );
            });
        });
    });

    describe('goBack', () => {
        it('should generate beck telemetry for qrCode', () => {
            searchPage.displayDialCodeResult = [{
                dialCodeResult: ['result-1']
            }];
            mockTelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
            searchPage.source = PageId.ONBOARDING_PROFILE_PREFERENCES;
            // act
            searchPage.goBack();
            // assert
            expect(mockTelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalledWith(
                false,
                Environment.ONBOARDING,
                PageId.QR_BOOK_RESULT
            );
        });
    });

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
            searchPage.primaryCategoryFilters = [];
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
            searchPage.fetchPrimaryCategoryFilters([]);
            // assert
            expect(searchPage.primaryCategoryFilters).toEqual([]);
        });

        it('should assign value to primaryCategoryFilters if the value is not assigned and primary category is present in facetfilters', () => {
            // arrange
            searchPage.primaryCategoryFilters = undefined;
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
            // act
            searchPage.fetchPrimaryCategoryFilters(facetFilters);
            // assert
            setTimeout(() => {
                expect(searchPage.primaryCategoryFilters).toEqual(facetFilters[1].value);
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

});
