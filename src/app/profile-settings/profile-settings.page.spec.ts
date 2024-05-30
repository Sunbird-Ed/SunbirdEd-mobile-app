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
import { of, Subscription, throwError } from 'rxjs';
import { FormControl } from '@angular/forms';
import { SegmentationTagService } from '../../services/segmentation-tag/segmentation-tag.service';
import { mockOnboardingConfigData } from '../components/discover/discover.page.spec.data';
import { App } from '@capacitor/app';
import { FrameworkCategory } from '../app.constant';

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
        handleToTopicBasedNotification: jest.fn(),
        showToast: jest.fn()
    };
    const mockContainer: Partial<ContainerService> = {};
    const mockEvents: Partial<Events> = {
        publish: jest.fn()
    };
    const mockFrameworkService: Partial<FrameworkService> = {
        getFrameworkDetails: jest.fn(() => of({ name: "name", identifier: "syllabus"}))
    } as any;
    const mockFrameworkUtilService: Partial<FrameworkUtilService> = {
        getActiveChannelSuggestedFrameworkList: jest.fn(() => of([{
            name: 'SAMPLE_STRING',
            identifier: 'SAMPLE_STRING',
            code: "SAMPLE_CODE"
        }]))
    };
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockLocation: Partial<Location> = {
        back: jest.fn()
    };
    const mockPlatform: Partial<Platform> = {};
    const mockProfileService: Partial<ProfileService> = {
        updateProfile: jest.fn(() => of()),
        getActiveSessionProfile: jest.fn()
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => ({
            extras: {
                state: {
                    id: 'sample-id',
                    stopScanner: true
                }
            }
        })) as any,
        navigate: jest.fn()
    };
    const mockScanner: Partial<SunbirdQRScanner> = {
        stopScanner: jest.fn()
    };
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
        invokedGetFrameworkCategoryList: jest.fn(() => Promise.resolve([{index: 1, itemList: []}]))
    };
    const mockSegmentationTagService: Partial<SegmentationTagService> = {
        refreshSegmentTags: jest.fn(),
        createSegmentTags: jest.fn()
    }
    const mockOnboardingConfigurationService: Partial<OnboardingConfigurationService> = {
        initialOnboardingScreenName: '',
        getAppConfig: jest.fn(() => mockOnboardingConfigData),
        getOnboardingConfig: jest.fn()
    }

    const mockPreference: Partial<SharedPreferences> = {
        getString: jest.fn()
    }

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

    describe('ngOnInit', () => {
        it('should fetch active profile by invoked ngOnInit()', (done) => {
            // arrange
            mockPreference.getString = jest.fn(() => of('id_123')) as any
            mockFormAndFrameworkUtilService.getFrameworkCategoryList = jest.fn(() => Promise.resolve());
            mockOnboardingConfigurationService.getOnboardingConfig = jest.fn(() => mockOnboardingConfigData.onboarding[0] as any)
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            // jest.spyOn(profileSettingsPage, 'handleActiveScanner').mockImplementation(() => {
            //     return;
            // });
            mockAppGlobalService.getRequiredCategories = jest.fn(() => (FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES))
            mockFrameworkService.getDefaultChannelDetails = jest.fn(() => of({defaultFramework: ''}))as any
            mockFormAndFrameworkUtilService.invokedGetFrameworkCategoryList = jest.fn(() => Promise.resolve([{index: 2, identifier:'board', itemList: []}, {index: 1, identifier:'medium', itemList: []}]))
            App.getInfo = jest.fn(() => Promise.resolve({id: 'org.sunbird.app', name: 'Sunbird', build: '', version: 9})) as any;
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({profileType: ''})) as any;
            // jest.spyOn(profileSettingsPage, 'fetchSyllabusList').mockImplementation(() => {
            //     return Promise.resolve();
            // });
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
            mockAppGlobalService.getRequiredCategories = jest.fn(() => (FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES))
            // jest.spyOn(profileSettingsPage, 'handleActiveScanner').mockImplementation(() => {
            //     return;
            // });
            App.getInfo = jest.fn(() => Promise.resolve({id: 'org.sunbird.app', name: 'Sunbird', build: '', version: 9})) as any;
            mockFrameworkService.getDefaultChannelDetails = jest.fn(() => of({defaultFramework: ''}))as any
            mockFormAndFrameworkUtilService.invokedGetFrameworkCategoryList = jest.fn(() => Promise.resolve([{index: 2, identifier:'syllabus', itemList: []}, {index: 1, identifier:'grade', itemList: []}]))
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({profileType: ''})) as any;
            // jest.spyOn(profileSettingsPage, 'fetchSyllabusList').mockImplementation(() => {
            //     return Promise.resolve();
            // });
            profileSettingsPage.profileSettingsForms = {
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
                valueChanges: jest.fn(() => of({} as any))
            } as any
            // act
            profileSettingsPage.ngOnInit().then(() => {
                // assert
                setTimeout(() => {
                    expect(App.getInfo).toHaveBeenCalled()
                    // expect(mockFormAndFrameworkUtilService.getFrameworkCategoryList).toHaveBeenCalled();
                    expect(profileSettingsPage.supportedProfileAttributes).toEqual(
                        {});
                    done();
                }, 500);
            });
        });
    });

    describe('ngAfterViewInit', () => {
        it('should handle ng after init', () => {
            // arrange
            window.plugins['webViewChecker'] = {
                getCurrentWebViewPackageInfo: jest.fn(() => Promise.resolve({versionName: '2.23'}))
            } as any
            mockFormAndFrameworkUtilService.getWebviewConfig = jest.fn(() => Promise.resolve(4))
            // act
            profileSettingsPage.ngAfterViewInit()
            // assert
        })

        it('should handle ng after init, handle error', () => {
            // arrange
            window.plugins['webViewChecker'] = {
                getCurrentWebViewPackageInfo: jest.fn(() => Promise.reject({versionName: '19.02'}))
            } as any
            mockFormAndFrameworkUtilService.getWebviewConfig = jest.fn(() => Promise.resolve('4'))
            // act
            profileSettingsPage.ngAfterViewInit()
            // assert
        })
    })

    describe('ngOnDestroy', () => {
        it('should stop detecting the profile setting changes on leaving the page', () => {
            // arrange
            // act
            profileSettingsPage.ngOnDestroy();
            // commonUtilService.getLoader
        });
    });

    describe('handleActiveScanner', () => {
        it('should stop active scanner', (done) => {
            window.history = {
                state: {
                    defaultFrameworkID: "",
                    rootOrgID: "*"
                }
            } as any
            window.setTimeout = jest.fn((fn) => fn(
                mockScanner.stopScanner = jest.fn()
            ), 500) as any
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
                // expect(mockScanner.stopScanner).toHaveBeenCalled();
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
            window.setTimeout = jest.fn((fn) => fn({}), 500) as any
            // act
            profileSettingsPage.handleActiveScanner();
            // assert
            setTimeout(() => {
                done();
            }, 0);
        });
    });

    describe('ionViewWillEnter', () => {
        it('should handle all header events by invoked ionViewWillEnter()', (done) => {
            // arrange
            window.setTimeout = jest.fn((f) => f(
                profileSettingsPage.boardSelect = {
                    open: jest.fn()
                }
            ), 350) as any;
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
            window.setTimeout = jest.fn((f) => f(
                profileSettingsPage.boardSelect = {
                    open: jest.fn()
                }
            ), 350) as any;
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
            window.setTimeout = jest.fn((f) => f(
                profileSettingsPage.boardSelect = {
                    open: jest.fn()
                }
            ), 350) as any;
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
    })

    describe('ionViewDidEnter', () => {
        it('should handle all header events by invoked ionViewDidEnter()', (done) => {
            // arrange
            mockRouter.getCurrentNavigation = jest.fn(() => ({extras: {state: {stopScanner: true, hideBackButton: true, forwardMigration: true}}})) as any
            mockLocation.back = jest.fn()
            // act
            profileSettingsPage.ionViewDidEnter();
            // assert
            setTimeout(() => {
                done();
            }, 0);
        });
    })

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

    describe('dismissPopup', () => {
        it('should handle dismiss popup', () => {
            // arrange
            mockLocation.back = jest.fn()
            // act
            profileSettingsPage.dismissPopup()
            // assert
        })

        it('should handle dismiss popup on getTop', () => {
            // arrange
            profileSettingsPage.isInitialScreen = true 
            profileSettingsPage.showQRScanner = true
            mockCommonUtilService.showExitPopUp = jest.fn()
            // act
            profileSettingsPage.dismissPopup()
            // assert
        })

        it('should handle dismiss popup on getTop', () => {
            // arrange
            mockAlertCtrl.getTop = jest.fn(() => Promise.resolve({
                dismiss: jest.fn()
            })) as any
            // act
            profileSettingsPage.dismissPopup()
            // assert
        })
    })

    describe('cancelEvent', () => {

        it('should generate interact event when event is canceled board', () => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            profileSettingsPage.cancelEvent(['board'], {target: {value: [{value: 'id_123'}]}});
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

    describe('getCategoriesDetails', () => {
        it('should get categories details ', () => {
            // arrange
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of({ name: "name", identifier: "board"}))
            mockAppGlobalService.setFramewokCategory = jest.fn()
            const boardCategoryTermsRequet = {
                frameworkId: '123',
                requiredCategories: ['SAMPLE_STRING'],
                currentCategoryCode: ['SAMPLE_STRING'],
                language: mockTranslate.currentLang
            };
            const frameworkRes: Framework[] = [{
                name: 'SAMPLE_STRING',
                identifier: 'SAMPLE_STRING',
                code: "SAMPLE_CODE"
            }];
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(frameworkRes));
            mockFrameworkUtilService.getFrameworkCategoryTerms = jest.fn(() => of([{identifier: 'board', index: 0, category: '', status: '', name: 'name', code: 'code'}]))
            // act
            profileSettingsPage.getCategoriesDetails('SAMPLE_STRING', '', 0);
            // assert
            setTimeout(() => {
                // expect(mockFrameworkService.getFrameworkDetails).toHaveBeenCalled()
                // expect(mockFrameworkUtilService.getFrameworkCategoryTerms).toHaveBeenCalledWith(boardCategoryTermsRequet)
            }, 0);
        })
    })

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
            mockScanner.startScanner = jest.fn(() => Promise.reject(''));
            // act
            profileSettingsPage.openQRScanner()
            // assert
            expect(mockScanner.startScanner).toHaveBeenCalled();
        });

    });

    describe('onSubmitAttempt()', () => {
        it('should generate submit clicked telemetry  if board is empty onSubmitAttempt()', (done) => {
            // arrange
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of({ name: "name", identifier: "board"}))
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
            // act
            profileSettingsPage.onSubmitAttempt();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.generateSaveClickedTelemetry).toHaveBeenCalledWith(
                    expect.anything(),
                    'passed',
                    PageId.ONBOARDING_PROFILE_PREFERENCES,
                    InteractSubtype.FINISH_CLICKED
                );
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    "select-submit", "", "onboarding", "manual-profile", undefined, undefined, undefined, []
                );
                done();
            }, 0);
        });

        it('should generate submit clicked telemetry  if medium is empty onSubmitAttempt()', (done) => {
            // arrange
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of({ name: "name", identifier: "board"}))
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
                            value = { value: { medium: ['english'] } };
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
            profileSettingsPage.boardSelect = { open: jest.fn() };
            mockCommonUtilService.isDeviceLocationAvailable = jest.fn(() => Promise.resolve(true))
            mockAppGlobalService.setOnBoardingCompleted = jest.fn()
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({profileType: ""}))as any
            // act
            profileSettingsPage.onSubmitAttempt();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.generateSaveClickedTelemetry).toHaveBeenCalledWith(
                    expect.anything(),
                    'passed',
                    PageId.ONBOARDING_PROFILE_PREFERENCES,
                    InteractSubtype.FINISH_CLICKED
                );
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    "select-submit", "", "onboarding", "manual-profile", undefined, undefined, undefined, []
                );
                done()
            }, 0);
        });

        it('should generate submit clicked telemetry  if grades is empty onSubmitAttempt()', (done) => {
            // arrange
            const values = new Map();
            values['board'] = 'na';
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of({ name: "name", identifier: "board"}))
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
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({profileType: ""}))as any
            profileSettingsPage.boardSelect = { open: jest.fn() };
            // act
            profileSettingsPage.onSubmitAttempt();
            // assert
            setTimeout(() => {
                expect(mockAppGlobalService.generateSaveClickedTelemetry).toHaveBeenCalledWith(
                    expect.anything(),
                    'passed',
                    PageId.ONBOARDING_PROFILE_PREFERENCES,
                    InteractSubtype.FINISH_CLICKED
                );
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    "select-submit", "", "onboarding", "manual-profile", undefined, undefined, undefined, []
                );
                done();
            }, 0);
        });

        it('should generate submit clicked telemetry  if grades is empty onSubmitAttempt()', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: presentFn,
                dismiss: dismissFn,
            }));
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of({ name: "name", identifier: "board"}))
            mockProfileService.updateProfile = jest.fn(() => throwError({error: ''})) as any
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
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({profileType: ""}))as any
            profileSettingsPage.boardSelect = { open: jest.fn() };
            // act
            profileSettingsPage.onSubmitAttempt();
            // assert
            setTimeout(() => {
                done();
            }, 0);
        });

        it('should submit form details for board blanked to call onSubmitAttempt()', (done) => {
            // arrange
            profileSettingsPage.profileSettingsForms = { valid : true, value: {
                syllabus: [], board: ['AP'], medium: ['English'], grade: []
            }, get: jest.fn((arg) => {
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
            }),} as any
            const syllabusData = new FormControl([], (c) => c.value.length ? undefined : { length: 'NOT_SELECTED' });
            mockAppGlobalService.generateSaveClickedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const values = new Map();
            values['medium'] = 'na';
            profileSettingsPage.boardSelect = { open: jest.fn() };
            profileSettingsPage.mediumSelect = ['hindi'];
            profileSettingsPage.gradeSelect = ['class1'];
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({profileType: ""})) as any
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of({ name: "name", identifier: "board"}))
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
    
        it('should submit form details for medium blank to call onSubmitAttempt()', () => {
            // arrange
            mockAppGlobalService.generateSaveClickedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            const values = new Map();
            values['board'] = 'na';
            profileSettingsPage.profileSettingsForms = {
                valid: false,
                controls: {
                    syllabus: {
                        validator: jest.fn()
                    }
                },
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
                value: {
                    syllabus: [], board: ['odisha'], medium: [], grade: []
                },
                reset: jest.fn()
            } as any;
            profileSettingsPage.boardSelect = { open: jest.fn() };
            profileSettingsPage.mediumSelect = ['hindi'];
            profileSettingsPage.gradeSelect = ['class1'];
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({profileType: ""})) as any
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of({ name: "name", identifier: "syllabus"}))
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
    });

    describe('fetchSyllabusList', () => {

        it('should fetch all the syllabus list details', (done) => {
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
                identifier: 'SAMPLE_STRING',
                code: "SAMPLE_CODE"
            }];
            mockAppGlobalService.getRequiredCategories = jest.fn(() => (FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES))
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
                // expect(mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList).toHaveBeenCalledWith(getSuggestedFrameworksRequest);
                // expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SAMPLE_TEXT');
                done()
            }, 0);
        });
        
        it('should fetch all the syllabus list details, no framework lenth', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            })) as any;
            profileSettingsPage.loader = mockCommonUtilService.getLoader;
            const frameworkRes: Framework[] = [];
            mockAppGlobalService.getRequiredCategories = jest.fn(() => (FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES))
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
                // expect(mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList).toHaveBeenCalledWith(getSuggestedFrameworksRequest);
                // expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SAMPLE_TEXT');
                done()
            }, 0);
        });
        it('should show data not found toast message if syllabus list is empty.', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            })) as any;
            mockAppGlobalService.getRequiredCategories = jest.fn(() => (FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES))
            profileSettingsPage.loader = mockCommonUtilService.getLoader;
            const frameworkRes: Framework[] = [{
                name: 'SAMPLE_STRING',
                identifier: 'SAMPLE_STRING',
                code: "SAMPLE_CODE"
            }];
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => throwError(frameworkRes));
            const getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest = {
                language: 'en',
                requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
            };
            mockCommonUtilService.showToast = jest.fn();
            // act
            profileSettingsPage.fetchSyllabusList();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                // expect(mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList).toHaveBeenCalledWith(getSuggestedFrameworksRequest);
                // expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('SAMPLE_TEXT');
                done()
            }, 0);
        });

    });

    describe('boardClicked', () => {

        it('should skip assigning default values', () => {
            // arrange
            const payloadEvent: any = {stopPropagation: jest.fn(), preventDefault: jest.fn()};
            document.getElementsByTagName = jest.fn((fn) => ({
                ele: {multiple: true,
                setAttribute: jest.fn()}
            })) as any
            // profileSettingsPage.boardSelect.open = jest.fn();
            // act
            profileSettingsPage.boardClicked(payloadEvent);
            // assert
            expect(profileSettingsPage.showQRScanner).toEqual(false);
            setTimeout(() => {
                // expect(profileSettingsPage.boardSelect.open).toHaveBeenCalled();
            }, 0);
        });

        it('should skip assigning default values', () => {
            // arrange
            const payloadEvent: any = null;
            document.getElementsByTagName = jest.fn((fn) => ({
                ele: {multiple: false,
                setAttribute: jest.fn()}
            })) as any
            // profileSettingsPage.boardSelect.open = jest.fn();
            // act
            profileSettingsPage.boardClicked(payloadEvent);
            // assert
            expect(profileSettingsPage.showQRScanner).toEqual(false);
            setTimeout(() => {
                // expect(profileSettingsPage.boardSelect.open).toHaveBeenCalled();
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

    describe('getCategoriesAndUpdateAttributes ', () => {
        it("should get Categories And UpdateAttributes ", (done) => {
            // arrange
            const frameworkRes: Framework[] = [{
                name: 'SAMPLE_STRING',
                identifier: 'SAMPLE_STRING',
                code: "SAMPLE_CODE"
            }];
            mockAppGlobalService.getRequiredCategories = jest.fn(() => (FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES))
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(frameworkRes));
            mockFormAndFrameworkUtilService.invokedGetFrameworkCategoryList = jest.fn(() => Promise.resolve([{index: 2, identifier:'board', itemList: []}, {index: 1, identifier:'medium', itemList: []}]))
            // act
            profileSettingsPage.getCategoriesAndUpdateAttributes('')
            // assert
            setTimeout(() => {
                done()
            }, 0);
        })
        it("should get Categories And UpdateAttributes, handle error ", (done) => {
            // arrange
            const frameworkRes: Framework[] = [{
                name: 'SAMPLE_STRING',
                identifier: 'SAMPLE_STRING',
                code: "SAMPLE_CODE"
            }];
            mockAppGlobalService.getRequiredCategories = jest.fn(() => (FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES))
            mockFrameworkUtilService.getActiveChannelSuggestedFrameworkList = jest.fn(() => of(frameworkRes));
            mockFormAndFrameworkUtilService.invokedGetFrameworkCategoryList = jest.fn(() => Promise.reject({error: ''}))
            // act
            profileSettingsPage.getCategoriesAndUpdateAttributes('')
            // assert
            setTimeout(() => {
                done()
            }, 0);
        })
    });

    describe('getFrameworkID', () => {
        it('should get framework id ', (done) => {
            // arrage
            mockFrameworkService.getDefaultChannelDetails = jest.fn(() => of({defaultFramework: ''}))as any
            mockFormAndFrameworkUtilService.invokedGetFrameworkCategoryList = jest.fn(() => Promise.resolve([{index: 2, identifier:'syllabus', itemList: []}, {index: 1, identifier:'board', itemList: []}]))
            // act
            profileSettingsPage.getFrameworkID()
            // assert
            setTimeout(() => {
                expect(mockFrameworkService.getDefaultChannelDetails).toHaveBeenCalled()
                done()
            }, 0);
        })
    });

    describe('isMultipleVales', () => {
        it('should handle MultipleVales', () => {
            // arrange
            // act
            profileSettingsPage.isMultipleVales({identifier: ''}, 0)
            // assert
        })
    })
});