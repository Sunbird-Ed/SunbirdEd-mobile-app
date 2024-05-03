import { ProfileSettingsPage } from './profile-settings.page';
import {
    FrameworkService,
    FrameworkUtilService,
    ProfileService,
    Framework,
    FrameworkCategoryCodesGroup,
    GetSuggestedFrameworksRequest,
    SharedPreferences
} from '@project-sunbird/sunbird-sdk';
import { TranslateService } from '@ngx-translate/core';
import { Platform, AlertController } from '@ionic/angular';
import { Events } from '../../util/events';
import { Router, ActivatedRoute } from '@angular/router';
import {
    AppGlobalService,
    TelemetryGeneratorService,
    CommonUtilService,
    SunbirdQRScanner,
    ContainerService,
    AppHeaderService,
    FormAndFrameworkUtilService,
    OnboardingConfigurationService,
} from '../../services';
import { SplashScreenService } from '../../services/splash-screen.service';
import { Location } from '@angular/common';
import { PageId, Environment, InteractSubtype, InteractType } from '../../services/telemetry-constants';
import { of, Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { SegmentationTagService } from '../../services/segmentation-tag/segmentation-tag.service';
import { mockOnboardingConfigData } from '../components/discover/discover.page.spec.data';
import { App } from '@capacitor/app';

jest.mock('@capacitor/app', () => {
    return {
      ...jest.requireActual('@capacitor/app'),
        App: {
            getInfo: jest.fn(() => Promise.resolve({id: 'org.sunbird.app', name: 'Sunbird', build: '', version: 9}))
        }
    }
})

describe('ProfileSettingsPage', () => {
    let profileSettingsPage: ProfileSettingsPage;
    const mockAlertCtrl: Partial<AlertController> = {
        getTop: jest.fn()
    };
    const mockAppGlobalService: Partial<AppGlobalService> = {
        generateSaveClickedTelemetry: jest.fn()
    };
    const dismissFn = jest.fn(() => Promise.resolve());
    const presentFn = jest.fn(() => Promise.resolve());
    const mockCommonUtilService: Partial<CommonUtilService> = {
        getLoader: jest.fn(() => Promise.resolve({
            present: presentFn,
            dismiss: dismissFn,
        })),
        translateMessage: jest.fn(() => 'select-box'),
        isAccessibleForNonStudentRole: jest.fn(),
        isDeviceLocationAvailable: jest.fn(),
        handleToTopicBasedNotification: jest.fn()
    };
    const mockContainer: Partial<ContainerService> = {};
    const mockEvents: Partial<Events> = {
        publish: jest.fn()
    };
    const mockFrameworkService: Partial<FrameworkService> = {
        getFrameworkDetails: jest.fn(() => of({ name: "name", identifier: "123"}))
    } as any;
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockLocation: Partial<Location> = {
        back: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {};
    const mockProfileService: Partial<ProfileService> = {
        updateProfile: jest.fn(),
        getActiveSessionProfile: jest.fn()
    };
    const mockRouter: Partial<Router> = {};
    const mockScanner: Partial<SunbirdQRScanner> = {};
    const mockSplashScreenService: Partial<SplashScreenService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn(),
        generateBackClickedTelemetry: jest.fn(),
        generateBackClickedNewTelemetry: jest.fn(),
        generatePageLoadedTelemetry: jest.fn(),
        generateAuditTelemetry: jest.fn(),
        generateProfilePopulatedTelemetry: jest.fn()
    };
    const mockTranslate: Partial<TranslateService> = {};
    const mockActivatedRoute: Partial<ActivatedRoute> = {};
    mockActivatedRoute.snapshot = {
        queryParams: {
            reOnBoard: {}
        }
    } as any;

    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        invokedGetFrameworkCategoryList: jest.fn(() => Promise.resolve([]))
    };
    const mockSegmentationTagService: Partial<SegmentationTagService> = {}
    const mockOnboardingConfigurationService: Partial<OnboardingConfigurationService> = {
        initialOnboardingScreenName: '',
        getAppConfig: jest.fn(() => mockOnboardingConfigData),
        getOnboardingConfig: jest.fn()
    }

    const mockPreference: Partial<SharedPreferences> = {
        getString: jest.fn()
    }
    window.console = {
        error: jest.fn(),
        log: jest.fn()
    } as any

    beforeAll(() => {
        window.history.replaceState({defaultFrameworkID: "",rootOrgID: "*", hideBackButton: true}, 'MOCK');
        profileSettingsPage = new ProfileSettingsPage(
            mockProfileService as ProfileService,
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockPreference as SharedPreferences,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockTranslate as TranslateService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppGlobalService as AppGlobalService,
            mockEvents as Events,
            mockScanner as SunbirdQRScanner,
            mockPlatform as Platform,
            mockCommonUtilService as CommonUtilService,
            mockContainer as ContainerService,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockAlertCtrl as AlertController,
            mockLocation as Location,
            mockSplashScreenService as SplashScreenService,
            mockActivatedRoute as ActivatedRoute,
            mockSegmentationTagService as SegmentationTagService,
            mockOnboardingConfigurationService as OnboardingConfigurationService
        );
    });

    beforeEach(() => {
        window.history.replaceState({defaultFrameworkID: "",rootOrgID: "*"}, 'MOCK');
        jest.clearAllMocks();
    });

    it('should be create a instance of profileSettingsPage', () => {
        window.history = {
            state: {
                defaultFrameworkID: "",
                rootOrgID: "*"
            }
        } as any
        expect(profileSettingsPage).toBeTruthy();
    });

    describe('handleActiveScanner', () => {
        it('should stop active scanner', (done) => {
            window.history = {
                state: {
                    defaultFrameworkID: "",
                    rootOrgID: "*"
                }
            } as any
            mockRouter.getCurrentNavigation = jest.fn(() => ({
                extras: {
                    state: {
                        id: 'sample-id',
                        stopScanner: true
                    }
                }
            })) as any;
            mockScanner.stopScanner = jest.fn();
            // act
            profileSettingsPage.handleActiveScanner();
            // assert
            setTimeout(() => {
                expect(mockScanner.stopScanner).toHaveBeenCalled();
                done();
            }, 600);
        });

        it('should not stop active scanner for else part', (done) => {
            mockRouter.getCurrentNavigation = jest.fn(() => ({
                extras: {
                    state: {
                        id: 'sample-id',
                        stopScanner: false
                    }
                }
            })) as any;
            // act
            profileSettingsPage.handleActiveScanner();
            // assert
            setTimeout(() => {
                done();
            }, 0);
        });
    });

    it('should fetch active profile by invoked ngOnInit()', (done) => {
        // arrange
        mockFormAndFrameworkUtilService.getFrameworkCategoryList = jest.fn(() => Promise.resolve());
        mockOnboardingConfigurationService.getOnboardingConfig = jest.fn(() => mockOnboardingConfigData.onboarding[0] as any)
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        jest.spyOn(profileSettingsPage, 'handleActiveScanner').mockImplementation(() => {
            return;
        });
        mockFrameworkService.getDefaultChannelDetails = jest.fn(() => of({defaultFramework: ''}))as any
        mockFormAndFrameworkUtilService.invokedGetFrameworkCategoryList = jest.fn(() => Promise.resolve([]))
        App.getInfo = jest.fn(() => Promise.resolve({id: 'org.sunbird.app', name: 'Sunbird', build: '', version: 9})) as any;
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({profileType: ''})) as any;
        jest.spyOn(profileSettingsPage, 'fetchSyllabusList').mockImplementation(() => {
            return Promise.resolve();
        });
        mockPreference.getString = jest.fn(() => of(''))
        // act
        profileSettingsPage.ngOnInit().then(() => {
            // assert
            setTimeout(() => {
                expect(App.getInfo).toHaveBeenCalled()
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    it('should populate the supported userTypes', (done) => {
        // arrange
        mockPreference.getString = jest.fn(() => of(''))
        mockOnboardingConfigurationService.getOnboardingConfig = jest.fn(() => mockOnboardingConfigData.onboarding[0] as any)
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        mockFormAndFrameworkUtilService.getFrameworkCategoryList = jest.fn(() => Promise.resolve({
            supportedFrameworkConfig: [
                {
                  "code": "category1",
                  "label": "{\"en\":\"Board\"}",
                  "placeHolder": "{\"en\":\"Selected Board\"}",
                  "frameworkCode": "board",
                  "supportedUserTypes": [
                      "teacher",
                      "student",
                      "administrator",
                      "parent",
                      "other"
                  ]
              },
              {
                  "code": "category2",
                  "label": "{\"en\":\"Medium\"}",
                  "placeHolder": "{\"en\":\"Selected Medium\"}",
                  "frameworkCode": "medium",
                  "supportedUserTypes": [
                      "teacher",
                      "student",
                      "parent",
                      "other"
                  ]
              }
              ],
              supportedAttributes: {board: 'board'},
              userType: 'teacher'
        }));
        jest.spyOn(profileSettingsPage, 'handleActiveScanner').mockImplementation(() => {
            return;
        });
        window['Capacitor'].Plugins.App.getInfo = jest.fn();
        mockFrameworkService.getDefaultChannelDetails = jest.fn(() => of({defaultFramework: ''}))as any
        mockFormAndFrameworkUtilService.invokedGetFrameworkCategoryList = jest.fn(() => Promise.resolve([]))
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({profileType: ''})) as any;
        jest.spyOn(profileSettingsPage, 'fetchSyllabusList').mockImplementation(() => {
            return Promise.resolve();
        });
        profileSettingsPage.profileSettingsForm['valueChanges'] = of({} as any);
        // act
        profileSettingsPage.ngOnInit().then(() => {
            // assert
            setTimeout(() => {
                expect(window['Capacitor'].Plugins.App.getInfo).toHaveBeenCalled()
                expect(mockFormAndFrameworkUtilService.getFrameworkCategoryList).toHaveBeenCalled();
                expect(profileSettingsPage.supportedProfileAttributes).toEqual(
                    { board: 'board'});
                done();
            }, 500);
        });
    });

    it('should subscribe formControl to call ngOnDestroy()', () => {
        // arrange
        const formControlSubscriptions: Partial<Subscription> = { unsubscribe: jest.fn() };
        // act
        profileSettingsPage.ngOnDestroy();
        // assert
        expect(formControlSubscriptions).not.toBeUndefined();
    });

    describe('onSubmitAttempt()', () => {
        it('should generate submit clicked telemetry  if board is empty onSubmitAttempt()', (done) => {
            // arrange
            const values = new Map();
            values['board'] = 'na';
            profileSettingsPage.profileSettingsForms = {
                get: jest.fn((arg) => {
                    let value;
                    switch (arg) {
                        case 'syllabus':
                            value = { value: { board: [] } };
                            break;
                        case 'board':
                            value = { value: { board: [] } };
                            break;
                        case 'medium':
                            value = { value: { medium: [] } };
                            break;
                        case 'grade':
                            value = [];
                            break;
                    }
                    return value;
                }),
                controls: {
                    syllabus: {
                        validator: jest.fn()
                    },
                    board: {
                        validator: jest.fn()
                    },
                    medium: {
                        validator: jest.fn()
                    },
                    grade: {
                        validator: jest.fn()
                    }
                },
                value: {
                    syllabus: [], board: [], medium: [], grade: []
                },
                valueChanges: {},
                valid: true,
                reset: jest.fn()
            } as any;
            profileSettingsPage.boardSelect = { open: jest.fn() };
            mockAppGlobalService.generateSaveClickedTelemetry = jest.fn();
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({profileType: ""})) as any
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of({ name: "name", identifier: "123"}))
            // act
            profileSettingsPage.onSubmitAttempt();
            // assert
            expect(mockAppGlobalService.generateSaveClickedTelemetry).toHaveBeenCalledWith(
                expect.anything(),
                'failed',
                PageId.ONBOARDING_PROFILE_PREFERENCES,
                InteractSubtype.FINISH_CLICKED
            );
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                'submit-clicked',
                Environment.HOME,
                PageId.ONBOARDING_PROFILE_PREFERENCES,
                undefined,
                values
            );
            done();
        });

        it('should generate submit clicked telemetry  if medium is empty onSubmitAttempt()', (done) => {
            // arrange
            const values = new Map();
            values['board'] = 'na';
            profileSettingsPage.profileSettingsForms = {
                get: jest.fn((arg) => {
                    let value;
                    switch (arg) {
                        case 'syllabus':
                            value = { value: { board: ['AP'] } };
                            break;
                        case 'board':
                            value = { value: { board: ['AP'] } };
                            break;
                        case 'medium':
                            value = { value: { medium: [] } };
                            break;
                        case 'grade':
                            value = [];
                            break;
                    }
                    return value;
                }),
                controls: {
                    syllabus: {
                        validator: jest.fn()
                    },
                    board: {
                        validator: jest.fn()
                    },
                    medium: {
                        validator: jest.fn()
                    },
                    grade: {
                        validator: jest.fn()
                    }
                },
                value: {
                    syllabus: [], board: ['AP'], medium: [], grade: []
                },
                valueChanges: {},
                valid: true,
                reset: jest.fn()
            } as any;
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of({ name: "name", identifier: "123"}))
            profileSettingsPage.boardSelect = { open: jest.fn() };
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({profileType: ""}))as any
            // act
            profileSettingsPage.onSubmitAttempt();
            // assert
            expect(mockAppGlobalService.generateSaveClickedTelemetry).toHaveBeenCalledWith(
                expect.anything(),
                'failed',
                PageId.ONBOARDING_PROFILE_PREFERENCES,
                InteractSubtype.FINISH_CLICKED
            );
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                'submit-clicked',
                Environment.HOME,
                PageId.ONBOARDING_PROFILE_PREFERENCES,
                undefined,
                values
            );
            done()
        });

        it('should generate submit clicked telemetry  if grades is empty onSubmitAttempt()', (done) => {
            // arrange
            const values = new Map();
            values['board'] = 'na';
            profileSettingsPage.profileSettingsForms = {
                get: jest.fn((arg) => {
                    let value;
                    switch (arg) {
                        case 'syllabus':
                            value = { value: { board: ['AP'] } };
                            break;
                        case 'board':
                            value = { value: { board: ['AP'] } };
                            break;
                        case 'medium':
                            value = { value: { medium: ['English'] } };
                            break;
                        case 'grade':
                            value = { value: { medium: [] } };
                            break;
                    }
                    return value;
                }),
                controls: {
                    syllabus: {
                        validator: jest.fn()
                    },
                    board: {
                        validator: jest.fn()
                    },
                    medium: {
                        validator: jest.fn()
                    },
                    grade: {
                        validator: jest.fn()
                    }
                },
                value: {
                    syllabus: [], board: ['AP'], medium: ['English'], grade: []
                },
                valueChanges: {},
                valid: true,
                reset: jest.fn()
            } as any;
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of({ name: "name", identifier: "123"}))
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({profileType: ""}))as any
            profileSettingsPage.boardSelect = { open: jest.fn() };
            // act
            profileSettingsPage.onSubmitAttempt();
            // assert
            expect(mockAppGlobalService.generateSaveClickedTelemetry).toHaveBeenCalledWith(
                expect.anything(),
                'failed',
                PageId.ONBOARDING_PROFILE_PREFERENCES,
                InteractSubtype.FINISH_CLICKED
            );
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                'submit-clicked',
                Environment.HOME,
                PageId.ONBOARDING_PROFILE_PREFERENCES,
                undefined,
                values
            );
            done();
        });

        it('should generate submit clicked telemetry  if grades is empty onSubmitAttempt()', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn,
            }));
            jest.spyOn(mockProfileService, 'updateProfile').mockReturnValue(of({}));
            mockCommonUtilService.showToast = jest.fn();
            const values = new Map();
            values['board'] = 'na';
            profileSettingsPage.profileSettingsForms = {
                valid: true,
                get: jest.fn((arg) => {
                    let value;
                    switch (arg) {
                        case 'syllabus':
                            value = { board: ['AP', 'NCRT'] };
                            break;
                        case 'board':
                            value = { value: { board: ['AP'] } };
                            break;
                        case 'medium':
                            value = { medium: ['English'] };
                            break;
                        case 'grade':
                            value = { grade: ['class1'] };
                            break;
                    }
                    return value;
                }),
                controls: {
                    syllabus: {
                        validator: jest.fn()
                    },
                    board: {
                        validator: jest.fn()
                    },
                    medium: {
                        validator: jest.fn()
                    },
                    grade: {
                        validator: jest.fn()
                    }
                },
                value: {
                    syllabus: [], board: ['AP'], medium: ['English'], grade: []
                },
                reset: jest.fn()
            } as any;
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of({ name: "name", identifier: "123"}))
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({profileType: ""}))as any
            profileSettingsPage.boardSelect = { open: jest.fn() };
            // act
            profileSettingsPage.onSubmitAttempt();
            // assert
            setTimeout(() => {
                done();
            }, 0);
        });
    });

    it('should handle all header events by invoked ionViewWillEnter()', (done) => {
        // arrange
        const data = jest.fn((fn => fn({name: 'back'})));
        mockHeaderService.headerEventEmitted$ = {
            subscribe: data
        } as any;
        mockHeaderService.hideHeader = jest.fn();
        mockHeaderService.showHeaderWithBackButton = jest.fn();
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,

        } as any;
        window.setTimeout = jest.fn((fn) => fn({
            
        }), 100) as any;
        mockActivatedRoute['snapshot'] = {
            queryParams: { reOnboard: true }
        };
        profileSettingsPage.hideBackButton = true;
        // act
        profileSettingsPage.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(mockHeaderService.hideHeader).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should not reload the onboarding screens id reOnboard is null ionViewWillEnter()', (done) => {
        // arrange
        const data = jest.fn((fn => fn({name: 'back'})));
        mockHeaderService.headerEventEmitted$ = {
            subscribe: data
        } as any;
        mockHeaderService.hideHeader = jest.fn();
        mockHeaderService.showHeaderWithBackButton = jest.fn();
        mockActivatedRoute.snapshot.queryParams = null;
        profileSettingsPage.hideBackButton = false;
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,

        } as any;
        window.history.state['showFrameworkCategoriesMenu'] = true;
        window.history.state['defaultFrameworkID'] = "";
        window.history.state['rootOrgID'] = "*";
        // act
        profileSettingsPage.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(mockHeaderService.hideHeader).toHaveBeenCalled();
            done();
        }, 0);

    });

    it('should handle hideHeader events by invoked ionViewWillEnter()', (done) => {
        // arrange
        const data = jest.fn((fn => fn({name: 'back'})));
        mockHeaderService.headerEventEmitted$ = {
            subscribe: data
        } as any;
        mockRouter.getCurrentNavigation = jest.fn(() => ({
            extras: {
                state: {
                    hideBackButton: true
                }
            }
        } as any));
        mockHeaderService.showHeaderWithBackButton = jest.fn();
        mockHeaderService.hideHeader = jest.fn();
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,

        } as any;
        window.history.state['showFrameworkCategoriesMenu'] = true;
        window.history.state['defaultFrameworkID'] = "";
        window.history.state['rootOrgID'] = "*";
        profileSettingsPage['navParams'] = null;
        // act
        profileSettingsPage.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(data).toHaveBeenCalled();
            expect(mockHeaderService.hideHeader).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should handle all header events by invoked ionViewDidEnter()', (done) => {
        // arrange
        mockRouter.getCurrentNavigation = jest.fn(() => ({extras: {state: {stopScanner: true, hideBackButton: true, forwardMigration: true}}})) as any
        mockLocation.back = jest.fn()
        // act
        profileSettingsPage.ionViewDidEnter();
        // assert
        setTimeout(() => {
            expect(profileSettingsPage.hideOnboardingSplashScreen).toHaveBeenCalled();
            done();
        }, 0);
    });

    xit('should submit form details for board blanked to call onSubmitAttempt()', (done) => {
        // arrange
        const syllabusData = new FormControl([], (c) => c.value.length ? undefined : { length: 'NOT_SELECTED' });
        mockAppGlobalService.generateSaveClickedTelemetry = jest.fn();
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        const values = new Map();
        values['medium'] = 'na';
        profileSettingsPage.boardSelect = { open: jest.fn() };
        profileSettingsPage.mediumSelect = ['hindi'];
        profileSettingsPage.gradeSelect = ['class1'];
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({profileType: ""})) as any
        mockFrameworkService.getFrameworkDetails = jest.fn(() => of({ name: "name", identifier: "123"}))
        // act
        profileSettingsPage.onSubmitAttempt();
        // assert
        expect(mockAppGlobalService.generateSaveClickedTelemetry).toHaveBeenCalledWith(
            expect.anything(),
            'passed',
            PageId.ONBOARDING_PROFILE_PREFERENCES,
            InteractSubtype.FINISH_CLICKED
        );
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.SELECT_SUBMIT, '',
            Environment.ONBOARDING,
            PageId.MANUAL_PROFILE,
            undefined, undefined, undefined,
            []
        );
        done()
    });

    xit('should submit form details for medium blank to call onSubmitAttempt()', () => {
        // arrange
        mockAppGlobalService.generateSaveClickedTelemetry = jest.fn();
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        const values = new Map();
        values['board'] = 'na';
        profileSettingsPage.profileSettingsForms = {
            controls: {
                syllabus: {
                    validator: jest.fn()
                }
            },
            value: {
                syllabus: [], board: ['odisha'], medium: [], grade: []
            },
            reset: jest.fn()
        } as any;
        profileSettingsPage = new ProfileSettingsPage(
            mockProfileService as ProfileService,
            mockFrameworkService as FrameworkService,
            mockFrameworkUtilService as FrameworkUtilService,
            mockPreference as SharedPreferences,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockTranslate as TranslateService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppGlobalService as AppGlobalService,
            mockEvents as Events,
            mockScanner as SunbirdQRScanner,
            mockPlatform as Platform,
            mockCommonUtilService as CommonUtilService,
            mockContainer as ContainerService,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockAlertCtrl as AlertController,
            mockLocation as Location,
            mockSplashScreenService as SplashScreenService,
            mockActivatedRoute as ActivatedRoute,
            mockSegmentationTagService as SegmentationTagService,
            mockOnboardingConfigurationService as OnboardingConfigurationService
        );
        profileSettingsPage.boardSelect = { open: jest.fn() };
        profileSettingsPage.mediumSelect = ['hindi'];
        profileSettingsPage.gradeSelect = ['class1'];
        mockProfileService.getActiveSessionProfile = jest.fn(() => of({profileType: ""})) as any
        mockFrameworkService.getFrameworkDetails = jest.fn(() => of({ name: "name", identifier: "123"}))
        // act
        profileSettingsPage.onSubmitAttempt();
        // assert
        // expect(mockAppGlobalService.generateSaveClickedTelemetry).toHaveBeenCalledWith(
        //     expect.anything(),
        //     'failed',
        //     PageId.ONBOARDING_PROFILE_PREFERENCES,
        //     InteractSubtype.FINISH_CLICKED
        // );
        // expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
        //     InteractType.TOUCH,
        //     'submit-clicked',
        //     Environment.HOME,
        //     PageId.ONBOARDING_PROFILE_PREFERENCES,
        //     undefined,
        //     values
        // );
    });

    describe('boardClicked', () => {

        // it('should prevent assigning default values and open board details popup', (done) => {
        //     // arrange
        //     const payloadEvent: any = {
        //         stopPropagation: jest.fn(),
        //         preventDefault: jest.fn()
        //     };
        //     profileSettingsPage.boardSelect.open = jest.fn();
        //     // act
        //     profileSettingsPage.boardClicked(payloadEvent);
        //     // assert
        //     expect(profileSettingsPage.showQRScanner).toEqual(false);
        //     setTimeout(() => {
        //         expect(profileSettingsPage.boardSelect.open).toHaveBeenCalled();
        //         done();
        //     }, 0);
        // });

        it('should skip assigning default values', () => {
            // arrange
            const payloadEvent: any = null;
            profileSettingsPage.boardSelect.open = jest.fn();
            // act
            profileSettingsPage.boardClicked(payloadEvent);
            // assert
            expect(profileSettingsPage.showQRScanner).toEqual(false);
            setTimeout(() => {
                expect(profileSettingsPage.boardSelect.open).toHaveBeenCalled();
            }, 0);
        });

    });

    describe('handleBackButton', () => {

        it('should reset profile setting if QR scanner is dissabled', () => {
            // arrange
            profileSettingsPage.showQRScanner = false;
            profileSettingsPage.profileSettingsForms.reset = jest.fn()
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            // act
            profileSettingsPage.handleBackButton(true);
            // assert
            expect(profileSettingsPage.showQRScanner).toEqual(true);
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalled();
        });

        it('should dismiss the popup if QR scanner is open', () => {
            // arrange
            profileSettingsPage.showQRScanner = true;
            mockLocation.back = jest.fn()
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            // act
            profileSettingsPage.handleBackButton(true);
            // assert
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalled();
        });

    });

    describe('dismissPopup', () => {
        it('should handle dismiss popup', () => {
            // arrange
            mockLocation.back = jest.fn()
            // act
            profileSettingsPage.dismissPopup()
            // assert
        })
    })

    describe('handleHeaderEvents', () => {

        it('should trigger back button functionality if header-back button is clicked', () => {
            // arrange
            const eventPayload = { name: 'back' };
            profileSettingsPage.profileSettingsForms.reset = jest.fn()
            // act
            profileSettingsPage.handleHeaderEvents(eventPayload);
            // assert
        });

    });

    describe('cancelEvent', () => {

        it('should generate interact event when event is canceled board', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            profileSettingsPage.cancelEvent('board', {target: {value: ''}});
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
        });

        it('should generate interact event when event is canceled medium', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            profileSettingsPage.cancelEvent('board', {target: {}});
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
        });

        it('should generate interact event when event is canceled grade', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            profileSettingsPage.cancelEvent('grade', {target: {}});
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
        });

    });

    describe('openQRScanner', () => {

        it('should open the QR scanner', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockScanner.startScanner = jest.fn(() => Promise.resolve('skip'));
            // act
            profileSettingsPage.openQRScanner();
            // assert
            expect(mockScanner.startScanner).toHaveBeenCalled();
            expect(profileSettingsPage.showQRScanner).toEqual(true);
        });

        it('should open the QR scanner but skip generating telemetry event', () => {
            // arrange
            mockScanner.startScanner = jest.fn(() => Promise.resolve(''));
            // act
            profileSettingsPage.openQRScanner()
            // assert
            expect(mockScanner.startScanner).toHaveBeenCalled();
        });

    });

    describe('ionViewWillLeave', () => {
        it('should unsubscribe the subscriptions', () => {
            // arrange
            profileSettingsPage['headerObservable'] = {
                unsubscribe: jest.fn()
            };
            profileSettingsPage['unregisterBackButton'] = {
                unsubscribe: jest.fn()
            } as any;
            // act
            profileSettingsPage.ionViewWillLeave();
            // assert
            expect(profileSettingsPage['headerObservable'].unsubscribe).toHaveBeenCalled();
            expect(profileSettingsPage['unregisterBackButton'].unsubscribe).toHaveBeenCalled();
        });

        it('should unsubscribe the subscriptions except backbutton subscription', () => {
            // arrange
            profileSettingsPage['headerObservable'] = {
                unsubscribe: jest.fn()
            };
            profileSettingsPage['unregisterBackButton'] = null;
            // act
            profileSettingsPage.ionViewWillLeave();
            // assert
            expect(profileSettingsPage['headerObservable'].unsubscribe).toHaveBeenCalled();
        });
    });

    describe('hideOnboardingSplashScreen', () => {
        it('should hide the splash screen when the user reopens the onboarding profile page', () => {
            // arrange
            profileSettingsPage['navParams'] = { forwardMigration: true };
            mockSplashScreenService.handleSunbirdSplashScreenActions = jest.fn(() => Promise.resolve(undefined));
            // act
            profileSettingsPage.hideOnboardingSplashScreen();
            // assert
            expect(mockSplashScreenService.handleSunbirdSplashScreenActions).toHaveBeenCalled();
        });

        it('should skip hide the splash screen when the splash screen is already closed', () => {
            // arrange
            profileSettingsPage['navParams'] = { forwardMigration: false };
            mockSplashScreenService.handleSunbirdSplashScreenActions = jest.fn(() => Promise.resolve(undefined));
            // act
            profileSettingsPage.hideOnboardingSplashScreen();
            // assert
            expect(profileSettingsPage['navParams'].forwardMigration).toEqual(false);
        });
    });

    describe('ngOnDestroy', () => {
        it('should stop detecting the profile setting changes on leaving the page', () => {
            // arrange
            profileSettingsPage['formControlSubscriptions'] = {
                unsubscribe: jest.fn()
            } as any;
            // act
            profileSettingsPage.ngOnDestroy();
            // commonUtilService.getLoader
            expect(profileSettingsPage['formControlSubscriptions'].unsubscribe).toHaveBeenCalled();
        });
    });

    describe('fetchSyllabusList', () => {

        it('should fetch all the syllabus list details', () => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            })) as any;
            profileSettingsPage.loader = mockCommonUtilService.getLoader;
            const frameworkRes: Framework[] = [{
                name: 'SAMPLE_STRING',
                identifier: 'SAMPLE_STRING'
            }];
            const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
                language: 'en',
                requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
            };
            mockCommonUtilService.showToast = jest.fn();
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(frameworkRes));
            // act
            profileSettingsPage.fetchSyllabusList();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList).toHaveBeenCalledWith(getSuggestedFrameworksRequest);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SAMPLE_TEXT');
            }, 0);
        });

        it('should show data not found toast message if syllabus list is empty.', () => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            })) as any;
            profileSettingsPage.loader = mockCommonUtilService.getLoader;
            const frameworkRes: Framework[] = [];
            const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
                language: 'en',
                requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
            };
            mockCommonUtilService.showToast = jest.fn();
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(frameworkRes));
            // act
            profileSettingsPage.fetchSyllabusList();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList).toHaveBeenCalledWith(getSuggestedFrameworksRequest);
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SAMPLE_TEXT');
            }, 0);
        });

    });

    describe('onCategoryCliked()', () => {
        it('onCategoryCliked clicked for board', () => {
            // act
            profileSettingsPage.onCategoryCliked('board');
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toBeCalled();
        });
        it('onCategoryCliked clicked for medium', () => {
            // act
            profileSettingsPage.onCategoryCliked('medium');
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toBeCalled();
        });
        it('onCategoryCliked clicked for grade', () => {
            // act
            profileSettingsPage.onCategoryCliked('grade');
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toBeCalled();
        });
    });

    describe('getFrameworkID', () => {
        it('should get framework id ', (done) => {
            // arrage
            mockFrameworkService.getDefaultChannelDetails = jest.fn(() => of({defaultFramework: ''}))as any
            mockFormAndFrameworkUtilService.invokedGetFrameworkCategoryList = jest.fn(() => Promise.resolve([]))
            // act
            profileSettingsPage.getFrameworkID()
            // assert
            setTimeout(() => {
                expect(mockFrameworkService.getDefaultChannelDetails).toHaveBeenCalled()
                done()
            }, 0);
        })
    });

    describe('getCategoriesAndUpdateAttributes ', () => {
        it("should get Categories And UpdateAttributes ", (done) => {
            // arrange
            mockFormAndFrameworkUtilService.invokedGetFrameworkCategoryList = jest.fn(() => Promise.resolve([{index: 2, identifier:'123', itemList: []}, {index: 1, identifier:'345', itemList: []}]))
            // act
            profileSettingsPage.getCategoriesAndUpdateAttributes('')
            // assert
            setTimeout(() => {
                done()
            }, 0);
        })
    });

    describe('ngAfterViewInit', () => {
        it('should handle ng after init', () => {
            // arrange
            window.plugins['webViewChecker'] = {
                getCurrentWebViewPackageInfo: jest.fn(() => Promise.resolve())
            } as any
            mockFormAndFrameworkUtilService.getWebviewConfig = jest.fn(() => Promise.resolve('4'))
            // act
            profileSettingsPage.ngAfterViewInit()
            // assert
        })
    })

    describe('isMultipleVales', () => {
        it('should handle MultipleVales', () => {
            // arrange
            // act
            profileSettingsPage.isMultipleVales({identifier: ''}, 0)
            // assert
        })
    })

    xdescribe('getCategoriesDetails', () => {
        it('should get categories details ', () => {
            // arrange
            // act
            profileSettingsPage.getCategoriesDetails('', '', 0);
            // assert
        })
    })
});