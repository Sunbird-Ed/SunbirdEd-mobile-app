
import { TermsAndConditionsPage } from './terms-and-conditions.page';
import { ProfileService } from '@project-sunbird/sunbird-sdk';
import { ModalController, Platform } from '@ionic/angular';
import {
    CommonUtilService,
    TelemetryGeneratorService,
    AppGlobalService,
    LogoutHandlerService,
    PageId,
    Environment,
    ImpressionType,
    InteractType,
    InteractSubtype,
} from '../../services';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { SbProgressLoader } from '../../services/sb-progress-loader.service';
import { DomSanitizer } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { RouterLinks } from '../app.constant';
import onboarding from '../../assets/configurations/config.json';

describe('TermsAndConditionsPage', () => {
    let termsAndConditionsPage: TermsAndConditionsPage;

    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn(() => of({})),
        getServerProfilesDetails: jest.fn(() => of({ tncLatestVersionUrl: 'sample_tnc_url' })),
        updateServerProfile: jest.fn(() => of({}))
    } as any;

    const mockPlatform: Partial<Platform> = {
    };
    mockPlatform.backButton = {
        subscribeWithPriority: jest.fn((_, fn) => fn()),

    } as any;
    const mockLogoutHandlerService: Partial<LogoutHandlerService> = {
        onLogout: jest.fn()
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

    const mockAppGlobalService: Partial<AppGlobalService> = {
        closeSigninOnboardingLoader: jest.fn()
    };

    const mockSbProgressLoader: Partial<SbProgressLoader> = {
        hide: jest.fn()
    };

    const mockModalCtrl: Partial<ModalController> = {}
    
    beforeAll(() => {
        termsAndConditionsPage = new TermsAndConditionsPage(
            mockProfileService as ProfileService,
            mockPlatform as Platform,
            mockLogoutHandlerService as LogoutHandlerService,
            mockSanitizer as DomSanitizer,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockAppVersion as AppVersion,
            mockModalCtrl as ModalController,
            mockAppGlobalService as AppGlobalService,
            mockSbProgressLoader as SbProgressLoader,
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
            })) as any,
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
            mockModalCtrl.dismiss = jest.fn()
            // act
            termsAndConditionsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                // expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('translated_message');
                done();
            });
        });

        it('should logout and dismiss the tnc page if back button is clicked twice', (done) => {
            // arrange
            termsAndConditionsPage['unregisterBackButtonAction'] = {
                unsubscribe: jest.fn()
            } as any;
            mockLogoutHandlerService.onLogout = jest.fn()
            mockModalCtrl.dismiss = jest.fn();
            // act
            termsAndConditionsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockLogoutHandlerService.onLogout).toHaveBeenCalled();
                done();
            });
        });

        it('should logout and dismiss the tnc page if back button is clicked twice and should not unsubscribe', (done) => {
            // arrange
            termsAndConditionsPage['unregisterBackButtonAction'] = undefined as any;
            mockLogoutHandlerService.onLogout = jest.fn()
            mockModalCtrl.dismiss = jest.fn();
            // act
            termsAndConditionsPage.ionViewWillEnter();
            // assert
            setTimeout(() => {
                expect(mockLogoutHandlerService.onLogout).toHaveBeenCalled();
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
            termsAndConditionsPage['unregisterBackButtonAction'] = undefined as any;
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

    describe('onAcceptanceClick', () => {
        it('should dismiss modal controller ', () => {
            // arrange
            mockModalCtrl.dismiss = jest.fn();
            // act
            termsAndConditionsPage.onAcceptanceClick()
            // assert
        })
    })
});