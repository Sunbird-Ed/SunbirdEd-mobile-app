import { CategoriesEditPage } from './categories-edit.page';
import {
    FrameworkService,
    FrameworkUtilService,
    ProfileService
} from '@project-sunbird/sunbird-sdk';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';
import { Events } from '../../../util/events';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import {
    AppGlobalService,
    CommonUtilService,
    ContainerService,
    AppHeaderService,
    ActivePageService,
    FormAndFrameworkUtilService,
    TelemetryGeneratorService
} from '../../../services';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProfileHandler } from '../../services/profile-handler';
import { SbProgressLoader } from '../../../services/sb-progress-loader.service';
import { ExternalIdVerificationService } from '../../services/externalid-verification.service';
import { TncUpdateHandlerService } from '../../services/handlers/tnc-update-handler.service';
import { of, throwError } from 'rxjs';
import { CachedItemRequestSourceFrom, Framework, FrameworkCategoryCodesGroup, GetSuggestedFrameworksRequest, SharedPreferences, UpdateServerProfileInfoRequest } from '@project-sunbird/sunbird-sdk';
import { PreferenceKey, ProfileConstants, RouterLinks } from '../../app.constant';
import { SegmentationTagService } from '../../../services/segmentation-tag/segmentation-tag.service';
import { CategoriesEditService } from './categories-edit.service';

describe('CategoryEditPage', () => {
    let categoryEditPage: CategoriesEditPage;
    const mockAppGlobalService: Partial<AppGlobalService> = {
        generateSaveClickedTelemetry: jest.fn(),
        closeSigninOnboardingLoader: jest.fn(),
        getCurrentUser: jest.fn(() => ({ board: ['AP'] })),
        getRequiredCategories: jest.fn()
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn(() => ({
            toLocaleUpperCase: jest.fn()
        })) as any,
        showToast: jest.fn()
    };
    const mockContainer: Partial<ContainerService> = {};
    const mockEvents: Partial<Events> = {};
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {
        getFrameworkCategoryTerms: jest.fn(() => of({})) as any,
    };
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockLocation: Partial<Location> = {};
    const mockProfileService: Partial<ProfileService> = {};
    const mockRoterExtras = {
        extras: {
            state: {
                contentType: 'contentType',
                corRelationList: 'corRelationList',
                source: 'source',
                enrolledCourses: 'enrolledCourses' as any,
                userId: 'userId',
                shouldGenerateEndTelemetry: false,
                isNewUser: true,
                lastCreatedProfile: { id: 'sample-id' },
                showOnlyMandatoryFields: true,
                hasFilledLocation: true,
                isRootPage: true,
                profile: {
                    serverProfile: {
                        userType: 'teacher',
                        firstName: 'sample-user',
                    }
                }
            }
        }
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => (mockRoterExtras)) as any,
        navigate: jest.fn(() => Promise.resolve(true))
    };
    const mockTranslate: Partial<TranslateService> = {};
    const mockPlatform: Partial<Platform> = {
        is: jest.fn(platform => platform === 'ios')
    };
    const mockActivatedRoute: Partial<ActivatedRoute> = {};
    mockActivatedRoute.snapshot = {
        queryParams: {
            reOnBoard: {}
        }
    } as any;

    const mockProgressLoader: Partial<SbProgressLoader> = {};
    const mockTncUpdateHandler: Partial<TncUpdateHandlerService> = {};
    const mockExternalIdVerificationService: Partial<ExternalIdVerificationService> = {};
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        invokedGetFrameworkCategoryList: jest.fn(() => Promise.resolve(FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES))
    };
    const mockActivePageService: Partial<ActivePageService> = {};
    const mockFb: Partial<FormBuilder> = {
        group: jest.fn(() => ({})) as any,
        control: jest.fn()
    };

    const mockProfileHandler: Partial<ProfileHandler> = {
        getSupportedProfileAttributes: jest.fn(() => Promise.resolve({ borad: 'board', medium: 'medium', gradeLevel: 'gradeLevel' }))
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockSegmentationTagService: Partial<SegmentationTagService> = {};

    window['segmentation'] = {
        init: jest.fn(),
        SBTagService: {
            pushTag: jest.fn(),
            removeAllTags: jest.fn(),
            restoreTags: jest.fn()
        }
    };
    const mockCategoriesEditService: Partial<CategoriesEditService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    window.console.error = jest.fn();

    beforeAll(() => {
        categoryEditPage = new CategoriesEditPage(
            mockProfileService as ProfileService,
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockSharedPreferences as SharedPreferences,
            mockCommonUtilService as CommonUtilService,
            mockFb as FormBuilder,
            mockTranslate as TranslateService,
            mockAppGlobalService as AppGlobalService,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockLocation as Location,
            mockPlatform as Platform,
            mockActivePageService as ActivePageService,
            mockProgressLoader as SbProgressLoader,
            mockProfileHandler as ProfileHandler,
            mockSegmentationTagService as SegmentationTagService,
            mockCategoriesEditService as CategoriesEditService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockTncUpdateHandler as TncUpdateHandlerService
        );
        const mockRoterExtras = {
            extras: {
                state: {
                    contentType: 'contentType',
                    corRelationList: 'corRelationList',
                    source: 'source',
                    enrolledCourses: 'enrolledCourses' as any,
                    userId: 'userId',
                    shouldGenerateEndTelemetry: false,
                    isNewUser: true,
                    lastCreatedProfile: { id: 'sample-id' },
                    showOnlyMandatoryFields: false,
                    hasFilledLocation: true,
                    shouldUpdatePreference: true,
                    isRootPage: true,
                    profile: {
                        serverProfile: {
                            userType: 'teacher',
                            firstName: 'sample-user',
                        }
                    }
                }
            }
        };
        mockRouter.getCurrentNavigation = jest.fn(() => (mockRoterExtras)) as any;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of CategoryEditPage', () => {
        expect(categoryEditPage).toBeTruthy();
    });
    
    describe('get', () => {
        it('should be initialized syllabus', () => {
            // arrange
            categoryEditPage.profileEditForm = {
                get: jest.fn(() => ({
                    syllabus: ['sample-syllabus']
                })),
            } as any;
            expect(categoryEditPage.syllabusControl).toBeTruthy();
        });

        it('should be initialized boardControl', () => {
            // arrange
            categoryEditPage.profileEditForm = {
                get: jest.fn(() => ({
                    boards: ['sample-board']
                })),
            } as any;
            expect(categoryEditPage.boardControl).toBeTruthy();
        });

        it('should be initialized mediumControl', () => {
            // arrange
            categoryEditPage.profileEditForm = {
                get: jest.fn(() => ({
                    medium: ['english']
                })),
            } as any;
            expect(categoryEditPage.mediumControl).toBeTruthy();
        });

        it('should be initialized gradeControl', () => {
            // arrange
            categoryEditPage.profileEditForm = {
                get: jest.fn(() => ({
                    grades: ['sample-grade']
                })),
            } as any;
            expect(categoryEditPage.gradeControl).toBeTruthy();
        });

        it('should be initialized subject', () => {
            // arrange
            categoryEditPage.profileEditForm = {
                get: jest.fn(() => ({
                    subjects: ['sample-grade']
                })),
            } as any;
            expect(categoryEditPage.subjectControl).toBeTruthy();
        });
    });

    describe('ngOnInit', () => {
        it('should check for user type and isSSOuser', (done) => {
            // arrange
            mockSharedPreferences.getString = jest.fn(() => of(''));
            mockTncUpdateHandler.isSSOUser = jest.fn()
            // act
            categoryEditPage.ngOnInit()
            // assert
            setTimeout(() => {
                expect(mockSharedPreferences.getString).toHaveBeenCalled()
                done()
            }, 0);
        })
    });

    describe('initializeLoader', () => {
        it('should create a loader', (done) => {
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: jest.fn(() => Promise.resolve())
            }));
            categoryEditPage.initializeLoader();
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                done();
            }, 0);
        });
    })

    describe('getSyllabusDetails', () => {
        it('should show data not found toast message if syllabus list is empty.', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            })) as any;
            categoryEditPage.loader = mockCommonUtilService.getLoader;
            const frameworkRes: Framework[] = [];
            mockTranslate.currentLang = 'en'
            mockFormAndFrameworkUtilService.invokedGetFrameworkCategoryList = jest.fn(() => Promise.resolve(FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES))
            const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
                from: 'server',
                language: 'en',
                requiredCategories: undefined
            };
            mockCommonUtilService.showToast = jest.fn();
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(frameworkRes));
            // act
            categoryEditPage.getSyllabusDetails();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList).toHaveBeenCalledWith(getSuggestedFrameworksRequest);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NO_DATA_FOUND');
                expect(categoryEditPage.loader.dismiss).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should show a toast if framework is empty', (done) => {
            // arrange
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn
            }));
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of([]));
            mockCommonUtilService.showToast = jest.fn();
            // act
            categoryEditPage.getSyllabusDetails();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NO_DATA_FOUND');
                done();
            }, 0);
        });

        it('should show a toast if framework has length', (done) => {
            // arrange
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn
            }));
            categoryEditPage.profile = {
                syllabus: ['']
            }
            categoryEditPage.guestUserProfile = {
                syllabus: ['']
            }
            categoryEditPage.profileEditForm = {
                get: jest.fn(() => (
                    {
                        syllabus: ['sample-syllabus'],
                        valueChanges: of(['SAMPLE_STRING']),
                        patchValue: jest.fn()
                    }
                ))
            }
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of([{name: 'sunbird', identifier: 'do-123' }]));
            // act
            categoryEditPage.getSyllabusDetails();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(presentFn).toHaveBeenCalled();
                expect(dismissFn).toHaveBeenCalled();
                expect(mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('getLoggedInFrameworkCategory', () => {
        it('should return error message for board', (done) => {
            // arrange
            mockFrameworkService.getChannelDetails = jest.fn(() => of({
                identifier: 'sample-id',
                code: 'sample-code'
            })) as any;
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of({
                name: 'sample-name',
                identifier: 'sample-id',
                categories: [{code: 'board', identifier: 'sample-id'}, {code: 'medium', identifier: 'sample-id1'}]
            })) as any;
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of([{
                name: 'sample-name',
                identifier: 'sample-id'
            }]));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            mockCommonUtilService.translateMessage = jest.fn(() => 'Turn on WiFi or mobile data and try again');
            mockCommonUtilService.showToast = jest.fn();
            // act
            categoryEditPage.getLoggedInFrameworkCategory();
            // assert
            setTimeout(() => {
                expect(mockFrameworkService.getChannelDetails).toHaveBeenCalled();
                expect(mockFrameworkService.getFrameworkDetails).toHaveBeenCalled();
                expect(mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList).toHaveBeenCalled();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeFalsy();
                done();
            }, 0);
        });

        it('should return error message for medium', (done) => {
            // arrange
            mockFrameworkService.getChannelDetails = jest.fn(() => throwError({}));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: false
            };
            // act
            categoryEditPage.getLoggedInFrameworkCategory();
            // assert
            setTimeout(() => {
                expect(mockFrameworkService.getChannelDetails).toHaveBeenCalled();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeFalsy();
                done();
            }, 0);
        });
    });

    describe('setDefaultBMG', () => {
        it('should return guest profile details', (done) => {
            // arrange
            mockCommonUtilService.getGuestUserConfig = jest.fn(() => Promise.resolve({
                board: ['sample-board'],
                medium: ['sample-medium'],
                grade: ['sample-grade'],
                syllabus: ['sample-board']
            }));
            // act
            categoryEditPage.setDefaultBMG();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getGuestUserConfig).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('getCategoriesForMUAuser', () => {
        it('should get categories for MUAUser ', () => {
            // arrange
            mockProfileService.getServerProfilesDetails = jest.fn(() => of({id: '12'})) as any
            // act
            categoryEditPage.getCategoriesForMUAuser()
            // assert
        })
    })

    describe('setFrameworkCategory1Value', () => {
        it('should handle setFrameworkCategory1Value', () => {
            // arrange
            categoryEditPage.categories = [{code: 'code', identifier: 'id', itemList: ''}, {code: 'code', identifier: 'id', itemList: ''}] as any
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(() => Promise.resolve()),
                dismiss: jest.fn(() => Promise.resolve())
            }))
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of([{name: 'name', code: 'syllabus'}])) as any
            mockTranslate.currentLang = "en";
            mockCommonUtilService.showToast = jest.fn()
            // act
            categoryEditPage.setFrameworkCategory1Value()
            // assert
        })

        it('should handle setFrameworkCategory1Value, if no framework length', () => {
            // arrange
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(() => Promise.resolve()),
                dismiss: jest.fn(() => Promise.resolve())
            }))
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of([])) as any
            mockTranslate.currentLang = "en";
            mockCommonUtilService.showToast = jest.fn()
            // act
            categoryEditPage.setFrameworkCategory1Value()
            // assert
        })
    })

    describe('setCategoriesTerms', () => {
        it('should handle setCategoriesTerms', () => {
            // arrange
            mockFrameworkUtilService.getFrameworkCategoryTerms = jest.fn(() => of([{name: 'name', code: 'code'}])) as any
            // act
            categoryEditPage.setCategoriesTerms()
            // assert
        })

        it('should handle error on setCategoriesTerms', () => {
            // arrange
            mockFrameworkUtilService.getFrameworkCategoryTerms = jest.fn(() => throwError({})) as any
            // act
            categoryEditPage.setCategoriesTerms()
            // assert
        })
    })

    describe('ionViewWillEnter', () => {
        it('should subscribe back button for loggedIn User', (done) => {
            // arrange
            jest.spyOn(categoryEditPage, 'setDefaultBMG').mockImplementation(() => {
                return Promise.resolve();
            });
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            mockHeaderService.getDefaultPageConfig = jest.fn(() => ({
                actionButtons: [''],
                showHeader: true,
                showBurgerMenu: true
            })) as any;
            mockFormAndFrameworkUtilService.invokedGetFrameworkCategoryList = jest.fn(() => Promise.resolve([{code: 'board', identifier: 'sample-id'}, {code: 'medium', identifier: 'sample-id1'}]))
            jest.spyOn(categoryEditPage, 'getCategoriesForMUAuser').mockImplementation(() => Promise.resolve({framework: ''}) as any)
            jest.spyOn(categoryEditPage, 'setFrameworkCategory1Value').mockImplementation()
            mockHeaderService.updatePageConfig = jest.fn();
            categoryEditPage.isRootPage = true;
            const subscribeWithPriorityData = jest.fn((_, fn) => fn());
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData,
            } as any;
            mockActivePageService.computePageId = jest.fn(() => 'sample-page');
            mockCommonUtilService.showExitPopUp = jest.fn(() => Promise.resolve());
            // act
            categoryEditPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(categoryEditPage.disableSubmitButton).toBeFalsy();
                expect(mockHeaderService.getDefaultPageConfig).toHaveBeenCalled();
                expect(mockHeaderService.updatePageConfig).toHaveBeenCalled();
                expect(categoryEditPage.isRootPage).toBeTruthy();
                expect(mockPlatform.backButton).toBeTruthy();
                expect(subscribeWithPriorityData).toHaveBeenCalled();
                expect(mockActivePageService.computePageId).toHaveBeenCalled();
                expect(mockCommonUtilService.showExitPopUp).toHaveBeenCalled();
                done()
            }, 0);
        });

        it('should subscribe back button for loggedIn User, if profiile categories are present', (done) => {
            // arrange
            jest.spyOn(categoryEditPage, 'setDefaultBMG').mockImplementation(() => {
                return Promise.resolve();
            });
            categoryEditPage.editProfileForm = {
                controls: {
                    board: {
                      pristine: true,
                      touched: false,
                      defaultValue: null,
                      value: [],
                      status: 'VALID',
                      errors: null
                    },
                    medium: {
                      pristine: true,
                      touched: false,
                      defaultValue: null,
                      value: [],
                      status: 'VALID',
                      errors: null
                    },
                  status: 'VALID',
                  value: { boards: ['cbsc'],
                  medium: ['english'], },
                  errors: null
                },
                value: {},
                get: jest.fn(() => ({
                    value: [{board: ''}]
                }))
            } as any
            categoryEditPage.profile = {syllabus: ['syllabus'], categories: JSON.stringify({board: 'board', medium: 'medium'}), serverProfile: {framework: ''}} as any
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            mockHeaderService.getDefaultPageConfig = jest.fn(() => ({
                actionButtons: [''],
                showHeader: true,
                showBurgerMenu: true
            })) as any;
            mockFormAndFrameworkUtilService.invokedGetFrameworkCategoryList = jest.fn(() => Promise.resolve([{code: 'board', identifier: 'sample-id'}, {code: 'medium', identifier: 'sample-id1'}]))
            mockProfileService.getServerProfilesDetails = jest.fn(() => of({id: '12'})) as any
            mockFrameworkUtilService.getFrameworkCategoryTerms = jest.fn(() => throwError([{}]))
            mockHeaderService.updatePageConfig = jest.fn();
            categoryEditPage.isRootPage = true;
            const subscribeWithPriorityData = jest.fn((_, fn) => fn());
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData,
            } as any;
            mockActivePageService.computePageId = jest.fn(() => 'sample-page');
            mockCommonUtilService.showExitPopUp = jest.fn(() => Promise.resolve());
            // act
            categoryEditPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(categoryEditPage.disableSubmitButton).toBeFalsy();
                expect(mockHeaderService.getDefaultPageConfig).toHaveBeenCalled();
                expect(mockHeaderService.updatePageConfig).toHaveBeenCalled();
                expect(categoryEditPage.isRootPage).toBeTruthy();
                expect(mockPlatform.backButton).toBeTruthy();
                expect(subscribeWithPriorityData).toHaveBeenCalled();
                expect(mockActivePageService.computePageId).toHaveBeenCalled();
                expect(mockCommonUtilService.showExitPopUp).toHaveBeenCalled();
                done()
            }, 0);
        });

        it('should subscribe back button for loggedIn User, platform ios', () => {
            // arrange
            jest.spyOn(categoryEditPage, 'setDefaultBMG').mockImplementation(() => {
                return Promise.resolve();
            });
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            mockHeaderService.getDefaultPageConfig = jest.fn(() => ({
                actionButtons: [''],
                showHeader: true,
                showBurgerMenu: true
            })) as any;
            mockFormAndFrameworkUtilService.invokedGetFrameworkCategoryList = jest.fn(() => Promise.resolve())
            mockHeaderService.updatePageConfig = jest.fn();
            categoryEditPage.isRootPage = true;
            const subscribeWithPriorityData = jest.fn((_, fn) => fn());
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData,
            } as any;
            mockPlatform.is = jest.fn(platform => platform == 'ios');
            mockActivePageService.computePageId = jest.fn(() => 'sample-page');
            mockHeaderService.showHeaderWithHomeButton = jest.fn();
            // act
            categoryEditPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(categoryEditPage.disableSubmitButton).toBeFalsy();
                expect(mockHeaderService.getDefaultPageConfig).toHaveBeenCalled();
                expect(mockHeaderService.updatePageConfig).toHaveBeenCalled();
                expect(categoryEditPage.isRootPage).toBeTruthy();
                expect(mockPlatform.backButton).toBeTruthy();
                expect(subscribeWithPriorityData).toHaveBeenCalled();
                // expect(mockActivePageService.computePageId).toHaveBeenCalled();
                expect(mockHeaderService.showHeaderWithHomeButton).toHaveBeenCalled();
            }, 0);
        });

        it('should invoked getSyllabusDetails for guest User', () => {
            // arrange
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn
            }));
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            mockHeaderService.getDefaultPageConfig = jest.fn(() => ({
                actionButtons: [''],
                showHeader: true,
                showBurgerMenu: true
            })) as any;
            mockFormAndFrameworkUtilService.invokedGetFrameworkCategoryList = jest.fn(() => Promise.reject())
            mockHeaderService.updatePageConfig = jest.fn();
            categoryEditPage.isRootPage = false;
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of([]));
            // act
            categoryEditPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(categoryEditPage.disableSubmitButton).toBeFalsy();
                expect(mockHeaderService.getDefaultPageConfig).toHaveBeenCalled();
                expect(mockHeaderService.updatePageConfig).toHaveBeenCalled();
                expect(categoryEditPage.isRootPage).toBeFalsy();
            }, 0);
        });
    });

    describe('ionViewDidEnter', () => {
        it('should hide progress loader', () => {
            mockProgressLoader.hide = jest.fn(() => Promise.resolve());
            categoryEditPage.ionViewDidEnter();
            expect(mockProgressLoader.hide).toHaveBeenCalled();
        });
    })

    describe('initializeForm', () => {
        it('should initialized edit form data if board length is greaterthan 1', () => {
            // arrange
            categoryEditPage.profile = {
                board: ['cbsc', 'ncrt']
            };
            // act
            categoryEditPage.initializeForm();
            // assert
            expect(categoryEditPage.profile).toBeTruthy();
        });
    });

    describe('onSubmit', () => {
        it('should open board select popup', () => {
            // arrange
            categoryEditPage.profileEditForm = {
                value: {
                    boards: []
                }
            } as any;
            categoryEditPage.isBoardAvailable = true;
            categoryEditPage.showOnlyMandatoryFields = true;
            const openFn = jest.fn(() => Promise.resolve());
            categoryEditPage.boardSelect = {
                open: openFn
            } as any;
            // act
            categoryEditPage.onSubmit();
            // assert
            expect(categoryEditPage.isBoardAvailable).toBeTruthy();
            expect(categoryEditPage.boardSelect).toBeTruthy();
        });

        it('should return error message if mandetoryMessage is false for board', () => {
            // arrange
            categoryEditPage.profileEditForm = {
                value: {
                    boards: []
                }
            } as any;
            categoryEditPage.isBoardAvailable = true;
            categoryEditPage.showOnlyMandatoryFields = false;
            mockCommonUtilService.showToast = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn(() => 'sample-error-message');
            // act
            categoryEditPage.onSubmit();
            // assert
            expect(categoryEditPage.isBoardAvailable).toBeTruthy();
            expect(categoryEditPage.showOnlyMandatoryFields).toBeFalsy();
        });

        it('should open board select popup', () => {
            // arrange
            categoryEditPage.profileEditForm = {
                value: {
                    boards: ['cbsc'],
                    medium: []
                }
            } as any;
            categoryEditPage.boardList = [{name: 'cbsc', code: ''}]
            categoryEditPage.supportedProfileAttributes = { medium: 'sample-medium' };
            categoryEditPage.showOnlyMandatoryFields = true;
            const openFn = jest.fn(() => Promise.resolve());
            categoryEditPage.mediumSelect = {
                open: openFn
            } as any;
            // act
            categoryEditPage.onSubmit();
            // assert
            expect(categoryEditPage.supportedProfileAttributes).toBeTruthy();
            expect(categoryEditPage.mediumSelect).toBeTruthy();
            expect(openFn).toHaveBeenCalled();
        });

        it('should return error message if mandetoryMessage is false for board', () => {
            // arrange
            categoryEditPage.profileEditForm = {
                value: {
                    boards: ['cbsc'],
                    medium: []
                }
            } as any;
            categoryEditPage.boardList = [{name: 'cbsc', code: ''}]
            categoryEditPage.supportedProfileAttributes = { medium: 'sample-medium' };
            categoryEditPage.showOnlyMandatoryFields = false;
            mockCommonUtilService.showToast = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn(() => 'sample-error-message');
            // act
            categoryEditPage.onSubmit();
            // assert
            expect(categoryEditPage.supportedProfileAttributes).toBeTruthy();
            expect(categoryEditPage.showOnlyMandatoryFields).toBeFalsy();
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('sample-error-message', false, 'redErrorToast');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'MEDIUM');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'PLEASE_SELECT', 'sample-error-message');
        });

        it('should open board select popup', () => {
            // arrange
            categoryEditPage.profileEditForm = {
                value: {
                    boards: ['cbsc'],
                    medium: ['english'],
                    grades: []
                }
            } as any;
            categoryEditPage.boardList = [{name: 'cbsc', code: ''}]
            categoryEditPage.supportedProfileAttributes = { gradeLevel: 'sample-gradeLevel' };
            categoryEditPage.showOnlyMandatoryFields = true;
            const openFn = jest.fn(() => Promise.resolve());
            categoryEditPage.gradeSelect = {
                open: openFn
            } as any;
            // act
            categoryEditPage.onSubmit();
            // assert
            expect(categoryEditPage.supportedProfileAttributes).toBeTruthy();
            expect(categoryEditPage.gradeSelect).toBeTruthy();
            expect(openFn).toHaveBeenCalled();
        });

        it('should return error message if mandetoryMessage is false for board', () => {
            // arrange
            categoryEditPage.profileEditForm = {
                value: {
                    boards: ['cbsc'],
                    medium: ['english'],
                    grades: []
                }
            } as any;
            categoryEditPage.boardList = [{name: 'cbsc', code: ''}]
            categoryEditPage.supportedProfileAttributes = { gradeLevel: 'sample-gradeLevel' };
            categoryEditPage.showOnlyMandatoryFields = false;
            mockCommonUtilService.showToast = jest.fn();
            mockCommonUtilService.translateMessage = jest.fn(() => 'sample-error-message');
            // act
            categoryEditPage.onSubmit();
            // assert
            expect(categoryEditPage.supportedProfileAttributes).toBeTruthy();
            expect(categoryEditPage.showOnlyMandatoryFields).toBeFalsy();
            expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('sample-error-message', false, 'redErrorToast');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'CLASS');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'PLEASE_SELECT', 'sample-error-message');
        });

        it('should invoked submitForm if all required fields is not missing', () => {
            // arrange
            categoryEditPage.profileEditForm = {
                value: {
                    boards: ['cbsc'],
                    medium: ['english'],
                    grades: ['class 1']
                }
            } as any;
            categoryEditPage.profile = {uid: '123'} as any
            categoryEditPage.editProfileForm = {
                controls: {
                  board: {
                    pristine: true,
                    touched: false,
                    defaultValue: null,
                    value: [],
                    status: 'VALID',
                    errors: null
                  },
                  medium: {
                    pristine: true,
                    touched: false,
                    defaultValue: null,
                    value: [],
                    status: 'VALID',
                    errors: null
                  },
                status: 'VALID',
                value: { boards: ['cbsc'],
                medium: ['english'], },
                errors: null
              },
              value: {},
              get: jest.fn()
            } as any
            categoryEditPage.boardList = [{name: 'cbsc', code: ''}]
            mockProfileService.updateServerProfile = jest.fn(() => of())
            // act
            categoryEditPage.onSubmit();
            // assert
            expect(categoryEditPage.profileEditForm).toBeTruthy();
        });
    });

    describe('enableSubmitButton', () => {
        it('should disable submit button', () => {
            // arrange
            categoryEditPage.profileEditForm = {
                value: {
                    boards: ['cbsc'],
                    medium: ['english'],
                    grades: []
                }
            } as any;
            // act
            categoryEditPage.enableSubmitButton();
            // assert
            expect(categoryEditPage.btnColor).toBe('#8FC4FF');
        });

        it('should enable submit button', () => {
            // arrange
            categoryEditPage.profileEditForm = {
                value: {
                    boards: ['cbsc'],
                    medium: ['english'],
                    grades: ['class 1']
                }
            } as any;
            // act
            categoryEditPage.enableSubmitButton();
            // assert
            expect(categoryEditPage.btnColor).toBe('#006DE5');
        });
    });

    describe('ionViewWillLeave', () => {
        it('should unsubscribe backButtonFunc', () => {
            // arrange
            categoryEditPage['backButtonFunc'] = {
                unsubscribe: jest.fn(),
    
            } as any;
            // act
            categoryEditPage.ionViewWillLeave();
            // assert
            expect( categoryEditPage['backButtonFunc'].unsubscribe).toHaveBeenCalled();
        });

        it('should handle else case backButtonFunc', () => {
            // arrange
            categoryEditPage['backButtonFunc'] = undefined as any;
            // act
            categoryEditPage.ionViewWillLeave();
            // assert
        });
    })

    describe('goBack()', () => {
        it('should initialized edit form data if board length is greaterthan 1', () => {
            // arrange
            mockLocation.back = jest.fn();
            // act
            categoryEditPage.goBack();
            // assert
            expect(mockLocation.back).toHaveBeenCalled();
        });
    });

    describe('submitForm', () => {
        it('should update the form value', () => {
            //arrange
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn
            }));
            categoryEditPage.editProfileForm = {
                controls: {
                    board: {
                        pristine: true,
                        touched: false,
                        defaultValue: null,
                        value: [],
                        status: 'VALID',
                        errors: null
                    },
                    medium: {
                        pristine: true,
                        touched: false,
                        defaultValue: null,
                        status: 'VALID',
                        errors: null
                    },
                    status: 'VALID',
                },
                value: {},
                get: jest.fn()
            } as any
            categoryEditPage.isBoardAvailable = false;
            const req: UpdateServerProfileInfoRequest = { userId: 'sample_uid', 
            framework: {value:  [
                { code: 'board', identifier: 'sample-id' },
                { code: 'medium', identifier: 'sample-id1' }
              ]} }
            mockProfileService.updateServerProfile = jest.fn(() => of({req} as any));
            //act
            categoryEditPage.submitForm({});
            //assert
            expect(mockProfileService.updateServerProfile).toBeTruthy;
        })

        it('should update the form value', () => {
            //arrange
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn
            }));
            categoryEditPage.editProfileForm = {
                controls: {
                  board: {
                    touched: false,
                    defaultValue: null,
                    value: [],
                    status: 'VALID'
                  },
                  medium: {
                    value: [],
                    status: 'VALID'
                  },
                    status: 'VALID',
                },
                value: { board: [], medium: [] },
            } as any
            categoryEditPage.isBoardAvailable = true;
            const req: UpdateServerProfileInfoRequest = { userId: 'sample_uid', 
            framework: {value:  [
                { code: 'board', identifier: 'sample-id' },
                { code: 'medium', identifier: 'sample-id1' }
              ]} }
            categoryEditPage.mediumList = [{name: 'english', code:'english'}]
            categoryEditPage.gradeList = [{name: 'class 1', code:'class 1'}]
            categoryEditPage.subjectList = [{name: 'english', code:'english'}]
            const formVal =  { syllabus: [ 'cbsc' ], medium: [ 'english' ], grades: [ 'class 1' ], subjects:['english'] };
            mockProfileService.updateServerProfile = jest.fn(() => of({req} as any));
            //act
            categoryEditPage.submitForm(formVal);
            //assert
            expect(mockProfileService.updateServerProfile).toBeTruthy;
        })

        it('should update the form value with grades', () => {
            //arrange
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn
            }));
            categoryEditPage.editProfileForm = {
                controls: {
                    board: {
                        value: [],
                    },
                    medium: {
                        value: [],
                        status: 'VALID'
                    },
                    status: 'VALID',
                    errors: null
                },
                value: { board: [], medium: [] },
            } as any
            categoryEditPage.isBoardAvailable = true;
            const req: UpdateServerProfileInfoRequest = { userId: 'sample_uid', 
            framework: {value:  [
                { code: 'board', identifier: 'sample-id' },
                { code: 'medium', identifier: 'sample-id1' }
              ]} }
            const formVal =  { grades: [ 'class 1' ], subjects:['english'] };
            mockProfileService.updateServerProfile = jest.fn(() => of({req} as any));
            //act
            categoryEditPage.submitForm(formVal);
            //assert
            expect(mockProfileService.updateServerProfile).toBeTruthy;
        })

        it('should update the form value', () => {
            //arrange
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn
            }));
            categoryEditPage.editProfileForm = {
                controls: {
                  board: {
                    value: [],
                    status: 'VALID'
                  },
                  medium: {
                    value: [],
                    status: 'VALID'
                  },
                  status: 'VALID',
                  errors: null
                },
                value: { board: [], medium: [] },
            } as any

            categoryEditPage.isBoardAvailable = true;
            categoryEditPage.boardList = [{name: 'cbsc', code: ''}]
            categoryEditPage.mediumList = [{name: 'english', code: 'en'}]
            const req: UpdateServerProfileInfoRequest = { userId: 'sample_uid', 
            framework: {value: {id: '', board: "board", medium: "english", gradeLevel: "class 1", subject: "english"} }}
            const formVal =  { syllabus: 'cbsc', boards:'board', medium: 'english', grades: 'class 1', subjects: 'english' };
            mockProfileService.updateServerProfile = jest.fn(() => of({req} as any));
            //act
            categoryEditPage.submitForm(formVal);
            //assert
            expect(mockProfileService.updateServerProfile).toBeTruthy;
        })
    })

    describe('refreshSegmentTags', () => {
        it('should get Server ProfilesDetails', () => {
            //arrange
            const reqObj = {
                userId: 'uid',
                requiredFields: ProfileConstants.REQUIRED_FIELDS,
                from: CachedItemRequestSourceFrom.SERVER
            };
            mockProfileService.getServerProfilesDetails = jest.fn(() => of({
                userId: 'user_id',
                framework:[{}],
                userLocations:[{name:'name', code:'code'}],
                profileUserType:{type: ''},
                requiredFields: [
                    'completeness',
                    'missingFields',
                    'lastLoginTime',
                    'topics',
                    'organisations',
                    'roles',
                    'locations',
                    'declarations',
                    'externalIds'
                ],
                from: 'server'
                }));       

            //act
            categoryEditPage.refreshSegmentTags();
            //assert
            expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalled();
        })

        it('should get Server ProfilesDetails', () => {
            //arrange
            const reqObj = {
                userId: 'uid',
                requiredFields: ProfileConstants.REQUIRED_FIELDS,
                from: CachedItemRequestSourceFrom.SERVER
                };
            mockProfileService.getServerProfilesDetails = jest.fn(() => of({
                userId: 'user_id',
                framework:{id1: ['id-213']},
                requiredFields: [
                    'completeness',
                    'missingFields',
                    'lastLoginTime',
                    'topics',
                    'organisations',
                    'roles',
                    'locations',
                    'declarations',
                    'externalIds'
                ],
                from: 'server'
                }));       
            //act
            categoryEditPage.refreshSegmentTags();
            //assert
            expect(mockProfileService.getServerProfilesDetails).toHaveBeenCalled();
        })
    });
        
    describe('ngOnDestroy', () => {
        it('should unsubscribe', () => {
            // arrange
            // act
            categoryEditPage.ngOnDestroy();
            // assert
        })
    })

    describe("initializeNewForm", () => {
        it('should initializeNewForm', () => {
            // arrange
            categoryEditPage.categories = [{code: 'board', identifier: 'sample-id'}, {code: 'medium', identifier: 'sample-id1'}]
            categoryEditPage.editProfileForm = {
                get: jest.fn(),
                value: {
                    id: ''
                }
            } as any
            // act
            categoryEditPage.initializeNewForm();
            // assert

        })
    });

    describe('onCategoryChanged', () => {
        it('should handle onCategoryChanged', () => {
            // arrange
            categoryEditPage.categories = [{ code: 'board', identifier: 'sample-id' },
            { code: 'medium', identifier: 'sample-id1', isDisable: true }]
            categoryEditPage.editProfileForm = {
                controls: {
                    board: {
                      value: [],
                    },
                    medium: {
                      value: [],
                    },
                    syllabus: {
                        value: ['cbse'],
                    },
                },
                value: { boards: ['cbsc'], medium: ['english'], syllabus: ['cbse'] },
                get: jest.fn(() => ({
                    value: []
                }))
            } as any
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(() => Promise.resolve()),
                dismiss: jest.fn(() => Promise.resolve())
            }))
            mockAppGlobalService.setFramewokCategory = jest.fn()
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of({identifier: '12'})) as any
            mockFrameworkUtilService.getFrameworkCategoryTerms = jest.fn(() => of([{name: 'name', code: 'syllabus'}])) as any
            // act
            categoryEditPage.onCategoryChanged({code: 'syllabus'}, ['sample-name'], 0)
            // assert
        })

        it('should handle onCategoryChanged, reset form category ', () => {
            // arrange
            categoryEditPage.categories = [{ code: 'board', identifier: 'sample-id' },
            { code: 'medium', identifier: 'sample-id1', isDisable: true }] as any
            categoryEditPage.editProfileForm = {
                controls: {
                    board: {
                      value: [],
                    },
                    medium: {
                      value: [],
                    },
                    syllabus: {
                        value: ['cbse'],
                    },
                },
                value: { boards: ['cbsc'], medium: ['english'], syllabus: ['cbse'] },
                get: jest.fn(() => ({
                    value: [''],
                    patchValue: jest.fn()
                }))
            } as any
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(() => Promise.resolve()),
                dismiss: jest.fn(() => Promise.resolve())
            }))
            mockAppGlobalService.setFramewokCategory = jest.fn()
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of({identifier: '12'})) as any
            mockFrameworkUtilService.getFrameworkCategoryTerms = jest.fn(() => of([{name: 'name', code: 'syllabus'}])) as any
            // act
            categoryEditPage.onCategoryChanged({code: 'syllabus'}, ['sample-name'], 0)
            // assert
        })
    });

    describe('resetCategoriesTerms', () => {
        it('should reset CategoriesTerms', () => {
            // arrange
            categoryEditPage.categories = [{code: 'board', identifier: 'sample-id'}, {code: 'medium', identifier: 'sample-id1'}, {code: 'gradeLevel', identifier: 'sample-id'}] as any
            // act
            categoryEditPage.resetCategoriesTerms()
            // assert
        })
    });

    describe('isMultipleVales', () => {
        it('should check category for isMultipleVales for index 0', () => {
            // arange
            // act
            categoryEditPage.isMultipleVales({index: 0})
            // assert
        })
        it('should check category for isMultipleVales for index not equal 0', () => {
            // arange
            // act
            categoryEditPage.isMultipleVales({index: 3})
            // assert
        })
    })
});
