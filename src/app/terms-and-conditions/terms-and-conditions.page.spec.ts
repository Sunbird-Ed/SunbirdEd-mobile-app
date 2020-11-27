
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
    InteractSubtype
} from '../../services';
import {
    TncUpdateHandlerService,
} from '../../services/handlers/tnc-update-handler.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Router } from '@angular/router';
import { SbProgressLoader } from '../../services/sb-progress-loader.service';
import { DomSanitizer } from '@angular/platform-browser';
import { of } from 'rxjs';
import { RouterLinks } from '../app.constant';
import { ConsentService } from '../../services/consent-service';
describe('TermsAndConditionsPage', () => {
    let termsAndConditionsPage: TermsAndConditionsPage;

    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn(() => of({ serverProfile: { tncLatestVersionUrl: 'sample_tnc_url' ,
        declarations: [{name: 'sample-name'}]} })),
        getServerProfilesDetails: jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url' })),
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

    beforeAll(() => {
        termsAndConditionsPage = new TermsAndConditionsPage(
            mockProfileService as ProfileService,
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
            mockConsentService as ConsentService
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
        it('should navigate to tabs page if Tnc is accepted and user location is available', (done) => {
            // arrange
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
            mockTncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(true));
            mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
            mockConsentService.getConsent = jest.fn(() => Promise.resolve());
            const categoriesProfileData = {
                hasFilledLocation: true,
                showOnlyMandatoryFields: true,
                profile: undefined,
                isRootPage: true,
                isUserLocationAvalable: true,
                status: true
              };
            // act
            // assert
            termsAndConditionsPage.ngOnInit();
            termsAndConditionsPage.onAcceptanceClick().then(() => {
                expect(mockTncUpdateHandlerService.dismissTncPage).toHaveBeenCalled();
                expect(mockAppGlobalService.closeSigninOnboardingLoader).toHaveBeenCalled();
                setTimeout(() => {
                    expect(mockConsentService.getConsent).toHaveBeenCalled();
                    expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.USER_TYPE_SELECTION_LOGGEDIN],
                        {state: {categoriesProfileData}});
                    expect(mockExternalIdVerificationService.showExternalIdVerificationPopup).toHaveBeenCalled();
                    done();
                }, 0);
            });
        });

        it('should navigate to district mapping  page if Tnc is accepted and user location is not available', (done) => {
            // arrange
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
            mockCommonUtilService.isUserLocationAvalable = jest.fn(() => false);
            mockTncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(false));
            const categoriesProfileData = {
                hasFilledLocation: false,
                showOnlyMandatoryFields: true,
                profile: undefined,
                isRootPage: true,
                isUserLocationAvalable: false,
                status: true
              };
            // act
            termsAndConditionsPage.ngOnInit();
            // assert
            termsAndConditionsPage.onAcceptanceClick().then(() => {
                setTimeout(() => {
                    expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.USER_TYPE_SELECTION_LOGGEDIN],
                        {state: {categoriesProfileData}});
                    done();
                }, 0);
            });
        });

        it('should navigate to category edit  page if Tnc is accepted but  BMG value is not filled', (done) => {
            // arrange
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
            mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.resolve({ status: false }));
            mockTncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(true));
            mockConsentService.getConsent = jest.fn(() => Promise.resolve());
            const categoriesProfileData = {
                hasFilledLocation: true,
                showOnlyMandatoryFields: true,
                profile: undefined,
                isRootPage: true
              };
            // act
            // assert
            termsAndConditionsPage.ngOnInit();
            termsAndConditionsPage.onAcceptanceClick().then(() => {
                expect(mockTncUpdateHandlerService.dismissTncPage).toHaveBeenCalled();
                setTimeout(() => {
                    expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.USER_TYPE_SELECTION_LOGGEDIN],
                        {state: {categoriesProfileData}});
                    done();
                }, 0);
            });
        });

        it('should dismiss the loader for any error scenarios', (done) => {
            // arrange
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(true));
            mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.reject({ status: false }));
            // act
            // assert
            termsAndConditionsPage.ngOnInit();
            termsAndConditionsPage.onAcceptanceClick().then(() => {
                expect(termsAndConditionsPage['loader']).toBeUndefined();
                done();
            }).catch(() => {
            });
        });

        it('should dismiss the loader  and logout if result is false', (done) => {
            // arrange
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(false));
            mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.reject({ status: false }));
            // act
            // assert
            termsAndConditionsPage.ngOnInit();
            termsAndConditionsPage.onAcceptanceClick().then(() => {
                expect(termsAndConditionsPage['loader']).toBeUndefined();
                expect(mockLogoutHandlerService.onLogout).toHaveBeenCalled();
                expect(mockTncUpdateHandlerService.dismissTncPage).toHaveBeenCalled();
                done();
            }).catch(() => {
            });
        });


        it('should dismiss the loader  and logout if result is false', (done) => {
            // arrange
            mockProfileService.acceptTermsAndConditions = jest.fn(() => of(false));
            mockCommonUtilService.isUserLocationAvalable = jest.fn(() => true);
            mockFormAndFrameworkUtilService.updateLoggedInUser = jest.fn(() => Promise.reject({ status: false }));
            mockInjector.get = jest.fn(() => (undefined));
            // act
            // assert
            termsAndConditionsPage.ngOnInit();
            termsAndConditionsPage.onAcceptanceClick().then(() => {
            }).catch(() => {
                done();
            });
        });
    });
});
