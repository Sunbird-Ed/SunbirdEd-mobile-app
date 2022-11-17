
import { TermsAndConditionsPage } from './terms-and-conditions.page';
import { ProfileService } from 'sunbird-sdk';
import { Platform } from '@ionic/angular';
import { Injector } from '@angular/core';
import {
    CommonUtilService,
    TelemetryGeneratorService,
    FormAndFrameworkUtilService,
    SplashScreenService,
    ExternalIdVerificationService,
    AppGlobalService,
    LogoutHandlerService,
    PageId,
    Environment,
    ImpressionType,
    InteractType,
    InteractSubtype,
    FrameworkDetailsService
} from '../../services';
import {
    TncUpdateHandlerService,
} from '../../services/handlers/tnc-update-handler.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Router } from '@angular/router';
import { SbProgressLoader } from '../../services/sb-progress-loader.service';
import { DomSanitizer } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { RouterLinks } from '../app.constant';
import { ConsentService } from '../../services/consent-service';
import { Events } from '@app/util/events';
import onboarding from '../../assets/configurations/config.json';
import { SharedPreferences } from '@project-sunbird/sunbird-sdk';

describe('TermsAndConditionsPage', () => {
    let termsAndConditionsPage: TermsAndConditionsPage;

    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn(() => of({})),
        getServerProfilesDetails: jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url' })),
        updateServerProfile: jest.fn(() => of({}))
    };

    const mockPlatform: Partial<Platform> = {
    };
    mockPlatform.backButton = {
        subscribeWithPriority: jest.fn((_, fn) => fn()),

    } as any;
    const mockLogoutHandlerService: Partial<LogoutHandlerService> = {
        onLogout: jest.fn()
    };

    const mockTncUpdateHandlerService: Partial<TncUpdateHandlerService> = {
        dismissTncPage: jest.fn(),
        isSSOUser: jest.fn()
    };

    const mockSanitizer: Partial<DomSanitizer> = {
        sanitize: jest.fn(),
        bypassSecurityTrustResourceUrl: jest.fn(() => 'some_safe_url')
    };

    const mockCommonUtilService: Partial<CommonUtilService> = {
        getLoader: jest.fn(() => {
            return {
                present: jest.fn(),
                dismiss: jest.fn()
            };
        }),
        showToast: jest.fn(),
        translateMessage: jest.fn(() => ('translated_message'))
    };

    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateImpressionTelemetry: jest.fn(),
        generateBackClickedTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn()
    };

    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn()
    };

    const mockInjector: Partial<Injector> = {
        get: jest.fn(() => (mockTncUpdateHandlerService))
    };

    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {
        updateLoggedInUser: jest.fn(() => Promise.resolve({ status: true }))
    };

    const mockRouter: Partial<Router> = {
        navigate: jest.fn()
    };

    const mockSplashScreenService: Partial<SplashScreenService> = {
    };

    const mockExternalIdVerificationService: Partial<ExternalIdVerificationService> = {
        showExternalIdVerificationPopup: jest.fn()
    };

    const mockAppGlobalService: Partial<AppGlobalService> = {
        closeSigninOnboardingLoader: jest.fn()
    };

    const mockSbProgressLoader: Partial<SbProgressLoader> = {
        hide: jest.fn()
    };

    const mockConsentService: Partial<ConsentService> = {};
    const mockFrameworkDetailsService: Partial<FrameworkDetailsService> = {
        getFrameworkDetails: jest.fn()
    };
    const mockEvents: Partial<Events> = {
        publish: jest.fn()
    };
    const mockPreference: Partial<SharedPreferences> = {
        putString: jest.fn(() => of()) as any
    }
    beforeAll(() => {
        termsAndConditionsPage = new TermsAndConditionsPage(
            mockProfileService as ProfileService,
            mockPreference as SharedPreferences,
            mockPlatform as Platform,
            mockLogoutHandlerService as LogoutHandlerService,
            mockSanitizer as DomSanitizer,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppVersion as AppVersion,
            mockInjector as Injector,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockRouter as Router,
            mockSplashScreenService as SplashScreenService,
            mockExternalIdVerificationService as ExternalIdVerificationService,
            mockAppGlobalService as AppGlobalService,
            mockSbProgressLoader as SbProgressLoader,
            mockConsentService as ConsentService,
            mockFrameworkDetailsService as FrameworkDetailsService,
            mockEvents as Events
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of TermsAndConditionsPage', () => {
        expect(termsAndConditionsPage).toBeTruthy();
    });

    describe('ngOnint', () => {
        it('should populate the tncUrl and generate impression telemetry', (done) => {
            // arrange
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({
                profileType: 'none', serverProfile: {
                    tncLatestVersionUrl: 'sample_tnc_url',
                    declarations: [{ name: 'sample-name' }],
                }
            })),
            mockAppGlobalService.closeSigninOnboardingLoader = jest.fn(() => Promise.resolve());
            // act
            termsAndConditionsPage.ngOnInit();
            // assert
            setTimeout(() => {
                expect(termsAndConditionsPage.tncLatestVersionUrl).toBeDefined();
                expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(ImpressionType.VIEW, '',
                    PageId.TERMS_N_CONDITIONS,
                    Environment.HOME);
                done();
            });
        });
    });

    describe('ionViewWillEnter', () => {
        it('should show  warning Toast when back is clicked for first time', (done) => {
            // arrange
            termsAndConditionsPage['unregisterBackButtonAction'] = {
                unsubscribe: jest.fn()
            } as any;
            // act
            termsAndConditionsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('translated_message');
                done();
            });
        });

        it('should logout and dismiss the tnc page if back button is clicked twice', (done) => {
            // arrange
            termsAndConditionsPage['unregisterBackButtonAction'] = {
                unsubscribe: jest.fn()
            } as any;
            // act
            termsAndConditionsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockLogoutHandlerService.onLogout).toHaveBeenCalled();
                expect(mockTncUpdateHandlerService.dismissTncPage).toHaveBeenCalled();
                done();
            });
        });

        it('should logout and dismiss the tnc page if back button is clicked twice and should not unsubscribe', (done) => {
            // arrange
            termsAndConditionsPage['unregisterBackButtonAction'] = undefined;
            // act
            termsAndConditionsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockLogoutHandlerService.onLogout).toHaveBeenCalled();
                expect(mockTncUpdateHandlerService.dismissTncPage).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('ionViewDidEnter', () => {
        it('should hide the animated progress loader', () => {
            // arrange
            // act
            termsAndConditionsPage.ionViewDidEnter();
            // assert
            expect(mockSbProgressLoader.hide).toHaveBeenCalledWith({ id: 'login' });
        });
    });

    describe('ionViewWillLeave', () => {
        it('should not unsubscribe the backbutton subscription if its undefined', () => {
            // arrange
            termsAndConditionsPage['unregisterBackButtonAction'] = undefined;
            // act
            termsAndConditionsPage.ionViewWillLeave();
            // assert
            expect(termsAndConditionsPage['unregisterBackButtonAction']).toBeUndefined();
        });

        it('should unsubscribe the backbutton subscription', () => {
            // arrange
            termsAndConditionsPage['unregisterBackButtonAction'] = {
                unsubscribe: jest.fn()
            } as any;
            // act
            termsAndConditionsPage.ionViewWillLeave();
            // assert
            expect(termsAndConditionsPage['unregisterBackButtonAction'].unsubscribe).toHaveBeenCalled();
        });
    });

    describe('onIFrameLoad', () => {
        it('should generate Impression telemetry and dismiss the loader', () => {
            // arrange
            // act
            termsAndConditionsPage.ngOnInit();
            termsAndConditionsPage.onIFrameLoad();
            // assert
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(ImpressionType.VIEW, '',
                PageId.TERMS_N_CONDITIONS_STATIC_PAGE,
                Environment.HOME);
        });

        it('should generate Impression telemetry', () => {
            // arrange
            termsAndConditionsPage['loading'] = undefined;
            // act
            termsAndConditionsPage.onIFrameLoad();
            // assert
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(ImpressionType.VIEW, '',
                PageId.TERMS_N_CONDITIONS_STATIC_PAGE,
                Environment.HOME);
        });
    });

    describe('onConfirmationChange', () => {
        it('should generate Interact telemetry when check box is toggled', () => {
            // arrange
            // act
            termsAndConditionsPage.onConfirmationChange({ target: { checked: true } });
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
                InteractSubtype.ACCEPTANCE_CHECKBOX_CLICKED,
                Environment.HOME,
                PageId.TERMS_N_CONDITIONS,
                undefined,
                { isChecked: true });
        });
    });

    describe('dismissLoader', () => {
        it('should generate Interact telemetry when check box is toggled', () => {
            // arrange
            // act
            termsAndConditionsPage['dismissLoader'](undefined);
            // assert
        });
    });

    describe('onAcceptanceClick', () => {
        it('should updated user has guest if onboading skipped', (done) => {
            // arrange
            termsAndConditionsPage['userProfileDetails'] = {
                tncLatestVersion: 'sample_tnc_url',
                declarations: [{ name: 'sample-name' }],
                managedBy: "manager",
                dob: 'sample_dob'
            };
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
            mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
            mockProfileService.getServerProfilesDetails = jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url', dob: 'sample_dob'})),
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({
                serverProfile: {
                    tncLatestVersion: 'sample_tnc_url',
                    declarations: [{ name: 'sample-name' }],
                    dob: 'sample_dob'
                },
                profileType: 'none'
            }));
            let onboardingTrue = onboarding;
            onboardingTrue.skipOnboardingForLoginUser = true;
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({status: true, profile: 'teacher'}))
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve());
            mockTncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(true));
            mockTncUpdateHandlerService.dismissTncPage = jest.fn();
            mockConsentService.getConsent = jest.fn(() => Promise.resolve())
            mockTncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(false));
            mockFrameworkDetailsService.getFrameworkDetails = jest.fn(() => Promise.resolve({
                profileUserTypes: [{
                    type: "teacher",
                }],
                id: 'cbse',
                board: ['cbse'],
                medium: ['english'],
                grade: ['class1'],
                profileLocation: [{type: 'ka', code:'ka34'}]
            })) as any;

            const mockCurrentProfile = {
                uid: 'some_type'
            } as any;
            mockAppGlobalService.getCurrentUser = jest.fn(() => mockCurrentProfile);
            mockProfileService.updateServerProfile = jest.fn(() => throwError(
                { response: { body: { params: { err: 'UOS_USRUPD0062' } } } }));
            // act
            termsAndConditionsPage.onAcceptanceClick().then(() => {
                // assert
                expect(mockTncUpdateHandlerService.dismissTncPage).toHaveBeenCalled();
                setTimeout(() => {
                    done();
                }, 0);
            });
        });
        it('should dismiss tnc and navigate to USER_TYPE_SELECTION_LOGGEDIN if logged in user', (done) => {
            // arrange
            termsAndConditionsPage['userProfileDetails'] = {
                tncLatestVersion: 'sample_tnc_url',
                declarations: [{ name: 'sample-name' }],
                dob: 'sample_dob'
            };
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
            mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
            mockProfileService.getServerProfilesDetails = jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url', dob: 'sample_dob'})),
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({
                serverProfile: {
                    tncLatestVersionUrl: 'sample_tnc_url',
                    declarations: [{ name: 'sample-name' }],
                    dob: 'sample_dob'
                },
                profileType: 'none'
            }));
            let onboardingTrue = onboarding;
            onboardingTrue.skipOnboardingForLoginUser = false;
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({status: true, profile: 'teacher'}))
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve());
            mockTncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(true));
            mockTncUpdateHandlerService.dismissTncPage = jest.fn();
            mockConsentService.getConsent = jest.fn(() => Promise.resolve())
            mockRouter.navigate = jest.fn()
            mockTncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(false));
            // act
            termsAndConditionsPage.onAcceptanceClick().then(() => {
                // assert
                expect(mockTncUpdateHandlerService.dismissTncPage).toHaveBeenCalled();
                setTimeout(() => {
                    expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.USER_TYPE_SELECTION_LOGGEDIN], {
                        state: {categoriesProfileData: {
                            hasFilledLocation: true,
                            showOnlyMandatoryFields: true,
                            profile: 'teacher',
                            isRootPage: true,
                            noOfStepsToCourseToc: 1,
                            status: true,
                            isUserLocationAvalable: true
                          }}
                    })
                    done();
                }, 0);
            });
        });
        it('should dismiss tnc and navigate to tabs if profile type is not none or other if logged in user', (done) => {
            // arrange
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
            mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
            mockProfileService.getServerProfilesDetails = jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url', dob: 'sample_dob'})),
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({
                serverProfile: {
                    tncLatestVersion: 'sample_tnc_url',
                    userId: 'some_userid',
                    declarations: [{ name: 'sample-name' }],
                    managedBy: 'manager',
                    dob: 'sample_dob'
                },
                profileType: 'teacher'
            }));
            let onboardingTrue = onboarding;
            onboardingTrue.skipOnboardingForLoginUser = true;
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({status: true, profile: 'teacher'}))
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve());
            mockTncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(true));
            mockTncUpdateHandlerService.dismissTncPage = jest.fn();
            mockConsentService.getConsent = jest.fn(() => Promise.resolve())
            mockRouter.navigate = jest.fn()
            // act
            termsAndConditionsPage.onAcceptanceClick().then(() => {
                // assert
                expect(mockTncUpdateHandlerService.dismissTncPage).toHaveBeenCalled();
                setTimeout(() => {
                    expect(mockRouter.navigate).toHaveBeenCalledWith(['/', RouterLinks.TABS])
                    done();
                }, 0);
            });
        });
    
        it('should update guest user if no issouser and location and onboading cndtn', (done) => {
            // arrange
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
            mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
            mockProfileService.getServerProfilesDetails = jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url', dob: 'sample_dob'})),
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({
                serverProfile: {
                    tncLatestVersionUrl: 'sample_tnc_url',
                    declarations: [{ name: 'sample-name' }],
                    managedBy: 'manager',
                    dob: 'sample_dob'
                },
                profileType: 'none'
            }));
            let onboardingTrue = onboarding;
            onboardingTrue.skipOnboardingForLoginUser = true;
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({status: true, profile: 'teacher'}))
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve());
            mockCommonUtilService.isUserLocationAvalable = jest.fn(() => false)
            mockTncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(false));
            mockTncUpdateHandlerService.dismissTncPage = jest.fn();
            mockConsentService.getConsent = jest.fn(() => Promise.resolve())
            // act
            termsAndConditionsPage.onAcceptanceClick().then(() => {
                // assert
                expect(mockTncUpdateHandlerService.dismissTncPage).toHaveBeenCalled();
                setTimeout(() => {
                    done();
                }, 0);
            });
        });
        it('should navigate to profile or category edit if no issouser and location', (done) => {
            // arrange
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
            mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
            mockProfileService.getServerProfilesDetails = jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url', dob: 'sample_dob'})),
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({
                serverProfile: {
                    tncLatestVersionUrl: 'sample_tnc_url',
                    declarations: [{ name: 'sample-name' }],
                    managedBy: 'manager',
                    dob: 'sample_dob'
                },
                profileType: 'Student'
            }));
            let onboardingTrue = onboarding;
            onboardingTrue.skipOnboardingForLoginUser = false;
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({status: true, profile: 'teacher'}))
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve());
            mockCommonUtilService.isUserLocationAvalable = jest.fn(() => false)
            mockTncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(false));
            mockTncUpdateHandlerService.dismissTncPage = jest.fn();
            mockConsentService.getConsent = jest.fn(() => Promise.resolve())
            mockRouter.navigate = jest.fn()
            // act
            termsAndConditionsPage.onAcceptanceClick().then(() => {
                // assert
                expect(mockTncUpdateHandlerService.dismissTncPage).toHaveBeenCalled();
                setTimeout(() => {
                    expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`], {
                        state: {
                            hasFilledLocation: false,
                            isRootPage: true,
                            noOfStepsToCourseToc: 1,
                            profile: 'teacher',
                            showOnlyMandatoryFields: true
                          }
                    })
                    done();
                }, 0);
            });
        });
        it('should dismiss tnc and navigate to USER_TYPE_SELECTION_LOGGEDIN if no issouser and location', (done) => {
            // arrange
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
            mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
            mockProfileService.getServerProfilesDetails = jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url', dob: 'sample_dob'})),
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({
                serverProfile: {
                    tncLatestVersionUrl: 'sample_tnc_url',
                    declarations: [{ name: 'sample-name' }],
                    dob: 'sample_dob'
                },
                profileType: 'none'
            }));
            let onboardingTrue = onboarding;
            onboardingTrue.skipOnboardingForLoginUser = false;
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({status: true, profile: 'teacher'}))
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve());
            mockCommonUtilService.isUserLocationAvalable = jest.fn(() => false)
            mockTncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(false));
            mockTncUpdateHandlerService.dismissTncPage = jest.fn();
            mockConsentService.getConsent = jest.fn(() => Promise.resolve())
            mockRouter.navigate = jest.fn()
            // act
            termsAndConditionsPage.onAcceptanceClick().then(() => {
                // assert
                expect(mockTncUpdateHandlerService.dismissTncPage).toHaveBeenCalled();
                setTimeout(() => {
                    expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.USER_TYPE_SELECTION_LOGGEDIN], {
                        state: { categoriesProfileData: {
                            hasFilledLocation: false,
                            showOnlyMandatoryFields: true,
                            profile: 'teacher',
                            isRootPage: true,
                            noOfStepsToCourseToc: 1,
                            status: true,
                            isUserLocationAvalable: false
                          }}
                    })
                    done();
                }, 0);
            });
        });

        it('should dismiss tnc and navigate on update logged in user ', (done) => {
            // arrange
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
            mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
            mockProfileService.getServerProfilesDetails = jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url', dob: 'sample_dob'})),
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({
                serverProfile: {
                    tncLatestVersionUrl: 'sample_tnc_url',
                    declarations: [{ name: 'sample-name' }],
                    dob: 'sample_dob'
                },
                profileType: 'none'
            }));
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({status: false}))
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve());
            mockTncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(true));
            mockTncUpdateHandlerService.dismissTncPage = jest.fn();
            mockConsentService.getConsent = jest.fn(() => Promise.resolve())
            let onboardingTrue = onboarding;
            onboardingTrue.skipOnboardingForLoginUser = true;
            // update user as guest flow 
            mockFrameworkDetailsService.getFrameworkDetails = jest.fn(() => Promise.resolve({
                profileUserTypes: [{
                    type: "teacher",
                }],
                id: 'cbse',
                board: ['cbse'],
                medium: ['english'],
                grade: ['class1'],
                profileLocation: [{type: 'ka', code:'ka34'}]
            })) as any;
            const mockCurrentProfile = {
                uid: 'some_type'
            } as any;
            mockAppGlobalService.getCurrentUser = jest.fn(() => mockCurrentProfile);
            mockProfileService.updateServerProfile = jest.fn(() => of({
                uid: '12345',
                handle: 'sample_profile',
                source: 'server',
                profileType: 'teacher'
            }))
            mockEvents.publish = jest.fn()
            // act
            termsAndConditionsPage.onAcceptanceClick().then(() => {
                // assert
                expect(mockTncUpdateHandlerService.dismissTncPage).toHaveBeenCalled();
                setTimeout(() => {
                    expect(mockAppGlobalService.getCurrentUser ).toHaveBeenCalled();
                    expect(mockEvents.publish).toHaveBeenCalledWith('refresh:loggedInProfile')
                    done();
                }, 0);
            });
        });
        it('should dismiss tnc and navigate to USER_TYPE_SELECTION_LOGGEDIN page if profile type is not none or other ', (done) => {
            // arrange
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
            mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
            mockProfileService.getServerProfilesDetails = jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url', dob: 'sample_dob'})),
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({
                serverProfile: {
                    tncLatestVersionUrl: 'sample_tnc_url',
                    declarations: [{ name: 'sample-name' }],
                    dob: 'sample_dob'
                },
                profileType: 'none'
            }));
            let onboardingfalse = onboarding;
            onboardingfalse.skipOnboardingForLoginUser = false;
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({status: false, profile: 'teacher'}))
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve());
            mockTncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(false));
            mockTncUpdateHandlerService.dismissTncPage = jest.fn();
            mockConsentService.getConsent = jest.fn(() => Promise.resolve())
            mockRouter.navigate = jest.fn();
            // act
            termsAndConditionsPage.onAcceptanceClick().then(() => {
                // assert
                expect(mockTncUpdateHandlerService.dismissTncPage).toHaveBeenCalled();
                setTimeout(() => {
                    expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.USER_TYPE_SELECTION_LOGGEDIN], {
                        state: { categoriesProfileData: {
                            hasFilledLocation: true,
                            showOnlyMandatoryFields: true,
                            profile: 'teacher',
                            isRootPage: true,
                            noOfStepsToCourseToc: 1
                          }}
                   })
                    done();
                }, 0);
            });
        });
        it('should dismiss tnc and navigate to profile or category edit if profile type is not none or other ', (done) => {
            // arrange
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
            mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
            mockProfileService.getServerProfilesDetails = jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url', dob: 'sample_dob'})),
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({
                serverProfile: {
                    tncLatestVersionUrl: 'sample_tnc_url',
                    declarations: [{ name: 'sample-name' }],
                    managedBy: 'manager',
                    dob: 'sample_dob'
                },
                profileType: 'teacher'
            }));
            let onboardingTrue = onboarding;
            onboardingTrue.skipOnboardingForLoginUser = false;
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({status: false, profile: 'teacher'}))
            mockFormAndFrameworkUtilService.getFormFields = jest.fn(() => Promise.resolve());
            mockTncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(false));
            mockTncUpdateHandlerService.dismissTncPage = jest.fn();
            mockRouter.navigate = jest.fn()
            // act
            termsAndConditionsPage.onAcceptanceClick().then(() => {
                // assert
                expect(mockTncUpdateHandlerService.dismissTncPage).toHaveBeenCalled();
                setTimeout(() => {
                    expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.PROFILE}/${RouterLinks.CATEGORIES_EDIT}`], {
                        state: {
                            hasFilledLocation: true,
                            showOnlyMandatoryFields: true,
                            profile: 'teacher',
                            isRootPage: true,
                            noOfStepsToCourseToc: 1
                          }
                   })
                    done();
                }, 0);
            });
        });

        it('should dismiss tnc and navigate to basic sign up flow if no DOB', (done) => {
            // arrange
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
            mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
            mockProfileService.getServerProfilesDetails = jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url', dob: 'sample_dob'})),
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({
                serverProfile: {
                    tncLatestVersionUrl: 'sample_tnc_url',
                    declarations: [{ name: 'sample-name' }],
                },
                profileType: 'none'
            }));
            let onboardingTrue = onboarding;
            onboardingTrue.skipOnboardingForLoginUser = true;
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({status: true, profile: 'teacher'}))
            mockRouter.navigate = jest.fn()
            // act
            termsAndConditionsPage.onAcceptanceClick().then(() => {
                // assert
                expect(mockTncUpdateHandlerService.dismissTncPage).toHaveBeenCalled();
                setTimeout(() => {
                    expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.SIGNUP_BASIC])
                    done();
                }, 0);
            });
        });

        it('should logout to second back navigation and dismiss tnc ', (done) => {
            // arrange
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(false));
            mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.reject({ status: false }));
            mockInjector.get = jest.fn(() => (undefined));
            // act
            termsAndConditionsPage.onAcceptanceClick().then(() => {
                // assert
            }).catch(() => {
                done();
            });
        });
        it('should dismiss the loader  and logout if result is false', () => {
            // arrange
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(false));
            mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.reject({ status: false }));
            // act
            termsAndConditionsPage.onAcceptanceClick().then(() => {
                // assert
                expect(termsAndConditionsPage['loader']).toBeUndefined();
                expect(mockLogoutHandlerService.onLogout).toHaveBeenCalled();
                expect(mockTncUpdateHandlerService.dismissTncPage).toHaveBeenCalled();
                // done();
            }).catch(() => {
            });
        });
    });
});
