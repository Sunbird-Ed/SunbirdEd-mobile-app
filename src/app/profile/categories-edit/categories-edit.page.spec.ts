import { CategoriesEditPage } from './categories-edit.page';
import {
    FrameworkService,
    FrameworkUtilService,
    ProfileService
} from 'sunbird-sdk';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';
import { Events } from '@app/util/events';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import {
    AppGlobalService,
    CommonUtilService,
    ContainerService,
    AppHeaderService,
    ActivePageService,
    FormAndFrameworkUtilService
} from '../../../services';
import { Location } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { ProfileHandler } from '@app/services/profile-handler';
import { SbProgressLoader } from '../../../services/sb-progress-loader.service';
import { ExternalIdVerificationService } from '@app/services/externalid-verification.service';
import { TncUpdateHandlerService } from '@app/services/handlers/tnc-update-handler.service';
import { of, throwError } from 'rxjs';
import { Framework, FrameworkCategoryCodesGroup, GetSuggestedFrameworksRequest, SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { PreferenceKey, RouterLinks } from '../../app.constant';
import { SegmentationTagService } from '../../../services/segmentation-tag/segmentation-tag.service';
import { CategoriesEditService } from './categories-edit.service';

describe('CategoryEditPage', () => {
    let categoryEditPage: CategoriesEditPage;
    const mockAppGlobalService: Partial<AppGlobalService> = {
        generateSaveClickedTelemetry: jest.fn(),
        closeSigninOnboardingLoader: jest.fn(),
        getCurrentUser: jest.fn(() => ({ board: ['AP'] }))
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn(() => 'select-box'),
        showToast: jest.fn()
    };
    const mockContainer: Partial<ContainerService> = {};
    const mockEvents: Partial<Events> = {};
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {};
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
        getCurrentNavigation: jest.fn(() => mockRoterExtras as any),
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
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
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

    global.window.segmentation = {
        init: jest.fn(),
        SBTagService: {
            pushTag: jest.fn(),
            removeAllTags: jest.fn(),
            restoreTags: jest.fn()
        }
    };
    const mockCategoriesEditService: Partial<CategoriesEditService> = {};


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
            mockCategoriesEditService as CategoriesEditService
        );
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
        it('should populate the supported attributes', (done) => {
            // arrange
            mockProfileHandler.getSupportedProfileAttributes = jest.fn(() => Promise.resolve(
                {
                    board: 'board',
                    medium: 'medium',
                    gradeLevel: 'gradeLevel'
                }));
            categoryEditPage['onSyllabusChange'] = jest.fn(() => of({} as any));
            categoryEditPage['onMediumChange'] = jest.fn(() => of({} as any));
            categoryEditPage['onGradeChange'] = jest.fn(() => of({} as any));
            mockSharedPreferences.getString = jest.fn(() => of('userType'));
            // act
            categoryEditPage.ngOnInit().then(() => {
                // assert
                expect(mockSharedPreferences.getString).toHaveBeenCalledWith(PreferenceKey.SELECTED_USER_TYPE);
                expect(categoryEditPage.supportedProfileAttributes).toEqual({
                    board: 'board',
                    medium: 'medium',
                    gradeLevel: 'gradeLevel'
                });
                done();
            });
        });
    });

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

    describe('getSyllabusDetails', () => {
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
    });

    describe('getLoggedInFrameworkCategory', () => {
        it('should return error message for board', (done) => {
            // arrange
            mockFrameworkService.getChannelDetails = jest.fn(() => of({
                identifier: 'sample-id',
                code: 'sample-code'
            }));
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of({
                name: 'sample-name',
                identifier: 'sample-id',
                categories: [{code: 'board', identifier: 'sample-id'}, {code: 'medium', identifier: 'sample-id1'}]
            }));
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
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('NEED_INTERNET_TO_CHANGE');
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('Turn on WiFi or mobile data and try again');
                done();
            }, 0);
        });

        it('should return error message for medium', (done) => {
            // arrange
            mockFrameworkService.getChannelDetails = jest.fn(() => of({
                identifier: 'sample-id',
                code: 'sample-code'
            }));
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of({
                name: 'sample-name',
                identifier: 'sample-id',
                categories: [{code: 'medium', identifier: 'sample-id1'}]
            }));
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of([{
                name: 'sample-name',
                identifier: 'sample-id'
            }]));
            mockCommonUtilService.networkInfo = {
                isNetworkAvailable: true
            };
            // act
            categoryEditPage.getLoggedInFrameworkCategory();
            // assert
            setTimeout(() => {
                expect(mockFrameworkService.getChannelDetails).toHaveBeenCalled();
                expect(mockFrameworkService.getFrameworkDetails).toHaveBeenCalled();
                expect(mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList).toHaveBeenCalled();
                expect(mockCommonUtilService.networkInfo.isNetworkAvailable).toBeTruthy();
                done();
            }, 0);
        });
    });
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
            const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
                from: 'server',
                language: undefined,
                requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
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

    describe('ionViewWillEnter', () => {
        it('should subscribe back button for loggedIn User', () => {
            // arrange
            categoryEditPage.initializeLoader = jest.fn(() => Promise.resolve());
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            categoryEditPage.getLoggedInFrameworkCategory = jest.fn(() => Promise.resolve());
            mockHeaderService.getDefaultPageConfig = jest.fn(() => ({
                actionButtons: [''],
                showHeader: true,
                showBurgerMenu: true
            })) as any;
            jest.spyOn(categoryEditPage, 'setDefaultBMG').mockImplementation(() => {
                return Promise.resolve();
            });
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
            expect(categoryEditPage.initializeLoader).toHaveBeenCalled();
            expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
            expect(categoryEditPage.getLoggedInFrameworkCategory).toHaveBeenCalled();
            expect(categoryEditPage.disableSubmitButton).toBeFalsy();
            expect(mockHeaderService.getDefaultPageConfig).toHaveBeenCalled();
            expect(mockHeaderService.updatePageConfig).toHaveBeenCalled();
            expect(categoryEditPage.isRootPage).toBeTruthy();
            expect(mockPlatform.backButton).toBeTruthy();
            expect(subscribeWithPriorityData).toHaveBeenCalled();
            expect(mockActivePageService.computePageId).toHaveBeenCalled();
            expect(mockCommonUtilService.showExitPopUp).toHaveBeenCalled();
        });

        it('should invoked getSyllabusDetails for guest User', () => {
            // arrange
            const presentFn = jest.fn(() => Promise.resolve());
            const dismissFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn
            }));
            categoryEditPage.initializeLoader = jest.fn(() => Promise.resolve());
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            mockHeaderService.getDefaultPageConfig = jest.fn(() => ({
                actionButtons: [''],
                showHeader: true,
                showBurgerMenu: true
            })) as any;
            mockHeaderService.updatePageConfig = jest.fn();
            categoryEditPage.isRootPage = false;
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of([]));
            // act
            categoryEditPage.ionViewWillEnter();
            // assert
            expect(categoryEditPage.initializeLoader).toHaveBeenCalled();
            expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
            expect(categoryEditPage.disableSubmitButton).toBeFalsy();
            expect(mockHeaderService.getDefaultPageConfig).toHaveBeenCalled();
            expect(mockHeaderService.updatePageConfig).toHaveBeenCalled();
            expect(categoryEditPage.isRootPage).toBeFalsy();
        });
    });

    it('should hide progress loader', () => {
        mockProgressLoader.hide = jest.fn(() => Promise.resolve());
        categoryEditPage.ionViewDidEnter();
        expect(mockProgressLoader.hide).toHaveBeenCalled();
    });

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
            jest.spyOn(categoryEditPage, 'submitForm').mockImplementation(() => {
                return Promise.resolve();
            });
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
});
